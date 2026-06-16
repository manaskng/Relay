import RelayLogo from './RelayLogo';
import React from 'react';
import { FiUsers, FiZap, FiWifi } from 'react-icons/fi';

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

const PresenceBar = ({ roomId, isConnected, userName }) => {
  // In a real app, we would sync the full user list via socket. 
  // For now, we visualize the current user and connection status.
  
  return (
    <div className="flex flex-wrap items-center justify-between p-3 mb-4 bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-white/5 shadow-sm">
      
      {/* Left: Room Info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
           <RelayLogo size={14} />
           <span className="text-xs font-bold tracking-wider">ROOM: {roomId}</span>
        </div>
        
        <div className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${isConnected ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-100 text-red-700'}`}>
           <FiWifi size={12}/>
           <span>{isConnected ? "UPLINK STABLE" : "DISCONNECTED"}</span>
        </div>
      </div>

      {/* Right: User Avatars */}
      <div className="flex items-center gap-3">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center">
          <FiUsers className="mr-2" /> Active Nodes
        </div>
        
        <div className="flex -space-x-2 overflow-hidden py-1">
           {/* Current User */}
           <div 
             title={`${userName} (You)`}
             className="relative inline-flex h-8 w-8 items-center justify-center rounded-full ring-2 ring-white dark:ring-[#0f172a] bg-blue-600 text-white font-bold text-xs uppercase shadow-md z-10"
           >
             {userName.slice(0, 2)}
             <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-[#0f172a]"></span>
           </div>

           {/* Placeholder for "Ghost" Peers (Visual Polish) */}
           {[1, 2].map((i) => (
             <div key={i} className="relative inline-flex h-8 w-8 items-center justify-center rounded-full ring-2 ring-white dark:ring-[#0f172a] bg-slate-200 dark:bg-slate-700 text-slate-400 text-[10px] font-bold">
               P{i}
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default PresenceBar;
