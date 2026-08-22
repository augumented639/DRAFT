export type DocumentCategory =
  | 'Rental / Lease Agreement'
  | 'Employment Agreement'
  | 'Non-Disclosure Agreement (NDA)'
  | 'Service Agreement'
  | 'Partnership Agreement'
  | 'Affidavit'
  | 'Authorization Letter'
  | 'Demand Letter'
  | 'Legal Notice'
  | 'Freelance Agreement'
  | 'Consultancy Agreement'
  | 'Sale Agreement'
  | 'Loan Agreement'
  | 'Memorandum of Understanding (MOU)'
  | 'Privacy Policy'
  | 'Terms & Conditions'
  | 'Employment Offer Letter'
  | 'Vendor Agreement'
  | 'Custom Legal Document';

export interface DocumentTypeInfo {
  id: string;
  name: DocumentCategory;
  category: 'Property' | 'Business & Employment' | 'IP & Confidentiality' | 'Notices & Court' | 'Commercial' | 'Digital & Web';
  description: string;
  typicalUse: string;
  keyClauses: string[];
  suggestedJurisdictions: string[];
  popularBadge?: boolean;
}

export interface ClarificationQuestion {
  id: string;
  question: string;
  fieldKey: string;
  type: 'text' | 'select' | 'date' | 'number' | 'boolean';
  options?: string[];
  placeholder?: string;
  defaultValue?: string;
  required: boolean;
  whyItMatters: string;
}

export interface DraftPlanParties {
  partyOne: {
    role: string;
    description: string;
  };
  partyTwo: {
    role: string;
    description: string;
  };
}

export interface DraftPlan {
  documentTitle: string;
  documentType: DocumentCategory | string;
  parties: DraftPlanParties;
  purpose: string;
  keyObligations: string[];
  paymentTerms: string;
  duration: string;
  termination: string;
  confidentiality: string;
  intellectualProperty: string;
  liabilityAndIndemnity: string;
  disputeResolution: string;
  governingLaw: string;
  specialClauses: string[];
}

export interface DocumentSection {
  id: string;
  clauseNumber: string;
  heading: string;
  content: string;
  isCustom?: boolean;
  comments?: DocumentComment[];
}

export interface DocumentComment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
  resolved?: boolean;
}

export interface LegalReviewItem {
  id: string;
  category: 'Needs Attention' | 'Potential Issue' | 'Missing Information' | 'Lawyer Review Recommended';
  severity: 'high' | 'medium' | 'low';
  clauseRef: string;
  title: string;
  description: string;
  suggestion: string;
  applied?: boolean;
}

export interface LegalReviewAudit {
  summaryScore: number;
  overallAssessment: string;
  items: LegalReviewItem[];
  statutoryNotices?: string[];
}

export interface DocumentVersion {
  versionNumber: number;
  timestamp: string;
  changeSummary: string;
  sections: DocumentSection[];
  title: string;
}

export interface LegalDocument {
  id: string;
  title: string;
  type: DocumentCategory | string;
  jurisdiction: string;
  currency: string;
  rawRequirements: string;
  answers: Record<string, any>;
  draftPlan: DraftPlan;
  preamble: string;
  sections: DocumentSection[];
  signatures?: {
    partyOneLabel: string;
    partyTwoLabel: string;
    witnessesRequired: boolean;
  };
  reviewAudit?: LegalReviewAudit;
  versions: DocumentVersion[];
  currentVersionNumber: number;
  status: 'draft' | 'plan_ready' | 'generated' | 'reviewed' | 'finalized';
  favorite?: boolean;
  isTrashed?: boolean;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface RecommendationResult {
  documentType: DocumentCategory | string;
  title: string;
  matchScore: number;
  whyRecommended: string;
  keyClausesIncluded: string[];
  keyQuestionsToConsider: string[];
}

export interface AppSettings {
  openRouterApiKey: string;
  openRouterModel: string;
  defaultJurisdiction: string;
  defaultCurrency: string;
  userName: string;
  userEmail: string;
  defaultSignatoryTitle: string;
}
