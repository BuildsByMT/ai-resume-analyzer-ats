import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { MessageSquare, X, Send, Trash2, Bot, Sparkles, AlertCircle } from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export const Chatbot: React.FC = () => {
  const { token, userApiKey } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = sessionStorage.getItem('resume_chatbot_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
      } catch {
        return [];
      }
    }
    return [];
  });
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Save messages to sessionStorage when updated
  useEffect(() => {
    sessionStorage.setItem('resume_chatbot_history', JSON.stringify(messages));
  }, [messages]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    setError(null);
    const userMessage: ChatMessage = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          messages: updatedMessages,
          userApiKey
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'bot',
            text: data.reply,
            timestamp: new Date()
          }
        ]);
      } else {
        throw new Error(data.message || data.error || 'Failed to generate response.');
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err.message || 'Unable to connect to the assistant. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  const clearChat = () => {
    setMessages([]);
    sessionStorage.removeItem('resume_chatbot_history');
    setError(null);
  };

  const quickQuestions = [
    { label: 'How to optimize my resume?', text: 'How do I optimize my resume for ATS scoring?' },
    { label: 'CV vs Resume?', text: 'What is the structural difference between a CV and a resume?' },
    { label: 'One page vs two pages?', text: 'If I have a one-page resume versus a two-page resume, what will it impact?' },
    { label: 'Which template is good?', text: 'Which resume template is good for modern tech jobs?' }
  ];

  // Simple Markdown Parser for bold text and list formatting
  const formatMessageText = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: React.ReactNode[] = [];

    const parseBoldText = (str: string) => {
      const parts = str.split(/(\*\*.*?\*\*)/g);
      return parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={idx} className="font-extrabold text-cyan-400">{part.slice(2, -2)}</strong>;
        }
        return part;
      });
    };

    lines.forEach((line, index) => {
      const isBullet = /^\s*[-*•]\s+(.*)/.test(line);
      const isNumbered = /^\s*\d+\.\s+(.*)/.test(line);

      if (isBullet || isNumbered) {
        const content = line.replace(/^\s*[-*•\d+.]\s+/, '');
        const formattedContent = parseBoldText(content);

        if (isBullet) {
          currentList.push(<li key={`li-${index}`} className="ml-3 list-disc text-xs sm:text-sm text-slate-300">{formattedContent}</li>);
        } else {
          currentList.push(<li key={`li-${index}`} className="ml-3 list-decimal text-xs sm:text-sm text-slate-300">{formattedContent}</li>);
        }
      } else {
        if (currentList.length > 0) {
          elements.push(
            <ul key={`ul-${index}`} className="space-y-1.5 my-2 pl-2">
              {currentList}
            </ul>
          );
          currentList = [];
        }

        const trimmed = line.trim();
        if (trimmed) {
          elements.push(
            <p key={`p-${index}`} className="text-xs sm:text-sm leading-relaxed mb-1.5 text-slate-300">
              {parseBoldText(line)}
            </p>
          );
        } else {
          elements.push(<div key={`br-${index}`} className="h-2" />);
        }
      }
    });

    if (currentList.length > 0) {
      elements.push(
        <ul key={`ul-final`} className="space-y-1.5 my-2 pl-2">
          {currentList}
        </ul>
      );
    }

    return elements;
  };

  return (
    <>
      {/* Floating Action Button (Trigger) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 md:bottom-6 right-6 z-40 p-4 bg-gradient-to-tr from-cyan-500 to-emerald-500 text-slate-950 rounded-full shadow-lg shadow-cyan-500/20 hover:scale-110 transition-transform duration-300 cursor-pointer flex items-center justify-center border border-cyan-400/20"
          title="Open Resume Assistant"
        >
          <MessageSquare size={24} className="animate-pulse" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 md:bottom-20 right-6 z-50 w-[calc(100vw-32px)] sm:w-96 h-[480px] sm:h-[550px] max-h-[calc(100vh-120px)] glass-card border border-slate-900 shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="bg-slate-950/80 px-4 py-3 border-b border-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                  Resume Optimizer AI
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </h3>
                <span className="text-[10px] text-slate-400 font-medium">ATS & Template Expert</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 border border-transparent hover:border-rose-500/10 rounded-lg transition-all duration-300 cursor-pointer"
                  title="Clear Chat History"
                >
                  <Trash2 size={14} />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-900 border border-transparent hover:border-slate-800 rounded-lg transition-all duration-300 cursor-pointer"
                title="Minimize Assistant"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Messages List Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-slate-950/30 flex flex-col">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col justify-center items-center text-center p-4 space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/10 to-emerald-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Sparkles size={24} />
                </div>
                <div className="space-y-2 max-w-xs">
                  <h4 className="text-sm font-bold text-slate-100">How can I help you optimize?</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    I can answer questions regarding ATS compatibility, formatting tips, one vs two page impacts, and template selections.
                  </p>
                </div>

                {/* Quick Questions Grid */}
                <div className="w-full grid grid-cols-1 gap-2 pt-2">
                  {quickQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q.text)}
                      className="text-left px-3 py-2 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-xs text-slate-300 hover:text-cyan-400 transition-all duration-300 cursor-pointer shadow-sm"
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-2.5 max-w-[85%] ${
                      msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'
                    }`}
                  >
                    {msg.sender === 'bot' && (
                      <div className="p-1 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400 shrink-0 mt-0.5">
                        <Bot size={13} />
                      </div>
                    )}
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl shadow-sm break-words select-text ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-semibold rounded-tr-none'
                          : 'bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-none'
                      }`}
                    >
                      {msg.sender === 'user' ? (
                        <p className="text-xs sm:text-sm leading-relaxed">{msg.text}</p>
                      ) : (
                        formatMessageText(msg.text)
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-start gap-2.5 self-start max-w-[85%]">
                    <div className="p-1 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400 shrink-0 mt-0.5">
                      <Bot size={13} />
                    </div>
                    <div className="px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-rose-500/5 border border-rose-500/10 text-rose-400 rounded-xl text-xs self-stretch">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Form Bar */}
          <div className="p-3 border-t border-slate-900 bg-slate-950/80 flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about resume writing or templates..."
              disabled={isLoading}
              className="flex-1 bg-slate-900/60 text-slate-100 text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder-slate-500 disabled:opacity-50"
            />
            <button
              onClick={() => handleSendMessage(inputValue)}
              disabled={!inputValue.trim() || isLoading}
              className="p-2.5 bg-gradient-to-tr from-cyan-500 to-emerald-500 text-slate-950 rounded-xl hover:scale-105 transition-transform duration-300 disabled:opacity-40 disabled:hover:scale-100 flex items-center justify-center shrink-0 cursor-pointer shadow-md"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
