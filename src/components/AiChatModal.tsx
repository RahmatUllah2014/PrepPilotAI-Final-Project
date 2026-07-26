import React, { useState, useRef, useEffect } from 'react';
import { sendChatQuestionToGemini, ChatMessage } from '../lib/gemini';
import { 
  MessageSquare, 
  Send, 
  X, 
  Sparkles, 
  Loader2, 
  Bot, 
  User, 
  HelpCircle, 
  FileText,
  RotateCcw,
  ChevronDown
} from 'lucide-react';

interface AiChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfText: string;
  title: string;
}

export const AiChatModal: React.FC<AiChatModalProps> = ({
  isOpen,
  onClose,
  pdfText,
  title,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `Hello! I'm your AI Study Assistant. I've read your extracted notes for **"${title || 'Lecture Note'}"**.\n\nAsk me anything about your PDF, request definitions, practice exam questions, or ask for a simple explanation!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

  const handleSend = async (questionText?: string) => {
    const textToSend = (questionText || input).trim();
    if (!textToSend || loading) return;

    setError('');
    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const answer = await sendChatQuestionToGemini(pdfText, title, newMessages, textToSend);
      const aiMsg: ChatMessage = {
        id: 'ai-' + Date.now(),
        sender: 'assistant',
        text: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err?.message || 'Failed to get an answer from Gemini AI.');
      const fallbackAiMsg: ChatMessage = {
        id: 'ai-err-' + Date.now(),
        sender: 'assistant',
        text: 'Sorry, I ran into an error generating an answer. Please make sure your server is running and try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackAiMsg]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    '⚡ Summarize the key takeaways',
    '❓ What are 3 likely exam questions?',
    '💡 Explain the core concept in plain terms',
    '📝 List important definitions',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl h-[90vh] max-h-[700px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">AI PDF Assistant</h3>
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
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-md'
                    : 'bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 rounded-tl-none shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">
                  {msg.text.split('\n').map((line, idx) => {
                    // Quick bold parser
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
                <span>Reading document & preparing answer...</span>
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

        {/* Quick Prompts */}
        <div className="p-2 sm:px-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-white/10 overflow-x-auto no-scrollbar flex items-center gap-2 shrink-0">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt.replace(/^[^a-zA-Z0-9]+/, ''))}
              disabled={loading}
              className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-indigo-500/10 hover:border-indigo-500/30 border border-slate-200 dark:border-white/10 text-[11px] font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap transition-all"
            >
              {prompt}
            </button>
          ))}
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
              placeholder="Ask a question about this extracted PDF..."
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
