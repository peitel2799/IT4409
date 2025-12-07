import { useState, useEffect } from "react";
import { MessageCircleIcon, MailIcon, LockIcon, KeyRound, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

function ForgotPasswordPage() {
  // step = 1: nhập email, step = 2: nhập OTP + mật khẩu mới
  const [step, setStep] = useState(1);

  // thời gian đếm ngược khi gửi lại mã OTP
  const [countdown, setCountdown] = useState(0);

  // hiệu ứng đếm ngược, mỗi 1 giây trừ đi 1
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  // xử lý submit form
  const handleSubmit = (e) => {
    e.preventDefault();

    // chuyển sang bước OTP
    if (step === 1) {
      setStep(2);
      setCountdown(60); // bắt đầu đếm ngược 60s
      return;
    }

    // bước 2: hoàn tất
    alert("Demo only: password reset success!");
  };

  // xử lý gửi lại OTP
  const handleResend = () => {
    if (countdown === 0) {
      setCountdown(60);
      // TODO: gọi API gửi lại OTP
    }
  };

  return (
    <div className="w-full flex flex-col md:flex-row bg-white rounded-xl shadow-lg overflow-hidden h-[600px]">
      <div className="md:w-1/2 p-8 flex items-center justify-center border-r border-gray-200">
        <div className="w-full max-w-md">

          {/* tiêu đề */}
          <div className="text-center mb-8">
            <MessageCircleIcon className="w-12 h-12 mx-auto text-pink-400 mb-4" />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {step === 1 ? "Forgot Password" : "Reset Password"}
            </h2>
            <p className="text-gray-500">
              {step === 1 
                ? "Enter your email to receive an OTP code."
                : "Enter the OTP code and your new password."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* --- Bước 1: Nhập email --- */}
            {step === 1 && (
              <div>
                <label className="block text-gray-700 font-medium mb-1">Email</label>
                <div className="relative">
                  <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg 
                      focus:outline-none focus:ring-2 focus:ring-[#D3D0FB]"
                    placeholder="yourname@example.com"
                  />
                </div>
              </div>
            )}

            {/* --- Bước 2: OTP + Password mới --- */}
            {step === 2 && (
              <>
                {/* ô nhập OTP */}
                <div>
                  <label className="block text-gray-700 font-medium mb-1">OTP Code</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg 
                        focus:outline-none focus:ring-2 focus:ring-[#D3D0FB] tracking-widest font-bold"
                      placeholder="• • • • • •"
                    />
                  </div>

                  {/* nút gửi lại mã OTP */}
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={countdown > 0}
                      className={`text-sm font-medium hover:underline transition-colors ${
                        countdown > 0
                          ? "text-gray-400 cursor-not-allowed no-underline"
                          : "text-[#847ef2]"
                      }`}
                    >
                      {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
                    </button>
                  </div>
                </div>

                {/* ô nhập mật khẩu mới */}
                <div>
                  <label className="block text-gray-700 font-medium mb-1">New Password</label>
                  <div className="relative">
                    <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg 
                        focus:outline-none focus:ring-2 focus:ring-[#D3D0FB]"
                      placeholder="Enter new password"
                    />
                  </div>
                </div>
              </>
            )}

            {/* nút submit */}
            <button
              type="submit"
              className="w-full text-white font-semibold py-2 rounded-lg transition-colors 
                bg-[#D3D0FB] hover:bg-[#847ef2]"
            >
              {step === 1 ? "Send OTP" : "Reset Password"}
            </button>
          </form>

          {/* Điều hướng */}
          <div className="mt-6 text-center">
            
            {/* quay lại bước nhập email */}
            {step === 2 && (
              <button
                onClick={() => {
                  setStep(1);
                  setCountdown(0);
                }}
                className="text-gray-500 hover:text-gray-800 text-sm mb-4 block w-full"
              >
                Change Email?
              </button>
            )}

            {/* quay lại login */}
            <Link
              to="/login"
              className="text-pink-400 hover:underline font-medium flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>

        </div>
      </div>

      <div
        className="hidden md:block md:w-1/2 bg-cover bg-center"
        style={{ backgroundImage: "url('/sample.png')" }}
      ></div>
    </div>
  );
}

export default ForgotPasswordPage;
