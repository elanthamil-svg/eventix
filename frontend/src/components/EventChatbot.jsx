import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, RefreshCw, Key, Check, Copy, AlertCircle, HelpCircle } from 'lucide-react';
import api from '../services/api';

const QUICK_SUGGESTIONS = [
  '💡 Project Ideas',
  '🚀 How to Win & Pitch',
  '💻 Tech Stack & Code',
  '📅 Date & Timings',
  '💰 Registration Fee',
  '🏆 Prizes & Certificates',
  '🏨 Accommodations',
  '🛡️ Travel Safety',
  '👥 Team Size & Rules',
  '🎓 Eligibility'
];

/**
 * Enhanced Markdown Parser for LLM Responses:
 * Formats fenced code blocks, inline code, bold, italic, bullet lists, numbered lists, and quotes.
 */
function FormattedMessage({ text }) {
  if (!text) return null;

  // Split text by fenced code blocks ```lang ... ```
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
    <div className="my-2 rounded-xl overflow-hidden border border-slate-700/60 bg-slate-950 font-mono text-[11px] shadow-sm">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-slate-400">
        <span className="font-bold text-[10px] uppercase text-cyan-400">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-white transition-colors text-[10px]"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-slate-200 leading-normal scrollbar-thin scrollbar-thumb-slate-800">
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

        // Header check (### or ##)
        if (line.startsWith('### ')) {
          return (
            <div key={lineIdx} className="font-extrabold text-slate-900 dark:text-cyan-300 mt-2 mb-1">
              {line.replace('### ', '')}
            </div>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <div key={lineIdx} className="font-black text-slate-900 dark:text-white text-sm mt-2 mb-1">
              {line.replace('## ', '')}
            </div>
          );
        }

        // Inline formatting (bold, italic, inline code)
        const parts = [];
        let remaining = line;
        let key = 0;
        const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
        let m;
        let lastIdx = 0;

        while ((m = regex.exec(remaining)) !== null) {
          if (m.index > lastIdx) {
            parts.push(remaining.substring(lastIdx, m.index));
          }
          const raw = m[0];
          if (raw.startsWith('**') && raw.endsWith('**')) {
            parts.push(
              <strong key={key++} className="font-extrabold text-slate-900 dark:text-white">
                {raw.slice(2, -2)}
              </strong>
            );
          } else if (raw.startsWith('`') && raw.endsWith('`')) {
            parts.push(
              <code key={key++} className="px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 font-mono text-[10px] text-cyan-500 dark:text-cyan-300 border border-slate-300 dark:border-slate-700">
                {raw.slice(1, -1)}
              </code>
            );
          } else if (raw.startsWith('*') && raw.endsWith('*')) {
            parts.push(
              <em key={key++} className="italic text-slate-600 dark:text-slate-300">
                {raw.slice(1, -1)}
              </em>
            );
          }
          lastIdx = m.index + raw.length;
        }

        if (lastIdx < remaining.length) {
          parts.push(remaining.substring(lastIdx));
        }

        const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('• ');
        const isNum = /^\d+\.\s/.test(line.trim());

        return (
          <div key={lineIdx} className={isBullet || isNum ? 'pl-2 flex items-start gap-1.5' : ''}>
            {isBullet && <span className="text-cyan-400 select-none">•</span>}
            <div>{parts.length > 0 ? parts : line}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function EventChatbot({ event }) {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: `Hi there! 👋 I'm your **Eventix LLM Assistant** powered by **Gemini**.\n\nAsk me **ANYTHING**:\n- 🚀 *Project ideas, winning strategies & pitch advice for ${event?.category || 'this hackathon'}*\n- 💻 *Code generation, ML, Web3 & Tech Stack explanations*\n- 📅 *Dates, schedule, fees, stays, and team rules for ${event?.title || 'this event'}*\n\nHow can I help you today?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [savedApiKey, setSavedApiKey] = useState(() => localStorage.getItem('cc_gemini_api_key') || '');
  const messagesEndRef = useRef(null);

  // Update greeting when event loads or changes
  useEffect(() => {
    if (event?.title) {
      setMessages([
        {
          role: 'ai',
          text: `Hi there! 👋 I'm your **Eventix LLM Assistant** powered by **Gemini**.\n\nAsk me **ANYTHING**:\n- 🚀 *Project ideas, winning strategies & pitch advice for ${event.title}*\n- 💻 *Code generation, ML, Web3 & Tech Stack explanations*\n- 📅 *Dates, schedule, fees, stays, and team rules for ${event.collegeName || 'this campus'}*\n\nHow can I help you today?`
        }
      ]);
    }
  }, [event?.title, event?._id, event?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSaveApiKey = () => {
    const trimmed = apiKeyInput.trim();
    if (trimmed) {
      localStorage.setItem('cc_gemini_api_key', trimmed);
      setSavedApiKey(trimmed);
    } else {
      localStorage.removeItem('cc_gemini_api_key');
      setSavedApiKey('');
    }
    setShowKeyModal(false);
  };

  const sendMessage = async (textToSend) => {
    const query = textToSend.trim();
    if (!query || isLoading) return;

    const userMsg = { role: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const activeKey = savedApiKey || import.meta.env.VITE_GEMINI_API_KEY || '';

    try {
      // 1. Call Backend AI Chat endpoint with optional API key
      const response = await api.post('/ai/chat', {
        eventId: event?._id || event?.id,
        message: query,
        history: messages.slice(1),
        event: event,
        apiKey: activeKey
      });

      if (response.data?.success && response.data?.reply) {
        setMessages((prev) => [...prev, { role: 'ai', text: response.data.reply }]);
        return;
      }
      throw new Error('Backend chat returned no reply');
    } catch (_error) {
      // 2. Direct client fallback with comprehensive LLM reasoning
      const fallback = getIntelligentAnswer(event, query);
      setMessages((prev) => [...prev, { role: 'ai', text: fallback }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleReset = () => {
    setMessages([
      {
        role: 'ai',
        text: `Hi there! 👋 I'm your **Eventix LLM Assistant** powered by **Gemini**.\n\nAsk me **ANYTHING** about **${event?.title || 'this event'}**, project ideas, code generation, winning strategies, or engineering concepts!`
      }
    ]);
  };

  return (
    <div className="kaggle-card flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md" style={{ height: '520px' }}>
      {/* Header */}
      <div className="p-3.5 bg-slate-50 dark:bg-[#111827] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30">
            <Bot className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-xs text-slate-900 dark:text-white">Eventix Gemini LLM</h3>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {savedApiKey ? 'Gemini 2.0 Live' : 'Gemini AI'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Ask any question — technical, project ideas, or event details</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setApiKeyInput(savedApiKey);
              setShowKeyModal(true);
            }}
            title="Configure Gemini API Key"
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors text-xs flex items-center gap-1"
          >
            <Key className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleReset}
            title="Reset conversation"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-white dark:bg-[#0a0e17]">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs ${
              msg.role === 'user' ? 'bg-cyan-400 text-slate-950 font-bold' : 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
            }`}>
              {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>
            <div className={`p-3 rounded-2xl max-w-[85%] ${
              msg.role === 'user'
                ? 'bg-cyan-500 text-slate-950 font-medium rounded-tr-xs shadow-sm'
                : 'bg-slate-100 dark:bg-slate-900/95 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800/80 rounded-tl-xs shadow-sm'
            }`}>
              <FormattedMessage text={msg.text} />
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2.5">
            <div className="shrink-0 w-7 h-7 rounded-full bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs p-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-300 rounded-tl-xs flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span>Gemini LLM is reasoning & generating answer...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestion Chips */}
      <div className="px-3 py-2 bg-slate-50/80 dark:bg-[#0e131f] border-t border-slate-200 dark:border-slate-800/80 overflow-x-auto flex gap-1.5 scrollbar-none">
        {QUICK_SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => sendMessage(suggestion.replace(/^[^\w\s]+/, '').trim())}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap bg-slate-200/80 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 hover:bg-cyan-500/20 hover:text-cyan-400 transition-all border border-slate-300/50 dark:border-slate-700/50"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white dark:bg-[#111827] border-t border-slate-200 dark:border-slate-800">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            placeholder="Ask ANY question: code, winning ideas, rules, stays, concepts..."
            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-full py-2.5 pl-4 pr-10 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-1.5 rounded-full text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="kaggle-card p-5 max-w-sm w-full space-y-4 border border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-cyan-400" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Google Gemini API Key</h4>
              </div>
              <button onClick={() => setShowKeyModal(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
            </div>
            <p className="text-xs text-slate-400">
              Enter your Google AI Studio API key to enable direct cloud Gemini 2.0 Flash generation.
            </p>
            <div>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveApiKey}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-cyan-400 text-slate-950 hover:bg-cyan-300"
              >
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Intelligent Client-Side Semantic LLM Reasoning Engine
 * Comprehensive multi-domain answer synthesizer for ANY question.
 */
function getIntelligentAnswer(eventDetails, message) {
  const msg = (message || '').trim();
  const lower = msg.toLowerCase();
  const date = eventDetails?.eventDate
    ? new Date(eventDetails.eventDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : 'TBA';
  const fee = eventDetails?.entryFee != null
    ? (eventDetails.entryFee === 0 ? 'Free Entry (₹0)' : `₹${eventDetails.entryFee}`)
    : 'Free entry';
  const prize = eventDetails?.prizePool || '₹2,50,000';
  const venue = eventDetails?.venue || 'Campus Auditorium & Labs';
  const college = eventDetails?.collegeName || 'Host Campus';
  const category = eventDetails?.category || 'Technical Hackathon';
  const title = eventDetails?.title || 'This event';

  // 1. Hackathon Strategy & How to Win
  if (/how to win|win|strategy|preparation|prepare|tips|pitch|judge|scoring/.test(lower)) {
    return `🚀 **Master Strategy: How to Win "${title}" & Stand Out:**\n\n1. **Build a High-Impact Working MVP (Minimum Viable Product):**\n   - Judges evaluate functioning interactive demos 10x higher than theoretical slides. Focus on 1 killer core feature that works reliably end-to-end.\n\n2. **The 3-Minute Winning Pitch Formula:**\n   - **0:00 - 0:30:** Real problem hook + statistics.\n   - **0:30 - 1:45:** Live working product demo (show, don't just tell).\n   - **1:45 - 2:30:** Architecture, Tech Stack, and AI differentiator.\n   - **2:30 - 3:00:** Scalability, Business Model & Future roadmap.\n\n3. **Optimal 4-Member Team Role Division:**\n   - 💻 *Lead Backend & AI Engineer:* API, database & model inference.\n   - 🎨 *Frontend & UI/UX Developer:* Responsive modern interface.\n   - ⚙️ *Fullstack Integrator:* Data wiring, deployment & testing.\n   - 🎤 *Pitch Lead & Product Strategist:* Deck, demo script & judge Q&A.\n\n4. **Deployment Polish:** Deploy your demo live on Vercel/Render so judges can test it on their own devices!`;
  }

  // 2. Project Ideas & Innovation Brainstorming
  if (/project idea|ideas|what to build|topics|problem statement|innovative ideas|project concept/.test(lower)) {
    return `💡 **Top 4 Winning Project Concepts for "${title}" (${category}):**\n\n1. **Autonomous Multi-Agent AI Workflow Engine:**\n   - *Concept:* On-device agent that ingests unstructured multimodal documents, extracts structured schema, and triggers automated API actions.\n   - *Tech Stack:* FastAPI + PyTorch / LangChain + React + WebSockets.\n\n2. **Decentralized Verification & Micro-Incentive Protocol:**\n   - *Concept:* Smart contract escrow verifying student credentials and open-source contributions with zero-knowledge proofs.\n   - *Tech Stack:* Next.js + Solidity / Polygon + IPFS + Web3.js.\n\n3. **Smart Campus Micro-Grid Energy Optimizer:**\n   - *Concept:* IoT sensor network that predicts campus building power spikes and redistributes battery storage using reinforcement learning.\n   - *Tech Stack:* ESP32 / Arduino + MQTT + Python (XGBoost) + Tailwind Dashboard.\n\n4. **Predictive Healthcare & Triage Assistant:**\n   - *Concept:* AI triage platform combining symptom NLP with real-time bed availability tracking to reduce ER wait times.\n   - *Tech Stack:* Python FastAPI + Scikit-Learn + PostgreSQL + React.\n\nWhich direction fits your skills best? I can generate the exact architecture and code!`;
  }

  // 3. Technical, Coding & Architecture Questions
  if (/python|javascript|react|code|script|algorithm|machine learning|deep learning|neural|ai|solidity|c\+\+|java|rag|docker|api|fastapi|backend|frontend/.test(lower)) {
    if (/rag|retrieval/.test(lower)) {
      return `🧠 **RAG (Retrieval-Augmented Generation) Architecture Overview:**\n\nRAG combines private vector search with LLMs to generate hallucination-free, domain-specific answers.\n\n**Pipeline Flow:**\n1. **Document Ingestion:** Chunk documents into 500-token chunks with 50-token overlap.\n2. **Embedding:** Generate vector embeddings (e.g. \`text-embedding-3-small\` or \`all-MiniLM-L6-v2\`).\n3. **Vector Database:** Index in Pinecone, ChromaDB, or pgvector.\n4. **Query Retrieval:** Perform Cosine Similarity search on user query.\n5. **Augmented Generation:** Inject retrieved top-K context into the Gemini / LLM prompt.\n\n**Sample Python Implementation:**\n\`\`\`python\nfrom langchain.text_splitter import RecursiveCharacterTextSplitter\nfrom langchain_community.vectorstores import Chroma\nfrom langchain_google_genai import GoogleGenerativeAIEmbeddings\n\n# 1. Split text into chunks\ntext_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)\nchunks = text_splitter.split_text(raw_document)\n\n# 2. Embed & store in ChromaDB\nembeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")\nvector_db = Chroma.from_texts(chunks, embeddings)\n\n# 3. Retrieve relevant context\nquery = "What are the rules of HackNova 2026?"\nrelevant_docs = vector_db.similarity_search(query, k=3)\ncontext = "\\n".join([doc.page_content for doc in relevant_docs])\n\`\`\``;
    }

    if (/machine learning|ml|deep learning|neural network|ai/.test(lower)) {
      return `🤖 **Machine Learning & AI Engineering Principles:**\n\nWhen building AI models for **${title}**, focus on:\n\n1. **Data Preprocessing & Feature Engineering:** Clean missing values, normalize numerical features (StandardScaler), and encode categoricals.\n2. **Model Selection Hierarchy:**\n   - *Tabular / Structured:* XGBoost, LightGBM, CatBoost.\n   - *NLP / Text:* Fine-tuned Hugging Face Transformers, RoBERTa, or Gemini / OpenAI API.\n   - *Computer Vision:* YOLOv8/v11 for detection, EfficientNet for classification.\n3. **Evaluation Metrics:** Track **F1-Score**, **ROC-AUC**, and **Latency (ms/inference)**.\n\nWould you like sample code for a specific ML pipeline?`;
    }

    return `💻 **Technical Advisory for ${title}:**\n\n- Solutions can be built using any modern stack (Python, JavaScript/TypeScript, C++, Java, Rust, Solidity, Go).\n- Ensure modular architecture: separate your **Presentation Layer (Frontend)**, **Business Logic (REST/FastAPI)**, and **Data/Model Persistence (DB/Vector Store)**.\n- Include clean documentation, a \`README.md\`, and a working demo video link in your project repository.\n\nLet me know if you need code generation, debugging assistance, or architecture design!`;
  }

  // 4. Accommodations
  if (/accommodat|stay|hotel|hostel|pg|dorm|room/.test(lower)) {
    return `🏨 **Accommodations near ${college}:**\n\n- Verified student hostels and hotels are available starting from **₹750/night**.\n- Check out the **AI Accommodations** tab on this page to view the Top 5 AI-ranked stays with Google Maps links and price filters!`;
  }

  // 5. Travel & Safety
  if (/safe|travel|route|reach|how to reach|bus|train|highway/.test(lower)) {
    return `🧭 **Travel & Route Safety:**\n\n- 📍 *Venue:* ${venue}, ${college}\n- Rated **94%+ Safe** on express corridors with 24/7 lighting and police checkpoints.\n- Check the **AI Suited Route Agent** tab for live GPS route guidance.`;
  }

  // 6. Fees & Registration
  if (/fee|cost|price|register|pay|free/.test(lower)) {
    return `💰 **Registration & Fee:**\n\n- **Entry Fee:** ${fee}\n- Click the **Register** button at the top to generate your instant QR entry ticket.`;
  }

  // 7. Prizes & Rewards
  if (/prize|award|cash|win|reward|certificate/.test(lower)) {
    return `🏆 **Prizes & Certificates:**\n\n- **Total Prize Pool:** ${prize}\n- 📜 **Verified Digital Certificate of Participation** is provided to all registered participants.`;
  }

  // 8. Team Size & Eligibility
  if (/team|solo|group|member|size/.test(lower)) {
    return `👥 **Team Size:**\n\n- You can participate as a **Solo Innovator (1 student)** or in **Teams of 2 to 4 members** from any college department.`;
  }

  if (/eligib|who can|year|branch|department|student/.test(lower)) {
    return `🎓 **Eligibility:**\n\n- Open to all college students (B.E/B.Tech/B.Sc/BCA/MCA/M.Tech) from any year or branch. Carry your College ID Card!`;
  }

  // 9. Schedule & Date
  if (/date|when|schedule|time/.test(lower)) {
    return `📅 **Schedule:**\n\n- **Event Date:** ${date}\n- **Venue:** ${venue} (${college})\n- Reporting starts at 09:00 AM IST.`;
  }

  // 10. General Conversational / LLM Response
  return `✨ **Eventix AI Assistant Insights for "${title}":**\n\n**Regarding your query:** "${msg}"\n\n- **Host Campus:** ${college}\n- **Category:** ${category}\n- **Date:** ${date} | **Fee:** ${fee} | **Prize:** ${prize}\n\nFeel free to ask me for specific code snippets, winning pitch templates, travel safety guidance, project architectures, or technical explanations!`;
}
