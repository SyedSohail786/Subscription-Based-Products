import { useState } from "react";
import useAuthStore from "../../store/authStore";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await login({ email, password }, "admin");
      toast.success("Admin login successful");
      navigate("/admin/dashboard");
    } catch(err) {
      toast.error(err.response.data.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <div className="bg-gray-50" style={{ minHeight: 'calc(100vh - 64px)' }}> {/* Adjust 64px to your navbar height */}
      <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8 h-full">
        <div className="sm:mx-auto sm:w-full sm:max-w-lg"> {/* Increased max width */}
          <h2 className="text-center text-4xl font-extrabold text-gray-900 mb-2"> {/* Larger text */}
            Admin Portal
          </h2>
          <p className="text-center text-lg text-gray-600"> {/* Larger text */}
            Sign in to your admin account
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg"> {/* Increased max width */}
          <div className="bg-white py-10 px-8 shadow-xl sm:rounded-lg"> {/* Increased padding */}
            <form className="space-y-8" onSubmit={handleSubmit}> {/* Increased spacing */}
              <div>
                <label htmlFor="email" className="block text-lg font-medium text-gray-700 mb-2"> {/* Larger text */}
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-lg appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" /* Larger input */
                    placeholder="admin@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-lg font-medium text-gray-700 mb-2"> {/* Larger text */}
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-lg appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" /* Larger input */
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" /* Larger button */
                >
                  Sign in
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;