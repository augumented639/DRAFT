import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LegalDocument, AppSettings, DocumentSection, DocumentVersion, DraftPlan, LegalReviewAudit } from '../types';
import { INITIAL_SAMPLE_DOCUMENTS } from '../data/sampleDocs';

interface DocumentContextType {
  documents: LegalDocument[];
  activeDocument: LegalDocument | null;
  activeDocId: string | null;
  settings: AppSettings;
  serverStatus: { status: string; hasOpenRouter: boolean; hasGemini: boolean; defaultModel?: string };
  isSaving: boolean;
  lastSavedTime: Date | null;
  setActiveDocId: (id: string | null) => void;
  createDocument: (doc: Partial<LegalDocument>) => LegalDocument;
  updateDocument: (id: string, updates: Partial<LegalDocument>, createVersionSnapshot?: boolean, changeSummary?: string) => void;
  deleteDocument: (id: string, permanent?: boolean) => void;
  restoreDocument: (id: string) => void;
  duplicateDocument: (id: string) => LegalDocument;
  toggleFavorite: (id: string) => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  rollbackVersion: (docId: string, versionNumber: number) => void;
}

const STORAGE_KEY_DOCS = 'jurisdraft_documents_v1';
const STORAGE_KEY_SETTINGS = 'jurisdraft_settings_v1';

const DEFAULT_SETTINGS: AppSettings = {
  openRouterApiKey: '',
  openRouterModel: 'openai/gpt-4o-mini',
  defaultJurisdiction: 'United States - California',
  defaultCurrency: 'USD',
  userName: 'Legal Counsel / Draft Lead',
  userEmail: 'qureshirehan392@gmail.com',
  defaultSignatoryTitle: 'Authorized Signatory'
};

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<LegalDocument[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DOCS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse saved documents from localStorage', e);
    }
    return INITIAL_SAMPLE_DOCUMENTS;
  });

  const [activeDocId, setActiveDocId] = useState<string | null>(() => {
    return INITIAL_SAMPLE_DOCUMENTS[0]?.id || null;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to parse saved settings', e);
    }
    return DEFAULT_SETTINGS;
  });

  const [serverStatus, setServerStatus] = useState({
    status: 'checking',
    hasOpenRouter: false,
    hasGemini: false,
    defaultModel: 'openai/gpt-4o-mini'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(new Date());

  // Check server health on boot
  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setServerStatus(data))
      .catch(() => setServerStatus({ status: 'offline', hasOpenRouter: false, hasGemini: false, defaultModel: 'openai/gpt-4o-mini' }));
  }, []);

  // Autosave documents
  useEffect(() => {
    setIsSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(documents));
      setLastSavedTime(new Date());
    } catch (e) {
      console.error('Failed to save documents to storage', e);
    }
    const timer = setTimeout(() => setIsSaving(false), 400);
    return () => clearTimeout(timer);
  }, [documents]);

  // Save settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  }, [settings]);

  const activeDocument = documents.find(d => d.id === activeDocId) || null;

  const createDocument = (initial: Partial<LegalDocument>): LegalDocument => {
    const newDoc: LegalDocument = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: initial.title || 'UNTITLED LEGAL DRAFT',
      type: initial.type || 'Custom Legal Document',
      jurisdiction: initial.jurisdiction || settings.defaultJurisdiction,
      currency: initial.currency || settings.defaultCurrency,
      rawRequirements: initial.rawRequirements || '',
      answers: initial.answers || {},
      draftPlan: initial.draftPlan || {
        documentTitle: initial.title || 'LEGAL AGREEMENT',
        documentType: initial.type || 'Custom Legal Document',
        parties: {
          partyOne: { role: 'First Party', description: 'Party A' },
          partyTwo: { role: 'Second Party', description: 'Party B' }
        },
        purpose: initial.rawRequirements || '',
        keyObligations: [],
        paymentTerms: '',
        duration: '',
        termination: '',
        confidentiality: '',
        intellectualProperty: '',
        liabilityAndIndemnity: '',
        disputeResolution: '',
        governingLaw: initial.jurisdiction || settings.defaultJurisdiction,
        specialClauses: []
      },
      preamble: initial.preamble || '',
      sections: initial.sections || [],
      signatures: initial.signatures || {
        partyOneLabel: 'FIRST PARTY',
        partyTwoLabel: 'SECOND PARTY',
        witnessesRequired: true
      },
      reviewAudit: initial.reviewAudit,
      versions: [
        {
          versionNumber: 1,
          timestamp: new Date().toISOString(),
          changeSummary: 'Document created and initial plan drafted',
          title: initial.title || 'UNTITLED LEGAL DRAFT',
          sections: initial.sections || []
        }
      ],
      currentVersionNumber: 1,
      status: initial.status || 'draft',
      favorite: false,
      isTrashed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: initial.tags || [initial.type || 'Draft']
    };

    setDocuments(prev => [newDoc, ...prev]);
    setActiveDocId(newDoc.id);
    return newDoc;
  };

  const updateDocument = (
    id: string,
    updates: Partial<LegalDocument>,
    createVersionSnapshot = false,
    changeSummary = 'Updated clauses'
  ) => {
    setDocuments(prev =>
      prev.map(doc => {
        if (doc.id !== id) return doc;

        let newVersions = [...doc.versions];
        let newVersionNum = doc.currentVersionNumber;

        if (createVersionSnapshot) {
          newVersionNum += 1;
          newVersions.push({
            versionNumber: newVersionNum,
            timestamp: new Date().toISOString(),
            changeSummary: changeSummary || `Version ${newVersionNum} modification`,
            title: updates.title || doc.title,
            sections: updates.sections ? JSON.parse(JSON.stringify(updates.sections)) : JSON.parse(JSON.stringify(doc.sections))
          });
        }

        return {
          ...doc,
          ...updates,
          versions: newVersions,
          currentVersionNumber: newVersionNum,
          updatedAt: new Date().toISOString()
        };
      })
    );
  };

  const deleteDocument = (id: string, permanent = false) => {
    if (permanent) {
      setDocuments(prev => prev.filter(d => d.id !== id));
      if (activeDocId === id) {
        const remaining = documents.filter(d => d.id !== id);
        setActiveDocId(remaining[0]?.id || null);
      }
    } else {
      updateDocument(id, { isTrashed: true });
    }
  };

  const restoreDocument = (id: string) => {
    updateDocument(id, { isTrashed: false });
  };

  const duplicateDocument = (id: string): LegalDocument => {
    const source = documents.find(d => d.id === id);
    if (!source) throw new Error('Source document not found');

    const duplicate: LegalDocument = {
      ...JSON.parse(JSON.stringify(source)),
      id: `doc_${Date.now()}_copy`,
      title: `${source.title} (Copy)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      versions: [
        {
          versionNumber: 1,
          timestamp: new Date().toISOString(),
          changeSummary: `Cloned from ${source.title}`,
          title: `${source.title} (Copy)`,
          sections: JSON.parse(JSON.stringify(source.sections))
        }
      ],
      currentVersionNumber: 1
    };

    setDocuments(prev => [duplicate, ...prev]);
    setActiveDocId(duplicate.id);
    return duplicate;
  };

  const toggleFavorite = (id: string) => {
    const doc = documents.find(d => d.id === id);
    if (doc) {
      updateDocument(id, { favorite: !doc.favorite });
    }
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const rollbackVersion = (docId: string, versionNumber: number) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;
    const targetVersion = doc.versions.find(v => v.versionNumber === versionNumber);
    if (!targetVersion) return;

    updateDocument(
      docId,
      {
        title: targetVersion.title,
        sections: JSON.parse(JSON.stringify(targetVersion.sections))
      },
      true,
      `Restored rollback to Version ${versionNumber}`
    );
  };

  return (
    <DocumentContext.Provider
      value={{
        documents,
        activeDocument,
        activeDocId,
        settings,
        serverStatus,
        isSaving,
        lastSavedTime,
        setActiveDocId,
        createDocument,
        updateDocument,
        deleteDocument,
        restoreDocument,
        duplicateDocument,
        toggleFavorite,
        updateSettings,
        rollbackVersion
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};
