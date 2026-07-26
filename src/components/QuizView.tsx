import React, { useState, useEffect } from 'react';
import { QuizQuestion, NoteRecord } from '../types';
import { 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Award, 
  ArrowRight, 
  Sparkles, 
  Trophy, 
  BookOpen, 
  GraduationCap, 
  ChevronRight,
  RotateCcw,
  Star
} from 'lucide-react';

interface QuizViewProps {
  quiz: QuizQuestion[];
  note?: NoteRecord;
  chapterNumber?: number;
  allNotes?: NoteRecord[];
  onMasteryAchieved?: (updatedNote: NoteRecord, scorePercentage: number) => void;
  onContinueToNextChapter?: (nextNote: NoteRecord) => void;
  onBackToDashboard?: () => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  quiz,
  note,
  chapterNumber,
  allNotes,
  onMasteryAchieved,
  onContinueToNextChapter,
  onBackToDashboard,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [hasSavedMastery, setHasSavedMastery] = useState(false);

  // Determine chapter number
  const currentChapterNum = chapterNumber || note?.chapterNumber || 1;

  // Determine next note/chapter if available
  const nextNote = React.useMemo(() => {
    if (!note || !allNotes || allNotes.length <= 1) return null;
    const currentIndexInList = allNotes.findIndex((n) => n.id === note.id);
    if (currentIndexInList !== -1 && currentIndexInList < allNotes.length - 1) {
      return allNotes[currentIndexInList + 1];
    }
    // Also check reverse array if sorted newest-first
    if (currentIndexInList > 0) {
      return allNotes[currentIndexInList - 1];
    }
    return null;
  }, [note, allNotes]);

  if (!quiz || quiz.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
        No quiz questions available for this lecture.
      </div>
    );
  }

  const currentQ = quiz[currentIndex];
  const userSelected = selectedAnswers[currentIndex];
  const isAnswered = userSelected !== undefined;

  const handleSelectOption = (option: string) => {
    if (isAnswered) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: option }));
  };

  const calculateScore = () => {
    let score = 0;
    quiz.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        score++;
      }
    });
    return score;
  };

  const handleNext = () => {
    if (currentIndex < quiz.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const score = calculateScore();
  const percentage = Math.round((score / quiz.length) * 100);
  const isPassed = percentage >= 70; // 70% required to master chapter

  // Auto-save mastery when results are calculated
  useEffect(() => {
    if (showResults && isPassed && note && onMasteryAchieved && !hasSavedMastery) {
      setHasSavedMastery(true);
      const updated: NoteRecord = {
        ...note,
        isMastered: true,
        scorePercentage: percentage,
        chapterNumber: currentChapterNum,
      };
      onMasteryAchieved(updated, percentage);
    }
  }, [showResults, isPassed, note, onMasteryAchieved, hasSavedMastery, percentage, currentChapterNum]);

  const handleRestart = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setShowResults(false);
    setHasSavedMastery(false);
  };

  if (showResults) {
    return (
      <div className="max-w-2xl mx-auto p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Celebration Background Glow for Mastered status */}
        {isPassed && (
          <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-emerald-500/15 via-indigo-500/10 to-transparent pointer-events-none" />
        )}

        <div className="relative z-10 text-center space-y-6">
          {/* Header Icon Badge */}
          <div className="flex justify-center">
            {isPassed ? (
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/30 animate-bounce">
                  <Trophy className="w-10 h-10" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md">
                  <Star className="w-5 h-5 fill-amber-400" />
                </div>
              </div>
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/30">
                <Award className="w-8 h-8" />
              </div>
            )}
          </div>

          {/* Title & Celebration Banner */}
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <GraduationCap className="w-4 h-4" />
              <span>Chapter {currentChapterNum} Final Assessment</span>
            </div>

            {isPassed ? (
              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                  🎉 Congratulations! You have mastered Chapter {currentChapterNum}!
                </h3>
                <p className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 font-semibold max-w-lg mx-auto">
                  "{note?.title || 'Lecture Note'}" • Chapter Mastery Unlocked
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Assessment Completed
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
                  You scored {percentage}%. A minimum score of 70% is required to master Chapter {currentChapterNum}.
                </p>
              </div>
            )}
          </div>

          {/* Score Card Box */}
          <div className={`p-6 rounded-2xl border text-center relative overflow-hidden ${
            isPassed 
              ? 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/30 text-slate-900 dark:text-white' 
              : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white'
          }`}>
            <div className="text-5xl font-black mb-1 tracking-tight">
              <span className={isPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}>
                {score}
              </span>
              <span className="text-2xl text-slate-400 font-normal"> / {quiz.length}</span>
            </div>

            <div className="text-sm font-bold mt-1">
              {isPassed ? '🌟 CHAPTER MASTERED!' : percentage >= 50 ? '👍 Good Effort! Almost There' : '📚 Keep Reviewing'}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Accuracy: <span className="font-extrabold text-slate-800 dark:text-slate-200">{percentage}%</span>
            </p>
          </div>

          {/* Question Review List */}
          <div className="text-left space-y-2.5 max-h-56 overflow-y-auto pr-2">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Question Performance Breakdown:
            </p>
            {quiz.map((q, idx) => {
              const isCorrect = selectedAnswers[idx] === q.correctAnswer;
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs ${
                    isCorrect
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold">{idx + 1}. {q.question}</p>
                    {isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    )}
                  </div>
                  <p className="text-[11px] mt-1 text-slate-600 dark:text-slate-300">
                    Your Answer: <span className="font-bold">{selectedAnswers[idx] || 'Not answered'}</span>
                  </p>
                  {!isCorrect && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                      Correct Answer: {q.correctAnswer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Next Steps Action Buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-3">
            {isPassed && nextNote && onContinueToNextChapter && (
              <button
                type="button"
                onClick={() => onContinueToNextChapter(nextNote)}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-extrabold rounded-2xl shadow-xl shadow-emerald-600/30 transition-all text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <BookOpen className="w-4 h-4" />
                <span>Continue Studying Chapter {(nextNote.chapterNumber || currentChapterNum + 1)}: {nextNote.title}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleRestart}
                className="py-3 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-800 dark:text-slate-200 font-bold rounded-xl transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake Chapter Test</span>
              </button>

              {onBackToDashboard && (
                <button
                  type="button"
                  onClick={onBackToDashboard}
                  className="py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Back to Student Dashboard</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 backdrop-blur-2xl shadow-xl dark:shadow-2xl">
      {/* Header Banner */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              Chapter {currentChapterNum} • Question {currentIndex + 1} of {quiz.length}
            </span>
            {note?.isMastered && (
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                Mastered ✓
              </span>
            )}
          </div>
          <div className="w-44 h-2 bg-slate-200 dark:bg-white/10 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-blue-400 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / quiz.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-500/20 text-xs font-bold text-indigo-600 dark:text-indigo-300">
          Chapter Final Test
        </div>
      </div>

      {/* Question Text */}
      <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-6 leading-relaxed">
        {currentQ.question}
      </h3>

      {/* Options List */}
      <div className="space-y-3 mb-8">
        {currentQ.options.map((option, idx) => {
          let btnStyle = 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-indigo-500/50 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200';

          if (isAnswered) {
            if (option === currentQ.correctAnswer) {
              btnStyle = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-800 dark:text-emerald-200 font-semibold';
            } else if (option === userSelected && option !== currentQ.correctAnswer) {
              btnStyle = 'bg-rose-500/20 border-rose-500/50 text-rose-800 dark:text-rose-200';
            } else {
              btnStyle = 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-400 opacity-60';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelectOption(option)}
              disabled={isAnswered}
              className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-3 cursor-pointer ${btnStyle}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-white/10 border border-slate-300 dark:border-white/10 flex items-center justify-center font-bold text-xs shrink-0 text-slate-800 dark:text-white">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span>{option}</span>
              </div>

              {isAnswered && option === currentQ.correctAnswer && (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0" />
              )}
              {isAnswered && option === userSelected && option !== currentQ.correctAnswer && (
                <XCircle className="w-5 h-5 text-rose-500 dark:text-rose-400 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between border-t border-slate-200 dark:border-white/10 pt-4">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {isAnswered ? 'Select Next to continue' : 'Select an option to answer'}
        </span>

        <button
          onClick={handleNext}
          disabled={!isAnswered}
          className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            isAnswered
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 active:scale-95'
              : 'bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-400 cursor-not-allowed'
          }`}
        >
          <span>{currentIndex < quiz.length - 1 ? 'Next Question' : 'Finish Chapter Test'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
