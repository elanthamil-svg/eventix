import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Sparkles, 
  RefreshCw, 
  Key, 
  Check, 
  Copy, 
  X, 
  ChevronDown,
  MessageSquare
} from 'lucide-react';
import api from '../services/api';

const QUICK_SUGGESTIONS = [
  '💡 Project Ideas',
  '🚀 How to Win & Pitch',
  '💻 Tech Stack & Code',
  '📅 Date & Timings',
  '💰 Registration Fee',
  '🏆 Prizes & Rewards',
  '🏨 Stays & Accommodations',
  '🛡️ Route Safety',
  '👥 Team Size & Rules',
  '🎓 Eligibility'
];

/**
 * Enhanced Markdown Parser for LLM Responses:
 * Formats fenced code blocks, inline code, bold, lists, and headers.
 */
function FormattedMessage({ text }) {
  if (!text) return null;

  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const segments = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: text.substring(lastIndex, match.index)
      });
    }
    segments.push({
      type: 'code',
      language: match[1] || 'code',
      content: match[2].trimEnd()
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({
      type: 'text',
      content: text.substring(lastIndex)
    });
  }

  return (
    <div className="space-y-2 leading-relaxed text-xs">
      {segments.map((seg, sIdx) => {
        if (seg.type === 'code') {
          return <CodeBlock key={sIdx} language={seg.language} code={seg.content} />;
        }
        return <TextSegment key={sIdx} rawText={seg.content} />;
      })}
    </div>
  );
}

function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-2 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 font-mono text-[11px] shadow-sm">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950 border-b border-slate-800 text-slate-400">
        <span className="font-bold text-[10px] uppercase text-slate-300">{language || 'code'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-white transition-colors text-[10px]"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-slate-200 leading-normal">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function TextSegment({ rawText }) {
  const lines = rawText.split('\n');

  return (
    <div className="space-y-1">
      {lines.map((line, lineIdx) => {
        if (!line.trim()) return <div key={lineIdx} className="h-1" />;

        if (line.startsWith('### ')) {
          return (
            <div key={lineIdx} className="font-bold text-slate-900 dark:text-white mt-2 mb-1">
              {line.replace('### ', '')}
            </div>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <div key={lineIdx} className="font-extrabold text-sm text-slate-900 dark:text-white mt-2.5 mb-1">
              {line.replace('## ', '')}
            </div>
          );
        }

        const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
        const isNumbered = /^\d+\.\s/.test(line.trim());
        const cleaned = line.trim().replace(/^[-*]\s+|\d+\.\s+/, '');

        const parts = cleaned.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

        const renderedLine = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={pIdx} className="font-bold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
          }
          if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={pIdx} className="italic">{part.slice(1, -1)}</em>;
          }
          if (part.startsWith('`') && part.endsWith('`')) {
            return (
              <code key={pIdx} className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-200 font-mono text-[10px]">
                {part.slice(1, -1)}
              </code>
            );
          }
          return part;
        });

        if (isBullet) {
          return (
            <div key={lineIdx} className="flex items-start gap-1.5 pl-1">
              <span className="text-slate-400 mt-0.5">•</span>
              <span className="flex-1">{renderedLine}</span>
            </div>
          );
        }

        if (isNumbered) {
          const numMatch = line.trim().match(/^(\d+)\.\s/);
          return (
            <div key={lineIdx} className="flex items-start gap-1.5 pl-1">
              <span className="font-bold text-slate-500">{numMatch ? numMatch[1] : '1'}.</span>
              <span className="flex-1">{renderedLine}</span>
            </div>
          );
        }

        return <p key={lineIdx}>{renderedLine}</p>;
      })}
    </div>
  );
}

export default function EventChatbot({ event }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [savedApiKey, setSavedApiKey] = useState(localStorage.getItem('gemini_user_api_key') || '');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const welcomeMsg = event
      ? `Hello! I'm your AI Assistant for **${event.title}** hosted by **${event.collegeName}**.\n\nAsk me anything about this competition: winning project ideas, pitch strategies, tech stacks, schedule, rules, route safety, or stays!`
      : `Hello! I'm your **Eventix AI Assistant**.\n\nAsk me anything about upcoming hackathons, campus events, project ideas, team building, travel safety, or accommodation recommendations!`;

    setMessages([
      {
        role: 'assistant',
        text: welcomeMsg,
        timestamp: new Date()
      }
    ]);
  }, [event]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  const toggleOpen = () => {
    setIsOpen(prev => !prev);
  };

  const handleReset = () => {
    const welcomeMsg = event
      ? `Conversation reset. How can I assist you with **${event.title}**?`
      : `Conversation reset. How can I assist your event discovery today?`;

    setMessages([
      {
        role: 'assistant',
        text: welcomeMsg,
        timestamp: new Date()
      }
    ]);
  };

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      localStorage.setItem('gemini_user_api_key', apiKeyInput.trim());
      setSavedApiKey(apiKeyInput.trim());
    } else {
      localStorage.removeItem('gemini_user_api_key');
      setSavedApiKey('');
    }
    setShowKeyModal(false);
  };

  const sendMessage = async (userText) => {
    const query = (userText || input).trim();
    if (!query || isLoading) return;

    const userMessage = {
      role: 'user',
      text: query,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // 1. Check if user configured local direct key
      const userKey = localStorage.getItem('gemini_user_api_key');
      
      let answer = '';
      if (userKey) {
        try {
          const directRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${userKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        text: `You are Eventix AI Assistant, an expert campus mentor and technical hackathon advisor.
Event Context: ${event ? JSON.stringify({ title: event.title, college: event.collegeName, category: event.category, prize: event.prizePool, date: event.eventDate, description: event.description }) : 'General Event Platform'}

Question from student: ${query}

Provide a concise, practical, high-value response with markdown formatting.`
                      }
                    ]
                  }
                ]
              })
            }
          );
          const directData = await directRes.json();
          if (directData?.candidates?.[0]?.content?.parts?.[0]?.text) {
            answer = directData.candidates[0].content.parts[0].text;
          }
        } catch (_directErr) {
          // Fall through to backend or client heuristic
        }
      }

      // 2. Try backend AI route
      if (!answer) {
        try {
          const res = await api.post('/ai/chat', {
            message: query,
            eventId: event?._id || event?.id,
            history: messages.slice(-4)
          });
          if (res.data?.success && res.data?.data) {
            answer = res.data.data;
          }
        } catch (_backendErr) {
          // Fall through to intelligent heuristic
        }
      }

      // 3. Fallback to client-side semantic reasoning engine
      if (!answer) {
        answer = getIntelligentAnswer(event, query);
      }

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: answer,
          timestamp: new Date()
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: getIntelligentAnswer(event, query),
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
        {!isOpen && (
          <button
            onClick={toggleOpen}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-xl border border-slate-800 dark:border-slate-200 text-xs font-bold transition-all transform hover:scale-105 active:scale-95"
            aria-label="Open AI Assistant"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ask AI</span>
          </button>
        )}
      </div>

      {/* Floating Chat Window */}
      {isOpen && (
        <div 
          className="fixed bottom-6 right-6 z-50 w-[calc(100vw-32px)] sm:w-[400px] h-[560px] max-h-[85vh] flex flex-col rounded-2xl bg-white dark:bg-[#121316] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-fadeIn"
        >
          {/* Header */}
          <div className="p-3.5 bg-white dark:bg-[#121316] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white">
                    Eventix Assistant
                  </h3>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                    Gemini AI
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  {event?.title ? event.title : 'Live technical advisor & guide'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setApiKeyInput(savedApiKey);
                  setShowKeyModal(true);
                }}
                title="Configure Gemini API Key"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Key className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleReset}
                title="Reset conversation"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={toggleOpen}
                title="Close chat"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-[#0E0E10]">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`p-3 rounded-2xl max-w-[85%] ${
                  msg.role === 'user'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-tr-xs shadow-sm font-medium'
                    : 'bg-white dark:bg-[#18191E] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-tl-xs shadow-xs'
                }`}>
                  <FormattedMessage text={msg.text} />
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2">
                <div className="text-xs p-3 rounded-2xl bg-white dark:bg-[#18191E] border border-slate-200 dark:border-slate-800 text-slate-500 rounded-tl-xs flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          <div className="px-3 py-2 bg-white dark:bg-[#121316] border-t border-slate-200 dark:border-slate-800/80 overflow-x-auto flex gap-1.5 scrollbar-none">
            {QUICK_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => sendMessage(suggestion.replace(/^[^\w\s]+/, '').trim())}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white dark:bg-[#121316] border-t border-slate-200 dark:border-slate-800">
            <form onSubmit={handleSubmit} className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask about ideas, code, rules, stays..."
                className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-full py-2.5 pl-4 pr-10 focus:outline-none focus:border-slate-400"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-1.5 p-1.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* API Key Modal */}
          {showKeyModal && (
            <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="p-5 max-w-xs w-full space-y-4 rounded-2xl bg-white dark:bg-[#18191E] border border-slate-200 dark:border-slate-800 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Gemini API Key</h4>
                  </div>
                  <button type="button" onClick={() => setShowKeyModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs">✕</button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Optionally configure your personal Gemini API Key for direct quota requests.
                </p>
                <div>
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowKeyModal(false)}
                    className="px-3 py-1 text-xs text-slate-500 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveApiKey}
                    className="px-4 py-1.5 rounded-full text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                  >
                    Save Key
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function getIntelligentAnswer(eventDetails, message) {
  const msg = (message || '').trim();
  const lower = msg.toLowerCase();
  const date = eventDetails?.eventDate
    ? new Date(eventDetails.eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : 'TBA';
  const fee = eventDetails?.entryFee != null
    ? (eventDetails.entryFee === 0 ? 'Free Entry' : `₹${eventDetails.entryFee}`)
    : 'Free Entry';
  const prize = eventDetails?.prizePool || '₹2,50,000';
  const venue = eventDetails?.venue || 'Campus Auditorium';
  const college = eventDetails?.collegeName || 'Host Campus';
  const category = eventDetails?.category || 'Technical Competition';
  const title = eventDetails?.title || 'This event';

  if (/how to win|win|strategy|preparation|prepare|tips|pitch|judge|scoring/.test(lower)) {
    return `🚀 **Winning Strategy for "${title}":**\n\n1. **Build a Working MVP:** Judges value a functioning interactive demo over slides. Focus on 1 core differentiator that works reliably.\n\n2. **The 3-Minute Pitch Formula:**\n   - **0:00 - 0:30:** Real problem hook + metric.\n   - **0:30 - 1:45:** Live working product demo.\n   - **1:45 - 2:30:** Architecture, Tech Stack, and AI edge.\n   - **2:30 - 3:00:** Scalability & Future roadmap.\n\n3. **Deploy Live:** Host your prototype on Vercel or Render so judges can test it on their phones!`;
  }

  if (/project idea|ideas|what to build|topics|problem statement/.test(lower)) {
    return `💡 **Top Winning Project Concepts for "${title}" (${category}):**\n\n1. **Autonomous Multimodal Workflow Agent:** On-device agent extracting structured insight from messy student documents.\n2. **Decentralized Verification Protocol:** Zero-knowledge proof verification for student achievements & credentials.\n3. **Smart Campus Energy Optimizer:** IoT and ML-driven peak demand scheduler.\n\nWhich direction fits your skills best? Ask me for code or architecture!`;
  }

  if (/python|javascript|react|code|script|algorithm|machine learning|deep learning|ai|fastapi|backend/.test(lower)) {
    return `💻 **Technical Implementation Guide for ${title}:**\n\n- Build with modular architecture: separate **Presentation (Frontend)**, **Business Logic (FastAPI / Node)**, and **Model/Data Layer**.\n- Include clean \`README.md\` documentation and demo video.\n\nLet me know if you need specific code generation or API endpoints!`;
  }

  if (/accommodat|stay|hotel|hostel|pg|dorm|room/.test(lower)) {
    return `🏨 **Accommodations near ${college}:**\n\n- Verified student hostels and hotels are available starting from **₹750/night**.\n- Check out the **Accommodations** tab to view verified stays with maps and price filters.`;
  }

  if (/safe|travel|route|reach|bus|train/.test(lower)) {
    return `🧭 **Travel & Route Safety:**\n\n- Venue: ${venue}, ${college}\n- Open the **AI Route & Safety Agent** tab for transit options and live navigation maps.`;
  }

  if (/fee|cost|price|register|pay/.test(lower)) {
    return `💰 **Registration & Fee:**\n\n- **Entry Fee:** ${fee}\n- Click **Register** on this page to confirm your entry.`;
  }

  if (/prize|award|cash|win/.test(lower)) {
    return `🏆 **Prizes & Certificates:**\n\n- **Total Prize Pool:** ${prize}\n- Verified digital certificate provided to all registered participants.`;
  }

  if (/team|solo|group|member/.test(lower)) {
    return `👥 **Team Size:**\n\n- You can participate as a **Solo Innovator (1)** or in **Teams of 2 to 4 members** from any college department.`;
  }

  if (/date|when|schedule|time/.test(lower)) {
    return `📅 **Schedule:**\n\n- **Event Date:** ${date}\n- **Venue:** ${venue} (${college})`;
  }

  return `✨ **Eventix Assistant:**\n\n**Regarding your query:** "${msg}"\n\n- **Campus:** ${college}\n- **Category:** ${category}\n- **Date:** ${date} | **Fee:** ${fee} | **Prize:** ${prize}\n\nAsk me for specific code snippets, pitch templates, travel directions, or project architectures!`;
}
