import React, { useState, useMemo } from 'react';
import { Search, Layers, Sparkles, HelpCircle, ArrowRight, CheckCircle2, Shield } from 'lucide-react';
import { DOCUMENT_TEMPLATES } from '../data/templates';
import { DocumentTypeInfo } from '../types';

interface TemplatesViewProps {
  onSelectTemplate: (docType: string) => void;
  onOpenAdvisor: () => void;
}

const CATEGORIES = ['ALL', 'Property', 'Business & Employment', 'IP & Confidentiality', 'Commercial', 'Notices & Court', 'Digital & Web'];

export const TemplatesView: React.FC<TemplatesViewProps> = ({ onSelectTemplate, onOpenAdvisor }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const filteredTemplates = useMemo(() => {
    return DOCUMENT_TEMPLATES.filter(t => {
      if (selectedCategory !== 'ALL' && t.category !== selectedCategory) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const mName = t.name.toLowerCase().includes(q);
        const mDesc = t.description.toLowerCase().includes(q);
        const mClauses = t.keyClauses.some(c => c.toLowerCase().includes(q));
        if (!mName && !mDesc && !mClauses) return false;
      }
      return true;
    });
  }, [search, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6" id="templates-view">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold">
            <Layers className="w-3.5 h-3.5" />
            <span>Curated Legal Frameworks</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Legal Document Library & Templates</h1>
          <p className="text-sm text-slate-300">
            Select a verified contract archetype or describe your situation in plain English. Each template includes standard operative covenants, indemnities, and jurisdiction adaptations.
          </p>
        </div>

        {/* Smart Advisor CTA */}
        <div className="bg-blue-950/80 border border-blue-800/80 p-4 rounded-xl text-xs space-y-2 shrink-0 md:max-w-xs w-full">
          <div className="flex items-center gap-2 text-blue-300 font-semibold">
            <HelpCircle className="w-4 h-4 text-blue-400" />
            <span>Unsure which document fits?</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Our AI document recommender assesses your business goals and recommends the ideal legal structure.
          </p>
          <button
            onClick={onOpenAdvisor}
            className="w-full mt-2 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>"I don't know which document I need"</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Categories */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Category tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {cat} {cat === 'ALL' ? `(${DOCUMENT_TEMPLATES.length})` : ''}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search 18+ templates & clauses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-white border border-slate-200 hover:border-blue-400 rounded-xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
            id={`template-card-${template.id}`}
          >
            <div className="space-y-3">
              {/* Category & Badge */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {template.category}
                </span>
                {template.popularBadge && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    Popular
                  </span>
                )}
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                  {template.name}
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {template.description}
                </p>
              </div>

              {/* Typical Use */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px]">
                <span className="font-semibold text-slate-700 block mb-0.5">Typical Use:</span>
                <span className="text-slate-600">{template.typicalUse}</span>
              </div>

              {/* Key Clauses */}
              <div>
                <span className="text-[11px] font-semibold text-slate-700 block mb-1.5">Standard Key Clauses:</span>
                <div className="flex flex-wrap gap-1">
                  {template.keyClauses.slice(0, 4).map((c, i) => (
                    <span key={i} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
                      {c}
                    </span>
                  ))}
                  {template.keyClauses.length > 4 && (
                    <span className="text-[10px] text-slate-400 px-1 py-0.5">
                      +{template.keyClauses.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-5 pt-3 border-t border-slate-100">
              <button
                onClick={() => onSelectTemplate(template.name)}
                className="w-full py-2 px-3 bg-slate-900 group-hover:bg-blue-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Draft with this Structure</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
