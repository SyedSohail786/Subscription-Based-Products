import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { motion } from "framer-motion";
import { 
  FiUsers, 
  FiDollarSign, 
  FiBox, 
  FiLayers, 
  FiPieChart, 
  FiDownload,
  FiShoppingCart
} from "react-icons/fi";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/api/admin/dashboard/analytics`, { withCredentials: true })
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load dashboard:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!data) return <div className="text-red-500">Failed to load dashboard data</div>;

  // Prepare chart data
  const barChartData = data.topProducts.map((item) => ({
    name: item.product.title.length > 12 
      ? `${item.product.title.substring(0, 12)}...` 
      : item.product.title,
    downloads: item.count
  }));

  const pieChartData = [
    { name: "Users", value: data.totalUsers },
    { name: "Subscriptions", value: data.totalSubscriptions },
    { name: "Products", value: data.totalProducts },
    { name: "Orders", value: data.totalOrders },
    { name: "Plans", value: data.totalPlans }
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="p-6"
    >
      <motion.h2 
        variants={itemVariants}
        className="text-3xl font-bold text-gray-800 mb-6"
      >
        Admin Dashboard
      </motion.h2>

      {/* Stats Cards */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8"
      >
        <StatCard
          icon={<FiUsers className="text-indigo-500" size={24} />}
          label="Total Users"
          value={data.totalUsers}
          variants={itemVariants}
        />
        <StatCard
          icon={<FiDollarSign className="text-green-500" size={24} />}
          label="Total Revenue"
          value={`₹${data.totalRevenue.toLocaleString()}`}
          variants={itemVariants}
        />
        <StatCard
          icon={<FiPieChart className="text-blue-500" size={24} />}
          label="Subscriptions"
          value={data.totalSubscriptions}
          variants={itemVariants}
        />
        <StatCard
          icon={<FiShoppingCart className="text-orange-500" size={24} />}
          label="Total Orders"
          value={data.totalOrders}
          variants={itemVariants}
        />
        <StatCard
          icon={<FiBox className="text-yellow-500" size={24} />}
          label="Products"
          value={data.totalProducts}
          variants={itemVariants}
        />
        <StatCard
          icon={<FiLayers className="text-purple-500" size={24} />}
          label="Categories"
          value={data.totalCategories}
          variants={itemVariants}
        />
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Bar Chart */}
        <motion.div
          variants={itemVariants}
          className="bg-white p-6 rounded-xl shadow-md"
        >
          <h3 className="text-xl font-semibold mb-4 text-gray-700">
            Top Downloaded Products
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barChartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="downloads"
                  fill="#8884d8"
                  animationBegin={100}
                  animationDuration={1500}
                >
                  {barChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          variants={itemVariants}
          className="bg-white p-6 rounded-xl shadow-md"
        >
          <h3 className="text-xl font-semibold mb-4 text-gray-700">
            Data Distribution
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={100}
                  animationDuration={1500}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {pieChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Top Products List */}
      <motion.div
        variants={itemVariants}
        className="bg-white p-6 rounded-xl shadow-md"
      >
        <h3 className="text-xl font-semibold mb-4 text-gray-700">
          🔥 Top Downloaded Products
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Downloads
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.topProducts.map((item, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.product.title}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.count}</div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

const StatCard = ({ icon, label, value, variants }) => (
  <motion.div
    variants={variants}
    className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow"
  >
    <div className="flex items-center">
      <div className="p-3 rounded-lg bg-opacity-20 bg-indigo-100 mr-4">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  </motion.div>
);

export default AdminDashboard;