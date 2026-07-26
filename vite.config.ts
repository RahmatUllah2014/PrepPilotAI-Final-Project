import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import {GoogleGenAI, Type} from '@google/genai';

function geminiApiPlugin(): Plugin {
  return {
    name: 'gemini-api-plugin',
    configureServer(server) {
      server.middlewares.use('/api/analyze-notes', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let bodyStr = '';
        req.on('data', (chunk) => {
          bodyStr += chunk;
        });

        req.on('end', async () => {
          try {
            const body = JSON.parse(bodyStr || '{}');
            const pdfText = body.pdfText || '';
            const title = body.title || 'Uploaded Lecture Note';

            if (!pdfText.trim()) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'No lecture text provided for analysis.' }));
              return;
            }

            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'GEMINI_API_KEY environment variable is missing.' }));
              return;
            }

            const ai = new GoogleGenAI({
              apiKey,
              httpOptions: {
                headers: {
                  'User-Agent': 'aistudio-build',
                },
              },
            });

            const systemPrompt = `You are an experienced university tutor. Analyze the lecture notes below thoroughly and return ONLY a valid JSON object matching this exact structure:

{
  "summary": [
    "Key concise takeaway 1",
    "Key concise takeaway 2",
    "Key concise takeaway 3"
  ],
  "importantTopics": [
    "Topic 1: Detailed explanation of key concept",
    "Topic 2: Detailed explanation of key concept",
    "Topic 3: Detailed explanation of key concept"
  ],
  "flashcards": [
    {
      "question": "Front side concept or question?",
      "answer": "Back side explanation or definition."
    }
  ],
  "quiz": [
    {
      "question": "Multiple choice question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A"
    }
  ],
  "simpleExplanation": "Clear, plain-language summary of the entire lecture simplified for a beginner student.",
  "studyPlan": [
    "Day 1: Review foundational definitions and core mechanics.",
    "Day 2: Deep dive into secondary principles and examples.",
    "Day 3: Practice flashcards and active recall testing.",
    "Day 4: Solve practice quiz questions and address weak spots.",
    "Day 5: Map out interconnected concepts and visual diagrams.",
    "Day 6: Comprehensive review of all 7 key topics.",
    "Day 7: Final mock exam prep and timed self-assessment."
  ]
}`;

            const response = await ai.models.generateContent({
              model: 'gemini-3.6-flash',
              contents: `${systemPrompt}\n\nLecture Title: ${title}\n\nLecture Notes Text:\n${pdfText.slice(0, 30000)}`,
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

            const jsonText = response.text || '{}';
            const parsedData = JSON.parse(jsonText);

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, data: parsedData }));
          } catch (err: any) {
            console.error('Gemini API Error:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err?.message || 'Failed to analyze lecture notes with Gemini API' }));
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), geminiApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
