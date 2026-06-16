import RelayLogo from './RelayLogo';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FiUser, FiMail, FiLock, FiZap } from "react-icons/fi";

function Register({ setUser }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/register`, { username, email, password });
      localStorage.setItem("token", data.token);
      setUser(data);
      navigate("/");
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] relative px-4 overflow-hidden">
      
      {/* Background Effect */}
      <div className="absolute inset-0 z-0">
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f46e50a_1px,transparent_1px),linear-gradient(to_bottom,#4f46e50a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
         <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 relative z-10">
        
        <div className="text-center mb-8">
           <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 mb-4 shadow-lg">
              <RelayLogo className="text-white text-xl" />
           </div>
           <h2 className="text-3xl font-bold text-white mb-2">Join Relay</h2>
           <p className="text-gray-400">Initialize your developer environment</p>
        </div>
        
        {error && <p className="text-red-400 text-sm text-center mb-6 bg-red-500/10 border border-red-500/20 p-3 rounded-lg">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative group">
            <FiUser className="absolute top-3.5 left-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
            <input
              type="text" value={username} onChange={(e) => setUsername(e.target.value)}
              placeholder="Username" required
              className="w-full pl-12 pr-4 py-3 bg-[#0f172a]/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            />
          </div>
          <div className="relative group">
            <FiMail className="absolute top-3.5 left-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Email" required
              className="w-full pl-12 pr-4 py-3 bg-[#0f172a]/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            />
          </div>
          <div className="relative group">
            <FiLock className="absolute top-3.5 left-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Password" required
              className="w-full pl-12 pr-4 py-3 bg-[#0f172a]/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-white text-black hover:bg-gray-200 font-bold py-3 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-95"
          >
            Create Account
          </button>
        </form>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          Already a member?{" "}
          <Link to="/login" className="font-bold text-white hover:text-purple-400 transition-colors">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
