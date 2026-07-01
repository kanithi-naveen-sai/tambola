import React, { useState } from 'react';
import { Routes, Route, useParams, Navigate } from 'react-router-dom';
import { useGame } from './context/GameContext';
import { useTheme } from './context/ThemeContext';
import Home from './pages/Home';
import Lobby from './pages/Lobby';
import TicketSelection from './pages/TicketSelection';
import Game from './pages/Game';
import Summary from './pages/Summary';
import ThemeToggle from './components/ThemeToggle';
import { Toaster } from 'react-hot-toast';

function RoomContainer() {
  const { code } = useParams();
  const { room, player, joinRoom } = useGame();
  const { theme } = useTheme();
  const [name, setName] = useState('');

  // If no room is active (e.g., page refresh or direct link), prompt the user to enter their name
  if (!room || !player) {
    return (
      <div className={`min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors duration-300 ${
        theme === 'dark' ? 'bg-mesh-dark' : 'bg-mesh-light'
      }`}>
        <div className="absolute top-6 right-6 font-bold z-20">
          <ThemeToggle />
        </div>

        <div className="glass-panel-heavy rounded-3xl p-6 sm:p-8 max-w-md w-full text-center relative z-10">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-500/10 rounded-2xl text-2xl mb-3">
            🎟️
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-1">Enter Lobby</h2>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider mb-6">
            Joining Room: {code}
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim()) {
                joinRoom(code, name);
              }
            }}
            className="space-y-4 text-left"
          >
            <div>
              <label htmlFor="directName" className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-2">
                Your Player Name
              </label>
              <input
                id="directName"
                type="text"
                placeholder="Enter Player Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={15}
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-550 font-semibold"
              />
            </div>
            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-2xl shadow-md transition-all active:scale-98 disabled:opacity-50"
            >
              Join Game Room
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Switch pages dynamically depending on the current room state
  if (room.state === 'LOBBY') {
    return <Lobby />;
  }
  if (room.state === 'TICKET_SELECTION') {
    return <TicketSelection />;
  }
  if (room.state === 'GAME') {
    return <Game />;
  }
  if (room.state === 'SUMMARY') {
    return <Summary />;
  }

  return <Navigate to="/" replace />;
}

export default function App() {
  const { theme } = useTheme();

  return (
    <>
      {/* Toast Notification Provider */}
      <Toaster
        position="top-center"
        toastOptions={{
          className: 'glass-panel text-sm font-semibold rounded-2xl px-4 py-3 shadow-xl',
          style: {
            background: theme === 'dark' ? '#0f172a' : '#ffffff',
            color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
            border: theme === 'dark' ? '1px solid rgba(51, 65, 85, 0.5)' : '1px solid rgba(226, 232, 240, 0.8)',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:code" element={<RoomContainer />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
