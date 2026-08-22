import React, { useState } from 'react';
import { X, Key, Cpu, Globe, DollarSign, User, ShieldCheck, Sparkles, Check } from 'lucide-react';
import { useDocuments } from '../context/DocumentContext';
import { JURISDICTIONS, CURRENCIES } from '../data/templates';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_OPENROUTER_MODELS = [
  { id: 'openai/gpt-4o-mini', label: 'GPT-4o Mini (Fast & Cost-Effective)', provider: 'OpenAI' },
  { id: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash (Google High Speed)', provider: 'Google' },
  { id: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet (Advanced Legal Drafting)', provider: 'Anthropic' },
  { id: 'deepseek/deepseek-chat', label: 'DeepSeek Chat (V3 Reasoning)', provider: 'DeepSeek' },
  { id: 'meta-llama/llama-3.3-70b-instruct', label: 'Llama 3.3 70B Instruct', provider: 'Meta' }
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, serverStatus } = useDocuments();
  const [formData, setFormData] = useState(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto" id="settings-modal-overlay">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold">AI Engine & Platform Settings</h2>
              <p className="text-xs text-slate-300">Configure OpenRouter Model API, Gemini fallbacks, and defaults</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-sm">
          {/* OpenRouter API Section */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-950 font-medium text-xs">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>OpenRouter Model API Configuration</span>
              </div>
              <span className="text-[11px] bg-blue-100 text-blue-800 font-medium px-2 py-0.5 rounded-full">
                Primary API
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                OpenRouter API Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="sk-or-v1-..."
                  value={formData.openRouterApiKey}
                  onChange={(e) => setFormData({ ...formData, openRouterApiKey: e.target.value })}
                  className="w-full pl-3 pr-10 py-2 border border-slate-300 rounded-md text-xs font-mono bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Leave blank to use environment default or built-in intelligent legal drafting engine.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                OpenRouter Model Selection
              </label>
              <select
                value={formData.openRouterModel}
                onChange={(e) => setFormData({ ...formData, openRouterModel: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {POPULAR_OPENROUTER_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label} ({m.provider})
                  </option>
                ))}
              </select>
            </div>

            <div className="text-[11px] text-slate-600 flex items-center gap-2 pt-1 border-t border-blue-200/60">
              <Cpu className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>
                Backend Server Status: <strong className="capitalize text-blue-900">{serverStatus.status}</strong>
                {serverStatus.hasGemini && ' • Gemini Fallback Available'}
              </span>
            </div>
          </div>

          {/* User Default Preferences */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                Default Jurisdiction
              </label>
              <select
                value={formData.defaultJurisdiction}
                onChange={(e) => setFormData({ ...formData, defaultJurisdiction: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {JURISDICTIONS.map((j) => (
                  <option key={j.value} value={j.value}>
                    {j.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                Default Currency
              </label>
              <select
                value={formData.defaultCurrency}
                onChange={(e) => setFormData({ ...formData, defaultCurrency: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                User / Organization Name
              </label>
              <input
                type="text"
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                Signatory Title
              </label>
              <input
                type="text"
                value={formData.defaultSignatoryTitle}
                onChange={(e) => setFormData({ ...formData, defaultSignatoryTitle: e.target.value })}
                placeholder="e.g. Managing Director / Authorized Signatory"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  Saved!
                </>
              ) : (
                'Save Preferences'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
