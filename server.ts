import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // Serve screenshots statically
  app.use('/screenshots', express.static(path.join(process.cwd(), 'screenshots')));

  // Endpoint to download or view README.md
  app.get('/api/download-readme', (req, res) => {
    const readmePath = path.join(process.cwd(), 'README.md');
    res.download(readmePath, 'README.md', (err) => {
      if (err) {
        res.status(404).send('README.md file not found');
      }
    });
  });

  app.get('/README.md', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'README.md'));
  });

  // API Health Check Endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      geminiKeyConfigured: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString() 
    });
  });

  // API Gemini Key Verification Endpoint
  app.get('/api/key-status', (req, res) => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return res.status(404).json({
        configured: false,
        message: 'No GEMINI_API_KEY configured on server.'
      });
    }
    const masked = key.length > 10 ? `${key.slice(0, 8)}...${key.slice(-4)}` : '***';
    return res.json({
      configured: true,
      maskedKey: masked,
      length: key.length,
      message: 'GEMINI_API_KEY is successfully loaded into server environment.'
    });
  });

  // Server-side Gemini API Route
  app.post('/api/analyze-notes', async (req, res) => {
    try {
      const { pdfText, title, quizCount = 5, flashcardCount = 5 } = req.body || {};

      if (!pdfText || typeof pdfText !== 'string' || !pdfText.trim()) {
        return res.status(400).json({ 
          error: 'Missing or empty lecture text. Please extract text from a valid PDF before analyzing.' 
        });
      }

      const targetQuizCount = Math.min(Math.max(Number(quizCount) || 5, 1), 30);
      const targetFlashcardCount = Math.min(Math.max(Number(flashcardCount) || 5, 1), 30);

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.error('Missing GEMINI_API_KEY environment variable.');
        return res.status(500).json({ 
          error: 'GEMINI_API_KEY environment variable is missing on the server. Please check environment configuration.' 
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemPrompt = `You are an expert university professor and master educator. 
Analyze the following lecture notes and generate a comprehensive study kit.
CRITICAL QUANTITY INSTRUCTIONS:
- You MUST generate EXACTLY ${targetQuizCount} multiple-choice quiz questions in the "quiz" array.
- You MUST generate EXACTLY ${targetFlashcardCount} flashcards in the "flashcards" array.

You MUST return ONLY a valid JSON object matching this schema. Do not include markdown block ticks outside the JSON.

Required JSON Structure:
{
  "summary": [
    "Key takeaway 1...",
    "Key takeaway 2...",
    "Key takeaway 3..."
  ],
  "importantTopics": [
    "Topic 1: Detailed breakdown...",
    "Topic 2: Detailed breakdown..."
  ],
  "flashcards": [
    {
      "question": "Concept or term to define?",
      "answer": "Clear, concise answer or definition."
    }
  ],
  "quiz": [
    {
      "question": "Multiple choice practice question?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A"
    }
  ],
  "simpleExplanation": "In simple, plain terms (EL5 format), explain the entire core concept...",
  "studyPlan": [
    "Day 1: ...",
    "Day 2: ...",
    "Day 3: ...",
    "Day 4: ...",
    "Day 5: ...",
    "Day 6: ...",
    "Day 7: ..."
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `${systemPrompt}\n\nLecture Title: ${title || 'Untitled Lecture'}\n\nExtracted Text:\n${pdfText.slice(0, 35000)}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              importantTopics: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              flashcards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    answer: { type: Type.STRING },
                  },
                  required: ['question', 'answer'],
                },
              },
              quiz: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    correctAnswer: { type: Type.STRING },
                  },
                  required: ['question', 'options', 'correctAnswer'],
                },
              },
              simpleExplanation: { type: Type.STRING },
              studyPlan: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['summary', 'importantTopics', 'flashcards', 'quiz', 'simpleExplanation', 'studyPlan'],
          },
        },
      });

      const responseText = response.text || '';
      let parsedData: any;

      try {
        parsedData = JSON.parse(responseText);
      } catch (parseErr) {
        console.error('Failed to parse Gemini JSON output:', responseText);
        return res.status(500).json({
          error: 'Gemini API returned malformed JSON content. Please try again.',
          rawText: responseText.slice(0, 500)
        });
      }

      // JSON Structure Validation
      if (!parsedData.summary || !Array.isArray(parsedData.summary) || parsedData.summary.length === 0) {
        return res.status(500).json({ error: 'Validated JSON check failed: "summary" is missing or empty.' });
      }
      if (!parsedData.importantTopics || !Array.isArray(parsedData.importantTopics) || parsedData.importantTopics.length === 0) {
        return res.status(500).json({ error: 'Validated JSON check failed: "importantTopics" is missing or empty.' });
      }
      if (!parsedData.flashcards || !Array.isArray(parsedData.flashcards) || parsedData.flashcards.length === 0) {
        return res.status(500).json({ error: 'Validated JSON check failed: "flashcards" is missing or empty.' });
      }
      if (!parsedData.quiz || !Array.isArray(parsedData.quiz) || parsedData.quiz.length === 0) {
        return res.status(500).json({ error: 'Validated JSON check failed: "quiz" is missing or empty.' });
      }
      if (!parsedData.simpleExplanation || typeof parsedData.simpleExplanation !== 'string') {
        return res.status(500).json({ error: 'Validated JSON check failed: "simpleExplanation" is missing or invalid.' });
      }
      if (!parsedData.studyPlan || !Array.isArray(parsedData.studyPlan) || parsedData.studyPlan.length === 0) {
        return res.status(500).json({ error: 'Validated JSON check failed: "studyPlan" is missing or empty.' });
      }

      return res.json({
        success: true,
        data: parsedData,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('Server /api/analyze-notes exception:', err);
      return res.status(500).json({
        error: err?.message || 'Internal server error while calling Gemini API.',
      });
    }
  });

  // Server-side Gemini Chat Endpoint for Q&A on Extracted PDF Text
  app.post('/api/chat', async (req, res) => {
    try {
      const { pdfText, title, messages, userQuestion } = req.body || {};

      if (!userQuestion || typeof userQuestion !== 'string' || !userQuestion.trim()) {
        return res.status(400).json({ error: 'Please provide a valid question.' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is missing on server.' });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const contextSnippet = (pdfText && typeof pdfText === 'string') 
        ? pdfText.slice(0, 30000) 
        : 'No PDF text context provided.';

      const docTitle = title || 'Extracted Document';

      let conversationHistory = '';
      if (Array.isArray(messages) && messages.length > 0) {
        conversationHistory = messages.slice(-6).map((m: any) => `${m.sender === 'user' ? 'Student' : 'PrepPilot AI'}: ${m.text}`).join('\n');
      }

      const prompt = `You are PrepPilot AI, an expert university tutor.
You are helping a student study their document titled "${docTitle}".

Reference Document Text Context:
"""
${contextSnippet}
"""

${conversationHistory ? `Previous Conversation:\n${conversationHistory}\n` : ''}
Student Question: ${userQuestion}

Instructions:
- Provide a clear, articulate, and accurate answer based directly on the document text.
- Use bullet points, bold key terms, and scannable formatting.
- Be encouraging, concise, and helpful for exam preparation.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
      });

      const answer = response.text || 'Sorry, I could not generate an answer at this time.';

      return res.json({
        success: true,
        answer,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('Server /api/chat error:', err);
      return res.status(500).json({
        error: err?.message || 'Failed to process chat query with Gemini AI.',
      });
    }
  });

  // Server-side Gemini Route for Generating On-Demand Flashcards or Quizzes via Chat
  app.post('/api/chat-generate-items', async (req, res) => {
    try {
      const { pdfText, title, itemType, count = 5, userPrompt } = req.body || {};

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is missing on server.' });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const targetCount = Math.min(Math.max(Number(count) || 5, 1), 30);
      const docTitle = title || 'Extracted Note';
      const textSnippet = (pdfText && typeof pdfText === 'string') ? pdfText.slice(0, 30000) : '';

      if (itemType === 'flashcards') {
        const prompt = `You are an expert university tutor.
Generate EXACTLY ${targetCount} high-quality study flashcards based on the document titled "${docTitle}".
${userPrompt ? `User instructions: ${userPrompt}\n` : ''}
Document Text:
"""
${textSnippet}
"""

Return ONLY a JSON object matching this schema:
{
  "flashcards": [
    {
      "question": "Front side question or term?",
      "answer": "Back side concise answer or definition."
    }
  ]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                flashcards: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      question: { type: Type.STRING },
                      answer: { type: Type.STRING },
                    },
                    required: ['question', 'answer'],
                  },
                },
              },
              required: ['flashcards'],
            },
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        return res.json({
          success: true,
          itemType: 'flashcards',
          count: parsed.flashcards?.length || 0,
          items: parsed.flashcards || [],
        });
      } else {
        const prompt = `You are an expert university professor.
Generate EXACTLY ${targetCount} multiple-choice practice quiz questions based on the document titled "${docTitle}".
${userPrompt ? `User instructions: ${userPrompt}\n` : ''}
Document Text:
"""
${textSnippet}
"""

Return ONLY a JSON object matching this schema:
{
  "quiz": [
    {
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A"
    }
  ]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                quiz: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      question: { type: Type.STRING },
                      options: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      correctAnswer: { type: Type.STRING },
                    },
                    required: ['question', 'options', 'correctAnswer'],
                  },
                },
              },
              required: ['quiz'],
            },
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        return res.json({
          success: true,
          itemType: 'quiz',
          count: parsed.quiz?.length || 0,
          items: parsed.quiz || [],
        });
      }
    } catch (err: any) {
      console.error('Server /api/chat-generate-items error:', err);
      return res.status(500).json({ error: err?.message || 'Failed to generate custom study items.' });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] PrepPilot AI server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server Fatal] Failed to start express server:', err);
});
