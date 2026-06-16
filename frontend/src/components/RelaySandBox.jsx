import React, { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from 'uuid';
import { io } from "socket.io-client";
import ReactMarkdown from 'react-markdown';
import axios from "axios";
import { 
  FiZap, FiWifi, FiPlay, FiChevronDown, FiActivity, FiTerminal, 
  FiLoader, FiLogOut, FiCopy, FiCheck, FiArrowRight, FiPlus, 
  FiHash, FiSave, FiX, FiTag, FiFileText, FiLayout, FiUser
} from "react-icons/fi";

// --- CUSTOM COMPONENTS ---
import PresenceBar from "./devspace/PresenceBar";
import CodeEditor from "./devspace/CodeEditor";

// --- SOCKET CONFIGURATION ---
const socket = io(import.meta.env.VITE_API_URL, { 
  autoConnect: false,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

const LANGUAGES = [
  { id: "javascript", label: "JavaScript (Node)" },
  { id: "typescript", label: "TypeScript" },
  { id: "python", label: "Python 3" },
  { id: "java", label: "Java" },
  { id: "cpp", label: "C++" },
  { id: "go", label: "Go" },
  { id: "rust", label: "Rust" },
];

function RelaySandBox() {
  // =========================================
  // 1. STATE MANAGEMENT
  // =========================================
  
  // UI View State
  const [viewState, setViewState] = useState("lobby"); 
  const [mobileTab, setMobileTab] = useState("editor"); 
  const [activeSidebarTab, setActiveSidebarTab] = useState("ai"); 
  
  // Save Modal State
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveForm, setSaveForm] = useState({ title: "", description: "", tags: "" });

  // Session Data
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]); 
  const [typingUsers, setTypingUsers] = useState(new Map()); 
  const [roomCopied, setRoomCopied] = useState(false);
  
  // Feature Loading States
  const [isSaving, setIsSaving] = useState(false); 
  const [isCompiling, setIsCompiling] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Content State
  const [code, setCode] = useState("// Welcome to RelaySandBox!\n// Select a language and start coding...");
  const [language, setLanguage] = useState("javascript");
  
  // Logs & Output
  const [logs, setLogs] = useState([]);
  const [aiResponse, setAiResponse] = useState(null);
  const [terminalOutput, setTerminalOutput] = useState([]); 

  // =========================================
  // 2. REFS (For Event Listeners)
  // =========================================
  const roomIdRef = useRef("");
  const userNameRef = useRef("");
  const terminalRef = useRef(null);
  const logsRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Keep refs synced with state
  useEffect(() => {
    roomIdRef.current = roomId;
    userNameRef.current = userName;
  }, [roomId, userName]);

  // =========================================
  // 3. SOCKET LOGIC (The Core)
  // =========================================
  useEffect(() => {
    // --- Connection Handlers ---
    const onConnect = () => {
      setIsConnected(true);
      if (roomIdRef.current && userNameRef.current) {
        socket.emit("join_room", { 
          roomId: roomIdRef.current, 
          userName: userNameRef.current 
        });
      }
    };

    const onDisconnect = () => setIsConnected(false);

    // --- Real-Time Sync Handlers ---
    const onRoomUpdate = (users) => setActiveUsers(users);

    const onUserTyping = ({ socketId, userName, isTyping }) => {
      setTypingUsers(prev => {
        const newMap = new Map(prev);
        if (isTyping) newMap.set(socketId, userName);
        else newMap.delete(socketId);
        return newMap;
      });
    };

    const onCodeUpdate = (newCode) => setCode(newCode);
    const onLangUpdate = (newLang) => setLanguage(newLang);

    const onActivityLog = (log) => {
      setLogs((prev) => [log, ...prev]);
      if (logsRef.current) logsRef.current.scrollTop = 0;
    };

    // --- Attach Listeners ---
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("room_users_update", onRoomUpdate);
    socket.on("user_typing", onUserTyping);
    socket.on("code_update", onCodeUpdate);
    socket.on("language_update", onLangUpdate);
    socket.on("activity_log", onActivityLog);
    socket.on("load_previous_logs", (h) => setLogs(h.reverse()));

    // --- Cleanup on Unmount ---
    return () => {
      if (roomIdRef.current && userNameRef.current) {
        socket.emit("leave_room", { 
          roomId: roomIdRef.current, 
          userName: userNameRef.current 
        });
      }
      socket.disconnect();
      socket.off("connect"); socket.off("disconnect");
      socket.off("room_users_update"); socket.off("user_typing");
      socket.off("code_update"); socket.off("language_update");
      socket.off("activity_log"); socket.off("load_previous_logs");
    };
  }, []);

  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [terminalOutput, aiResponse, isAiLoading]);

  // =========================================
  // 4. ACTION HANDLERS
  // =========================================
  const joinSession = (idToJoin) => {
    if (!userName.trim()) return alert("Please enter your Display Name");
    if (!idToJoin) return alert("Please enter a Room ID");

    const cleanId = idToJoin.trim().toUpperCase();
    setRoomId(cleanId);
    roomIdRef.current = cleanId;
    userNameRef.current = userName;

    socket.auth = { userName };
    socket.connect();
    socket.emit("join_room", { roomId: cleanId, userName });
    
    setViewState("workspace");
    setLogs([]);
    setTerminalOutput([{ type: 'info', text: 'Terminal Ready...' }]);
  };

  const createRoom = () => {
    const newId = uuidv4().slice(0, 6).toUpperCase();
    setRoomId(newId);
    joinSession(newId);
  };

  const leaveRoom = () => {
    socket.emit("leave_room", { roomId, userName }); 
    socket.disconnect();
    setViewState("lobby");
    setCode("// Welcome...");
    setAiResponse(null);
    setTerminalOutput([]);
    setActiveUsers([]);
    setTypingUsers(new Map());
  };

  const handleEditorChange = (value) => {
    setCode(value);
    socket.emit("code_change", { roomId, code: value });
    socket.emit("typing_start", { roomId, userName });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => socket.emit("typing_stop", { roomId }), 1000);
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    socket.emit("language_change", { roomId, language: newLang });
    socket.emit("trigger_action", { roomId, userName, actionType: `Switched to ${newLang}` });
  };

  const handleRunCode = async () => {
    if (!code.trim()) return;
    setIsCompiling(true);
    setTerminalOutput(prev => [...prev, { type: 'info', text: `> Compiling ${language}...` }]);
    setActiveSidebarTab('ai'); 
    setMobileTab('tools'); 

    try {
      const token = localStorage.getItem("token");
      const API_URL = import.meta.env.VITE_API_URL;
      const res = await axios.post(`${API_URL}/api/compiler/run`, { code, language }, { headers: { Authorization: `Bearer ${token}` } });
      const { run } = res.data;
      if (run.stdout) setTerminalOutput(prev => [...prev, { type: 'success', text: run.stdout }]);
      if (run.stderr) setTerminalOutput(prev => [...prev, { type: 'error', text: run.stderr }]);
      if (!run.stdout && !run.stderr) setTerminalOutput(prev => [...prev, { type: 'info', text: 'Process finished with exit code 0 (No Output)' }]);
      socket.emit("trigger_action", { roomId, userName, actionType: `Ran ${language} code` });
    } catch (error) {
      setTerminalOutput(prev => [...prev, { type: 'error', text: 'Execution Server Unavailable.' }]);
    } finally {
      setIsCompiling(false);
    }
  };

  const handleAiAction = async (actionType) => {
    if (!code || code.length < 5) {
      setTerminalOutput(prev => [...prev, { type: 'error', text: 'Error: Code buffer is empty.' }]);
      setActiveSidebarTab('ai');
      setMobileTab('tools');
      return;
    }
    setIsAiLoading(true);
    setAiResponse(null); 
    setActiveSidebarTab('ai'); 
    setMobileTab('tools');
    socket.emit("trigger_action", { roomId, userName, actionType: `Initiated AI: ${actionType}` });

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/ai/process`, { code, action: actionType }, { headers: { Authorization: `Bearer ${token}` } });
      setAiResponse(res.data.result);
    } catch (error) {
      setAiResponse(`**System Alert**\n\nAI Assistant is currently calibrating. Please try again.`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleOpenSaveModal = () => {
    if (!code || code.length < 10) return alert("Code is too short to save.");
    setSaveForm({
      title: `RelaySandBox Session ${new Date().toLocaleTimeString()}`,
      description: `Collaborative session in Room ${roomId} with ${activeUsers.length} active users.`,
      tags: `devspace, ${language}, collab`
    });
    setIsSaveModalOpen(true);
  };

  const handleConfirmSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const API_URL = import.meta.env.VITE_API_URL;
      const tagsArray = saveForm.tags.split(',').map(t => t.trim()).filter(t => t);
      await axios.post(`${API_URL}/api/snippets`, { title: saveForm.title, description: saveForm.description, tags: tagsArray, code, language }, { headers: { Authorization: `Bearer ${token}` } });
      alert("✅ Code saved to your Vault!");
      socket.emit("trigger_action", { roomId, userName, actionType: `Saved snippet: ${saveForm.title}` });
      setIsSaveModalOpen(false);
    } catch (error) {
      alert("❌ Failed to save snippet. Please check your connection.");
    } finally {
      setIsSaving(false);
    }
  };

  // =========================================
  // 5. RENDER LOBBY (Theme-aware with workspace preview)
  // =========================================
  if (viewState === "lobby") {
    return (
      <div className="flex items-center justify-center min-h-screen h-full bg-slate-50 dark:bg-[#020617] relative overflow-y-auto overflow-x-hidden font-sans p-4 transition-colors duration-300">
        
        {/* Blurred Workspace Preview Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30 dark:opacity-20">
          {/* Fake sidebar */}
          <div className="absolute left-0 top-0 w-16 lg:w-56 h-full bg-white dark:bg-[#0b1121] border-r border-slate-200 dark:border-white/10">
            <div className="p-4 space-y-3 mt-16">
              {[...Array(6)].map((_, i) => (
                <div key={i} className={`h-3 rounded-lg ${i === 2 ? 'bg-blue-200 dark:bg-blue-500/30 w-3/4' : 'bg-slate-200 dark:bg-white/10'} ${i > 3 ? 'w-1/2' : 'w-full'}`} />
              ))}
            </div>
          </div>
          {/* Fake editor area */}
          <div className="absolute left-16 lg:left-56 top-0 right-0 h-full">
            {/* Top toolbar */}
            <div className="h-14 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b1121] flex items-center px-6 gap-3">
              <div className="w-24 h-3 rounded bg-slate-200 dark:bg-white/10" />
              <div className="w-16 h-3 rounded bg-slate-200 dark:bg-white/10" />
            </div>
            {/* Code lines mockup */}
            <div className="p-6 space-y-2.5">
              {[
                { w: 'w-32', indent: 0, color: 'bg-indigo-200 dark:bg-indigo-500/20' },
                { w: 'w-56', indent: 0, color: 'bg-slate-200 dark:bg-white/10' },
                { w: 'w-44', indent: 1, color: 'bg-emerald-200 dark:bg-emerald-500/20' },
                { w: 'w-64', indent: 1, color: 'bg-slate-200 dark:bg-white/10' },
                { w: 'w-48', indent: 2, color: 'bg-purple-200 dark:bg-purple-500/20' },
                { w: 'w-36', indent: 2, color: 'bg-slate-200 dark:bg-white/10' },
                { w: 'w-20', indent: 1, color: 'bg-slate-200 dark:bg-white/10' },
                { w: 'w-52', indent: 0, color: 'bg-amber-200 dark:bg-amber-500/20' },
                { w: 'w-40', indent: 1, color: 'bg-slate-200 dark:bg-white/10' },
                { w: 'w-28', indent: 0, color: 'bg-slate-200 dark:bg-white/10' },
                { w: 'w-60', indent: 0, color: 'bg-indigo-200 dark:bg-indigo-500/20' },
                { w: 'w-36', indent: 1, color: 'bg-slate-200 dark:bg-white/10' },
              ].map((line, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-6 text-right text-[10px] text-slate-300 dark:text-slate-700 font-mono shrink-0">{i + 1}</span>
                  <div style={{ marginLeft: `${line.indent * 20}px` }} className={`h-2.5 rounded ${line.w} ${line.color}`} />
                </div>
              ))}
            </div>
            {/* Fake terminal at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-32 border-t border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#0a0f1e] p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <div className="w-16 h-2 rounded bg-slate-200 dark:bg-white/10" />
              </div>
              <div className="space-y-1.5">
                <div className="w-48 h-2 rounded bg-slate-200 dark:bg-white/10" />
                <div className="w-32 h-2 rounded bg-emerald-200 dark:bg-emerald-500/20" />
              </div>
            </div>
            {/* Fake presence indicators */}
            <div className="absolute top-20 right-6 flex -space-x-2">
              {['bg-blue-500', 'bg-emerald-500', 'bg-purple-500'].map((c, i) => (
                <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-white dark:border-[#020617] flex items-center justify-center text-white text-[8px] font-bold`}>
                  {['M', 'A', 'S'][i]}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Blur overlay on the preview */}
        <div className="absolute inset-0 backdrop-blur-[6px] bg-white/40 dark:bg-[#020617]/60 pointer-events-none" />

        {/* Background Ambient Glow */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
           <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse-slow"></div>
           <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-fuchsia-600/10 rounded-full blur-[100px]"></div>
        </div>

        {/* Card Container */}
        <div className="relative z-10 w-full max-w-[440px] bg-white/80 dark:bg-[#0f172a]/80 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl p-6 md:p-8 backdrop-blur-2xl animate-fade-in-up my-auto">
           
           {/* Logo Section */}
           <div className="flex flex-col items-center mb-6 md:mb-10">
             <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 rounded-2xl shadow-lg shadow-purple-500/20 flex items-center justify-center mb-3 md:mb-5 rotate-3 hover:rotate-0 transition-transform duration-500">
               <FiZap className="text-white drop-shadow-md" size={28} />
             </div>
             <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 tracking-tight mb-1 md:mb-2">RelaySandBox</h1>
             <p className="text-slate-500 dark:text-slate-400 font-medium text-xs md:text-sm">Collaborative Workspace</p>
           </div>

           {/* Input: Identity */}
           <div className="mb-4 md:mb-6 group">
             <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 md:mb-2 ml-1 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors">Your Identity</label>
             <div className="relative">
                <FiUser className="absolute left-4 top-4 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  className="w-full pl-10 pr-4 py-3.5 md:py-4 bg-slate-100 dark:bg-[#1e293b]/50 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 text-sm md:text-base"
                  placeholder="Enter Display Name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
             </div>
           </div>

           {/* Input: Join Session */}
           <div className="mb-5 md:mb-8 group">
             <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 md:mb-2 ml-1 group-focus-within:text-fuchsia-500 dark:group-focus-within:text-fuchsia-400 transition-colors">Join Session</label>
             <div className="flex gap-2">
               <div className="relative flex-1">
                 <FiHash className="absolute left-4 top-4 text-slate-400 dark:text-slate-500 group-focus-within:text-fuchsia-500 dark:group-focus-within:text-fuchsia-400 transition-colors" />
                 <input 
                   className="w-full pl-10 pr-4 py-3.5 md:py-4 bg-slate-100 dark:bg-[#1e293b]/50 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 outline-none font-mono font-bold text-slate-900 dark:text-white uppercase placeholder:normal-case placeholder:font-sans placeholder:text-slate-400 dark:placeholder:text-slate-600 tracking-wider text-sm md:text-base"
                   placeholder="Room ID"
                   value={roomId}
                   onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                 />
               </div>
               <button 
                 onClick={() => joinSession(roomId)}
                 className="px-5 md:px-6 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-[#0f172a] font-bold rounded-xl transition-all flex items-center shadow-lg active:scale-95"
               >
                 <FiArrowRight size={20} />
               </button>
             </div>
           </div>

           {/* Divider */}
           <div className="flex items-center gap-4 mb-5 md:mb-8">
             <div className="h-px bg-slate-200 dark:bg-white/10 flex-1"></div>
             <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">OR</span>
             <div className="h-px bg-slate-200 dark:bg-white/10 flex-1"></div>
           </div>

           {/* Create New Button */}
           <button 
             onClick={createRoom}
             className="w-full py-3.5 md:py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 hover:from-indigo-500 hover:via-purple-500 hover:to-fuchsia-500 text-white font-bold text-base md:text-lg rounded-xl transition-all shadow-xl shadow-purple-900/40 flex items-center justify-center gap-3 group active:scale-[0.98] border border-white/10"
           >
             <FiPlus className="group-hover:rotate-90 transition-transform duration-300" size={20} />
             Create New Workspace
           </button>

        </div>
        
        {/* Footer Info */}
        <p className="mt-8 relative md:absolute md:bottom-6 text-slate-400 dark:text-slate-600 text-xs font-medium opacity-60 hover:opacity-100 transition-opacity cursor-default text-center">Relay v3.0 • Secured Workspace</p>
      </div>
    );
  }

  // =========================================
  // 6. RENDER WORKSPACE
  // =========================================
  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#020617] overflow-hidden p-3 md:p-6 gap-4 relative">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
        <div className="flex items-center gap-3 w-full md:w-auto">
           <div className="relative flex-1 md:flex-none">
             <select value={language} onChange={handleLanguageChange} className="w-full md:w-48 appearance-none bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white text-xs font-bold px-4 py-3 rounded-xl cursor-pointer focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm hover:border-indigo-500 transition-colors">
               {LANGUAGES.map(lang => <option key={lang.id} value={lang.id}>{lang.label}</option>)}
             </select>
             <FiChevronDown className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" size={14} />
           </div>

           <button onClick={handleRunCode} disabled={isCompiling} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg active:scale-95 ${isCompiling ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'}`}>
              {isCompiling ? <FiLoader className="animate-spin"/> : <FiPlay fill="currentColor"/>} {isCompiling ? "Compiling..." : "Execute"}
           </button>

           <button onClick={handleOpenSaveModal} className="hidden sm:flex items-center gap-2 px-4 py-3 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 hover:border-indigo-500 text-slate-500 dark:text-slate-400 hover:text-indigo-500 rounded-xl transition-all shadow-sm group active:scale-95">
              <FiSave size={18} className="group-hover:text-indigo-500 transition-colors"/>
              <span className="hidden lg:inline text-xs font-bold uppercase tracking-wider">Save</span>
           </button>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">Room:</span>
               <span className="text-xs font-mono font-bold text-indigo-500">{roomId}</span>
               <button onClick={() => {navigator.clipboard.writeText(roomId); setRoomCopied(true); setTimeout(() => setRoomCopied(false), 2000)}} className="ml-1 p-1.5 hover:bg-white dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-indigo-500 transition-colors" title="Copy Room ID">
                 {roomCopied ? <FiCheck className="text-emerald-500" size={14} /> : <FiCopy size={14} />}
               </button>
            </div>
            <button onClick={leaveRoom} className="px-4 py-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all flex items-center gap-2 text-xs font-bold active:scale-95"><FiLogOut/> <span className="hidden sm:inline">Leave</span></button>
        </div>
      </div>

      {/* MAIN SPLIT LAYOUT */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden min-h-0">
        <div className={`flex-1 flex flex-col min-w-0 ${mobileTab === 'editor' ? 'flex' : 'hidden lg:flex'}`}>
           <PresenceBar roomId={roomId} isConnected={isConnected} users={activeUsers} typingUsers={typingUsers} currentSocketId={socket.id} userName={userName} />
           <div className="flex-1 min-h-0 shadow-2xl rounded-2xl overflow-hidden">
             <CodeEditor code={code} language={language} onChange={handleEditorChange} theme="vs-dark" />
           </div>
        </div>

        <div className={`w-full lg:w-[450px] flex flex-col gap-4 ${mobileTab === 'tools' ? 'flex' : 'hidden lg:flex'}`}>
           <div className="flex-[3] bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-white/10 shadow-xl flex flex-col overflow-hidden">
              <div className="flex p-2 bg-slate-50 dark:bg-black/20 border-b border-slate-200 dark:border-white/5">
                 <button onClick={() => setActiveSidebarTab('ai')} className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeSidebarTab === 'ai' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-500 hover:bg-white/10'}`}>Console</button>
                 <button onClick={() => setActiveSidebarTab('logs')} className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeSidebarTab === 'logs' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-500 hover:bg-white/10'}`}>Activity</button>
              </div>

              {activeSidebarTab === 'ai' ? (
                <div className="flex-1 flex flex-col p-4 overflow-hidden">
                   <div className="grid grid-cols-2 gap-3 mb-4 shrink-0">
                      <button onClick={() => handleAiAction("explain")} disabled={isAiLoading} className="py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 rounded-xl text-xs font-bold hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"><FiLayout /> Explain Code</button>
                      <button onClick={() => handleAiAction("refactor")} disabled={isAiLoading} className="py-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30 rounded-xl text-xs font-bold hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"><FiZap /> Refactor</button>
                   </div>
                   
                   <div className="flex-1 bg-[#020617] rounded-xl p-4 overflow-y-auto custom-scrollbar font-mono text-[11px] text-slate-300 relative shadow-inner border border-white/5" ref={terminalRef}>
                      {terminalOutput.length === 0 && !aiResponse && !isAiLoading && <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600"><FiTerminal size={32} className="mb-2 opacity-50"/><p className="italic">Ready for input...</p></div>}
                      
                      {terminalOutput.map((l, i) => (
                        <div key={i} className={`mb-1.5 break-all border-l-2 pl-2 ${l.type === 'error' ? 'border-red-500 text-red-400' : l.type === 'success' ? 'border-emerald-500 text-emerald-400' : 'border-blue-500 text-slate-300'}`}>
                           {l.type === 'info' && <span className="text-blue-500 mr-2">$</span>}{l.text}
                        </div>
                      ))}

                      {isAiLoading && (
                        <div className="mt-4 pt-4 border-t border-white/10 animate-pulse">
                           <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider mb-2"><FiLoader className="animate-spin" /> AI Assistant Active</div>
                           <p className="text-slate-500 text-xs italic">Analyzing your code...</p>
                        </div>
                      )}

                      {aiResponse && (
                         <div className="mt-6 pt-6 border-t border-white/10 animate-fade-in pb-8">
                            <div className="text-indigo-400 font-bold mb-4 uppercase tracking-wider text-xs flex items-center gap-2 border-b border-indigo-500/30 pb-2"><FiZap size={14} /> Analysis Result</div>
                            <div className="prose prose-invert max-w-none"><ReactMarkdown components={{p: ({node, ...props}) => <p className="text-sm leading-7 text-slate-300 mb-4 font-light" {...props} />, h1: ({node, ...props}) => <h1 className="text-lg font-bold text-white mb-3 mt-5 border-b border-white/10 pb-1" {...props} />, h2: ({node, ...props}) => <h2 className="text-base font-bold text-blue-200 mb-2 mt-4" {...props} />, strong: ({node, ...props}) => <span className="font-bold text-emerald-400" {...props} />, ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-2 text-slate-300 mb-4" {...props} />, li: ({node, ...props}) => <li className="text-sm pl-1 marker:text-slate-500" {...props} />, code: ({node, inline, className, children, ...props}) => !inline ? (<div className="bg-[#0b1120] p-4 rounded-xl border border-white/10 my-4 overflow-x-auto shadow-lg"><code className="text-xs font-mono text-blue-300 leading-relaxed" {...props}>{children}</code></div>) : (<code className="bg-indigo-500/20 px-1.5 py-0.5 rounded text-xs font-mono text-indigo-300 border border-indigo-500/30" {...props}>{children}</code>)}}>{aiResponse}</ReactMarkdown></div>
                         </div>
                      )}
                   </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4" ref={logsRef}>
                   {logs.length === 0 && <div className="text-center text-slate-500 italic mt-10 text-xs">No activity yet.</div>}
                   {logs.map((l, i) => (
                     <div key={i} className="flex gap-4 text-xs group">
                        <div className="flex flex-col items-center">
                           <div className="w-2 h-2 mt-1.5 rounded-full bg-indigo-500 shrink-0 group-hover:scale-125 transition-transform"></div>
                           {i !== logs.length - 1 && <div className="w-px h-full bg-indigo-500/20 my-1"></div>}
                        </div>
                        <div className="pb-2">
                           <div className="flex items-center gap-2"><span className="font-bold text-white">{l.user}</span><span className="text-[10px] text-slate-500 font-mono">{new Date(l.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span></div>
                           <p className="text-slate-400 mt-0.5 leading-relaxed">{l.action}</p>
                        </div>
                     </div>
                   ))}
                </div>
              )}
           </div>
        </div>
      </div>
      
      {/* SAVE MODAL */}
      {isSaveModalOpen && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-white/10 w-full max-w-lg rounded-3xl shadow-2xl p-8 animate-fade-in-up">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-white flex items-center gap-3"><div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400"><FiSave size={24}/></div> Save Snippet</h2>
              <button onClick={() => setIsSaveModalOpen(false)} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"><FiX size={24}/></button>
            </div>
            <form onSubmit={handleConfirmSave} className="space-y-6">
              <div><label className="block text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Title</label><div className="relative"><FiFileText className="absolute left-4 top-4 text-slate-500" /><input required value={saveForm.title} onChange={e => setSaveForm({...saveForm, title: e.target.value})} className="w-full pl-10 pr-4 py-4 bg-[#1e293b] border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white font-semibold placeholder-slate-500" placeholder="e.g. Authentication Logic" /></div></div>
              <div><label className="block text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Description</label><textarea rows={3} value={saveForm.description} onChange={e => setSaveForm({...saveForm, description: e.target.value})} className="w-full p-4 bg-[#1e293b] border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder-slate-500 text-sm" placeholder="What does this code do?" /></div>
              <div><label className="block text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Tags</label><div className="relative"><FiTag className="absolute left-4 top-4 text-slate-500" size={16}/><input value={saveForm.tags} onChange={e => setSaveForm({...saveForm, tags: e.target.value})} placeholder="e.g. algorithm, frontend, auth" className="w-full pl-10 pr-4 py-4 bg-[#1e293b] border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white text-sm" /></div></div>
              <div className="pt-4 flex gap-4"><button type="button" onClick={() => setIsSaveModalOpen(false)} className="flex-1 py-4 text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">Cancel</button><button disabled={isSaving} type="submit" className="flex-[2] py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95">{isSaving ? <FiLoader className="animate-spin"/> : "Confirm & Save"}</button></div>
            </form>
          </div>
        </div>
      )}

      {/* MOBILE TABS */}
      <div className="lg:hidden flex bg-[#0f172a] p-1.5 rounded-2xl shadow-2xl border border-white/10 shrink-0 mx-auto w-full max-w-sm">
         <button onClick={() => setMobileTab('editor')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mobileTab === 'editor' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Code Editor</button>
         <button onClick={() => setMobileTab('tools')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mobileTab === 'tools' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Console & AI</button>
      </div>

    </div>
  );
}

export default RelaySandBox;
