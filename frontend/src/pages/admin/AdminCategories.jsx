import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/categories`);
      setCategories(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to fetch categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const createCategory = async () => {
    if (!name.trim()) {
      return toast.error("Name is required");
    }
    try {
      await axios.post(`${BACKEND_URL}/api/categories`, { name }, { withCredentials: true });
      toast.success("Category added");
      setName('');
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.error || "Create failed");
    }
  };

  const updateCategory = async () => {
    if (!editName.trim()) {
      return toast.error("Name is required");
    }
    try {
      await axios.put(`${BACKEND_URL}/api/categories/${editId}`, { name: editName }, { withCredentials: true });
      toast.success("Category updated");
      setEditId(null);
      setEditName('');
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.error || "Update failed");
    }
  };

  const deleteCategory = async (id) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/categories/${id}`, { withCredentials: true });
      toast.success("Category deleted");
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.error || "Delete failed");
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Manage Categories</h1>
      
      {/* Add Category Form */}
      <div className="bg-white rounded-lg shadow-xs p-4 mb-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter category name"
            className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
          <button 
            onClick={createCategory} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            Add Category
          </button>
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow-xs overflow-hidden border border-gray-100">
        {categories.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No categories found. Add one to get started.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {categories.map((cat) => (
              <li key={cat._id} className="p-4 hover:bg-gray-50 transition-colors">
                {editId === cat._id ? (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={updateCategory} 
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Save
                      </button>
                      <button 
                        onClick={() => setEditId(null)} 
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-800 font-medium">{cat.name}</span>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => { setEditId(cat._id); setEditName(cat.name); }}
                        className="text-blue-600 hover:text-blue-800 font-medium px-3 py-1 rounded hover:bg-blue-50 transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => deleteCategory(cat._id)} 
                        className="text-red-600 hover:text-red-800 font-medium px-3 py-1 rounded hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}