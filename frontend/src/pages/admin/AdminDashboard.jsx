import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
  FiShoppingCart,
  FiTrendingUp,
  FiActivity
} from "react-icons/fi";
import toast from "react-hot-toast";

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

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/api/admin/dashboard/analytics`, { withCredentials: true })
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
          toast.error(err.message)
          console.error("Failed to load dashboard:", err);
          setLoading(false);
        
      });
  }, [navigate]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent"></div>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-500 text-lg font-semibold mb-2">Failed to load dashboard data</div>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );

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

  const statsCards = [
    {
      title: "Total Users",
      value: data.totalUsers,
      icon: <FiUsers className="text-blue-600" size={24} />,
      bgColor: "from-blue-50 to-blue-100",
      textColor: "text-blue-600"
    },
    {
      title: "Total Revenue",
      value: `₹${data.totalRevenue.toLocaleString()}`,
      icon: <FiDollarSign className="text-green-600" size={24} />,
      bgColor: "from-green-50 to-green-100",
      textColor: "text-green-600"
    },
    {
      title: "Subscriptions",
      value: data.totalSubscriptions,
      icon: <FiTrendingUp className="text-purple-600" size={24} />,
      bgColor: "from-purple-50 to-purple-100",
      textColor: "text-purple-600"
    },
    {
      title: "Total Orders",
      value: data.totalOrders,
      icon: <FiShoppingCart className="text-orange-600" size={24} />,
      bgColor: "from-orange-50 to-orange-100",
      textColor: "text-orange-600"
    },
    {
      title: "Products",
      value: data.totalProducts,
      icon: <FiBox className="text-indigo-600" size={24} />,
      bgColor: "from-indigo-50 to-indigo-100",
      textColor: "text-indigo-600"
    },
    {
      title: "Categories",
      value: data.totalCategories,
      icon: <FiLayers className="text-pink-600" size={24} />,
      bgColor: "from-pink-50 to-pink-100",
      textColor: "text-pink-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <FiActivity className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-gray-600">Overview of your platform performance</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6 mb-8"
          >
            {statsCards.map((stat, index) => (
              <StatCard
                key={stat.title}
                {...stat}
                variants={itemVariants}
                delay={index * 0.1}
              />
            ))}
          </motion.div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 mb-8">
            {/* Bar Chart */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiDownload className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Top Downloaded Products</h3>
                  <p className="text-sm text-gray-600">Most popular downloads this month</p>
                </div>
              </div>
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
                      fill="#3B82F6"
                      radius={[4, 4, 0, 0]}
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
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FiPieChart className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Data Distribution</h3>
                  <p className="text-sm text-gray-600">Platform metrics overview</p>
                </div>
              </div>
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

          {/* Top Products Table */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="p-6 sm:p-8 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiTrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">🔥 Top Downloaded Products</h3>
                  <p className="text-sm text-gray-600">Best performing products</p>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                              <span className="text-blue-600 font-bold text-lg">
                                {index + 1}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {item.product.title}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-bold text-gray-900">{item.count}</div>
                          <div className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            downloads
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, bgColor, textColor, variants, delay }) => (
  <motion.div
    variants={variants}
    transition={{ delay }}
    className={`bg-gradient-to-br ${bgColor} rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
      </div>
      <div className={`p-3 bg-white rounded-xl shadow-sm`}>
        {icon}
      </div>
    </div>
  </motion.div>
);

export default AdminDashboard;
