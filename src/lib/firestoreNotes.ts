import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc 
} from './firebase';
import { NoteRecord, UserProfile } from '../types';

const LOCAL_STORAGE_KEY = 'preppilot_saved_notes';

/**
 * Timeout helper to prevent Firestore SDK calls from hanging indefinitely
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 2500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Firestore request timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

/**
 * Save user profile to Firestore `users` collection
 */
export async function saveUserProfileToFirestore(user: UserProfile): Promise<void> {
  if (!user || !user.uid) return;
  try {
    const userRef = doc(db, 'users', user.uid);
    await withTimeout(setDoc(userRef, {
      id: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'Student',
      createdAt: user.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { merge: true }), 2000);
  } catch (err) {
    console.warn('Firestore user profile sync warning:', err);
  }
}

/**
 * Save an AI study kit analysis to Firestore `notes` collection
 */
export async function saveNoteToFirestore(note: NoteRecord): Promise<void> {
  // 1. Always update local storage first for snappy UI
  try {
    const existing = localStorage.getItem(LOCAL_STORAGE_KEY);
    const list: NoteRecord[] = existing ? JSON.parse(existing) : [];
    const filtered = list.filter(n => n.id !== note.id);
    filtered.unshift(note);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.warn('Local storage write warning:', e);
  }

  // 2. Persist directly to Firestore `notes` collection with a 2.5s timeout safeguard
  try {
    const noteRef = doc(db, 'notes', note.id);
    await withTimeout(setDoc(noteRef, {
      id: note.id,
      userId: note.userId,
      title: note.title,
      summary: note.analysis.summary,
      importantTopics: note.analysis.importantTopics,
      flashcards: note.analysis.flashcards,
      quiz: note.analysis.quiz,
      simpleExplanation: note.analysis.simpleExplanation,
      studyPlan: note.analysis.studyPlan,
      createdAt: note.createdAt,
      fileSize: note.fileSize || 'PDF',
      pageCount: note.pageCount || 1,
      pdfTextSnippet: note.pdfTextSnippet || '',
      isMastered: note.isMastered || false,
      scorePercentage: note.scorePercentage || 0,
      chapterNumber: note.chapterNumber || 1,
    }), 2500);
  } catch (err: any) {
    console.warn('Firestore note save warning (using local backup):', err);
  }
}

/**
 * Fetch all notes for a specific logged-in user from Firestore
 */
export async function fetchUserNotesFromFirestore(userId: string): Promise<NoteRecord[]> {
  if (!userId) return [];

  try {
    const notesRef = collection(db, 'notes');
    const q = query(notesRef, where('userId', '==', userId));
    const querySnapshot = await withTimeout(getDocs(q), 2500);

    const fetchedNotes: NoteRecord[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      fetchedNotes.push({
        id: data.id || docSnap.id,
        userId: data.userId,
        title: data.title || 'Untitled Lecture Note',
        pdfTextSnippet: data.pdfTextSnippet || '',
        createdAt: data.createdAt || new Date().toISOString(),
        fileSize: data.fileSize || 'PDF',
        pageCount: data.pageCount || 1,
        isMastered: data.isMastered || false,
        scorePercentage: data.scorePercentage || 0,
        chapterNumber: data.chapterNumber || 1,
        analysis: {
          summary: data.summary || [],
          importantTopics: data.importantTopics || [],
          flashcards: data.flashcards || [],
          quiz: data.quiz || [],
          simpleExplanation: data.simpleExplanation || '',
          studyPlan: data.studyPlan || [],
        },
      });
    });

    // Sort by createdAt descending
    fetchedNotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (fetchedNotes.length > 0) {
      // Sync local storage with Firestore state
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fetchedNotes));
      } catch (e) {
        // ignore
      }
      return fetchedNotes;
    }
  } catch (err) {
    console.warn('Firestore fetch warning, falling back to local storage:', err);
  }

  // Fallback to local storage if offline or Firestore query returned empty/failed
  try {
    const existing = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (existing) {
      const list: NoteRecord[] = JSON.parse(existing);
      return list.filter(n => n.userId === userId || userId.startsWith('demo'));
    }
  } catch (e) {
    // ignore
  }

  return [];
}

/**
 * Delete a note from Firestore and local storage
 */
export async function deleteNoteFromFirestore(noteId: string): Promise<void> {
  try {
    const noteRef = doc(db, 'notes', noteId);
    await withTimeout(deleteDoc(noteRef), 2000);
  } catch (err) {
    console.warn('Firestore delete note warning:', err);
  }

  try {
    const existing = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (existing) {
      const list: NoteRecord[] = JSON.parse(existing);
      const filtered = list.filter(n => n.id !== noteId);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
    }
  } catch (e) {
    // ignore
  }
}

