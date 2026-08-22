import React, { useState } from 'react';
import { AlertTriangle, Info, ChevronDown, ChevronUp, ShieldCheck, X } from 'lucide-react';

export const LegalDisclaimerBanner: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-950 text-xs px-4 py-2 sm:px-6 transition-all" id="legal-disclaimer-banner">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
          <span className="font-semibold text-amber-900 shrink-0">Legal Notice:</span>
          <p className="truncate text-amber-800 text-xs">
            JurisDraft AI generates drafting assistance for planning and informational purposes only. It is not a law firm and does not substitute for advice from a licensed attorney.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-amber-800 hover:text-amber-950 flex items-center gap-1 font-medium underline underline-offset-2 px-1.5 py-0.5 rounded text-xs cursor-pointer"
            title="Read full legal notice"
          >
            {isExpanded ? 'Show Less' : 'Full Disclaimer'}
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="text-amber-600 hover:text-amber-900 p-1 rounded-full hover:bg-amber-100/70"
            title="Dismiss top banner"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-amber-200/80 text-[11px] text-amber-900 leading-relaxed grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-start gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">No Attorney-Client Privilege</span>
              Use of this AI drafting system does not establish an attorney-client relationship. All prompts, facts, and generated clauses remain self-directed drafting aids.
            </div>
          </div>
          <div className="flex items-start gap-1.5">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Jurisdiction Specificity</span>
              Statutory requirements, mandatory stamping, lease registration thresholds, and mandatory disclosures vary by state, province, and country.
            </div>
          </div>
          <div className="flex items-start gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Mandatory Independent Review</span>
              Always have customized agreements, financial terms, liability caps, and termination clauses reviewed by a qualified legal professional before signing.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
