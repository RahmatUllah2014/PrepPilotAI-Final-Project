import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { fetchUserNotesFromFirestore, deleteNoteFromFirestore } from './lib/firestoreNotes';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { FeaturesSection } from './components/FeaturesSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { CtaSection } from './components/CtaSection';
import { PdfUploader } from './components/PdfUploader';
import { StudyKitViewer } from './components/StudyKitViewer';
import { DashboardView } from './components/DashboardView';
import { HistoryView } from './components/HistoryView';
import { AiChatModal } from './components/AiChatModal';
import { SAMPLE_NOTES } from './lib/sampleData';
import { NoteRecord } from './types';
import { BookOpen, MessageSquare, Sparkles } from 'lucide-react';

function AppContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'landing' | 'dashboard' | 'upload' | 'history' | 'studykit'>('landing');
  const [selectedNote, setSelectedNote] = useState<NoteRecord | null>(null);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);

  // AI Chat Pop-up state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatContext, setChatContext] = useState<{ pdfText: string; title: string }>({
    pdfText: '',
    title: '',
  });

  const [isLoadingNotes, setIsLoadingNotes] = useState(false);

  const [notes, setNotes] = useState<NoteRecord[]>(() => {
    try {
      const saved = localStorage.getItem('preppilot_saved_notes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      // ignore
    }
    return SAMPLE_NOTES;
  });

  // Fetch Firestore notes when user updates
  useEffect(() => {
    if (user && user.uid) {
      setIsLoadingNotes(true);
      fetchUserNotesFromFirestore(user.uid)
        .then((fsNotes) => {
          if (fsNotes && fsNotes.length > 0) {
            setNotes(fsNotes);
          }
        })
        .finally(() => {
          setIsLoadingNotes(false);
        });
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem('preppilot_saved_notes', JSON.stringify(notes));
    } catch (e) {
      // ignore
    }
  }, [notes]);

  const handleOpenChatWithText = (pdfText: string, title: string) => {
    setChatContext({ pdfText, title });
    setIsChatOpen(true);
  };

  const handleAnalysisComplete = (newRecord: NoteRecord) => {
    setNotes((prev) => [newRecord, ...prev.filter((n) => n.id !== newRecord.id)]);
    setSelectedNote(newRecord);
    setIsUploaderOpen(false);
    setActiveTab('studykit');
    setChatContext({
      pdfText: newRecord.pdfTextSnippet || newRecord.title,
      title: newRecord.title,
    });
    setIsChatOpen(true);
  };

  const handleTrySample = () => {
    const sample = SAMPLE_NOTES[0];
    setSelectedNote(sample);
    setActiveTab('studykit');
  };

  const handleSelectNote = (note: NoteRecord) => {
    setSelectedNote(note);
    setActiveTab('studykit');
  };

  const handleDeleteNote = async (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    await deleteNoteFromFirestore(id);
    if (selectedNote?.id === id) {
      setSelectedNote(null);
      setActiveTab('dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-sans relative overflow-x-hidden selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      {/* Frosted Glass Background Ambient Blur Circles */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-400/20 dark:bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-400/15 dark:bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'upload') {
            setIsUploaderOpen(true);
          }
        }}
        onOpenUpload={() => setIsUploaderOpen(true)}
      />

      {/* Upload Modal Overlay */}
      {isUploaderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <PdfUploader
            onAnalysisComplete={handleAnalysisComplete}
            onExtractAndOpenChat={(pdfText, title) => {
              setIsUploaderOpen(false);
              handleOpenChatWithText(pdfText, title);
            }}
            onCancel={() => setIsUploaderOpen(false)}
          />
        </div>
      )}

      {/* Global AI Chat Modal */}
      <AiChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        pdfText={chatContext.pdfText}
        title={chatContext.title}
      />

      {/* Floating Chat Trigger Button */}
      {(chatContext.pdfText || selectedNote) && !isChatOpen && !isUploaderOpen && (
        <button
          onClick={() => {
            if (chatContext.pdfText) {
              setIsChatOpen(true);
            } else if (selectedNote) {
              handleOpenChatWithText(selectedNote.pdfTextSnippet || selectedNote.title, selectedNote.title);
            }
          }}
          className="fixed bottom-6 right-6 z-40 p-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-full shadow-2xl shadow-indigo-600/50 flex items-center gap-2.5 font-bold text-xs transition-all hover:scale-105 active:scale-95 group"
          title="Open AI Chat Assistant"
        >
          <Sparkles className="w-5 h-5 text-indigo-200" />
          <span className="hidden sm:inline">Ask AI Tutor</span>
        </button>
      )}

      {/* Main Dynamic View Area */}
      <main className="flex-1 relative z-10">
        {/* Landing Page View */}
        {activeTab === 'landing' && (
          <div>
            <HeroSection
              onOpenUpload={() => setIsUploaderOpen(true)}
              onTrySample={handleTrySample}
            />
            <FeaturesSection />
            <HowItWorksSection />
            <CtaSection
              onOpenUpload={() => setIsUploaderOpen(true)}
              onTrySample={handleTrySample}
            />
          </div>
        )}

        {/* Dashboard View */}
        {activeTab === 'dashboard' && (
          <DashboardView
            notes={notes}
            onSelectNote={handleSelectNote}
            onOpenUpload={() => setIsUploaderOpen(true)}
            onTrySample={handleTrySample}
          />
        )}

        {/* Saved Notes / History View */}
        {activeTab === 'history' && (
          <HistoryView
            notes={notes}
            onSelectNote={handleSelectNote}
            onOpenUpload={() => setIsUploaderOpen(true)}
            onDeleteNote={handleDeleteNote}
            isLoading={isLoadingNotes}
          />
        )}

        {/* Study Kit Viewer View */}
        {activeTab === 'studykit' && (
          selectedNote ? (
            <StudyKitViewer
              note={selectedNote}
              onBack={() => setActiveTab('dashboard')}
              onOpenChat={() => {
                handleOpenChatWithText(selectedNote.pdfTextSnippet || selectedNote.title, selectedNote.title);
              }}
            />
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xl">
                <BookOpen className="w-8 h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">No Lecture Selected</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                Select a lecture note from your saved history or upload a new PDF to generate an interactive AI Study Kit.
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <button
                  onClick={() => setActiveTab('history')}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl transition-all shadow-sm"
                >
                  Browse Saved Notes ({notes.length})
                </button>
                <button
                  onClick={handleTrySample}
                  className="px-5 py-2.5 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-semibold text-xs rounded-xl transition-all"
                >
                  Load CS 301 Sample Note
                </button>
                <button
                  onClick={() => setIsUploaderOpen(true)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition-all shadow-lg shadow-indigo-600/20"
                >
                  Upload Lecture PDF
                </button>
              </div>
            </div>
          )
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
