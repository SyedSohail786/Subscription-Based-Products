import { useState } from "react";
import useAuthStore from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const UserLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const handleLogin = async () => {
    try {
      await login({ email, password }, "user");
      navigate("/");
      toast.success("Login successful");
    } catch(err) {
      toast.error(err.response.data.message);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl mb-4">User Login</h2>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} className="block mb-2 w-full p-2" />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} className="block mb-4 w-full p-2" />
      <p onClick={e=>navigate("/register")} className="cursor-pointer">Register here</p>
      <button onClick={handleLogin} className="bg-blue-600 text-white px-4 py-2">Login</button>
    </div>
  );
};

export default UserLogin;
