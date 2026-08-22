import React, { useState, useMemo } from 'react';
import { 
  FileText, ShieldAlert, Sparkles, Download, Printer, Copy, Star, Trash2, 
  RotateCcw, History, MessageSquare, Plus, Check, Edit2, Search, ArrowLeft, 
  HelpCircle, CheckCircle2, AlertTriangle, ChevronDown, ChevronRight, X, 
  Eye, RefreshCw, Layers, Calendar, Scale
} from 'lucide-react';
import { useDocuments } from '../../context/DocumentContext';
import { LegalDocument, DocumentSection, LegalReviewItem, DocumentComment } from '../../types';
import { exportToDocx, exportToPdf, exportToTxt } from '../../utils/exportDoc';
import { callClauseAssistant, fetchLegalReview } from '../../utils/api';

interface DocumentEditorProps {
  documentId: string;
  onBack: () => void;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({ documentId, onBack }) => {
  const { 
    documents, 
    updateDocument, 
    duplicateDocument, 
    deleteDocument, 
    toggleFavorite, 
    rollbackVersion,
    settings 
  } = useDocuments();

  const doc = documents.find(d => d.id === documentId);

  // Active Tab: 'editor' | 'review' | 'plan' | 'versions' | 'obligations'
  const [activeTab, setActiveTab] = useState<'editor' | 'review' | 'plan' | 'versions' | 'obligations'>('editor');
  
  // Section currently being edited or running AI on
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(doc?.title || '');
  
  // AI Clause Assistant Modal / Drawer
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [assistantTargetSection, setAssistantTargetSection] = useState<DocumentSection | null>(null);
  const [assistantAction, setAssistantAction] = useState<'explain' | 'simplify' | 'make_specific' | 'add_custom' | 'rewrite'>('explain');
  const [assistantInstruction, setAssistantInstruction] = useState('');
  const [assistantResult, setAssistantResult] = useState<{ revisedText?: string; explanation?: string; risksMitigated?: string[] } | null>(null);
  const [isAssistantLoading, setIsAssistantLoading] = useState(false);

  // Search & Replace within doc
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [showSearchReplace, setShowSearchReplace] = useState(false);

  // Export confirmation modal
  const [showExportModal, setShowExportModal] = useState(false);

  // New Clause Modal
  const [showNewClauseModal, setShowNewClauseModal] = useState(false);
  const [newClauseHeading, setNewClauseHeading] = useState('');
  const [newClauseContent, setNewClauseContent] = useState('');

  // Comment input
  const [commentInput, setCommentInput] = useState('');
  const [commentingSectionId, setCommentingSectionId] = useState<string | null>(null);

  // Version Comparison
  const [compareVersionNum, setCompareVersionNum] = useState<number | null>(null);

  // Re-run legal review audit
  const [isReviewing, setIsReviewing] = useState(false);

  if (!doc) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Document Not Found</h2>
        <p className="text-xs text-slate-500">The requested agreement does not exist or was deleted.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Handle section text change
  const handleSectionTextChange = (sectionId: string, newContent: string) => {
    const updatedSections = doc.sections.map(sec => 
      sec.id === sectionId ? { ...sec, content: newContent } : sec
    );
    updateDocument(doc.id, { sections: updatedSections });
  };

  // Handle section heading change
  const handleSectionHeadingChange = (sectionId: string, newHeading: string) => {
    const updatedSections = doc.sections.map(sec => 
      sec.id === sectionId ? { ...sec, heading: newHeading } : sec
    );
    updateDocument(doc.id, { sections: updatedSections });
  };

  // Delete section
  const handleDeleteSection = (sectionId: string) => {
    const updatedSections = doc.sections.filter(sec => sec.id !== sectionId);
    updateDocument(doc.id, { sections: updatedSections }, true, 'Deleted a section');
  };

  // Add new custom section
  const handleAddNewSection = () => {
    if (!newClauseHeading.trim()) return;
    const newSec: DocumentSection = {
      id: `sec_${Date.now()}`,
      clauseNumber: `${doc.sections.length + 1}`,
      heading: newClauseHeading.toUpperCase(),
      content: newClauseContent.trim() || 'The parties agree as follows: [Insert custom stipulations].',
      isCustom: true
    };
    updateDocument(doc.id, { sections: [...doc.sections, newSec] }, true, `Added clause: ${newClauseHeading}`);
    setShowNewClauseModal(false);
    setNewClauseHeading('');
    setNewClauseContent('');
  };

  // Save Title
  const handleSaveTitle = () => {
    if (titleInput.trim()) {
      updateDocument(doc.id, { title: titleInput.trim() });
    }
    setEditingTitle(false);
  };

  // Run AI Clause Assistant
  const handleExecuteAssistant = async (action: 'explain' | 'simplify' | 'make_specific' | 'add_custom' | 'rewrite', section?: DocumentSection) => {
    const target = section || assistantTargetSection;
    if (!target) return;

    setAssistantTargetSection(target);
    setAssistantAction(action);
    setAiAssistantOpen(true);
    setIsAssistantLoading(true);
    setAssistantResult(null);

    try {
      const res = await callClauseAssistant(
        action,
        target.content,
        target.heading,
        assistantInstruction,
        doc.jurisdiction,
        settings
      );
      setAssistantResult(res);
    } catch (err: any) {
      console.error('AI assistant error', err);
    } finally {
      setIsAssistantLoading(false);
    }
  };

  // Apply AI assistant rewritten clause
  const handleApplyAssistantRevision = () => {
    if (assistantTargetSection && assistantResult?.revisedText) {
      handleSectionTextChange(assistantTargetSection.id, assistantResult.revisedText);
      updateDocument(doc.id, {}, true, `AI Assistant: ${assistantAction} for ${assistantTargetSection.heading}`);
      setAiAssistantOpen(false);
      setAssistantResult(null);
    }
  };

  // Search & Replace in all sections
  const handleExecuteReplace = () => {
    if (!searchTerm) return;
    const updatedSections = doc.sections.map(sec => ({
      ...sec,
      content: sec.content.replaceAll(searchTerm, replaceTerm)
    }));
    updateDocument(doc.id, { sections: updatedSections }, true, `Replaced "${searchTerm}" with "${replaceTerm}"`);
    setShowSearchReplace(false);
    setSearchTerm('');
    setReplaceTerm('');
  };

  // Add Comment to section
  const handleAddComment = (sectionId: string) => {
    if (!commentInput.trim()) return;
    const newComment: DocumentComment = {
      id: `comm_${Date.now()}`,
      author: settings.userName || 'Legal Reviewer',
      text: commentInput.trim(),
      createdAt: new Date().toISOString()
    };
    const updatedSections = doc.sections.map(sec => {
      if (sec.id !== sectionId) return sec;
      return {
        ...sec,
        comments: [...(sec.comments || []), newComment]
      };
    });
    updateDocument(doc.id, { sections: updatedSections });
    setCommentInput('');
    setCommentingSectionId(null);
  };

  // Re-run full legal review audit
  const handleReRunReview = async () => {
    setIsReviewing(true);
    try {
      const audit = await fetchLegalReview(doc, doc.type, doc.jurisdiction, doc.draftPlan, settings);
      updateDocument(doc.id, { reviewAudit: audit, status: 'reviewed' });
      setActiveTab('review');
    } catch (e) {
      console.error(e);
    } finally {
      setIsReviewing(false);
    }
  };

  // Apply Audit Item Suggestion
  const handleApplyAuditSuggestion = (item: LegalReviewItem) => {
    // Append or refine section based on item.clauseRef
    const newClause: DocumentSection = {
      id: `sec_audit_${Date.now()}`,
      clauseNumber: `${doc.sections.length + 1}`,
      heading: item.title.toUpperCase(),
      content: `${item.suggestion}\n\n[Addressed Legal Audit Issue: ${item.description}]`,
      isCustom: true
    };
    updateDocument(doc.id, { sections: [...doc.sections, newClause] }, true, `Applied Audit Suggestion: ${item.title}`);
  };

  // Extract Key Obligations & Critical Dates for Summary Tab
  const extractedAnalysis = useMemo(() => {
    const obligations: string[] = [];
    const dates: string[] = [];

    // Extract lines containing shall, will, must, or dates
    doc.sections.forEach(sec => {
      const lines = sec.content.split('\n');
      lines.forEach(l => {
        const line = l.trim();
        if (line.includes('shall ') || line.includes('agrees to ') || line.includes('covenants to ')) {
          if (line.length > 20 && line.length < 240) {
            obligations.push(line);
          }
        }
        if (line.match(/\b(days|months|years|calendar month|notice|term|expiration|commencement)\b/i)) {
          if (line.length > 20 && line.length < 240) {
            dates.push(line);
          }
        }
      });
    });

    return {
      obligations: obligations.slice(0, 8),
      dates: dates.slice(0, 6)
    };
  }, [doc]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6" id="document-editor-container">
      {/* Top Document Control Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Back & Document Title */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={onBack}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex-1 min-w-0">
              {editingTitle ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    className="w-full px-2.5 py-1 text-sm font-bold text-slate-900 border border-blue-500 rounded-md focus:outline-hidden"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveTitle}
                    className="px-2.5 py-1 bg-blue-600 text-white rounded text-xs font-semibold cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => { setEditingTitle(true); setTitleInput(doc.title); }}>
                  <h1 className="text-base font-bold text-slate-900 truncate">
                    {doc.title}
                  </h1>
                  <Edit2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
                </div>
              )}

              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                <span className="font-medium text-blue-700 bg-blue-50 px-2 py-0.2 rounded font-mono">
                  {doc.type}
                </span>
                <span>•</span>
                <span>Jurisdiction: <strong>{doc.jurisdiction || 'General'}</strong></span>
                <span>•</span>
                <span>Version <strong>v{doc.currentVersionNumber}</strong></span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={() => setShowSearchReplace(!showSearchReplace)}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Find and replace text in document"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Find & Replace</span>
            </button>

            <button
              onClick={() => handleReRunReview()}
              disabled={isReviewing}
              className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {isReviewing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
              )}
              <span>AI Legal Audit</span>
            </button>

            <button
              onClick={() => setShowExportModal(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Document</span>
            </button>
          </div>
        </div>

        {/* Find & Replace Bar */}
        {showSearchReplace && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center gap-2 text-xs">
            <input
              type="text"
              placeholder="Find text..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-1.5 border border-slate-300 rounded bg-white w-40"
            />
            <input
              type="text"
              placeholder="Replace with..."
              value={replaceTerm}
              onChange={(e) => setReplaceTerm(e.target.value)}
              className="p-1.5 border border-slate-300 rounded bg-white w-40"
            />
            <button
              onClick={handleExecuteReplace}
              className="px-3 py-1.5 bg-slate-900 text-white rounded font-semibold hover:bg-blue-600 cursor-pointer"
            >
              Replace All
            </button>
            <button
              onClick={() => setShowSearchReplace(false)}
              className="p-1.5 text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'editor' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Document Editor ({doc.sections.length} Clauses)</span>
          </button>

          <button
            onClick={() => setActiveTab('review')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'review' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Legal Audit {doc.reviewAudit ? `(${doc.reviewAudit.items.length} findings)` : ''}</span>
          </button>

          <button
            onClick={() => setActiveTab('obligations')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'obligations' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            <span>Obligations & Dates Summary</span>
          </button>

          <button
            onClick={() => setActiveTab('plan')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'plan' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Draft Plan Blueprint</span>
          </button>

          <button
            onClick={() => setActiveTab('versions')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'versions' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Version History ({doc.versions.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MAIN CLAUSE-BY-CLAUSE DOCUMENT EDITOR */}
      {/* ========================================================================= */}
      {activeTab === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Document Paper Sheet */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm space-y-6 min-h-[700px]">
              {/* Document Header & Title */}
              <div className="text-center pb-6 border-b border-slate-200 space-y-2">
                <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">
                  Jurisdiction: {doc.jurisdiction || 'General'}
                </span>
                <h2 className="text-xl font-serif font-bold text-slate-950 uppercase tracking-wide">
                  {doc.title}
                </h2>
              </div>

              {/* Preamble */}
              {doc.preamble && (
                <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-100">
                  <textarea
                    rows={3}
                    value={doc.preamble}
                    onChange={(e) => updateDocument(doc.id, { preamble: e.target.value })}
                    className="w-full bg-transparent text-xs text-slate-800 leading-relaxed font-serif resize-y focus:outline-hidden focus:bg-white focus:p-2 focus:border focus:border-blue-300 rounded"
                    placeholder="Enter preamble and recitals..."
                  />
                </div>
              )}

              {/* Sections List */}
              <div className="space-y-6">
                {doc.sections.map((section, idx) => (
                  <div
                    key={section.id}
                    className="group border border-transparent hover:border-slate-200 hover:bg-slate-50/40 p-4 rounded-xl transition-all relative"
                  >
                    {/* Section Heading & Clause Number */}
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                          {section.clauseNumber || idx + 1}
                        </span>
                        <input
                          type="text"
                          value={section.heading}
                          onChange={(e) => handleSectionHeadingChange(section.id, e.target.value)}
                          className="font-serif font-bold text-xs text-slate-900 uppercase tracking-wide bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-hidden w-full"
                        />
                      </div>

                      {/* AI Clause Action Pills */}
                      <div className="opacity-80 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                        <button
                          onClick={() => handleExecuteAssistant('explain', section)}
                          className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded transition-colors cursor-pointer flex items-center gap-1"
                          title="Explain in plain English"
                        >
                          <HelpCircle className="w-3 h-3 text-blue-600" />
                          <span>Explain</span>
                        </button>

                        <button
                          onClick={() => handleExecuteAssistant('simplify', section)}
                          className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800 rounded transition-colors cursor-pointer"
                          title="Rewrite in simpler plain language"
                        >
                          Simplify
                        </button>

                        <button
                          onClick={() => handleExecuteAssistant('make_specific', section)}
                          className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-800 rounded transition-colors cursor-pointer"
                          title="Add explicit timelines, caps, and strict remedies"
                        >
                          Make Strict
                        </button>

                        <button
                          onClick={() => handleDeleteSection(section.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                          title="Delete clause"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Section Text Editor */}
                    <textarea
                      rows={Math.max(3, Math.ceil(section.content.length / 80))}
                      value={section.content}
                      onChange={(e) => handleSectionTextChange(section.id, e.target.value)}
                      className="w-full p-2 bg-transparent text-xs text-slate-800 leading-relaxed font-serif resize-y focus:outline-hidden focus:bg-white focus:p-2.5 focus:border focus:border-blue-400 rounded-lg"
                    />

                    {/* Comments on this section */}
                    {section.comments && section.comments.length > 0 && (
                      <div className="mt-2 space-y-1 bg-amber-50/70 border border-amber-200 rounded-lg p-2.5 text-[11px]">
                        <span className="font-semibold text-amber-900 block">Comments & Notes:</span>
                        {section.comments.map(comm => (
                          <div key={comm.id} className="text-amber-950 flex items-start gap-1">
                            <span className="font-medium text-amber-800">{comm.author}:</span>
                            <span>{comm.text}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Comment Row */}
                    {commentingSectionId === section.id ? (
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Add comment on this clause..."
                          value={commentInput}
                          onChange={(e) => setCommentInput(e.target.value)}
                          className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white"
                          autoFocus
                        />
                        <button
                          onClick={() => handleAddComment(section.id)}
                          className="px-2.5 py-1 bg-blue-600 text-white rounded text-xs font-semibold"
                        >
                          Post
                        </button>
                        <button
                          onClick={() => setCommentingSectionId(null)}
                          className="text-xs text-slate-500"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setCommentingSectionId(section.id)}
                        className="text-[10px] text-slate-400 hover:text-slate-700 flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Add Margin Comment</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add New Section Button */}
              <div className="pt-4 border-t border-slate-200 text-center">
                <button
                  onClick={() => setShowNewClauseModal(true)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-blue-600" />
                  <span>Add New Custom Clause</span>
                </button>
              </div>

              {/* Execution & Signatures Block */}
              <div className="mt-8 pt-6 border-t-2 border-slate-200 space-y-4">
                <p className="text-xs italic text-slate-600 font-serif">
                  IN WITNESS WHEREOF, the Parties hereto have caused this {doc.title} to be executed by their duly authorized representatives.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                  <div className="border-t border-slate-400 pt-3 space-y-1 font-serif text-xs">
                    <span className="font-bold block text-slate-900">
                      {doc.signatures?.partyOneLabel || doc.draftPlan.parties.partyOne.role}
                    </span>
                    <p className="text-slate-500">Authorized Signature: __________________</p>
                    <p className="text-slate-500">Name: {settings.userName || 'Authorized Signatory'}</p>
                    <p className="text-slate-500">Date: ____ / ____ / ________</p>
                  </div>

                  <div className="border-t border-slate-400 pt-3 space-y-1 font-serif text-xs">
                    <span className="font-bold block text-slate-900">
                      {doc.signatures?.partyTwoLabel || doc.draftPlan.parties.partyTwo.role}
                    </span>
                    <p className="text-slate-500">Authorized Signature: __________________</p>
                    <p className="text-slate-500">Name: _______________________________</p>
                    <p className="text-slate-500">Date: ____ / ____ / ________</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick AI Review & Guidance Sidebar */}
          <div className="space-y-4">
            {/* Review Summary Widget */}
            {doc.reviewAudit && (
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <ShieldAlert className="w-4 h-4 text-indigo-600" />
                    <span>AI Legal Audit Score</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {doc.reviewAudit.summaryScore}%
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {doc.reviewAudit.overallAssessment}
                </p>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {doc.reviewAudit.items.slice(0, 3).map(item => (
                    <div key={item.id} className="p-2 bg-slate-50 rounded-lg text-[11px] space-y-1 border border-slate-100">
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded inline-block ${
                        item.category === 'Needs Attention' ? 'bg-amber-100 text-amber-900' :
                        item.category === 'Potential Issue' ? 'bg-rose-100 text-rose-900' :
                        item.category === 'Missing Information' ? 'bg-blue-100 text-blue-900' :
                        'bg-purple-100 text-purple-900'
                      }`}>
                        {item.category}
                      </span>
                      <span className="font-semibold text-slate-900 block">{item.title}</span>
                      <p className="text-slate-500 text-[10px] line-clamp-2">{item.suggestion}</p>
                    </div>
                  ))}

                  <button
                    onClick={() => setActiveTab('review')}
                    className="w-full mt-1 py-1.5 text-center text-xs text-blue-600 font-semibold hover:underline block"
                  >
                    View All {doc.reviewAudit.items.length} Audit Findings &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* Quick Actions Panel */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
              <span className="font-bold text-slate-900 block">Draft Utilities</span>
              
              <button
                onClick={() => handleExecuteAssistant('add_custom', doc.sections[0])}
                className="w-full p-2 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-left text-slate-800 font-medium flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>AI Add Missing Clause</span>
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              </button>

              <button
                onClick={() => duplicateDocument(doc.id)}
                className="w-full p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-left text-slate-800 font-medium flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Create Duplicate Draft</span>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                onClick={() => toggleFavorite(doc.id)}
                className="w-full p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-left text-slate-800 font-medium flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>{doc.favorite ? 'Remove Favorite' : 'Save to Favorites'}</span>
                <Star className={`w-3.5 h-3.5 ${doc.favorite ? 'text-amber-500 fill-amber-400' : 'text-slate-400'}`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: AI LEGAL REVIEW AUDIT */}
      {/* ========================================================================= */}
      {activeTab === 'review' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900">AI Legal Review & Risk Audit</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated check for missing information, statutory requirements, potential ambiguities, and clauses needing lawyer review.
              </p>
            </div>

            <button
              onClick={handleReRunReview}
              disabled={isReviewing}
              className="px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isReviewing ? 'animate-spin' : ''}`} />
              <span>Re-analyze Document</span>
            </button>
          </div>

          {/* Audit Score Banner */}
          {doc.reviewAudit && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 max-w-xl">
                <span className="text-xs font-bold text-slate-900 block">Overall Assessment:</span>
                <p className="text-xs text-slate-600 leading-relaxed">{doc.reviewAudit.overallAssessment}</p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200 text-center shrink-0">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Draft Readiness</span>
                <span className="text-2xl font-bold text-emerald-600">{doc.reviewAudit.summaryScore}%</span>
              </div>
            </div>
          )}

          {/* Findings List */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Audit Findings & Clarifications</h3>

            {doc.reviewAudit?.items.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border space-y-2 transition-all ${
                  item.category === 'Needs Attention'
                    ? 'bg-amber-50/50 border-amber-200'
                    : item.category === 'Potential Issue'
                    ? 'bg-rose-50/50 border-rose-200'
                    : item.category === 'Missing Information'
                    ? 'bg-blue-50/50 border-blue-200'
                    : 'bg-purple-50/50 border-purple-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        item.category === 'Needs Attention'
                          ? 'bg-amber-100 text-amber-900'
                          : item.category === 'Potential Issue'
                          ? 'bg-rose-100 text-rose-900'
                          : item.category === 'Missing Information'
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-purple-100 text-purple-900'
                      }`}
                    >
                      {item.category}
                    </span>
                    <span className="text-xs font-mono text-slate-500">{item.clauseRef}</span>
                  </div>

                  <span className={`text-[10px] font-semibold uppercase ${
                    item.severity === 'high' ? 'text-rose-700 font-bold' : 'text-slate-600'
                  }`}>
                    Severity: {item.severity}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                <p className="text-xs text-slate-700 leading-relaxed">{item.description}</p>

                <div className="bg-white/80 p-3 rounded-lg border border-slate-200/80 text-xs space-y-1">
                  <span className="font-semibold text-slate-900 block">Recommended Action:</span>
                  <p className="text-slate-600 text-[11px]">{item.suggestion}</p>
                </div>

                <div className="pt-1 flex justify-end">
                  <button
                    onClick={() => handleApplyAuditSuggestion(item)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Apply Suggestion to Agreement &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Statutory Guidance */}
          {doc.reviewAudit?.statutoryNotices && doc.reviewAudit.statutoryNotices.length > 0 && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1">
              <span className="font-bold text-slate-900 block">Statutory & Registration Guidance:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                {doc.reviewAudit.statutoryNotices.map((sn, i) => (
                  <li key={i}>{sn}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: OBLIGATIONS & CRITICAL DATES SUMMARY */}
      {/* ========================================================================= */}
      {activeTab === 'obligations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">Key Contractual Obligations</h3>
            </div>
            <p className="text-xs text-slate-500">
              Core operative covenants extracted from current agreement clauses:
            </p>

            <div className="space-y-2">
              {extractedAnalysis.obligations.length > 0 ? (
                extractedAnalysis.obligations.map((ob, i) => (
                  <div key={i} className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg text-xs text-slate-800 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>{ob}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No explicit shall/will obligations extracted.</p>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Important Dates & Timelines</h3>
            </div>
            <p className="text-xs text-slate-500">
              Notice windows, commencement timelines, lock-in terms, and cure periods:
            </p>

            <div className="space-y-2">
              {extractedAnalysis.dates.length > 0 ? (
                extractedAnalysis.dates.map((dt, i) => (
                  <div key={i} className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg text-xs text-slate-800 flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span>{dt}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No timeline triggers found.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: DRAFT PLAN BLUEPRINT VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'plan' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Approved Draft Plan Blueprint</h3>
              <p className="text-xs text-slate-500">Underlying structure and parties defined during the interview phase</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="font-bold text-blue-900">First Party ({doc.draftPlan.parties.partyOne.role}):</span>
              <p className="text-slate-700">{doc.draftPlan.parties.partyOne.description}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="font-bold text-indigo-900">Second Party ({doc.draftPlan.parties.partyTwo.role}):</span>
              <p className="text-slate-700">{doc.draftPlan.parties.partyTwo.description}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1 sm:col-span-2">
              <span className="font-bold text-slate-900">Purpose:</span>
              <p className="text-slate-700">{doc.draftPlan.purpose}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900">Payment Terms:</span>
              <p className="text-slate-700">{doc.draftPlan.paymentTerms}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900">Duration & Termination:</span>
              <p className="text-slate-700">{doc.draftPlan.duration} • {doc.draftPlan.termination}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900">Dispute Resolution:</span>
              <p className="text-slate-700">{doc.draftPlan.disputeResolution}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900">Governing Law:</span>
              <p className="text-slate-700">{doc.draftPlan.governingLaw}</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: VERSION HISTORY & ROLLBACK */}
      {/* ========================================================================= */}
      {activeTab === 'versions' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Document Version History</h3>
              <p className="text-xs text-slate-500">Every major edit creates an immutable snapshot with instant rollback</p>
            </div>
          </div>

          <div className="space-y-3">
            {doc.versions.map((ver) => (
              <div
                key={ver.versionNumber}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded text-[10px]">
                      v{ver.versionNumber}
                    </span>
                    <span className="font-semibold text-slate-900">{ver.title}</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{ver.changeSummary}</p>
                  <span className="text-[10px] text-slate-400 block">
                    {new Date(ver.timestamp).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => rollbackVersion(doc.id, ver.versionNumber)}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-lg font-semibold cursor-pointer"
                  >
                    Restore Version {ver.versionNumber}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* AI CLAUSE ASSISTANT MODAL */}
      {/* ========================================================================= */}
      {aiAssistantOpen && assistantTargetSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-base font-semibold">AI Clause Assistant</h3>
                  <p className="text-xs text-slate-300">
                    Target: {assistantTargetSection.heading}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAiAssistantOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Action Picker */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleExecuteAssistant('explain')}
                  className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
                    assistantAction === 'explain' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Explain in Plain English
                </button>
                <button
                  onClick={() => handleExecuteAssistant('simplify')}
                  className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
                    assistantAction === 'simplify' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Rewrite Simpler
                </button>
                <button
                  onClick={() => handleExecuteAssistant('make_specific')}
                  className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
                    assistantAction === 'make_specific' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Make Strict & Specific
                </button>
              </div>

              {/* Custom Prompt Instruction */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Custom Instruction (Optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Add 10% penalty for delays over 15 days..."
                    value={assistantInstruction}
                    onChange={(e) => setAssistantInstruction(e.target.value)}
                    className="flex-1 p-2 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                  <button
                    onClick={() => handleExecuteAssistant('rewrite')}
                    disabled={isAssistantLoading}
                    className="px-3 py-2 bg-slate-900 text-white rounded-lg font-semibold cursor-pointer"
                  >
                    Run
                  </button>
                </div>
              </div>

              {/* Loading State */}
              {isAssistantLoading && (
                <div className="p-8 text-center space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
                  <p className="text-slate-500 font-medium">Processing legal clause with AI model...</p>
                </div>
              )}

              {/* Results */}
              {assistantResult && !isAssistantLoading && (
                <div className="space-y-3 pt-2">
                  {assistantResult.explanation && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-950 space-y-1">
                      <span className="font-semibold block">Explanation & Legal Insights:</span>
                      <p className="whitespace-pre-line text-[11px] leading-relaxed">
                        {assistantResult.explanation}
                      </p>
                    </div>
                  )}

                  {assistantResult.revisedText && assistantAction !== 'explain' && (
                    <div className="space-y-1">
                      <span className="font-semibold text-slate-900 block">Proposed Clause Text:</span>
                      <textarea
                        rows={5}
                        value={assistantResult.revisedText}
                        onChange={(e) =>
                          setAssistantResult({ ...assistantResult, revisedText: e.target.value })
                        }
                        className="w-full p-3 border border-slate-300 rounded-lg bg-slate-50 font-serif text-xs leading-relaxed"
                      />
                    </div>
                  )}

                  {assistantResult.risksMitigated && assistantResult.risksMitigated.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {assistantResult.risksMitigated.map((r, i) => (
                        <span key={i} className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                          ✓ {r}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  onClick={() => setAiAssistantOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Close
                </button>
                {assistantResult?.revisedText && assistantAction !== 'explain' && (
                  <button
                    onClick={handleApplyAssistantRevision}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs cursor-pointer shadow-xs"
                  >
                    Apply Changes to Document
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* NEW CUSTOM CLAUSE MODAL */}
      {/* ========================================================================= */}
      {showNewClauseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900">Add New Legal Clause</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clause Heading</label>
                <input
                  type="text"
                  placeholder="e.g. NON-SOLICITATION OF CLIENTS"
                  value={newClauseHeading}
                  onChange={(e) => setNewClauseHeading(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clause Operative Text</label>
                <textarea
                  rows={4}
                  placeholder="Enter the full legal language for this clause..."
                  value={newClauseContent}
                  onChange={(e) => setNewClauseContent(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-serif"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setShowNewClauseModal(false)}
                className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNewSection}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-xs cursor-pointer"
              >
                Insert Clause
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EXPORT CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <h3 className="text-base font-bold text-slate-900">Export Final Agreement</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate formatted legal files ready for signature execution.
              </p>
            </div>

            {/* Mandatory Disclaimer Reminder */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[11px] text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>AI Legal Drafting Disclaimer:</strong> This document is an AI-generated draft. Review all information carefully and consult a qualified legal professional when appropriate.
              </span>
            </div>

            {/* Export Format Buttons */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <button
                onClick={() => { exportToDocx(doc); setShowExportModal(false); }}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-xs font-semibold text-slate-800 cursor-pointer"
              >
                <div className="w-8 h-8 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  W
                </div>
                <span>Word (.docx)</span>
              </button>

              <button
                onClick={() => { exportToPdf(doc); setShowExportModal(false); }}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-rose-500 hover:bg-rose-50/50 transition-all text-xs font-semibold text-slate-800 cursor-pointer"
              >
                <div className="w-8 h-8 rounded bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  PDF
                </div>
                <span>PDF (.pdf)</span>
              </button>

              <button
                onClick={() => { exportToTxt(doc); setShowExportModal(false); }}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-slate-500 hover:bg-slate-50 transition-all text-xs font-semibold text-slate-800 cursor-pointer"
              >
                <div className="w-8 h-8 rounded bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                  TXT
                </div>
                <span>Plain Text</span>
              </button>
            </div>

            <div className="pt-2 flex justify-between items-center text-xs">
              <button
                onClick={() => { window.print(); setShowExportModal(false); }}
                className="text-slate-600 hover:text-slate-900 underline flex items-center gap-1 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Directly</span>
              </button>

              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
