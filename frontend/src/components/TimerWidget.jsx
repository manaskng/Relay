import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiClock, FiPlay, FiPause, FiRotateCcw, FiX } from "react-icons/fi";
import confetti from "canvas-confetti";

function TimerWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("timer"); // 'stopwatch' or 'timer'

  // Stopwatch state
  const [swTime, setSwTime] = useState(0);
  const [isSwRunning, setIsSwRunning] = useState(false);

  // Timer state
  const defaultTimer = 25 * 60;
  const [tmTime, setTmTime] = useState(defaultTimer);
  const [isTmRunning, setIsTmRunning] = useState(false);
  const [isTmDone, setIsTmDone] = useState(false);

  const swInterval = useRef(null);
  const tmInterval = useRef(null);
  const dropdownRef = useRef(null);

  // Handle clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Stopwatch effect
  useEffect(() => {
    if (isSwRunning) {
      swInterval.current = setInterval(() => {
        setSwTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(swInterval.current);
    }
    return () => clearInterval(swInterval.current);
  }, [isSwRunning]);

  // Timer effect
  useEffect(() => {
    if (isTmRunning && tmTime > 0) {
      tmInterval.current = setInterval(() => {
        setTmTime(prev => {
          if (prev <= 1) {
            clearInterval(tmInterval.current);
            setIsTmRunning(false);
            setIsTmDone(true);
            confetti({
              particleCount: 100, spread: 70, origin: { y: 0.6 },
              colors: ["#6366f1", "#10b981", "#f59e0b"]
            });
            // Show notification
            if (Notification.permission === "granted") {
              new Notification("Time's up!", { body: "Your focus session is complete." });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(tmInterval.current);
    }
    return () => clearInterval(tmInterval.current);
  }, [isTmRunning, tmTime]);

  // Ask for notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSwToggle = () => setIsSwRunning(!isSwRunning);
  const handleSwReset = () => { setIsSwRunning(false); setSwTime(0); };

  const handleTmToggle = () => {
    if (isTmDone) { setIsTmDone(false); setTmTime(defaultTimer); }
    setIsTmRunning(!isTmRunning);
  };
  const handleTmReset = () => { setIsTmRunning(false); setTmTime(defaultTimer); setIsTmDone(false); };

  // Which time to display in navbar?
  const displayTime = isSwRunning ? formatTime(swTime) : (isTmRunning || tmTime !== defaultTimer) ? formatTime(tmTime) : null;
  const isAnyRunning = isSwRunning || isTmRunning;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all border ${
          isAnyRunning || isOpen 
            ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-dev-accent/20 dark:text-dev-accent dark:border-dev-accent/30' 
            : 'text-slate-500 hover:bg-slate-100 border-transparent dark:text-gray-400 dark:hover:bg-white/5'
        }`}
      >
        <FiClock size={16} className={isAnyRunning ? "animate-pulse" : ""} />
        {displayTime && <span className="text-xs font-mono font-bold tracking-wider">{displayTime}</span>}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-[#1e293b] rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
          >
            {/* Tabs */}
            <div className="flex w-full border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-[#0f172a]">
              <button 
                onClick={() => setMode("stopwatch")}
                className={`flex-1 py-2.5 text-xs font-bold transition-colors ${mode === "stopwatch" ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                Stopwatch
              </button>
              <button 
                onClick={() => setMode("timer")}
                className={`flex-1 py-2.5 text-xs font-bold transition-colors ${mode === "timer" ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                Timer
              </button>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col items-center">
              
              {mode === "stopwatch" && (
                <>
                  <div className="text-4xl font-mono font-black text-slate-800 dark:text-white tracking-tight mb-6">
                    {formatTime(swTime)}
                  </div>
                  <div className="flex gap-3 w-full">
                    <button onClick={handleSwToggle} className={`flex-1 flex justify-center items-center gap-2 py-2 rounded-lg text-sm font-bold text-white transition-all ${isSwRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20'}`}>
                      {isSwRunning ? <FiPause/> : <FiPlay/>} {isSwRunning ? 'Pause' : 'Start'}
                    </button>
                    <button onClick={handleSwReset} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                      <FiRotateCcw/>
                    </button>
                  </div>
                </>
              )}

              {mode === "timer" && (
                <>
                  <div className={`text-4xl font-mono font-black tracking-tight mb-6 ${isTmDone ? 'text-emerald-500 animate-pulse' : 'text-slate-800 dark:text-white'}`}>
                    {formatTime(tmTime)}
                  </div>
                  <div className="flex gap-3 w-full">
                    <button onClick={handleTmToggle} className={`flex-1 flex justify-center items-center gap-2 py-2 rounded-lg text-sm font-bold text-white transition-all ${isTmRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20'}`}>
                      {isTmRunning ? <FiPause/> : <FiPlay/>} {isTmRunning ? 'Pause' : 'Start'}
                    </button>
                    <button onClick={handleTmReset} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                      <FiRotateCcw/>
                    </button>
                  </div>
                  {!isTmRunning && tmTime !== defaultTimer && (
                    <div className="mt-3 text-[10px] text-slate-400">Default: 25:00</div>
                  )}
                </>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TimerWidget;
