import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    expiresAt: "",
    usageLimit: 100,
  });

  // ✅ Fetch all coupons
  const fetchCoupons = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/coupons`,{ withCredentials: true });
      setCoupons(res.data);
    } catch (err) {
      toast.error("Failed to fetch coupons");
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // ✅ Handle input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Create new coupon
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BACKEND_URL}/api/coupons`, form, { withCredentials: true });
      toast.success("Coupon created");
      setForm({
        code: "",
        discountType: "percentage",
        discountValue: "",
        expiresAt: "",
        usageLimit: 100,
      });
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create coupon");
    }
  };

  // ✅ Delete coupon
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/coupons/${id}`, { withCredentials: true });
      toast.success("Coupon deleted");
      fetchCoupons();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="admin-page">
      <h2>📢 Manage Coupons</h2>

      {/* Coupon Form */}
      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          name="code"
          placeholder="Coupon Code"
          value={form.code}
          onChange={handleChange}
          required
        />

        <select name="discountType" value={form.discountType} onChange={handleChange}>
          <option value="percentage">Percentage</option>
          <option value="flat">Flat</option>
        </select>

        <input
          type="number"
          name="discountValue"
          placeholder="Discount Value"
          value={form.discountValue}
          onChange={handleChange}
          required
        />

        <input
          type="date"
          name="expiresAt"
          value={form.expiresAt}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="usageLimit"
          placeholder="Usage Limit"
          value={form.usageLimit}
          onChange={handleChange}
        />

        <button type="submit">Create Coupon</button>
      </form>

      {/* Coupon List */}
      <div className="coupon-list">
        <h3>📄 All Coupons</h3>
        {coupons.length === 0 && <p>No coupons created yet.</p>}
        <ul>
          {coupons.map((coupon) => (
            <li key={coupon._id} className="coupon-card">
              <strong>{coupon.code}</strong> - {coupon.discountType} {coupon.discountValue}
              <br />
              Expires: {new Date(coupon.expiresAt).toLocaleDateString()}
              <br />
              Used: {coupon.usedBy.length} / {coupon.usageLimit}
              <button onClick={() => handleDelete(coupon._id)}>❌ Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminCoupons;
