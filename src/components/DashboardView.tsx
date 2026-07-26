import React from 'react';
import { useAuth } from '../context/AuthContext';
import { NoteRecord } from '../types';
import { 
  Upload, 
  BookOpen, 
  Sparkles, 
  Layers, 
  HelpCircle, 
  Calendar, 
  Clock, 
  ChevronRight,
  Plus
} from 'lucide-react';

interface DashboardViewProps {
  notes: NoteRecord[];
  onSelectNote: (note: NoteRecord) => void;
  onOpenUpload: () => void;
  onTrySample: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  notes,
  onSelectNote,
  onOpenUpload,
  onTrySample,
}) => {
  const { user } = useAuth();

  const totalFlashcards = notes.reduce(
    (acc, n) => acc + (n.analysis?.flashcards?.length || 0),
    0
  );
  const totalQuizQuestions = notes.reduce(
    (acc, n) => acc + (n.analysis?.quiz?.length || 0),
    0
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-blue-950/80 border border-indigo-500/30 backdrop-blur-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>PrepPilot AI Student Dashboard</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.displayName || 'Student'}! 👋
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
              Ready to prep for your exams? Upload your lecture PDFs or review your saved study kits below.
            </p>
          </div>

          <button
            onClick={onOpenUpload}
            className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xl shadow-indigo-600/30 flex items-center gap-2 shrink-0 transition-all active:scale-95"
          >
            <Upload className="w-4 h-4" />
            <span>Upload New Lecture PDF</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-sm dark:shadow-none">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{notes.length}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Analyzed Lectures</div>
        </div>

        <div className="p-5 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-sm dark:shadow-none">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3">
            <Layers className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalFlashcards}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Generated Flashcards</div>
        </div>

        <div className="p-5 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-sm dark:shadow-none">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalQuizQuestions}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Quiz MCQs Available</div>
        </div>

        <div className="p-5 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-sm dark:shadow-none">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-3">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{notes.length * 7}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Study Days Planned</div>
        </div>
      </div>

      {/* Recent Uploads Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recent Lecture Notes</h3>
          <button
            onClick={onTrySample}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load CS 301 Sample</span>
          </button>
        </div>

        {notes.length === 0 ? (
          <div className="p-10 text-center rounded-3xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-sm dark:shadow-none">
            <BookOpen className="w-10 h-10 mx-auto text-slate-400 dark:text-slate-500 mb-2" />
            <p className="text-sm font-bold text-slate-900 dark:text-white">No lecture notes analyzed yet</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Upload your first lecture PDF or load our pre-configured CS 301 Computer Systems sample.
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <button
                onClick={onOpenUpload}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all"
              >
                Upload PDF
              </button>
              <button
                onClick={onTrySample}
                className="px-5 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all"
              >
                Try Sample Lecture
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.slice(0, 4).map((note) => (
              <div
                key={note.id}
                onClick={() => onSelectNote(note)}
                className="p-5 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-indigo-500/50 hover:bg-slate-100 dark:hover:bg-white/10 transition-all cursor-pointer group flex items-center justify-between shadow-sm dark:shadow-none"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
                    PDF
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors line-clamp-1">
                      {note.title}
                    </h4>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      <span>{note.analysis?.flashcards?.length || 0} flashcards</span>
                      <span>•</span>
                      <span>{note.analysis?.quiz?.length || 0} MCQs</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
