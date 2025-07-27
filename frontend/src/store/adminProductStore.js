import { create } from 'zustand';
import axios from 'axios';
import toast from 'react-hot-toast';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const useAdminProductStore = create((set) => ({
  products: [],
  categories: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    try {
      set({ loading: true, error: null });
      const res = await axios.get(`${BACKEND_URL}/api/products`);
      set({ products: res.data?.products || [], loading: false });
    } catch (error) {
      console.error('Failed to fetch products:', error);
      set({ 
        loading: false, 
        error: error.response?.data?.message || 'Failed to fetch products',
        products: [] // Reset to empty array on error
      });
      toast.error(error.response?.data?.message || 'Failed to fetch products');
    }
  },

  fetchCategories: async () => {
    try {
      set({ loading: true, error: null });
      const res = await axios.get(`${BACKEND_URL}/api/categories`);
      set({ categories: res.data || [], loading: false });
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      set({ 
        loading: false, 
        error: error.response?.data?.message || 'Failed to fetch categories',
        categories: [] // Reset to empty array on error
      });
    }
  },

  createProduct: async (formData) => {
    try {
      set({ loading: true, error: null });
      const res = await axios.post(`${BACKEND_URL}/api/products`, formData, { 
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      set((state) => ({ 
        products: [...state.products, res.data?.product],
        loading: false 
      }));
      return res.data?.product; // Return created product for immediate use
    } catch (error) {
      console.error('Failed to create product:', error);
      set({ 
        loading: false, 
        error: error.response?.data?.message || 'Failed to create product'
      });
      toast.error(error.response?.data?.message || 'Failed to create product');
      throw error; // Re-throw for component-level handling
    }
  },

  updateProduct: async (id, formData) => {
    try {
      set({ loading: true, error: null });
      const res = await axios.put(`${BACKEND_URL}/api/products/${id}`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      set((state) => ({
        products: state.products.map((p) => 
          p._id === id ? { ...p, ...res.data?.product } : p
        ),
        loading: false
      }));
      return res.data?.product; // Return updated product
    } catch (error) {
      console.error('Failed to update product:', error);
      set({ 
        loading: false, 
        error: error.response?.data?.message || 'Failed to update product'
      });
      toast.error(error.response?.data?.message || 'Failed to update product');
      throw error;
    }
  },

  deleteProduct: async (id) => {
    try {
      set({ loading: true, error: null });
      await axios.delete(`${BACKEND_URL}/api/products/${id}`, { 
        withCredentials: true 
      });

      toast.success('Product deleted successfully');
      set((state) => ({
        products: state.products.filter((p) => p._id !== id),
        loading: false
      }));
    } catch (error) {
      console.error('Failed to delete product:', error);
      set({ 
        loading: false, 
        error: error.response?.data?.message || 'Failed to delete product'
      });
      toast.error(error.response?.data?.message || 'Failed to delete product');
      throw error;
    }
  },
}));