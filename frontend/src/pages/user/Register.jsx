import { useState } from "react";
import useAuthStore from "../../store/authStore";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuthStore();
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      setIsLoading(true);
      await register(form);
      toast.success("Registration successful, please login to continue");
      navigate("/login");
    } catch(err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
            <p className="text-gray-600">Join our community</p>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                disabled={isLoading}
                required={true}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                disabled={isLoading}
                required={true}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                disabled={isLoading}
                required={true}
                />
            </div>

            <button
              onClick={handleRegister}
              disabled={isLoading}
              className={`w-full ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium py-3 px-4 rounded-lg shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </>
              ) : (
                'Register'
              )}
            </button>

            <p className="text-sm text-center text-gray-500 mt-4">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className={`text-blue-600 hover:text-blue-800 font-medium hover:underline ${isLoading ? 'pointer-events-none opacity-70' : ''}`}
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;