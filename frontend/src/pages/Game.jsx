import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import TambolaTicket from '../components/TambolaTicket';
import NumbersBoard from '../components/NumbersBoard';
import Leaderboard from '../components/Leaderboard';
import WinnerClaims from '../components/WinnerClaims';
import LobbyChat from '../components/LobbyChat';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlay, FiPause, FiSettings, FiLogOut, FiArrowRight, FiVolume2, FiVolumeX } from 'react-icons/fi';

export default function Game() {
  const { room, player, drawNumber, toggleAutoCall, endGame, leaveRoom, autoMark, voiceMuted, toggleAutoMark, toggleVoiceMute } = useGame();
  const { theme } = useTheme();
  const [autoCallDelay, setAutoCallDelay] = useState(4000); // default 4 seconds

  if (!room || !player) return null;

  const isHost = player.isHost;
  const currentNumber = room.currentNumber;

  const handleAutoCallToggle = () => {
    toggleAutoCall(autoCallDelay);
  };

  return (
    <div className={`min-h-screen p-4 sm:p-6 transition-colors duration-300 ${
      theme === 'dark' ? 'bg-mesh-dark' : 'bg-mesh-light'
    }`}>
      {/* Top Header */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-6 pb-4 border-b border-slate-200/50 dark:border-slate-800/40">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-850 dark:text-white flex items-center space-x-2">
            <span>Room:</span>
            <span className="text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{room.code}</span>
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            Playing as: <span className="text-slate-650 dark:text-slate-350 font-bold">{player.name}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Mute/Unmute Speaker Control */}
          <button
            onClick={toggleVoiceMute}
            className="p-2.5 rounded-full glass-panel hover:bg-slate-105 dark:hover:bg-slate-800 transition-all duration-200 shadow-md text-slate-700 dark:text-gold-400 focus:outline-none"
            title={voiceMuted ? "Unmute Voice" : "Mute Voice"}
          >
            {voiceMuted ? (
              <FiVolumeX className="w-5 h-5 text-rose-500 animate-pulse" />
            ) : (
              <FiVolume2 className="w-5 h-5 text-emerald-500" />
            )}
          </button>
          <ThemeToggle />
          <button
            onClick={leaveRoom}
            className="px-3.5 py-1.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 border border-rose-200 dark:border-rose-900/30 rounded-xl text-xs font-semibold flex items-center space-x-1 hover:bg-rose-100 dark:hover:bg-rose-950/40 transition-colors"
          >
            <FiLogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Quit Game</span>
          </button>
        </div>
      </div>

      {/* Responsive Dashboard Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Controls, Standings & Claims (lg:col-span-3) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Host Controls */}
          {isHost && (
            <div className="glass-panel rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/40 flex flex-col space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center space-x-1.5">
                <FiSettings className="w-3.5 h-3.5" />
                <span>Host Dashboard</span>
              </h3>

              {/* Call Number Action */}
              <button
                onClick={drawNumber}
                disabled={room.isAutoCalling || room.remainingNumbers.length === 0}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold rounded-2xl flex items-center justify-center space-x-1.5 shadow-lg shadow-indigo-500/20 transition-all focus:outline-none"
              >
                <span>Call Next Number</span>
                <FiArrowRight className="w-4 h-4" />
              </button>

              {/* Auto Call Toggles */}
              <div className="pt-3 border-t border-slate-250/20 dark:border-slate-800/20 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-550 dark:text-slate-400 font-semibold">Auto Interval</span>
                  <select
                    value={autoCallDelay}
                    onChange={(e) => setAutoCallDelay(Number(e.target.value))}
                    disabled={room.isAutoCalling}
                    className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-350 focus:outline-none"
                  >
                    <option value={3000}>3s</option>
                    <option value={4000}>4s</option>
                    <option value={6000}>6s</option>
                    <option value={8000}>8s</option>
                  </select>
                </div>
                
                <button
                  onClick={handleAutoCallToggle}
                  disabled={room.remainingNumbers.length === 0}
                  className={`w-full py-2.5 rounded-xl font-bold flex items-center justify-center space-x-1.5 transition-all text-xs border focus:outline-none ${
                    room.isAutoCalling
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {room.isAutoCalling ? (
                    <>
                      <FiPause className="w-3.5 h-3.5 animate-pulse" />
                      <span>Pause Calling</span>
                    </>
                  ) : (
                    <>
                      <FiPlay className="w-3.5 h-3.5" />
                      <span>Resume Auto Call</span>
                    </>
                  )}
                </button>
              </div>

              {/* End / Reset */}
              <div className="pt-3 border-t border-slate-250/20 dark:border-slate-800/20">
                <button
                  onClick={endGame}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md transition-all focus:outline-none"
                >
                  End Game & Show Scores
                </button>
              </div>
            </div>
          )}

          <WinnerClaims />
          <Leaderboard />
        </div>

        {/* CENTER COLUMN: Current Called Number & Ticket (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          
          {/* Current Called Number Visualizer */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200/50 dark:border-slate-800/40 flex flex-col items-center justify-center text-center relative overflow-hidden bg-gradient-to-br from-indigo-50/10 to-violet-50/10 dark:from-indigo-950/10 dark:to-violet-950/10 h-[220px]">
            <div className="absolute inset-0 bg-shimmer opacity-10 pointer-events-none" />
            
            <AnimatePresence mode="wait">
              {currentNumber ? (
                <motion.div
                  key={currentNumber}
                  initial={{ scale: 0.3, y: 30, opacity: 0 }}
                  animate={{ scale: 1.1, y: 0, opacity: 1 }}
                  exit={{ scale: 0.5, y: -20, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="flex flex-col items-center justify-center relative"
                >
                  <span className="text-[10px] uppercase font-black text-indigo-500/80 dark:text-indigo-400/80 tracking-widest block mb-2">
                    Current Number
                  </span>
                  
                  {/* Glowing Ball */}
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 dark:from-amber-350 dark:to-amber-550 flex items-center justify-center shadow-xl shadow-amber-500/30 border-4 border-white/60 dark:border-slate-850/80 mb-2 relative">
                    <span className="text-5xl font-black text-white drop-shadow-md">
                      {currentNumber}
                    </span>
                    <div className="absolute top-1 right-2 w-3 h-3 rounded-full bg-white/40" />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="no-number"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-20 h-20 rounded-full border-4 border-dashed border-slate-300 dark:border-slate-800 flex items-center justify-center mb-3">
                    <span className="text-2xl text-slate-350 dark:text-slate-650">⏳</span>
                  </div>
                  <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">Waiting for Call</h3>
                  <p className="text-xs text-slate-450 dark:text-slate-500 max-w-[200px] mt-1">
                    {isHost ? 'Click "Call Next Number" to start drawing numbers!' : 'Wait for the Host to call the first number.'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Player Settings (Auto Mark Toggle) */}
          <div className="flex items-center justify-between p-3.5 glass-panel rounded-2xl border border-slate-200/50 dark:border-slate-800/40 shadow-md">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Auto Mark Ticket</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">Automatically dab numbers as they are called</span>
            </div>
            <button
              onClick={toggleAutoMark}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 focus:outline-none ${
                autoMark ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                  autoMark ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Player Ticket */}
          <TambolaTicket />
        </div>

        {/* RIGHT COLUMN: Full Board & Chat (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          <NumbersBoard />
          <LobbyChat />
        </div>

      </div>
    </div>
  );
}
