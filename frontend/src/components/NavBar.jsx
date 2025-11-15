// src/components/NavBar.jsx
import React from 'react';
import { Link } from 'react-router-dom'; 
import { MessageCircleIcon } from 'lucide-react';

function Navbar() {
  return (
    <nav className="w-full bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-40">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-pink-400">
        <MessageCircleIcon className="w-8 h-8" />
        <span>ChatApp</span>
      </Link>

      {/* Menu */}
      <div className="flex items-center gap-6 text-gray-700 font-medium">
        <a href="#about" className="hover:text-pink-400">
          Giới thiệu
        </a>
        <a href="#contact" className="hover:text-pink-400">
          Liên hệ
        </a>
        <Link 
          to="/login" 
          className="px-4 py-2 bg-pink-400 text-white rounded-lg hover:bg-pink-500"
        >
          Login / Sign Up
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;