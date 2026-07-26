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
  Plus,
  Award,
  CheckCircle2
} from 'lucide-react';

interface DashboardViewProps {
  notes: NoteRecord[];
  onSelectNote: (note: NoteRecord, targetTab?: 'summary' | 'topics' | 'flashcards' | 'quiz' | 'plan' | 'simple') => void;
  onOpenUpload: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  notes,
  onSelectNote,
  onOpenUpload,
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
  const masteredCount = notes.filter((n) => n.isMastered).length;

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
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3">
            <Award className="w-5 h-5" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-baseline gap-1">
            <span>{masteredCount}</span>
            <span className="text-xs text-slate-400 font-normal">/ {notes.length}</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Chapters Mastered</div>
        </div>
      </div>

      {/* Recent Uploads Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recent Lecture Notes</h3>
        </div>

        {notes.length === 0 ? (
          <div className="p-10 text-center rounded-3xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-sm dark:shadow-none">
            <BookOpen className="w-10 h-10 mx-auto text-slate-400 dark:text-slate-500 mb-2" />
            <p className="text-sm font-bold text-slate-900 dark:text-white">No lecture notes analyzed yet</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Upload your first lecture PDF to convert it into an interactive study kit.
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <button
                onClick={onOpenUpload}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                Upload PDF
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.slice(0, 4).map((note) => (
              <div
                key={note.id}
                className="p-5 rounded-2xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-indigo-500/50 transition-all group flex flex-col justify-between shadow-sm dark:shadow-none gap-4"
              >
                <div
                  onClick={() => onSelectNote(note, 'summary')}
                  className="flex items-start justify-between cursor-pointer gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shrink-0 text-xs">
                      PDF
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors line-clamp-1">
                          {note.title}
                        </h4>
                        {note.isMastered && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold flex items-center gap-1 shrink-0">
                            <CheckCircle2 className="w-3 h-3" /> Mastered
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                        {note.scorePercentage !== undefined && note.scorePercentage > 0 && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">• Score: {note.scorePercentage}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 shrink-0" />
                </div>

                {/* Conversion Shortcut Pills */}
                <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center gap-1.5 text-[10px]">
                  <button
                    onClick={() => onSelectNote(note, 'summary')}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
                  >
                    ⚡ Summary
                  </button>

                  <button
                    onClick={() => onSelectNote(note, 'quiz')}
                    className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 font-semibold hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors cursor-pointer"
                  >
                    ❓ Quiz ({note.analysis?.quiz?.length || 0})
                  </button>

                  <button
                    onClick={() => onSelectNote(note, 'flashcards')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
                  >
                    🃏 3D Cards ({note.analysis?.flashcards?.length || 0})
                  </button>

                  <button
                    onClick={() => onSelectNote(note, 'plan')}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors cursor-pointer"
                  >
                    📅 7-Day Plan
                  </button>

                  <button
                    onClick={() => onSelectNote(note, 'simple')}
                    className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors cursor-pointer"
                  >
                    💡 Explanation
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

