import React, { useState, useEffect } from 'react';
import { Flashcard } from '../types';
import { RotateCw, ChevronLeft, ChevronRight, Shuffle, CheckCircle2, RefreshCw } from 'lucide-react';

interface FlashcardsViewProps {
  flashcards: Flashcard[];
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({ flashcards }) => {
  const [cards, setCards] = useState<Flashcard[]>(flashcards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<number[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if focus is inside input/textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev + 1) % cards.length);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cards.length]);

  if (!cards || cards.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
        No flashcards generated for this lecture yet.
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const isMastered = masteredIds.includes(currentIndex);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setMasteredIds([]);
  };

  const toggleMastered = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMastered) {
      setMasteredIds((prev) => prev.filter((id) => id !== currentIndex));
    } else {
      setMasteredIds((prev) => [...prev, currentIndex]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center">
      {/* Controls Bar */}
      <div className="w-full flex items-center justify-between mb-4 px-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Card {currentIndex + 1} of {cards.length}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            {masteredIds.length} / {cards.length} Mastered
          </span>
          <button
            onClick={handleShuffle}
            className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all text-xs flex items-center gap-1.5 shadow-sm dark:shadow-none"
            title="Shuffle deck"
          >
            <Shuffle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">Shuffle</span>
          </button>
        </div>
      </div>

      {/* 3D Flip Card Container */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full h-80 cursor-pointer perspective-1000 group"
      >
        <div
          className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front Side */}
          <div className="absolute inset-0 w-full h-full rounded-3xl p-8 bg-gradient-to-br from-white to-slate-100 dark:from-slate-900/90 dark:to-indigo-950/60 border border-slate-200 dark:border-white/10 group-hover:border-indigo-500/50 backdrop-blur-2xl shadow-xl dark:shadow-2xl flex flex-col justify-between backface-hidden">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <span>Question • Front</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">Click to reveal answer</span>
            </div>

            <div className="text-center my-auto px-4">
              <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-relaxed">
                {currentCard.question}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <button
                onClick={toggleMastered}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${
                  isMastered
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                    : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isMastered ? 'Mastered' : 'Mark as Mastered'}</span>
              </button>

              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <RotateCw className="w-3.5 h-3.5" />
                <span>Flip</span>
              </div>
            </div>
          </div>

          {/* Back Side */}
          <div className="absolute inset-0 w-full h-full rounded-3xl p-8 bg-gradient-to-br from-indigo-50 to-slate-100 dark:from-indigo-950/90 dark:to-slate-900/90 border border-indigo-200 dark:border-indigo-500/40 backdrop-blur-2xl shadow-xl dark:shadow-2xl flex flex-col justify-between backface-hidden rotate-y-180">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <span>Answer • Back</span>
              <span className="text-[10px] text-slate-400">Click to see question</span>
            </div>

            <div className="text-center my-auto px-4">
              <p className="text-lg sm:text-xl font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
                {currentCard.answer}
              </p>
            </div>

            <div className="flex items-center justify-end text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <RotateCw className="w-3.5 h-3.5" />
                <span>Flip back</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-4 mt-6">
        <button
          onClick={handlePrev}
          className="p-3 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white transition-all active:scale-95 shadow-sm dark:shadow-none"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 px-4">
          Click card or press arrows to navigate
        </span>

        <button
          onClick={handleNext}
          className="p-3 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white transition-all active:scale-95 shadow-sm dark:shadow-none"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

};
