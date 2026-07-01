import React from 'react';
import { useGame } from '../context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiClock, FiUser, FiActivity } from 'react-icons/fi';

export default function PlayerList() {
  const { room, player } = useGame();

  if (!room) return null;

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/40 flex flex-col h-[350px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-200 flex items-center space-x-1.5">
          <FiUser className="w-4 h-4 text-indigo-500" />
          <span>Connected Players</span>
        </h3>
        <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs rounded-full font-bold flex items-center space-x-1">
          <FiActivity className="w-3 h-3" />
          <span>{room.players.length}</span>
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        <AnimatePresence>
          {room.players.map((p) => {
            const isMe = player && player.id === p.id;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className={`flex justify-between items-center p-3 rounded-xl border text-sm transition-all ${
                  isMe
                    ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/40 shadow-sm'
                    : 'bg-slate-50/30 dark:bg-slate-900/30 border-slate-200/30 dark:border-slate-800/30'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${p.isHost ? 'bg-amber-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`} />
                  <span className={`font-medium ${isMe ? 'text-indigo-600 dark:text-indigo-300 font-semibold' : 'text-slate-700 dark:text-slate-300'}`}>
                    {p.name} {isMe && '(You)'}
                  </span>
                  {p.isHost && (
                    <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] rounded font-bold uppercase tracking-wider">
                      Host
                    </span>
                  )}
                </div>

                <div className="flex items-center">
                  {p.ready ? (
                    <span className="flex items-center text-emerald-600 dark:text-emerald-400 space-x-1 font-semibold text-xs">
                      <FiCheck className="w-4 h-4" />
                      <span>Ready</span>
                    </span>
                  ) : (
                    <span className="flex items-center text-slate-400 dark:text-slate-500 space-x-1 text-xs">
                      <FiClock className="w-3.5 h-3.5" />
                      <span>Waiting</span>
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
