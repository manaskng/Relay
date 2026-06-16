import RelayLogo from './RelayLogo';
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiEdit3, FiSave, FiPlus, FiTrash2, FiMapPin, FiMail, 
  FiGithub, FiLinkedin, FiExternalLink, FiZap, FiAward, 
  FiCode, FiShare2, FiCheck, FiDownload, FiMessageSquare, 
  FiX, FiArrowRight, FiCamera, FiImage, FiStar, FiUploadCloud, FiLoader 
} from "react-icons/fi";


const getSkillIcon = (skillName) => {
  if (!skillName) return null;
  const clean = skillName.toLowerCase().trim();
  // ... (Keep your existing huge map here) ...
  const map = {
    'c++': 'cpp', 'cpp': 'cpp', 'cplusplus': 'cpp',
    'c#': 'cs', 'csharp': 'cs', 'python': 'python', 'py': 'python',
    'java': 'java', 'javascript': 'js', 'js': 'js',
    'typescript': 'ts', 'ts': 'ts', 'html': 'html', 'html5': 'html',
    'css': 'css', 'css3': 'css', 'go': 'go', 'golang': 'go',
    'rust': 'rust', 'php': 'php', 'ruby': 'ruby', 'swift': 'swift',
    'kotlin': 'kotlin', 'dart': 'dart', 'react': 'react', 'reactjs': 'react',
    'next': 'nextjs', 'nextjs': 'nextjs', 'vue': 'vue', 'vuejs': 'vue',
    'angular': 'angular', 'svelte': 'svelte', 'tailwind': 'tailwindcss',
    'tailwindcss': 'tailwindcss', 'bootstrap': 'bootstrap', 'sass': 'sass',
    'redux': 'redux', 'jquery': 'jquery', 'vite': 'vite', 'webpack': 'webpack',
    'babel': 'babel', 'node': 'nodejs', 'nodejs': 'nodejs', 'node.js': 'nodejs',
    'express': 'express', 'expressjs': 'express', 'mongo': 'mongodb',
    'mongodb': 'mongodb', 'mongoose': 'mongodb', 'postgres': 'postgresql',
    'postgresql': 'postgresql', 'sql': 'mysql', 'mysql': 'mysql', 'redis': 'redis',
    'firebase': 'firebase', 'appwrite': 'appwrite', 'supabase': 'supabase',
    'graphql': 'graphql', 'prisma': 'prisma', 'nginx': 'nginx',
    'scikitlearn': 'sklearn', 'sklearn': 'sklearn', 'sci-kit learn': 'sklearn',
    'tensorflow': 'tensorflow', 'tf': 'tensorflow', 'pytorch': 'pytorch',
    'opencv': 'opencv', 'pandas': 'pandas', 'numpy': 'numpy',
    'matplotlib': 'matplotlib', 'anaconda': 'anaconda', 'r': 'r',
    'docker': 'docker', 'kubernetes': 'kubernetes', 'k8s': 'kubernetes',
    'aws': 'aws', 'amazon': 'aws', 'gcp': 'gcp', 'google cloud': 'gcp',
    'azure': 'azure', 'vercel': 'vercel', 'netlify': 'netlify', 'heroku': 'heroku',
    'git': 'git', 'github': 'github', 'gitlab': 'gitlab', 'linux': 'linux',
    'ubuntu': 'ubuntu', 'bash': 'bash', 'jenkins': 'jenkins', 'grafana': 'grafana',
    'postman': 'postman', 'vscode': 'vscode', 'figma': 'figma',
    'blender': 'blender', 'unity': 'unity', 'unreal': 'unreal'
  };

  if (map[clean]) return `https://skillicons.dev/icons?i=${map[clean]}`;
  const directSlug = clean.replace(/[^a-z0-9]/g, '');
  if (map[directSlug]) return `https://skillicons.dev/icons?i=${map[directSlug]}`;
  const allSlugs = Object.values(map);
  if (allSlugs.includes(clean)) return `https://skillicons.dev/icons?i=${clean}`;
  return null;
};

// --- HELPER: Get GitHub Image ---
const getProjectImage = (project) => {
  if (project.image && project.image.trim() !== "") return project.image;
  if (project.githubLink && project.githubLink.includes("github.com")) {
    try {
      const urlParts = new URL(project.githubLink).pathname.split("/").filter(Boolean);
      if (urlParts.length >= 2) return `https://opengraph.githubassets.com/1/${urlParts[0]}/${urlParts[1]}`;
    } catch (e) { console.error("Invalid URL", e); }
  }
  return "https://via.placeholder.com/800x400/0f172a/94a3b8?text=Project+Code";
};

// --- TOAST COMPONENT ---
const Toast = ({ message, onClose }) => (
  <motion.div 
    initial={{ opacity: 0, y: 50, scale: 0.9 }} 
    animate={{ opacity: 1, y: 0, scale: 1 }} 
    exit={{ opacity: 0, y: 20, scale: 0.9 }}
    className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3 rounded-full bg-gray-900 text-white shadow-2xl border border-white/10"
  >
    <div className="bg-green-500 rounded-full p-1"><FiCheck size={12}/></div>
    <span className="text-sm font-medium">{message}</span>
  </motion.div>
);

const BackgroundPattern = () => (
  <div className="fixed inset-0 z-0 pointer-events-none bg-slate-50 dark:bg-[#020617] transition-colors duration-300">
    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
    <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-slate-50 dark:from-[#020617] dark:via-transparent dark:to-[#020617]"></div>
  </div>
);

// --- COMPONENT: Feature Card ---
const EmptyFeatureCard = ({ icon: Icon, title, desc, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="p-6 rounded-2xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-sm flex flex-col items-center text-center hover:border-blue-500/30 transition-all hover:-translate-y-1"
  >
    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 shadow-inner">
      <Icon size={28} />
    </div>
    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
    <p className="text-sm text-slate-500 dark:text-gray-400 leading-relaxed">{desc}</p>
  </motion.div>
);

// --- COMPONENT: Welcome Screen ---
const EmptyProfileView = ({ username, onStart }) => (
  <div className="min-h-[80vh] flex flex-col items-center justify-center relative z-20 px-4 py-12">
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="text-center max-w-4xl mx-auto"
    >
      <div className="relative inline-block mb-10 group cursor-pointer" onClick={onStart}>
         <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 animate-pulse"></div>
         <div className="relative w-32 h-32 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center border-4 border-white dark:border-[#0f172a] shadow-2xl z-10 overflow-hidden">
            <span className="text-5xl font-black text-slate-300 dark:text-slate-600 select-none group-hover:scale-110 transition-transform duration-500">
              {username ? username[0].toUpperCase() : "U"}
            </span>
            <div className="absolute inset-0 bg-black/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
               <FiPlus className="text-white text-3xl drop-shadow-md" />
            </div>
         </div>
         <motion.div 
           initial={{ y: 10, opacity: 0 }} 
           animate={{ y: 0, opacity: 1 }} 
           transition={{ delay: 0.5 }}
           className="absolute -right-4 top-0 bg-white dark:bg-slate-800 px-3 py-1 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 flex items-center gap-1.5 text-xs font-bold text-green-500 z-20"
         >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Online
         </motion.div>
      </div>

      <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight mb-6 leading-tight">
        Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">{username}</span>.
      </h1>
      
      <p className="text-xl text-slate-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
        Your developer identity is blank. Let's change that.
      </p>

      <div className="grid md:grid-cols-3 gap-6 mb-16 text-left">
         <EmptyFeatureCard icon={FiShare2} title="Shareable Link" desc={`Claim your unique handle devnexus.app/u/${username} and share it with the world.`} delay={0.2} />
         <EmptyFeatureCard icon={FiGithub} title="Auto-Sync Stats" desc="Connect GitHub & LeetCode to visualize your contributions instantly." delay={0.3} />
         <EmptyFeatureCard icon={FiAward} title="Career Timeline" desc="Showcase your experience, projects, and skills in a clean, modern timeline." delay={0.4} />
      </div>

      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onStart}
        className="group relative inline-flex items-center gap-4 px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold text-xl shadow-xl transition-all overflow-hidden cursor-pointer"
      >
        <span className="relative z-10">Create My Profile</span>
        <FiArrowRight className="relative z-10 group-hover:translate-x-1 transition-transform" />
      </motion.button>
    </motion.div>
  </div>
);

// --- COMPONENT: Project Card ---
const HighImpactProjectCard = ({ project, index }) => {
  const imageUrl = getProjectImage(project);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }} 
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="group relative w-full rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 backdrop-blur-sm overflow-hidden hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300"
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
        <div className="lg:col-span-3 relative h-64 lg:h-auto overflow-hidden bg-slate-100 dark:bg-gray-900/50 p-6 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/20 dark:from-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative w-full h-full rounded-xl overflow-hidden shadow-xl border border-slate-200 dark:border-white/10 transform group-hover:scale-[1.02] transition-transform duration-500">
               <div className="absolute top-0 left-0 right-0 h-6 bg-slate-200 dark:bg-gray-800 flex items-center gap-1.5 px-3 z-10">
                  <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                  <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
               </div>
               <img src={imageUrl} alt={project.title} className="w-full h-full object-cover pt-6" />
            </div>
        </div>
        <div className="lg:col-span-2 p-4 md:p-8 flex flex-col justify-center relative z-10">
          <div className="mb-4">
             <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{project.title}</h3>
             <p className="text-slate-600 dark:text-gray-200 text-sm leading-relaxed line-clamp-4">{project.description}</p>
          </div>
          
          <div className="flex flex-wrap gap-3 mb-8">
             {project.techStack && project.techStack.map((tech, i) => {
                const iconUrl = getSkillIcon(tech);
                return (
                  <div key={i} title={tech} className="transition-transform hover:scale-110">
                    {iconUrl ? (
                      <img 
                        src={iconUrl} 
                        alt={tech} 
                        className="w-8 h-8"
                        onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} 
                      />
                    ) : null}
                    <span className={`${iconUrl ? 'hidden' : 'block'} px-2.5 py-1 text-xs font-bold rounded-md border bg-white border-slate-200 text-slate-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300`}>
                      {tech}
                    </span>
                  </div>
                );
             })}
          </div>

          <div className="flex gap-4 mt-auto">
             {project.githubLink && (<a href={project.githubLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10"><FiGithub /> Code</a>)}
             {project.liveLink && (<a href={project.liveLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-opacity shadow-lg bg-blue-600 dark:bg-purple-600 text-white hover:opacity-90"><FiExternalLink /> Live</a>)}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- COMPONENT: Achievement Card ---
const AchievementCard = ({ text, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ scale: 1.02, translateY: -5 }}
    className="relative p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1e293b]/50 backdrop-blur-sm shadow-sm hover:shadow-xl hover:border-yellow-500/50 transition-all group overflow-hidden"
  >
    <div className="absolute -top-2 -right-4 p-4 opacity-0 group-hover:opacity-10 transition-opacity duration-500 rotate-12">
      <FiAward size={100} className="text-slate-900 dark:text-white" />
    </div>
    
    <div className="flex items-start gap-4 relative z-10">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-lg shrink-0">
         <FiStar size={24} className="fill-white/20" />
      </div>
      <div>
         <h4 className="text-lg font-bold text-slate-800 dark:text-white leading-tight mb-2 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
           Milestone Unlocked
         </h4>
         <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
           {text}
         </p>
      </div>
    </div>
  </motion.div>
);

// --- MAIN COMPONENT ---

function ProfileManager() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("about");
  const [toastMessage, setToastMessage] = useState(null);
  
  // Track Upload States
  const [uploadingProjIndex, setUploadingProjIndex] = useState(null);
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      try {
        const { data } = await axios.get(`${API_URL}/api/user-profile`, { headers: { Authorization: `Bearer ${token}` } });
        const cleanData = { ...data, skills: data.skills || [], achievements: data.achievements || [], projects: data.projects || [], resumes: data.resumes || [] };
        setProfile(cleanData);
        setFormData(cleanData);
      } catch (e) { console.error(e); } 
      finally { setLoading(false); }
    };
    fetchProfile();
  }, [API_URL]);

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    try {
      const { data } = await axios.put(`${API_URL}/api/user-profile`, formData, { headers: { Authorization: `Bearer ${token}` } });
      setProfile(data);
      setFormData(data);
      setIsEditing(false);
      showToast("Profile saved successfully!");
    } catch (e) { alert("Save failed."); }
  };

  const handleCancel = () => {
    setFormData(profile); 
    setIsEditing(false);
  };

  // --- 1. HANDLE PROFILE PICTURE UPLOAD ---
  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("File is too large. Max limit is 5MB.");
      return;
    }

    setUploadingProfilePic(true);
    const uploadData = new FormData();
    uploadData.append("file", file); // Must match backend 'file'

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_URL}/api/upload`, uploadData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update State
      setFormData({ ...formData, profilePic: res.data.url });
      showToast("Profile Picture Uploaded!");
    } catch (error) {
      console.error("Upload Error:", error);
      const msg = error.response?.data?.message || "Upload failed";
      showToast(`Error: ${msg}`);
    } finally {
      setUploadingProfilePic(false);
    }
  };

  // --- 2. HANDLE PROJECT IMAGE UPLOAD ---
  const handleProjectImageUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("File is too large. Max limit is 5MB.");
      return;
    }

    setUploadingProjIndex(index);
    const uploadData = new FormData();
    uploadData.append("file", file); // Must match backend 'file'

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_URL}/api/upload`, uploadData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      updateProject(index, 'image', res.data.url);
      showToast("Project Image Uploaded!");
    } catch (error) {
      console.error("Upload Error:", error);
      const msg = error.response?.data?.message || "Upload failed";
      showToast(`Error: ${msg}`);
    } finally {
      setUploadingProjIndex(null);
    }
  };

  const handleShare = async () => {
    if (!profile?.username) return;
    try {
        const safeUsername = encodeURIComponent(profile.username);
        const publicLink = `${window.location.origin}/u/${safeUsername}`;
        await navigator.clipboard.writeText(publicLink);
        showToast("Public Portfolio Link Copied!");
    } catch (err) { console.error("Failed to copy", err); }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleArrayChange = (e, field) => setFormData({ ...formData, [field]: e.target.value.split(',').map(s => s.trim()) });
  
  const updateProject = (index, field, value) => {
    setFormData(prev => {
      const newProjects = [...prev.projects];
      if (field === "techStack") newProjects[index][field] = value.split(',').map(s => s.trim());
      else newProjects[index][field] = value;
      return { ...prev, projects: newProjects };
    });
  };
  const addProject = () => setFormData(prev => ({ ...prev, projects: [...prev.projects, { title: "New Project", description: "", techStack: [], githubLink: "", liveLink: "" }] }));
  const removeProject = (index) => setFormData(prev => ({ ...prev, projects: prev.projects.filter((_, i) => i !== index) }));
  const addResume = () => setFormData(prev => ({ ...prev, resumes: [...(prev.resumes || []), { label: "Resume", link: "" }] }));
  const removeResume = (index) => setFormData(prev => ({ ...prev, resumes: prev.resumes.filter((_, i) => i !== index) }));
  const updateResume = (index, field, value) => {
    setFormData(prev => {
        const newRes = [...prev.resumes];
        newRes[index][field] = value;
        return { ...prev, resumes: newRes };
    });
  };
  const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setActiveSection(id); };

  const renderAvatar = (src, name) => {
    if (src) return <img src={src} alt="Profile" className="w-full h-full object-cover" />;
    return <span className="text-4xl font-bold text-slate-900 dark:text-white">{name ? name[0] : "U"}</span>;
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white">Loading...</div>;

  const isProfileEmpty = profile && !profile.fullName;
  const showFloatingNav = !isProfileEmpty || isEditing;

  return (
    <div className="h-full overflow-y-auto custom-scrollbar font-sans transition-colors duration-500 bg-slate-50 dark:bg-[#020617] text-slate-600 dark:text-gray-200 relative">
      <BackgroundPattern />

      {/* Floating Nav */}
      {showFloatingNav && (
        <div className="sticky top-6 z-40 flex justify-center mb-12 pointer-events-none">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 px-3 py-2 md:px-6 rounded-full shadow-2xl flex items-center gap-3 md:gap-6 text-xs md:text-sm font-medium pointer-events-auto">
            {!isEditing && ["about", "skills", "projects", "badges"].map((sec) => (
                <button key={sec} onClick={() => scrollTo(sec)} className={`capitalize transition-colors ${activeSection === sec ? "text-blue-600 dark:text-purple-400 font-bold" : "text-gray-400 hover:text-slate-900 dark:hover:text-white"}`}>
                {sec}
                </button>
            ))}
            {!isEditing && <div className="w-px h-4 bg-gray-400/30"></div>}
            {!isEditing && <button onClick={handleShare} className="text-gray-400 hover:text-blue-400 transition-colors" title="Share Public Link"><FiShare2 /></button>}
            
            {isEditing ? (
                <>
                <button onClick={handleCancel} className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors"><FiX /> Cancel</button>
                <button onClick={handleSave} className="flex items-center gap-2 text-green-500 hover:text-green-400 font-bold transition-colors"><FiSave /> Save</button>
                </>
            ) : (
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-gray-400 hover:text-blue-600 dark:hover:text-purple-400"><FiEdit3 /> Edit</button>
            )}
            </div>
        </div>
      )}

      <AnimatePresence>{toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}</AnimatePresence>

      <div className="max-w-6xl mx-auto px-3 md:px-6 pb-20 relative z-10 pt-4">
        {/* ... [View Mode Logic - Omitted for brevity, kept exactly as before] ... */}
        {isProfileEmpty && !isEditing ? (
            <EmptyProfileView username={profile.username} onStart={() => setIsEditing(true)} />
        ) : !isEditing ? (
            <div className="space-y-24 animate-fade-in-up">
                
                {/* HERO */}
                <section id="about" className="flex flex-col items-center text-center max-w-3xl mx-auto">
                   <div className="relative mb-6">
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-purple-600 dark:to-blue-600 rounded-full blur opacity-40 animate-pulse"></div>
                      <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 flex items-center justify-center">
                         {renderAvatar(profile.profilePic, profile.fullName)}
                      </div>
                   </div>
                   {/* ... rest of View Mode ... */}
                   <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-white">{profile.fullName}</h1>
                   <p className="text-xl font-medium mb-6 px-4 py-1 rounded-full border bg-blue-50 border-slate-200 text-blue-600 dark:bg-purple-500/10 dark:border-white/10 dark:text-purple-400">{profile.headline}</p>
                   <p className="text-lg mb-8 leading-relaxed whitespace-pre-wrap text-slate-600 dark:text-gray-200">{profile.about}</p>
                   <div className="flex flex-col items-center gap-6">
                      <div className="flex gap-4 justify-center">
                          {[{ icon: FiGithub, link: `https://github.com/${profile.githubUsername}` }, { icon: FiLinkedin, link: profile.linkedinProfile }, { icon: FiMail, link: `mailto:${profile.email}` }].map((social, i) => social.link && (
                            <a key={i} href={social.link} target="_blank" rel="noreferrer" className="p-3 rounded-xl border bg-white border-slate-200 text-slate-600 dark:bg-white/5 dark:border-white/10 dark:text-gray-200 hover:scale-110 transition-transform"><social.icon size={22}/></a>
                          ))}
                      </div>
                      {profile.resumes && profile.resumes.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-4">
                           {profile.resumes.map((res, i) => (
                             <a key={i} href={res.link} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-2.5 rounded-full font-bold shadow-lg transition-transform hover:-translate-y-1 bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"><FiDownload className="text-lg" /> {res.label || "Download Resume"}</a>
                           ))}
                        </div>
                      )}
                   </div>
                </section>

                {/* STATS */}
                {(profile.githubUsername || profile.leetcodeUsername) && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto mb-16">
                     {profile.githubUsername && (
                       <div className="border rounded-2xl p-4 flex justify-center bg-white border-slate-200 dark:bg-white/5 dark:border-white/10 shadow-sm overflow-hidden">
                          <img 
                            src={`https://github-profile-summary-cards.vercel.app/api/cards/stats?username=${profile.githubUsername}&theme=github_dark`} 
                            className="w-full max-w-md" 
                            alt="GitHub Stats"
                          />
                       </div>
                     )}
                     {profile.leetcodeUsername && (
                       <div className="border rounded-2xl p-4 flex justify-center overflow-hidden bg-white border-slate-200 dark:bg-white/5 dark:border-white/10 shadow-sm">
                          <img 
                            src={`https://leetcard.jacoblin.cool/${profile.leetcodeUsername}?theme=light&font=Inter&ext=heatmap`} 
                            className="w-full max-w-md scale-95 dark:invert dark:hue-rotate-180" 
                            alt="LeetCode Stats"
                          />
                       </div>
                     )}
                   </div>
                )}

                {/* SKILLS */}
                {profile.skills.length > 0 && (
                  <section id="skills" className="text-center">
                      <h2 className="text-3xl font-bold mb-10 flex items-center justify-center gap-2 text-slate-900 dark:text-white"><RelayLogo className="text-blue-600 dark:text-purple-400"/> Tech Stack</h2>
                      <div className="flex flex-wrap justify-center gap-6">
                        {profile.skills.map((skill, idx) => {
                           const iconUrl = getSkillIcon(skill);
                           return (
                             <div key={idx} title={skill} className="transition-transform hover:scale-125 flex flex-col items-center">
                                {iconUrl ? (
                                  <img src={iconUrl} alt={skill} className="w-12 h-12 md:w-16 md:h-16" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
                                ) : null}
                                <div className={`${iconUrl ? 'hidden' : 'block'} px-5 py-2 rounded-lg border font-medium cursor-default bg-white border-slate-200 text-slate-600 dark:bg-white/5 dark:border-white/10 dark:text-gray-200`}>
                                  {skill}
                                </div>
                             </div>
                           );
                        })}
                      </div>
                  </section>
                )}

                {/* PROJECTS */}
                {profile.projects.length > 0 && (
                   <section id="projects" className="scroll-mt-24">
                      <div className="flex items-center gap-3 mb-12"><div className="h-8 w-1 rounded-full bg-blue-500 dark:bg-purple-500"></div><h2 className="text-3xl font-bold text-slate-900 dark:text-white">Featured Projects</h2></div>
                      <div className="flex flex-col gap-16">{profile.projects.map((project, i) => <HighImpactProjectCard key={i} project={project} index={i} />)}</div>
                   </section>
                )}

                {/* ACHIEVEMENTS */}
                {profile.achievements.length > 0 && (
                   <section id="badges" className="scroll-mt-24 pb-20">
                      <div className="flex items-center gap-3 mb-10"><div className="h-8 w-1 bg-yellow-500 rounded-full"></div><h2 className="text-3xl font-bold text-slate-900 dark:text-white">Key Achievements</h2></div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {profile.achievements.map((ach, i) => <AchievementCard key={i} text={ach} index={i} />)}
                      </div>
                   </section>
                )}
            </div>
        ) : (
            <div className="border p-8 rounded-3xl shadow-xl bg-white border-slate-200 dark:bg-white/5 dark:border-white/10">
                <div className="flex justify-between items-center mb-8 border-b pb-4 border-slate-200 dark:border-gray-800">
                   <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Profile</h2>
                   <div className="text-slate-600 dark:text-gray-200">Update your details below</div>
                </div>

                {/* --- PROFILE PICTURE UPLOAD SECTION --- */}
                <div className="flex flex-col items-center justify-center mb-8">
                   <div className="relative group cursor-pointer w-32 h-32 mb-4">
                      {/* Avatar Image */}
                      <div className="w-full h-full rounded-full overflow-hidden border-4 border-slate-200 dark:border-white/10 bg-slate-100 flex items-center justify-center relative">
                         {renderAvatar(formData.profilePic, formData.fullName)}
                         {/* Loading Overlay */}
                         {uploadingProfilePic && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                               <FiLoader className="text-white animate-spin" size={24}/>
                            </div>
                         )}
                      </div>
                      
                      {/* Upload Overlay Button (Hidden Input) */}
                      <label htmlFor="profile-upload" className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer text-white font-bold z-10">
                         <FiCamera size={24}/>
                      </label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        id="profile-upload" 
                        className="hidden" 
                        onChange={handleProfilePicUpload} 
                      />
                   </div>
                   
                   {/* Fallback Text Input */}
                   <input 
                     className="w-full max-w-md border p-2 rounded outline-none text-sm bg-white border-slate-200 text-slate-900 dark:bg-[#1e293b] dark:border-white/10 dark:text-white text-center" 
                     placeholder="Or paste Profile Picture URL" 
                     name="profilePic" 
                     value={formData.profilePic || ""} 
                     onChange={handleChange} 
                   />
                </div>

                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {['fullName', 'headline', 'email', 'location', 'linkedinProfile', 'githubUsername', 'leetcodeUsername', 'portfolioUrl'].map((field) => (
                           <div key={field}>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">{field}</label>
                              <input name={field} className="w-full border p-3 rounded-xl outline-none bg-white border-slate-200 text-slate-900 dark:bg-[#1e293b] dark:border-white/10 dark:text-white" value={formData[field] || ""} onChange={handleChange} />
                           </div>
                        ))}
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">About Me</label>
                        <textarea name="about" className="w-full border p-3 rounded-xl outline-none h-32 bg-white border-slate-200 text-slate-900 dark:bg-[#1e293b] dark:border-white/10 dark:text-white" value={formData.about || ""} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Skills</label>
                        <input className="w-full border p-3 rounded-xl outline-none bg-white border-slate-200 text-slate-900 dark:bg-[#1e293b] dark:border-white/10 dark:text-white" value={formData.skills || ""} onChange={e => handleArrayChange(e, 'skills')} />
                    </div>

                    <div className="border-t pt-8 border-slate-200 dark:border-gray-800">
                        <div className="flex justify-between items-center mb-4">
                           <label className="block text-xs font-bold text-gray-500 uppercase ml-1">Resumes</label>
                           <button onClick={addResume} className="text-xs px-3 py-1 rounded bg-blue-600 text-white dark:bg-purple-600">+ Add Resume</button>
                        </div>
                        <div className="space-y-3">
                           {(formData.resumes || []).map((res, i) => (
                              <div key={i} className="flex gap-2">
                                 <input className="w-1/3 border p-2 rounded outline-none text-sm bg-white border-slate-200 text-slate-900 dark:bg-[#1e293b] dark:border-white/10 dark:text-white" placeholder="Label (e.g. CV)" value={res.label} onChange={e => updateResume(i, 'label', e.target.value)} />
                                 <input className="flex-1 border p-2 rounded outline-none text-sm bg-white border-slate-200 text-slate-900 dark:bg-[#1e293b] dark:border-white/10 dark:text-white" placeholder="URL (Drive/Dropbox)" value={res.link} onChange={e => updateResume(i, 'link', e.target.value)} />
                                 <button onClick={() => removeResume(i)} className="text-gray-400 hover:text-red-500"><FiTrash2/></button>
                              </div>
                           ))}
                        </div>
                    </div>

                    {/* --- PROJECT SECTION WITH UPLOAD --- */}
                    <div className="border-t pt-8 border-slate-200 dark:border-gray-800">
                        <div className="flex justify-between items-center mb-6">
                           <h3 className="text-xl font-bold text-slate-900 dark:text-white">Projects</h3>
                           <button onClick={addProject} className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-blue-600 text-white dark:bg-purple-600"><FiPlus/> Add Project</button>
                        </div>
                        <div className="grid gap-6">
                            {(formData.projects || []).map((proj, i) => (
                                <div key={i} className="p-6 border rounded-xl relative space-y-4 bg-slate-50 border-slate-200 dark:bg-[#1e293b] dark:border-white/10">
                                    <button onClick={()=>removeProject(i)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><FiTrash2/></button>
                                    
                                    <input className="w-full bg-transparent border-b p-2 font-bold text-lg outline-none border-slate-200 dark:border-white/10 text-slate-900 dark:text-white" placeholder="Project Title" value={proj.title} onChange={e=>updateProject(i, 'title', e.target.value)} />
                                    <textarea className="w-full border p-3 rounded-lg outline-none h-24 text-sm bg-white border-slate-200 text-slate-600 dark:bg-[#020617] dark:border-gray-700 dark:text-gray-300" placeholder="Description" value={proj.description} onChange={e=>updateProject(i, 'description', e.target.value)} />
                                    <input className="w-full border p-3 rounded-lg outline-none text-sm bg-white border-slate-200 text-slate-600 dark:bg-[#020617] dark:border-gray-700 dark:text-gray-300" placeholder="Tech Stack (comma sep)" value={proj.techStack} onChange={e=>updateProject(i, 'techStack', e.target.value)} />
                                    
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 relative">
                                            <input 
                                                className="w-full border p-3 rounded-lg outline-none text-sm bg-white border-slate-200 text-slate-600 dark:bg-[#020617] dark:border-gray-700 dark:text-gray-300 pr-10" 
                                                placeholder="Cover Image URL (Upload or Paste Link)" 
                                                value={proj.image || ""} 
                                                onChange={e=>updateProject(i, 'image', e.target.value)} 
                                            />
                                            {/* Small preview of existing image */}
                                            {proj.image && (
                                                <img src={proj.image} alt="Preview" className="absolute right-2 top-2 h-8 w-8 rounded object-cover border border-white/20" />
                                            )}
                                        </div>
                                        
                                        {/* UPLOAD BUTTON */}
                                        <div className="relative">
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                className="hidden"
                                                id={`proj-img-${i}`}
                                                onChange={(e) => handleProjectImageUpload(e, i)}
                                            />
                                            <label 
                                                htmlFor={`proj-img-${i}`}
                                                className={`flex items-center justify-center p-3 rounded-lg cursor-pointer transition-all ${uploadingProjIndex === i ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 dark:bg-purple-600 dark:hover:bg-purple-700'} text-white shadow-md`}
                                                title="Upload Image"
                                            >
                                                {uploadingProjIndex === i ? <FiLoader className="animate-spin" /> : <FiUploadCloud size={20} />}
                                            </label>
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-4">
                                        <input className="w-1/2 border p-3 rounded-lg outline-none text-sm bg-white border-slate-200 text-slate-600 dark:bg-[#020617] dark:border-gray-700 dark:text-gray-300" placeholder="GitHub URL" value={proj.githubLink} onChange={e=>updateProject(i, 'githubLink', e.target.value)} />
                                        <input className="w-1/2 border p-3 rounded-lg outline-none text-sm bg-white border-slate-200 text-slate-600 dark:bg-[#020617] dark:border-gray-700 dark:text-gray-300" placeholder="Live URL" value={proj.liveLink} onChange={e=>updateProject(i, 'liveLink', e.target.value)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t pt-8 border-slate-200 dark:border-gray-800">
                         <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Achievements (One per line)</label>
                         <textarea className="w-full border p-3 rounded-xl outline-none h-40 bg-white border-slate-200 text-slate-900 dark:bg-[#1e293b] dark:border-white/10 dark:text-white" value={(formData.achievements || []).join('\n')} onChange={e => setFormData({ ...formData, achievements: e.target.value.split('\n') })} />
                    </div>
                </div>
            </div>
        )}
      </div>
      {/* ... Report Issue button ... */}
      <a 
        href="mailto:support@devnexus.com?subject=Issue Report - Relay&body=Describe your issue here..."
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-red-500/90 text-white rounded-full shadow-2xl hover:scale-105 transition-transform hover:bg-red-600 backdrop-blur-md"
        title="Report an Issue"
      >
        <FiMessageSquare size={20} />
        <span className="font-bold text-sm hidden sm:inline">Report Issue</span>
      </a>
    </div>
  );
}

export default ProfileManager;
