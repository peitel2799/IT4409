import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/NavBar'; 
import { MailIcon, PhoneIcon, MapPinIcon, FacebookIcon, TwitterIcon, LinkedinIcon } from 'lucide-react';

function HomePage() {
  return (
    <div className="w-full h-full flex flex-col">
      <Navbar />
      <main className="flex-1 overflow-y-auto">
        <section 
          className="h-[80vh] flex flex-col items-center justify-center text-center p-8
                     bg-[url('/sample.png')] bg-cover bg-center bg-gray-700 bg-blend-multiply"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Welcome to ChatApp
          </h1>
          <p className="text-xl text-gray-200 mb-8">
            A new way to connect with your friends.
          </p>
          <Link to="/signup"  className="px-8 py-3 bg-pink-400
          text-white text-lg font-semibold rounded-lg hover:bg-pink-500 transition-colors">
            Get Started
          </Link>
        </section>

      
        <section className="bg-white py-20 px-8">
          <div id="about" className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              Giới thiệu về App
            </h2>
            <p className="text-lg text-gray-600 mb-4">
              ChatApp là một nền tảng trò chuyện hiện đại, nhanh chóng và bảo mật. 
              Chúng tôi giúp bạn kết nối với bạn bè, gia đình và đồng nghiệp mọi lúc mọi nơi.
            </p>
            <p className="text-lg text-gray-600">
              Với giao diện thân thiện, bạn có thể dễ dàng gửi tin nhắn, 
              chia sẻ hình ảnh và giữ liên lạc với những người quan trọng nhất.
            </p>
          </div>
        </section>

       
        <div id="contact" className="bg-gray-800 text-gray-300 py-12 px-8">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Cột 1: Địa chỉ */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Location</h3>
              <p className="flex items-start mb-2">
                <MapPinIcon className="w-5 h-5 mr-2 text-pink-400 flex-shrink-0 mt-1" />
                số 1, Đại Cồ Việt, Hai Bà Trưng , Hà Nội
              </p>
            </div>

            {/* Cột 2: Liên hệ */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Contact</h3>
              <p className="flex items-center mb-2">
                <MailIcon className="w-5 h-5 mr-2 text-pink-400" />
                1@gmail.com
              </p>
              <p className="flex items-center">
                <PhoneIcon className="w-5 h-5 mr-2 text-pink-400" />
                +84 123 456 789
              </p>
            </div>

            {/* Cột 3: Mạng xã hội */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Flow us</h3>
              <div className="flex gap-4">
                <a href="#" className="text-gray-300 hover:text-pink-400">
                  <FacebookIcon className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-300 hover:text-pink-400">
                  <TwitterIcon className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-300 hover:text-pink-400">
                  <LinkedinIcon className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
          <div className="text-center mt-10 border-t border-gray-700 pt-6">
            <p>&copy; 2025 ChatApp. All rights reserved.</p>
          </div>
        </div>

      </main>
    </div>
  );
}

export default HomePage;