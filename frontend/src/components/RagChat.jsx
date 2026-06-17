import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiX, FiSend, FiLoader, FiMaximize2, FiMinimize2, FiCpu } from 'react-icons/fi';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const API = import.meta.env.VITE_API_URL;

export default function RagChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm Relay Copilot, your RAG-powered workspace assistant. I can retrieve knowledge from your entire workspace—including your Snippets, Projects, Tasks, Profile, and Analytics. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${API}/api/ai/process`,
        {
          code: userMessage, // For RAG, 'code' acts as the query
          action: 'rag'
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      setMessages(prev => [...prev, { role: 'assistant', content: response.data.result }]);
    } catch (error) {
      console.error("RAG Chat Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "⚠️ Sorry, I encountered an error connecting to your workspace knowledge base." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        className="fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-purple-500/50 transition-shadow flex items-center justify-center gap-2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
      >
        <FiCpu className="text-xl" />
        <span className="font-bold text-sm tracking-wide">RAG Copilot</span>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed bottom-24 right-6 z-50 bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${
              isExpanded 
                ? 'w-[90vw] md:w-[800px] h-[80vh] max-h-[calc(100vh-8rem)] max-w-[calc(100vw-3rem)]' 
                : 'w-80 md:w-[400px] h-[500px] max-h-[calc(100vh-8rem)]'
            }`}
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 flex justify-between items-start text-white shrink-0">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <FiCpu className="text-xl" />
                  <h3 className="font-bold leading-none">Relay Copilot</h3>
                </div>
                <span className="text-[10px] text-indigo-100 mt-1.5 uppercase tracking-widest font-bold opacity-90">
                  RAG Knowledge Engine
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setIsExpanded(!isExpanded)} className="hover:bg-white/20 p-1.5 rounded-lg transition-colors">
                  {isExpanded ? <FiMinimize2 className="w-4 h-4" /> : <FiMaximize2 className="w-4 h-4" />}
                </button>
                <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-lg transition-colors">
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50 dark:bg-[#020617] space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                    msg.role === 'user' 
                      ? 'bg-indigo-500 text-white rounded-br-sm' 
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-sm shadow-sm'
                  }`}>
                    {msg.role === 'user' ? (
                      <p>{msg.content}</p>
                    ) : (
                      <ReactMarkdown
                        components={{
                          code({node, inline, className, children, ...props}) {
                            const match = /language-(\w+)/.exec(className || '')
                            return !inline && match ? (
                              <SyntaxHighlighter
                                style={vscDarkPlus}
                                language={match[1]}
                                PreTag="div"
                                className="rounded-md my-2 text-xs"
                                {...props}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            ) : (
                              <code className="bg-slate-100 dark:bg-slate-900 px-1 rounded text-pink-500" {...props}>
                                {children}
                              </code>
                            )
                          }
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-sm p-3 flex items-center gap-2 text-slate-500 shadow-sm">
                    <FiLoader className="w-4 h-4 animate-spin text-indigo-500" />
                    <span className="text-xs font-medium">Searching workspace...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white dark:bg-[#0f172a] border-t border-slate-200 dark:border-slate-800 shrink-0">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your workspace, progress, or code..."
                  className="flex-1 bg-slate-100 dark:bg-[#020617] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button 
                  type="submit" 
                  disabled={isLoading || !input.trim()}
                  className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:hover:bg-indigo-500 text-white p-2.5 rounded-xl transition-colors flex items-center justify-center"
                >
                  <FiSend className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
