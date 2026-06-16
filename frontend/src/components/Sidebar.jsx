import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  FiFileText, FiCode, FiUser, FiCheckSquare, FiTrash2, FiPlus, FiLayers 
} from "react-icons/fi";

function Sidebar({ activeTab, setActiveTab }) {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;

  // --- TASK LOGIC (Mini-Widget) ---
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_URL}/api/tasks`, { headers: { Authorization: `Bearer ${token}` } });
      // We only show the top 5 tasks in the mini-widget to keep it clean
      setTasks(data.slice(0, 5)); 
    } catch (error) { console.error("Error fetching tasks:", error); }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    
    // Optimistic Update
    const tempId = Date.now();
    const tempTask = { _id: tempId, content: newTask, isCompleted: false };
    setTasks([tempTask, ...tasks].slice(0, 5)); // Keep visual limit
    setNewTask("");

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/tasks`,
        { content: tempTask.content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Add task failed");
    }
  };

  const toggleTask = async (taskId, currentStatus) => {
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, isCompleted: !currentStatus } : t));
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/api/tasks/${taskId}`, { isCompleted: !currentStatus }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (error) { fetchTasks(); }
  };

  const deleteTask = async (taskId) => {
    setTasks(prev => prev.filter(t => t._id !== taskId));
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/tasks/${taskId}`, { headers: { Authorization: `Bearer ${token}` } });
    } catch (error) { fetchTasks(); }
  };

  // --- COMPONENT: Nav Button ---
  const NavButton = ({ id, icon: Icon, label, badge }) => {
    const isActive = activeTab === id;
    return (
      <button
        onClick={() => setActiveTab(id)}
        className={`
          group w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 mb-1.5
          ${isActive 
            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" 
            : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
          }
        `}
      >
        <div className="flex items-center gap-3">
          <Icon size={18} className={isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors"} />
          <span className="font-medium text-sm">{label}</span>
        </div>
        {badge && (
           <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-500'}`}>
             {badge}
           </span>
        )}
      </button>
    );
  };

  return (
    <aside className="w-72 h-full flex flex-col bg-white dark:bg-[#0b1121] border-r border-slate-200 dark:border-white/5 relative z-20 transition-colors duration-300">
      
      {/* 1. HEADER & BRAND */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3 mb-8 px-2">
           <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
             D
           </div>
           <div>
             <h1 className="font-bold text-slate-800 dark:text-white text-lg leading-tight tracking-tight">Relay</h1>
             <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Productivity OS</p>
           </div>
        </div>

        {/* 2. NAVIGATION GROUPS */}
        <div className="space-y-8">
          {/* Group 1: Workspace */}
          <div>
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-4">Workspace</h3>
            <nav>
              {/* UPDATED: Label changed from 'My Notes' to 'DevDocs' */}
              <NavButton id="notes" icon={FiFileText} label="DevDocs" />
              <NavButton id="tasks" icon={FiLayers} label="Task Board" />
              <NavButton id="snippets" icon={FiCode} label="Code Vault" />
            </nav>
          </div>

          {/* Group 2: Account */}
          <div>
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-4">Account</h3>
            <nav>
              <NavButton id="profiles" icon={FiUser} label="My Portfolio" badge="Public" />
            </nav>
          </div>
        </div>
      </div>

      {/* 3. WIDGET: DAILY SCRATCHPAD */}
      <div className="mt-auto p-4">
        <div className="bg-slate-50 dark:bg-[#151b2e] rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden flex flex-col shadow-inner max-h-[35vh]">
          
          {/* Widget Header */}
          <div className="px-4 py-3 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-white dark:bg-white/5">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> 
                Quick Focus
              </span>
              <span className="text-[10px] bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400 font-mono">
                {tasks.filter(t => !t.isCompleted).length}
              </span>
          </div>

          {/* Mini Task List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
              {tasks.length === 0 ? (
                <div className="text-center py-6">
                   <p className="text-[10px] text-slate-400">No active tasks</p>
                </div>
              ) : (
                tasks.map(task => (
                  <div 
                    key={task._id} 
                    className="group flex items-center gap-3 p-2 rounded-lg hover:bg-white dark:hover:bg-white/10 border border-transparent hover:border-slate-100 dark:hover:border-white/5 transition-all cursor-pointer"
                    onClick={() => toggleTask(task._id, task.isCompleted)}
                  >
                      <div className={`
                        w-4 h-4 rounded border flex items-center justify-center transition-colors 
                        ${task.isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-transparent'}
                      `}>
                         {task.isCompleted && <FiCheckSquare size={10} className="text-white" />}
                      </div>
                      <span className={`text-xs truncate flex-1 ${task.isCompleted ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-600 dark:text-slate-300'}`}>
                        {task.content}
                      </span>
                      {/* Mini Delete on Hover */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteTask(task._id); }}
                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-opacity"
                      >
                        <FiTrash2 size={12} />
                      </button>
                  </div>
                ))
              )}
          </div>

          {/* Mini Input */}
          <form onSubmit={handleAddTask} className="p-2 border-t border-slate-200 dark:border-white/5 bg-white dark:bg-[#0b1121]">
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#1e293b] rounded-lg px-3 py-2 border border-transparent focus-within:border-indigo-500 focus-within:bg-white dark:focus-within:bg-[#151b2e] transition-all">
                 <FiPlus size={14} className="text-slate-400 shrink-0" />
                 <input 
                   value={newTask}
                   onChange={(e) => setNewTask(e.target.value)}
                   placeholder="Add quick task..."
                   className="bg-transparent w-full text-xs outline-none text-slate-700 dark:text-white placeholder:text-slate-400"
                 />
              </div>
          </form>
        </div>
      </div>

    </aside>
  );
}

export default Sidebar;