import RelayLogo from './RelayLogo';
import React, { useState, useEffect, useCallback } from "react";
import {
  FiHome, FiFileText, FiCode, FiUser, FiGrid, FiLayers,
  FiZap, FiCalendar, FiEdit3, FiCommand, FiBarChart2, FiClock,
  FiChevronLeft, FiChevronRight
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

// ── Existing Modules (renamed imports for clarity) ──
import NoteList from "./NoteList";           // DevDocs
import SnippetLibrary from "./SnippetLibrary"; // Code Vault
import ProfileManager from "./ProfileManager";
import TaskBoard from "./TaskBoard";
import RelaySandBox from "./RelaySandBox";

// ── New Modules ──
import DashboardHome from "./DashboardHome";
import Analytics from "./Analytics";

import CommandPalette from "./CommandPalette";
import ScratchPad from "./ScratchPad";
import RagChat from "./RagChat";

// ──────────────────────────────────────────────────────
// Sidebar Nav Item
// ──────────────────────────────────────────────────────
const NavItem = ({ id, icon: Icon, label, activeTab, setActiveTab, badge, isCollapsed }) => {
  const isActive = activeTab === id;
  return (
    <button
      onClick={() => setActiveTab(id)}
      className={`
        w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group relative
        ${isActive
          ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10"
          : "text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-blue-600 dark:hover:text-blue-400"
        }
      `}
    >
      {isActive && (
        <motion.div 
          layoutId="sidebarActive"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.6)]"
        />
      )}
      <div className="min-w-[24px] flex justify-center">
        <Icon size={20} />
      </div>

      <span className={`font-medium text-sm whitespace-nowrap overflow-hidden hidden lg:block flex-1 text-left ${isCollapsed ? '!hidden' : ''}`}>
        {label}
      </span>

      {badge && (
        <span className={`hidden lg:inline text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isCollapsed ? '!hidden' : ''} ${
          isActive ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-white/10 text-slate-400"
        }`}>
          {badge}
        </span>
      )}

      {/* Tooltip for collapsed sidebar */}
      <div className="absolute left-16 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 lg:hidden pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-md">
        {label}
      </div>
      {/* Tooltip for LG collapsed sidebar */}
      {isCollapsed && (
        <div className="absolute left-16 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-md hidden lg:block">
          {label}
        </div>
      )}
    </button>
  );
};

// ──────────────────────────────────────────────────────
// Dashboard — Main workspace shell
// ──────────────────────────────────────────────────────
function Dashboard() {
  const [activeTab, setActiveTab] = useState("home");
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isScratchPadOpen, setIsScratchPadOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { toggleTheme } = useTheme();

  // ── Global Keyboard Shortcuts ──
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+K or Cmd+K → Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      // Ctrl+. or Cmd+. → Scratch Pad
      if ((e.ctrlKey || e.metaKey) && e.key === ".") {
        e.preventDefault();
        setIsScratchPadOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ── Command Palette Action Handler ──
  const handleCommandAction = useCallback((actionId) => {
    switch (actionId) {
      // Navigation
      case "nav-home":      setActiveTab("home"); break;
      case "nav-docs":      setActiveTab("docs"); break;
      case "nav-devspace":  setActiveTab("devspace"); break;
      case "nav-snippets":  setActiveTab("snippets"); break;
      case "nav-tasks":     setActiveTab("tasks"); break;
      case "nav-profile":   setActiveTab("profiles"); break;
      case "nav-analytics": setActiveTab("analytics"); break;
      // Create — navigate to the relevant tab (the tab handles creation)
      case "create-doc":     setActiveTab("docs"); break;
      case "create-snippet": setActiveTab("snippets"); break;
      case "create-task":    setActiveTab("tasks"); break;
      // System
      case "toggle-theme":  toggleTheme(); break;
      case "open-scratch":  setIsScratchPadOpen(true); break;
      default: break;
    }
  }, [toggleTheme]);

  return (
    <div className="flex h-full w-full overflow-hidden bg-slate-50 dark:bg-[#020617] transition-colors duration-300">

      {/* ════════════════════════════════════════════════ */}
      {/* DESKTOP SIDEBAR                                 */}
      {/* ════════════════════════════════════════════════ */}
      <aside className={`hidden md:flex flex-col ${isSidebarCollapsed ? 'w-[72px]' : 'w-[72px] lg:w-64'} h-full border-r border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b1121] transition-all duration-300 ease-in-out z-20 shrink-0`}>

        {/* Brand */}
        <div className={`h-16 flex items-center justify-center ${!isSidebarCollapsed ? 'lg:justify-start lg:px-6' : ''} border-b border-slate-100 dark:border-white/5`}>
          <RelayLogo className={`text-blue-600 ${!isSidebarCollapsed ? 'lg:mr-3' : ''}`} size={24} />
          <span className={`font-bold text-slate-800 dark:text-white hidden ${!isSidebarCollapsed ? 'lg:block' : ''}`}>Workspace</span>
        </div>

        {/* Nav Items */}
        <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto custom-scrollbar">
          <NavItem id="home"     icon={FiHome}     label="Home"           activeTab={activeTab} setActiveTab={setActiveTab} isCollapsed={isSidebarCollapsed} />

          <div className="my-3 border-t border-slate-100 dark:border-white/5 mx-2" />

          <NavItem id="docs"     icon={FiFileText} label="DevDocs"        activeTab={activeTab} setActiveTab={setActiveTab} isCollapsed={isSidebarCollapsed} />
          <NavItem id="devspace" icon={RelayLogo}      label="RelaySandBox"       activeTab={activeTab} setActiveTab={setActiveTab} badge="Live" isCollapsed={isSidebarCollapsed} />
          <NavItem id="snippets" icon={FiCode}     label="Code Vault"     activeTab={activeTab} setActiveTab={setActiveTab} isCollapsed={isSidebarCollapsed} />
          <NavItem id="tasks"    icon={FiLayers}   label="Task Board"     activeTab={activeTab} setActiveTab={setActiveTab} isCollapsed={isSidebarCollapsed} />

          <div className="my-3 border-t border-slate-100 dark:border-white/5 mx-2" />

          <NavItem id="analytics" icon={FiBarChart2} label="Analytics"     activeTab={activeTab} setActiveTab={setActiveTab} badge="New" isCollapsed={isSidebarCollapsed} />
          <NavItem id="profiles" icon={FiUser}     label="Profile"        activeTab={activeTab} setActiveTab={setActiveTab} isCollapsed={isSidebarCollapsed} />
        </div>

        {/* Sidebar Footer — Shortcuts */}
        <div className="border-t border-slate-100 dark:border-white/5">
          {/* Keyboard Shortcut Hints */}
          <div className={`p-3 hidden ${!isSidebarCollapsed ? 'lg:flex' : ''} flex-col gap-1.5`}>
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center justify-between px-2 py-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-600 dark:hover:text-slate-300 transition-colors text-xs"
            >
              <span className="flex items-center gap-2"><FiCommand size={12} /> Commands</span>
              <kbd className="text-[9px] font-mono bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10">⌘K</kbd>
            </button>
            <button
              onClick={() => setIsScratchPadOpen(true)}
              className="flex items-center justify-between px-2 py-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-600 dark:hover:text-slate-300 transition-colors text-xs"
            >
              <span className="flex items-center gap-2"><FiEdit3 size={12} /> Scratch Pad</span>
              <kbd className="text-[9px] font-mono bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10">⌘.</kbd>
            </button>
          </div>

          <div className="p-3 flex items-center justify-between border-t border-slate-100 dark:border-white/5">
            <span className={`text-[10px] text-slate-400 dark:text-gray-600 hidden ${!isSidebarCollapsed ? 'lg:inline' : ''}`}>Relay v3.0</span>
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
              className={`p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded transition-colors ${isSidebarCollapsed ? 'mx-auto' : ''}`}
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isSidebarCollapsed ? <FiChevronRight size={16} /> : <FiChevronLeft size={16} />}
            </button>
          </div>
        </div>
      </aside>

      {/* ════════════════════════════════════════════════ */}
      {/* MAIN CONTENT AREA                               */}
      {/* ════════════════════════════════════════════════ */}
      <main className={`
        flex-1 h-full relative
        ${activeTab === 'devspace' ? 'overflow-hidden' : 'overflow-y-auto custom-scrollbar'}
      `}>
        <div className={`
          mx-auto w-full transition-all duration-300 relative
          ${activeTab === 'devspace'
            ? 'h-full max-w-full p-0'
            : activeTab === 'home'
              ? 'min-h-full max-w-full pb-24 md:pb-8'
              : 'min-h-full max-w-[1600px] p-4 lg:p-8 pb-24 md:pb-8'
          }
        `}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === "home"     && <DashboardHome setActiveTab={setActiveTab} />}
              {activeTab === "docs"     && <NoteList />}
              {activeTab === "devspace" && <RelaySandBox />}
              {activeTab === "snippets" && <SnippetLibrary />}
              {activeTab === "tasks"    && <TaskBoard />}
              {activeTab === "analytics" && <Analytics />}
              {activeTab === "profiles" && <ProfileManager />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ════════════════════════════════════════════════ */}
      {/* MOBILE BOTTOM NAV                               */}
      {/* ════════════════════════════════════════════════ */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-[#0b1121] border-t border-slate-200 dark:border-white/10 flex justify-around items-center px-2 z-50 pb-safe shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)]">
        {[
          { id: "home",     icon: FiHome,     label: "Home" },
          { id: "docs",     icon: FiFileText, label: "Docs" },
          { id: "devspace", icon: RelayLogo,      label: "Space" },
          { id: "snippets", icon: FiCode,     label: "Code" },
          { id: "tasks",    icon: FiLayers,   label: "Tasks" },
          { id: "analytics", icon: FiBarChart2, label: "Stats" },
          { id: "profiles", icon: FiUser,     label: "Profile" },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`p-1.5 rounded-xl flex flex-col items-center gap-0.5 ${
              activeTab === id
                ? "text-blue-600 dark:text-blue-400"
                : "text-slate-400 dark:text-gray-500"
            }`}
          >
            <Icon size={18} />
            <span className="text-[9px] font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════ */}
      {/* OVERLAYS — Command Palette + Scratch Pad        */}
      {/* ════════════════════════════════════════════════ */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onAction={handleCommandAction}
      />
      <ScratchPad
        isOpen={isScratchPadOpen}
        onClose={() => setIsScratchPadOpen(false)}
      />
      <RagChat />

    </div>
  );
}

export default Dashboard;