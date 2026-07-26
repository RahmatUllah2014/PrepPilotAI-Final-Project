import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { CheckCircle2, XCircle, RefreshCw, Award, ArrowRight, HelpCircle } from 'lucide-react';

interface QuizViewProps {
  quiz: QuizQuestion[];
}

export const QuizView: React.FC<QuizViewProps> = ({ quiz }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);

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
    if (isAnswered) return; // Prevent changing after selected
    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: option }));
  };

  const handleNext = () => {
    if (currentIndex < quiz.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowResults(true);
    }
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

  const handleRestart = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setShowResults(false);
  };

  if (showResults) {
    const score = calculateScore();
    const percentage = Math.round((score / quiz.length) * 100);

    return (
      <div className="max-w-xl mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 backdrop-blur-2xl shadow-xl dark:shadow-2xl text-center">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-500 to-blue-500 rounded-3xl flex items-center justify-center text-white mb-4 shadow-xl shadow-indigo-500/30">
          <Award className="w-8 h-8" />
        </div>

        <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">Quiz Completed!</h3>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Here is your performance breakdown</p>

        <div className="my-6 p-6 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
          <div className="text-5xl font-black text-indigo-600 dark:text-indigo-400 mb-2">
            {score} / {quiz.length}
          </div>
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {percentage >= 80 ? '🌟 Outstanding Mastery!' : percentage >= 60 ? '👍 Good Effort! Keep Reviewing' : '📚 Needs Practice'}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Score: {percentage}%
          </p>
        </div>

        {/* Question-by-Question Review */}
        <div className="text-left space-y-3 mb-6 max-h-60 overflow-y-auto pr-2">
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
                <p className="font-semibold">{idx + 1}. {q.question}</p>
                <p className="text-[11px] mt-1 text-slate-600 dark:text-slate-300">
                  Your Answer: <span className="font-bold">{selectedAnswers[idx] || 'Not answered'}</span>
                </p>
                {!isCorrect && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    Correct: {q.correctAnswer}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={handleRestart}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all text-xs flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retake Quiz</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 backdrop-blur-2xl shadow-xl dark:shadow-2xl">
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            Question {currentIndex + 1} of {quiz.length}
          </span>
          <div className="w-36 h-2 bg-slate-200 dark:bg-white/10 rounded-full mt-1.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-blue-400 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / quiz.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-700 dark:text-slate-300">
          10 MCQ Self-Test
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
              className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-3 ${btnStyle}`}
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

      {/* Next Button */}
      <div className="flex items-center justify-between border-t border-slate-200 dark:border-white/10 pt-4">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {isAnswered ? 'Select Next to continue' : 'Select an option to answer'}
        </span>

        <button
          onClick={handleNext}
          disabled={!isAnswered}
          className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            isAnswered
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 active:scale-95'
              : 'bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-400 cursor-not-allowed'
          }`}
        >
          <span>{currentIndex < quiz.length - 1 ? 'Next Question' : 'Finish Quiz'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

};
