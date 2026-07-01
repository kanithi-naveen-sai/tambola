import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { FiSend } from 'react-icons/fi';

export default function LobbyChat() {
  const { room, player, sendMessage } = useGame();
  const [text, setText] = useState('');
  const chatContainerRef = useRef(null);

  const handleSend = (e) => {
    e.preventDefault();
    if (text.trim() === '') return;
    sendMessage(text);
    setText('');
  };

  // Auto-scroll to bottom of chat container locally (suppress on drawing system calls during game)
  useEffect(() => {
    if (chatContainerRef.current && room?.messages) {
      const messages = room.messages;
      if (messages.length === 0) return;
      const lastMsg = messages[messages.length - 1];
      
      const isDrawingSystemMsg = lastMsg?.isSystem && 
        (lastMsg?.text?.includes('called') || lastMsg?.text?.includes('Called'));
      
      if (room.state === 'LOBBY' || !isDrawingSystemMsg) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }
  }, [room?.messages, room?.state]);

  if (!room) return null;

  return (
    <div className="flex flex-col h-[350px] glass-panel rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/40">
      {/* Chat Header */}
      <div className="px-4 py-3 bg-slate-100/50 dark:bg-slate-900/50 border-b border-slate-200/50 dark:border-slate-800/40">
        <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-200">Room Chat</h3>
      </div>

      {/* Chat Messages */}
      <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-3">
        {room.messages.map((msg) => {
          if (msg.isSystem) {
            return (
              <div key={msg.id} className="flex justify-center">
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs rounded-full border border-slate-200/30 dark:border-slate-700/20 text-center max-w-[90%]">
                  {msg.text}
                </span>
              </div>
            );
          }

          const isMe = player && player.name === msg.sender;
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center space-x-1.5 mb-0.5">
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                  {msg.sender}
                </span>
                <span className="text-[9px] text-slate-300 dark:text-slate-600">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div
                className={`px-3 py-1.5 rounded-2xl text-sm max-w-[80%] break-all ${
                  isMe
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/30 dark:border-slate-700/20'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-200/50 dark:border-slate-800/40 flex items-center space-x-2 bg-slate-50/50 dark:bg-slate-900/30">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          maxLength={150}
          className="flex-1 px-3.5 py-1.5 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-slate-800 dark:text-slate-150"
        />
        <button
          type="submit"
          disabled={text.trim() === ''}
          className="p-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-xl disabled:opacity-50 transition-colors shadow-md focus:outline-none"
        >
          <FiSend className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
