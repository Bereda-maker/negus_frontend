'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { MessageCircle, X, Send, Sparkles, Phone, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api'; 

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const askQuestion = async () => {
    if (!question.trim()) return;
    if (!isAuthenticated) {
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: question },
        { role: 'assistant', content: 'Please log in to use the chatbot.' },
      ]);
      setQuestion('');
      return;
    }

    const userMsg = question.trim();
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setQuestion('');
    setLoading(true);

    try {
      // ✅ Use `api` instead of `axios` – automatically includes auth token
      const res = await api.post('/ai/chat', { question: userMsg });
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.data.data.answer },
      ]);
    } catch (error: any) {
      console.error('Chatbot error:', error);
      let errorMsg = 'Sorry, I’m having trouble answering right now. Please try again later.';
      if (error.response?.status === 401) {
        errorMsg = 'Your session has expired. Please log in again to continue.';
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: errorMsg },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Contact links
  const phoneNumber = '+251970737441';
  const whatsappLink = `https://wa.me/${phoneNumber.replace('+', '')}`;
  const telegramLink = `https://t.me/${phoneNumber.replace('+', '')}`;
  const callLink = `tel:${phoneNumber}`;

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[1001] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-gold text-white shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-gold/50 group"
        aria-label="Chat with Negus"
      >
        {isOpen ? (
          <X className="h-6 w-6 transition-transform group-hover:rotate-90" />
        ) : (
          <MessageCircle className="h-6 w-6 transition-transform group-hover:scale-110" />
        )}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-gold"></span>
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-[1001] flex h-[500px] w-[360px] max-h-[80vh] flex-col rounded-2xl border border-white/20 bg-white/80 backdrop-blur-md shadow-2xl transition-all duration-300 ease-out sm:w-80 md:w-96"
          style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
        >
          {/* Header */}
          <div className="relative flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-amber-500 to-gold px-4 py-3 text-white shadow-lg">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-white/80" />
              <span className="font-playfair text-lg font-bold tracking-wide">
                Negus Gebeya AI Assistant
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gold/20 scrollbar-track-transparent">
            {messages.length === 0 && (
              <div className="mt-8 flex flex-col items-center text-center text-textSecondary">
                <div className="mb-3 rounded-full bg-gold/10 p-3">
                  <MessageCircle className="h-8 w-8 text-gold" />
                </div>
                <p className="text-sm font-medium">How can I help you?</p>
                <p className="text-xs mt-1 max-w-[200px] opacity-70">
                  Ask about selling, buying, or anything about Negus Gebeya!
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-amber-400 to-gold text-white'
                      : 'bg-warm-bg/80 text-textPrimary backdrop-blur-sm border border-white/30'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl bg-warm-bg/80 px-4 py-2.5 backdrop-blur-sm">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gold [animation-delay:-0.3s]"></span>
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gold [animation-delay:-0.15s]"></span>
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gold"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Contact Bar */}
          <div className="border-t border-white/20 bg-white/30 px-4 py-2 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-textSecondary/70">
                Need human help?
              </span>
              <div className="flex gap-2">
                <a
                  href={telegramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0088cc] text-white shadow-sm transition-all hover:scale-110 hover:shadow-md"
                  aria-label="Telegram"
                >
                  <Send className="h-4 w-4" />
                </a>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25d366] text-white shadow-sm transition-all hover:scale-110 hover:shadow-md"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
                <a
                  href={callLink}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gold text-white shadow-sm transition-all hover:scale-110 hover:shadow-md"
                  aria-label="Call"
                >
                  <Phone className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-white/20 bg-white/50 p-3 backdrop-blur-sm">
            <form
              onSubmit={(e: FormEvent) => {
                e.preventDefault();
                askQuestion();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 rounded-full border-0 bg-white/70 px-4 py-2.5 text-sm text-textPrimary placeholder:text-textSecondary/60 shadow-inner ring-1 ring-gold/10 transition-all focus:ring-2 focus:ring-gold focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-gold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:hover:scale-100"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Chatbot;
