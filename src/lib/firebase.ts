import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  deleteDoc
} from 'firebase/firestore';
// Safely attempt to read firebase-applet-config.json if present
let firebaseConfig: Record<string, string> = {};
try {
  // @ts-ignore
  firebaseConfig = import.meta.glob('../../firebase-applet-config.json', { eager: true })['../../firebase-applet-config.json']?.default || {};
} catch (e) {
  // fallback to empty
}

const rawApiKey = import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey;
const rawProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId;

const config = {
  apiKey: rawApiKey || 'AIzaSyDemoKeyForPrepPilotVercelBuild12345',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain || 'preppilot-demo.firebaseapp.com',
  projectId: rawProjectId || 'preppilot-demo',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket || 'preppilot-demo.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId || '1234567890',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfig.appId || '1:1234567890:web:abcdef',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || firebaseConfig.measurementId || '',
};

let app: any;
let auth: any;
let db: any;

try {
  app = !getApps().length ? initializeApp(config) : getApp();
  auth = getAuth(app);
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);
} catch (err) {
  console.warn('Firebase initialization warning:', err);
  try {
    app = getApps().length ? getApp() : initializeApp({ apiKey: 'demo-key', projectId: 'demo-project' });
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (e) {
    auth = {} as any;
    db = {} as any;
  }
}

export const googleProvider = new GoogleAuthProvider();
export { app, auth, db };


export { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  firebaseSignOut, 
  onAuthStateChanged,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc
};
export type { User };

