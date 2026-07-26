import { NoteAnalysis } from '../types';

export interface AnalyzeNotesResponse {
  success: boolean;
  data?: NoteAnalysis;
  error?: string;
  rawText?: string;
  timestamp?: string;
}

export async function analyzeNotesWithGemini(
  pdfText: string,
  title?: string
): Promise<NoteAnalysis> {
  if (!pdfText || !pdfText.trim()) {
    throw new Error('No lecture text provided. Extract text from a valid PDF before calling the Gemini API.');
  }

  let response: Response;
  try {
    response = await fetch('/api/analyze-notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pdfText,
        title: title || 'Uploaded Lecture Note',
      }),
    });
  } catch (netErr: any) {
    console.error('Network Error calling /api/analyze-notes:', netErr);
    throw new Error('Network error connecting to Gemini API server endpoint. Please check server connectivity.');
  }

  let jsonResult: AnalyzeNotesResponse;
  try {
    jsonResult = await response.json();
  } catch (parseErr) {
    throw new Error(`Invalid JSON response from server (Status ${response.status}).`);
  }

  if (!response.ok || !jsonResult.success || !jsonResult.data) {
    const errorMsg = jsonResult.error || `Server error (${response.status}) processing Gemini request.`;
    throw new Error(errorMsg);
  }

  const data = jsonResult.data;

  // Validate fields
  if (!Array.isArray(data.summary) || data.summary.length === 0) {
    throw new Error('Returned JSON validation failed: "summary" field is missing or invalid.');
  }
  if (!Array.isArray(data.importantTopics) || data.importantTopics.length === 0) {
    throw new Error('Returned JSON validation failed: "importantTopics" field is missing or invalid.');
  }
  if (!Array.isArray(data.flashcards) || data.flashcards.length === 0) {
    throw new Error('Returned JSON validation failed: "flashcards" field is missing or invalid.');
  }
  if (!Array.isArray(data.quiz) || data.quiz.length === 0) {
    throw new Error('Returned JSON validation failed: "quiz" field is missing or invalid.');
  }
  if (typeof data.simpleExplanation !== 'string' || !data.simpleExplanation) {
    throw new Error('Returned JSON validation failed: "simpleExplanation" field is missing or invalid.');
  }
  if (!Array.isArray(data.studyPlan) || data.studyPlan.length === 0) {
    throw new Error('Returned JSON validation failed: "studyPlan" field is missing or invalid.');
  }

  return data;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export async function sendChatQuestionToGemini(
  pdfText: string,
  title: string,
  messages: ChatMessage[],
  userQuestion: string
): Promise<string> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pdfText,
      title,
      messages,
      userQuestion,
    }),
  });

  const jsonResult = await response.json();
  if (!response.ok || !jsonResult.success) {
    throw new Error(jsonResult.error || 'Failed to send question to AI Tutor.');
  }

  return jsonResult.answer;
}

