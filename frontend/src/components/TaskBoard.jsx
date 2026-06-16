import RelayLogo from './RelayLogo';
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FiPlus, FiTrash2, FiCheck, FiLayers, FiZap } from "react-icons/fi";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const taskVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  show: { 
    y: 0, 
    opacity: 1, 
    scale: 1, 
    transition: { type: "spring", bounce: 0.4, duration: 0.6 } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.8, 
    x: -20, 
    transition: { duration: 0.2 } 
  }
};

function TaskBoard() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);
  const inputRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(data.reverse());
    } catch (error) {
      console.error(error);
    } finally {
        setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    
    const tempId = Date.now().toString();
    const tempTask = { _id: tempId, content: newTask, isCompleted: false, createdAt: new Date().toISOString() };
    
    setTasks([tempTask, ...tasks]);
    setNewTask("");
    inputRef.current?.focus();

    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        `${API_URL}/api/tasks`,
        { content: tempTask.content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(prev => prev.map(t => t._id === tempId ? data : t));
    } catch (error) {
      setTasks(prev => prev.filter(t => t._id !== tempId));
    }
  };

  const toggleTask = async (taskId, currentStatus) => {
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, isCompleted: !currentStatus } : t));

    if (!currentStatus) {
      confetti({
        particleCount: 80, spread: 60, origin: { y: 0.7 },
        colors: ['#6366f1', '#10b981', '#f59e0b'],
        zIndex: 9999, disableForReducedMotion: true
      });
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/api/tasks/${taskId}`,
        { isCompleted: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) { fetchTasks(); }
  };

  const deleteTask = async (taskId) => {
    setTasks(prev => prev.filter(t => t._id !== taskId));
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) { fetchTasks(); }
  };

  const activeTasks = tasks.filter(t => !t.isCompleted);
  const completedTasks = tasks.filter(t => t.isCompleted);

  return (
    <div className="p-4 md:p-8 h-full flex flex-col max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-slate-800 dark:text-white flex items-center gap-3 tracking-tight">
          <FiLayers className="text-indigo-500"/> Task Command
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mt-2 font-medium">
            Capture, execute, and clear your engineering objectives.
        </p>
      </div>

      <form onSubmit={handleAddTask} className="relative mb-10 group z-20">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <input
          ref={inputRef}
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="What's the next mission?"
          className="relative w-full pl-6 pr-16 py-4 bg-white/80 dark:bg-[#1e293b]/90 backdrop-blur-xl border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white shadow-sm text-lg placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-all"
        />
        <button 
          type="submit"
          disabled={!newTask.trim()}
          className="absolute right-3 top-3 bottom-3 aspect-square bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all flex items-center justify-center hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/30"
        >
          <FiPlus size={24} />
        </button>
      </form>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-20 relative z-10">
        {loading ? (
             <div className="text-center py-20 animate-pulse text-slate-400 font-medium flex flex-col items-center gap-2">
                 <RelayLogo className="text-indigo-500" size={24}/> Syncing objectives...
             </div>
        ) : tasks.length === 0 ? (
           <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="text-center py-20 px-10 bg-slate-50 dark:bg-dev-card rounded-3xl border border-dashed border-slate-200 dark:border-dev-border relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-dev-accent to-fuchsia-500 opacity-50"></div>
             <h3 className="text-xl font-bold text-slate-700 dark:text-white mb-2">All Systems Clear</h3>
             <p className="text-slate-500 dark:text-gray-400">Your task board is empty. Add a new objective to get started.</p>
           </motion.div>
        ) : (
           <motion.ul 
             variants={containerVariants}
             initial="hidden"
             animate="show"
             className="space-y-4"
           >
             <AnimatePresence mode="popLayout">
               {activeTasks.map((task) => (
                 <TaskItem key={task._id} task={task} toggleTask={toggleTask} deleteTask={deleteTask} />
               ))}
               
               {activeTasks.length > 0 && completedTasks.length > 0 && (
                 <motion.div layout className="h-px bg-slate-200 dark:bg-slate-700 my-6 relative">
                    <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-slate-50 dark:bg-[#020617] px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Completed</span>
                 </motion.div>
               )}

               {completedTasks.map((task) => (
                 <TaskItem key={task._id} task={task} toggleTask={toggleTask} deleteTask={deleteTask} />
               ))}
             </AnimatePresence>
           </motion.ul>
        )}
      </div>
    </div>
  );
}

const TaskItem = ({ task, toggleTask, deleteTask }) => {
    const isDone = task.isCompleted;
  
    return (
      <motion.li
        layout
        variants={taskVariants}
        initial="hidden"
        animate="show"
        exit="exit"
        whileHover={{ scale: 1.02, zIndex: 10 }}
        whileTap={{ scale: 0.98 }}
        className={`
          group relative flex items-center justify-between p-5 
          rounded-2xl border shadow-sm backdrop-blur-sm transition-all duration-300
          ${isDone 
            ? 'bg-slate-50/50 dark:bg-white/5 border-slate-200 dark:border-white/5 opacity-75 scale-[0.99] hover:opacity-100' 
            : 'bg-white dark:bg-dev-card/80 border-indigo-100/50 dark:border-dev-accent/20 hover:border-indigo-300 dark:hover:border-dev-accent/40 hover:shadow-md shadow-indigo-100/50 dark:shadow-none'
          }
        `}
      >
        <div className="flex items-center gap-4 flex-1 overflow-hidden">
          <button 
            onClick={() => toggleTask(task._id, isDone)}
            className={`
              flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300
              ${isDone 
                 ? 'bg-green-500 border-green-500 text-white rotate-0 scale-100' 
                 : 'border-slate-300 dark:border-slate-600 text-transparent hover:border-indigo-500 dark:hover:border-indigo-400 rotate-[-15deg] hover:rotate-0 scale-90 hover:scale-100'
              }
            `}
          >
            <FiCheck size={18} className={isDone ? 'opacity-100' : 'opacity-0 group-hover:opacity-30'} />
          </button>
  
          <span className={`text-lg font-medium truncate transition-all duration-300 ${isDone ? "text-slate-400 dark:text-slate-500 line-through decoration-2 decoration-slate-300" : "text-slate-800 dark:text-white"}`}>
            {task.content}
          </span>
        </div>
        
        <button 
          onClick={(e) => { e.stopPropagation(); deleteTask(task._id); }}
          className="p-2.5 text-slate-400 hover:text-red-600 bg-transparent hover:bg-red-50 dark:hover:bg-red-500/20 rounded-xl transition-all opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0"
          title="Delete Task"
        >
          <FiTrash2 size={18} />
        </button>
      </motion.li>
    );
  };

export default TaskBoard;