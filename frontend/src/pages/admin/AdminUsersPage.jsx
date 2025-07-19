import { useEffect, useState } from "react";
import axios from "axios";
import useAuthStore from "../../store/authStore";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const AdminUsersPage = () => {
  const { user, role, token } = useAuthStore(); // Use your actual auth state
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "" });

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/admin/users`, { withCredentials: true });
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    if (role === "admin") fetchUsers();
  }, []);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setForm({ name: user.name, email: user.email, role: user.role });
    setEditMode(true);
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${BACKEND_URL}/api/admin/users/${selectedUser._id}`, form, {
        withCredentials: true,
      });
      setEditMode(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      console.error("Update failed", err.response?.data || err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this user?")) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/admin/users/${id}`, { withCredentials: true });
      fetchUsers();
    } catch (err) {
      console.error("Delete failed", err.response?.data || err.message);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin: Users Management</h1>

      {editMode && (
        <div className="mb-6 border p-4 bg-gray-100 rounded">
          <h2 className="font-semibold mb-2">Edit User</h2>
          <input
            className="block mb-2 p-2 border w-full"
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Name"
          />
          <input
            className="block mb-2 p-2 border w-full"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Email"
          />
          <select
            className="block mb-2 p-2 border w-full"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 mr-2" onClick={handleUpdate}>
            Update
          </button>
          <button className="bg-gray-400 px-4 py-2" onClick={() => setEditMode(false)}>
            Cancel
          </button>
        </div>
      )}

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Role</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id} className="text-center">
              <td className="border p-2">{u.name}</td>
              <td className="border p-2">{u.email}</td>
              <td className="border p-2">{u.role}</td>
              <td className="border p-2">
                <button onClick={() => handleEdit(u)} className="text-blue-600 mr-2">
                  Edit
                </button>
                <button onClick={() => handleDelete(u._id)} className="text-red-600">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsersPage;
