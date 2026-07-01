import React from 'react';
import { useGame } from '../context/GameContext';
import { motion } from 'framer-motion';

export default function TambolaTicket() {
  const { room, player, markedNumbers, toggleMarkNumber } = useGame();

  if (!player || !player.ticket) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-850">
        <p className="text-slate-500 dark:text-slate-400 text-sm">No ticket assigned yet. Wait for the game to start.</p>
      </div>
    );
  }

  const calledSet = new Set(room?.calledNumbers || []);
  const ticketData = player.ticket; // 3x9 nested array

  return (
    <div className="flex flex-col space-y-3">
      {/* Ticket Container */}
      <div className="relative glass-panel rounded-3xl p-3 sm:p-5 border border-slate-200/60 dark:border-slate-800/50 shadow-2xl bg-gradient-to-r from-slate-50 to-indigo-50/20 dark:from-slate-950 dark:to-slate-900/60">
        {/* Ticket Header Banner */}
        <div className="flex justify-between items-center mb-3 px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            OFFICIAL TAMBOLA TICKET
          </span>
          <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold rounded">
            ID: {player.name}
          </span>
        </div>

        {/* 3x9 Ticket Grid */}
        <div className="grid grid-rows-3 gap-1.5 sm:gap-2">
          {ticketData.map((row, rIndex) => (
            <div key={rIndex} className="grid grid-cols-9 gap-1.5 sm:gap-2">
              {row.map((cell, cIndex) => {
                const isNumber = cell !== null;
                const isCalled = isNumber && calledSet.has(Number(cell));
                const isMarked = isNumber && markedNumbers.some(n => Number(n) === Number(cell));

                return (
                  <div
                    key={cIndex}
                    onClick={() => isNumber && toggleMarkNumber(cell)}
                    className={`
                      aspect-square sm:aspect-[4/3] flex items-center justify-center relative rounded-xl border text-sm sm:text-lg font-bold select-none transition-all duration-200
                      ${
                        isNumber
                          ? 'cursor-pointer hover:scale-105 active:scale-95 shadow-sm'
                          : 'bg-slate-100/40 dark:bg-slate-950/30 border-slate-200/10 dark:border-slate-800/10'
                      }
                      ${
                        isNumber && !isMarked
                          ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                          : ''
                      }
                      ${
                        isMarked
                          ? 'bg-gradient-to-br from-cyan-400 to-indigo-650 dark:from-cyan-400 dark:to-indigo-500 border-cyan-300 dark:border-cyan-400 text-white shadow-lg shadow-cyan-500/30 font-black'
                          : ''
                      }
                    `}
                  >
                    {isNumber && (
                      <span className="relative z-10">{cell}</span>
                    )}

                    {/* Manual Dabber Stamp Overlay Indicator */}
                    {isMarked && (
                      <div className="absolute inset-0.5 sm:inset-1 rounded-full border border-white/20 pointer-events-none" />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      {/* Instructions */}
      <div className="flex justify-center items-center text-[10px] text-slate-400 dark:text-slate-500 px-2">
        <div className="flex items-center space-x-1.5">
          <div className="w-3 h-3 rounded bg-gradient-to-br from-cyan-400 to-indigo-500" />
          <span>Marked / Dabbed Numbers (Cyan Glow)</span>
        </div>
      </div>
    </div>
  );
}
