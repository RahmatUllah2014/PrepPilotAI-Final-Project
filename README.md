# PrepPilot AI — AI Study Kit & Chapter Mastery Engine 🎓⚡

> PrepPilot AI is an intelligent learning platform that transforms dense lecture PDFs, slides, and study materials into structured, interactive **Study Kits** featuring executive summaries, key topic breakdowns, flip flashcards, chapter final assessment tests with mastery tracking, AI tutor assistance, and personalized study schedules powered by **Google Gemini 2.5 Flash**.

---

## 🌐 Live Deployed URL & Repositories

- 🚀 **Live Deployed App**: [https://prep-pilot-ai-final-project.vercel.app/](https://prep-pilot-ai-final-project.vercel.app/)
- 📦 **GitHub Repository**: [https://github.com/RahmatUllah2014/PrepPilotAI-Final-Project](https://github.com/RahmatUllah2014/PrepPilotAI-Final-Project)

---

## 📌 Problem Statement & Target Audience

### **The Problem**
Students, university researchers, and self-directed learners routinely spend **over 60% of their total study time** manually processing raw lecture slides and textbooks—reading 50+ page PDFs, taking handwritten notes, creating flashcards, drafting practice questions, and organizing study timelines—rather than actively learning and testing their understanding.

### **The Solution & Audience**
**PrepPilot AI** eliminates manual note preparation for university students, high schoolers, and professional exam candidates. By uploading raw lecture PDFs or pasting course text, PrepPilot AI leverages multimodal large language models to construct an interactive, end-to-end **Study Kit** in under 15 seconds, complete with a **Chapter Mastery Assessment System** that validates learning and unlocks subsequent study chapters.

---

## ✨ Features List

1. 📄 **Multimodal PDF & Document Processing**
   - Direct PDF file upload and text extraction (supports up to 100,000 words).
   - Drag-and-drop file uploader with live page count and text snippet previews.
   - Built-in sample lecture generator for instant testing.

2. 🎯 **Automated AI Study Kit Generation**
   - **Executive Summary**: Key takeaways, core takeaways, and formatted markdown breakdowns.
   - **Key Topic Categorization**: Ranked concepts with importance tags (High / Medium / Low).
   - **Interactive Flip Flashcards**: Active-recall study mode with keyboard shortcuts (`Left`/`Right` arrows, `Space` bar) and flip animations.
   - **Chapter Final Assessment (Quiz Mode)**: Self-grading multiple-choice test with immediate feedback and detailed explanations for every option.
   - **5-Day Adaptive Study Plan**: Daily revision strategy with actionable task checklists.

3. 🏆 **Chapter Mastery & Progress Tracking**
   - Scoring 70%+ on a chapter final assessment earns **Chapter Mastered** status.
   - Automatic progression buttons allowing students to immediately jump to the next chapter upon mastering the current one.
   - Real-time statistics showing total study kits created, total questions answered, and total chapters mastered.

4. 🤖 **Interactive AI Academic Tutor Chatbot**
   - Integrated floating AI chat assistant for asking clarifying questions about any study note.
   - Context-aware answers based directly on the lecture contents.

5. ☁️ **Cloud Storage & Database Sync**
   - Firebase Authentication for personal student accounts.
   - Cloud Firestore integration for cross-device sync of all saved study kits, quiz scores, and chapter mastery states.

6. 📄 **Study Kit Export Options**
   - Download study notes as clean, formatted Markdown (`.md`) files.
   - Copy entire JSON structured study kits to clipboard for custom integrations.

7. 🎨 **Modern SaaS Design & Accessibility**
   - Fluid dark and light theme toggle.
   - Fully responsive layout for desktop, tablet, and mobile devices.
   - Smooth modal scrollability and intuitive keyboard focus states.

---

## 🤖 The AI Feature & System Prompt

The core intelligence behind PrepPilot AI is driven by **Google Gemini 2.5 Flash** (`@google/genai` SDK). All AI requests are routed through a secure Express backend server proxy (`/api/generate-notes`), ensuring API keys remain completely secret and hidden from client-side network inspect tools.

### **System Prompt & Instructions behind Gemini 2.5 Flash**

```typescript
// System instruction used in server.ts for generating structured Study Kits
const systemInstruction = `
You are an elite academic professor, expert tutor, and instructional designer. 
Your goal is to transform dense educational text or lecture notes into a hyper-structured, high-yield interactive Study Kit.

Guidelines for output:
1. Executive Summary: Provide an in-depth summary formatted in clean Markdown with key headers, bullet points, bold terms, and clear conceptual breakdowns.
2. Key Topics: Extract 3-6 core topics, assigning importance levels ("High", "Medium", "Low") and concise explanations.
3. Interactive Flashcards: Generate 5-10 high-impact Q&A flashcards designed for active recall.
4. Chapter Final Test (Quiz): Generate 5-10 challenging multiple-choice questions testing deep comprehension. Every question must include 4 options, the exact correct answer string, and a thorough explanation.
5. Study Plan: Provide a realistic 5-day step-by-step revision schedule.
`;

// Gemini API Call with Structured JSON Schema Output
const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: [
    { role: 'user', parts: [{ text: `Generate a complete Study Kit for the following lecture content:\n\n${pdfText}` }] }
  ],
  config: {
    systemInstruction,
    responseMimeType: 'application/json',
    responseSchema: studyKitJsonSchema, // Enforces exact TypeScript shape
    temperature: 0.2,
  },
});
```

---

## 🛠️ Tools, Services, and AI Models Used

| Category | Tools / Services / Technologies |
| :--- | :--- |
| **AI Model** | Google Gemini 2.5 Flash (`@google/genai` SDK) |
| **Frontend Framework** | React 18, TypeScript, Vite |
| **Styling & Icons** | Tailwind CSS v4, Lucide Icons, Framer Motion |
| **Backend Framework** | Node.js, Express, `tsx` server runner |
| **PDF Processing** | `pdf-parse` (Server-side PDF text extraction) |
| **Database & Auth** | Firebase Authentication, Cloud Firestore |
| **Hosting & Deployment** | Vercel |

---

## 🖼️ Screenshots of App in Action

### 1. Home Page of PrepPilotAI
![Home Page](https://6a6647612a4b54c07b28be65.imgix.net/sandbox/Home%20Page.png?crop=focalpoint&fit=crop)

### 2. Congratulation Messeage is Shown when a course is completed Successfully
![Completion Page](https://6a6647612a4b54c07b28be65.imgix.net/sandbox/Congratulation%20Page.png?crop=focalpoint&fit=crop)

### 3. Dashboard Page with Uploaded files.
![Dashboard](https://6a6647612a4b54c07b28be65.imgix.net/sandbox/Dashboard.png?crop=focalpoint&fit=crop)

### 4. Upload Page with Night Mode Function ON
![Upload Page](https://6a6647612a4b54c07b28be65.imgix.net/sandbox/Upload%20Page.png?crop=focalpoint&fit=crop)
*Take chapter tests, achieve mastery status (70%+), and seamlessly continue to subsequent chapters.

### 5. My Notes Page with Dark Mode ON
![My Notes Page](https://6a6647612a4b54c07b28be65.imgix.net/sandbox/DarkMode.png?crop=focalpoint&fit=crop)

### 6. My Notes Page with Light Mode ON
![My Notes Page](https://6a6647612a4b54c07b28be65.imgix.net/sandbox/My%20Notes%20Page.png?crop=focalpoint&fit=crop)

---

## 🛠️ How to Run the Project 

This project was developed and deployed using the following workflow:

1. **Build the Application**

   * The application was initially built using **Google AI Studio**, which helped generate and accelerate the development of the project's codebase.

2. **Set Up Firebase Firestore**

   * A **Firebase** project was created, and **Cloud Firestore** was configured as the application's database.
   * The required collections and security rules were set up to store and manage application data.

3. **Create a GitHub Repository**

   * The project source code was uploaded to a **GitHub** repository for version control, collaboration, and continuous deployment.

4. **Configure Environment Variables**

   * All required API keys and Firebase configuration values were stored in a local **`.env`** file.
   * The `.env` file was excluded from version control using `.gitignore` to keep sensitive information secure.
   * A `.env.example` file can be provided as a template for anyone who wants to run the project locally.

5. **Deploy with Vercel**

   * The GitHub repository was connected to **Vercel**.
   * The environment variables from the `.env` file were added to the Vercel project settings.
   * Vercel automatically built and deployed the application, enabling continuous deployment whenever changes were pushed to the main branch.

---

## 👤 Author

**Rahmat Ullah**
- **Institution**: University of Balochistan, Quetta
- **Email**: Rehmatkhan2014@gmail.com
- **GitHub**: [@RahmatUllah2014](https://github.com/RahmatUllah2014)

---

*PrepPilot AI — Master any subject chapter by chapter.*
