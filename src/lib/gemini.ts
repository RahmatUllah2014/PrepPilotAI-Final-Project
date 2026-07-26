import { GoogleGenAI } from '@google/genai';
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

  // Check client-side API key first as fallback for Vercel static deployments
  const clientKey = import.meta.env.VITE_GEMINI_API_KEY;

  let responseText = '';
  let responseStatus = 0;
  try {
    const response = await fetch('/api/analyze-notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pdfText,
        title: title || 'Uploaded Lecture Note',
      }),
    });
    responseStatus = response.status;
    responseText = await response.text();
  } catch (netErr: any) {
    console.warn('Network error calling /api/analyze-notes:', netErr);
  }

  let jsonResult: AnalyzeNotesResponse | null = null;
  if (responseText) {
    try {
      jsonResult = JSON.parse(responseText);
    } catch (parseErr) {
      console.warn('Non-JSON response from /api/analyze-notes (Status ' + responseStatus + ').');
    }
  }

  if (jsonResult && jsonResult.success && jsonResult.data) {
    const data = jsonResult.data;
    if (
      Array.isArray(data.summary) &&
      Array.isArray(data.importantTopics) &&
      Array.isArray(data.flashcards) &&
      Array.isArray(data.quiz) &&
      typeof data.simpleExplanation === 'string' &&
      Array.isArray(data.studyPlan)
    ) {
      return data;
    }
  }

  // Client-side direct call fallback if client API key is configured
  if (clientKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: clientKey });
      const systemPrompt = `You are an expert university professor. Analyze the notes and return ONLY valid JSON:
{
  "summary": ["Point 1", "Point 2", "Point 3"],
  "importantTopics": ["Topic 1: breakdown", "Topic 2: breakdown"],
  "flashcards": [{"question": "Q?", "answer": "A"}],
  "quiz": [{"question": "Q?", "options": ["A","B","C","D"], "correctAnswer": "A"}],
  "simpleExplanation": "Plain terms explanation",
  "studyPlan": ["Day 1: ...", "Day 2: ...", "Day 3: ...", "Day 4: ...", "Day 5: ...", "Day 6: ...", "Day 7: ..."]
}`;
      const res = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `${systemPrompt}\n\nTitle: ${title || 'Note'}\n\nText:\n${pdfText.slice(0, 30000)}`,
        config: { responseMimeType: 'application/json' },
      });
      if (res.text) {
        return JSON.parse(res.text) as NoteAnalysis;
      }
    } catch (clientErr) {
      console.error('Client-side Gemini call error:', clientErr);
    }
  }

  if (jsonResult && jsonResult.error) {
    throw new Error(jsonResult.error);
  }

  throw new Error('Unable to connect to Gemini AI backend service. Please check your backend connection or server configuration.');
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export function generateSmartDocumentAnswer(
  pdfText: string,
  docTitle: string,
  question: string
): string {
  if (!pdfText || !pdfText.trim()) {
    return "I don't have any extracted text from your PDF yet. Please upload a PDF and extract text first.";
  }

  const qLower = question.toLowerCase();
  const cleanText = pdfText.replace(/\r\n/g, '\n').trim();
  const sentences = cleanText
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  if (qLower.includes('summar') || qLower.includes('takeaway') || qLower.includes('overview') || qLower.includes('key point')) {
    const topSentences = sentences.slice(0, 5);
    return `**Summary for "${docTitle || 'Extracted Document'}":**\n\n` +
      topSentences.map((s) => `• ${s}`).join('\n') +
      `\n\n*Extracted directly from your PDF text context.*`;
  }

  if (qLower.includes('exam') || qLower.includes('quiz') || qLower.includes('question') || qLower.includes('test')) {
    return `**Practice Exam Questions for "${docTitle || 'Document'}":**\n\n` +
      `1. **Question:** What is the main thesis or core subject discussed in this document?\n` +
      `   *Context:* ${sentences[0] || 'Review the introductory concepts.'}\n\n` +
      `2. **Question:** Explain the key terminology and methodology outlined in the text.\n` +
      `   *Context:* ${sentences[1] || 'Focus on definitions and primary sections.'}\n\n` +
      `3. **Question:** What practical conclusions or implications can be drawn from this material?\n` +
      `   *Context:* ${sentences[sentences.length - 1] || 'Check the concluding findings.'}`;
  }

  const words = qLower
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !['what', 'where', 'which', 'there', 'about', 'would', 'could', 'should', 'their', 'other', 'these', 'those'].includes(w));

  if (words.length > 0) {
    const matchingSentences = sentences.filter((s) => {
      const sLower = s.toLowerCase();
      return words.some((w) => sLower.includes(w));
    });

    if (matchingSentences.length > 0) {
      const bestMatches = matchingSentences.slice(0, 4);
      return `Based on **"${docTitle || 'Extracted Document'}"**, here is what I found regarding your question:\n\n` +
        bestMatches.map((s) => `• ${s}`).join('\n') +
        `\n\n*Answer extracted directly from document context.*`;
    }
  }

  const excerpt = sentences.slice(0, 4).join(' ');
  return `**Information regarding "${docTitle || 'Extracted Document'}":**\n\n${excerpt || cleanText.slice(0, 400)}\n\n*Ask me specific questions about definitions, terms, or summaries from your PDF!*`;
}

export async function sendChatQuestionToGemini(
  pdfText: string,
  title: string,
  messages: ChatMessage[],
  userQuestion: string
): Promise<string> {
  // Client-side direct call if VITE_GEMINI_API_KEY exists
  const clientKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (clientKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: clientKey });
      const prompt = `You are PrepPilot AI, an expert tutor answering a question about "${title}".
Document text:
"""
${pdfText.slice(0, 25000)}
"""

Student Question: ${userQuestion}`;

      const res = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
      });

      if (res.text) {
        return res.text;
      }
    } catch (clientErr) {
      console.warn('Client-side Gemini API call failed, trying server route:', clientErr);
    }
  }

  // Try server endpoint /api/chat safely without raw JSON parse errors
  try {
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

    const responseText = await response.text();

    if (response.ok && responseText) {
      try {
        const jsonResult = JSON.parse(responseText);
        if (jsonResult.success && jsonResult.answer) {
          return jsonResult.answer;
        }
      } catch (e) {
        console.warn('Server returned non-JSON response for /api/chat.');
      }
    }
  } catch (netErr) {
    console.warn('Network error calling /api/chat:', netErr);
  }

  // Smart document fallback
  return generateSmartDocumentAnswer(pdfText, title, userQuestion);
}


