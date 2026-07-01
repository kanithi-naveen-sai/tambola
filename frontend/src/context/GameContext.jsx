import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const GameContext = createContext();

export function GameProvider({ children }) {
  const [room, setRoom] = useState(null);
  const [player, setPlayer] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [error, setError] = useState(null);
  const [markedNumbers, setMarkedNumbers] = useState([]);
  
  // Settings with LocalStorage persistence
  const [autoMark, setAutoMark] = useState(() => {
    return localStorage.getItem('tambola_auto_mark') === 'true';
  });
  const [voiceMuted, setVoiceMuted] = useState(() => {
    return localStorage.getItem('tambola_voice_muted') === 'true';
  });

  const socketRef = useRef(null);
  const navigate = useNavigate();
  
  // Speech queue refs
  const speakQueueRef = useRef([]);
  const isSpeakingRef = useRef(false);
  const lastAnnouncedRef = useRef(null);

  // Reset local state
  const resetLocalState = () => {
    setRoom(null);
    setPlayer(null);
    setMarkedNumbers([]);
    setError(null);
    lastAnnouncedRef.current = null;
    speakQueueRef.current = [];
    isSpeakingRef.current = false;
  };

  // Configure Socket connection
  const connectSocket = () => {
    if (socketRef.current && socketRef.current.connected) return socketRef.current;

    setConnectionStatus('connecting');

    const backendHost = "https://tambola-backend-rvk2.onrender.com";

    const socket = io(backendHost, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnectionStatus('connected');
      console.log('Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      setConnectionStatus('disconnected');
      toast.error('Disconnected from game server.');
      resetLocalState();
      navigate('/');
    });

    socket.on('connect_error', () => {
      setConnectionStatus('error');
      toast.error('Unable to connect to game server.');
    });

    // Room update broadcast
    socket.on('room:update', (updatedRoom) => {
      setRoom(updatedRoom);
      
      const localPlayer = updatedRoom.players.find(p => p.id === socket.id);
      if (localPlayer) {
        setPlayer(localPlayer);
      }
    });

    // Room closed broadcast (host left)
    socket.on('room:closed', (msg) => {
      toast.error(msg || 'Room closed.');
      resetLocalState();
      navigate('/');
    });

    // Error events
    socket.on('room:create-error', (msg) => {
      setError(msg);
      toast.error(msg);
    });

    socket.on('room:join-error', (msg) => {
      setError(msg);
      toast.error(msg);
    });

    socket.on('game:error', (msg) => {
      toast.error(msg, { duration: 4000 });
    });

    return socket;
  };

  // Actions
  const createRoom = (hostName) => {
    setError(null);
    const socket = connectSocket();
    socket.emit('room:create', { hostName });
  };

  const joinRoom = (roomCode, playerName) => {
    setError(null);
    const socket = connectSocket();
    socket.emit('room:join', { roomCode, playerName });
  };

  const toggleReady = () => {
    if (socketRef.current) {
      socketRef.current.emit('room:ready');
    }
  };

  const sendMessage = (text) => {
    if (socketRef.current && text.trim() !== '') {
      socketRef.current.emit('chat:send', { text });
    }
  };

  const startGame = () => {
    if (socketRef.current) {
      socketRef.current.emit('game:start');
    }
  };

  const drawNumber = () => {
    if (socketRef.current) {
      socketRef.current.emit('game:draw-number');
    }
  };

  const toggleAutoCall = (delay = 4000) => {
    if (socketRef.current) {
      socketRef.current.emit('game:toggle-auto-call', { delay });
    }
  };

  const claimPattern = (pattern) => {
    if (socketRef.current) {
      socketRef.current.emit('game:claim-pattern', { pattern, clientMarkedNumbers: markedNumbers });
    }
  };

  const selectTicket = (ticketIndex) => {
    if (socketRef.current) {
      socketRef.current.emit('game:select-ticket', { ticketIndex });
    }
  };

  const approveClaim = (claimId) => {
    if (socketRef.current) {
      socketRef.current.emit('game:approve-claim', { claimId });
    }
  };

  const rejectClaim = (claimId) => {
    if (socketRef.current) {
      socketRef.current.emit('game:reject-claim', { claimId });
    }
  };

  const endGame = () => {
    if (socketRef.current) {
      socketRef.current.emit('game:end');
    }
  };

  const restartGame = () => {
    if (socketRef.current) {
      setMarkedNumbers([]);
      socketRef.current.emit('game:restart');
    }
  };

  const leaveRoom = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    resetLocalState();
    navigate('/');
  };

  const toggleMarkNumber = (num) => {
    if (num === null) return;
    const val = Number(num);
    setMarkedNumbers(prev => {
      const prevNumeric = prev.map(Number);
      return prevNumeric.includes(val)
        ? prevNumeric.filter(n => n !== val)
        : [...prevNumeric, val];
    });
  };

  const toggleAutoMark = () => {
    setAutoMark(prev => !prev);
  };

  const toggleVoiceMute = () => {
    setVoiceMuted(prev => !prev);
  };

  // Sync settings preferences to LocalStorage
  useEffect(() => {
    localStorage.setItem('tambola_auto_mark', autoMark);
  }, [autoMark]);

  useEffect(() => {
    localStorage.setItem('tambola_voice_muted', voiceMuted);
    
    // Immediately terminate any active speech if muted
    if (voiceMuted && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      speakQueueRef.current = [];
      isSpeakingRef.current = false;
    }
  }, [voiceMuted]);

  // AUTO MARK LOGIC: Automatically dabs drawn numbers if auto-mark toggle is active
  useEffect(() => {
    if (!autoMark) return;
    if (player?.ticket && room?.calledNumbers) {
      const calledSet = new Set(room.calledNumbers.map(Number));
      const matchedNums = [];
      player.ticket.forEach(row => {
        row.forEach(cell => {
          if (cell !== null && calledSet.has(Number(cell))) {
            matchedNums.push(Number(cell));
          }
        });
      });
      
      setMarkedNumbers(prev => {
        const prevNumeric = prev.map(Number);
        const union = new Set([...prevNumeric, ...matchedNums]);
        return Array.from(union);
      });
    }
  }, [autoMark, room?.calledNumbers, player?.ticket]);

  // VOICE ANNOUNCEMENT ENGINE (Web Speech API queue handler)
  const processSpeakQueue = () => {
    if (isSpeakingRef.current || speakQueueRef.current.length === 0) return;
    
    isSpeakingRef.current = true;
    const nextUtterance = speakQueueRef.current.shift();
    window.speechSynthesis.speak(nextUtterance);
  };

  const queueVoiceAnnouncement = (num) => {
    if (!('speechSynthesis' in window) || voiceMuted) return;

    // Speak format matches: 6 -> "Number Six", 24 -> "Twenty Four"
    const text = num < 10 ? `Number ${num}` : `${num}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0; // Standard speech speed

    utterance.onend = () => {
      isSpeakingRef.current = false;
      processSpeakQueue();
    };

    utterance.onerror = () => {
      isSpeakingRef.current = false;
      processSpeakQueue();
    };

    speakQueueRef.current.push(utterance);
    processSpeakQueue();
  };

  // Detect and play newly called numbers
  useEffect(() => {
    if (room?.currentNumber !== null && room?.currentNumber !== undefined) {
      if (room.currentNumber !== lastAnnouncedRef.current) {
        lastAnnouncedRef.current = room.currentNumber;
        queueVoiceAnnouncement(room.currentNumber);
      }
    } else {
      lastAnnouncedRef.current = null;
    }
  }, [room?.currentNumber]);

  // Cleanup synthesis on context teardown
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // MOBILE VOICE ANNOUNCEMENTS UNLOCK TRICK
  useEffect(() => {
    const unlockSpeech = () => {
      if ('speechSynthesis' in window) {
        // Speak a silent empty string to initialize context on mobile touch/click
        const u = new SpeechSynthesisUtterance('');
        window.speechSynthesis.speak(u);
        console.log("SpeechSynthesis audio context unlocked");
      }
      window.removeEventListener('click', unlockSpeech);
      window.removeEventListener('touchstart', unlockSpeech);
    };

    window.addEventListener('click', unlockSpeech);
    window.addEventListener('touchstart', unlockSpeech);

    return () => {
      window.removeEventListener('click', unlockSpeech);
      window.removeEventListener('touchstart', unlockSpeech);
    };
  }, []);

  // Clean up ticket marks when starting/restarting a match
  useEffect(() => {
    if (room?.state === 'LOBBY' || room?.state === 'TICKET_SELECTION') {
      setMarkedNumbers([]);
    }
  }, [room?.state]);

  return (
    <GameContext.Provider value={{
      room,
      player,
      connectionStatus,
      error,
      markedNumbers,
      autoMark,
      voiceMuted,
      createRoom,
      joinRoom,
      toggleReady,
      sendMessage,
      startGame,
      drawNumber,
      toggleAutoCall,
      claimPattern,
      approveClaim,
      rejectClaim,
      endGame,
      restartGame,
      leaveRoom,
      toggleMarkNumber,
      toggleAutoMark,
      toggleVoiceMute,
      selectTicket
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
