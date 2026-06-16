import RelayLogo from './RelayLogo';
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import {
  FiZap,
  FiLogIn,
  FiUserPlus,
  FiArrowRight,
  FiGithub,
  FiUsers,
  FiFileText,
  FiCode,
  FiSearch,
  FiBarChart2,
  FiCheckSquare,
  FiClock,
  FiStar,
  FiTag,
  FiTerminal,
  FiDatabase,
  FiWifi,
  FiServer,
  FiBox,
  FiLayers,
  FiGrid,
  FiMenu,
  FiX,
} from "react-icons/fi";
import DashboardSlideshow from "./DashboardSlideshow";

// ─── Animation Variants ─────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay: i * 0.05, ease: "easeOut" },
  }),
};

// ─── Animated Counter Hook ──────────────────────────────────────────
function AnimatedCounter({ target, suffix = "", duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {count}
      {suffix}
    </span>
  );
}

// ─── Mini Mockup Components ─────────────────────────────────────────

function MockCodeEditor() {
  const lines = [
    { indent: 0, text: "function mergeSort(arr) {", color: "text-purple-400" },
    { indent: 1, text: "if (arr.length <= 1) return arr;", color: "text-slate-400" },
    { indent: 1, text: "const mid = Math.floor(arr.length / 2);", color: "text-blue-400" },
    { indent: 1, text: "const left = mergeSort(arr.slice(0, mid));", color: "text-emerald-400" },
    { indent: 1, text: "return merge(left, right);", color: "text-amber-400" },
    { indent: 0, text: "}", color: "text-purple-400" },
  ];

  return (
    <div className="bg-[#0a0a1a] rounded-xl border border-white/10 p-3 font-mono text-[10px] sm:text-xs relative overflow-hidden">
      {/* User cursors */}
      <div className="absolute top-2 right-2 flex gap-1">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: "0.5s" }} />
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" style={{ animationDelay: "1s" }} />
      </div>
      {lines.map((l, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-white/20 w-4 text-right select-none">{i + 1}</span>
          <span className={`${l.color}`} style={{ paddingLeft: `${l.indent * 12}px` }}>
            {l.text}
          </span>
          {i === 2 && <span className="w-0.5 h-3.5 bg-emerald-400 animate-pulse ml-0.5" />}
          {i === 4 && <span className="w-0.5 h-3.5 bg-purple-400 animate-pulse ml-0.5" />}
        </div>
      ))}
      <div className="mt-2 flex items-center gap-2 text-[9px]">
        <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">manas — typing…</span>
        <span className="bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded">alice — idle</span>
      </div>
    </div>
  );
}

function MockDocCards() {
  const docs = [
    { title: "API Reference", pinned: true, color: "border-indigo-500/50" },
    { title: "Sprint Notes", pinned: false, color: "border-purple-500/50" },
    { title: "Architecture", pinned: true, color: "border-fuchsia-500/50" },
  ];
  return (
    <div className="space-y-2">
      {docs.map((d, i) => (
        <div key={i} className={`bg-white/5 rounded-lg border ${d.color} p-2.5 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <FiFileText className="text-indigo-400 text-xs" />
            <span className="text-xs text-white/80">{d.title}</span>
          </div>
          {d.pinned && <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">📌 Pinned</span>}
        </div>
      ))}
    </div>
  );
}

function MockSnippetCards() {
  const snippets = [
    { title: "Binary Search", lang: "Python", color: "bg-blue-500/20 text-blue-400" },
    { title: "Debounce Hook", lang: "JavaScript", color: "bg-amber-500/20 text-amber-400" },
    { title: "LRU Cache", lang: "C++", color: "bg-emerald-500/20 text-emerald-400" },
  ];
  return (
    <div className="space-y-2">
      {snippets.map((s, i) => (
        <div key={i} className="bg-white/5 rounded-lg border border-white/10 p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiCode className="text-purple-400 text-xs" />
            <span className="text-xs text-white/80">{s.title}</span>
          </div>
          <span className={`text-[9px] ${s.color} px-1.5 py-0.5 rounded`}>{s.lang}</span>
        </div>
      ))}
    </div>
  );
}

function MockAIPanel() {
  return (
    <div className="bg-[#0a0a1a] rounded-xl border border-white/10 p-3 space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <RelayLogo className="text-fuchsia-400 text-sm" />
        <span className="text-xs text-fuchsia-400 font-semibold">Gemini Analysis</span>
      </div>
      <div className="bg-white/5 rounded-lg p-2 text-[10px] text-slate-300 leading-relaxed">
        <span className="text-emerald-400 font-medium">Suggestion:</span> Extract the nested loop into a helper function to improve readability and reduce time complexity from O(n³) to O(n²).
      </div>
      <div className="flex gap-1.5 mt-1">
        <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">Apply Fix</span>
        <span className="text-[9px] bg-white/10 text-white/50 px-1.5 py-0.5 rounded">Explain More</span>
      </div>
    </div>
  );
}

function MockSearchDropdown() {
  const results = [
    { title: "mergeSort.js", type: "Snippet", ms: "3ms" },
    { title: "API Reference", type: "Doc", ms: "5ms" },
    { title: "Sprint Planning", type: "Note", ms: "7ms" },
  ];
  return (
    <div className="bg-[#0a0a1a] rounded-xl border border-white/10 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
        <FiSearch className="text-indigo-400 text-xs" />
        <span className="text-xs text-white/60">merge sort…</span>
        <span className="ml-auto text-[9px] text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded">3ms</span>
      </div>
      {results.map((r, i) => (
        <div key={i} className="px-3 py-2 flex items-center justify-between border-b border-white/5 last:border-0 hover:bg-white/5">
          <span className="text-xs text-white/80">{r.title}</span>
          <span className="text-[9px] text-indigo-400 bg-indigo-500/20 px-1.5 py-0.5 rounded">{r.type}</span>
        </div>
      ))}
    </div>
  );
}

function MockAnalyticsDash() {
  const score = 87;
  const streak = [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1];
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex items-center gap-4">
      {/* Score Ring */}
      <div className="relative w-20 h-20 flex-shrink-0">
        <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
          <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
          <circle
            cx="32" cy="32" r="28" fill="none"
            stroke="url(#scoreGrad)" strokeWidth="4" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
          />
          <defs>
            <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-white">{score}</span>
          <span className="text-[8px] text-white/50 uppercase">Score</span>
        </div>
      </div>
      {/* Streak Grid */}
      <div>
        <span className="text-[9px] text-white/50 uppercase tracking-wider block mb-1">14-Day Streak</span>
        <div className="grid grid-cols-7 gap-1">
          {streak.map((v, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${v ? "bg-indigo-500" : "bg-white/10"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MockTaskCards() {
  const tasks = [
    { title: "Fix auth middleware", priority: "High", color: "bg-red-500/20 text-red-400", done: true },
    { title: "Add search filters", priority: "Med", color: "bg-amber-500/20 text-amber-400", done: false },
    { title: "Write unit tests", priority: "Low", color: "bg-emerald-500/20 text-emerald-400", done: false },
  ];
  return (
    <div className="space-y-2">
      {tasks.map((t, i) => (
        <div key={i} className="bg-white/5 rounded-lg border border-white/10 p-2.5 flex items-center gap-2">
          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${t.done ? "border-emerald-400 bg-emerald-500/20" : "border-white/20"}`}>
            {t.done && <span className="text-emerald-400 text-[8px]">✓</span>}
          </div>
          <span className={`text-xs flex-1 ${t.done ? "line-through text-white/40" : "text-white/80"}`}>{t.title}</span>
          <span className={`text-[9px] ${t.color} px-1.5 py-0.5 rounded`}>{t.priority}</span>
        </div>
      ))}
    </div>
  );
}

function MockTimerRing() {
  const circumference = 2 * Math.PI * 36;
  const progress = 0.65;
  const offset = circumference - progress * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
          <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
          <circle
            cx="40" cy="40" r="36" fill="none"
            stroke="url(#timerGrad)" strokeWidth="3" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
          />
          <defs>
            <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#d946ef" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-white font-mono">16:15</span>
          <span className="text-[8px] text-white/50 uppercase">remaining</span>
        </div>
      </div>
      <div className="flex gap-1.5">
        {["25m", "45m", "60m"].map((t) => (
          <span key={t} className={`text-[9px] px-2 py-0.5 rounded-full ${t === "25m" ? "bg-indigo-500/30 text-indigo-300" : "bg-white/10 text-white/40"}`}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Feature Data ───────────────────────────────────────────────────
const FEATURES = [
  {
    icon: FiUsers,
    title: "RelaySandBox",
    subtitle: "Multi-user rooms, typing indicators, presence awareness, 11 languages",
    pills: ["Real-time Sync", "WebSocket Rooms", "Live Cursors"],
    gradient: "from-indigo-500 to-blue-500",
    mockup: MockCodeEditor,
  },
  {
    icon: FiFileText,
    title: "DevDocs",
    subtitle: "TipTap rich text, markdown, pin docs, organize knowledge",
    pills: ["Rich Text Editor", "Pin & Organize", "Markdown Support"],
    gradient: "from-purple-500 to-indigo-500",
    mockup: MockDocCards,
  },
  {
    icon: FiCode,
    title: "Code Vault",
    subtitle: "Save, tag, search, and organize algorithms & templates",
    pills: ["Language Tags", "Favorites", "Quick Copy"],
    gradient: "from-fuchsia-500 to-purple-500",
    mockup: MockSnippetCards,
  },
  {
    icon: RelayLogo,
    title: "AI Code Assistant",
    subtitle: "Explain complex code, refactor suggestions, model cascade for 99% uptime",
    pills: ["Gemini 2.5 Flash", "Code Explain", "Auto Refactor"],
    gradient: "from-amber-500 to-fuchsia-500",
    mockup: MockAIPanel,
  },
  {
    icon: FiSearch,
    title: "Atlas Search",
    subtitle: "Lucene-powered search with fuzzy matching, 3× title boosting, 44% better recall",
    pills: ["Sub-10ms", "Fuzzy Match", "Title Boost"],
    gradient: "from-emerald-500 to-teal-500",
    mockup: MockSearchDropdown,
  },
  {
    icon: FiBarChart2,
    title: "Analytics Dashboard",
    subtitle: "Relay Score, activity streaks, task efficiency, language stats",
    pills: ["Relay Score", "Streak Tracking", "Efficiency %"],
    gradient: "from-blue-500 to-indigo-500",
    mockup: MockAnalyticsDash,
  },
  {
    icon: FiCheckSquare,
    title: "Task Board",
    subtitle: "Priority tracking, completion rates, integrated with workspace",
    pills: ["Priority Levels", "Kanban Flow", "Completion Rates"],
    gradient: "from-rose-500 to-pink-500",
    mockup: MockTaskCards,
  },
  {
    icon: FiClock,
    title: "Focus Timer",
    subtitle: "25/45/60min presets, confetti on completion, distraction-free coding",
    pills: ["Pomodoro", "Custom Durations", "🎉 Confetti"],
    gradient: "from-violet-500 to-indigo-500",
    mockup: MockTimerRing,
  },
];

// ─── Tech Stack Data ────────────────────────────────────────────────
const TECH_STACK = [
  { name: "React 19", role: "Frontend Framework", icon: FiLayers },
  { name: "Node.js", role: "Runtime Engine", icon: FiServer },
  { name: "MongoDB", role: "NoSQL Database", icon: FiDatabase },
  { name: "Socket.IO", role: "Real-time Engine", icon: FiWifi },
  { name: "Redis", role: "Session & Cache", icon: RelayLogo },
  { name: "Gemini AI", role: "Code Intelligence", icon: RelayLogo },
  { name: "Docker", role: "Containerization", icon: FiBox },
  { name: "Vite", role: "Build Tool", icon: FiTerminal },
  { name: "TailwindCSS", role: "Utility Styles", icon: FiGrid },
];

// ─── Stats Data ─────────────────────────────────────────────────────
const STATS = [
  { value: 29, suffix: "+", label: "REST Endpoints" },
  { value: 8, suffix: "", label: "Socket Events" },
  { value: 11, suffix: "", label: "Languages Supported" },
  { value: 9, suffix: "", label: "Contest Platforms" },
];

// ═══════════════════════════════════════════════════════════════════
// LandingPage Component
// ═══════════════════════════════════════════════════════════════════

function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden relative">
      {/* ── Background Grid ────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-indigo-500/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-purple-500/8 rounded-full blur-[120px]" />
      </div>

      {/* ── Header / Nav ───────────────────────────────────────── */}
      <header className="relative z-50">
        <nav className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
              <RelayLogo className="text-white text-lg" />
            </div>
            <span className="text-xl font-bold tracking-tight">Relay</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/login"
              className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              <span className="flex items-center gap-1.5">
                <FiLogIn className="text-sm" /> Log In
              </span>
            </Link>
            <Link
              to="/register"
              className="px-5 py-2 text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/20"
            >
              <span className="flex items-center gap-1.5">
                <FiUserPlus className="text-sm" /> Sign Up
              </span>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-white/70 hover:text-white">
            {mobileMenuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden absolute inset-x-0 top-full bg-[#020617]/95 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex flex-col gap-3 z-50"
          >
            <Link to="/login" className="px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
              <FiLogIn /> Log In
            </Link>
            <Link to="/register" className="px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-center" onClick={() => setMobileMenuOpen(false)}>
              Sign Up
            </Link>
          </motion.div>
        )}
      </header>

      {/* ── Hero Section ───────────────────────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 sm:pt-24 pb-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-white/70">RelaySandBox Live: Online</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={fadeUp}
            custom={1}
            className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] mb-6"
          >
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
              Code, Collaborate,
            </span>
            <br />
            <span className="text-white">& Document.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={fadeUp} custom={2} className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            The developer workspace that fuses real-time collaboration, intelligent code analysis, and powerful documentation — all in one premium experience.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} custom={3} className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="group px-8 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl font-semibold text-sm shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all flex items-center gap-2"
            >
              Launch Workspace
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="https://github.com/manaskng/DevNexus"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 bg-white/5 border border-white/10 rounded-2xl font-semibold text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <FiGithub /> View Source
            </a>
          </motion.div>
        </motion.div>

        {/* Browser Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 max-w-5xl mx-auto"
        >
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden shadow-2xl shadow-indigo-500/5">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-white/5 rounded-lg px-4 py-1.5 text-xs text-white/30 text-center max-w-md mx-auto">
                  relay.dev/workspace
                </div>
              </div>
            </div>
            {/* Slideshow */}
            <div className="aspect-video">
              <DashboardSlideshow />
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Features Section ───────────────────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 sm:py-32">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="text-center mb-16 sm:mb-20"
        >
          <motion.span variants={fadeUp} className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 mb-4 block">
            Features
          </motion.span>
          <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-5xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Everything</span>{" "}
            a developer needs
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="mt-4 text-white/50 max-w-xl mx-auto">
            Eight deeply integrated tools built to keep you in flow state.
          </motion.p>
        </motion.div>

        <div className="space-y-6 sm:space-y-8">
          {FEATURES.map((feat, i) => {
            const Icon = feat.icon;
            const Mockup = feat.mockup;
            const isEven = i % 2 === 1;

            return (
              <motion.div
                key={feat.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeUp}
                custom={0}
                className="group"
              >
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 sm:p-8 hover:bg-white/[0.06] hover:border-white/15 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5">
                  <div className={`flex flex-col ${isEven ? "lg:flex-row-reverse" : "lg:flex-row"} gap-8 items-center`}>
                    {/* Text Side */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feat.gradient} flex items-center justify-center shadow-lg`}>
                          <Icon className="text-white text-lg" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white">{feat.title}</h3>
                      </div>
                      <p className="text-sm text-white/50 mb-4 leading-relaxed">{feat.subtitle}</p>
                      <div className="flex flex-wrap gap-2">
                        {feat.pills.map((pill) => (
                          <span key={pill} className="text-[10px] sm:text-xs font-medium px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">
                            {pill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Mockup Side */}
                    <div className="flex-1 w-full lg:max-w-sm">
                      <Mockup />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Tech Stack Section ─────────────────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 sm:py-32">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="text-center mb-16"
        >
          <motion.span variants={fadeUp} className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 mb-4 block">
            Tech Stack
          </motion.span>
          <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-5xl font-black tracking-tight">
            Built with the{" "}
            <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">best tools</span>
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4"
        >
          {TECH_STACK.map((tech, i) => {
            const TechIcon = tech.icon;
            return (
              <motion.div
                key={tech.name}
                variants={scaleIn}
                custom={i}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-4 sm:p-5 text-center hover:bg-white/[0.06] hover:border-white/15 transition-all duration-300"
              >
                <TechIcon className="mx-auto text-2xl text-indigo-400 mb-2 group-hover:text-purple-400 transition-colors" />
                <div className="text-sm font-semibold text-white mb-0.5">{tech.name}</div>
                <div className="text-[10px] sm:text-xs text-white/40">{tech.role}</div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ── Stats Section ──────────────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-24 sm:py-32">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8 sm:p-12"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <motion.div key={stat.label} variants={fadeUp} custom={i} className="text-center">
                <div className="text-3xl sm:text-5xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs sm:text-sm text-white/50 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── CTA Section ────────────────────────────────────────── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-24 sm:py-32 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
        >
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-5xl font-black tracking-tight mb-6">
            Ready to{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
              level up
            </span>
            ?
          </motion.h2>
          <motion.p variants={fadeUp} custom={1} className="text-white/50 max-w-lg mx-auto mb-10">
            Join Relay and transform the way you code, document, and collaborate.
          </motion.p>
          <motion.div variants={fadeUp} custom={2}>
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl font-semibold shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all"
            >
              Get Started — Free
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <RelayLogo className="text-white text-xs" />
            </div>
            <span className="text-sm font-semibold">Relay</span>
          </div>
          <p className="text-xs text-white/30">
            © 2026 Relay. Engineered by Manas Raj.
          </p>
          <a
            href="https://github.com/manaskng/DevNexus"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/30 hover:text-white/60 transition-colors"
          >
            <FiGithub className="text-lg" />
          </a>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
