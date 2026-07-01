const { v4: uuidv4 } = require('uuid');
const ticketValidator = require('../utils/ticketValidator');

// Helper to shuffle an array (Fisher-Yates)
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Generate a valid Tambola ticket (3x9 grid, 15 numbers, 5 per row, ascending cols)
function generateTicket() {
  let ticket = null;
  let colsCount = Array(9).fill(0);
  let positions = [];
  
  while (true) {
    positions = [
      Array(9).fill(false),
      Array(9).fill(false),
      Array(9).fill(false)
    ];
    colsCount.fill(0);
    
    for (let r = 0; r < 3; r++) {
      let colsSelected = 0;
      while (colsSelected < 5) {
        const col = Math.floor(Math.random() * 9);
        if (!positions[r][col]) {
          positions[r][col] = true;
          colsCount[col]++;
          colsSelected++;
        }
      }
    }
    
    const isValid = colsCount.every(count => count >= 1 && count <= 3);
    if (isValid) {
      break;
    }
  }

  ticket = [
    Array(9).fill(null),
    Array(9).fill(null),
    Array(9).fill(null)
  ];

  for (let col = 0; col < 9; col++) {
    const minVal = col === 0 ? 1 : col * 10;
    const maxVal = col === 8 ? 90 : col * 10 + 9;
    
    const activeRows = [];
    for (let r = 0; r < 3; r++) {
      if (positions[r][col]) {
        activeRows.push(r);
      }
    }
    
    const k = activeRows.length;
    const numbersPool = [];
    for (let i = minVal; i <= maxVal; i++) {
      numbersPool.push(i);
    }
    
    const selectedNums = [];
    for (let i = 0; i < k; i++) {
      const idx = Math.floor(Math.random() * numbersPool.length);
      selectedNums.push(numbersPool.splice(idx, 1)[0]);
    }
    
    selectedNums.sort((a, b) => a - b);
    
    activeRows.forEach((r, index) => {
      ticket[r][col] = selectedNums[index];
    });
  }

  return ticket;
}

const gameEngine = {
  startGame: (room) => {
    room.state = 'TICKET_SELECTION';
    room.calledNumbers = [];
    room.currentNumber = null;
    room.claims = [];
    room.winners = {
      earlyFive: null,
      fourCorners: null,
      topRow: null,
      middleRow: null,
      bottomRow: null,
      fullHouse: null
    };

    // Purge old chat history for the new game session
    room.messages = [
      {
        id: uuidv4(),
        sender: 'System',
        text: 'Game started. Please select one of the 5 generated tickets.',
        timestamp: new Date().toISOString(),
        isSystem: true
      }
    ];

    // Generate 5 ticket choices for each player
    room.players.forEach(player => {
      player.ticketOptions = [
        generateTicket(),
        generateTicket(),
        generateTicket(),
        generateTicket(),
        generateTicket()
      ];
      player.ticket = null;
      player.ticketSelected = false;
      player.score = 0;
    });

    return room;
  },

  selectTicket: (room, playerId, ticketIndex) => {
    const player = room.players.find(p => p.id === playerId);
    if (!player || !player.ticketOptions || ticketIndex < 0 || ticketIndex > 4) {
      return room;
    }

    player.ticket = player.ticketOptions[ticketIndex];
    player.ticketSelected = true;

    room.messages.push({
      id: uuidv4(),
      sender: 'System',
      text: `${player.name} has selected their ticket.`,
      timestamp: new Date().toISOString(),
      isSystem: true
    });

    // Check if everyone has chosen their ticket
    const allSelected = room.players.every(p => p.ticketSelected);
    if (allSelected) {
      room.state = 'GAME';

      // Initialize drawing pool
      const numbersPool = Array.from({ length: 90 }, (_, i) => i + 1);
      room.remainingNumbers = shuffle(numbersPool);

      room.messages.push({
        id: uuidv4(),
        sender: 'System',
        text: 'All players have selected their tickets. Let the match begin!',
        timestamp: new Date().toISOString(),
        isSystem: true
      });
    }

    return room;
  },

  drawNumber: (room) => {
    if (room.remainingNumbers.length === 0) {
      return null;
    }

    const nextNum = room.remainingNumbers.pop();
    room.currentNumber = nextNum;
    room.calledNumbers.push(nextNum);

    return nextNum;
  },

  claimPattern: (room, playerId, pattern, clientMarkedNumbers) => {
    const player = room.players.find(p => p.id === playerId);
    if (!player) {
      return { error: 'Player not found in this room.' };
    }

    // Check if category is already won
    if (room.winners[pattern]) {
      return { error: `The pattern "${pattern === 'topRow' ? 'Top Line' : pattern === 'middleRow' ? 'Middle Line' : pattern === 'bottomRow' ? 'Bottom Line' : pattern === 'fourCorners' ? 'Four Corners' : pattern === 'earlyFive' ? 'Early Five' : 'Full House'}" has already been claimed.` };
    }

    // Verify claim details (using marked numbers sent by client)
    const validation = ticketValidator.validate(player.ticket, room.calledNumbers, clientMarkedNumbers || [], pattern);

    if (!validation.isValid) {
      // Log rejected claim
      const newClaim = {
        id: uuidv4(),
        playerId,
        playerName: player.name,
        pattern,
        status: 'rejected',
        ticket: player.ticket,
        isValid: false,
        error: validation.error,
        timestamp: new Date().toISOString()
      };
      room.claims.push(newClaim);
      return { error: validation.error };
    }

    const pointsMap = {
      earlyFive: 10,
      fourCorners: 20,
      topRow: 20,
      middleRow: 20,
      bottomRow: 20,
      fullHouse: 50
    };
    const pts = pointsMap[pattern] || 0;

    const newClaim = {
      id: uuidv4(),
      playerId,
      playerName: player.name,
      pattern,
      status: 'approved',
      ticket: player.ticket,
      isValid: true,
      timestamp: new Date().toISOString()
    };
    
    room.claims.push(newClaim);

    // Record winner
    room.winners[pattern] = {
      playerId,
      playerName: player.name,
      timestamp: newClaim.timestamp,
      scoreGained: pts
    };

    player.score += pts;

    const patternLabels = {
      earlyFive: 'Early Five',
      fourCorners: 'Four Corners',
      topRow: 'Top Line',
      middleRow: 'Middle Line',
      bottomRow: 'Bottom Line',
      fullHouse: 'Full House'
    };

    room.messages.push({
      id: uuidv4(),
      sender: 'System',
      text: `${player.name} claimed and WON "${patternLabels[pattern]}" (+${pts} points)!`,
      timestamp: new Date().toISOString(),
      isSystem: true
    });

    // If Full House is successfully claimed, stop calling and transition directly to scoreboard
    if (pattern === 'fullHouse') {
      if (room.autoCallTimer) {
        clearInterval(room.autoCallTimer);
        room.autoCallTimer = null;
      }
      room.isAutoCalling = false;
      room.state = 'SUMMARY';
      room.players.sort((a, b) => b.score - a.score);

      room.messages.push({
        id: uuidv4(),
        sender: 'System',
        text: 'Full House claimed! Game complete! Redirecting to scoreboard...',
        timestamp: new Date().toISOString(),
        isSystem: true
      });
    }

    return { claim: newClaim, isValid: true };
  },

  approveClaim: (room, claimId) => {
    return { error: 'Claims are automatically approved by the server.' };
  },

  rejectClaim: (room, claimId) => {
    return { error: 'Claims are automatically verified by the server.' };
  },

  endGame: (room) => {
    room.state = 'SUMMARY';
    
    if (room.autoCallTimer) {
      clearInterval(room.autoCallTimer);
      room.autoCallTimer = null;
    }

    room.players.sort((a, b) => b.score - a.score);

    room.messages.push({
      id: uuidv4(),
      sender: 'System',
      text: 'Game ended by Host. Returning to scoreboard.',
      timestamp: new Date().toISOString(),
      isSystem: true
    });

    return room;
  },

  restartGame: (room) => {
    room.state = 'LOBBY';
    room.calledNumbers = [];
    room.currentNumber = null;
    room.claims = [];
    room.winners = {
      earlyFive: null,
      fourCorners: null,
      topRow: null,
      middleRow: null,
      bottomRow: null,
      fullHouse: null
    };

    // Purge chat history on restart
    room.messages = [
      {
        id: uuidv4(),
        sender: 'System',
        text: 'Host restarted the lobby. New tickets will be issued.',
        timestamp: new Date().toISOString(),
        isSystem: true
      }
    ];
    
    room.players.forEach(p => {
      p.ticket = null;
      p.ticketOptions = [];
      p.ticketSelected = false;
      p.score = 0;
      p.ready = p.isHost;
    });

    return room;
  }
};

module.exports = gameEngine;
