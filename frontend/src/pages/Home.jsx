import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiPlay, FiCpu, FiPlus, FiArrowRight } from 'react-icons/fi';

export default function Home() {
  const { createRoom, joinRoom, room, player } = useGame();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [hostName, setHostName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [activeTab, setActiveTab] = useState('host'); // host | join

  // Redirect to lobby if join/create was successful
  useEffect(() => {
    if (room && player) {
      navigate(`/room/${room.code}`);
    }
  }, [room, player, navigate]);

  const handleHost = (e) => {
    e.preventDefault();
    if (hostName.trim() === '') return;
    createRoom(hostName);
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (playerName.trim() === '' || roomCode.trim() === '') return;
    joinRoom(roomCode, playerName);
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors duration-300 ${
      theme === 'dark' ? 'bg-mesh-dark' : 'bg-mesh-light'
    }`}>
      {/* Floating Theme Toggle */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      {/* Decorative Blur Spheres */}
      <div className="absolute top-[-10%] left-[-10%] w-[30vw] h-[30vw] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[35vw] h-[35vw] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Title / Logo Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl shadow-xl shadow-indigo-500/20 mb-4 border border-indigo-400/20"
          >
            <span className="text-3xl">🎟️</span>
          </motion.div>
          
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-350">
            Tambola <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-500">Club</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">
            Real-time Multiplayer Housie Game
          </p>
        </div>

        {/* Action Tabs Card */}
        <div className="glass-panel-heavy rounded-3xl overflow-hidden shadow-2xl">
          {/* Tabs Selector */}
          <div className="flex border-b border-slate-200/50 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/20">
            <button
              onClick={() => setActiveTab('host')}
              className={`flex-1 py-4 text-sm font-bold transition-all duration-200 flex items-center justify-center space-x-2 border-b-2 focus:outline-none ${
                activeTab === 'host'
                  ? 'border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-455'
                  : 'border-transparent text-slate-450 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300'
              }`}
            >
              <FiPlus className="w-4 h-4" />
              <span>Host Game</span>
            </button>
            <button
              onClick={() => setActiveTab('join')}
              className={`flex-1 py-4 text-sm font-bold transition-all duration-200 flex items-center justify-center space-x-2 border-b-2 focus:outline-none ${
                activeTab === 'join'
                  ? 'border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-455'
                  : 'border-transparent text-slate-450 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300'
              }`}
            >
              <FiPlay className="w-4 h-4" />
              <span>Join Game</span>
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-8">
            {activeTab === 'host' ? (
              <form onSubmit={handleHost} className="space-y-5">
                <div>
                  <label htmlFor="hostName" className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="hostName"
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    placeholder="Enter Host Name"
                    maxLength={15}
                    required
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-slate-800 dark:text-slate-200 transition-all font-semibold"
                  />
                </div>
                <button
                  type="submit"
                  disabled={hostName.trim() === ''}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 dark:from-indigo-500 dark:to-violet-500 dark:hover:from-indigo-600 dark:hover:to-violet-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-indigo-500/20 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
                >
                  <span>Create Room</span>
                  <FiArrowRight className="w-5 h-5" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleJoin} className="space-y-5">
                <div>
                  <label htmlFor="playerName" className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="playerName"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter Player Name"
                    maxLength={15}
                    required
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-slate-800 dark:text-slate-200 transition-all font-semibold"
                  />
                </div>
                <div>
                  <label htmlFor="roomCode" className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                    Room Code
                  </label>
                  <input
                    type="text"
                    id="roomCode"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="E.g., A7P92K"
                    maxLength={6}
                    required
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-slate-800 dark:text-slate-200 transition-all tracking-wider font-extrabold uppercase placeholder:normal-case placeholder:font-semibold"
                  />
                </div>
                <button
                  type="submit"
                  disabled={playerName.trim() === '' || roomCode.trim() === ''}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 dark:from-indigo-500 dark:to-violet-500 dark:hover:from-indigo-600 dark:hover:to-violet-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-indigo-500/20 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
                >
                  <span>Join Game</span>
                  <FiArrowRight className="w-5 h-5" />
                </button>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
