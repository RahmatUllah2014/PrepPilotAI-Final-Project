export interface Flashcard {
  question: string;
  answer: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface NoteAnalysis {
  summary: string[];
  importantTopics: string[];
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  simpleExplanation: string;
  studyPlan: string[];
}

export interface NoteRecord {
  id: string;
  userId: string;
  title: string;
  pdfTextSnippet?: string;
  analysis: NoteAnalysis;
  createdAt: string;
  fileSize?: string;
  pageCount?: number;
  isMastered?: boolean;
  scorePercentage?: number;
  chapterNumber?: number;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  createdAt: string;
}
