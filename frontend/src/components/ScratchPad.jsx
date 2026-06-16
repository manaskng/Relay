import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { FiX, FiEye, FiEdit3, FiTrash2, FiFileText } from "react-icons/fi";

// ──────────────────────────────────────────────────────
// Scratch Pad — Always-available quick-capture notepad.
// Slides in from the right edge. Persists to localStorage.
// No backend, no title, no saving flow — just write.
// ──────────────────────────────────────────────────────

const STORAGE_KEY = "relay_scratchpad";

function ScratchPad({ isOpen, onClose }) {
  const [content, setContent] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef(null);
  const saveTimerRef = useRef(null);

  // Load saved content on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setContent(saved);
  }, []);

  // Focus textarea when opened
  useEffect(() => {
    if (isOpen && !showPreview) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen, showPreview]);

  // Debounced auto-save (500ms)
  const handleChange = useCallback((e) => {
    const value = e.target.value;
    setContent(value);

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, value);
    }, 500);
  }, []);

  const handleClear = () => {
    if (!content.trim()) return;
    if (window.confirm("Clear all scratch pad content?")) {
      setContent("");
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Word and character count
  const charCount = content.length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-black/30 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-[95] w-full max-w-md bg-white dark:bg-[#0f172a] border-l border-slate-200 dark:border-white/10 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/5 shrink-0">
              <div className="flex items-center gap-2">
                <FiFileText size={16} className="text-blue-500" />
                <h2 className="text-sm font-bold text-slate-800 dark:text-white">Scratch Pad</h2>
                <span className="text-[10px] bg-slate-100 dark:bg-white/5 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                  Auto-saved
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-1 px-4 py-2 border-b border-slate-100 dark:border-white/5 shrink-0">
              <button
                onClick={() => setShowPreview(false)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  !showPreview
                    ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                }`}
              >
                <FiEdit3 size={12} /> Write
              </button>
              <button
                onClick={() => setShowPreview(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  showPreview
                    ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                }`}
              >
                <FiEye size={12} /> Preview
              </button>

              <div className="flex-1" />

              <button
                onClick={handleClear}
                className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors rounded-lg"
                title="Clear All"
              >
                <FiTrash2 size={14} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {showPreview ? (
                <div className="h-full overflow-y-auto custom-scrollbar p-5">
                  {content.trim() ? (
                    <div className="prose prose-sm prose-slate dark:prose-invert max-w-none">
                      <ReactMarkdown>{content}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="text-center text-slate-400 dark:text-slate-500 mt-20 text-sm">
                      Nothing to preview yet.
                    </div>
                  )}
                </div>
              ) : (
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={handleChange}
                  placeholder="Quick notes, ideas, stack traces, API endpoints...&#10;&#10;Supports Markdown formatting."
                  className="w-full h-full resize-none bg-transparent text-slate-800 dark:text-slate-200 p-5 outline-none text-sm leading-relaxed font-mono placeholder:text-slate-300 dark:placeholder:text-slate-600"
                  spellCheck={false}
                />
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-2.5 border-t border-slate-100 dark:border-white/5 text-[10px] text-slate-400 dark:text-slate-500 font-mono shrink-0">
              <span>{wordCount} words · {charCount} chars</span>
              <span>Markdown supported</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ScratchPad;
