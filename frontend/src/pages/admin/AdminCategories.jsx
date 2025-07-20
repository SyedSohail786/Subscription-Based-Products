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
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Categories</h1>
      <div className="mb-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
          className="border p-2 mr-2"
        />
        <button onClick={createCategory} className="bg-blue-600 text-white px-4 py-2 rounded">
          Add
        </button>
      </div>
      <ul className="space-y-2">
        {categories.map((cat) => (
          <li key={cat._id} className="border p-2 rounded flex justify-between items-center">
            {editId === cat._id ? (
              <>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="border p-1 mr-2"
                />
                <div className="flex gap-2">
                  <button onClick={updateCategory} className="bg-green-500 text-white px-2 py-1 rounded">
                    Save
                  </button>
                  <button onClick={() => setEditId(null)} className="bg-gray-300 px-2 py-1 rounded">
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <span>{cat.name}</span>
                <div className="flex gap-2">
                  <button onClick={() => { setEditId(cat._id); setEditName(cat.name); }} 
                          className="text-blue-600 font-semibold">
                    Edit
                  </button>
                  <button onClick={() => deleteCategory(cat._id)} className="text-red-600 font-semibold">
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
