import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { 
  FiMapPin, FiMail, FiGithub, FiLinkedin, FiExternalLink, 
  FiZap, FiAward, FiCode, FiDownload, FiStar 
} from "react-icons/fi";
import { motion } from "framer-motion";

// --- HELPER: Normalize Skills for Icons ---
const getSkillIcon = (skillName) => {
  if (!skillName) return null;
  const clean = skillName.toLowerCase().trim();
  const map = {
    'c++': 'cpp', 'cpp': 'cpp', 'cplusplus': 'cpp', 'c#': 'cs', 'csharp': 'cs',
    'python': 'python', 'py': 'python', 'java': 'java', 'javascript': 'js', 'js': 'js',
    'typescript': 'ts', 'ts': 'ts', 'html': 'html', 'html5': 'html', 'css': 'css', 'css3': 'css',
    'go': 'go', 'golang': 'go', 'rust': 'rust', 'php': 'php', 'ruby': 'ruby', 'swift': 'swift',
    'kotlin': 'kotlin', 'dart': 'dart', 'react': 'react', 'reactjs': 'react', 'react.js': 'react',
    'next': 'nextjs', 'nextjs': 'nextjs', 'vue': 'vue', 'vuejs': 'vue', 'angular': 'angular',
    'svelte': 'svelte', 'tailwind': 'tailwindcss', 'tailwindcss': 'tailwindcss', 'tailwind css': 'tailwindcss',
    'bootstrap': 'bootstrap', 'sass': 'sass', 'scss': 'sass', 'redux': 'redux', 'jquery': 'jquery',
    'vite': 'vite', 'webpack': 'webpack', 'babel': 'babel', 'node': 'nodejs', 'nodejs': 'nodejs', 'node.js': 'nodejs',
    'express': 'express', 'expressjs': 'express', 'mongo': 'mongodb', 'mongodb': 'mongodb', 'mongoose': 'mongodb',
    'postgres': 'postgresql', 'postgresql': 'postgresql', 'sql': 'mysql', 'mysql': 'mysql', 'redis': 'redis',
    'firebase': 'firebase', 'appwrite': 'appwrite', 'supabase': 'supabase', 'graphql': 'graphql', 'prisma': 'prisma',
    'nginx': 'nginx', 'scikitlearn': 'sklearn', 'sklearn': 'sklearn', 'sci-kit learn': 'sklearn',
    'tensorflow': 'tensorflow', 'tf': 'tensorflow', 'pytorch': 'pytorch', 'opencv': 'opencv', 'pandas': 'pandas',
    'numpy': 'numpy', 'matplotlib': 'matplotlib', 'anaconda': 'anaconda', 'r': 'r', 'docker': 'docker',
    'kubernetes': 'kubernetes', 'k8s': 'kubernetes', 'aws': 'aws', 'amazon': 'aws', 'gcp': 'gcp', 'google cloud': 'gcp',
    'azure': 'azure', 'vercel': 'vercel', 'netlify': 'netlify', 'heroku': 'heroku', 'git': 'git', 'github': 'github',
    'gitlab': 'gitlab', 'linux': 'linux', 'ubuntu': 'ubuntu', 'bash': 'bash', 'jenkins': 'jenkins', 'grafana': 'grafana',
    'postman': 'postman', 'vscode': 'vscode', 'figma': 'figma', 'blender': 'blender', 'unity': 'unity', 'unreal': 'unreal'
  };

  if (map[clean]) return `https://skillicons.dev/icons?i=${map[clean]}`;
  const directSlug = clean.replace(/[^a-z0-9]/g, '');
  if (map[directSlug]) return `https://skillicons.dev/icons?i=${map[directSlug]}`;
  const allSlugs = Object.values(map);
  if (allSlugs.includes(clean)) return `https://skillicons.dev/icons?i=${clean}`;
  return null;
};

// --- HELPER: Get Project Image (Cloudinary Priority) ---
const getProjectImage = (project) => {
  // 1. Priority: Uploaded Cloudinary Image
  if (project.image && project.image.trim() !== "") return project.image;
  
  // 2. Fallback: GitHub OpenGraph
  if (project.githubLink && project.githubLink.includes("github.com")) {
    try {
      const urlParts = new URL(project.githubLink).pathname.split("/").filter(Boolean);
      if (urlParts.length >= 2) return `https://opengraph.githubassets.com/1/${urlParts[0]}/${urlParts[1]}`;
    } catch (e) {}
  }
  
  // 3. Fallback: Placeholder
  return "https://via.placeholder.com/800x400/0f172a/94a3b8?text=Project+Code";
};

const BackgroundPattern = () => (
  <div className="fixed inset-0 z-0 pointer-events-none bg-slate-50 dark:bg-[#020617] transition-colors duration-300">
    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
    <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-slate-50 dark:from-[#020617] dark:via-transparent dark:to-[#020617]"></div>
  </div>
);

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
             {project.githubLink && (
               <a href={project.githubLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10"><FiGithub /> Code</a>
             )}
             {project.liveLink && (
               <a href={project.liveLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-opacity shadow-lg bg-blue-600 dark:bg-purple-600 text-white hover:opacity-90"><FiExternalLink /> Live</a>
             )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

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

function PublicProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { username } = useParams(); 
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/user-profile/public/${username}`);
        setProfile(data);
      } catch (e) { console.error(e); } 
      finally { setLoading(false); }
    };
    fetchProfile();
  }, [API_URL, username]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white">Loading Profile...</div>;
  if (!profile) return <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white">User not found</div>;

  const renderAvatar = (src, name) => {
    if (src) return <img src={src} alt="Profile" className="w-full h-full object-cover" />;
    return <span className="text-4xl font-bold text-slate-900 dark:text-white">{name ? name[0] : "U"}</span>;
  };

  return (
    <div className="min-h-screen overflow-y-auto custom-scrollbar font-sans transition-colors duration-500 bg-slate-50 dark:bg-[#020617] text-slate-600 dark:text-gray-200 relative">
      <BackgroundPattern />
      <div className="max-w-6xl mx-auto px-3 md:px-6 pb-20 relative z-10 pt-12">
        <div className="space-y-24 animate-fade-in-up">
            
            {/* HERO */}
            <section className="flex flex-col items-center text-center max-w-3xl mx-auto">
               <div className="relative mb-6">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-purple-600 dark:to-blue-600 rounded-full blur opacity-40 animate-pulse"></div>
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 flex items-center justify-center">
                      {renderAvatar(profile.profilePic, profile.fullName)}
                  </div>
               </div>
               
               <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-white">{profile.fullName}</h1>
               <p className="text-xl font-medium mb-6 px-4 py-1 rounded-full border bg-blue-50 border-slate-200 text-blue-600 dark:bg-purple-500/10 dark:border-white/10 dark:text-purple-400">{profile.headline}</p>
               <p className="text-lg mb-8 leading-relaxed whitespace-pre-wrap text-slate-600 dark:text-gray-200">{profile.about}</p>
               
               <div className="flex flex-col items-center gap-6">
                  <div className="flex gap-4 justify-center">
                      {[
                        { icon: FiGithub, link: `https://github.com/${profile.githubUsername}` },
                        { icon: FiLinkedin, link: profile.linkedinProfile },
                        { icon: FiMail, link: `mailto:${profile.email}` }
                      ].map((social, i) => social.link && (
                        <a key={i} href={social.link} target="_blank" rel="noreferrer" className="p-3 rounded-xl border bg-white border-slate-200 text-slate-600 dark:bg-white/5 dark:border-white/10 dark:text-gray-200 hover:scale-110 transition-transform">
                            <social.icon size={22}/>
                        </a>
                      ))}
                  </div>
                  {profile.resumes && profile.resumes.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-4">
                        {profile.resumes.map((res, i) => (
                          <a key={i} href={res.link} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-2.5 rounded-full font-bold shadow-lg transition-transform hover:-translate-y-1 bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
                            <FiDownload className="text-lg" /> {res.label || "Download Resume"}
                          </a>
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
                      <img src={`https://github-profile-summary-cards.vercel.app/api/cards/stats?username=${profile.githubUsername}&theme=github_dark`} className="w-full max-w-md" alt="GitHub Stats" />
                   </div>
                 )}
                 {profile.leetcodeUsername && (
                   <div className="border rounded-2xl p-4 flex justify-center overflow-hidden bg-white border-slate-200 dark:bg-white/5 dark:border-white/10 shadow-sm">
                      <img src={`https://leetcard.jacoblin.cool/${profile.leetcodeUsername}?theme=light&font=Inter&ext=heatmap`} className="w-full max-w-md scale-95 dark:invert dark:hue-rotate-180" alt="LeetCode Stats" />
                   </div>
                 )}
               </div>
            )}

            {/* SKILLS */}
            {profile.skills && profile.skills.length > 0 && (
              <section className="text-center">
                  <h2 className="text-3xl font-bold mb-10 flex items-center justify-center gap-2 text-slate-900 dark:text-white"><FiZap className="text-blue-600 dark:text-purple-400"/> Tech Stack</h2>
                  <div className="flex flex-wrap justify-center gap-6">
                     {profile.skills.map((skill, idx) => {
                        const iconUrl = getSkillIcon(skill);
                        return (
                          <div key={idx} title={skill} className="transition-transform hover:scale-125 flex flex-col items-center">
                             {iconUrl ? (
                               <img 
                                 src={iconUrl} 
                                 alt={skill} 
                                 className="w-12 h-12 md:w-16 md:h-16"
                                 onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} 
                               />
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
            {profile.projects && profile.projects.length > 0 && (
               <section>
                  <div className="flex items-center gap-3 mb-12">
                     <div className="h-8 w-1 rounded-full bg-blue-500 dark:bg-purple-500"></div>
                     <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Featured Projects</h2>
                  </div>
                  <div className="flex flex-col gap-16">
                     {profile.projects.map((project, i) => <HighImpactProjectCard key={i} project={project} index={i} />)}
                  </div>
               </section>
            )}

            {/* ACHIEVEMENTS */}
            {profile.achievements && profile.achievements.length > 0 && (
               <section className="pb-20">
                  <div className="flex items-center gap-3 mb-10">
                     <div className="h-8 w-1 bg-yellow-500 rounded-full"></div>
                     <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Key Achievements</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {profile.achievements.map((ach, i) => (
                        <AchievementCard key={i} text={ach} index={i} />
                     ))}
                  </div>
               </section>
            )}
        </div>
      </div>
    </div>
  );
}

export default PublicProfile;
