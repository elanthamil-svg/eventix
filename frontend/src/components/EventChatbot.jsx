import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import api from '../services/api';

export default function EventChatbot({ event }) {
  const [messages, setMessages] = useState([
    { role: 'ai', text: `Hi! I'm the Eventix AI assistant. Ask me anything about **${event?.title}**!` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = { role: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.post('/ai/chat', {
        eventId: event._id || event.id,
        message: userMsg.text,
        history: messages.slice(1)
      });

      if (response.data.success) {
        setMessages(prev => [...prev, { role: 'ai', text: response.data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I encountered an error answering that.' }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Network error. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="kaggle-card flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm" style={{ height: '400px' }}>
      {/* Header */}
      <div className="p-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
        <Bot className="w-5 h-5 text-kaggle-cyan" />
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">Event Assistant</h3>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-[#0a0e17]">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-kaggle-cyan/20 text-kaggle-cyan' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`text-xs p-3 rounded-2xl max-w-[85%] leading-relaxed ${msg.role === 'user' ? 'bg-kaggle-cyan text-slate-950 rounded-tr-sm font-medium' : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 rounded-tl-sm'}`}>
              {msg.text.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  <br />
                </span>
              ))}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="shrink-0 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="text-xs p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 rounded-tl-sm flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-kaggle-cyan" /> Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white dark:bg-[#0a0e17] border-t border-slate-200 dark:border-slate-800">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            placeholder="Ask about this event..."
            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-full py-2.5 pl-4 pr-10 focus:outline-none focus:ring-1 focus:ring-kaggle-cyan/50"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-1.5 rounded-full text-white bg-kaggle-cyan hover:bg-kaggle-cyan/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-3.5 h-3.5 text-slate-950" />
          </button>
        </form>
      </div>
    </div>
  );
}
