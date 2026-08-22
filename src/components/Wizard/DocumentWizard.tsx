import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ArrowRight, Sparkles, HelpCircle, CheckCircle2, ShieldAlert, 
  Layers, FileText, Globe, DollarSign, Paperclip, AlertTriangle, Edit3, 
  Trash2, Plus, RefreshCw, Send, ChevronRight, X, ShieldCheck
} from 'lucide-react';
import { useDocuments } from '../../context/DocumentContext';
import { DOCUMENT_TEMPLATES, JURISDICTIONS, CURRENCIES, SAMPLE_PROMPTS } from '../../data/templates';
import { ClarificationQuestion, DraftPlan, LegalDocument, RecommendationResult, LegalReviewAudit } from '../../types';
import { 
  fetchDocumentRecommendations, 
  fetchClarificationQuestions, 
  fetchDraftPlan, 
  fetchFullDocument, 
  fetchLegalReview 
} from '../../utils/api';

interface DocumentWizardProps {
  initialDocumentType?: string;
  initialRequirements?: string;
  onCancel: () => void;
  onComplete: (createdDoc: LegalDocument) => void;
}

type WizardStep = 'type_select' | 'requirements' | 'interview' | 'draft_plan' | 'generating';

export const DocumentWizard: React.FC<DocumentWizardProps> = ({
  initialDocumentType,
  initialRequirements,
  onCancel,
  onComplete
}) => {
  const { settings, createDocument } = useDocuments();

  // Wizard Flow State
  const [currentStep, setCurrentStep] = useState<WizardStep>(
    initialRequirements ? 'requirements' : (initialDocumentType ? 'requirements' : 'type_select')
  );

  // Form Data
  const [selectedType, setSelectedType] = useState<string>(initialDocumentType || 'Rental / Lease Agreement');
  const [rawRequirements, setRawRequirements] = useState<string>(initialRequirements || '');
  const [jurisdiction, setJurisdiction] = useState<string>(settings.defaultJurisdiction);
  const [currency, setCurrency] = useState<string>(settings.defaultCurrency);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [customJurisdiction, setCustomJurisdiction] = useState<string>('');

  // AI Advisor modal / state
  const [showAdvisor, setShowAdvisor] = useState(false);
  const [advisorQuery, setAdvisorQuery] = useState('');
  const [isAdvisorLoading, setIsAdvisorLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);

  // AI Interview questions
  const [questions, setQuestions] = useState<ClarificationQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [extractedFacts, setExtractedFacts] = useState<Record<string, any>>({});
  const [missingInfoList, setMissingInfoList] = useState<string[]>([]);
  const [isInterviewLoading, setIsInterviewLoading] = useState(false);

  // Draft Plan
  const [draftPlan, setDraftPlan] = useState<DraftPlan | null>(null);
  const [isPlanLoading, setIsPlanLoading] = useState(false);

  // Generation status
  const [generationStage, setGenerationStage] = useState<string>('Initializing drafting engine...');
  const [generationProgress, setGenerationProgress] = useState<number>(10);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // When step changes to interview, fetch questions from API
  const handleProceedToInterview = async () => {
    if (!rawRequirements.trim()) {
      setErrorMsg('Please describe your legal requirements in your own words.');
      return;
    }
    setErrorMsg(null);
    setCurrentStep('interview');
    setIsInterviewLoading(true);

    try {
      const activeJurisdiction = customJurisdiction.trim() || jurisdiction;
      const data = await fetchClarificationQuestions(selectedType, rawRequirements, activeJurisdiction, {}, settings);
      
      if (data && data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setExtractedFacts(data.extractedFacts || {});
        setMissingInfoList(data.missingInformation || []);
        
        // Initialize default answers
        const initAnswers: Record<string, any> = {};
        data.questions.forEach((q: ClarificationQuestion) => {
          if (q.defaultValue) {
            initAnswers[q.fieldKey] = q.defaultValue;
          }
        });
        setAnswers(initAnswers);
      }
    } catch (err: any) {
      console.error('Failed to load clarification questions:', err);
    } finally {
      setIsInterviewLoading(false);
    }
  };

  // When interview finishes, fetch Draft Plan
  const handleProceedToDraftPlan = async () => {
    setCurrentStep('draft_plan');
    setIsPlanLoading(true);
    setErrorMsg(null);

    try {
      const activeJurisdiction = customJurisdiction.trim() || jurisdiction;
      const plan = await fetchDraftPlan(selectedType, rawRequirements, activeJurisdiction, answers, settings);
      setDraftPlan(plan);
    } catch (err: any) {
      console.error('Failed to generate draft plan:', err);
    } finally {
      setIsPlanLoading(false);
    }
  };

  // When Draft Plan is approved, generate full document and run legal review
  const handleGenerateFinalDocument = async () => {
    if (!draftPlan) return;
    setCurrentStep('generating');
    setErrorMsg(null);

    try {
      setGenerationStage('Drafting precision legal clauses & operative covenants...');
      setGenerationProgress(30);

      const activeJurisdiction = customJurisdiction.trim() || jurisdiction;
      
      // 1. Generate full document
      const fullDoc = await fetchFullDocument(
        selectedType,
        rawRequirements,
        activeJurisdiction,
        answers,
        draftPlan,
        settings
      );

      setGenerationStage('Conducting AI legal risk & ambiguity audit...');
      setGenerationProgress(70);

      // 2. Run legal review audit
      let reviewAudit: LegalReviewAudit | undefined = undefined;
      try {
        reviewAudit = await fetchLegalReview(fullDoc, selectedType, activeJurisdiction, draftPlan, settings);
      } catch (revErr) {
        console.warn('Review audit skipped or returned default', revErr);
      }

      setGenerationStage('Finalizing document structure...');
      setGenerationProgress(100);

      // 3. Create document in context
      const created = createDocument({
        title: fullDoc.title || draftPlan.documentTitle || `${selectedType.toUpperCase()} AGREEMENT`,
        type: selectedType,
        jurisdiction: activeJurisdiction,
        currency,
        rawRequirements,
        answers,
        draftPlan,
        preamble: fullDoc.preamble || '',
        sections: fullDoc.sections || [],
        signatures: fullDoc.signatures || {
          partyOneLabel: draftPlan.parties.partyOne.role,
          partyTwoLabel: draftPlan.parties.partyTwo.role,
          witnessesRequired: true
        },
        reviewAudit: reviewAudit,
        status: reviewAudit ? 'reviewed' : 'generated'
      });

      // Done! Hand over to editor
      onComplete(created);
    } catch (err: any) {
      console.error('Document generation error:', err);
      setErrorMsg(`Failed to generate document: ${err.message || 'Unknown error'}`);
      setCurrentStep('draft_plan');
    }
  };

  // Recommendation Advisor submit
  const handleRunAdvisor = async () => {
    if (!advisorQuery.trim()) return;
    setIsAdvisorLoading(true);
    try {
      const data = await fetchDocumentRecommendations(advisorQuery, jurisdiction, settings);
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdvisorLoading(false);
    }
  };

  const handleSelectRecommendation = (rec: RecommendationResult) => {
    setSelectedType(rec.documentType);
    if (!rawRequirements) {
      setRawRequirements(advisorQuery);
    }
    setShowAdvisor(false);
    setCurrentStep('requirements');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileName = e.target.files[0].name;
      setAttachments(prev => [...prev, fileName]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6" id="document-wizard-container">
      {/* Wizard Header & Stepper */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 mb-6 shadow-xs">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel & Return</span>
          </button>

          <div className="text-right">
            <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block">
              Drafting Workflow
            </span>
            <span className="text-xs font-bold text-slate-800">
              {currentStep === 'type_select' && 'Step 1: Document Classification'}
              {currentStep === 'requirements' && 'Step 2: Natural Language Brief'}
              {currentStep === 'interview' && `Step 3: AI Clarification Interview (${currentQuestionIndex + 1}/${questions.length || 1})`}
              {currentStep === 'draft_plan' && 'Step 4: Editable Draft Blueprint'}
              {currentStep === 'generating' && 'Finalizing Custom Agreement...'}
            </span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="grid grid-cols-4 gap-2 mt-4 text-[11px]">
          <div className={`h-1.5 rounded-full ${currentStep === 'type_select' ? 'bg-blue-600' : 'bg-blue-600'}`} />
          <div className={`h-1.5 rounded-full ${currentStep === 'requirements' || currentStep === 'interview' || currentStep === 'draft_plan' || currentStep === 'generating' ? 'bg-blue-600' : 'bg-slate-200'}`} />
          <div className={`h-1.5 rounded-full ${currentStep === 'interview' || currentStep === 'draft_plan' || currentStep === 'generating' ? 'bg-blue-600' : 'bg-slate-200'}`} />
          <div className={`h-1.5 rounded-full ${currentStep === 'draft_plan' || currentStep === 'generating' ? 'bg-blue-600' : 'bg-slate-200'}`} />
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-500 hover:text-rose-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 1: DOCUMENT TYPE SELECTION */}
      {/* ========================================================================= */}
      {currentStep === 'type_select' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Select Document Type</h2>
                <p className="text-xs text-slate-500">
                  Choose the contract archetype that best represents your legal transaction
                </p>
              </div>

              {/* I Don't Know Advisor Button */}
              <button
                onClick={() => setShowAdvisor(true)}
                className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>"I don't know which document I need"</span>
              </button>
            </div>

            {/* Document Types Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              {DOCUMENT_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedType(t.name)}
                  className={`text-left p-3.5 rounded-xl border text-xs transition-all cursor-pointer flex flex-col justify-between ${
                    selectedType === t.name
                      ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold text-slate-900">{t.name}</span>
                      {selectedType === t.name && (
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{t.description}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-2 font-medium uppercase">{t.category}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setCurrentStep('requirements')}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Continue to Requirements</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: USER REQUIREMENT INPUT */}
      {/* ========================================================================= */}
      {currentStep === 'requirements' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                  Target Document: {selectedType}
                </span>
                <button
                  onClick={() => setCurrentStep('type_select')}
                  className="text-xs text-slate-500 hover:text-blue-600 underline cursor-pointer"
                >
                  Change Type
                </button>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                Describe your requirements in your own words
              </h2>
              <p className="text-xs text-slate-500">
                You do not need to use legal jargon. Specify names, amounts, timelines, and special terms.
              </p>
            </div>

            {/* Prompt Text Box */}
            <div className="space-y-2">
              <textarea
                rows={5}
                value={rawRequirements}
                onChange={(e) => setRawRequirements(e.target.value)}
                placeholder="e.g. I want to create a rental agreement for my shop for 3 years. Monthly rent is ₹25,000 and the tenant must pay a security deposit of ₹1 lakh..."
                className="w-full p-4 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white leading-relaxed placeholder:text-slate-400"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Natural language requirement parsing will extract key facts automatically.</span>
                <span>{rawRequirements.length} characters</span>
              </div>
            </div>

            {/* Sample Prompts Quick Insertion */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-700 block mb-2">
                Click a sample requirement to pre-fill:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_PROMPTS.map((sp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedType(sp.type);
                      setRawRequirements(sp.text);
                    }}
                    className="text-[11px] bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 px-2.5 py-1 rounded-md transition-colors cursor-pointer text-left truncate max-w-[280px]"
                    title={sp.text}
                  >
                    {sp.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Jurisdiction & Currency Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  Governing Jurisdiction
                </label>
                <select
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  {JURISDICTIONS.map((j) => (
                    <option key={j.value} value={j.value}>
                      {j.label}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Jurisdiction governs legal formatting, arbitration seats, and statutory terms.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                  Contract Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Attachments Section */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                Supporting Files / Existing Agreements (Optional)
              </label>
              <div className="flex items-center gap-3">
                <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium cursor-pointer flex items-center gap-1.5 transition-colors">
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>Attach Document</span>
                  <input type="file" onChange={handleFileUpload} className="hidden" />
                </label>

                {attachments.map((file, i) => (
                  <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-200 flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {file}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between gap-3">
            <button
              onClick={() => setCurrentStep('type_select')}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Back
            </button>

            <button
              onClick={handleProceedToInterview}
              disabled={isInterviewLoading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isInterviewLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing Facts & Missing Terms...</span>
                </>
              ) : (
                <>
                  <span>Start Clarification Interview</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: AI CLARIFICATION INTERVIEW */}
      {/* ========================================================================= */}
      {currentStep === 'interview' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                  Step 2 of 4 — Collecting Required Information
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Question {currentQuestionIndex + 1} of {questions.length || 1}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                AI Clarification Interview
              </h2>
              <p className="text-xs text-slate-500">
                To prevent ambiguities and enforceability issues, answer the following targeted questions.
              </p>
            </div>

            {/* Active Question Card */}
            {questions.length > 0 && questions[currentQuestionIndex] && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {questions[currentQuestionIndex].required ? 'Mandatory Field' : 'Optional Clause'}
                    </span>
                    <h3 className="text-base font-semibold text-slate-900 mt-2">
                      {questions[currentQuestionIndex].question}
                    </h3>
                  </div>
                </div>

                {/* Input control according to question type */}
                <div className="pt-2">
                  {questions[currentQuestionIndex].type === 'select' && questions[currentQuestionIndex].options ? (
                    <div className="space-y-2">
                      {questions[currentQuestionIndex].options?.map((opt, oIdx) => (
                        <label
                          key={oIdx}
                          className={`flex items-center gap-3 p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                            answers[questions[currentQuestionIndex].fieldKey] === opt
                              ? 'border-blue-600 bg-blue-50/80 font-medium text-blue-950'
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name={questions[currentQuestionIndex].id}
                            value={opt}
                            checked={answers[questions[currentQuestionIndex].fieldKey] === opt}
                            onChange={() =>
                              setAnswers({
                                ...answers,
                                [questions[currentQuestionIndex].fieldKey]: opt
                              })
                            }
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="text"
                      placeholder={questions[currentQuestionIndex].placeholder || 'Enter detail...'}
                      value={answers[questions[currentQuestionIndex].fieldKey] || ''}
                      onChange={(e) =>
                        setAnswers({
                          ...answers,
                          [questions[currentQuestionIndex].fieldKey]: e.target.value
                        })
                      }
                      className="w-full p-3 border border-slate-300 rounded-lg text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>

                {/* Why it matters banner */}
                <div className="bg-blue-50/60 border border-blue-200/70 rounded-lg p-3 text-[11px] text-blue-900 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Why this matters legally:</span>
                    <span>{questions[currentQuestionIndex].whyItMatters}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Extracted Facts Sidebar preview */}
            {missingInfoList.length > 0 && (
              <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-3 text-xs text-amber-950">
                <span className="font-semibold block mb-1">Identified Missing Terms in Initial Prompt:</span>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-900">
                  {missingInfoList.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

            <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => {
                if (currentQuestionIndex > 0) {
                  setCurrentQuestionIndex(currentQuestionIndex - 1);
                } else {
                  setCurrentStep('requirements');
                }
              }}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Previous
            </button>

            <div className="flex items-center gap-2">
              {/* Skip optional question */}
              {!questions[currentQuestionIndex]?.required && currentQuestionIndex < questions.length - 1 && (
                <button
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                  className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800"
                >
                  Skip Question
                </button>
              )}

              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleProceedToDraftPlan}
                  disabled={isPlanLoading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all cursor-pointer"
                >
                  {isPlanLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Legal Draft Plan...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate Legal Draft Plan</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: EDITABLE LEGAL DRAFT PLAN */}
      {/* ========================================================================= */}
      {currentStep === 'draft_plan' && draftPlan && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                  Step 3 of 4 — Blueprint Review & Customization
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                  Legal Draft Plan & Contract Blueprint
                </h2>
                <p className="text-xs text-slate-500">
                  Review and edit the structured terms below before generating the final full legal text.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Blueprint Ready
                </span>
              </div>
            </div>

            {/* Editable Fields Grid */}
            <div className="space-y-4 text-xs">
              {/* Document Title */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Document Title</label>
                <input
                  type="text"
                  value={draftPlan.documentTitle}
                  onChange={(e) => setDraftPlan({ ...draftPlan, documentTitle: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-bold text-slate-900 bg-white"
                />
              </div>

              {/* Parties Block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-semibold text-blue-900 mb-1">
                    First Party ({draftPlan.parties.partyOne.role})
                  </label>
                  <textarea
                    rows={2}
                    value={draftPlan.parties.partyOne.description}
                    onChange={(e) =>
                      setDraftPlan({
                        ...draftPlan,
                        parties: {
                          ...draftPlan.parties,
                          partyOne: { ...draftPlan.parties.partyOne, description: e.target.value }
                        }
                      })
                    }
                    className="w-full p-2 border border-slate-300 rounded-md bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-indigo-900 mb-1">
                    Second Party ({draftPlan.parties.partyTwo.role})
                  </label>
                  <textarea
                    rows={2}
                    value={draftPlan.parties.partyTwo.description}
                    onChange={(e) =>
                      setDraftPlan({
                        ...draftPlan,
                        parties: {
                          ...draftPlan.parties,
                          partyTwo: { ...draftPlan.parties.partyTwo, description: e.target.value }
                        }
                      })
                    }
                    className="w-full p-2 border border-slate-300 rounded-md bg-white text-xs"
                  />
                </div>
              </div>

              {/* Purpose & Consideration */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Purpose & Recitals Summary</label>
                <textarea
                  rows={2}
                  value={draftPlan.purpose}
                  onChange={(e) => setDraftPlan({ ...draftPlan, purpose: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              {/* Payment & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Payment & Financial Terms</label>
                  <textarea
                    rows={2}
                    value={draftPlan.paymentTerms}
                    onChange={(e) => setDraftPlan({ ...draftPlan, paymentTerms: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Duration & Term</label>
                  <textarea
                    rows={2}
                    value={draftPlan.duration}
                    onChange={(e) => setDraftPlan({ ...draftPlan, duration: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* Termination & Confidentiality */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Termination Conditions</label>
                  <textarea
                    rows={2}
                    value={draftPlan.termination}
                    onChange={(e) => setDraftPlan({ ...draftPlan, termination: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Confidentiality & Non-Disclosure</label>
                  <textarea
                    rows={2}
                    value={draftPlan.confidentiality}
                    onChange={(e) => setDraftPlan({ ...draftPlan, confidentiality: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* Liability & Dispute Resolution */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Limitation of Liability & Indemnity</label>
                  <textarea
                    rows={2}
                    value={draftPlan.liabilityAndIndemnity}
                    onChange={(e) => setDraftPlan({ ...draftPlan, liabilityAndIndemnity: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Dispute Resolution & Governing Law</label>
                  <textarea
                    rows={2}
                    value={draftPlan.disputeResolution}
                    onChange={(e) => setDraftPlan({ ...draftPlan, disputeResolution: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setCurrentStep('interview')}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Back to Interview
            </button>

            <button
              onClick={handleGenerateFinalDocument}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer"
              id="approve-generate-doc-btn"
            >
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span>Approve Plan & Generate Full Legal Document</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 5: GENERATING ANIMATION */}
      {/* ========================================================================= */}
      {currentStep === 'generating' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-6 shadow-md max-w-lg mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 mx-auto flex items-center justify-center animate-pulse">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-900">Crafting Customized Legal Document</h3>
            <p className="text-xs text-slate-500">{generationStage}</p>
          </div>

          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${generationProgress}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-400 italic">
            Adhering strictly to provided user facts, numbers, milestones, and jurisdiction provisions.
          </p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADVISOR MODAL: "I don't know which document I need" */}
      {/* ========================================================================= */}
      {showAdvisor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-base font-semibold">AI Legal Document Recommender</h3>
                  <p className="text-xs text-slate-300">Tell us what you want to achieve in plain words</p>
                </div>
              </div>
              <button
                onClick={() => setShowAdvisor(false)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-800">
                  What agreement or transaction are you trying to setup?
                </label>
                <textarea
                  rows={3}
                  value={advisorQuery}
                  onChange={(e) => setAdvisorQuery(e.target.value)}
                  placeholder="e.g. I am hiring a designer to build a brand identity and packaging. I am paying them $2,000 and need all copyright transferred to my brand."
                  className="w-full p-3 border border-slate-300 rounded-lg text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleRunAdvisor}
                  disabled={isAdvisorLoading || !advisorQuery.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isAdvisorLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Analyzing Legal Fit...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Find Best Document Match</span>
                    </>
                  )}
                </button>
              </div>

              {/* Recommendations List */}
              {recommendations.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <span className="font-semibold text-slate-800 block text-xs">
                    Recommended Legal Document Matches:
                  </span>
                  {recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 hover:border-blue-300 transition-all"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{rec.title}</span>
                          <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                            {rec.matchScore}% Match
                          </span>
                        </div>
                        <button
                          onClick={() => handleSelectRecommendation(rec)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] rounded-lg cursor-pointer flex items-center gap-1"
                        >
                          <span>Select This Document</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>

                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {rec.whyRecommended}
                      </p>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {rec.keyClausesIncluded?.map((c, i) => (
                          <span key={i} className="text-[10px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
