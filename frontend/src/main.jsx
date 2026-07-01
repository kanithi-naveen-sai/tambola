import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { GameProvider } from './context/GameContext'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <GameProvider>
          <App />
        </GameProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
