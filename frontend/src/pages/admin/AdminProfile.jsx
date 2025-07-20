import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AdminProfile = () => {
  const [admin, setAdmin] = useState({});
  const [loading, setLoading] = useState(true);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const fetchAdmin = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/me`, {
        withCredentials: true,
      });
      setAdmin(res.data);
    } catch (err) {
      toast.error("Failed to load admin details");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/change-password`,
        passwords,
        { withCredentials: true }
      );
      toast.success("Password changed successfully");
      setPasswords({ currentPassword: "", newPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Password change failed");
    }
  };

  useEffect(() => {
    fetchAdmin();
  }, []);

  if (loading) return <p>Loading admin info...</p>;

  return (
    <div className="max-w-xl mx-auto p-4 border rounded-md shadow">
      <h2 className="text-2xl font-semibold mb-4">Admin Profile</h2>

      <div className="space-y-2 mb-6">
        <p><strong>Name:</strong> Digital Store Admin </p>
        <p><strong>Email:</strong> {admin.email}</p>
        <p><strong>Registered On:</strong> {new Date(admin.createdAt).toLocaleDateString()}</p>
      </div>

      <form onSubmit={handlePasswordChange} className="space-y-4">
        <h3 className="text-lg font-semibold">Change Password</h3>
        <input
          type="password"
          placeholder="Current Password"
          value={passwords.currentPassword}
          onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="New Password"
          value={passwords.newPassword}
          onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Update Password
        </button>
      </form>
    </div>
  );
};

export default AdminProfile;
