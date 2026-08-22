import { DocumentTypeInfo } from '../types';

export const DOCUMENT_TEMPLATES: DocumentTypeInfo[] = [
  {
    id: 'rental_lease',
    name: 'Rental / Lease Agreement',
    category: 'Property',
    description: 'Formal contract for residential or commercial property tenancy, specifying rent, security deposit, utilities, and maintenance.',
    typicalUse: 'Renting apartments, office spaces, shops, or residential houses.',
    keyClauses: ['Demised Premises', 'Monthly Rent & Due Date', 'Security Deposit & Refund', 'Lock-in Period & Notice', 'Maintenance & Utilities', 'Eviction Grounds'],
    suggestedJurisdictions: ['India (State Rent Control)', 'US (State Specific)', 'UK (Assured Shorthold)', 'Canada', 'Australia', 'UAE', 'Singapore'],
    popularBadge: true
  },
  {
    id: 'freelance_contract',
    name: 'Freelance Agreement',
    category: 'Business & Employment',
    description: 'Contract between an independent contractor and client defining scope of work, milestone payments, revision limits, and IP ownership upon payment.',
    typicalUse: 'Hiring software engineers, designers, copywriters, or video editors.',
    keyClauses: ['Statement of Work (SOW)', 'Milestone Payments', 'IP Assignment upon Payment', 'Revisions & Acceptance', 'Independent Contractor Status', 'Non-Solicitation'],
    suggestedJurisdictions: ['Global / International', 'US (Delaware/California)', 'India', 'UK', 'EU'],
    popularBadge: true
  },
  {
    id: 'nda',
    name: 'Non-Disclosure Agreement (NDA)',
    category: 'IP & Confidentiality',
    description: 'Mutual or unilateral confidentiality agreement protecting trade secrets, business models, financial data, and technical know-how.',
    typicalUse: 'Protecting confidential discussions with potential partners, investors, developers, or employees.',
    keyClauses: ['Definition of Confidential Information', 'Non-Disclosure Obligations', 'Exceptions (Public Info)', 'Term of Confidentiality', 'Return of Materials', 'Injunctive Relief'],
    suggestedJurisdictions: ['Delaware, USA', 'California, USA', 'United Kingdom', 'India', 'Singapore'],
    popularBadge: true
  },
  {
    id: 'employment_agreement',
    name: 'Employment Agreement',
    category: 'Business & Employment',
    description: 'Comprehensive employment contract detailing role, compensation, benefits, probationary period, working hours, IP rights, and termination notice.',
    typicalUse: 'Full-time or part-time hiring of company employees.',
    keyClauses: ['Job Title & Duties', 'Compensation & Benefits', 'Probation Period', 'IP Assignment', 'Non-Compete & Non-Solicit', 'Termination for Cause vs. Notice'],
    suggestedJurisdictions: ['State / Province Labor Codes', 'United Kingdom (Employment Rights Act)', 'India (Industrial Disputes / Shops & Est)'],
    popularBadge: true
  },
  {
    id: 'service_agreement',
    name: 'Service Agreement',
    category: 'Commercial',
    description: 'Master Services Agreement (MSA) for corporate agencies, IT service providers, maintenance contractors, and ongoing B2B services.',
    typicalUse: 'B2B client onboarding, consulting retainers, agency contracts.',
    keyClauses: ['Service Level Agreement (SLA)', 'Fees & Invoicing', 'Warranties & Disclaimers', 'Limitation of Liability', 'Termination for Convenience', 'Indemnification'],
    suggestedJurisdictions: ['US (Delaware/New York)', 'United Kingdom', 'India', 'Singapore'],
    popularBadge: true
  },
  {
    id: 'partnership_agreement',
    name: 'Partnership Agreement',
    category: 'Business & Employment',
    description: 'Legal agreement establishing rights, capital contributions, profit-sharing ratios, management voting, and dissolution among business partners.',
    typicalUse: 'Founding general partnerships, joint ventures, or co-founder arrangements.',
    keyClauses: ['Capital Contributions', 'Profit & Loss Allocation', 'Management & Voting Powers', 'Banking & Accounts', 'Partner Exit / Buyout', 'Dissolution Procedures'],
    suggestedJurisdictions: ['State Partnership Acts', 'UK Partnership Act', 'India Partnership Act 1932'],
    popularBadge: false
  },
  {
    id: 'consultancy_agreement',
    name: 'Consultancy Agreement',
    category: 'Business & Employment',
    description: 'Specialized agreement for professional advisors, executive consultants, board advisors, or strategic specialists.',
    typicalUse: 'Strategic advisory, management consulting, financial consulting.',
    keyClauses: ['Consulting Scope', 'Retainer & Hourly Rates', 'Confidentiality', 'Conflict of Interest', 'No Agency / Independent Status'],
    suggestedJurisdictions: ['US', 'UK', 'India', 'Canada', 'Singapore'],
    popularBadge: false
  },
  {
    id: 'loan_agreement',
    name: 'Loan Agreement',
    category: 'Commercial',
    description: 'Legally binding loan contract specifying principal amount, annual interest rate, repayment amortization, collateral security, and default remedies.',
    typicalUse: 'Personal loans, peer-to-peer lending, shareholder loans, or commercial promissory debt.',
    keyClauses: ['Principal & Interest Rate', 'Repayment Schedule', 'Prepayment Rights', 'Events of Default', 'Collateral / Personal Guarantee', 'Acceleration Clause'],
    suggestedJurisdictions: ['General Commercial Law', 'US Uniform Commercial Code', 'India Contract Act'],
    popularBadge: true
  },
  {
    id: 'demand_letter',
    name: 'Demand Letter',
    category: 'Notices & Court',
    description: 'Formal pre-litigation letter demanding payment of overdue debt, cure of contractual default, or cessation of infringement within a strict deadline.',
    typicalUse: 'Recovering unpaid invoices, demanding contract performance, pre-suit debt collection.',
    keyClauses: ['Statement of Facts & Debt', 'Contractual Basis', 'Explicit Sum & Interest Demanded', 'Cure Deadline (e.g. 15 Days)', 'Reservation of Legal Rights & Costs'],
    suggestedJurisdictions: ['All Jurisdictions'],
    popularBadge: false
  },
  {
    id: 'legal_notice',
    name: 'Legal Notice',
    category: 'Notices & Court',
    description: 'Statutory formal notice served to an opposing party putting them on legal notice prior to initiating legal proceedings in a civil or consumer court.',
    typicalUse: 'Tenant eviction notices, consumer complaints, breach of contract notices.',
    keyClauses: ['Sender & Recipient Particulars', 'Chronology of Grievance', 'Legal Infringement / Default', 'Specific Remedy Demanded', 'Final Notice Period'],
    suggestedJurisdictions: ['India (Section 80 CPC / NI Act / RERA)', 'UK', 'US', 'Australia'],
    popularBadge: false
  },
  {
    id: 'affidavit',
    name: 'Affidavit',
    category: 'Notices & Court',
    description: 'Sworn written statement of fact made under oath, formatted for execution before a Notary Public, Commissioner of Oaths, or Magistrate.',
    typicalUse: 'Proof of address, name change, birth certificate discrepancies, lost documents.',
    keyClauses: ['Deponent Identity & Statement', 'Numbered Factual Declarations', 'Verification under Oath', 'Notary Attestation Block'],
    suggestedJurisdictions: ['All Jurisdictions (Notarization Required)'],
    popularBadge: false
  },
  {
    id: 'authorization_letter',
    name: 'Authorization Letter',
    category: 'Commercial',
    description: 'Letter granting specific authority to a designated agent or representative to act, sign, or collect documents on behalf of an individual or company.',
    typicalUse: 'Authorizing a bank representative, legal proxy, or customs agent.',
    keyClauses: ['Authorizer Details', 'Appointed Agent Particulars', 'Specific Scope of Powers', 'Validity Period', 'Specimen Signatures'],
    suggestedJurisdictions: ['All Jurisdictions'],
    popularBadge: false
  },
  {
    id: 'mou',
    name: 'Memorandum of Understanding (MOU)',
    category: 'Commercial',
    description: 'Non-binding or semi-binding framework document outlining mutual intent and collaboration terms before finalizing formal definitive contracts.',
    typicalUse: 'Strategic alliances, joint research, preliminary business combinations.',
    keyClauses: ['Joint Objective', 'Roles of Each Entity', 'Exclusivity Period', 'Binding vs. Non-Binding Clauses', 'Costs Allocation'],
    suggestedJurisdictions: ['Delaware, USA', 'UK', 'India', 'Singapore', 'EU'],
    popularBadge: false
  },
  {
    id: 'sale_agreement',
    name: 'Sale Agreement',
    category: 'Commercial',
    description: 'Formal agreement for the sale of goods, vehicles, equipment, or movable assets with transfer of title, payment terms, and delivery warranties.',
    typicalUse: 'Vehicle sales, industrial equipment purchases, bulk inventory transfers.',
    keyClauses: ['Description of Goods', 'Purchase Price & Payment', 'Title Transfer & Risk of Loss', 'Warranties & Inspection Period', 'Remedies for Defect'],
    suggestedJurisdictions: ['UCC (US)', 'Sale of Goods Act (UK/India)', 'CISG (International)'],
    popularBadge: false
  },
  {
    id: 'vendor_agreement',
    name: 'Vendor Agreement',
    category: 'Commercial',
    description: 'Comprehensive agreement for suppliers and vendors providing goods, software licenses, or continuous supplies to a commercial enterprise.',
    typicalUse: 'Procurement contracts, supplier onboarding, distributor terms.',
    keyClauses: ['Purchase Orders & Delivery', 'Pricing & Volume Discounts', 'Quality Standards & Return Policy', 'Compliance with Laws', 'Termination'],
    suggestedJurisdictions: ['General Commercial Law'],
    popularBadge: false
  },
  {
    id: 'employment_offer_letter',
    name: 'Employment Offer Letter',
    category: 'Business & Employment',
    description: 'Official corporate offer letter extended to a prospective hire detailing job title, CTC/salary, start date, equity, and acceptance terms.',
    typicalUse: 'Extending formal job offers to candidates.',
    keyClauses: ['Position Title & Reporting Manager', 'Base Salary, Bonus & Benefits', 'Proposed Start Date', 'At-Will or Term Status', 'Contingencies (Background Check)'],
    suggestedJurisdictions: ['All Jurisdictions'],
    popularBadge: false
  },
  {
    id: 'privacy_policy',
    name: 'Privacy Policy',
    category: 'Digital & Web',
    description: 'Legally compliant website or mobile app privacy policy detailing user data collection, cookie usage, GDPR/CCPA rights, and third-party processors.',
    typicalUse: 'Websites, SaaS products, e-commerce stores, iOS/Android apps.',
    keyClauses: ['Information Collected', 'Purpose of Processing', 'Cookies & Analytics', 'Data Subject Rights (GDPR/CCPA)', 'Security & Retention', 'Contact Data Officer'],
    suggestedJurisdictions: ['GDPR (EU/UK)', 'CCPA/CPRA (California)', 'DPDP Act (India)', 'Global Compliant'],
    popularBadge: true
  },
  {
    id: 'terms_and_conditions',
    name: 'Terms & Conditions',
    category: 'Digital & Web',
    description: 'Binding terms of service governing user access, account termination, prohibited conduct, intellectual property, and disclaimers for digital platforms.',
    typicalUse: 'SaaS platforms, web marketplaces, online stores, digital content sites.',
    keyClauses: ['Acceptance of Terms', 'User Account Responsibility', 'Acceptable Use Policy', 'Disclaimers of Warranty', 'Limitation of Liability', 'Governing Law'],
    suggestedJurisdictions: ['Delaware, USA', 'California, USA', 'United Kingdom', 'India', 'Singapore'],
    popularBadge: true
  },
  {
    id: 'custom_legal_doc',
    name: 'Custom Legal Document',
    category: 'Commercial',
    description: 'Tailored contract architecture structured from scratch for unique transactions, bespoke arrangements, or multi-party stipulations.',
    typicalUse: 'Novel business models, barter agreements, tripartite agreements, settlement agreements.',
    keyClauses: ['Bespoke Recitals', 'Custom Operative Provisions', 'Risk Allocation', 'Dispute Resolution', 'Execution Block'],
    suggestedJurisdictions: ['All Jurisdictions'],
    popularBadge: false
  }
];

export const JURISDICTIONS = [
  { value: 'United States - General / Federal', label: 'United States (Federal / General)' },
  { value: 'United States - California', label: 'United States (California)' },
  { value: 'United States - Delaware', label: 'United States (Delaware)' },
  { value: 'United States - New York', label: 'United States (New York)' },
  { value: 'India - General / Central Acts', label: 'India (Central Acts / All States)' },
  { value: 'India - Maharashtra / Mumbai', label: 'India (Maharashtra / Mumbai)' },
  { value: 'India - Karnataka / Bangalore', label: 'India (Karnataka / Bangalore)' },
  { value: 'India - Delhi NCR', label: 'India (Delhi NCR)' },
  { value: 'United Kingdom (England & Wales)', label: 'United Kingdom (England & Wales)' },
  { value: 'Canada (Ontario & Federal)', label: 'Canada (Ontario & Federal)' },
  { value: 'Australia (NSW & Federal)', label: 'Australia (NSW & Federal)' },
  { value: 'Singapore', label: 'Singapore' },
  { value: 'United Arab Emirates (UAE / DIFC)', label: 'United Arab Emirates (UAE / DIFC)' },
  { value: 'European Union (GDPR & Civil Law)', label: 'European Union (General / GDPR)' },
  { value: 'International / Cross-Border', label: 'International / Cross-Border (Neutral)' }
];

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)' },
  { code: 'EUR', symbol: '€', name: 'Euro (€)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CA$)' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar (A$)' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar (S$)' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham (AED)' }
];

export const SAMPLE_PROMPTS = [
  {
    title: 'Shop / Commercial Rental Agreement',
    type: 'Rental / Lease Agreement',
    text: 'I want to create a rental agreement for my commercial shop for 3 years. Monthly rent is ₹25,000 with a 5% annual escalation, and the tenant must pay a security deposit of ₹1,00,000. Tenant is responsible for electricity and maintenance charges.'
  },
  {
    title: 'Website Development Freelance Agreement',
    type: 'Freelance Agreement',
    text: 'I want an agreement between my company (Apex Media LLC) and a freelance developer (Alex Rivera) for building an e-commerce website. The project will cost $3,500 split into three milestones (30% upfront, 40% beta delivery, 30% final sign-off). All intellectual property must transfer to my company upon final payment.'
  },
  {
    title: 'Mutual Non-Disclosure Agreement (NDA)',
    type: 'Non-Disclosure Agreement (NDA)',
    text: 'Mutual NDA between CloudPulse Inc. and Quantum Labs to evaluate a strategic software partnership. Both parties will share proprietary AI architecture and financial models. Confidentiality obligation should last 3 years from disclosure date.'
  },
  {
    title: 'Overdue Invoice Demand Letter',
    type: 'Demand Letter',
    text: 'Formal legal demand letter to BlueStone Retail for an overdue invoice of $14,200 for branding services completed 60 days ago. Give them a strict 14-day notice to settle payment before initiating legal proceedings for recovery with interest and legal costs.'
  }
];
