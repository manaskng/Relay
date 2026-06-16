import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FiHome, FiFileText, FiCode, FiLayers, FiPlus,
  FiZap, FiArrowRight, FiCalendar, FiActivity,
  FiTrendingUp, FiBarChart2, FiTarget, FiAward
} from "react-icons/fi";

// ──────────────────────────────────────────────────────
// Dashboard Home — The command center.
// Shows quick stats, recent activity, quick actions,
// and upcoming contests at a glance.
// ──────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, accent, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4, type: "spring" }}
    className="group relative p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-slate-300 dark:hover:border-white/20 transition-all hover:-translate-y-0.5"
  >
    <div className="flex items-center justify-between mb-3">
      <div className={`p-2.5 rounded-xl ${accent} transition-transform group-hover:scale-110`}>
        <Icon size={18} />
      </div>
    </div>
    <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{value}</p>
    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">{label}</p>
  </motion.div>
);

const QuickAction = ({ icon: Icon, label, description, onClick, accent, delay = 0 }) => (
  <motion.button
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    onClick={onClick}
    className="group p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-left hover:border-blue-300 dark:hover:border-blue-500/30 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/5"
  >
    <div className="flex items-center justify-between mb-3">
      <div className={`p-2.5 rounded-xl ${accent}`}>
        <Icon size={18} />
      </div>
      <FiArrowRight className="text-slate-300 dark:text-slate-600 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" size={16} />
    </div>
    <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1">{label}</h3>
    <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
  </motion.button>
);

const ActivityItem = ({ action, time, icon: Icon }) => (
  <div className="flex items-start gap-3 py-3 border-b border-slate-100 dark:border-white/5 last:border-0">
    <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0">
      <Icon size={12} />
    </div>
    <div className="min-w-0">
      <p className="text-sm text-slate-700 dark:text-slate-300 font-medium truncate">{action}</p>
      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{time}</p>
    </div>
  </div>
);

function DashboardHome({ setActiveTab }) {
  const [stats, setStats] = useState({ docs: 0, snippets: 0, tasks: 0 });
  const [relayScore, setRelayScore] = useState({ score: 0, level: "Beginner", streak: 0, completionRate: 0, totalCompleted: 0, totalTasks: 0 });
  const [activity, setActivity] = useState([]);
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      try {
        // Fetch stats from existing endpoints in parallel
        const [notesRes, snippetsRes, tasksRes] = await Promise.allSettled([
          axios.get(`${API_URL}/api/notes`, { headers }),
          axios.get(`${API_URL}/api/snippets`, { headers }),
          axios.get(`${API_URL}/api/tasks`, { headers }),
        ]);

        const notes = notesRes.status === "fulfilled" ? notesRes.value.data : [];
        const snippets = snippetsRes.status === "fulfilled" ? snippetsRes.value.data : [];
        const tasks = tasksRes.status === "fulfilled" ? tasksRes.value.data : [];

        setStats({
          docs: notes.length,
          snippets: snippets.length,
          tasks: tasks.filter(t => !t.isCompleted).length,
        });

        // Build activity feed from timestamps
        const allItems = [
          ...notes.map(n => ({
            action: `Edited "${n.title}"`,
            time: n.updatedAt,
            icon: FiFileText,
          })),
          ...snippets.map(s => ({
            action: `Saved snippet "${s.title}"`,
            time: s.updatedAt || s.createdAt,
            icon: FiCode,
          })),
          ...tasks.filter(t => t.isCompleted).map(t => ({
            action: `Completed "${t.content}"`,
            time: t.updatedAt || t.createdAt,
            icon: FiLayers,
          })),
        ]
          .sort((a, b) => new Date(b.time) - new Date(a.time))
          .slice(0, 8);

        setActivity(allItems);

        // ── Calculate Relay Score & Streak ──
        const completedTasks = tasks.filter(t => t.isCompleted);
        const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

        // Calculate streak: consecutive days with activity (going backwards from today)
        const allDates = new Set();
        [...notes, ...snippets, ...tasks].forEach(item => {
          const d = new Date(item.updatedAt || item.createdAt);
          allDates.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
        });
        
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 365; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
          if (allDates.has(key)) streak++;
          else if (i > 0) break; // Allow today to have no activity yet
        }

        // Score formula
        const rawScore = (notes.length * 10) + (snippets.length * 15) + (completedTasks.length * 20) + (streak * 5);
        const score = Math.min(rawScore, 1000);
        const level = score >= 901 ? "Legend" : score >= 601 ? "Veteran" : score >= 301 ? "Architect" : score >= 101 ? "Builder" : "Beginner";

        setRelayScore({ score, level, streak, completionRate, totalCompleted: completedTasks.length, totalTasks: tasks.length });

        // Fetch upcoming contests
        try {
          const contestRes = await axios.get(`${API_URL}/api/contests`);
          setContests((contestRes.data.contests || []).slice(0, 3));
        } catch {
          // Contest API optional — don't break anything
        }
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [API_URL]);

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const formatCountdown = (dateStr) => {
    const diff = new Date(dateStr).getTime() - Date.now();
    if (diff <= 0) return "Live now";
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (days > 0) return `${days}d ${remainingHours}h`;
    return `${remainingHours}h`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <FiZap className="text-blue-500 animate-pulse" size={28} />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <FiHome className="text-blue-500" /> Command Center
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Your developer workspace at a glance.
        </p>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon={FiFileText} label="Documents" value={stats.docs} accent="bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400" delay={0.1} />
        <StatCard icon={FiCode} label="Snippets" value={stats.snippets} accent="bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400" delay={0.15} />
        <StatCard icon={FiLayers} label="Active Tasks" value={stats.tasks} accent="bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400" delay={0.2} />
      </div>

      {/* Relay Score Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        className="rounded-2xl border border-slate-200 dark:border-white/10 bg-gradient-to-r from-white via-white to-white dark:from-[#0f172a] dark:via-[#0f172a]/80 dark:to-indigo-950/30 overflow-hidden"
      >
        <div className="p-5 md:p-6 flex flex-col md:flex-row items-center gap-6">
          {/* Score Ring */}
          <div className="relative shrink-0">
            <svg width="100" height="100" viewBox="0 0 100 100" className="transform -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-100 dark:text-white/5" />
              <circle
                cx="50" cy="50" r="42" fill="none" strokeWidth="6" strokeLinecap="round"
                stroke="url(#scoreGradient)"
                strokeDasharray={`${(relayScore.score / 1000) * 264} 264`}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#d946ef" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{relayScore.score}</span>
              <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">{relayScore.level}</span>
            </div>
          </div>

          {/* Score Metrics */}
          <div className="flex-1 grid grid-cols-3 gap-4 md:gap-6 w-full">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-1.5 mb-1">
                <FiTrendingUp size={12} className="text-emerald-500" />
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Streak</span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{relayScore.streak}<span className="text-sm font-bold text-slate-400 ml-1">days</span></p>
            </div>
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-1.5 mb-1">
                <FiTarget size={12} className="text-blue-500" />
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Completion</span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{relayScore.completionRate}<span className="text-sm font-bold text-slate-400 ml-1">%</span></p>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full mt-1.5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${relayScore.completionRate}%` }} />
              </div>
            </div>
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-1.5 mb-1">
                <FiAward size={12} className="text-amber-500" />
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Done</span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{relayScore.totalCompleted}<span className="text-sm font-bold text-slate-400 ml-1">/{relayScore.totalTasks}</span></p>
            </div>
          </div>

          {/* View Analytics CTA */}
          <button
            onClick={() => setActiveTab("analytics")}
            className="shrink-0 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 group active:scale-95"
          >
            <FiBarChart2 size={14} />
            <span className="hidden sm:inline">Analytics</span>
            <FiArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </motion.div>

      {/* Main Grid: Activity + Contests */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 flex items-center gap-2">
            <FiActivity size={14} className="text-slate-400" />
            <h2 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Recent Activity</h2>
          </div>
          <div className="px-5 py-2 max-h-[320px] overflow-y-auto custom-scrollbar">
            {activity.length === 0 ? (
              <div className="py-10 text-center text-slate-400 dark:text-slate-500 text-sm">
                No activity yet. Start creating docs, snippets, or tasks.
              </div>
            ) : (
              activity.map((item, i) => (
                <ActivityItem
                  key={i}
                  action={item.action}
                  time={formatTimeAgo(item.time)}
                  icon={item.icon}
                />
              ))
            )}
          </div>
        </div>

        {/* Upcoming Contests */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiCalendar size={14} className="text-slate-400" />
              <h2 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Upcoming Contests</h2>
            </div>
            <button
              onClick={() => setActiveTab("contests")}
              className="text-[10px] font-bold text-blue-500 hover:text-blue-600 uppercase tracking-wider"
            >
              View All →
            </button>
          </div>
          <div className="p-4 space-y-3">
            {contests.length === 0 ? (
              <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-sm">
                No upcoming contests found.
              </div>
            ) : (
              contests.map((contest, i) => (
                <a
                  key={i}
                  href={contest.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block p-3 rounded-xl border border-slate-100 dark:border-white/5 hover:border-blue-200 dark:hover:border-blue-500/20 hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-all group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span
                        className="inline-block text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded mb-1.5"
                        style={{
                          backgroundColor: contest.platform.color + "15",
                          color: contest.platform.color,
                        }}
                      >
                        {contest.platform.shortName}
                      </span>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {contest.name}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap mt-1">
                      {formatCountdown(contest.startTime)}
                    </span>
                  </div>
                </a>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <FiZap size={12} /> Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAction
            icon={FiPlus}
            label="New Document"
            description="Create a research doc or note"
            onClick={() => setActiveTab("docs")}
            accent="bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
            delay={0.1}
          />
          <QuickAction
            icon={FiZap}
            label="RelaySandBox"
            description="Launch collaborative coding"
            onClick={() => setActiveTab("devspace")}
            accent="bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400"
            delay={0.15}
          />
          <QuickAction
            icon={FiCode}
            label="Add Snippet"
            description="Save an algorithm or pattern"
            onClick={() => setActiveTab("snippets")}
            accent="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
            delay={0.2}
          />
          <QuickAction
            icon={FiLayers}
            label="New Task"
            description="Capture an objective"
            onClick={() => setActiveTab("tasks")}
            accent="bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400"
            delay={0.25}
          />
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;
