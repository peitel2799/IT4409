// src/pages/SignUpPage.jsx
import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { MessageCircleIcon, UserIcon, MailIcon, LockIcon, LoaderIcon } from "lucide-react";
import { Link } from "react-router";

function SignUpPage() {
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" });
  const { signup, isSigningUp } = useAuthStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    signup(formData);
  }

  return (
          <div className="w-full flex flex-col md:flex-row bg-white rounded-xl shadow-lg overflow-hidden">
            
            {/* LEFT FORM COLUMN */}
            <div className="md:w-1/2 p-8 flex items-center justify-center border-r border-gray-200">
              <div className="w-full max-w-md">
                
                {/* HEADER */}
                <div className="text-center mb-8">
                  <MessageCircleIcon className="w-12 h-12 mx-auto text-pink-400 mb-4" />
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
                  <p className="text-gray-500">Sign up for a new account</p>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* FULL NAME */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                        style={{ focus: { ringColor: '#D3D0FB' } }}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>

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
                        style={{ focus: { ringColor: '#CDFDE5' } }}
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
                        style={{ focus: { ringColor: '#FAFDC6' } }}
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <button
                    className="w-full text-white font-semibold py-2 rounded-lg transition-colors"
                    style={{ backgroundColor: '#D3D0FB' }}
                    type="submit"
                    disabled={isSigningUp}
                  >
                    {isSigningUp ? (
                      <LoaderIcon className="w-5 h-5 mx-auto animate-spin" />
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </form>

                {/* LINK TO LOGIN */}
                <div className="mt-6 text-center">
                  <Link to="/login" className="text-pink-400 hover:underline font-medium">
                    Already have an account? Login
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

export default SignUpPage;

