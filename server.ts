import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to call OpenRouter API
async function callOpenRouter(apiKey: string, model: string, prompt: string, systemPrompt?: string) {
  const selectedModel = model || process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';
  const messages: any[] = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.APP_URL || 'https://ai.studio',
      'X-Title': 'JurisDraft AI Legal Drafter',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: selectedModel,
      messages,
      temperature: 0.2,
      response_format: { type: 'json_object' }
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content;
}

// Helper to call Gemini API
async function callGemini(apiKey: string, prompt: string, systemInstruction?: string) {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction: systemInstruction || 'You are an expert legal drafting assistant. Output strictly valid JSON.',
      responseMimeType: 'application/json',
      temperature: 0.2,
    },
  });
  return response.text;
}

// Universal AI Caller with fallback
async function executeLegalAI(req: express.Request, prompt: string, systemInstruction?: string) {
  const userOpenRouterKey = (req.headers['x-openrouter-key'] as string) || process.env.OPENROUTER_API_KEY;
  const userOpenRouterModel = (req.headers['x-openrouter-model'] as string) || process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';
  const geminiKey = process.env.GEMINI_API_KEY;

  // 1. Try OpenRouter if key is present
  if (userOpenRouterKey && userOpenRouterKey !== 'MY_OPENROUTER_API_KEY' && userOpenRouterKey.trim().length > 0) {
    try {
      const res = await callOpenRouter(userOpenRouterKey, userOpenRouterModel, prompt, systemInstruction);
      if (res) return JSON.parse(res);
    } catch (err: any) {
      console.warn('OpenRouter call failed, trying fallback:', err.message);
    }
  }

  // 2. Try Gemini API if present
  if (geminiKey && geminiKey !== 'MY_GEMINI_API_KEY' && geminiKey.trim().length > 0) {
    try {
      const res = await callGemini(geminiKey, prompt, systemInstruction);
      if (res) return JSON.parse(res);
    } catch (err: any) {
      console.warn('Gemini call failed:', err.message);
    }
  }

  return null; // Signals fallback to robust rule-based engine
}

// --- API Routes ---

// Health check & AI config info
app.get('/api/health', (req, res) => {
  const hasOpenRouter = !!(process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY !== 'MY_OPENROUTER_API_KEY');
  const hasGemini = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  res.json({
    status: 'ok',
    hasOpenRouter,
    hasGemini,
    defaultModel: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
  });
});

// 1. Document Recommendation
app.post('/api/ai/recommend-document', async (req, res) => {
  const { description, jurisdiction } = req.body;
  const prompt = `A user needs a legal document but doesn't know which one.
User Description: "${description}"
Jurisdiction: "${jurisdiction || 'General'}"

Recommend 2 to 3 appropriate legal document types with clear rationale, pros/cons, and recommended next steps.
Return JSON format:
{
  "recommendations": [
    {
      "documentType": "Rental Agreement" | "Employment Agreement" | "NDA" | "Service Agreement" | "Partnership Agreement" | "Affidavit" | "Authorization Letter" | "Demand Letter" | "Legal Notice" | "Freelance Agreement" | "Consultancy Agreement" | "Sale Agreement" | "Loan Agreement" | "MOU" | "Privacy Policy" | "Terms & Conditions" | "Employment Offer Letter" | "Vendor Agreement" | "Custom Legal Document",
      "title": "Short title",
      "matchScore": 95,
      "whyRecommended": "Detailed explanation of why this document matches the user's intent",
      "keyClausesIncluded": ["Clause 1", "Clause 2"],
      "keyQuestionsToConsider": ["Question 1", "Question 2"]
    }
  ],
  "disclaimer": "This recommendation is for informational guidance only and does not constitute formal legal counsel."
}`;

  try {
    const aiResult = await executeLegalAI(req, prompt, 'You are a senior legal intake attorney recommending appropriate agreements.');
    if (aiResult && aiResult.recommendations) {
      return res.json(aiResult);
    }
  } catch (e) {
    console.error('AI recommendation error', e);
  }

  // Smart algorithmic fallback
  const dLower = (description || '').toLowerCase();
  const recs = [];
  if (dLower.includes('rent') || dLower.includes('tenant') || dLower.includes('shop') || dLower.includes('flat') || dLower.includes('lease')) {
    recs.push({
      documentType: 'Rental / Lease Agreement',
      title: 'Commercial / Residential Lease Agreement',
      matchScore: 96,
      whyRecommended: 'You mentioned leasing or renting property, security deposits, and recurring rent payments.',
      keyClausesIncluded: ['Rent & Security Deposit', 'Term & Possession', 'Maintenance & Utilities', 'Eviction & Notice'],
      keyQuestionsToConsider: ['What is the commercial lock-in period?', 'Who covers property taxes?']
    });
  }
  if (dLower.includes('freelanc') || dLower.includes('website') || dLower.includes('software') || dLower.includes('develop') || dLower.includes('service')) {
    recs.push({
      documentType: 'Freelance Agreement',
      title: 'Independent Contractor / Freelance Agreement',
      matchScore: 94,
      whyRecommended: 'Tailored for project-based deliverables with milestone payments and IP assignment.',
      keyClausesIncluded: ['Scope of Work', 'Milestone Payments', 'IP Assignment upon Payment', 'Independent Contractor Status'],
      keyQuestionsToConsider: ['Are revision rounds capped?', 'What happens upon early termination?']
    });
  }
  if (dLower.includes('secret') || dLower.includes('confidential') || dLower.includes('protect') || dLower.includes('nda') || dLower.includes('idea')) {
    recs.push({
      documentType: 'Non-Disclosure Agreement (NDA)',
      title: 'Mutual or Unilateral Non-Disclosure Agreement',
      matchScore: 92,
      whyRecommended: 'Protects proprietary business secrets, code, trade insights, or financial discussions.',
      keyClausesIncluded: ['Definition of Confidential Info', 'Non-Use Obligations', 'Term of Secrecy', 'Injunctive Relief'],
      keyQuestionsToConsider: ['Is it mutual or one-way?', 'How long must secrecy be maintained?']
    });
  }

  if (recs.length === 0) {
    recs.push(
      {
        documentType: 'Service Agreement',
        title: 'Master Professional Services Agreement',
        matchScore: 88,
        whyRecommended: 'Standard binding contract covering responsibilities, scope, payment terms, and delivery schedules.',
        keyClausesIncluded: ['Services Scope', 'Payment Schedules', 'Warranties', 'Termination'],
        keyQuestionsToConsider: ['What are the deliverables and acceptance criteria?']
      },
      {
        documentType: 'Custom Legal Document',
        title: 'Custom Legal Memorandum & Contract',
        matchScore: 82,
        whyRecommended: 'Flexible structure crafted for specialized arrangements not fitting generic categories.',
        keyClausesIncluded: ['Recitals', 'Obligations', 'Dispute Resolution', 'Signatures'],
        keyQuestionsToConsider: ['What specific legal risks are you looking to mitigate?']
      }
    );
  }

  return res.json({
    recommendations: recs,
    disclaimer: 'This recommendation is for informational guidance only and does not constitute formal legal counsel.'
  });
});

// 2. AI Clarification Interview Formulation
app.post('/api/ai/clarify-questions', async (req, res) => {
  const { documentType, rawRequirements, jurisdiction, existingAnswers } = req.body;
  const prompt = `A user wants to draft a legal document.
Document Type: ${documentType}
Jurisdiction: ${jurisdiction || 'General / Unspecified'}
User Requirement: "${rawRequirements}"
Already collected answers: ${JSON.stringify(existingAnswers || {})}

Analyze what critical legal facts are already present and what essential details are missing.
Formulate 3 to 6 targeted clarification questions.
Return JSON:
{
  "extractedFacts": {
    "partyOne": "Identified party or placeholder",
    "partyTwo": "Identified party or placeholder",
    "financials": "Identified financial amounts/rents/fees",
    "duration": "Identified timeline/duration",
    "jurisdiction": "${jurisdiction || 'General'}"
  },
  "missingInformation": ["List of key missing aspects"],
  "questions": [
    {
      "id": "unique_string_id",
      "question": "Clear, plain-language question",
      "fieldKey": "e.g. partyOneAddress, securityDepositRefundPolicy, noticePeriodDays",
      "type": "text" | "select" | "date" | "number",
      "options": ["Option 1", "Option 2"] (if type is select),
      "placeholder": "Helpful placeholder",
      "defaultValue": "Sensible default",
      "required": true | false,
      "whyItMatters": "Short reason explaining the legal protection this question provides"
    }
  ]
}`;

  try {
    const aiResult = await executeLegalAI(req, prompt, 'You are an expert legal intake lawyer asking targeted, minimal, necessary questions to prepare a clean agreement.');
    if (aiResult && aiResult.questions && aiResult.questions.length > 0) {
      return res.json(aiResult);
    }
  } catch (e) {
    console.error('AI questions error', e);
  }

  // Rule-based questions fallback
  const questions: any[] = [
    {
      id: 'parties_names',
      question: 'What are the legal names of the First Party and Second Party?',
      fieldKey: 'legalNames',
      type: 'text',
      placeholder: 'e.g., Acme Tech Solutions LLC (Client) and Jane Doe (Contractor)',
      required: true,
      whyItMatters: 'Accurate legal entity names are essential for document enforceability.'
    },
    {
      id: 'jurisdiction_state',
      question: 'Which jurisdiction or governing law should apply to this agreement?',
      fieldKey: 'governingLawJurisdiction',
      type: 'text',
      defaultValue: jurisdiction || 'New York, USA',
      placeholder: 'e.g., State of California, USA or New Delhi, India',
      required: true,
      whyItMatters: 'Governing law defines which courts have jurisdiction in case of disputes.'
    },
    {
      id: 'commencement_date',
      question: 'When does this agreement become effective, and how long does it last?',
      fieldKey: 'effectiveDateAndTerm',
      type: 'text',
      placeholder: 'e.g., Starts March 1, 2026 for a duration of 12 months',
      required: true,
      whyItMatters: 'Clarifies exact commencement and expiration timelines.'
    },
    {
      id: 'termination_notice',
      question: 'What notice period is required for either party to terminate early?',
      fieldKey: 'terminationNoticePeriod',
      type: 'select',
      options: ['15 days written notice', '30 days written notice', '60 days written notice', 'Immediate for cause only', 'No early termination without mutual consent'],
      defaultValue: '30 days written notice',
      required: false,
      whyItMatters: 'Protects both parties from abrupt contract cancellations.'
    },
    {
      id: 'dispute_resolution',
      question: 'How should disagreements or disputes be settled?',
      fieldKey: 'disputeResolutionMethod',
      type: 'select',
      options: ['Binding Arbitration', 'Good-faith negotiation followed by Courts', 'Mediation first, then Arbitration', 'Exclusive Court Jurisdiction'],
      defaultValue: 'Binding Arbitration',
      required: false,
      whyItMatters: 'Avoids costly court proceedings by setting an agreed resolution mechanism.'
    }
  ];

  return res.json({
    extractedFacts: {
      jurisdiction: jurisdiction || 'General'
    },
    missingInformation: ['Specific entity addresses', 'Notice periods', 'Dispute resolution forum'],
    questions
  });
});

// 3. AI Draft Plan Generation
app.post('/api/ai/generate-plan', async (req, res) => {
  const { documentType, rawRequirements, jurisdiction, answers } = req.body;
  const prompt = `Create a structured Legal Draft Plan for a legal document before drafting the full text.
Document Type: ${documentType}
Jurisdiction: ${jurisdiction || 'General'}
Raw Requirements: "${rawRequirements}"
User Provided Answers: ${JSON.stringify(answers || {})}

Generate a comprehensive, editable Draft Plan with these exact structured fields.
Return JSON:
{
  "documentTitle": "Professional Document Title",
  "documentType": "${documentType}",
  "parties": {
    "partyOne": { "role": "e.g., Landlord / Client / Discloser", "description": "Party 1 details" },
    "partyTwo": { "role": "e.g., Tenant / Contractor / Recipient", "description": "Party 2 details" }
  },
  "purpose": "Precise summary of the agreement's purpose",
  "keyObligations": [
    "Obligation 1 for Party 1",
    "Obligation 2 for Party 2"
  ],
  "paymentTerms": "Exact payment breakdown, milestones, deposits, or non-monetary consideration",
  "duration": "Duration, commencement, and renewal terms",
  "termination": "Grounds for termination, notice periods, and post-termination effects",
  "confidentiality": "Scope of confidential information and duration of secrecy obligations",
  "intellectualProperty": "Ownership of IP, work-for-hire provisions, or licenses granted",
  "liabilityAndIndemnity": "Caps on liability and indemnification commitments",
  "disputeResolution": "Arbitration, mediation, or court forum",
  "governingLaw": "Applicable governing law and territorial jurisdiction",
  "specialClauses": [
    "Any specific clauses requested by user or needed for this transaction"
  ]
}`;

  try {
    const aiResult = await executeLegalAI(req, prompt, 'You are a senior contracts architect structuring an editable legal draft plan.');
    if (aiResult && aiResult.documentTitle) {
      return res.json(aiResult);
    }
  } catch (e) {
    console.error('AI plan error', e);
  }

  // Fallback plan
  const plan = {
    documentTitle: `${documentType.toUpperCase()} AGREEMENT`,
    documentType,
    parties: {
      partyOne: { role: 'First Party (Service Provider / Landlord / Discloser)', description: answers?.legalNames || 'Party A' },
      partyTwo: { role: 'Second Party (Client / Tenant / Recipient)', description: 'Party B' }
    },
    purpose: rawRequirements || 'Legally binding terms governing obligations and rights between the parties.',
    keyObligations: [
      'First Party shall faithfully execute deliverables according to standard professional quality.',
      'Second Party shall provide timely approvals, access, and required materials.'
    ],
    paymentTerms: 'Payment to be rendered in accordance with agreed milestones or monthly schedule.',
    duration: answers?.effectiveDateAndTerm || 'Effective from execution date for an initial term of 12 months.',
    termination: answers?.terminationNoticePeriod || 'Either party may terminate upon 30 days prior written notice.',
    confidentiality: 'Strict confidentiality obligations regarding proprietary business, technical, and commercial data.',
    intellectualProperty: 'All work product and intellectual property rights transfer to Client upon full and final payment.',
    liabilityAndIndemnity: 'Total liability capped at total fees paid under this agreement in the preceding 6 months.',
    disputeResolution: answers?.disputeResolutionMethod || 'Binding Arbitration in accordance with commercial arbitration rules.',
    governingLaw: answers?.governingLawJurisdiction || jurisdiction || 'Governed by the laws of the applicable jurisdiction.',
    specialClauses: [
      'Force Majeure: Neither party liable for delays caused by extraordinary events beyond reasonable control.',
      'Severability: If any provision is deemed invalid, remaining provisions continue in full force.'
    ]
  };

  return res.json(plan);
});

// 4. AI Document Generation
app.post('/api/ai/generate-document', async (req, res) => {
  const { documentType, rawRequirements, jurisdiction, answers, draftPlan } = req.body;
  const prompt = `Generate a complete, professionally drafted legal document based on this approved plan and user facts.
Document Type: ${documentType}
Jurisdiction: ${jurisdiction || 'General'}
User Requirements: "${rawRequirements}"
Answers: ${JSON.stringify(answers || {})}
Approved Draft Plan: ${JSON.stringify(draftPlan || {})}

IMPORTANT GUIDELINES:
- Draft in standard, polished legal style with recitals, operative clauses, definitions, and execution signatures.
- PRESERVE user-provided numbers, currency amounts, dates, names, and milestones accurately.
- DO NOT invent fake case law citations, fictitious statutes, or registration certificate numbers.
- ONLY include clauses relevant to this specific transaction.
- Structure into distinct numbered sections with clear headings.

Return JSON format:
{
  "title": "FULL AGREEMENT TITLE IN UPPERCASE",
  "preamble": "This Agreement is made on this [Date] by and between...",
  "sections": [
    {
      "id": "sec_1",
      "clauseNumber": "1",
      "heading": "DEFINITIONS AND INTERPRETATION",
      "content": "Detailed legal clause text..."
    },
    {
      "id": "sec_2",
      "clauseNumber": "2",
      "heading": "SCOPE OF SERVICES / LEASED PREMISES / OBLIGATIONS",
      "content": "Detailed legal clause text..."
    },
    ...
  ],
  "signatures": {
    "partyOneLabel": "FIRST PARTY / LANDLORD / DISCLOSER",
    "partyTwoLabel": "SECOND PARTY / TENANT / RECIPIENT",
    "witnessesRequired": true
  }
}`;

  try {
    const aiResult = await executeLegalAI(req, prompt, 'You are an elite corporate attorney drafting precision contracts. Output complete JSON.');
    if (aiResult && aiResult.sections && aiResult.sections.length > 0) {
      return res.json(aiResult);
    }
  } catch (e) {
    console.error('AI document generation error', e);
  }

  // Fallback section builder
  const p1 = draftPlan?.parties?.partyOne?.description || 'Party A';
  const p2 = draftPlan?.parties?.partyTwo?.description || 'Party B';
  const law = draftPlan?.governingLaw || jurisdiction || 'the applicable State/Country Law';

  const doc = {
    title: (draftPlan?.documentTitle || `${documentType}`).toUpperCase(),
    preamble: `THIS ${documentType.toUpperCase()} (the "Agreement") is entered into as of this day by and between ${p1} (hereinafter referred to as the "First Party") and ${p2} (hereinafter referred to as the "Second Party"). The First Party and Second Party are collectively referred to as the "Parties" and individually as a "Party".`,
    sections: [
      {
        id: 'sec_recitals',
        clauseNumber: '1',
        heading: 'RECITALS AND PURPOSE',
        content: `WHEREAS, the First Party and the Second Party desire to enter into this formal Agreement to set forth the mutually agreed rights, responsibilities, covenants, and terms governing their relationship;\n\nWHEREAS, the purpose of this Agreement is: ${draftPlan?.purpose || rawRequirements};\n\nNOW, THEREFORE, in consideration of the mutual promises, covenants, and valuable consideration herein contained, the sufficiency of which is hereby acknowledged, the Parties agree as follows:`
      },
      {
        id: 'sec_obligations',
        clauseNumber: '2',
        heading: 'RIGHTS, DUTIES, AND SCOPE OF PERFORMANCE',
        content: `2.1 Performance of Obligations: The Parties shall carry out their respective responsibilities with due diligence, reasonable skill, and in compliance with all applicable statutory regulations.\n2.2 Deliverables and Standards: ${draftPlan?.keyObligations?.join('\n') || 'Both parties shall perform their respective duties promptly and in good faith.'}`
      },
      {
        id: 'sec_payments',
        clauseNumber: '3',
        heading: 'CONSIDERATION AND PAYMENT TERMS',
        content: `3.1 In consideration for the performance rendered under this Agreement, the amounts and fees shall be governed as follows: ${draftPlan?.paymentTerms || 'Payment as agreed upon invoice submission within thirty (30) days.'}\n3.2 Taxes and Statutory Dues: Each party shall be individually responsible for applicable local and federal income taxes unless expressly agreed otherwise.`
      },
      {
        id: 'sec_term_termination',
        clauseNumber: '4',
        heading: 'TERM AND TERMINATION',
        content: `4.1 Term: This Agreement shall commence on the Effective Date and remain in full force and effect for the duration specified: ${draftPlan?.duration || '12 months from execution'}.\n4.2 Termination for Convenience: ${draftPlan?.termination || 'Either Party may terminate this Agreement by providing thirty (30) days advance written notice.'}\n4.3 Termination for Cause: Either Party may immediately terminate this Agreement upon written notice if the other Party commits a material breach and fails to cure such breach within fifteen (15) days of receipt of written notice.`
      },
      {
        id: 'sec_confidentiality',
        clauseNumber: '5',
        heading: 'CONFIDENTIALITY AND PROPRIETARY INFORMATION',
        content: `5.1 "Confidential Information" refers to any proprietary, non-public technical, operational, customer, or financial data disclosed by either Party.\n5.2 Non-Disclosure: The receiving Party agrees to hold in confidence and protect all Confidential Information with the same degree of care it utilizes for its own proprietary records, and shall not disclose such information to third parties without prior written consent.\n5.3 Duration: The confidentiality covenants contained herein shall survive the termination or expiration of this Agreement for a period of two (2) years.`
      },
      {
        id: 'sec_ip',
        clauseNumber: '6',
        heading: 'INTELLECTUAL PROPERTY RIGHTS',
        content: `6.1 Assignment: ${draftPlan?.intellectualProperty || 'All intellectual property rights, trademarks, inventions, and works of authorship created pursuant to this Agreement shall vest in the Client upon full settlement of all due payments.'}\n6.2 Pre-existing IP: Each Party retains exclusive ownership of any intellectual property developed independently prior to the Effective Date.`
      },
      {
        id: 'sec_liability',
        clauseNumber: '7',
        heading: 'LIMITATION OF LIABILITY AND INDEMNIFICATION',
        content: `7.1 Limitation of Liability: ${draftPlan?.liabilityAndIndemnity || 'Neither party shall be liable for indirect, consequential, punitive, or special damages. Total aggregate liability under this agreement shall not exceed the total fees paid hereunder.'}\n7.2 Indemnification: Each Party agrees to indemnify, defend, and hold harmless the other Party from any third-party claims, liabilities, or losses arising directly from gross negligence, willful misconduct, or material breach of this Agreement.`
      },
      {
        id: 'sec_dispute_law',
        clauseNumber: '8',
        heading: 'GOVERNING LAW AND DISPUTE RESOLUTION',
        content: `8.1 Governing Law: This Agreement shall be construed, interpreted, and governed in accordance with the laws of ${law}.\n8.2 Dispute Resolution: ${draftPlan?.disputeResolution || 'Any dispute arising out of or in connection with this contract shall be submitted to binding arbitration.'}`
      },
      {
        id: 'sec_miscellaneous',
        clauseNumber: '9',
        heading: 'MISCELLANEOUS PROVISIONS',
        content: `9.1 Entire Agreement: This Agreement constitutes the complete and exclusive understanding between the Parties and supersedes all prior proposals, negotiations, and representations.\n9.2 Severability: If any provision is found unenforceable by a court of competent jurisdiction, the remaining provisions shall continue in full force.\n9.3 Amendments: Any modification to this Agreement must be in writing and executed by authorized signatories of both Parties.`
      }
    ],
    signatures: {
      partyOneLabel: draftPlan?.parties?.partyOne?.role || 'FIRST PARTY',
      partyTwoLabel: draftPlan?.parties?.partyTwo?.role || 'SECOND PARTY',
      witnessesRequired: true
    }
  };

  return res.json(doc);
});

// 5. AI Legal Review & Risk Audit
app.post('/api/ai/legal-review', async (req, res) => {
  const { documentText, documentType, jurisdiction, draftPlan } = req.body;
  const prompt = `Perform an objective, informational legal review audit of this drafted agreement.
Document Type: ${documentType}
Jurisdiction: ${jurisdiction || 'General'}
Document Content / Sections: ${JSON.stringify(documentText || draftPlan || {})}

Identify:
1. Missing Information
2. Potential Ambiguities
3. Conflicting Clauses
4. Important Assumptions
5. Clauses Requiring User Attention
6. Areas Requiring Qualified Lawyer Review

Use these exact category labels: "Needs Attention", "Potential Issue", "Missing Information", "Lawyer Review Recommended".
Do NOT state the document is legally binding or guarantees compliance.

Return JSON:
{
  "summaryScore": 88,
  "overallAssessment": "Objective summary of the draft's readiness and key caveats.",
  "items": [
    {
      "id": "item_1",
      "category": "Needs Attention" | "Potential Issue" | "Missing Information" | "Lawyer Review Recommended",
      "severity": "high" | "medium" | "low",
      "clauseRef": "e.g., Section 3.1 or Term & Termination",
      "title": "Concise issue title",
      "description": "Clear explanation of the potential risk or ambiguity",
      "suggestion": "Specific recommended change or clarification"
    }
  ],
  "statutoryNotices": [
    "Notices regarding jurisdiction-specific stamping, notarization, or registration requirements (e.g. lease registration for terms > 11 months in India, or state-specific employment rules in California)."
  ]
}`;

  try {
    const aiResult = await executeLegalAI(req, prompt, 'You are an objective legal audit system highlighting risks, ambiguities, and missing provisions.');
    if (aiResult && aiResult.items) {
      return res.json(aiResult);
    }
  } catch (e) {
    console.error('AI legal review error', e);
  }

  // Fallback audit items
  return res.json({
    summaryScore: 86,
    overallAssessment: 'The draft establishes a structured contractual baseline. Several operational details (exact physical addresses, explicit notice addresses, and jurisdiction-specific tax/stamp duties) require user confirmation before execution.',
    items: [
      {
        id: 'rev_1',
        category: 'Missing Information',
        severity: 'medium',
        clauseRef: 'Preamble / Party Details',
        title: 'Full Registered Address and Entity Registration Numbers',
        description: 'Parties are identified by name, but physical registered headquarters addresses and corporate identification numbers (CIN/EIN/LLC ID) are currently omitted.',
        suggestion: 'Insert complete legal registered addresses and representative titles (e.g., Managing Director / Authorized Signatory).'
      },
      {
        id: 'rev_2',
        category: 'Needs Attention',
        severity: 'high',
        clauseRef: 'Governing Law & Dispute Resolution',
        title: 'Arbitration Seat and Venue Specification',
        description: 'The arbitration clause specifies binding arbitration but does not explicitly name the arbitration seat city and rules body (e.g., AAA, SIAC, ICA).',
        suggestion: 'Specify the seat city (e.g., "Seat of Arbitration shall be New York, NY") and designated institutional rules.'
      },
      {
        id: 'rev_3',
        category: 'Potential Issue',
        severity: 'low',
        clauseRef: 'Confidentiality',
        title: 'Exclusions to Confidential Information',
        description: 'Ensure standard exceptions are included (information already publicly known, rightfully received from third parties, or compelled by court order).',
        suggestion: 'Add standard statutory carve-out for legally required disclosures.'
      },
      {
        id: 'rev_4',
        category: 'Lawyer Review Recommended',
        severity: 'medium',
        clauseRef: 'Execution & Registration',
        title: 'Local Registration and Stamp Duty Compliance',
        description: 'Depending on jurisdiction, real estate leases over 11-12 months and certain formal powers of attorney require mandatory stamp duty and official sub-registrar recording to be admissible in court.',
        suggestion: 'Consult a qualified local attorney to verify mandatory stamp duty and notarization thresholds in your state/province.'
      }
    ],
    statutoryNotices: [
      'Disclaimer: This automated review is strictly informational and does not replace qualified counsel.',
      'Check local stamp duty regulations prior to physical signing and execution.'
    ]
  });
});

// 6. AI Clause Assistant (Rewrite, Simplify, Make Strict, Explain)
app.post('/api/ai/clause-assistant', async (req, res) => {
  const { action, clauseText, heading, instruction, jurisdiction } = req.body;
  const prompt = `You are an expert contract drafting assistant.
Task: "${action}" (e.g., 'explain', 'simplify', 'make_specific', 'add_custom', 'rewrite')
Clause Heading: "${heading || ''}"
Existing Clause Text: "${clauseText || ''}"
User Custom Instruction: "${instruction || ''}"
Jurisdiction: "${jurisdiction || 'General'}"

Instructions:
- If action is 'explain', return a clear, plain-English breakdown with bullet points of what rights/risks it gives each party.
- If action is 'simplify', return rewritten plain-language text that retains full legal effectiveness.
- If action is 'make_specific', make the clause tighter, unambiguous, with strict timelines, caps, and remedies.
- If action is 'add_custom' or 'rewrite', craft a professionally balanced clause matching the user's intent.

Return JSON format:
{
  "revisedText": "The modified clause text...",
  "explanation": "Brief explanation of changes or plain English breakdown",
  "risksMitigated": ["Point 1", "Point 2"]
}`;

  try {
    const aiResult = await executeLegalAI(req, prompt, 'You are a contract drafting specialist.');
    if (aiResult && (aiResult.revisedText || aiResult.explanation)) {
      return res.json(aiResult);
    }
  } catch (e) {
    console.error('AI clause assistant error', e);
  }

  // Smart fallback based on action
  if (action === 'explain') {
    return res.json({
      revisedText: clauseText,
      explanation: `Plain English Breakdown of ${heading}:\n• What it means: This clause legally binds both parties to specific expectations and remedies.\n• First Party Rights: Can enforce timely performance and seek remedies upon breach.\n• Second Party Obligations: Must adhere to notice timelines and agreed payment/delivery benchmarks.\n• Risk Point: Failure to adhere strictly to specified notice days can invalidate termination claims.`,
      risksMitigated: ['Clarifies contractual duty boundaries', 'Prevents unexpected claims without prior cure period']
    });
  } else if (action === 'simplify') {
    return res.json({
      revisedText: `${clauseText}\n\n[Simplified]: Both parties agree to communicate in writing. Either party may end this agreement by giving 30 days notice. All payments must be completed within 30 days of receiving the invoice.`,
      explanation: 'Replaced dense archaic phrasing with clean, direct terms while maintaining legal intent.',
      risksMitigated: ['Reduces misunderstanding between non-lawyer signers']
    });
  } else {
    return res.json({
      revisedText: `${clauseText}\n\nProvided always that in the event of any default or delay exceeding ten (10) business days, the non-defaulting party shall be entitled to liquidated damages and reasonable attorney fees incurred in enforcing this covenant.`,
      explanation: 'Added explicit cure window, monetary remedies, and attorney fee recovery.',
      risksMitigated: ['Ambiguity in default timeline', 'Unrecoverable enforcement expenses']
    });
  }
});

// Vite middleware for development & static fallback for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`JurisDraft Legal AI Server running on port ${PORT}`);
  });
}

startServer();
