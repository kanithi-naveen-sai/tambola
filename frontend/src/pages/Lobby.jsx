import React from 'react';
import { useGame } from '../context/GameContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import PlayerList from '../components/PlayerList';
import LobbyChat from '../components/LobbyChat';
import { toast } from 'react-hot-toast';
import { FiCopy, FiShare2, FiLogOut, FiPlay, FiCheckCircle } from 'react-icons/fi';

export default function Lobby() {
  const { room, player, toggleReady, startGame, leaveRoom } = useGame();
  const { theme } = useTheme();

  if (!room || !player) return null;

  const isHost = player.isHost;
  // Start game disabled if only the host is in the room
  const isStartDisabled = room.players.length < 2;

  const copyRoomCode = () => {
    navigator.clipboard.writeText(room.code);
    toast.success('Room code copied to clipboard!');
  };

  const shareRoomCode = () => {
    const shareText = `Join my Tambola Club room using code: ${room.code}`;
    if (navigator.share) {
      navigator.share({
        title: 'Tambola Club',
        text: shareText,
        url: window.location.href
      }).catch(err => console.log('Share error:', err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Room link copied to clipboard!');
    }
  };

  return (
    <div className={`min-h-screen p-4 sm:p-6 transition-colors duration-300 ${
      theme === 'dark' ? 'bg-mesh-dark' : 'bg-mesh-light'
    }`}>
      {/* Lobby Header */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            Waiting <span className="text-indigo-600 dark:text-indigo-400">Lobby</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Host: <span className="font-semibold text-slate-700 dark:text-slate-350">{room.hostName}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <ThemeToggle />
          <button
            onClick={leaveRoom}
            className="px-4 py-2 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30 rounded-xl text-sm font-semibold flex items-center space-x-1.5 hover:bg-rose-100 transition-colors"
          >
            <FiLogOut className="w-4 h-4" />
            <span>Leave Lobby</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Room details & Controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* Room Code Card */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/40">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-1">
              Room Code
            </span>
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {room.code}
              </span>
              <div className="flex space-x-1.5">
                <button
                  onClick={copyRoomCode}
                  className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-lg transition-colors focus:outline-none"
                  title="Copy Room Code"
                >
                  <FiCopy className="w-4 h-4" />
                </button>
                <button
                  onClick={shareRoomCode}
                  className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-lg transition-colors focus:outline-none"
                  title="Share Room Link"
                >
                  <FiShare2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Ready Status / Start Controls */}
            <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800/40">
              {isHost ? (
                <div className="space-y-3">
                  <button
                    onClick={startGame}
                    disabled={isStartDisabled}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center space-x-2 shadow-md shadow-indigo-500/10 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
                  >
                    <FiPlay className="w-4 h-4" />
                    <span>Start Game</span>
                  </button>
                  {isStartDisabled ? (
                    <p className="text-[10px] text-slate-450 dark:text-slate-500 text-center">
                      Need at least 1 other player to join.
                    </p>
                  ) : (
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 text-center font-semibold animate-pulse">
                      Ready to begin!
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={toggleReady}
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-sm transition-all focus:outline-none ${
                      player.ready
                        ? 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white shadow-emerald-500/10'
                        : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white shadow-indigo-500/10'
                    }`}
                  >
                    <FiCheckCircle className="w-4 h-4" />
                    <span>{player.ready ? 'Cancel Ready' : 'Mark Ready'}</span>
                  </button>
                  <p className="text-[10px] text-slate-450 dark:text-slate-505 text-center">
                    Waiting for Host to start the game...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Middle/Right Side: Player List & Lobby Chat */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <PlayerList />
          <LobbyChat />
        </div>
      </div>
    </div>
  );
}
