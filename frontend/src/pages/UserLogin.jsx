import { useState } from "react";
import useAuthStore from "../store/authStore";

const UserLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuthStore();

  const handleLogin = async () => {
    try {
      await login({ email, password }, "user");
      window.location.href = "/";
    } catch {
      alert("Login failed");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl mb-4">User Login</h2>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} className="block mb-2 w-full p-2" />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} className="block mb-4 w-full p-2" />
      <button onClick={handleLogin} className="bg-blue-600 text-white px-4 py-2">Login</button>
    </div>
  );
};

export default UserLogin;
