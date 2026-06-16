import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FiBarChart2,
  FiZap,
  FiCalendar,
  FiCheckCircle,
  FiCode,
  FiActivity,
  FiTag,
  FiTrendingUp,
  FiTrendingDown,
  FiAward,
  FiLoader,
  FiAlertTriangle,
} from "react-icons/fi";

const API = import.meta.env.VITE_API_URL;

// ─── helpers ───────────────────────────────────────────────────────────────────

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

/** Normalise any date to a YYYY-MM-DD key in local time */
const toDateKey = (d) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
};

/** Get an array of YYYY-MM-DD keys for the last N days (most recent last) */
const lastNDays = (n) => {
  const days = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push(toDateKey(d));
  }
  return days;
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const LANGUAGE_COLORS = {
  javascript: "#f7df1e",
  typescript: "#3178c6",
  python: "#3572A5",
  java: "#b07219",
  "c++": "#6866fb",
  cpp: "#6866fb",
  c: "#555555",
  "c#": "#178600",
  csharp: "#178600",
  go: "#00ADD8",
  rust: "#dea584",
  ruby: "#701516",
  php: "#4F5D95",
  swift: "#F05138",
  kotlin: "#A97BFF",
  html: "#e34c26",
  css: "#563d7c",
  sql: "#e38c00",
  shell: "#89e051",
  bash: "#89e051",
  dart: "#00B4AB",
  r: "#198CE7",
  lua: "#000080",
  scala: "#c22d40",
  elixir: "#6e4a7e",
  haskell: "#5e5086",
  markdown: "#083fa1",
  json: "#40a977",
  yaml: "#cb171e",
  xml: "#0060ac",
  other: "#8b5cf6",
};

const getLanguageColor = (lang) =>
  LANGUAGE_COLORS[lang?.toLowerCase()] || LANGUAGE_COLORS.other;

// ─── animation variants ────────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// ─── sub-components ────────────────────────────────────────────────────────────

function SectionCard({ children, className = "", span = false }) {
  return (
    <motion.div
      variants={cardVariants}
      className={`rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 md:p-6 ${span ? "lg:col-span-2" : ""} ${className}`}
    >
      {children}
    </motion.div>
  );
}

function SectionHeader({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-4 h-4 text-slate-400" />
      <span className="text-xs font-black uppercase tracking-widest text-slate-400">
        {label}
      </span>
    </div>
  );
}

// ─── Relay Score Ring ──────────────────────────────────────────────────────────

function ScoreRing({ score, maxScore = 1000 }) {
  const radius = 80;
  const stroke = 10;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(score / maxScore, 1);
  const dashOffset = circumference * (1 - progress);

  const getLevel = (s) => {
    if (s >= 901) return { label: "Legend", emoji: "🏆" };
    if (s >= 601) return { label: "Veteran", emoji: "⚡" };
    if (s >= 301) return { label: "Architect", emoji: "🏗️" };
    if (s >= 101) return { label: "Builder", emoji: "🔨" };
    return { label: "Beginner", emoji: "🌱" };
  };

  const level = getLevel(score);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg
          width={(radius + stroke) * 2}
          height={(radius + stroke) * 2}
          className="transform -rotate-90"
        >
          <defs>
            <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#d946ef" />
            </linearGradient>
          </defs>
          {/* background track */}
          <circle
            cx={radius + stroke}
            cy={radius + stroke}
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-slate-200 dark:text-white/10"
            strokeWidth={stroke}
          />
          {/* progress arc */}
          <motion.circle
            cx={radius + stroke}
            cy={radius + stroke}
            r={radius}
            fill="none"
            stroke="url(#scoreGrad)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        {/* center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-slate-400 mt-1 font-medium">
            / {maxScore}
          </span>
        </div>
      </div>
      <div className="text-center">
        <span className="text-lg font-bold text-slate-700 dark:text-slate-200">
          {level.emoji} {level.label}
        </span>
        <p className="text-xs text-slate-400 mt-1">Relay Score</p>
      </div>
    </div>
  );
}

// ─── Activity Streak Grid ──────────────────────────────────────────────────────

function StreakGrid({ activityMap }) {
  const days = lastNDays(84); // 12 weeks
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const getCellColor = (count) => {
    if (count >= 4) return "bg-emerald-500";
    if (count >= 2) return "bg-emerald-700";
    if (count >= 1) return "bg-emerald-900";
    return "bg-slate-200 dark:bg-slate-800";
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-[3px] min-w-fit">
        {/* Day labels column */}
        <div className="flex flex-col gap-[3px] mr-1">
          {DAY_LABELS.map((label, i) => (
            <div
              key={label}
              className="h-[14px] flex items-center text-[10px] text-slate-400 font-medium"
            >
              {i % 2 === 1 ? label : ""}
            </div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day) => {
              const count = activityMap[day] || 0;
              return (
                <div
                  key={day}
                  title={`${day}: ${count} action${count !== 1 ? "s" : ""}`}
                  className={`w-[14px] h-[14px] rounded-[3px] ${getCellColor(count)} transition-colors`}
                />
              );
            })}
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-1 mt-3 text-[10px] text-slate-400">
        <span>Less</span>
        <div className="w-[10px] h-[10px] rounded-[2px] bg-slate-200 dark:bg-slate-800" />
        <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-900" />
        <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-700" />
        <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-500" />
        <span>More</span>
      </div>
    </div>
  );
}

// ─── main component ────────────────────────────────────────────────────────────

export default function Analytics() {
  const [notes, setNotes] = useState([]);
  const [snippets, setSnippets] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── fetch data ──
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [notesRes, snippetsRes, tasksRes] = await Promise.allSettled([
          fetch(`${API}/api/notes`, authHeaders()).then((r) => r.json()),
          fetch(`${API}/api/snippets`, authHeaders()).then((r) => r.json()),
          fetch(`${API}/api/tasks`, authHeaders()).then((r) => r.json()),
        ]);
        if (notesRes.status === "fulfilled") setNotes(notesRes.value || []);
        if (snippetsRes.status === "fulfilled") setSnippets(snippetsRes.value || []);
        if (tasksRes.status === "fulfilled") setTasks(tasksRes.value || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ── derived data ──────────────────────────────────────────────────────────

  /** Map of YYYY-MM-DD → action count for any day */
  const activityMap = useMemo(() => {
    const map = {};
    const bump = (dateStr) => {
      if (!dateStr) return;
      const key = toDateKey(dateStr);
      map[key] = (map[key] || 0) + 1;
    };
    notes.forEach((n) => {
      bump(n.createdAt);
      if (n.updatedAt && n.updatedAt !== n.createdAt) bump(n.updatedAt);
    });
    snippets.forEach((s) => bump(s.createdAt));
    tasks.forEach((t) => {
      bump(t.createdAt);
      if (t.isCompleted && t.updatedAt) bump(t.updatedAt);
    });
    return map;
  }, [notes, snippets, tasks]);

  /** Streak calculations */
  const { currentStreak, longestStreak } = useMemo(() => {
    const today = new Date();
    let current = 0;
    let longest = 0;
    let streak = 0;
    let started = false;

    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = toDateKey(d);
      if (activityMap[key]) {
        streak++;
        if (!started) started = true;
      } else {
        if (i === 0) {
          // today has no activity yet, don't break — check yesterday
          continue;
        }
        if (started && current === 0) current = streak;
        longest = Math.max(longest, streak);
        streak = 0;
        if (current > 0) {
          // keep scanning for longest
        }
      }
    }
    longest = Math.max(longest, streak);
    if (current === 0) current = streak;
    return { currentStreak: current, longestStreak: longest };
  }, [activityMap]);

  /** Relay Score */
  const completedTasks = useMemo(
    () => tasks.filter((t) => t.isCompleted).length,
    [tasks]
  );
  const relayScore = useMemo(() => {
    const raw =
      notes.length * 10 +
      snippets.length * 15 +
      completedTasks * 20 +
      currentStreak * 5;
    return Math.min(raw, 1000);
  }, [notes, snippets, completedTasks, currentStreak]);

  /** Task efficiency */
  const taskStats = useMemo(() => {
    const total = tasks.length;
    const completed = completedTasks;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const high = tasks.filter((t) => t.priority === "high").length;
    const medium = tasks.filter((t) => t.priority === "medium").length;
    const low = tasks.filter((t) => t.priority === "low").length;

    // This week vs last week
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

    const thisWeek = tasks.filter((t) => {
      if (!t.isCompleted) return false;
      const d = new Date(t.updatedAt || t.createdAt);
      return d >= startOfWeek;
    }).length;

    const lastWeek = tasks.filter((t) => {
      if (!t.isCompleted) return false;
      const d = new Date(t.updatedAt || t.createdAt);
      return d >= startOfLastWeek && d < startOfWeek;
    }).length;

    return { total, completed, rate, high, medium, low, thisWeek, lastWeek };
  }, [tasks, completedTasks]);

  /** Language distribution */
  const langDistribution = useMemo(() => {
    const map = {};
    snippets.forEach((s) => {
      const lang = (s.language || "Other").toLowerCase();
      map[lang] = (map[lang] || 0) + 1;
    });
    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
    const total = snippets.length || 1;
    return sorted.map(([lang, count]) => ({
      lang,
      count,
      pct: Math.round((count / total) * 100),
      color: getLanguageColor(lang),
    }));
  }, [snippets]);

  /** Weekly activity (last 7 days) */
  const weeklyActivity = useMemo(() => {
    const days = lastNDays(7);
    return days.map((day) => ({
      day,
      label: DAY_LABELS[new Date(day + "T00:00:00").getDay()],
      count: activityMap[day] || 0,
    }));
  }, [activityMap]);

  const maxWeeklyCount = useMemo(
    () => Math.max(...weeklyActivity.map((d) => d.count), 1),
    [weeklyActivity]
  );

  /** Top Tags */
  const topTags = useMemo(() => {
    const map = {};
    snippets.forEach((s) => {
      (s.tags || []).forEach((tag) => {
        const t = tag.trim().toLowerCase();
        if (t) map[t] = (map[t] || 0) + 1;
      });
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));
  }, [snippets]);

  // ── loading state ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <FiLoader className="w-8 h-8 text-purple-500" />
        </motion.div>
        <p className="text-sm text-slate-400 font-medium">
          Crunching your data...
        </p>
      </div>
    );
  }

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <motion.div
      className="max-w-6xl mx-auto p-4 md:p-8 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Page Header */}
      <motion.div variants={cardVariants}>
        <div className="flex items-center gap-3 mb-1">
          <FiBarChart2 className="w-6 h-6 text-purple-500" />
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
            Analytics
          </h1>
        </div>
        <p className="text-sm text-slate-400 ml-9">
          Your developer productivity metrics
        </p>
      </motion.div>

      {/* ── Error banner ── */}
      {error && (
        <motion.div
          variants={cardVariants}
          className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
        >
          <FiAlertTriangle className="w-4 h-4 shrink-0" />
          <span>Some data could not be loaded: {error}</span>
        </motion.div>
      )}

      {/* ── 1. Relay Score Hero (full width) ── */}
      <SectionCard span>
        <SectionHeader icon={FiAward} label="Relay Score" />
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 py-4">
          <ScoreRing score={relayScore} />
          {/* stat pills */}
          <div className="grid grid-cols-2 gap-4 text-center">
            {[
              { label: "Notes", value: notes.length, color: "text-sky-500" },
              { label: "Snippets", value: snippets.length, color: "text-amber-500" },
              { label: "Completed", value: completedTasks, color: "text-emerald-500" },
              { label: "Streak", value: `${currentStreak}d`, color: "text-fuchsia-500" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 px-5 py-3"
              >
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* ── 2-column grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── 2. Activity Streak ── */}
        <SectionCard className="lg:col-span-2">
          <SectionHeader icon={FiCalendar} label="Activity Streak" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex gap-6">
              <div>
                <p className="text-3xl font-black text-emerald-500">
                  {currentStreak}
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                  Current Streak
                </p>
              </div>
              <div>
                <p className="text-3xl font-black text-purple-500">
                  {longestStreak}
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                  Longest Streak
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5">
            <StreakGrid activityMap={activityMap} />
          </div>
        </SectionCard>

        {/* ── 3. Task Efficiency ── */}
        <SectionCard>
          <SectionHeader icon={FiCheckCircle} label="Task Efficiency" />

          {/* Completion rate */}
          <div className="mb-5">
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                Completion Rate
              </span>
              <span className="font-bold text-emerald-500">
                {taskStats.rate}%
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                initial={{ width: 0 }}
                animate={{ width: `${taskStats.rate}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>{taskStats.completed} completed</span>
              <span>{taskStats.total} total</span>
            </div>
          </div>

          {/* Priority breakdown */}
          <div className="space-y-2.5 mb-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Priority Breakdown
            </p>
            {[
              { label: "High", count: taskStats.high, color: "bg-red-500", total: taskStats.total },
              { label: "Medium", count: taskStats.medium, color: "bg-amber-500", total: taskStats.total },
              { label: "Low", count: taskStats.low, color: "bg-blue-500", total: taskStats.total },
            ].map((p) => (
              <div key={p.label} className="flex items-center gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 w-14 font-medium">
                  {p.label}
                </span>
                <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${p.color}`}
                    initial={{ width: 0 }}
                    animate={{
                      width: `${p.total > 0 ? (p.count / p.total) * 100 : 0}%`,
                    }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 w-6 text-right">
                  {p.count}
                </span>
              </div>
            ))}
          </div>

          {/* This week vs last week */}
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-white/5 p-3">
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
                This week
              </p>
              <p className="text-xl font-bold text-slate-700 dark:text-white">
                {taskStats.thisWeek}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {taskStats.thisWeek >= taskStats.lastWeek ? (
                <FiTrendingUp className="w-5 h-5 text-emerald-500" />
              ) : (
                <FiTrendingDown className="w-5 h-5 text-red-400" />
              )}
            </div>
            <div className="flex-1 text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
                Last week
              </p>
              <p className="text-xl font-bold text-slate-700 dark:text-white">
                {taskStats.lastWeek}
              </p>
            </div>
          </div>
        </SectionCard>

        {/* ── 4. Language Distribution ── */}
        <SectionCard>
          <SectionHeader icon={FiCode} label="Language Distribution" />
          {langDistribution.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">
              No snippets yet — start coding!
            </p>
          ) : (
            <div className="space-y-3">
              {langDistribution.map(({ lang, count, pct, color }) => (
                <div key={lang}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize text-slate-600 dark:text-slate-300 font-medium">
                      {lang}
                    </span>
                    <span className="text-xs text-slate-400">
                      {count}{" "}
                      <span className="text-slate-300 dark:text-slate-500">
                        ({pct}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* ── 5. Weekly Activity Chart ── */}
        <SectionCard>
          <SectionHeader icon={FiActivity} label="Weekly Activity" />
          <div className="flex items-end justify-between gap-2 h-40">
            {weeklyActivity.map(({ day, label, count }, i) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  {count}
                </span>
                <motion.div
                  className="w-full rounded-lg bg-gradient-to-t from-indigo-500 to-purple-400 min-h-[4px]"
                  initial={{ height: 4 }}
                  animate={{
                    height: `${Math.max((count / maxWeeklyCount) * 120, 4)}px`,
                  }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease: "easeOut" }}
                />
                <span className="text-[10px] text-slate-400 mt-1 font-medium">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ── 6. Top Tags Cloud ── */}
        <SectionCard>
          <SectionHeader icon={FiTag} label="Top Tags" />
          {topTags.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">
              No tags found — tag your snippets!
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {topTags.map(({ tag, count }, i) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
                    bg-gradient-to-r from-purple-500/10 to-fuchsia-500/10
                    border border-purple-500/20
                    text-purple-600 dark:text-purple-300"
                >
                  <span>#</span>
                  {tag}
                  <span className="bg-purple-500/20 text-purple-500 dark:text-purple-300 rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none">
                    {count}
                  </span>
                </motion.span>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </motion.div>
  );
}
