import { create } from 'zustand';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const useAdminProductStore = create((set) => ({
  products: [],
  categories: [],
  loading: false,

  fetchProducts: async () => {
    set({ loading: true });
    const res = await axios.get(`${BACKEND_URL}/api/products`);
    set({ products: res.data, loading: false });
  },

  fetchCategories: async () => {
    const res = await axios.get(`${BACKEND_URL}/api/categories`);
    set({ categories: res.data });
  },

  createProduct: async (data) => {
    const res = await axios.post(`${BACKEND_URL}/api/products`, data, { withCredentials: true });
    set((state) => ({ products: [...state.products, res.data] }));
  },

  updateProduct: async (id, data) => {
    const res = await axios.put(`${BACKEND_URL}/api/products/${id}`, data, { withCredentials: true });
    set((state) => ({
      products: state.products.map((p) => (p._id === id ? res.data : p)),
    }));
  },

  deleteProduct: async (id) => {
    await axios.delete(`${BACKEND_URL}/api/products/${id}`, { withCredentials: true });
    set((state) => ({
      products: state.products.filter((p) => p._id !== id),
    }));
  },
}));
