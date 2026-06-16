import React from 'react';
import { motion } from 'framer-motion';
import { FiZap } from 'react-icons/fi';

function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-[#020617] flex flex-col items-center justify-center z-[9999] overflow-hidden">
      
      {/* Background Pulse Effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] animate-pulse"></div>
      </div>

      <div className="z-10 flex flex-col items-center">
        {/* Animated Logo */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-24 h-24 mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-2xl animate-spin-slow blur-md opacity-70"></div>
          <div className="relative bg-[#0f172a] w-full h-full rounded-2xl border border-white/10 flex items-center justify-center shadow-2xl">
            <FiZap className="w-10 h-10 text-white" />
          </div>
        </motion.div>

        {/* Typing Text Effect */}
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-widest mb-2 font-mono">
          DEV<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">NEXUS</span>
        </h1>
        
        <div className="flex items-center gap-2 mt-4">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
          <span className="text-gray-400 font-mono text-sm">Initializing Development Environment...</span>
        </div>

        {/* Progress Bar */}
        <div className="w-64 h-1 bg-gray-800 rounded-full mt-6 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;
