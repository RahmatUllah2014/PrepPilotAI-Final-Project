import React, { useState } from 'react';
import { NoteRecord } from '../types';
import { 
  Search, 
  BookOpen, 
  Clock, 
  Trash2, 
  ChevronRight, 
  Plus, 
  Sparkles,
  FileText,
  Layers,
  HelpCircle,
  Calendar,
  AlertTriangle,
  X,
  Filter,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface HistoryViewProps {
  notes: NoteRecord[];
  onSelectNote: (note: NoteRecord) => void;
  onOpenUpload: () => void;
  onDeleteNote: (id: string) => Promise<void> | void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  notes,
  onSelectNote,
  onOpenUpload,
  onDeleteNote,
  isLoading = false,
  error = null,
  onRetry,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [noteToDelete, setNoteToDelete] = useState<NoteRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Filter and sort notes
  const filteredNotes = notes
    .filter((n) => {
      const term = searchTerm.toLowerCase();
      const matchTitle = n.title.toLowerCase().includes(term);
      const matchSummary = n.analysis?.summary?.some((s) => s.toLowerCase().includes(term));
      const matchTopics = n.analysis?.importantTopics?.some((t) => t.toLowerCase().includes(term));
      return matchTitle || matchSummary || matchTopics;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        return a.title.localeCompare(b.title);
      }
    });

  const handleConfirmDelete = async () => {
    if (!noteToDelete) return;
    try {
      setIsDeleting(true);
      setDeleteError(null);
      await onDeleteNote(noteToDelete.id);
      setNoteToDelete(null);
    } catch (err: any) {
      setDeleteError(err?.message || 'Failed to delete note. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
              Study Library
            </span>
            <span className="text-xs text-slate-400">
              {notes.length} {notes.length === 1 ? 'Kit' : 'Kits'} Total
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Saved AI Study Kits</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Access your previously generated lecture summaries, flashcard decks, and quizzes stored in Firestore.
          </p>
        </div>

        <button
          onClick={onOpenUpload}
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New PDF</span>
        </button>
      </div>

      {/* Error Alert Banner if prop error exists */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-800 dark:text-rose-200 font-bold flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          )}
        </div>
      )}

      {/* Controls Bar: Search & Sort */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search study kits by title, summary keywords, or topics..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm dark:shadow-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-1.5 rounded-2xl shrink-0 shadow-sm dark:shadow-none">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl px-2.5 py-1.5 border border-slate-200 dark:border-white/10 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Title A-Z</option>
          </select>
        </div>
      </div>

      {/* Loading Skeleton State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-6 rounded-3xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 animate-pulse space-y-4"
            >
              <div className="h-4 w-20 bg-slate-200 dark:bg-white/10 rounded-full" />
              <div className="h-6 w-3/4 bg-slate-200 dark:bg-white/10 rounded-lg" />
              <div className="h-12 w-full bg-slate-100 dark:bg-white/5 rounded-xl" />
              <div className="h-4 w-1/2 bg-slate-200 dark:bg-white/10 rounded" />
            </div>
          ))}
        </div>
      ) : filteredNotes.length === 0 ? (
        /* Empty State */
        <div className="p-12 sm:p-16 text-center rounded-3xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-xl max-w-2xl mx-auto space-y-4 shadow-sm dark:shadow-none">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 dark:text-indigo-400 shadow-xl">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {searchTerm ? 'No matching study kits found' : 'Your study kit library is empty'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            {searchTerm
              ? `We couldn't find any saved notes matching "${searchTerm}". Try resetting your search query.`
              : 'Upload any course PDF or lecture document to generate instant summaries, interactive flashcards, quizzes, and 7-day study plans.'}
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm('')}
                className="px-5 py-2.5 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-800 dark:text-white text-xs font-bold rounded-xl transition-all"
              >
                Clear Search Filter
              </button>
            ) : (
              <button
                onClick={onOpenUpload}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Upload First PDF</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Notes Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotes.map((note) => {
            const summaryPreview = note.analysis?.summary?.[0] || 'AI Analyzed Lecture Study Kit';
            const secondSummary = note.analysis?.summary?.[1];
            const flashcardCount = note.analysis?.flashcards?.length || 0;
            const quizCount = note.analysis?.quiz?.length || 0;

            return (
              <div
                key={note.id}
                onClick={() => onSelectNote(note)}
                className="p-6 rounded-3xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-indigo-500/50 hover:bg-slate-100 dark:hover:bg-white/10 transition-all cursor-pointer group flex flex-col justify-between shadow-sm dark:shadow-xl hover:shadow-indigo-500/5"
              >
                <div>
                  {/* Card Top Row: Badge & Delete Icon */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                      Study Kit
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setNoteToDelete(note);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                      title="Delete study kit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* PDF Title */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug">
                    {note.title}
                  </h3>

                  {/* Summary Snippet Preview */}
                  <div className="mt-3 space-y-1.5">
                    <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed bg-slate-100 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200/80 dark:border-white/5">
                      "{summaryPreview}"
                    </p>
                    {secondSummary && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 italic px-1">
                        • {secondSummary}
                      </p>
                    )}
                  </div>

                  {/* Feature Chips */}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {flashcardCount > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        {flashcardCount} Cards
                      </span>
                    )}
                    {quizCount > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-[10px] font-semibold flex items-center gap-1">
                        <HelpCircle className="w-3 h-3" />
                        {quizCount} Quiz Qs
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-semibold flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      7-Day Plan
                    </span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-6 pt-3 border-t border-slate-200/80 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    {formatDate(note.createdAt)}
                  </span>

                  <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    View Kit <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {noteToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="max-w-md w-full p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-rose-500/30 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 dark:text-rose-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <button
                onClick={() => setNoteToDelete(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Study Kit?</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Are you sure you want to delete <span className="text-slate-900 dark:text-white font-semibold">"{noteToDelete.title}"</span>? This will remove the summary, flashcards, quiz, and study plan from Firestore.
              </p>
            </div>

            {deleteError && (
              <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                {deleteError}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setNoteToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Analysis</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
