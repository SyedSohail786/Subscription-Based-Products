import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const useAuthStore = create((set,get) => ({
  user: null,
  role: null, // 'user' or 'admin'
  token: null,
  setUser: (user, role, token) => set({ user, role, token }),
  login: async (credentials, type) => {
    try {
      const endpoint =
        type === "admin" ? `${BACKEND_URL}/api/auth/admin/login` : `${BACKEND_URL}/api/auth/user/login`;

      const res = await axios.post(endpoint, credentials, { withCredentials: true });
      set({ user: res.data, role: type });
    } catch (err) {
      throw err;
    }
  },

  register: async (data) => {
    try {
      const res = await axios.post(`${BACKEND_URL}/api/auth/user/register`, data);
      return res.data;
    } catch (err) {
      console.error("Registration failed", err.response?.data || err.message);
      throw err;
    }
  },

  logout: async () => {
     await axios.post(`${BACKEND_URL}/api/auth/user/logout`, {}, {
          withCredentials: true
        });
    set({ user: null, role: null });
    toast.success("Logged out successfully");
    return true;
  },

  setUserFromSession: async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/auth/user/me`,{withCredentials:true});
      if (res.data.role === "admin") {
        set({ user: res.data, role: "admin" });
      } else {
        set({ user: res.data, role: "user" });
      }
    } catch(err) {
      // if(err.status === 401){
      //   set({ user: null, role: null });
      //   const location = window.location.href
      //   if(location === "http://localhost:5173/login"){
      //     return;
      //   }else {
      //     window.location.href = "/login";
      //   }
      // }
    }
  }
}));

export default useAuthStore;
