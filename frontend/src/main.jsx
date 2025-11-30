import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' 
import React from 'react'
import App from './App.jsx'
import './styles/dashboard.css'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'
import { Toaster } from 'react-hot-toast'
import { ChatProvider } from './context/ChatContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ChatProvider><BrowserRouter>
        <Toaster/>
        <App />
      </BrowserRouter></ChatProvider>
    </AuthProvider>
  </StrictMode>,
)