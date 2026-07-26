import React, { useState, useRef, useEffect } from 'react';
import { sendChatQuestionToGemini, generateChatItemsWithGemini, ChatMessage } from '../lib/gemini';
import { saveNoteToFirestore } from '../lib/firestoreNotes';
import { NoteRecord, Flashcard, QuizQuestion } from '../types';
import { 
  Send, 
  X, 
  Sparkles, 
  Loader2, 
  Bot, 
  User, 
  HelpCircle, 
  FileText,
  Layers,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Plus,
  ArrowRight,
  Check,
  Sliders
} from 'lucide-react';

interface AiChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfText: string;
  title: string;
  selectedNote?: NoteRecord | null;
  onUpdateNote?: (updatedNote: NoteRecord) => void;
  onNavigateToStudyKit?: (tab?: 'flashcards' | 'quiz' | 'summary') => void;
}

export const AiChatModal: React.FC<AiChatModalProps> = ({
  isOpen,
  onClose,
  pdfText,
  title,
  selectedNote,
  onUpdateNote,
  onNavigateToStudyKit,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `Hello! I'm your AI Study Assistant. I've read your extracted notes for **"${title || 'Lecture Note'}"**.\n\nYou can ask me questions, or directly request **custom Flashcards or Quiz Questions** (e.g. "Create 10 flashcards" or "Generate a 5 question quiz").`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [error, setError] = useState('');
  const [customCount, setCustomCount] = useState<number>(5);

  // State maps for interactive components rendered in chat
  const [flashcardIndexMap, setFlashcardIndexMap] = useState<Record<string, number>>({});
  const [flashcardFlippedMap, setFlashcardFlippedMap] = useState<Record<string, boolean>>({});
  const [quizAnswersMap, setQuizAnswersMap] = useState<Record<string, Record<number, string>>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (questionText?: string, forcedType?: 'flashcards' | 'quiz', forcedCount?: number) => {
    const textToSend = (questionText || input).trim();
    if (!textToSend && !forcedType) return;
    if (loading) return;

    setError('');
    const promptText = textToSend || (forcedType === 'flashcards' ? `Generate ${forcedCount || customCount} flashcards` : `Create ${forcedCount || customCount} quiz questions`);

    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    // Detect if this is a flashcard or quiz generation request
    const lower = promptText.toLowerCase();
    let isFlashcardReq = forcedType === 'flashcards' || lower.includes('flashcard') || lower.includes('flash card') || lower.includes('cards');
    let isQuizReq = forcedType === 'quiz' || lower.includes('quiz') || lower.includes('mcq') || lower.includes('practice question') || lower.includes('exam questions');

    // Extract requested count from text if present (e.g., "10 flashcards", "make 7 quiz questions")
    let targetCount = forcedCount || customCount;
    const countMatch = lower.match(/(\d+)\s*(flashcard|flash card|card|quiz|question|mcq)s?/);
    if (countMatch && countMatch[1]) {
      const parsed = parseInt(countMatch[1], 10);
      if (!isNaN(parsed) && parsed > 0 && parsed <= 30) {
        targetCount = parsed;
      }
    }

    try {
      if (isFlashcardReq || isQuizReq) {
        const itemType = isFlashcardReq ? 'flashcards' : 'quiz';
        setLoadingText(`Generating ${targetCount} ${itemType === 'flashcards' ? 'AI Flashcards' : 'Practice Quiz Questions'} with Gemini...`);

        const result = await generateChatItemsWithGemini(pdfText, title, itemType, targetCount, promptText);

        const aiMsg: ChatMessage = {
          id: 'ai-' + Date.now(),
          sender: 'assistant',
          text: itemType === 'flashcards'
            ? `Here are **${result.items.length} AI Flashcards** generated directly from your lecture document! You can flip through them below, test your recall, or add them to your main Study Kit.`
            : `Here is a **${result.items.length}-Question Practice Quiz** created for your lecture! Test your knowledge below or save these questions to your Study Kit.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          generatedItems: {
            itemType,
            flashcards: itemType === 'flashcards' ? result.items as Flashcard[] : undefined,
            quiz: itemType === 'quiz' ? result.items as QuizQuestion[] : undefined,
            count: result.items.length,
            isAddedToNote: false,
          },
        };

        setMessages((prev) => [...prev, aiMsg]);
      } else {
        setLoadingText('Reading lecture context & generating AI answer...');
        const answer = await sendChatQuestionToGemini(pdfText, title, newMessages, promptText);
        const aiMsg: ChatMessage = {
          id: 'ai-' + Date.now(),
          sender: 'assistant',
          text: answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err?.message || 'Failed to get an answer from Gemini AI.');
      const fallbackAiMsg: ChatMessage = {
        id: 'ai-err-' + Date.now(),
        sender: 'assistant',
        text: 'Sorry, I ran into an error generating content. Please make sure your server is running and try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackAiMsg]);
    } finally {
      setLoading(false);
      setLoadingText('');
    }
  };

  const handleAddItemsToNote = async (msgId: string, itemType: 'flashcards' | 'quiz', items: any[]) => {
    if (!selectedNote) return;

    try {
      const updatedNote: NoteRecord = {
        ...selectedNote,
        analysis: {
          ...selectedNote.analysis,
          flashcards: itemType === 'flashcards'
            ? [...selectedNote.analysis.flashcards, ...items]
            : selectedNote.analysis.flashcards,
          quiz: itemType === 'quiz'
            ? [...selectedNote.analysis.quiz, ...items]
            : selectedNote.analysis.quiz,
        },
      };

      await saveNoteToFirestore(updatedNote);
      if (onUpdateNote) {
        onUpdateNote(updatedNote);
      }

      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === msgId && msg.generatedItems) {
            return {
              ...msg,
              generatedItems: {
                ...msg.generatedItems,
                isAddedToNote: true,
              },
            };
          }
          return msg;
        })
      );
    } catch (err) {
      console.error('Failed to append items to note:', err);
    }
  };

  const quickPrompts = [
    '⚡ Summarize key takeaways',
    '🃏 Generate 5 Flashcards',
    '🃏 Generate 10 Flashcards',
    '❓ Create 5 Quiz Qs',
    '❓ Create 10 Quiz Qs',
    '💡 Explain core concept in simple terms',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-3xl h-[92vh] max-h-[750px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">AI Study & Conversion Assistant</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold flex items-center gap-1 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Gemini 3.6
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                <FileText className="w-3 h-3 text-indigo-500" /> {title || 'Extracted Note'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
            title="Close Chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50 dark:bg-slate-950/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 text-xs shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-md'
                    : 'bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 rounded-tl-none shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">
                  {msg.text.split('\n').map((line, idx) => {
                    const parts = line.split(/(\*\*.*?\*\*)/g);
                    return (
                      <p key={idx} className={idx > 0 ? 'mt-1.5' : ''}>
                        {parts.map((part, pIdx) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={pIdx} className="font-bold text-indigo-600 dark:text-indigo-300">{part.slice(2, -2)}</strong>;
                          }
                          return part;
                        })}
                      </p>
                    );
                  })}
                </div>

                {/* Render Interactive Flashcards Carousel inside chat */}
                {msg.generatedItems && msg.generatedItems.itemType === 'flashcards' && msg.generatedItems.flashcards && msg.generatedItems.flashcards.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/10 space-y-3">
                    {(() => {
                      const cards = msg.generatedItems.flashcards!;
                      const currIdx = flashcardIndexMap[msg.id] || 0;
                      const isFlipped = !!flashcardFlippedMap[msg.id];
                      const card = cards[currIdx] || cards[0];

                      return (
                        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-indigo-500/20 shadow-sm space-y-3">
                          <div className="flex items-center justify-between text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                            <span className="flex items-center gap-1.5">
                              <Layers className="w-4 h-4" /> Card {currIdx + 1} of {cards.length}
                            </span>
                            <span className="text-slate-400 font-normal">Click card to flip</span>
                          </div>

                          {/* Flip Card Box */}
                          <div
                            onClick={() =>
                              setFlashcardFlippedMap((prev) => ({ ...prev, [msg.id]: !prev[msg.id] }))
                            }
                            className={`min-h-[120px] p-5 rounded-xl border flex flex-col justify-center items-center text-center cursor-pointer transition-all duration-300 transform select-none ${
                              isFlipped
                                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md rotate-x-180'
                                : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-white/10 hover:border-indigo-400'
                            }`}
                          >
                            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 dark:text-indigo-300 mb-1">
                              {isFlipped ? 'Answer' : 'Question'}
                            </span>
                            <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                              {isFlipped ? card.answer : card.question}
                            </p>
                          </div>

                          {/* Controls */}
                          <div className="flex items-center justify-between pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setFlashcardFlippedMap((prev) => ({ ...prev, [msg.id]: false }));
                                setFlashcardIndexMap((prev) => ({
                                  ...prev,
                                  [msg.id]: (currIdx - 1 + cards.length) % cards.length,
                                }));
                              }}
                              className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 transition-all"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" /> Prev
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setFlashcardFlippedMap((prev) => ({ ...prev, [msg.id]: !prev[msg.id] }))
                              }
                              className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-xs font-semibold flex items-center gap-1 transition-all"
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> Flip Card
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setFlashcardFlippedMap((prev) => ({ ...prev, [msg.id]: false }));
                                setFlashcardIndexMap((prev) => ({
                                  ...prev,
                                  [msg.id]: (currIdx + 1) % cards.length,
                                }));
                              }}
                              className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 transition-all"
                            >
                              Next <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Render Interactive Quiz Questions inside chat */}
                {msg.generatedItems && msg.generatedItems.itemType === 'quiz' && msg.generatedItems.quiz && msg.generatedItems.quiz.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/10 space-y-3">
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-purple-500/20 shadow-sm space-y-4">
                      <div className="flex items-center justify-between text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                          <HelpCircle className="w-4 h-4" /> Practice Quiz ({msg.generatedItems.quiz.length} Questions)
                        </span>
                      </div>

                      <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
                        {msg.generatedItems.quiz.map((q, qIdx) => {
                          const userAns = quizAnswersMap[msg.id]?.[qIdx];
                          const isAnswered = !!userAns;

                          return (
                            <div key={qIdx} className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10 space-y-2 text-xs">
                              <p className="font-bold text-slate-900 dark:text-white">
                                {qIdx + 1}. {q.question}
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {q.options.map((opt, oIdx) => {
                                  const isSelected = userAns === opt;
                                  const isCorrect = opt === q.correctAnswer;

                                  let btnStyle = 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 hover:border-purple-400';
                                  if (isAnswered) {
                                    if (isCorrect) {
                                      btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold';
                                    } else if (isSelected) {
                                      btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-700 dark:text-rose-300 font-bold';
                                    } else {
                                      btnStyle = 'opacity-50 bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10';
                                    }
                                  }

                                  return (
                                    <button
                                      key={oIdx}
                                      type="button"
                                      onClick={() => {
                                        setQuizAnswersMap((prev) => ({
                                          ...prev,
                                          [msg.id]: {
                                            ...(prev[msg.id] || {}),
                                            [qIdx]: opt,
                                          },
                                        }));
                                      }}
                                      className={`p-2 rounded-lg border text-left text-[11px] transition-all flex items-center justify-between ${btnStyle}`}
                                    >
                                      <span>{opt}</span>
                                      {isAnswered && isCorrect && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Save to Study Kit Action Buttons */}
                {msg.generatedItems && (
                  <div className="mt-3 pt-2 flex flex-wrap items-center gap-2">
                    {msg.generatedItems.isAddedToNote ? (
                      <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Added to My Study Kit!
                      </div>
                    ) : (
                      selectedNote && (
                        <button
                          type="button"
                          onClick={() =>
                            handleAddItemsToNote(
                              msg.id,
                              msg.generatedItems!.itemType,
                              msg.generatedItems!.itemType === 'flashcards'
                                ? msg.generatedItems!.flashcards!
                                : msg.generatedItems!.quiz!
                            )
                          }
                          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add {msg.generatedItems.count} {msg.generatedItems.itemType === 'flashcards' ? 'Flashcards' : 'Quiz Qs'} to Study Kit</span>
                        </button>
                      )
                    )}

                    {onNavigateToStudyKit && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onNavigateToStudyKit(msg.generatedItems?.itemType === 'flashcards' ? 'flashcards' : 'quiz');
                        }}
                        className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <span>Open {msg.generatedItems?.itemType === 'flashcards' ? 'Flashcards' : 'Quiz'} Tab</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}

                <div
                  className={`text-[10px] mt-2 text-right ${
                    msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 text-xs shadow-sm">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 text-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400" />
                <span>{loadingText || 'Reading document & preparing answer...'}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs text-center">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts & Item Generators */}
        <div className="p-2.5 sm:px-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-white/10 space-y-2 shrink-0">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <span>Quick AI Conversions & Prompts:</span>
            <div className="flex items-center gap-1.5">
              <Sliders className="w-3 h-3 text-indigo-500" />
              <span>Default Count:</span>
              <select
                value={customCount}
                onChange={(e) => setCustomCount(parseInt(e.target.value, 10))}
                className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold px-1.5 py-0.5 rounded text-[11px] focus:outline-none"
              >
                <option value={3}>3</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto no-scrollbar flex items-center gap-2 pb-1">
            <button
              onClick={() => handleSend(undefined, 'flashcards', customCount)}
              disabled={loading}
              className="px-3 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap transition-all flex items-center gap-1"
            >
              <Layers className="w-3 h-3" />
              <span>Generate {customCount} Flashcards</span>
            </button>

            <button
              onClick={() => handleSend(undefined, 'quiz', customCount)}
              disabled={loading}
              className="px-3 py-1.5 rounded-full bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-[11px] font-bold text-purple-600 dark:text-purple-400 whitespace-nowrap transition-all flex items-center gap-1"
            >
              <HelpCircle className="w-3 h-3" />
              <span>Create {customCount} Quiz Qs</span>
            </button>

            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-indigo-500/10 hover:border-indigo-500/30 border border-slate-200 dark:border-white/10 text-[11px] font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Footer */}
        <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-white/10 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Ask anything or type "create 10 flashcards" / "make 5 quiz questions"...'
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
