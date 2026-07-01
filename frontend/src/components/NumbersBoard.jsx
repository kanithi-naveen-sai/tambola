import React from 'react';
import { useGame } from '../context/GameContext';
import { motion } from 'framer-motion';

export default function NumbersBoard() {
  const { room } = useGame();

  if (!room) return null;

  const calledSet = new Set(room.calledNumbers);
  const currentNumber = room.currentNumber;
  const totalCalled = room.calledNumbers.length;
  const remainingCount = 90 - totalCalled;

  // Generate 1-90 array
  const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1);

  // Get last 10 called numbers in reverse order (most recent first)
  const last10 = [...room.calledNumbers].reverse().slice(0, 10);

  return (
    <div className="flex flex-col space-y-4">
      {/* Metrics Banner */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-panel rounded-xl p-3 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Remaining</span>
          <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{remainingCount}</p>
        </div>
        <div className="glass-panel rounded-xl p-3 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Total Called</span>
          <p className="text-xl font-bold text-slate-700 dark:text-slate-300">{totalCalled} / 90</p>
        </div>
      </div>

      {/* Called Numbers Board (10 columns x 9 rows) */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-200/50 dark:border-slate-800/40">
        <div className="grid grid-cols-10 gap-1.5 sm:gap-2">
          {allNumbers.map((num) => {
            const isCalled = calledSet.has(num);
            const isCurrent = currentNumber === num;

            return (
              <div
                key={num}
                className={`
                  aspect-square flex items-center justify-center rounded-lg text-xs sm:text-sm font-bold border transition-all duration-200 select-none
                  ${
                    isCurrent
                      ? 'bg-amber-500 border-amber-300 text-white font-extrabold scale-110 shadow-md shadow-amber-500/40 z-10 animate-pulse'
                      : isCalled
                      ? 'bg-emerald-500/10 dark:bg-emerald-500/5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                      : 'bg-slate-100 dark:bg-slate-900/30 border-slate-200/10 dark:border-slate-800/10 text-slate-400 dark:text-slate-650'
                  }
                `}
              >
                {num}
              </div>
            );
          })}
        </div>
      </div>

      {/* Last 10 Called Numbers */}
      {last10.length > 0 && (
        <div className="glass-panel rounded-2xl p-4 border border-slate-200/50 dark:border-slate-800/40">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-2">
            Last 10 Numbers Called
          </span>
          <div className="flex flex-wrap gap-2 items-center">
            {last10.map((num, idx) => {
              const isFirst = idx === 0;
              return (
                <motion.div
                  key={`${num}-${idx}`}
                  initial={isFirst ? { scale: 0.6, opacity: 0 } : false}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border
                    ${
                      isFirst
                        ? 'bg-amber-500 border-amber-300 text-white w-9 h-9 text-sm shadow-md animate-bounce-slow'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-350'
                    }
                  `}
                >
                  {num}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
