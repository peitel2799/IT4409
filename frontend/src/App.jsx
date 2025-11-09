import React, { use, useEffect } from 'react';
import { Routes, Route } from 'react-router';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import './App.css';



export default function App() {

  

  return (
    

    <div className="min-h-screen relative bg-gray-100 flex items-center justify-center p-4 overflow-hidden"> 
      {/* Background effects */}
      <div className="background" />
      {/* Content */}
      <div className="content-wrapper">
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
  
        
      </div>
    </div>
  );
}
