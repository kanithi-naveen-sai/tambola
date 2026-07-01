import React from 'react';
import { useGame } from '../context/GameContext';
import { FiCheck, FiAward } from 'react-icons/fi';

export default function WinnerClaims() {
  const { room, player, claimPattern } = useGame();

  if (!room) return null;

  const patterns = [
    { key: 'earlyFive', name: 'Early Five', points: 10 },
    { key: 'fourCorners', name: 'Four Corners', points: 20 },
    { key: 'topRow', name: 'Top Line', points: 20 },
    { key: 'middleRow', name: 'Middle Line', points: 20 },
    { key: 'bottomRow', name: 'Bottom Line', points: 20 },
    { key: 'fullHouse', name: 'Full House', points: 50 }
  ];

  return (
    <div className="flex flex-col space-y-4">
      {/* 1. WINNING PATTERNS SHEET */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-200/50 dark:border-slate-800/40">
        <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-200 mb-3 flex items-center space-x-1.5">
          <FiAward className="w-4 h-4 text-indigo-500" />
          <span>Winning Patterns</span>
        </h3>

        <div className="grid grid-cols-1 gap-2">
          {patterns.map((pat) => {
            const winner = room.winners[pat.key];
            const hasBeenClaimed = winner !== null && winner !== undefined;

            return (
              <div
                key={pat.key}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  hasBeenClaimed
                    ? 'bg-slate-100/60 dark:bg-slate-900/35 border-slate-200/30 dark:border-slate-800/30 opacity-70'
                    : 'bg-white dark:bg-slate-905 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-xs text-slate-700 dark:text-slate-200">{pat.name}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">({pat.points} pts)</span>
                  </div>
                  {hasBeenClaimed && (
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 animate-pulse">
                      Won by {winner.playerName}
                    </p>
                  )}
                </div>

                {!hasBeenClaimed ? (
                  <button
                    onClick={() => claimPattern(pat.key)}
                    disabled={!player?.ticket}
                    className="px-3.5 py-1.5 text-[10px] font-bold rounded-lg uppercase tracking-wider bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white shadow-sm transition-all active:scale-95 disabled:opacity-50 focus:outline-none"
                  >
                    Claim
                  </button>
                ) : (
                  <span className="p-1 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full">
                    <FiCheck className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
