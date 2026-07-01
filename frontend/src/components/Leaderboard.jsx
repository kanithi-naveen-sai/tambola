import React from 'react';
import { useGame } from '../context/GameContext';
import { FiTrendingUp, FiAward } from 'react-icons/fi';

export default function Leaderboard() {
  const { room } = useGame();

  if (!room) return null;

  // Sort players by score (descending)
  const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);

  return (
    <div className="glass-panel rounded-2xl p-4 border border-slate-200/50 dark:border-slate-800/40 flex flex-col">
      <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-200 flex items-center space-x-1.5 mb-3">
        <FiTrendingUp className="w-4 h-4 text-emerald-500" />
        <span>Live Standings</span>
      </h3>

      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
        {sortedPlayers.map((p, idx) => {
          const isWinner = idx === 0 && p.score > 0;
          return (
            <div
              key={p.id}
              className={`flex items-center justify-between p-2.5 rounded-xl text-xs border transition-all ${
                isWinner
                  ? 'bg-amber-500/10 dark:bg-amber-500/5 border-amber-500/30'
                  : 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/10 dark:border-slate-800/10'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-[10px] w-4 text-slate-400 dark:text-slate-500 text-center">
                  #{idx + 1}
                </span>
                <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                  {p.name}
                </span>
                {isWinner && (
                  <FiAward className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                )}
              </div>
              
              <div className="flex items-center space-x-1">
                <span className={`font-bold ${isWinner ? 'text-amber-500' : 'text-slate-600 dark:text-slate-400'}`}>
                  {p.score}
                </span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-semibold">
                  pts
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
