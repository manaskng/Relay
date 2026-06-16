import RelayLogo from './RelayLogo';
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom"; // 
import { FiPlus, FiCode, FiSearch, FiZap, FiTag, FiCopy, FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";
import SnippetCard from "./SnippetCard";

// Top 10 Languages for the dropdown
const LANGUAGES = [
  "C++", "Java", "Python", "JavaScript", "TypeScript", 
  "C", "C#", "Go", "Rust", "Swift"
];

const SnippetModal = ({ isOpen, onClose, onSave, snippetToEdit }) => {
  const [formData, setFormData] = useState({
    title: "", code: "", language: "C++", tags: "", timeComplexity: "", spaceComplexity: "", problemLink: ""
  });

  useEffect(() => {
    if (snippetToEdit) {
      setFormData({
        ...snippetToEdit,
        tags: Array.isArray(snippetToEdit.tags) ? snippetToEdit.tags.join(", ") : snippetToEdit.tags
      });
    } else {
      setFormData({
        title: "", code: "", language: "C++", tags: "", timeComplexity: "", spaceComplexity: "", problemLink: ""
      });
    }
  }, [snippetToEdit, isOpen]);

  const isCustomLang = !LANGUAGES.includes(formData.language) && formData.language !== "";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-2xl w-full max-w-2xl p-6 h-[85vh] overflow-y-auto custom-scrollbar">
        <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">
          {snippetToEdit ? "Edit Snippet" : "Add Algorithm / Snippet"}
        </h2>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
          
          <input 
            className="w-full p-3 border border-slate-200 dark:border-gray-700 rounded-lg font-bold text-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white" 
            placeholder="Title (e.g. Binary Search Template)" 
            value={formData.title} 
            onChange={e => setFormData({ ...formData, title: e.target.value })} 
            required 
            autoFocus
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-gray-500 uppercase mb-1">Language</label>
              <select 
                className="w-full p-2 border border-slate-200 dark:border-gray-700 rounded-lg outline-none bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white" 
                value={LANGUAGES.includes(formData.language) ? formData.language : "Other"} 
                onChange={e => {
                  const val = e.target.value;
                  setFormData({ ...formData, language: val === "Other" ? "" : val });
                }}
              >
                {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                <option value="Other">Other / Custom...</option>
              </select>
              
              {(isCustomLang || formData.language === "" || (!LANGUAGES.includes(formData.language) && formData.language)) && (
                <input 
                  className="w-full p-2 border border-blue-300 dark:border-blue-500/50 rounded-lg mt-2 bg-blue-50 dark:bg-blue-500/10 text-blue-800 dark:text-blue-300 placeholder-blue-400" 
                  placeholder="Type Language Name..." 
                  value={formData.language} 
                  onChange={e => setFormData({ ...formData, language: e.target.value })} 
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-gray-500 uppercase mb-1">Tags</label>
              <input 
                className="w-full p-2 border border-slate-200 dark:border-gray-700 rounded-lg bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white" 
                placeholder="e.g. DP, Recursion" 
                value={formData.tags} 
                onChange={e => setFormData({ ...formData, tags: e.target.value })} 
              />
            </div>
          </div>

          <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-gray-500 uppercase mb-1">Code</label>
              <textarea 
                className="w-full p-3 border border-slate-200 dark:border-gray-700 rounded-lg font-mono text-sm h-64 focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-slate-900 dark:bg-[#020617] text-white" 
                placeholder="Paste your code here..." 
                value={formData.code} 
                onChange={e => setFormData({ ...formData, code: e.target.value })} 
                required 
              />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input className="p-2 border border-slate-200 dark:border-gray-700 rounded-lg bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white" placeholder="Time Comp (e.g. O(N))" value={formData.timeComplexity} onChange={e => setFormData({ ...formData, timeComplexity: e.target.value })} />
            <input className="p-2 border border-slate-200 dark:border-gray-700 rounded-lg bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white" placeholder="Space Comp (e.g. O(1))" value={formData.spaceComplexity} onChange={e => setFormData({ ...formData, spaceComplexity: e.target.value })} />
          </div>

          <input className="w-full p-2 border border-slate-200 dark:border-gray-700 rounded-lg bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white" placeholder="Problem Link (LeetCode URL)" value={formData.problemLink} onChange={e => setFormData({ ...formData, problemLink: e.target.value })} />

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors">Cancel</button>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium">
              {snippetToEdit ? "Update Snippet" : "Save Snippet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- EMPTY STATE COMPONENT ---
const EmptySnippetView = ({ onAdd }) => (
  <div className="flex flex-col xl:flex-row items-center justify-center gap-12 py-10 min-h-[60vh] max-w-6xl mx-auto">
    
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="flex-1 text-center xl:text-left space-y-6 max-w-lg"
    >
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
        <RelayLogo /> Developer Productivity
      </div>
      
      <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
        Build Your Personal <br/>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Code Vault</span>
      </h2>
      
      <p className="text-lg text-slate-600 dark:text-gray-400 leading-relaxed">
        Stop searching for the same algorithms. Store, organize, and retrieve your code patterns instantly.
      </p>

      <ul className="space-y-4 text-left mx-auto xl:mx-0 max-w-sm">
        <li className="flex items-center gap-3 text-slate-700 dark:text-gray-300">
          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400"><FiCopy /></div>
          <span className="font-medium">Instant 1-Click Copy</span>
        </li>
        <li className="flex items-center gap-3 text-slate-700 dark:text-gray-300">
          <div className="p-2 rounded-lg bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400"><RelayLogo /></div>
          <span className="font-medium">Track Time & Space Complexity</span>
        </li>
        <li className="flex items-center gap-3 text-slate-700 dark:text-gray-300">
          <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400"><FiTag /></div>
          <span className="font-medium">Tag & Search Logic Efficiently</span>
        </li>
      </ul>

      <div className="pt-4">
        <button 
          onClick={onAdd}
          className="group inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
        >
          <FiPlus className="text-xl" /> Create First Snippet
        </button>
      </div>
    </motion.div>

    <motion.div 
      initial={{ opacity: 0, x: 20, rotate: 2 }}
      animate={{ opacity: 1, x: 0, rotate: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="flex-1 w-full max-w-xl"
    >
      <div className="relative group">
        <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
        <img 
          src="/slide-8.png" 
          alt="Snippet Preview" 
          className="relative rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full object-cover transform transition-transform duration-500 hover:scale-[1.02]"
        />
        <div className="absolute -bottom-6 -right-6 bg-white dark:bg-[#1e293b] p-4 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 hidden sm:block">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 font-bold">
               <FiCode />
             </div>
             <div>
               <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Supported Languages</p>
               <p className="text-sm font-bold text-slate-900 dark:text-white">C++, Python, JS & more</p>
             </div>
           </div>
        </div>
      </div>
    </motion.div>
  </div>
);


// --- MAIN COMPONENT ---
function SnippetLibrary() {
  const [snippets, setSnippets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState(null); 
  const [search, setSearch] = useState("");
  // NEW: State for expanded cards
  const [expandedSnippetIds, setExpandedSnippetIds] = useState([]);

  // 1. Get Location State
  const location = useLocation();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchSnippets = async () => {
      const token = localStorage.getItem("token");
      try { 
        const { data } = await axios.get(`${API_URL}/api/snippets`, { headers: { Authorization: `Bearer ${token}` } }); 
        setSnippets(data); 

        // 2. CHECK IF REDIRECTED FROM SEARCH
        if (location.state?.selectedId) {
          const found = data.find(s => s._id === location.state.selectedId);
          if (found) {
            setEditingSnippet(found);
            setIsModalOpen(true);
            // Optional: Clear history so it doesn't reopen on refresh
            window.history.replaceState({}, document.title);
          }
        }

      } catch (e) { console.error(e); }
    };
    fetchSnippets();
  }, [API_URL, location.state]); // 3. Re-run if location changes

  const handleOpenAdd = () => {
    setEditingSnippet(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (snippet) => {
    setEditingSnippet(snippet);
    setIsModalOpen(true);
  };

  const handleSave = async (data) => {
    const token = localStorage.getItem("token");
    let formattedTags = [];
    if (typeof data.tags === 'string') {
        formattedTags = data.tags.split(',').map(t => t.trim()).filter(t => t !== "");
    }
    const processedData = { ...data, tags: formattedTags };

    try { 
      if (editingSnippet) {
        // Update Logic
        const { data: updatedSnippet } = await axios.put(`${API_URL}/api/snippets/${editingSnippet._id}`, processedData, { headers: { Authorization: `Bearer ${token}` } });
        setSnippets(snippets.map(s => s._id === updatedSnippet._id ? updatedSnippet : s));
      } else {
        // Create Logic
        const { data: newSnippet } = await axios.post(`${API_URL}/api/snippets`, processedData, { headers: { Authorization: `Bearer ${token}` } }); 
        setSnippets([newSnippet, ...snippets]); 
      }
      setIsModalOpen(false); 
      setEditingSnippet(null);
    } catch (e) { console.error(e); alert("Failed to save."); }
  };

  const handleDelete = async (id) => {
      if(!window.confirm("Delete this snippet?")) return;
      const token = localStorage.getItem("token");
      try {
          await axios.delete(`${API_URL}/api/snippets/${id}`, { headers: { Authorization: `Bearer ${token}` } });
          setSnippets(snippets.filter(s => s._id !== id));
      } catch(e) { console.error(e); }
  };

  // NEW: Toggle Expand Function
  const toggleExpand = (id) => {
    setExpandedSnippetIds(prev => 
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  const filteredSnippets = snippets.filter(s => 
    s.title.toLowerCase().includes(search.toLowerCase()) || 
    s.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-3 md:p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2"><FiCode className="text-blue-600 dark:text-blue-400"/> Code Library</h1>
           <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">Algorithms, Data Structures & Patterns</p>
        </div>
        <div className="flex gap-3">
          <div className="relative hidden md:block">
             <FiSearch className="absolute left-3 top-2.5 text-slate-400"/>
             <input type="text" placeholder="Search code..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 pr-4 py-2 border border-slate-200 dark:border-gray-700 bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20 outline-none"/>
          </div>
          <button onClick={handleOpenAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-sm transition-all active:scale-95">
            <FiPlus /> <span className="hidden sm:inline">Add Snippet</span>
          </button>
        </div>
      </div>
      
      {snippets.length === 0 ? (
         <EmptySnippetView onAdd={handleOpenAdd} />
      ) : filteredSnippets.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-gray-500 m-2">
           <FiCode size={40} className="mb-2 opacity-20"/><p>No matches for "{search}"</p>
           <button onClick={() => setSearch("")} className="text-blue-500 hover:underline mt-2">Clear Search</button>
        </div>
      ) : (
        // UPDATED: Grid Layout to support resizing
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 pb-20 auto-rows-[500px]">
          {filteredSnippets.map(snippet => {
            const isExpanded = expandedSnippetIds.includes(snippet._id);
            return (
              <motion.div 
                layout // Important for smooth grid reordering
                key={snippet._id} 
                className={`h-[500px] transition-all duration-300 ${isExpanded ? 'lg:col-span-2 xl:col-span-2' : 'col-span-1'}`}
              >
                <SnippetCard 
                  snippet={snippet} 
                  onDelete={handleDelete} 
                  onEdit={handleOpenEdit} 
                  isExpanded={isExpanded}
                  onToggleExpand={toggleExpand}
                />
              </motion.div>
            );
          })}
        </div>
      )}
      
      <SnippetModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        snippetToEdit={editingSnippet}
      />
    </div>
  );
}

export default SnippetLibrary;
