// src/pages/LoginPage.jsx
import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { MessageCircleIcon, MailIcon, LockIcon, LoaderIcon } from "lucide-react";
import { Link } from "react-router";



function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(formData);
  };

  return (
          <div className="w-full flex flex-col md:flex-row bg-white rounded-xl shadow-lg overflow-hidden">
            
            {/* LEFT FORM COLUMN */}
            <div className="md:w-1/2 p-8 flex items-center justify-center border-r border-gray-200">
              <div className="w-full max-w-md">
                
                {/* HEADER */}
                <div className="text-center mb-8">
                  <MessageCircleIcon className="w-12 h-12 mx-auto text-pink-400 mb-4" />
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">Login</h2>
                  <p className="text-gray-500">Sign in to your account</p>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* EMAIL */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Email</label>
                    <div className="relative">
                      <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                        style={{ focus: { ringColor: '#D3D0FB' } }}
                        placeholder="johndoe@gmail.com"
                        required
                      />
                    </div>
                  </div>

                  {/* PASSWORD */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Password</label>
                    <div className="relative">
                      <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                        style={{ focus: { ringColor: '#CDFDE5' } }}
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <button
                    className="w-full text-white font-semibold py-2 rounded-lg transition-colors bg-[#D3D0FB] hover:bg-[#847ef2]"
                    type="submit"
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? (
                      <LoaderIcon className="w-5 h-5 mx-auto animate-spin" />
                    ) : (
                      "Login"
                    )}
                  </button>
                </form>

                {/* LINK TO SIGNUP */}
                <div className="mt-6 text-center">
                  <Link to="/signup" className="text-pink-400 hover:underline font-medium">
                    Don't have an account? Sign Up
                  </Link>
                </div>
              </div>
            </div>

            {/* RIGHT ILLUSTRATION COLUMN */}
            <div
              className="md:block md:w-1/2 bg-cover bg-center flex overflow-hidden"
              style={{
                backgroundImage: "url('/sample.png')",
              }}
            ></div>
          </div>
  );
}

export default LoginPage;
