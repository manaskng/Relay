import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch, FiFileText, FiCode, FiLayers, FiZap,
  FiUser, FiSun, FiMoon, FiHome, FiCalendar,
  FiPlus, FiCommand, FiArrowRight
} from "react-icons/fi";

// ──────────────────────────────────────────────────────
// Command Palette — Ctrl+K / Cmd+K
// A VS Code-style action hub for power users.
// Supports fuzzy filtering, keyboard navigation,
// and categorized actions.
// ──────────────────────────────────────────────────────

const ACTIONS = [
  // Navigation
  { id: "nav-home", label: "Go to Home", icon: FiHome, category: "Navigate", keywords: "home dashboard overview" },
  { id: "nav-docs", label: "Go to DevDocs", icon: FiFileText, category: "Navigate", keywords: "documents notes devdocs" },
  { id: "nav-devspace", label: "Go to DevSpace", icon: FiZap, category: "Navigate", keywords: "devspace code editor live collaborate" },
  { id: "nav-snippets", label: "Go to Code Vault", icon: FiCode, category: "Navigate", keywords: "snippets code library vault algorithms" },
  { id: "nav-tasks", label: "Go to Task Board", icon: FiLayers, category: "Navigate", keywords: "tasks todo board objectives" },
  { id: "nav-contests", label: "Go to Contest Calendar", icon: FiCalendar, category: "Navigate", keywords: "contests calendar codeforces leetcode codechef" },
  { id: "nav-profile", label: "Go to Profile Manager", icon: FiUser, category: "Navigate", keywords: "profile portfolio settings" },
  { id: "nav-analytics", label: "Go to Analytics", icon: FiCalendar, category: "Navigate", keywords: "analytics stats score streak productivity metrics" },
  // Create
  { id: "create-doc", label: "Create New Document", icon: FiPlus, category: "Create", keywords: "new document note create" },
  { id: "create-snippet", label: "Create New Snippet", icon: FiPlus, category: "Create", keywords: "new snippet code algorithm create" },
  { id: "create-task", label: "Create New Task", icon: FiPlus, category: "Create", keywords: "new task objective create" },
  // System
  { id: "toggle-theme", label: "Toggle Dark/Light Mode", icon: FiSun, category: "System", keywords: "theme dark light mode toggle" },
  { id: "open-scratch", label: "Open Scratch Pad", icon: FiFileText, category: "System", keywords: "scratch pad notepad quick notes" },
];

function CommandPalette({ isOpen, onClose, onAction }) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setActiveIndex(0);
      // Small delay so the animation finishes before focusing
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Filter actions based on query
  const filtered = useMemo(() => {
    if (!query.trim()) return ACTIONS;
    const q = query.toLowerCase();
    return ACTIONS.filter(
      (a) =>
        a.label.toLowerCase().includes(q) ||
        a.keywords.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
    );
  }, [query]);

  // Group by category
  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach((action) => {
      if (!groups[action.category]) groups[action.category] = [];
      groups[action.category].push(action);
    });
    return groups;
  }, [filtered]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[activeIndex]) {
          onAction(filtered[activeIndex].id);
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, activeIndex, filtered, onAction, onClose]);

  // Scroll active item into view
  useEffect(() => {
    const activeEl = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    activeEl?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  // Reset index when query changes
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  if (!isOpen) return null;

  let flatIndex = 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

        {/* Palette */}
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.97 }}
          transition={{ type: "spring", duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-white/5">
            <FiSearch className="text-slate-400 shrink-0" size={18} />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent text-slate-900 dark:text-white outline-none text-sm font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            <kbd className="hidden sm:inline-block text-[10px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded border border-slate-200 dark:border-white/10">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-[320px] overflow-y-auto custom-scrollbar py-2">
            {filtered.length === 0 ? (
              <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-sm">
                No matching commands
              </div>
            ) : (
              Object.entries(grouped).map(([category, actions]) => (
                <div key={category}>
                  <div className="px-5 py-2">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      {category}
                    </span>
                  </div>
                  {actions.map((action) => {
                    const currentIndex = flatIndex++;
                    const isActive = currentIndex === activeIndex;
                    return (
                      <button
                        key={action.id}
                        data-index={currentIndex}
                        onClick={() => {
                          onAction(action.id);
                          onClose();
                        }}
                        onMouseEnter={() => setActiveIndex(currentIndex)}
                        className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors ${
                          isActive
                            ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                        }`}
                      >
                        <action.icon size={16} className={isActive ? "text-blue-500" : "text-slate-400"} />
                        <span className="text-sm font-medium flex-1">{action.label}</span>
                        {isActive && <FiArrowRight size={14} className="text-blue-400" />}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer Hint */}
          <div className="px-5 py-3 border-t border-slate-100 dark:border-white/5 flex items-center gap-4 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-white/5 rounded text-[9px] font-mono border border-slate-200 dark:border-white/10">↑↓</kbd> Navigate</span>
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-white/5 rounded text-[9px] font-mono border border-slate-200 dark:border-white/10">↵</kbd> Select</span>
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-white/5 rounded text-[9px] font-mono border border-slate-200 dark:border-white/10">esc</kbd> Close</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default CommandPalette;
