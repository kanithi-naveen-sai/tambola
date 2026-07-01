import React from 'react';
import { useGame } from '../context/GameContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import { motion } from 'framer-motion';
import { FiHome, FiRotateCcw, FiAward, FiCheck, FiStar } from 'react-icons/fi';

export default function Summary() {
  const { room, player, restartGame, leaveRoom } = useGame();
  const { theme } = useTheme();

  if (!room || !player) return null;

  const isHost = player.isHost;

  // Find the overall winner (player with the highest score)
  const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);
  const overallWinner = sortedPlayers[0];

  const categories = [
    { key: 'earlyFive', name: 'Early Five', points: 10 },
    { key: 'topRow', name: 'Top Row', points: 20 },
    { key: 'middleRow', name: 'Middle Row', points: 20 },
    { key: 'bottomRow', name: 'Bottom Row', points: 20 },
    { key: 'fullHouse', name: 'Full House', points: 50 }
  ];

  return (
    <div className={`min-h-screen p-4 sm:p-6 transition-colors duration-300 ${
      theme === 'dark' ? 'bg-mesh-dark' : 'bg-mesh-light'
    }`}>
      {/* Summary Header */}
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-slate-850 dark:text-white">
          Game <span className="text-indigo-600 dark:text-indigo-400">Recap</span>
        </h1>
        <ThemeToggle />
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: Champions and Winners Banner */}
        <div className="space-y-6">
          {/* Winner Showcase Card */}
          {overallWinner && overallWinner.score > 0 ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-panel-heavy rounded-3xl p-6 text-center border-2 border-amber-500/35 relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-transparent to-transparent"
            >
              {/* Confetti-like stars */}
              <FiStar className="absolute top-4 left-4 text-amber-500 w-5 h-5 animate-pulse" />
              <FiStar className="absolute bottom-4 right-4 text-amber-500 w-4 h-4 animate-bounce-slow" />
              
              <div className="inline-flex p-4 bg-amber-500 text-white rounded-full shadow-lg shadow-amber-500/20 mb-4 animate-bounce-slow">
                <FiAward className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white">Match Winner!</h2>
              <p className="text-3xl font-extrabold text-amber-500 mt-2">{overallWinner.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase font-bold tracking-wider">
                Highest Score: {overallWinner.score} Points
              </p>
            </motion.div>
          ) : (
            <div className="glass-panel rounded-3xl p-6 text-center">
              <div className="inline-flex p-4 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full mb-3">
                <FiAward className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-slate-700 dark:text-slate-350">Game Finished</h2>
              <p className="text-xs text-slate-550 dark:text-slate-450 mt-1">No claims were made or approved in this round.</p>
            </div>
          )}

          {/* Categories Claims Summary */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/40">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 flex items-center space-x-1.5">
              <span>Winning Categories Details</span>
            </h3>

            <div className="space-y-3">
              {categories.map((cat) => {
                const winnerInfo = room.winners[cat.key];
                return (
                  <div
                    key={cat.key}
                    className="flex justify-between items-center p-3 rounded-xl border border-slate-200/20 dark:border-slate-800/20 bg-slate-50/50 dark:bg-slate-900/10 text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-750 dark:text-slate-250 block">
                        {cat.name}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        Worth {cat.points} Points
                      </span>
                    </div>

                    {winnerInfo ? (
                      <div className="text-right">
                        <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold rounded">
                          {winnerInfo.playerName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-600 font-medium italic">
                        Not Claimed
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Final Standings and Actions */}
        <div className="space-y-6 flex flex-col h-full">
          {/* Final Standings Leaderboard */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/40 flex-1 flex flex-col">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-505 mb-4">
              Final Standings
            </h3>
            
            <div className="space-y-2 overflow-y-auto max-h-[300px] pr-1">
              {sortedPlayers.map((p, idx) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200/20 dark:border-slate-800/20 bg-slate-50/20 dark:bg-slate-900/10"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="font-extrabold text-[10px] w-5 text-slate-400 dark:text-slate-500 text-center">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-xs text-slate-750 dark:text-slate-250">
                      {p.name}
                    </span>
                  </div>
                  <span className="font-extrabold text-xs text-indigo-650 dark:text-indigo-400">
                    {p.score} pts
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Lobby Control Actions */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/40 grid grid-cols-2 gap-4">
            {isHost ? (
              <button
                onClick={restartGame}
                className="py-3 px-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-xl font-bold text-sm flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-500/10 active:scale-98 transition-all focus:outline-none"
              >
                <FiRotateCcw className="w-4 h-4" />
                <span>Play Again</span>
              </button>
            ) : (
              <div className="py-3 px-4 bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 rounded-xl font-bold text-xs flex items-center justify-center text-center cursor-not-allowed border border-slate-200/10 dark:border-slate-800/10">
                Waiting for Host...
              </div>
            )}
            
            <button
              onClick={leaveRoom}
              className="py-3 px-4 bg-slate-100 hover:bg-slate-250 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-sm flex items-center justify-center space-x-1.5 border border-slate-200 dark:border-slate-700 active:scale-98 transition-all focus:outline-none"
            >
              <FiHome className="w-4 h-4" />
              <span>Exit to Home</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
