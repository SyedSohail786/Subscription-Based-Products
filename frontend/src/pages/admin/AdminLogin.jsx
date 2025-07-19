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

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl mb-4">Admin Login</h2>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} className="block mb-2 w-full p-2" />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} className="block mb-4 w-full p-2" />
      <button onClick={handleLogin} className="bg-red-600 text-white px-4 py-2">Login</button>
    </div>
  );
};

export default AdminLogin;
