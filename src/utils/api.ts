import { AppSettings } from '../types';
import {
  getFallbackRecommendations,
  getFallbackClarificationQuestions,
  getFallbackDraftPlan,
  getFallbackFullDocument,
  getFallbackLegalReview,
  getFallbackClauseAssistant
} from './fallbackGenerator';

function getHeaders(settings?: AppSettings) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (settings?.openRouterApiKey) {
    headers['x-openrouter-key'] = settings.openRouterApiKey;
  }
  if (settings?.openRouterModel) {
    headers['x-openrouter-model'] = settings.openRouterModel;
  }
  return headers;
}

export async function checkServerHealth() {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Health check non-200');
    return await res.json();
  } catch (e) {
    return { status: 'offline', hasOpenRouter: false, hasGemini: false };
  }
}

export async function fetchDocumentRecommendations(description: string, jurisdiction: string, settings?: AppSettings) {
  try {
    const res = await fetch('/api/ai/recommend-document', {
      method: 'POST',
      headers: getHeaders(settings),
      body: JSON.stringify({ description, jurisdiction })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.recommendations && data.recommendations.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend recommendation fetch failed, using built-in legal engine:', err);
  }

  // Resilient fallback
  return {
    recommendations: getFallbackRecommendations(description, jurisdiction),
    disclaimer: 'This recommendation is for informational guidance only and does not constitute formal legal counsel.'
  };
}

export async function fetchClarificationQuestions(
  documentType: string,
  rawRequirements: string,
  jurisdiction: string,
  existingAnswers: Record<string, any> = {},
  settings?: AppSettings
) {
  try {
    const res = await fetch('/api/ai/clarify-questions', {
      method: 'POST',
      headers: getHeaders(settings),
      body: JSON.stringify({ documentType, rawRequirements, jurisdiction, existingAnswers })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.questions && data.questions.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend clarify questions fetch failed, using built-in legal engine:', err);
  }

  // Resilient fallback
  return getFallbackClarificationQuestions(documentType, rawRequirements, jurisdiction);
}

export async function fetchDraftPlan(
  documentType: string,
  rawRequirements: string,
  jurisdiction: string,
  answers: Record<string, any>,
  settings?: AppSettings
) {
  try {
    const res = await fetch('/api/ai/generate-plan', {
      method: 'POST',
      headers: getHeaders(settings),
      body: JSON.stringify({ documentType, rawRequirements, jurisdiction, answers })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.documentTitle) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend draft plan fetch failed, using built-in legal engine:', err);
  }

  // Resilient fallback
  return getFallbackDraftPlan(documentType, rawRequirements, jurisdiction, answers);
}

export async function fetchFullDocument(
  documentType: string,
  rawRequirements: string,
  jurisdiction: string,
  answers: Record<string, any>,
  draftPlan: any,
  settings?: AppSettings
) {
  try {
    const res = await fetch('/api/ai/generate-document', {
      method: 'POST',
      headers: getHeaders(settings),
      body: JSON.stringify({ documentType, rawRequirements, jurisdiction, answers, draftPlan })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.sections && data.sections.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend full document fetch failed, using built-in legal engine:', err);
  }

  // Resilient fallback
  return getFallbackFullDocument(documentType, rawRequirements, jurisdiction, answers, draftPlan);
}

export async function fetchLegalReview(
  documentText: any,
  documentType: string,
  jurisdiction: string,
  draftPlan: any,
  settings?: AppSettings
) {
  try {
    const res = await fetch('/api/ai/legal-review', {
      method: 'POST',
      headers: getHeaders(settings),
      body: JSON.stringify({ documentText, documentType, jurisdiction, draftPlan })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.items && data.items.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend legal review fetch failed, using built-in legal engine:', err);
  }

  // Resilient fallback
  return getFallbackLegalReview(documentText, documentType, jurisdiction, draftPlan);
}

export async function callClauseAssistant(
  action: 'explain' | 'simplify' | 'make_specific' | 'add_custom' | 'rewrite',
  clauseText: string,
  heading?: string,
  instruction?: string,
  jurisdiction?: string,
  settings?: AppSettings
) {
  try {
    const res = await fetch('/api/ai/clause-assistant', {
      method: 'POST',
      headers: getHeaders(settings),
      body: JSON.stringify({ action, clauseText, heading, instruction, jurisdiction })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && (data.revisedText || data.explanation)) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend clause assistant fetch failed, using built-in legal engine:', err);
  }

  // Resilient fallback
  return getFallbackClauseAssistant(action, clauseText, heading, instruction);
}

