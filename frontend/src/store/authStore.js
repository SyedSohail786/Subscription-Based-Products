import { create } from "zustand";
import axios from "axios";

const useAuthStore = create((set) => ({
  user: null,
  role: null, // 'user' or 'admin'

  login: async (credentials, type) => {
    try {
      const endpoint =
        type === "admin" ? "/api/auth/admin/login" : "/api/auth/user/login";

      const res = await axios.post(endpoint, credentials, { withCredentials: true });

      set({ user: res.data.user, role: type });
    } catch (err) {
      console.error("Login failed", err.response?.data || err.message);
      throw err;
    }
  },

  register: async (data) => {
    try {
      const res = await axios.post("/api/auth/user/register", data);
      return res.data;
    } catch (err) {
      console.error("Registration failed", err.response?.data || err.message);
      throw err;
    }
  },

  logout: async () => {
    await axios.post("/api/auth/logout");
    set({ user: null, role: null });
  },

  setUserFromSession: async () => {
    try {
      const res = await axios.get("/api/auth/me");
      if (res.data.role === "admin") {
        set({ user: res.data.user, role: "admin" });
      } else {
        set({ user: res.data.user, role: "user" });
      }
    } catch {
      set({ user: null, role: null });
    }
  }
}));

export default useAuthStore;
