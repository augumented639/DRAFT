import { LegalDocument } from '../types';

export const INITIAL_SAMPLE_DOCUMENTS: LegalDocument[] = [
  {
    id: 'doc_sample_rental_101',
    title: 'COMMERCIAL SHOP LEASE AGREEMENT',
    type: 'Rental / Lease Agreement',
    jurisdiction: 'India - Maharashtra / Mumbai',
    currency: 'INR',
    rawRequirements: 'I want to create a rental agreement for my shop for 3 years. Monthly rent is ₹25,000 and the tenant must pay a security deposit of ₹1 lakh.',
    answers: {
      legalNames: 'Rajesh Sharma (Landlord) and Prime Tech Retail Pvt Ltd represented by Amit Verma (Tenant)',
      governingLawJurisdiction: 'State of Maharashtra, India (subject to Maharashtra Rent Control Act)',
      effectiveDateAndTerm: '1st October 2026 for a fixed term of 36 months',
      terminationNoticePeriod: '3 months prior written notice after a 12-month lock-in period',
      disputeResolutionMethod: 'Arbitration in Mumbai under the Arbitration and Conciliation Act, 1996'
    },
    draftPlan: {
      documentTitle: 'COMMERCIAL SHOP LEASE AGREEMENT',
      documentType: 'Rental / Lease Agreement',
      parties: {
        partyOne: {
          role: 'Landlord / Lessor',
          description: 'Rajesh Sharma, residing at Flat 402, Sea Green Apts, Bandra West, Mumbai - 400050'
        },
        partyTwo: {
          role: 'Tenant / Lessee',
          description: 'Prime Tech Retail Pvt Ltd, represented by Director Amit Verma, CIN: U72900MH2022PTC123456'
        }
      },
      purpose: 'Lease of commercial premises bearing Shop No. 12, Ground Floor, Galaxy Arcade, Andheri East, Mumbai for running an electronics retail outlet.',
      keyObligations: [
        'Tenant shall use the premises strictly for lawful commercial retail operations.',
        'Tenant shall promptly pay monthly utility bills, electricity, and society maintenance dues directly.',
        'Landlord guarantees peaceful possession and freedom from encumbrances.'
      ],
      paymentTerms: 'Monthly rent of ₹25,000 payable on or before the 5th of each calendar month. Refundable interest-free security deposit of ₹1,00,000 deposited on execution.',
      duration: '36 Months commencing from October 1, 2026 with a 5% rent escalation after each 12-month period.',
      termination: '12-month initial lock-in period during which neither party may terminate. Thereafter, either party may terminate by serving 3 months prior written notice.',
      confidentiality: 'Terms of commercial arrangement and lease financial consideration shall remain confidential between parties.',
      intellectualProperty: 'Tenant may erect non-structural brand signage on designated facade area only.',
      liabilityAndIndemnity: 'Tenant indemnifies Landlord against any third-party claims or statutory labor violations occurring on the leased premises.',
      disputeResolution: 'Sole Arbitrator appointed mutually in Mumbai, proceedings governed by the Arbitration and Conciliation Act, 1996.',
      governingLaw: 'Laws of India and Courts of Mumbai, Maharashtra.',
      specialClauses: [
        'No structural alterations permitted without prior written consent of the Landlord.',
        'Premises to be delivered back in original good condition, subject to normal wear and tear.'
      ]
    },
    preamble: 'THIS COMMERCIAL LEASE AGREEMENT (the "Agreement") is made and entered into this 1st day of October, 2026, at Mumbai, Maharashtra, by and between Rajesh Sharma (hereinafter called the "LESSOR") and Prime Tech Retail Pvt Ltd represented by Amit Verma (hereinafter called the "LESSEE").',
    sections: [
      {
        id: 'sec_1',
        clauseNumber: '1',
        heading: 'PREMISES AND PERMITTED USE',
        content: '1.1 Demised Premises: The Lessor hereby leases to the Lessee, and the Lessee hereby takes on lease, all that commercial shop space bearing Shop No. 12, Ground Floor, Galaxy Arcade, Andheri East, Mumbai - 400069 (the "Premises").\n1.2 Permitted Purpose: The Lessee covenants to use the Premises solely for lawful commercial retail activities and ancillary office storage, and shall not operate hazardous or prohibited commercial trades.'
      },
      {
        id: 'sec_2',
        clauseNumber: '2',
        heading: 'TERM, COMMENCEMENT, AND LOCK-IN PERIOD',
        content: '2.1 Term: This Lease shall be valid for a period of thirty-six (36) months commencing from 1st October 2026 and expiring on 30th September 2029.\n2.2 Lock-in Period: Both Parties agree to a strict mandatory Lock-in Period of twelve (12) months from the Commencement Date. In the event of early vacating by Lessee within this period, Lessee shall remain liable for rent for the remainder of the lock-in period.'
      },
      {
        id: 'sec_3',
        clauseNumber: '3',
        heading: 'MONTHLY RENT, SECURITY DEPOSIT, AND ESCALATION',
        content: '3.1 Monthly Consideration: The Lessee shall pay to the Lessor a monthly rent of ₹25,000 (Rupees Twenty-Five Thousand Only), payable in advance on or before the 5th day of each Gregorian calendar month via NEFT/RTGS bank transfer.\n3.2 Escalation: The monthly rent shall escalate by five percent (5%) at the completion of each twelve (12) months of the Lease Term.\n3.3 Interest-Free Security Deposit: The Lessee has deposited with the Lessor a sum of ₹1,00,000 (Rupees One Lakh Only) as refundable interest-free security deposit. The Lessor shall refund this entire deposit within seven (7) banking days of peaceful physical handover of vacant possession.'
      },
      {
        id: 'sec_4',
        clauseNumber: '4',
        heading: 'MAINTENANCE, UTILITIES, AND STATUTORY DUES',
        content: '4.1 Operational Outgoings: The Lessee shall punctually pay all electricity consumption charges, broadband, municipal water bills, and commercial society maintenance charges attributable to the Premises.\n4.2 Property Tax: The Lessor shall remain solely responsible for paying municipal property taxes and building insurance levies.'
      },
      {
        id: 'sec_5',
        clauseNumber: '5',
        heading: 'TERMINATION AND SURRENDER OF POSSESSION',
        content: '5.1 Notice for Termination: Following the expiry of the mandatory 12-month lock-in period, either party may terminate this Agreement without cause by giving three (3) full calendar months advance notice in writing.\n5.2 Restitution: On expiration or earlier termination, the Lessee shall surrender vacant and peaceful possession of the Premises in the same condition as received, reasonable wear and tear excepted.'
      },
      {
        id: 'sec_6',
        clauseNumber: '6',
        heading: 'DISPUTE RESOLUTION AND GOVERNING LAW',
        content: '6.1 Arbitration: Any dispute or difference arising under this Agreement shall be referred to a sole arbitrator appointed by mutual agreement. The seat and venue of arbitration shall be Mumbai, and proceedings shall be in English.\n6.2 Jurisdiction: Subject to arbitration, the competent courts situated in Mumbai, Maharashtra shall have exclusive jurisdiction.'
      }
    ],
    signatures: {
      partyOneLabel: 'RAJESH SHARMA (LESSOR / LANDLORD)',
      partyTwoLabel: 'PRIME TECH RETAIL PVT LTD (LESSEE / TENANT)',
      witnessesRequired: true
    },
    reviewAudit: {
      summaryScore: 92,
      overallAssessment: 'Well-structured commercial tenancy agreement with clear financial consideration, lock-in terms, and deposit safeguards. Registration before the Joint Sub-Registrar is mandatory for leases exceeding 11 months.',
      items: [
        {
          id: 'rev_rent_1',
          category: 'Lawyer Review Recommended',
          severity: 'high',
          clauseRef: 'Statutory Compliance / Registration',
          title: 'Mandatory Sub-Registrar Lease Registration & Stamp Duty',
          description: 'Under Section 17 of the Registration Act and Maharashtra state laws, any tenancy exceeding 11 months must be officially stamped and registered before the Sub-Registrar of Assurances to be legally admissible in court.',
          suggestion: 'Ensure both parties register this agreement and pay appropriate Maharashtra stamp duty and registration fees.'
        },
        {
          id: 'rev_rent_2',
          category: 'Potential Issue',
          severity: 'medium',
          clauseRef: 'Clause 3.3 (Security Deposit Refund)',
          title: 'Deduction Protocol for Unpaid Utilities',
          description: 'The deposit clause mandates refund within 7 days but does not explicitly specify Lessor right to offset unpaid electricity bills against the deposit.',
          suggestion: 'Add an explicit clause permitting the Lessor to deduct documented outstanding utility arrears before refunding balance deposit.'
        }
      ],
      statutoryNotices: [
        'Mandatory Stamp Duty required under Maharashtra Stamp Act.',
        'Police verification of commercial occupants is recommended.'
      ]
    },
    versions: [
      {
        versionNumber: 1,
        timestamp: '2026-08-20T10:15:00Z',
        changeSummary: 'Initial AI Generated Draft from natural language prompt',
        title: 'COMMERCIAL SHOP LEASE AGREEMENT',
        sections: []
      }
    ],
    currentVersionNumber: 1,
    status: 'reviewed',
    favorite: true,
    isTrashed: false,
    createdAt: '2026-08-20T10:15:00Z',
    updatedAt: '2026-08-22T04:10:00Z',
    tags: ['Commercial', 'Real Estate', 'Rental', 'Mumbai']
  },
  {
    id: 'doc_sample_freelance_102',
    title: 'INDEPENDENT CONTRACTOR & IP ASSIGNMENT AGREEMENT',
    type: 'Freelance Agreement',
    jurisdiction: 'United States - Delaware',
    currency: 'USD',
    rawRequirements: 'I want an agreement between my company (Apex Media LLC) and a freelancer for website development. The project will cost $8,000 divided into three installments, and all intellectual property should belong to my company after final payment.',
    answers: {
      legalNames: 'Apex Media LLC (Client) and Alex Rivera (Independent Contractor)',
      governingLawJurisdiction: 'State of Delaware, USA',
      effectiveDateAndTerm: 'September 1, 2026 until final project acceptance',
      terminationNoticePeriod: '14 days written notice; pro-rata payment for approved milestones',
      disputeResolutionMethod: 'Mediation followed by binding arbitration in Wilmington, DE'
    },
    draftPlan: {
      documentTitle: 'INDEPENDENT CONTRACTOR & IP ASSIGNMENT AGREEMENT',
      documentType: 'Freelance Agreement',
      parties: {
        partyOne: {
          role: 'Client / Company',
          description: 'Apex Media LLC, a Delaware Limited Liability Company'
        },
        partyTwo: {
          role: 'Independent Contractor / Developer',
          description: 'Alex Rivera, an individual residing in Austin, Texas'
        }
      },
      purpose: 'Development and deployment of a responsive multi-vendor web platform according to agreed technical specifications.',
      keyObligations: [
        'Contractor shall build front-end and back-end application following sprint schedules.',
        'Client shall provide design assets, API credentials, and feedback within 5 business days.'
      ],
      paymentTerms: '$8,000 USD total fixed fee: 30% ($2,400) upon signing, 40% ($3,200) upon beta release, and 30% ($2,400) upon final acceptance and code handover.',
      duration: 'Project estimated duration of 90 days from execution date.',
      termination: 'Either party may terminate on 14 days written notice. Client pays for completed and accepted milestone stages.',
      confidentiality: 'Contractor shall keep all Client source code, customer databases, and product roadmaps strictly confidential indefinitely.',
      intellectualProperty: 'All work product, custom code, repository commits, and assets are assigned as "Work Made for Hire" to Client upon receipt of final payment.',
      liabilityAndIndemnity: 'Contractor warrants code does not infringe third-party patents or copyrights. Liability capped at total contract value.',
      disputeResolution: 'Mediation followed by binding AAA commercial arbitration in Delaware.',
      governingLaw: 'Laws of the State of Delaware, USA.',
      specialClauses: [
        'Includes 30 days of post-launch bug fixing and warranty support at zero extra charge.'
      ]
    },
    preamble: 'THIS INDEPENDENT CONTRACTOR AGREEMENT (the "Agreement") is made effective as of September 1, 2026, by and between Apex Media LLC ("Client") and Alex Rivera ("Contractor"). Client and Contractor are referred to as the "Parties".',
    sections: [
      {
        id: 'sec_f_1',
        clauseNumber: '1',
        heading: 'SERVICES AND STATEMENT OF WORK',
        content: '1.1 Services: Contractor agrees to provide custom software development services including front-end web development, API integration, and database schema implementation in accordance with Exhibit A (Scope of Work).\n1.2 Standard of Performance: Contractor shall perform all tasks in a workmanlike and professional manner in accordance with industry best practices.'
      },
      {
        id: 'sec_f_2',
        clauseNumber: '2',
        heading: 'COMPENSATION AND MILESTONE PAYMENT SCHEDULE',
        content: '2.1 Total Contract Value: Client shall pay Contractor an aggregate fixed fee of $8,000 USD divided into three milestone installments:\n(a) Milestone 1: $2,400 USD (30%) upon mutual contract execution as advance commencement retainer;\n(b) Milestone 2: $3,200 USD (40%) upon delivery of fully functional Beta staging build;\n(c) Milestone 3: $2,400 USD (30%) upon final production deployment, code handover, and Client written acceptance.\n2.2 Payment Timing: Client shall disburse payment within ten (10) business days of written milestone sign-off.'
      },
      {
        id: 'sec_f_3',
        clauseNumber: '3',
        heading: 'INTELLECTUAL PROPERTY RIGHTS AND WORK FOR HIRE',
        content: '3.1 Work Made for Hire: All copyrights, trade secrets, patents, software code, repositories, and documentation created under this Agreement shall be deemed "Works Made for Hire" under applicable US copyright laws.\n3.2 Transfer & Assignment: To the extent any deliverables do not qualify as work made for hire, Contractor hereby irrevocably assigns and transfers to Client all right, title, and interest throughout the universe upon receipt of full final payment under Section 2.'
      },
      {
        id: 'sec_f_4',
        clauseNumber: '4',
        heading: 'INDEPENDENT CONTRACTOR STATUS',
        content: '4.1 Independent Entity: Contractor is an independent contractor and not an employee, agent, or partner of Client. Contractor is solely responsible for paying federal, state, and local income taxes, self-employment taxes, and personal worker insurances.'
      },
      {
        id: 'sec_f_5',
        clauseNumber: '5',
        heading: 'CONFIDENTIALITY AND NON-DISCLOSURE',
        content: '5.1 Protection of Client Assets: Contractor shall maintain strict confidentiality over all proprietary materials, customer data, source code, and business plans, and shall not disclose or use them outside the scope of this project.'
      },
      {
        id: 'sec_f_6',
        clauseNumber: '6',
        heading: 'GOVERNING LAW AND JURISDICTION',
        content: '6.1 Law: This Agreement shall be construed and governed in accordance with the laws of the State of Delaware, USA, without regard to conflicts of law principles.'
      }
    ],
    signatures: {
      partyOneLabel: 'APEX MEDIA LLC (CLIENT)',
      partyTwoLabel: 'ALEX RIVERA (CONTRACTOR)',
      witnessesRequired: false
    },
    reviewAudit: {
      summaryScore: 95,
      overallAssessment: 'High quality freelance agreement with clear milestone triggers and robust IP assignment. Added warranty period safeguards client after launch.',
      items: [
        {
          id: 'rev_fl_1',
          category: 'Needs Attention',
          severity: 'medium',
          clauseRef: 'Section 1.1 (Scope of Work Exhibit)',
          title: 'Attach Explicit Feature Specification / Exhibit A',
          description: 'The agreement references "Exhibit A (Scope of Work)". Ensure an explicit sprint checklist or feature backlog is attached to avoid scope creep dispute.',
          suggestion: 'List exact functional pages and third-party API dependencies in the project brief.'
        },
        {
          id: 'rev_fl_2',
          category: 'Potential Issue',
          severity: 'low',
          clauseRef: 'Section 3.2 (Open Source Licenses)',
          title: 'Third-Party Open-Source Code Carve-Out',
          description: 'If the developer utilizes open-source MIT/Apache packages, standard warranties should clarify that OSS licenses remain governed by their respective public terms.',
          suggestion: 'Add standard OSS disclosure clause.'
        }
      ]
    },
    versions: [],
    currentVersionNumber: 1,
    status: 'finalized',
    favorite: true,
    isTrashed: false,
    createdAt: '2026-08-19T14:20:00Z',
    updatedAt: '2026-08-21T18:30:00Z',
    tags: ['Freelance', 'IP Assignment', 'Web Development', 'Tech']
  }
];
