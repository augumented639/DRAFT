import React, { useState } from 'react';
import { Scale, Plus, FileText, LayoutDashboard, Layers, Settings, CheckCircle2, RefreshCw, Sparkles } from 'lucide-react';
import { useDocuments } from '../context/DocumentContext';
import { SettingsModal } from './SettingsModal';

interface HeaderProps {
  currentView: 'dashboard' | 'wizard' | 'editor' | 'templates';
  onNavigate: (view: 'dashboard' | 'wizard' | 'editor' | 'templates') => void;
  onStartNewDraft: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, onStartNewDraft }) => {
  const { activeDocument, isSaving, lastSavedTime, settings, serverStatus } = useDocuments();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40" id="main-app-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-indigo-700 flex items-center justify-center shadow-md shadow-blue-500/20 text-white">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">JurisDraft</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-600/90 text-blue-100">
                  AI Legal Tech
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium leading-none">Draft Planning & Document Generator</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700/60 text-xs">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                currentView === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
            </button>

            <button
              onClick={() => onNavigate('templates')}
              className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                currentView === 'templates'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Templates
            </button>

            {activeDocument && (
              <button
                onClick={() => onNavigate('editor')}
                className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors cursor-pointer max-w-[200px] truncate ${
                  currentView === 'editor'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
                title={activeDocument.title}
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{activeDocument.title || 'Document Editor'}</span>
              </button>
            )}
          </nav>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-3">
            {/* Autosave Pill */}
            <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-800/50 px-2.5 py-1 rounded-full border border-slate-700/50">
              {isSaving ? (
                <>
                  <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
                  <span>Autosaving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>All drafts saved</span>
                </>
              )}
            </div>

            {/* AI Model Badge */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="Open AI Engine settings"
            >
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span className="max-w-[110px] truncate">
                {settings.openRouterModel.split('/').pop()}
              </span>
            </button>

            {/* Settings Trigger */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Settings & API Key"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Main CTA: Create Legal Document */}
            <button
              onClick={onStartNewDraft}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
              id="header-create-doc-btn"
            >
              <Plus className="w-4 h-4" />
              <span>Create Legal Document</span>
            </button>
          </div>
        </div>
      </header>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};
