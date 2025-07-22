import { useEffect, useState } from "react";
import axios from "axios";
import useAuthStore from "../../store/authStore";
import { FiEdit2, FiTrash2, FiUser, FiMail, FiLock, FiX, FiCheck } from "react-icons/fi";
import { motion } from "framer-motion";
import Select from 'react-select';
import toast from "react-hot-toast";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const roleOptions = [
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' }
];

const AdminUsersPage = () => {
  const { role } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "user" });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/api/admin/users`, { 
        withCredentials: true 
      });
      setUsers(res.data);
    } catch (err) {
      toast.error("Failed to fetch users: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === "admin") fetchUsers();
  }, [role]);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setForm({ 
      name: user.name, 
      email: user.email, 
      role: user.role 
    });
    setEditMode(true);
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `${BACKEND_URL}/api/admin/users/${selectedUser._id}`, 
        form, 
        { withCredentials: true }
      );
      toast.success("User updated successfully");
      setEditMode(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      toast.error("Update failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/admin/users/${id}`, { 
        withCredentials: true 
      });
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (err) {
      toast.error("Delete failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleRoleChange = (selectedOption) => {
    setForm({ ...form, role: selectedOption.value });
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      className="p-6 max-w-7xl mx-auto"
    >
      <motion.h1 
        variants={fadeIn}
        className="text-3xl font-bold text-gray-800 mb-6"
      >
        User Management
      </motion.h1>

      {/* Search and Filter */}
      <motion.div variants={fadeIn} className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FiUser className="absolute left-3 top-3.5 text-gray-400" />
        </div>
      </motion.div>

      {/* Edit Form */}
      {editMode && (
        <motion.div 
          variants={fadeIn}
          className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Edit User: {selectedUser?.name}
            </h2>
            <button 
              onClick={() => setEditMode(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-10 p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Full Name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  className="w-full pl-10 p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Email Address"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-3 text-gray-400" />
                <Select
                  options={roleOptions}
                  value={roleOptions.find(option => option.value === form.role)}
                  onChange={handleRoleChange}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Select role..."
                  styles={{
                    control: (base) => ({
                      ...base,
                      paddingLeft: '2.5rem',
                      minHeight: '44px',
                      borderColor: '#d1d5db',
                      '&:hover': {
                        borderColor: '#d1d5db'
                      }
                    }),
                    option: (base, { isSelected }) => ({
                      ...base,
                      backgroundColor: isSelected ? '#6366f1' : base.backgroundColor,
                      '&:hover': {
                        backgroundColor: isSelected ? '#6366f1' : '#f3f4f6'
                      }
                    })
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setEditMode(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
              >
                <FiCheck className="mr-2" />
                Update User
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Users Table */}
      <motion.div variants={fadeIn} className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    {searchTerm ? "No matching users found" : "No users available"}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <motion.tr 
                    key={user._id}
                    variants={fadeIn}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <FiUser className="text-indigo-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === "admin" 
                          ? "bg-purple-100 text-purple-800" 
                          : "bg-green-100 text-green-800"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <FiEdit2 className="inline mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 className="inline mr-1" /> Delete
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminUsersPage;