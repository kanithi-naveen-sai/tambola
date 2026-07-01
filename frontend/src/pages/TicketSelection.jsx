import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLogOut, FiCheck, FiLoader } from 'react-icons/fi';

export default function TicketSelection() {
  const { room, player, selectTicket, leaveRoom } = useGame();
  const { theme } = useTheme();
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // If room resets or code changes, reset local state
  useEffect(() => {
    setIsConfirmed(false);
    setActiveIndex(0);
  }, [room?.code]);

  if (!room || !player || !player.ticketOptions) return null;

  const ticketOptions = player.ticketOptions; // array of 5 tickets
  const activeTicket = ticketOptions[activeIndex]; // 3x9 grid

  const handleConfirm = () => {
    selectTicket(activeIndex);
    setIsConfirmed(true);
  };

  const confirmedCount = room.players.filter(p => p.ticketSelected).length;
  const totalCount = room.players.length;

  return (
    <div className={`min-h-screen p-4 sm:p-6 flex flex-col transition-colors duration-300 ${
      theme === 'dark' ? 'bg-mesh-dark' : 'bg-mesh-light'
    }`}>
      {/* Header Bar */}
      <div className="max-w-4xl mx-auto w-full flex justify-between items-center mb-8 pb-4 border-b border-slate-200/50 dark:border-slate-800/40">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-850 dark:text-white">
            Choose Your <span className="text-indigo-650 dark:text-indigo-400">Ticket</span>
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            Room Code: <span className="font-extrabold text-slate-700 dark:text-slate-350">{room.code}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <ThemeToggle />
          <button
            onClick={leaveRoom}
            className="px-3.5 py-1.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-455 border border-rose-200 dark:border-rose-900/30 rounded-xl text-xs font-semibold flex items-center space-x-1 hover:bg-rose-100 dark:hover:bg-rose-950/40 transition-colors"
          >
            <FiLogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Quit Lobby</span>
          </button>
        </div>
      </div>

      {/* Main Selection Area */}
      <div className="max-w-xl mx-auto w-full flex-1 flex flex-col justify-center space-y-6">
        
        {/* Ticket Selector Tabs */}
        <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-100/60 dark:bg-slate-900/50 rounded-2xl border border-slate-250/20 dark:border-slate-800/20">
          {ticketOptions.map((_, idx) => (
            <button
              key={idx}
              disabled={isConfirmed}
              onClick={() => setActiveIndex(idx)}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                activeIndex === idx
                  ? 'bg-indigo-600 dark:bg-indigo-505 text-white shadow-sm'
                  : 'text-slate-450 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 disabled:opacity-40 disabled:hover:text-slate-400'
              }`}
            >
              #{idx + 1}
            </button>
          ))}
        </div>

        {/* Dynamic Ticket Preview Grid */}
        <div className="relative glass-panel rounded-3xl p-4 sm:p-5 border border-slate-205/60 dark:border-slate-800/50 shadow-2xl bg-gradient-to-r from-slate-50 to-indigo-50/20 dark:from-slate-950 dark:to-slate-900/60 min-h-[160px] flex flex-col justify-center">
          <div className="flex justify-between items-center mb-3 px-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              PREVIEWING TICKET #{activeIndex + 1}
            </span>
            <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold rounded">
              ID: {player.name}
            </span>
          </div>

          <div className="grid grid-rows-3 gap-1.5 sm:gap-2">
            {activeTicket.map((row, rIndex) => (
              <div key={rIndex} className="grid grid-cols-9 gap-1.5 sm:gap-2">
                {row.map((cell, cIndex) => {
                  const isNumber = cell !== null;

                  return (
                    <div
                      key={cIndex}
                      className={`
                        aspect-square sm:aspect-[4/3] flex items-center justify-center rounded-xl border text-xs sm:text-lg font-bold select-none transition-all duration-200
                        ${
                          isNumber
                            ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                            : 'bg-slate-100/40 dark:bg-slate-950/30 border-slate-200/10 dark:border-slate-800/10'
                        }
                      `}
                    >
                      {isNumber && <span>{cell}</span>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-2">
          {!isConfirmed ? (
            <button
              onClick={handleConfirm}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 dark:from-indigo-500 dark:to-violet-500 dark:hover:from-indigo-600 dark:hover:to-violet-600 text-white rounded-2xl font-black text-sm flex items-center justify-center space-x-1.5 shadow-lg shadow-indigo-500/20 active:scale-98 transition-all focus:outline-none"
            >
              <FiCheck className="w-5 h-5" />
              <span>Confirm Ticket #{activeIndex + 1}</span>
            </button>
          ) : (
            <div className="glass-panel rounded-2xl p-4 border border-slate-200/50 dark:border-slate-800/40 flex flex-col items-center justify-center space-y-3 bg-indigo-50/10 dark:bg-indigo-950/5">
              <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                <FiLoader className="w-4 h-4 animate-spin" />
                <span>Waiting for other players...</span>
              </div>
              
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-650 h-full rounded-full transition-all duration-300"
                  style={{ width: `${(confirmedCount / totalCount) * 100}%` }}
                />
              </div>
              
              <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider">
                Confirmed: {confirmedCount} / {totalCount} Players
              </span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
