import { 
  ClarificationQuestion, 
  DraftPlan, 
  LegalDocument, 
  LegalReviewAudit, 
  RecommendationResult, 
  DocumentSection 
} from '../types';

export function getFallbackRecommendations(description: string, jurisdiction: string): RecommendationResult[] {
  const dLower = (description || '').toLowerCase();
  const recs: RecommendationResult[] = [];

  if (dLower.includes('rent') || dLower.includes('tenant') || dLower.includes('shop') || dLower.includes('flat') || dLower.includes('lease') || dLower.includes('property') || dLower.includes('landlord')) {
    recs.push({
      documentType: 'Rental / Lease Agreement',
      title: 'Commercial / Residential Tenancy Agreement',
      matchScore: 96,
      whyRecommended: 'Tailored for leasing real estate, residential units, or commercial premises with rent, security deposit, and eviction clauses.',
      keyClausesIncluded: ['Demised Premises & Rent', 'Security Deposit & Refund', 'Term & Lock-in Period', 'Maintenance & Utilities', 'Eviction Grounds'],
      keyQuestionsToConsider: ['What is the lock-in period?', 'Who is responsible for repairs and municipal taxes?']
    });
  }

  if (dLower.includes('freelanc') || dLower.includes('website') || dLower.includes('software') || dLower.includes('develop') || dLower.includes('design') || dLower.includes('contractor') || dLower.includes('milestone')) {
    recs.push({
      documentType: 'Freelance Agreement',
      title: 'Independent Contractor / Freelance Agreement',
      matchScore: 94,
      whyRecommended: 'Ideal for project-based deliverables with defined payment milestones and full transfer of intellectual property upon payment.',
      keyClausesIncluded: ['Scope of Deliverables', 'Milestone Invoicing', 'IP Assignment on Final Payment', 'Revision Limits', 'Independent Contractor Status'],
      keyQuestionsToConsider: ['Are revisions capped?', 'What happens if the client terminates midway?']
    });
  }

  if (dLower.includes('secret') || dLower.includes('confidential') || dLower.includes('protect') || dLower.includes('nda') || dLower.includes('idea') || dLower.includes('proprietary')) {
    recs.push({
      documentType: 'Non-Disclosure Agreement (NDA)',
      title: 'Mutual or Unilateral Non-Disclosure Agreement',
      matchScore: 95,
      whyRecommended: 'Protects proprietary secrets, algorithms, trade insights, or financial discussions between parties.',
      keyClausesIncluded: ['Definition of Confidential Data', 'Non-Disclosure Covenants', 'Term of Secrecy', 'Permitted Disclosures', 'Injunctive Relief'],
      keyQuestionsToConsider: ['Is the disclosure mutual or one-way?', 'Should secrecy last 2, 3, or 5 years?']
    });
  }

  if (dLower.includes('employ') || dLower.includes('job') || dLower.includes('salary') || dLower.includes('hire') || dLower.includes('worker') || dLower.includes('staff')) {
    recs.push({
      documentType: 'Employment Agreement',
      title: 'Formal Employment Contract',
      matchScore: 93,
      whyRecommended: 'Comprehensive employment terms covering designation, compensation, probation, non-compete, and termination notice.',
      keyClausesIncluded: ['Position & Duties', 'Compensation & Benefits', 'Probation & Notice Period', 'Invention Assignment', 'Confidentiality'],
      keyQuestionsToConsider: ['What is the probationary duration?', 'Is there a non-solicitation requirement?']
    });
  }

  if (dLower.includes('demand') || dLower.includes('unpaid') || dLower.includes('debt') || dLower.includes('overdue') || dLower.includes('money owed') || dLower.includes('settle')) {
    recs.push({
      documentType: 'Demand Letter',
      title: 'Formal Pre-Litigation Payment Demand Letter',
      matchScore: 97,
      whyRecommended: 'Formal pre-action letter demanding immediate settlement of overdue sums with strict deadline before filing court action.',
      keyClausesIncluded: ['Chronology of Invoices & Debt', 'Statutory Demand', '14-Day Cure Window', 'Reservation of Legal Costs & Interest'],
      keyQuestionsToConsider: ['What is the exact overdue amount and invoice numbers?']
    });
  }

  if (recs.length === 0) {
    recs.push(
      {
        documentType: 'Service Agreement',
        title: 'Master Professional Services Agreement (MSA)',
        matchScore: 89,
        whyRecommended: 'Standard binding contract governing business services, performance timelines, warranties, and payment terms.',
        keyClausesIncluded: ['Services Scope', 'Payment Terms', 'Warranties & Disclaimers', 'Limitation of Liability', 'Termination'],
        keyQuestionsToConsider: ['What are the key deliverables and turnaround times?']
      },
      {
        documentType: 'Custom Legal Document',
        title: 'Custom Legal Memorandum & Agreement',
        matchScore: 84,
        whyRecommended: 'Flexible structure crafted for specialized arrangements not fitting conventional archetypes.',
        keyClausesIncluded: ['Recitals', 'Core Covenants', 'Risk Allocation', 'Dispute Resolution', 'Signatures'],
        keyQuestionsToConsider: ['What specific risks or requirements are paramount?']
      }
    );
  }

  return recs;
}

export function getFallbackClarificationQuestions(
  documentType: string,
  rawRequirements: string,
  jurisdiction: string
): { questions: ClarificationQuestion[]; extractedFacts: Record<string, any>; missingInformation: string[] } {
  const docLower = documentType.toLowerCase();

  const questions: ClarificationQuestion[] = [];

  // 1. Party Names
  questions.push({
    id: 'parties_names',
    question: 'What are the legal names and designations of both parties?',
    fieldKey: 'legalNames',
    type: 'text',
    placeholder: 'e.g. Acme Tech Corp (Client) and Jane Doe (Service Provider)',
    defaultValue: '',
    required: true,
    whyItMatters: 'Accurate legal entity identification is critical for enforceability in court.'
  });

  // 2. Document specific questions
  if (docLower.includes('rent') || docLower.includes('lease')) {
    questions.push(
      {
        id: 'premises_address',
        question: 'What is the full address and description of the leased premises?',
        fieldKey: 'propertyAddress',
        type: 'text',
        placeholder: 'e.g. Unit 4B, 100 Main Street, New York, NY 10001 (approx 1,200 sq ft)',
        required: true,
        whyItMatters: 'The demised premises must be clearly identifiable to prevent boundary disputes.'
      },
      {
        id: 'rent_and_deposit',
        question: 'What is the monthly rent, payment due date, and refundable security deposit amount?',
        fieldKey: 'financialsRentDeposit',
        type: 'text',
        placeholder: 'e.g. $2,500/month due on 1st of month; $5,000 security deposit',
        required: true,
        whyItMatters: 'Explicit payment terms and deposit return conditions prevent financial claims.'
      },
      {
        id: 'term_and_lockin',
        question: 'What is the duration of tenancy and notice period for termination?',
        fieldKey: 'tenancyTermNotice',
        type: 'select',
        options: ['11 Months with 1 Month Notice', '12 Months with 30 Days Notice', '24 Months with 60 Days Notice', '36 Months Commercial Lock-in (6 Months Notice)'],
        defaultValue: '12 Months with 30 Days Notice',
        required: true,
        whyItMatters: 'Defines valid tenancy duration and statutory notice thresholds.'
      }
    );
  } else if (docLower.includes('freelanc') || docLower.includes('service') || docLower.includes('consultan')) {
    questions.push(
      {
        id: 'scope_deliverables',
        question: 'What specific deliverables, milestones, and turnaround deadlines are expected?',
        fieldKey: 'scopeAndMilestones',
        type: 'text',
        placeholder: 'e.g. Complete mobile app UI design within 4 weeks across 3 milestone stages',
        required: true,
        whyItMatters: 'Unambiguous scope definitions prevent scope creep and breach allegations.'
      },
      {
        id: 'payment_structure',
        question: 'How and when will payments or milestones be released?',
        fieldKey: 'paymentMilestones',
        type: 'text',
        placeholder: 'e.g. 30% advance on signing, 40% upon beta delivery, 30% upon final acceptance',
        required: true,
        whyItMatters: 'Clear payment milestones protect cashflow and enforce delivery criteria.'
      },
      {
        id: 'ip_ownership',
        question: 'When should intellectual property ownership transfer to the Client?',
        fieldKey: 'ipTransferTerms',
        type: 'select',
        options: ['Upon full and final payment of all invoices', 'Immediately upon creation of work product', 'Retained by Contractor with perpetual license to Client'],
        defaultValue: 'Upon full and final payment of all invoices',
        required: true,
        whyItMatters: 'Ensures the contractor is paid before relinquishing intellectual property rights.'
      }
    );
  } else if (docLower.includes('nda') || docLower.includes('confidential')) {
    questions.push(
      {
        id: 'nda_type',
        question: 'Is the non-disclosure obligation mutual or unilateral (one-way)?',
        fieldKey: 'ndaDirection',
        type: 'select',
        options: ['Mutual (Both parties share confidential info)', 'Unilateral (One party discloses to the other)'],
        defaultValue: 'Mutual (Both parties share confidential info)',
        required: true,
        whyItMatters: 'Mutual NDAs are standard for exploratory partnerships, while unilateral fits hires/vendors.'
      },
      {
        id: 'confidentiality_duration',
        question: 'How long should the confidentiality obligation survive after disclosure?',
        fieldKey: 'confidentialityDuration',
        type: 'select',
        options: ['2 Years from disclosure', '3 Years from disclosure', '5 Years from disclosure', 'In perpetuity for trade secrets'],
        defaultValue: '3 Years from disclosure',
        required: true,
        whyItMatters: 'Specifying an enforceable time limit avoids antitrust or restraint-of-trade challenges.'
      }
    );
  } else if (docLower.includes('demand') || docLower.includes('notice')) {
    questions.push(
      {
        id: 'overdue_amount',
        question: 'What is the exact sum demanded, invoice numbers, and due dates?',
        fieldKey: 'debtDetails',
        type: 'text',
        placeholder: 'e.g. $14,200 for Invoice #INV-204 due on Jan 15, 2026',
        required: true,
        whyItMatters: 'Demand notices require exact arithmetic and invoice references.'
      },
      {
        id: 'cure_window',
        question: 'What deadline are you giving the recipient to comply before initiating legal action?',
        fieldKey: 'cureWindowDays',
        type: 'select',
        options: ['7 Business Days', '14 Calendar Days', '15 Calendar Days', '30 Calendar Days'],
        defaultValue: '14 Calendar Days',
        required: true,
        whyItMatters: 'Statutory demand letters must allow reasonable opportunity to cure default.'
      }
    );
  } else {
    questions.push(
      {
        id: 'core_obligations',
        question: 'What are the main commitments and expectations for each party?',
        fieldKey: 'coreObligations',
        type: 'text',
        placeholder: 'e.g. First party provides consulting services; second party provides access and pays monthly fees',
        required: true,
        whyItMatters: 'Defines the essential consideration and covenants of the contract.'
      },
      {
        id: 'duration_term',
        question: 'What is the term duration and termination notice requirement?',
        fieldKey: 'durationNotice',
        type: 'text',
        placeholder: 'e.g. 1 year duration with 30 days written termination notice',
        required: true,
        whyItMatters: 'Prevents indefinite or locked liability by establishing exit rights.'
      }
    );
  }

  // Dispute Resolution question
  questions.push({
    id: 'dispute_resolution',
    question: 'What method of dispute resolution and governing jurisdiction should apply?',
    fieldKey: 'disputeForum',
    type: 'select',
    options: ['Binding Arbitration', 'Mediation followed by Binding Arbitration', 'Exclusive Court Jurisdiction in Governing State'],
    defaultValue: 'Binding Arbitration',
    required: false,
    whyItMatters: 'Arbitration provides private, expedited dispute resolution compared to public court trials.'
  });

  return {
    questions,
    extractedFacts: {
      documentType,
      jurisdiction: jurisdiction || 'General Law',
      brief: rawRequirements
    },
    missingInformation: [
      'Specific registered addresses of parties',
      'Bank details / payment processing accounts',
      'Authorized representative signatory titles'
    ]
  };
}

export function getFallbackDraftPlan(
  documentType: string,
  rawRequirements: string,
  jurisdiction: string,
  answers: Record<string, any>
): DraftPlan {
  const pNames = answers?.legalNames || 'Party A (First Party) and Party B (Second Party)';
  const govLaw = answers?.governingLawJurisdiction || jurisdiction || 'Governing Law of the Applicable State / Country';
  const notice = answers?.terminationNoticePeriod || answers?.tenancyTermNotice || '30 days prior written notice';
  const dispute = answers?.disputeForum || answers?.disputeResolutionMethod || 'Binding Arbitration';

  return {
    documentTitle: `${documentType.toUpperCase()} AGREEMENT`,
    documentType,
    parties: {
      partyOne: {
        role: documentType.toLowerCase().includes('rent') ? 'Landlord / Lessor' : (documentType.toLowerCase().includes('freelanc') || documentType.toLowerCase().includes('service') ? 'Service Provider / Contractor' : 'First Party / Discloser'),
        description: answers?.partyOneAddress || `${pNames.split('and')[0]?.trim() || 'First Party'}`
      },
      partyTwo: {
        role: documentType.toLowerCase().includes('rent') ? 'Tenant / Lessee' : (documentType.toLowerCase().includes('freelanc') || documentType.toLowerCase().includes('service') ? 'Client / Company' : 'Second Party / Recipient'),
        description: answers?.partyTwoAddress || `${pNames.split('and')[1]?.trim() || 'Second Party'}`
      }
    },
    purpose: rawRequirements || `Legally binding covenants governing the terms and conditions between the Parties for ${documentType}.`,
    keyObligations: [
      `First Party covenants to execute all required duties, deliverables, or premises access promptly and in good faith.`,
      `Second Party covenants to render timely payments, approvals, and cooperation in accordance with agreed schedules.`
    ],
    paymentTerms: answers?.financialsRentDeposit || answers?.paymentMilestones || answers?.debtDetails || 'Payments shall be made in agreed installments/milestones within thirty (30) days of receipt of invoice.',
    duration: answers?.tenancyTermNotice || answers?.effectiveDateAndTerm || answers?.durationNotice || 'Commencing on the Effective Date for a period of twelve (12) months unless terminated earlier in accordance with this Agreement.',
    termination: `Either party may terminate this Agreement upon ${notice}. Immediate termination for cause upon material breach if uncured after fifteen (15) days written notice.`,
    confidentiality: 'Both parties agree to protect proprietary and confidential business information and trade secrets for a period of three (3) years post termination.',
    intellectualProperty: answers?.ipTransferTerms || 'All intellectual property, deliverables, and works created under this agreement shall assign and transfer exclusively to Client upon receipt of full payment.',
    liabilityAndIndemnity: 'Total aggregate liability under this Agreement shall be limited to the total fees paid or payable in the preceding six (6) months. Standard indemnity against gross negligence and willful misconduct.',
    disputeResolution: `${dispute} in accordance with established commercial arbitration rules.`,
    governingLaw: govLaw,
    specialClauses: [
      'Force Majeure: Neither party shall be liable for failure to perform due to acts of God or events beyond reasonable control.',
      'Severability: If any term is held invalid, the remainder of the Agreement shall remain in full force.'
    ]
  };
}

export function getFallbackFullDocument(
  documentType: string,
  rawRequirements: string,
  jurisdiction: string,
  answers: Record<string, any>,
  draftPlan: DraftPlan
): Partial<LegalDocument> {
  const p1 = draftPlan?.parties?.partyOne?.description || 'First Party';
  const p2 = draftPlan?.parties?.partyTwo?.description || 'Second Party';
  const role1 = draftPlan?.parties?.partyOne?.role || 'FIRST PARTY';
  const role2 = draftPlan?.parties?.partyTwo?.role || 'SECOND PARTY';
  const govLaw = draftPlan?.governingLaw || jurisdiction || 'the applicable State and National Law';

  const sections: DocumentSection[] = [
    {
      id: 'sec_recitals',
      clauseNumber: '1',
      heading: 'RECITALS AND APPOINTMENT',
      content: `1.1 Purpose: This Agreement is entered into by and between ${p1} ("${role1}") and ${p2} ("${role2}").\n1.2 Context: WHEREAS, the Parties desire to formally record the binding terms, conditions, and covenants governing their transaction as follows: ${draftPlan.purpose || rawRequirements}.\n1.3 Consideration: In consideration of the mutual covenants, representations, warranties, and consideration herein set forth, the sufficiency of which is hereby acknowledged, the Parties agree to be legally bound.`
    },
    {
      id: 'sec_obligations',
      clauseNumber: '2',
      heading: 'OPERATIVE COVENANTS AND SCOPE OF PERFORMANCE',
      content: `2.1 Performance Standards: Each Party shall discharge its duties, responsibilities, and deliverables with standard professional care, due diligence, and in compliance with all applicable statutory regulations.\n2.2 Specific Duties: ${draftPlan.keyObligations.join('\n')}\n2.3 Cooperation: The Parties agree to act reasonably and in good faith to facilitate the timely execution of all contracted obligations.`
    },
    {
      id: 'sec_financials',
      clauseNumber: '3',
      heading: 'CONSIDERATION, FEES, AND PAYMENT SCHEDULE',
      content: `3.1 Payment Structure: In consideration for the performance and covenants herein, payments and fees shall be governed as follows: ${draftPlan.paymentTerms}.\n3.2 Invoicing and Due Dates: All payments shall become due within thirty (30) calendar days of invoice presentation unless expressly agreed otherwise in writing.\n3.3 Taxes and Levies: Each Party shall be individually liable for its applicable statutory tax obligations arising out of this transaction.`
    },
    {
      id: 'sec_term_termination',
      clauseNumber: '4',
      heading: 'TERM, DURATION, AND TERMINATION',
      content: `4.1 Term: This Agreement shall take effect on the date of final signature (the "Effective Date") and shall continue for: ${draftPlan.duration}.\n4.2 Termination for Convenience: ${draftPlan.termination}.\n4.3 Termination for Cause: Either Party may immediately terminate this Agreement upon written notice if the other Party commits a material breach and fails to cure such breach within fifteen (15) calendar days of written notice.`
    },
    {
      id: 'sec_confidentiality',
      clauseNumber: '5',
      heading: 'CONFIDENTIALITY AND PROPRIETARY RIGHTS',
      content: `5.1 Confidential Information: ${draftPlan.confidentiality}.\n5.2 Non-Disclosure: The receiving Party shall maintain strict secrecy regarding all non-public technical, business, commercial, and financial information disclosed by the disclosing Party.\n5.3 Intellectual Property: ${draftPlan.intellectualProperty || 'All intellectual property rights and copyrights developed pursuant to this Agreement shall transfer upon receipt of full payment.'}`
    },
    {
      id: 'sec_liability',
      clauseNumber: '6',
      heading: 'LIMITATION OF LIABILITY AND INDEMNIFICATION',
      content: `6.1 Limitation of Liability: ${draftPlan.liabilityAndIndemnity}.\n6.2 Exclusion of Consequential Damages: To the maximum extent permitted by law, neither Party shall be liable for indirect, incidental, punitive, or consequential damages.\n6.3 Indemnity: Each Party shall indemnify and defend the other Party against third-party claims resulting directly from gross negligence, fraud, or willful contractual breach.`
    },
    {
      id: 'sec_dispute_law',
      clauseNumber: '7',
      heading: 'GOVERNING LAW AND DISPUTE RESOLUTION',
      content: `7.1 Governing Law: This Agreement and any disputes arising hereunder shall be construed, interpreted, and governed strictly in accordance with the laws of ${govLaw}.\n7.2 Dispute Resolution: ${draftPlan.disputeResolution}.\n7.3 Costs: The prevailing party in any formal arbitration or enforcement proceeding shall be entitled to recover reasonable attorney fees and legal expenses.`
    },
    {
      id: 'sec_miscellaneous',
      clauseNumber: '8',
      heading: 'MISCELLANEOUS AND BOILERPLATE PROVISIONS',
      content: `8.1 Entire Agreement: This document represents the entire understanding between the Parties with respect to the subject matter hereof and supersedes all prior agreements or discussions.\n8.2 Amendments: Any modification or amendment must be in writing and signed by authorized representatives of both Parties.\n8.3 Severability: In the event that any provision is declared invalid or unenforceable by a court of competent jurisdiction, the remaining provisions shall remain in full force and effect.`
    }
  ];

  return {
    title: draftPlan.documentTitle || `${documentType.toUpperCase()} AGREEMENT`,
    preamble: `THIS ${documentType.toUpperCase()} (the "Agreement") is executed as of the Effective Date by and between ${p1} and ${p2}.`,
    sections,
    signatures: {
      partyOneLabel: role1,
      partyTwoLabel: role2,
      witnessesRequired: true
    }
  };
}

export function getFallbackLegalReview(
  documentText: any,
  documentType: string,
  jurisdiction: string,
  draftPlan: DraftPlan
): LegalReviewAudit {
  return {
    summaryScore: 88,
    overallAssessment: `The drafted ${documentType} establishes clear contractual duties, payment terms, and exit mechanics under ${jurisdiction || 'General Law'}. Review registered party addresses and local stamping requirements prior to execution.`,
    items: [
      {
        id: 'audit_1',
        category: 'Missing Information',
        severity: 'medium',
        clauseRef: 'Preamble / Party Details',
        title: 'Registered Entity Addresses and Tax Identification Numbers',
        description: 'While parties are identified by name, exact registered corporate addresses, company numbers (EIN / CIN / VAT), and signatory titles are omitted.',
        suggestion: 'Insert full legal registered office addresses and designations (e.g. Managing Director / CEO) to avoid entity misidentification.'
      },
      {
        id: 'audit_2',
        category: 'Needs Attention',
        severity: 'high',
        clauseRef: 'Dispute Resolution Clause',
        title: 'Designation of Arbitration Seat City & Rules Body',
        description: 'The agreement references arbitration, but does not explicitly name the designated seat city and institutional rules (e.g. AAA, ICC, SIAC, or LCIA).',
        suggestion: 'Specify the exact seat of arbitration (e.g., "Seat of arbitration shall be New York, NY") to prevent jurisdictional wrangling in court.'
      },
      {
        id: 'audit_3',
        category: 'Potential Issue',
        severity: 'low',
        clauseRef: 'Confidentiality Exceptions',
        title: 'Statutory Exceptions to Confidential Information',
        description: 'Ensure standard carve-outs are included for disclosures compelled by law, court subpoena, or information already in the public domain.',
        suggestion: 'Add standard clause: "Excludes information required to be disclosed by order of a competent court or regulatory body."'
      },
      {
        id: 'audit_4',
        category: 'Lawyer Review Recommended',
        severity: 'medium',
        clauseRef: 'Registration & Stamp Duty',
        title: 'Statutory Stamp Duty & Notarization Compliance',
        description: 'Certain contracts (e.g. leases over 11 months, real estate sales, and formal powers of attorney) require mandatory local stamp duty payments and notarization to be admissible in court.',
        suggestion: 'Have local legal counsel verify whether physical e-stamping, notarization, or registration with the local deeds registrar is required in your state.'
      }
    ],
    statutoryNotices: [
      'Informational guidance only: This automated review does not constitute formal legal counsel.',
      'Check local statutory stamp paper and registration laws before signing.'
    ]
  };
}

export function getFallbackClauseAssistant(
  action: 'explain' | 'simplify' | 'make_specific' | 'add_custom' | 'rewrite',
  clauseText: string,
  heading?: string,
  instruction?: string
) {
  if (action === 'explain') {
    return {
      revisedText: clauseText,
      explanation: `Plain English Breakdown of ${heading || 'Clause'}:\n• What this means: Legally defines the duties, deadlines, and consequences for non-compliance.\n• First Party Protection: Enforces strict benchmarks and grants remedies upon breach.\n• Second Party Protection: Prevents arbitrary cancellations without fair cure notice.\n• Critical Caveat: Failure to give formal written notice within specified days may waive legal claims.`,
      risksMitigated: [
        'Clarifies reciprocal duties between signers',
        'Establishes unambiguous timeline for performance'
      ]
    };
  } else if (action === 'simplify') {
    return {
      revisedText: `Simplified Clause:\nBoth parties agree to act in good faith and follow the agreed timelines. Either party may end this agreement by providing 30 days prior written notice. If either party breaks an important term, they will have 15 days to fix it after receiving written notice.`,
      explanation: 'Replaced archaic legalese with clear, readable plain language while retaining legal enforceability.',
      risksMitigated: ['Reduces confusion between non-attorney executives']
    };
  } else if (action === 'make_specific') {
    return {
      revisedText: `${clauseText}\n\nSTRICT PERFORMANCE AND REMEDY: Time is of the essence with respect to all milestones and payment dates. In the event of any unexcused delay exceeding ten (10) calendar days, the defaulting party shall pay a liquidated late fee of 1.5% per month on overdue sums, and the non-defaulting party may suspend performance immediately without penalty.`,
      explanation: 'Added explicit "time is of the essence" clause, liquidated late charges, and immediate suspension rights.',
      risksMitigated: ['Vague performance timelines', 'Lack of immediate financial remedies for delay']
    };
  } else {
    return {
      revisedText: `${clauseText}\n\nADDITIONAL COVENANT: ${instruction || 'The Parties agree to comply strictly with all applicable state and federal data protection, labor, and commercial regulations.'}`,
      explanation: 'Crafted specialized clause matching user requirements and standard legal drafting standards.',
      risksMitigated: ['Custom risk mitigation per user instructions']
    };
  }
}
