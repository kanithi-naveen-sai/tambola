const roomManager = require('../rooms/roomManager');
const gameEngine = require('../game/gameEngine');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Create a new room (Host)
    socket.on('room:create', ({ hostName }) => {
      try {
        if (!hostName || hostName.trim() === '') {
          return socket.emit('room:create-error', 'Name is required.');
        }
        const room = roomManager.createRoom(socket.id, hostName.trim());
        socket.join(room.code);
        socket.emit('room:update', room);
        console.log(`Room created: ${room.code} by Host ${hostName}`);
      } catch (err) {
        console.error('Error creating room:', err);
        socket.emit('room:create-error', 'Failed to create room.');
      }
    });

    // Join an existing room (Player)
    socket.on('room:join', ({ roomCode, playerName }) => {
      try {
        if (!roomCode || roomCode.trim() === '') {
          return socket.emit('room:join-error', 'Room code is required.');
        }
        if (!playerName || playerName.trim() === '') {
          return socket.emit('room:join-error', 'Name is required.');
        }

        const res = roomManager.joinRoom(roomCode.trim(), socket.id, playerName.trim());
        if (res.error) {
          return socket.emit('room:join-error', res.error);
        }

        const room = res.room;
        socket.join(room.code);
        io.to(room.code).emit('room:update', room);
        console.log(`Player ${playerName} joined room ${room.code}`);
      } catch (err) {
        console.error('Error joining room:', err);
        socket.emit('room:join-error', 'Failed to join room.');
      }
    });

    // Ready state toggle (Lobby)
    socket.on('room:ready', () => {
      try {
        const room = roomManager.toggleReady(socket.id);
        if (room) {
          io.to(room.code).emit('room:update', room);
        }
      } catch (err) {
        console.error('Error toggling ready:', err);
      }
    });

    // Chat Message
    socket.on('chat:send', ({ text }) => {
      try {
        const room = roomManager.getRoomByPlayerId(socket.id);
        if (!room) return;

        const player = room.players.find(p => p.id === socket.id);
        if (!player) return;

        const msg = roomManager.addMessage(room.code, player.name, text);
        if (msg) {
          // Emit just the message or the entire room state. 
          // Re-broadcasting the full room updates everything in real time.
          io.to(room.code).emit('room:update', room);
        }
      } catch (err) {
        console.error('Error in chat:', err);
      }
    });

    // Start Game (Host only)
    socket.on('game:start', () => {
      try {
        const room = roomManager.getRoomByPlayerId(socket.id);
        if (!room) return;

        if (room.hostId !== socket.id) {
          return socket.emit('game:error', 'Only the host can start the game.');
        }

        const updatedRoom = gameEngine.startGame(room);
        io.to(room.code).emit('room:update', updatedRoom);
        console.log(`Game started in room ${room.code}`);
      } catch (err) {
        console.error('Error starting game:', err);
      }
    });

    // Draw Next Number (Host only)
    socket.on('game:draw-number', () => {
      try {
        const room = roomManager.getRoomByPlayerId(socket.id);
        if (!room) return;

        if (room.hostId !== socket.id) {
          return socket.emit('game:error', 'Only the host can call numbers.');
        }

        const num = gameEngine.drawNumber(room);
        if (num !== null) {
          io.to(room.code).emit('room:update', room);
        } else {
          socket.emit('game:error', 'All numbers have been called!');
        }
      } catch (err) {
        console.error('Error drawing number:', err);
      }
    });

    // Toggle Auto Call (Host only)
    socket.on('game:toggle-auto-call', ({ delay = 4000 }) => {
      try {
        const room = roomManager.getRoomByPlayerId(socket.id);
        if (!room) return;

        if (room.hostId !== socket.id) {
          return socket.emit('game:error', 'Only the host can configure auto calling.');
        }

        if (room.autoCallTimer) {
          // Pause Auto Call
          clearInterval(room.autoCallTimer);
          room.autoCallTimer = null;
          room.isAutoCalling = false;
          
          room.messages.push({
            id: require('uuid').v4(),
            sender: 'System',
            text: 'Host paused automatic number calling.',
            timestamp: new Date().toISOString(),
            isSystem: true
          });
          io.to(room.code).emit('room:update', room);
        } else {
          // Resume Auto Call
          room.isAutoCalling = true;
          room.messages.push({
            id: require('uuid').v4(),
            sender: 'System',
            text: `Host started automatic number calling (every ${delay / 1000}s).`,
            timestamp: new Date().toISOString(),
            isSystem: true
          });
          
          // Draw first number immediately if not already done, or just start interval
          const firstDraw = gameEngine.drawNumber(room);
          io.to(room.code).emit('room:update', room);

          if (room.remainingNumbers.length > 0) {
            room.autoCallTimer = setInterval(() => {
              const num = gameEngine.drawNumber(room);
              if (num === null) {
                clearInterval(room.autoCallTimer);
                room.autoCallTimer = null;
                room.isAutoCalling = false;
                room.messages.push({
                  id: require('uuid').v4(),
                  sender: 'System',
                  text: 'All 90 numbers have been called!',
                  timestamp: new Date().toISOString(),
                  isSystem: true
                });
              }
              io.to(room.code).emit('room:update', room);
            }, delay);
          }
        }
      } catch (err) {
        console.error('Error toggling auto call:', err);
      }
    });

    // Player claims a pattern
    socket.on('game:claim-pattern', ({ pattern, clientMarkedNumbers }) => {
      try {
        const room = roomManager.getRoomByPlayerId(socket.id);
        if (!room) return;

        const res = gameEngine.claimPattern(room, socket.id, pattern, clientMarkedNumbers);
        if (res.error) {
          return socket.emit('game:error', res.error);
        }

        io.to(room.code).emit('room:update', room);
        console.log(`Claim submitted in room ${room.code} for ${pattern} by player ${socket.id}`);
      } catch (err) {
        console.error('Error claiming pattern:', err);
      }
    });

    // Player selects a ticket (TICKET_SELECTION phase)
    socket.on('game:select-ticket', ({ ticketIndex }) => {
      try {
        const room = roomManager.getRoomByPlayerId(socket.id);
        if (!room) return;

        const updatedRoom = gameEngine.selectTicket(room, socket.id, ticketIndex);
        io.to(room.code).emit('room:update', updatedRoom);
        console.log(`Player ${socket.id} selected ticket index ${ticketIndex} in room ${room.code}`);
      } catch (err) {
        console.error('Error selecting ticket:', err);
      }
    });

    // Approve claim (Host only)
    socket.on('game:approve-claim', ({ claimId }) => {
      try {
        const room = roomManager.getRoomByPlayerId(socket.id);
        if (!room) return;

        if (room.hostId !== socket.id) {
          return socket.emit('game:error', 'Only the host can approve claims.');
        }

        const res = gameEngine.approveClaim(room, claimId);
        if (res.error) {
          return socket.emit('game:error', res.error);
        }

        io.to(room.code).emit('room:update', room);
        console.log(`Host approved claim ${claimId}`);
      } catch (err) {
        console.error('Error approving claim:', err);
      }
    });

    // Reject claim (Host only)
    socket.on('game:reject-claim', ({ claimId }) => {
      try {
        const room = roomManager.getRoomByPlayerId(socket.id);
        if (!room) return;

        if (room.hostId !== socket.id) {
          return socket.emit('game:error', 'Only the host can reject claims.');
        }

        const res = gameEngine.rejectClaim(room, claimId);
        if (res.error) {
          return socket.emit('game:error', res.error);
        }

        io.to(room.code).emit('room:update', room);
        console.log(`Host rejected claim ${claimId}`);
      } catch (err) {
        console.error('Error rejecting claim:', err);
      }
    });

    // End Game (Host only)
    socket.on('game:end', () => {
      try {
        const room = roomManager.getRoomByPlayerId(socket.id);
        if (!room) return;

        if (room.hostId !== socket.id) {
          return socket.emit('game:error', 'Only the host can end the game.');
        }

        const updatedRoom = gameEngine.endGame(room);
        io.to(room.code).emit('room:update', updatedRoom);
        console.log(`Game ended in room ${room.code}`);
      } catch (err) {
        console.error('Error ending game:', err);
      }
    });

    // Restart Game/Lobby (Host only)
    socket.on('game:restart', () => {
      try {
        const room = roomManager.getRoomByPlayerId(socket.id);
        if (!room) return;

        if (room.hostId !== socket.id) {
          return socket.emit('game:error', 'Only the host can restart the lobby.');
        }

        const updatedRoom = gameEngine.restartGame(room);
        io.to(room.code).emit('room:update', updatedRoom);
        console.log(`Game restarted/reset in room ${room.code}`);
      } catch (err) {
        console.error('Error restarting game:', err);
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      try {
        console.log(`Socket disconnected: ${socket.id}`);
        const leaveRes = roomManager.leaveRoom(socket.id);

        if (leaveRes) {
          const { roomCode, wasHost, playersToNotify, room } = leaveRes;
          
          if (wasHost) {
            console.log(`Host disconnected. Closing room ${roomCode}`);
            // Notify players remaining in the room that the game has ended due to host leaving
            playersToNotify.forEach(p => {
              io.to(p.id).emit('room:closed', 'Host disconnected. Game ended.');
            });
          } else {
            console.log(`Player disconnected. Updating room ${roomCode}`);
            io.to(roomCode).emit('room:update', room);
          }
        }
      } catch (err) {
        console.error('Error during client disconnect:', err);
      }
    });
  });
};
