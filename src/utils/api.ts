import { AppSettings } from '../types';

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
    return await res.json();
  } catch (e) {
    return { status: 'offline', hasOpenRouter: false, hasGemini: false };
  }
}

export async function fetchDocumentRecommendations(description: string, jurisdiction: string, settings?: AppSettings) {
  const res = await fetch('/api/ai/recommend-document', {
    method: 'POST',
    headers: getHeaders(settings),
    body: JSON.stringify({ description, jurisdiction })
  });
  if (!res.ok) throw new Error('Failed to fetch recommendations');
  return await res.json();
}

export async function fetchClarificationQuestions(
  documentType: string,
  rawRequirements: string,
  jurisdiction: string,
  existingAnswers: Record<string, any> = {},
  settings?: AppSettings
) {
  const res = await fetch('/api/ai/clarify-questions', {
    method: 'POST',
    headers: getHeaders(settings),
    body: JSON.stringify({ documentType, rawRequirements, jurisdiction, existingAnswers })
  });
  if (!res.ok) throw new Error('Failed to generate clarification questions');
  return await res.json();
}

export async function fetchDraftPlan(
  documentType: string,
  rawRequirements: string,
  jurisdiction: string,
  answers: Record<string, any>,
  settings?: AppSettings
) {
  const res = await fetch('/api/ai/generate-plan', {
    method: 'POST',
    headers: getHeaders(settings),
    body: JSON.stringify({ documentType, rawRequirements, jurisdiction, answers })
  });
  if (!res.ok) throw new Error('Failed to generate draft plan');
  return await res.json();
}

export async function fetchFullDocument(
  documentType: string,
  rawRequirements: string,
  jurisdiction: string,
  answers: Record<string, any>,
  draftPlan: any,
  settings?: AppSettings
) {
  const res = await fetch('/api/ai/generate-document', {
    method: 'POST',
    headers: getHeaders(settings),
    body: JSON.stringify({ documentType, rawRequirements, jurisdiction, answers, draftPlan })
  });
  if (!res.ok) throw new Error('Failed to generate legal document');
  return await res.json();
}

export async function fetchLegalReview(
  documentText: any,
  documentType: string,
  jurisdiction: string,
  draftPlan: any,
  settings?: AppSettings
) {
  const res = await fetch('/api/ai/legal-review', {
    method: 'POST',
    headers: getHeaders(settings),
    body: JSON.stringify({ documentText, documentType, jurisdiction, draftPlan })
  });
  if (!res.ok) throw new Error('Failed to run legal review');
  return await res.json();
}

export async function callClauseAssistant(
  action: 'explain' | 'simplify' | 'make_specific' | 'add_custom' | 'rewrite',
  clauseText: string,
  heading?: string,
  instruction?: string,
  jurisdiction?: string,
  settings?: AppSettings
) {
  const res = await fetch('/api/ai/clause-assistant', {
    method: 'POST',
    headers: getHeaders(settings),
    body: JSON.stringify({ action, clauseText, heading, instruction, jurisdiction })
  });
  if (!res.ok) throw new Error('Failed to run clause assistant');
  return await res.json();
}
