import { useState } from "react";
import useAuthStore from "../../store/authStore";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const { register } = useAuthStore();
     const navigate = useNavigate();
  const handleRegister = async () => {
    try {
      await register(form);
      navigate("/login");
    } catch(err) {
      toast.error(err.response.data.message);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl mb-4">Register</h2>
      <input placeholder="Name" onChange={e => setForm({ ...form, name: e.target.value })} className="block mb-2 w-full p-2" />
      <input placeholder="Email" onChange={e => setForm({ ...form, email: e.target.value })} className="block mb-2 w-full p-2" />
      <input type="password" placeholder="Password" onChange={e => setForm({ ...form, password: e.target.value })} className="block mb-4 w-full p-2" />
      <button onClick={handleRegister} className="bg-green-600 text-white px-4 py-2">Register</button>
    </div>
  );
};

export default Register;
