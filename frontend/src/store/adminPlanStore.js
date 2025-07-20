import { create } from 'zustand';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const useAdminPlanStore = create((set) => ({
  plans: [],

  fetchPlans: async () => {
    const res = await axios.get(`${BACKEND_URL}/api/plans`, { withCredentials: true });
    set({ plans: res.data });
  },

  createPlan: async (data) => {
    const res = await axios.post(`${BACKEND_URL}/api/plans`, data, { withCredentials: true });
    set((state) => ({ plans: [...state.plans, res.data] }));
  },

  updatePlan: async (id, data) => {
    const res = await axios.put(`${BACKEND_URL}/api/plans/${id}`, data, { withCredentials: true });
    set((state) => ({
      plans: state.plans.map(p => p._id === id ? res.data : p),
    }));
  },

  deletePlan: async (id) => {
    await axios.delete(`${BACKEND_URL}/api/plans/${id}`, { withCredentials: true });
    set((state) => ({
      plans: state.plans.filter(p => p._id !== id),
    }));
  },
}));
