import React from 'react';
import { Outlet } from 'react-router-dom';
import '../../App.css';

function AuthLayout() {
  return (
    <div className="min-h-screen relative bg-gray-100 flex items-center justify-center p-4 overflow-hidden">
      {/* Background effects */}
      <div className="background" />
      
      {/* Content */}
      <div className="content-wrapper">
        <Outlet />
      </div>
    </div>
  );
}

export default AuthLayout;