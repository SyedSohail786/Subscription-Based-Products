import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsSendingOtp(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/user/send-otp`, { email });
      toast.success(res.data.message);
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      toast.error("Please enter OTP and new password");
      return;
    }
    
    setIsResetting(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/user/reset-password`, {
        email,
        otp,
        newPassword,
      });
      toast.success(res.data.message);
      setStep(1);
      setEmail("");
      setOtp("");
      setNewPassword("");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {step === 1 ? "Reset Password" : "Create New Password"}
            </h1>
            <p className="text-gray-600">
              {step === 1 
                ? "Enter your email to receive a verification code"
                : "Enter the OTP and your new password"}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
              </div>

              <h1 className="text-sm text-gray-600">Remember your password? <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">Login</Link></h1>
              
              <button
                type="submit"
                disabled={isSendingOtp}
                className={`w-full flex justify-center items-center ${
                  isSendingOtp ? 'bg-blue-500' : 'bg-blue-600 hover:bg-blue-700'
                } text-white font-medium py-3 px-4 rounded-lg shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {isSendingOtp ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  "Send OTP"
                )}
              </button>
              
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Code
                </label>
                <input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isResetting}
                className={`w-full flex justify-center items-center ${
                  isResetting ? 'bg-green-500' : 'bg-green-600 hover:bg-green-700'
                } text-white font-medium py-3 px-4 rounded-lg shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
              >
                {isResetting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline"
                >
                  Back to Email
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;