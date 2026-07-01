# 🎟️ Real-Time Multiplayer Tambola (Housie) Web Application

A modern, responsive, real-time multiplayer Tambola (Housie) web application built from scratch using a Node.js/Express backend, Socket.IO, and a React (Vite) frontend styled with Tailwind CSS. Perfect as a final-year college project.

---

## 🏗️ Architecture Diagram

```mermaid
graph TD
    subgraph Client [React Frontend - Vite + Tailwind]
        UI[User Interface - Outfit Font]
        GC[GameContext - State Management]
        TC[ThemeContext - Dark/Light Theme]
        SC[Socket.IO Client]
        UI --> GC
        UI --> TC
        GC --> SC
    end

    subgraph Server [Node.js Backend - Express + Socket.IO]
        SIO[Socket.IO Server]
        RM[Room Manager - In-Memory State]
        GE[Game Engine - Drawing / Tickets]
        TV[Ticket Validator - Claims Validation]
        SIO --> RM
        SIO --> GE
        GE --> TV
    end

    SC <-->|WebSocket Real-Time Events| SIO
```

---

## 📁 Folder Structure

```
Tambola/
  ├── backend/
  │    ├── index.js                     # Entry point (Server + Socket init)
  │    ├── package.json                 # Backend dependencies & scripts
  │    ├── server/
  │    │    └── app.js                  # Express middleware & routes
  │    ├── socket/
  │    │    └── socketHandler.js        # Socket.IO connection & event routing
  │    ├── rooms/
  │    │    └── roomManager.js          # Room registry & chat stores (In-Memory)
  │    ├── game/
  │    │    └── gameEngine.js           # Core loops & ticket generator
  │    └── utils/
  │         └── ticketValidator.js      # Pattern claim validation rules
  ├── frontend/
  │    ├── package.json                 # Frontend dependencies & scripts
  │    ├── tailwind.config.js           # Tailwind customization settings
  │    ├── postcss.config.js            # PostCSS plugin configurations
  │    ├── vite.config.js               # Dev server configuration and proxy routes
  │    ├── index.html                   # HTML template (responsive viewports & Google Fonts)
  │    └── src/
  │         ├── main.jsx                # React mount point & providers wrapper
  │         ├── App.jsx                 # Routing logic & Direct Link joiner
  │         ├── index.css               # Global imports & glassmorphism/mesh styles
  │         ├── context/
  │         │    ├── GameContext.jsx    # Real-time state socket event hub
  │         │    └── ThemeContext.jsx   # Dark/Light theme control
  │         ├── components/
  │         │    ├── LobbyChat.jsx      # Chat input/output container
  │         │    ├── PlayerList.jsx     # Waiting room player index & ready states
  │         │    ├── TambolaTicket.jsx  # Interactive ticket with auto/manual marks
  │         │    ├── NumbersBoard.jsx   # 1-90 board and last 10 called values
  │         │    ├── Leaderboard.jsx    # Real-time standings board
  │         │    ├── WinnerClaims.jsx   # Winning patterns lists & host controls
  │         │    └── ThemeToggle.jsx    # Dark/Light toggle sun/moon widget
  │         ├── pages/
  │         │    ├── Home.jsx           # Landing interface (Host/Join selectors)
  │         │    ├── Lobby.jsx          # Waiting room interface
  │         │    ├── Game.jsx           # Live gameplay dashboard
  │         │    └── Summary.jsx        # End recap and scoreboard
  │         └── utils/
  │              └── ticketGenerator.js # Client-side ticket generator reference
  └── README.md                         # Project documentation
```

---

## 🔄 Socket.IO Event Flow

```mermaid
sequenceDiagram
    participant P as Player Client
    participant H as Host Client
    participant S as Server
    
    Note over H,S: Host Setup
    H->>S: room:create { hostName }
    S-->>H: room:update { room }
    
    Note over P,S: Player Setup
    P->>S: room:join { roomCode, playerName }
    S-->>P: room:update { room }
    S-->>H: room:update { room }
    
    Note over P,S: Lobby Ready Up
    P->>S: room:ready
    S-->>P: room:update { room }
    S-->>H: room:update { room }
    
    Note over H,S: Starting Game
    H->>S: game:start
    S-->>H: room:update (State: GAME, unique tickets generated)
    S-->>P: room:update (State: GAME, unique tickets generated)
    
    Note over H,S: Drawing Numbers
    H->>S: game:draw-number OR game:toggle-auto-call
    S-->>H: room:update (currentNumber, calledNumbers)
    S-->>P: room:update (currentNumber, calledNumbers)
    
    Note over P,S: Claiming Patterns (e.g., Early Five)
    P->>S: game:claim-pattern { pattern: 'earlyFive' }
    S-->>H: room:update (claim status pending, auto-verified)
    S-->>P: room:update (claim status pending)
    
    Note over H,S: Approving Claims
    H->>S: game:approve-claim { claimId }
    S-->>H: room:update (claim approved, points updated)
    S-->>P: room:update (claim approved, points updated)
    
    Note over H,S: Ending Game
    H->>S: game:end
    S-->>H: room:update (State: SUMMARY)
    S-->>P: room:update (State: SUMMARY)
```

---

## 🎮 Game Flow Diagram

```mermaid
flowchart TD
    Start([Launch Web App]) --> Home{Home Page}
    
    Home -->|Host Game| CreateRoom[Enter Host Name -> Clicks Create]
    CreateRoom --> Lobby[Lobby: Generates 6-char Code]
    
    Home -->|Join Game| JoinRoom[Enter Name & Room Code -> Clicks Join]
    JoinRoom --> Lobby
    
    Lobby --> Chat[Chat & Wait for Players]
    Lobby --> Ready[Players toggle Ready status]
    
    Lobby -->|Host starts when players joined| GameStart[Game State: Tickets distributed, Standings reset]
    
    GameStart --> Gameplay[Gameplay Dashboard]
    
    Gameplay -->|Host calls next number| NumDraw[Number Called: Broadcasted to all]
    Gameplay -->|Auto-calling mode| NumDraw
    
    NumDraw --> Highlight[Auto-highlights on ticket & Manual visual mark toggle]
    
    Highlight --> Claim{Player claims Pattern?}
    Claim -->|No| Gameplay
    Claim -->|Yes| HostApprove[Host approves/rejects claim based on system validation]
    
    HostApprove -->|Approved| Points[Winner designated, Points added, Leaderboard updated]
    Points --> Gameplay
    HostApprove -->|Rejected| Gameplay
    
    Gameplay -->|Host finishes or 90 called| Summary[Summary page: Final standings, Categories Recap]
    
    Summary -->|Host clicks Play Again| Lobby
    Summary -->|Clicks Exit| Home
```

---

## ⚡ Installation & Running Guide

Ensure you have **Node.js** and **npm** installed on your system.

### 1. Run the Backend

```bash
cd backend
npm install
npm run dev
```
*The backend server will run on `http://localhost:5000`.*

### 2. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```
*The frontend Vite server will run on `http://localhost:3000` (configurable, accessible on local network).*

---

## 🔧 Troubleshooting Guide

### 1. WebSocket Connection Fails
* **Cause**: Backend server is not running, or network interfaces block connection.
* **Fix**: Ensure `backend` terminal displays `Server listening on port 5000`. If testing on a local network from a mobile phone, verify that your firewall allows connections on ports `3000` and `5000`, and that both devices are on the same Wi-Fi router.

### 2. Host Disconnections
* **Behavior**: If the Host leaves or refreshes, all players are automatically notified and redirected to the Home page.
* **Fix**: This is expected behavior to close resources. If you want to play again, host a new room and have players join via the new Room Code.

### 3. Duplicate Name Error
* **Behavior**: Player receives a toast saying the name is already taken.
* **Fix**: If a player disconnected due to network and attempts to rejoin immediately, wait 5 seconds for socket timeout or join with a slightly modified name (e.g. "Name 2").

---

## 🚀 Future Scope

1. **Authentication**: Integrate OAuth (Google/Github) or local passwords to save histories and player profiles.
2. **Persistent Database**: Save room histories, total games played, and cumulative points to a database (MongoDB/PostgreSQL).
3. **Multiple Tickets**: Allow players to buy or request multiple tickets (up to 6) in a single room.
4. **Custom Rules**: Support customized winning patterns (e.g. Corners, Star, 1st Line, 2nd Line, 3rd Line).
5. **Theme Shop**: Interactive sound effects (number call voices) and customized background themes.
