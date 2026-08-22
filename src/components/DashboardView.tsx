import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, FileText, Star, Trash2, Copy, Download, Clock, ShieldCheck, 
  ExternalLink, Sparkles, Filter, AlertTriangle, CheckCircle2, ChevronRight, Layers, ArrowUpRight
} from 'lucide-react';
import { useDocuments } from '../context/DocumentContext';
import { LegalDocument } from '../types';
import { DOCUMENT_TEMPLATES, SAMPLE_PROMPTS } from '../data/templates';
import { exportToDocx, exportToPdf, exportToTxt } from '../utils/exportDoc';

interface DashboardViewProps {
  onStartNewDraft: (initialCategory?: string, initialRequirement?: string) => void;
  onOpenDocument: (docId: string) => void;
  onBrowseTemplates: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onStartNewDraft,
  onOpenDocument,
  onBrowseTemplates
}) => {
  const { documents, deleteDocument, restoreDocument, duplicateDocument, toggleFavorite } = useDocuments();
  const [activeTab, setActiveTab] = useState<'all' | 'drafts' | 'reviewed' | 'favorites' | 'trash'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');
  const [exportModalDoc, setExportModalDoc] = useState<LegalDocument | null>(null);

  // Filter documents
  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      // Trash filter
      if (activeTab === 'trash') {
        if (!doc.isTrashed) return false;
      } else {
        if (doc.isTrashed) return false;
      }

      // Tab filter
      if (activeTab === 'drafts' && doc.status !== 'draft' && doc.status !== 'plan_ready') return false;
      if (activeTab === 'reviewed' && doc.status !== 'reviewed' && doc.status !== 'finalized') return false;
      if (activeTab === 'favorites' && !doc.favorite) return false;

      // Type filter
      if (selectedTypeFilter !== 'ALL' && doc.type !== selectedTypeFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = doc.title.toLowerCase().includes(q);
        const matchType = doc.type.toLowerCase().includes(q);
        const matchJurisdiction = (doc.jurisdiction || '').toLowerCase().includes(q);
        const matchReq = (doc.rawRequirements || '').toLowerCase().includes(q);
        if (!matchTitle && !matchType && !matchJurisdiction && !matchReq) return false;
      }

      return true;
    });
  }, [documents, activeTab, selectedTypeFilter, searchQuery]);

  const stats = useMemo(() => {
    const active = documents.filter(d => !d.isTrashed);
    return {
      total: active.length,
      reviewed: active.filter(d => d.status === 'reviewed' || d.status === 'finalized').length,
      drafts: active.filter(d => d.status === 'draft' || d.status === 'plan_ready').length,
      favorites: active.filter(d => d.favorite).length,
      templatesCount: DOCUMENT_TEMPLATES.length
    };
  }, [documents]);

  const handleExport = async (format: 'docx' | 'pdf' | 'txt', doc: LegalDocument) => {
    if (format === 'docx') await exportToDocx(doc);
    else if (format === 'pdf') exportToPdf(doc);
    else exportToTxt(doc);
    setExportModalDoc(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6" id="dashboard-view">
      {/* Top Hero Banner */}
      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-linear-to-l from-blue-600/10 to-transparent pointer-events-none" />
        
        <div className="max-w-2xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium border border-blue-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Workflow-Driven Legal Intelligence</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Plan, Clarify, & Draft Precision Legal Documents
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Describe what you need in plain words. Our legal intake engine identifies missing terms, conducts targeted clarification interviews, creates structured draft plans, and generates customized contracts.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onStartNewDraft()}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer"
              id="dashboard-start-new-draft-btn"
            >
              <Plus className="w-4 h-4" />
              <span>Start New Draft Plan</span>
            </button>

            <button
              onClick={onBrowseTemplates}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Explore 18+ Templates</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-700/60 text-xs">
          <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/40">
            <span className="text-slate-400 block text-[11px]">Total Documents</span>
            <span className="text-xl font-bold text-white">{stats.total}</span>
          </div>
          <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/40">
            <span className="text-slate-400 block text-[11px]">Audited / Reviewed</span>
            <span className="text-xl font-bold text-emerald-400">{stats.reviewed}</span>
          </div>
          <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/40">
            <span className="text-slate-400 block text-[11px]">Active Drafts</span>
            <span className="text-xl font-bold text-amber-400">{stats.drafts}</span>
          </div>
          <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/40">
            <span className="text-slate-400 block text-[11px]">Legal Presets</span>
            <span className="text-xl font-bold text-blue-400">{stats.templatesCount} Types</span>
          </div>
        </div>
      </div>

      {/* Quick Prompt Starters */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Instant Starters: Describe your requirement in natural language</span>
          </div>
          <span className="text-[11px] text-slate-500">Click to start drafting immediately</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {SAMPLE_PROMPTS.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => onStartNewDraft(sample.type, sample.text)}
              className="text-left p-3 bg-white hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 rounded-lg text-xs transition-all group shadow-2xs hover:shadow-xs flex flex-col justify-between cursor-pointer"
            >
              <div>
                <span className="font-semibold text-slate-900 group-hover:text-blue-700 block mb-1">
                  {sample.title}
                </span>
                <p className="text-slate-600 line-clamp-2 text-[11px] leading-relaxed">
                  "{sample.text}"
                </p>
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-100">
                <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">{sample.type}</span>
                <ArrowUpRight className="w-3 h-3 text-blue-600 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Documents Hub */}
      <div className="space-y-4">
        {/* Navigation Tabs & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              All Documents ({documents.filter(d => !d.isTrashed).length})
            </button>

            <button
              onClick={() => setActiveTab('drafts')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'drafts'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Drafts ({stats.drafts})
            </button>

            <button
              onClick={() => setActiveTab('reviewed')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'reviewed'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Reviewed ({stats.reviewed})
            </button>

            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'favorites'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-400" />
              Favorites ({stats.favorites})
            </button>

            <button
              onClick={() => setActiveTab('trash')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'trash'
                  ? 'bg-rose-900 text-white'
                  : 'text-slate-500 hover:text-rose-700 hover:bg-rose-50'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Trash ({documents.filter(d => d.isTrashed).length})
            </button>
          </div>

          {/* Search & Type Filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search documents, clauses, terms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-700"
            >
              <option value="ALL">All Types</option>
              {DOCUMENT_TEMPLATES.map(t => (
                <option key={t.id} value={t.name}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Documents Grid / Empty State */}
        {filteredDocs.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">No documents found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? `No agreements match your search "${searchQuery}". Try a different keyword.`
                  : activeTab === 'trash'
                  ? 'Your trash is currently empty.'
                  : 'Start drafting your first legal agreement with guided clarification and planning.'}
              </p>
            </div>
            {activeTab !== 'trash' && (
              <button
                onClick={() => onStartNewDraft()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Create New Document
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="bg-white border border-slate-200/90 hover:border-blue-400 rounded-xl p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group relative"
                id={`doc-card-${doc.id}`}
              >
                <div>
                  {/* Top Bar: Type, Version & Favorite */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 truncate max-w-[180px]">
                      {doc.type}
                    </span>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        v{doc.currentVersionNumber || 1}
                      </span>
                      {!doc.isTrashed && (
                        <button
                          onClick={() => toggleFavorite(doc.id)}
                          className={`p-1 rounded-full transition-colors cursor-pointer ${
                            doc.favorite ? 'text-amber-500 hover:text-amber-600' : 'text-slate-300 hover:text-slate-500'
                          }`}
                          title={doc.favorite ? 'Remove favorite' : 'Add to favorites'}
                        >
                          <Star className={`w-3.5 h-3.5 ${doc.favorite ? 'fill-amber-400' : ''}`} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title & Click to Open */}
                  <h3
                    onClick={() => !doc.isTrashed && onOpenDocument(doc.id)}
                    className="font-bold text-sm text-slate-900 hover:text-blue-600 cursor-pointer line-clamp-2 leading-snug transition-colors"
                  >
                    {doc.title}
                  </h3>

                  {/* Jurisdiction & Summary */}
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <span className="font-medium text-slate-600">Jurisdiction:</span>
                    <span className="truncate">{doc.jurisdiction || 'General'}</span>
                  </p>

                  {doc.rawRequirements && (
                    <p className="text-[11px] text-slate-600 mt-2 line-clamp-2 bg-slate-50 p-2 rounded border border-slate-100 italic">
                      "{doc.rawRequirements}"
                    </p>
                  )}

                  {/* Review Audit Indicator */}
                  {doc.reviewAudit && (
                    <div className="mt-3 flex items-center justify-between text-[11px] bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-200">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>AI Legal Audit:</span>
                      </div>
                      <span className="font-semibold text-emerald-700">
                        Score {doc.reviewAudit.summaryScore}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Footer: Metadata & Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(doc.updatedAt || doc.createdAt).toLocaleDateString()}
                  </span>

                  {doc.isTrashed ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => restoreDocument(doc.id)}
                        className="px-2 py-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded cursor-pointer"
                      >
                        Restore
                      </button>
                      <button
                        onClick={() => deleteDocument(doc.id, true)}
                        className="px-2 py-1 text-[11px] font-medium bg-rose-50 text-rose-700 hover:bg-rose-100 rounded cursor-pointer"
                      >
                        Permanent Delete
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setExportModalDoc(doc)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                        title="Export document (Word, PDF, TXT)"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => duplicateDocument(doc.id)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                        title="Duplicate document"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => deleteDocument(doc.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                        title="Move to trash"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onOpenDocument(doc.id)}
                        className="ml-1 px-2.5 py-1 bg-slate-900 hover:bg-blue-600 text-white rounded text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>Open</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Export Modal */}
      {exportModalDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <h3 className="text-base font-bold text-slate-900">Export Legal Document</h3>
              <p className="text-xs text-slate-500 mt-1">
                Choose format for <strong>{exportModalDoc.title}</strong>
              </p>
            </div>

            {/* Disclaimer reminder */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[11px] text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                This document is an AI-generated draft. Review all information carefully and consult a qualified legal professional when appropriate.
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <button
                onClick={() => handleExport('docx', exportModalDoc)}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-xs font-semibold text-slate-800 cursor-pointer"
              >
                <div className="w-8 h-8 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  W
                </div>
                <span>Word (.docx)</span>
              </button>

              <button
                onClick={() => handleExport('pdf', exportModalDoc)}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border border-slate-200 hover:border-rose-500 hover:bg-rose-50/50 transition-all text-xs font-semibold text-slate-800 cursor-pointer"
              >
                <div className="w-8 h-8 rounded bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  PDF
                </div>
                <span>PDF (.pdf)</span>
              </button>

              <button
                onClick={() => handleExport('txt', exportModalDoc)}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border border-slate-200 hover:border-slate-500 hover:bg-slate-50 transition-all text-xs font-semibold text-slate-800 cursor-pointer"
              >
                <div className="w-8 h-8 rounded bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                  TXT
                </div>
                <span>Plain Text</span>
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setExportModalDoc(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
