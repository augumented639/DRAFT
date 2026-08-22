/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DocumentProvider, useDocuments } from './context/DocumentContext';
import { LegalDisclaimerBanner } from './components/LegalDisclaimerBanner';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { TemplatesView } from './components/TemplatesView';
import { DocumentWizard } from './components/Wizard/DocumentWizard';
import { DocumentEditor } from './components/Editor/DocumentEditor';
import { LegalDocument } from './types';

type ViewMode = 'dashboard' | 'wizard' | 'editor' | 'templates';

function MainAppContent() {
  const { activeDocId, setActiveDocId } = useDocuments();
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  
  // Initial parameters for wizard if triggered from template or prompt
  const [wizardInitialType, setWizardInitialType] = useState<string | undefined>(undefined);
  const [wizardInitialReq, setWizardInitialReq] = useState<string | undefined>(undefined);

  // Handlers
  const handleStartNewDraft = (initialType?: string, initialReq?: string) => {
    setWizardInitialType(initialType);
    setWizardInitialReq(initialReq);
    setCurrentView('wizard');
  };

  const handleOpenDocument = (docId: string) => {
    setActiveDocId(docId);
    setCurrentView('editor');
  };

  const handleSelectTemplate = (templateName: string) => {
    setWizardInitialType(templateName);
    setWizardInitialReq(undefined);
    setCurrentView('wizard');
  };

  const handleWizardComplete = (newDoc: LegalDocument) => {
    setActiveDocId(newDoc.id);
    setCurrentView('editor');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/60 text-slate-900 font-sans">
      {/* 1. Top Legal Disclaimer Notice */}
      <LegalDisclaimerBanner />

      {/* 2. Main Navigation Header */}
      <Header
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onStartNewDraft={() => handleStartNewDraft()}
      />

      {/* 3. Main Dynamic Content Body */}
      <main className="flex-1 pb-16">
        {currentView === 'dashboard' && (
          <DashboardView
            onStartNewDraft={(type, req) => handleStartNewDraft(type, req)}
            onOpenDocument={handleOpenDocument}
            onBrowseTemplates={() => setCurrentView('templates')}
          />
        )}

        {currentView === 'templates' && (
          <TemplatesView
            onSelectTemplate={handleSelectTemplate}
            onOpenAdvisor={() => handleStartNewDraft()}
          />
        )}

        {currentView === 'wizard' && (
          <DocumentWizard
            initialDocumentType={wizardInitialType}
            initialRequirements={wizardInitialReq}
            onCancel={() => setCurrentView('dashboard')}
            onComplete={handleWizardComplete}
          />
        )}

        {currentView === 'editor' && activeDocId && (
          <DocumentEditor
            documentId={activeDocId}
            onBack={() => setCurrentView('dashboard')}
          />
        )}
      </main>

      {/* Persistent Legal Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left space-y-1">
            <span className="font-semibold text-slate-200">JurisDraft AI Legal Tech Platform</span>
            <p className="text-[11px] text-slate-500">
              AI-assisted legal draft planning, clarification interview synthesis, and precision clause generation.
            </p>
          </div>
          <div className="text-[11px] text-slate-500 text-center sm:text-right">
            <span>Informational legal drafting assistance. Not a substitute for licensed legal counsel.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <DocumentProvider>
      <MainAppContent />
    </DocumentProvider>
  );
}
