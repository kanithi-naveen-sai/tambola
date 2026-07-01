const { v4: uuidv4 } = require('uuid');

// In-memory rooms repository
const rooms = new Map();

function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Ensure uniqueness
  if (rooms.has(code)) {
    return generateRoomCode();
  }
  return code;
}

const roomManager = {
  createRoom: (hostId, hostName) => {
    const code = generateRoomCode();
    const room = {
      code,
      hostId,
      hostName,
      state: 'LOBBY', // LOBBY, GAME, SUMMARY
      players: [
        {
          id: hostId,
          name: hostName,
          ready: true,
          ticket: null,
          score: 0,
          isHost: true
        }
      ],
      calledNumbers: [],
      currentNumber: null,
      isAutoCalling: false,
      remainingNumbers: Array.from({ length: 90 }, (_, i) => i + 1),
      claims: [],
      winners: {
        earlyFive: null,
        topRow: null,
        middleRow: null,
        bottomRow: null,
        fullHouse: null
      },
      messages: [
        {
          id: uuidv4(),
          sender: 'System',
          text: `Lobby created by ${hostName}. Room Code: ${code}`,
          timestamp: new Date().toISOString(),
          isSystem: true
        }
      ]
    };
    rooms.set(code, room);
    return room;
  },

  getRoom: (code) => {
    if (!code) return null;
    return rooms.get(code.toUpperCase());
  },

  getRoomByPlayerId: (playerId) => {
    for (const room of rooms.values()) {
      if (room.players.some(p => p.id === playerId)) {
        return room;
      }
    }
    return null;
  },

  joinRoom: (code, playerId, playerName) => {
    const room = roomManager.getRoom(code);
    if (!room) {
      return { error: 'Room not found.' };
    }

    if (room.state !== 'LOBBY') {
      return { error: 'Game has already started in this room.' };
    }

    const nameExists = room.players.some(
      p => p.name.toLowerCase() === playerName.toLowerCase()
    );
    if (nameExists) {
      return { error: 'Player name already taken in this room.' };
    }

    const newPlayer = {
      id: playerId,
      name: playerName,
      ready: false,
      ticket: null,
      score: 0,
      isHost: false
    };

    room.players.push(newPlayer);
    
    room.messages.push({
      id: uuidv4(),
      sender: 'System',
      text: `${playerName} joined the lobby.`,
      timestamp: new Date().toISOString(),
      isSystem: true
    });

    return { room };
  },

  toggleReady: (playerId) => {
    const room = roomManager.getRoomByPlayerId(playerId);
    if (!room) return null;

    const player = room.players.find(p => p.id === playerId);
    if (player && !player.isHost) {
      player.ready = !player.ready;
    }
    return room;
  },

  leaveRoom: (playerId) => {
    const room = roomManager.getRoomByPlayerId(playerId);
    if (!room) return null;

    const playerIndex = room.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return null;

    const player = room.players[playerIndex];
    room.players.splice(playerIndex, 1);

    // If host leaves, remove the room
    if (player.id === room.hostId) {
      if (room.autoCallTimer) {
        clearInterval(room.autoCallTimer);
      }
      rooms.delete(room.code);
      return { roomCode: room.code, wasHost: true, playersToNotify: room.players };
    }

    // Add system message
    room.messages.push({
      id: uuidv4(),
      sender: 'System',
      text: `${player.name} left the room.`,
      timestamp: new Date().toISOString(),
      isSystem: true
    });

    return { roomCode: room.code, wasHost: false, room };
  },

  addMessage: (roomCode, senderName, text) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) return null;

    const message = {
      id: uuidv4(),
      sender: senderName,
      text,
      timestamp: new Date().toISOString(),
      isSystem: false
    };
    room.messages.push(message);
    return message;
  },

  removeRoom: (code) => {
    const room = rooms.get(code.toUpperCase());
    if (room && room.autoCallTimer) {
      clearInterval(room.autoCallTimer);
    }
    rooms.delete(code.toUpperCase());
  }
};

module.exports = roomManager;
