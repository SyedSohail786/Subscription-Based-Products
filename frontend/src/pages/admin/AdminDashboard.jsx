import React, { useEffect, useState } from "react";
import axios from "axios";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const AdminDashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/admin/dashboard/analytics`, { withCredentials: true })
      .then(res => setData(res.data))
      .catch(err => console.error("Failed to load dashboard:", err));
  }, []);

  if (!data) return <div>Loading dashboard...</div>;

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>

      <div className="stats-grid" style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        <StatBox label="Total Users" value={data.totalUsers} />
        <StatBox label="Total Revenue" value={`₹${data.totalRevenue}`} />
        <StatBox label="Subscriptions" value={data.totalSubscriptions} />
        <StatBox label="Products" value={data.totalProducts} />
        <StatBox label="Categories" value={data.totalCategories} />
        <StatBox label="Plans" value={data.totalPlans} />
      </div>

      <h3 style={{ marginTop: "30px" }}>🔥 Top 5 Downloaded Products</h3>
      <ul>
        {data.topProducts.map((item, index) => (
          <li key={index}>
            {item.product.title} — {item.count} downloads
          </li>
        ))}
      </ul>
    </div>
  );
};

const StatBox = ({ label, value }) => (
  <div style={{ border: "1px solid #ccc", padding: "15px", borderRadius: "8px", minWidth: "150px" }}>
    <h4>{label}</h4>
    <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{value}</p>
  </div>
);

export default AdminDashboard;
