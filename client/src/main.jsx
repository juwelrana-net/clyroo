// client/src/main.jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './components/ThemeProvider.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  // --- Yahaan se StrictMode Hata Diya Gaya Hai ---
  <BrowserRouter>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <App />
    </ThemeProvider>
  </BrowserRouter>
  // --- Yahaan se StrictMode Hata Diya Gaya Hai ---
)