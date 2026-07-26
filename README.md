# PrepPilot AI — AI Study Note Generator 🎓⚡

> Transform dense lecture PDFs, slides, and course materials into interactive, hyper-structured study kits featuring executive summaries, flashcards, self-grading quizzes, key topic breakdowns, and adaptive study plans powered by Gemini 2.5 Flash.

---

### 🌐 Live Demo & Repository
- **Live Deployed App**: [https://ais-pre-w4tgqz33ofrh3jalonle4b-17110160861.asia-southeast1.run.app](https://ais-pre-w4tgqz33ofrh3jalonle4b-17110160861.asia-southeast1.run.app)
- **Public GitHub Repository**: `https://github.com/rahmat-ullah/preppilot-ai` *(Ensure repo visibility is set to PUBLIC)*

---

## 📌 Problem Statement

College students and self-directed learners spend up to **60% of their study time** manually organizing raw lecture materials—reading 50-page slides, creating handwritten flashcards, drafting practice questions, and organizing revision schedules—rather than actively studying and testing their understanding. 

**PrepPilot AI** eliminates this cognitive load. By ingesting raw lecture PDFs and text documents, PrepPilot AI leverages multimodal large language models to construct a complete, interactive, end-to-end **Study Kit** in under 15 seconds.

---

## ✨ Features

- 📑 **Multimodal PDF & Document Processing**: Upload lecture PDFs or paste raw notes up to 100,000 words. Extracts structured text directly in Node.js server pipelines.
- 🎯 **Comprehensive Study Kits**: Generates 5 high-impact study assets per document:
  - **Executive Summary**: Core concepts, key takeaways, and TL;DR highlights.
  - **Interactive Flashcards**: Flip-to-reveal cards with active recall tracking & keyboard navigation (`Left`/`Right` arrows, `Space`).
  - **Self-Grading Quizzes**: Multiple-choice assessment with instant answer explanations, score calculations, and grade ratings.
  - **Structured Key Topics**: Categorized topic breakdown with difficulty ratings and core formulas.
  - **Adaptive 5-Day Study Plan**: Actionable day-by-day revision strategy with prioritized milestones.
- ☁️ **Cloud Storage & Sync**: Firebase Auth & Cloud Firestore sync for saving, managing, and exporting study notes across sessions and devices.
- 📄 **Export Options**: Export study materials to clean, print-ready PDF reports or markdown files.
- 🎨 **SaaS-Grade UI & Themes**: Seamless Dark & Light mode toggle, responsive mobile drawer navigation, keyboard shortcuts, and smooth loading skeletons.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: React 18 with TypeScript & Vite
- **Styling**: Tailwind CSS, `clsx`, `tailwind-merge`
- **Animations**: `framer-motion` (Motion 12)
- **Icons**: `lucide-react`
- **Themes**: `next-themes`

### **Backend**
- **Runtime**: Node.js with Express & `tsx`
- **PDF Extraction**: `pdf-parse`
- **Bundler**: `esbuild` for production server build (`dist/server.cjs`)

### **AI & Database**
- **LLM Engine**: Google Gemini API (`@google/genai` SDK with `gemini-2.5-flash`)
- **Authentication**: Firebase Authentication
- **Database**: Cloud Firestore

---

## 🤖 AI Feature

The core intelligence behind PrepPilot AI is driven by **Google Gemini 2.5 Flash**. The backend routes incoming document payloads directly through Express proxy endpoints to Google GenAI services, keeping API keys strictly isolated from the client.

Gemini analyzes the full text structure and outputs a guaranteed **Structured JSON Object** defining the summary, flashcards, quiz questions, key topics, and study timeline with strict schema validation.

---

## 💡 Gemini Prompt Architecture

```typescript
const prompt = `
You are an expert academic tutor and study assistant. Analyze the following lecture text or document content and generate a comprehensive, highly structured Study Kit.

Required output format: JSON with the following exact schema:
{
  "title": "Clear concise subject title",
  "summary": "Detailed, well-structured summary in Markdown format using bullet points and headers",
  "keyTopics": [
    { "title": "Topic name", "description": "Core explanation", "importance": "High" | "Medium" | "Low" }
  ],
  "flashcards": [
    { "front": "Concept or Question", "back": "Clear, precise Answer or Explanation" }
  ],
  "quiz": [
    {
      "question": "Multiple choice question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Detailed explanation of why this answer is correct"
    }
  ],
  "studyPlan": [
    { "day": 1, "focus": "Core focus", "tasks": ["Task 1", "Task 2"] }
  ]
}

Document Content:
${documentText}
`;
```

---

## 🖼️ Screenshots

| Dashboard & Upload | Interactive Flashcards |
| :---: | :---: |
| ![Dashboard](https://placehold.co/600x350/0f172a/ffffff?text=PrepPilot+AI+Dashboard) | ![Flashcards](https://placehold.co/600x350/0f172a/ffffff?text=Interactive+Flashcards) |

| Quiz Assessment | Key Topics & Study Plan |
| :---: | :---: |
| ![Quiz](https://placehold.co/600x350/0f172a/ffffff?text=Self-Grading+Quiz) | ![Study Plan](https://placehold.co/600x350/0f172a/ffffff?text=5-Day+Study+Plan) |

---

## 📁 Folder Structure

```
.
├── server.ts                    # Express server entry point & Gemini/PDF proxy routes
├── index.html                   # Application HTML shell
├── metadata.json                # AI Studio application metadata
├── package.json                 # Dependencies & build scripts
├── firestore.rules              # Firebase Firestore security rules
├── firebase-applet-config.json  # Firebase client credentials
├── .env.example                 # Environment variables template
└── src/
    ├── main.tsx                 # React entry point
    ├── App.tsx                  # Primary application container & tab router
    ├── index.css                # Tailwind CSS global styles
    ├── types.ts                 # TypeScript interfaces for Study Kits & Auth
    ├── context/
    │   └── AuthContext.tsx      # Firebase Auth state provider & modal context
    ├── lib/
    │   ├── firebase.ts          # Firebase SDK initialization
    │   ├── firestoreNotes.ts    # Firestore CRUD operations for saved notes
    │   ├── gemini.ts            # Client-side API caller to backend /api/generate-notes
    │   ├── pdf.ts               # Client PDF text reader & backend uploader
    │   └── sampleData.ts        # Fallback CS 301 Data Structures sample note
    └── components/
        ├── Navbar.tsx           # Responsive header, drawer navigation & user menu
        ├── ThemeToggle.tsx      # Dark / Light / System theme selector
        ├── AuthModal.tsx        # Firebase Sign-in / Sign-up dialog
        ├── HeroLanding.tsx      # High-converting landing page & feature highlights
        ├── DashboardView.tsx    # Upload CTA, statistics, and recent notes grid
        ├── PdfUploader.tsx      # Drag-and-drop file upload & progress modal
        ├── StudyKitViewer.tsx   # Tabbed view for Summary, Flashcards, Quiz, Topics, Plan
        ├── SummaryView.tsx      # Markdown summary renderer
        ├── FlashcardsView.tsx   # Flip-cards with keyboard navigation & mastery tracking
        ├── QuizView.tsx         # Interactive multiple-choice exam simulation
        ├── TopicsView.tsx       # Breakdown of core concepts by priority
        ├── StudyPlanView.tsx    # Day-by-day revision milestone checklist
        └── HistoryView.tsx      # Saved study notes gallery with search & filters
```

---

## 📦 Installation

Clone the repository and install all node packages:

```bash
git clone https://github.com/your-username/preppilot-ai.git
cd preppilot-ai
npm install
```

---

## 🔑 Environment Variables

Copy `.env.example` to `.env` and fill in your API credentials:

```bash
cp .env.example .env
```

Required keys:
```env
# Server-side Google Gemini API Key (Secret - never exposed to browser)
GEMINI_API_KEY=your_gemini_api_key_here

# Client-side Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 🏃 Run Locally

Start the full-stack development server (Express + Vite on port 3000):

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:3000`.

---

## 🚀 Deployment

### **Deployment Options**

#### 1. **Vercel Deployment (Serverless Functions)**
- Push code to GitHub.
- Import project into Vercel.
- Configure `GEMINI_API_KEY` and `VITE_FIREBASE_*` environment variables in Vercel settings.
- Set Framework Preset to **Vite** or **Node.js Server**.

#### 2. **Docker / Cloud Run / Container Deployment**
To build the server for production:

```bash
# Build Vite client assets & compile server.ts into dist/server.cjs
npm run build

# Start the standalone server
npm run start
```

---

## 🔮 Future Improvements

- 🎙️ **Audio Lecture Transcriber**: Direct audio upload (MP3/M4A) with Gemini Multimodal Audio analysis.
- 📊 **Spaced Repetition System (SRS)**: SuperMemo SM-2 algorithm for optimized flashcard review scheduling.
- 👥 **Collaborative Study Groups**: Real-time shared notes & multiplayer quiz challenges.
- 📱 **Mobile Native Companion**: React Native companion app with offline flashcard sync.

---

## 👤 Author

Crafted with care by **Rahmat Ullah** (University of Balochistan, Quetta).

- **Email**: Rehmatkhan2014@gmail.com
- **Institution**: University of Balochistan, Quetta
- **GitHub**: [@your-username](https://github.com/your-username)
- **LinkedIn**: [Your Profile](https://linkedin.com/in/your-profile)

---

*PrepPilot AI — Master any subject in minutes, not hours.*
