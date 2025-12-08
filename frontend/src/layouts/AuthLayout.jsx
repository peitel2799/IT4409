import React from 'react';
import { Outlet } from 'react-router-dom';
// XÓA DÒNG NÀY: import '../../App.css';

function AuthLayout() {
  return (
    <div className="min-h-screen relative bg-gray-100 flex items-center justify-center p-4 overflow-hidden">
      
      {/* 1. LỚP NỀN (BACKGROUND) */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat blur-[9px] scale-105"
        style={{ backgroundImage: "url('/sample.png')" }} 
      />
      
      {/* Lớp phủ màu đen nhẹ (Tùy chọn: giúp chữ dễ đọc hơn nếu ảnh nền quá sáng) */}
      <div className="absolute inset-0 z-0 bg-black/10" />

      {/* 2. LỚP NỘI DUNG (CONTENT) */}
      <div className="relative z-10 w-full max-w-[1200px] mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-2rem)]">
        <Outlet />
      </div>

    </div>
  );
}

export default AuthLayout;