import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Ticket, Percent, Users, TrendingUp } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    expiresAt: new Date(new Date().setDate(new Date().getDate() + 30)), // Default to 30 days from now
    usageLimit: 100,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const discountTypeOptions = [
    { value: "percentage", label: "Percentage" },
    { value: "flat", label: "Flat Amount" },
  ];

  const fetchCoupons = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/coupons`, { withCredentials: true });
      setCoupons(res.data);
    } catch (err) {
      toast.error("Failed to fetch coupons");
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (selectedOption, { name }) => {
    setForm({ ...form, [name]: selectedOption.value });
  };

  const handleDateChange = (date) => {
    setForm({ ...form, expiresAt: date });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true)
    try {
      const payload = {
        ...form,
        expiresAt: form.expiresAt.toISOString()
      };
      await axios.post(`${BACKEND_URL}/api/coupons`, payload, { withCredentials: true });
      setIsSubmitting(false)
      toast.success("Coupon created successfully");
      setForm({
        code: "",
        discountType: "percentage",
        discountValue: "",
        expiresAt: new Date(new Date().setDate(new Date().getDate() + 30)),
        usageLimit: 100,
      });
      fetchCoupons();
    } catch (err) {
      setIsSubmitting(false)
      toast.error(err.response?.data?.message || "Failed to create coupon");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/coupons/${id}`, { withCredentials: true });
      toast.success("Coupon deleted successfully");
      fetchCoupons();
    } catch (err) {
      toast.error("Failed to delete coupon");
    }
  };

  const stats = [
    {
      title: "Total Coupons",
      value: coupons.length,
      icon: <Ticket className="h-6 w-6" />,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      title: "Active Coupons",
      value: coupons.filter(c => new Date(c.expiresAt) > new Date()).length,
      icon: <TrendingUp className="h-6 w-6" />,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      title: "Total Usage",
      value: coupons.reduce((acc, c) => acc + c.usedBy.length, 0),
      icon: <Users className="h-6 w-6" />,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    },
    {
      title: "Avg. Discount",
      value: coupons.length ? `${Math.round(coupons.reduce((acc, c) => acc + Number(c.discountValue), 0) / coupons.length)}%` : "0%",
      icon: <Percent className="h-6 w-6" />,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">Coupon Management</h1>
            <p className="text-blue-100 text-lg">Create and manage discount coupons for your store</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <div className={stat.textColor}>{stat.icon}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create Coupon Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 mr-3">
              <Ticket className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Create New Coupon</h3>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Coupon Code</label>
              <input
                type="text"
                name="code"
                placeholder="e.g. SUMMER20"
                value={form.code}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 uppercase transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Discount Type</label>
              <Select
                name="discountType"
                options={discountTypeOptions}
                value={discountTypeOptions.find(option => option.value === form.discountType)}
                onChange={handleSelectChange}
                className="basic-single"
                classNamePrefix="select"
                isSearchable={false}
                menuPortalTarget={document.body}
                styles={{
                  control: (base) => ({
                    ...base,
                    padding: '4px',
                    borderRadius: '8px',
                    borderColor: '#d1d5db',
                    '&:hover': { borderColor: '#6366f1' },
                    '&:focus': { borderColor: '#6366f1', boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.2)' }
                  }),
                  menuPortal: (base) => ({ ...base, zIndex: 9999 })
                }}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {form.discountType === 'percentage' ? 'Percentage' : 'Amount'}
              </label>
              <input
                type="number"
                name="discountValue"
                placeholder={form.discountType === 'percentage' ? 'e.g. 20' : 'e.g. 10'}
                value={form.discountValue}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
              <DatePicker
                selected={form.expiresAt}
                onChange={handleDateChange}
                minDate={new Date()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Usage Limit</label>
              <input
                type="number"
                name="usageLimit"
                placeholder="e.g. 100"
                value={form.usageLimit}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-5 flex justify-end">
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                { isSubmitting ? "Creating..." : "Create Coupon" }
                
              </button>
            </div>
          </form>
        </div>

        {/* Coupons List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">All Coupons</h3>
          </div>
          <div className="p-6">
            {coupons.length === 0 ? (
              <div className="text-center py-12">
                <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">No coupons available</p>
                <p className="text-gray-400">Create your first coupon above to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Code</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Discount</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Expires</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Usage</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {coupons.map((coupon) => {
                      const isExpired = new Date(coupon.expiresAt) <= new Date();
                      return (
                        <tr key={coupon._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className={`px-3 py-1 rounded-lg text-sm font-mono font-medium ${
                                isExpired ? 'bg-gray-100 text-gray-500' : 'bg-indigo-100 text-indigo-800'
                              }`}>
                                {coupon.code}
                              </span>
                              {isExpired && (
                                <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">Expired</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Percent className="h-4 w-4 text-green-500 mr-1" />
                              {coupon.discountType === 'percentage' ? (
                                <span className="text-green-600 font-semibold">{coupon.discountValue}% off</span>
                              ) : (
                                <span className="text-green-600 font-semibold">₹{coupon.discountValue} off</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                            <div className="text-sm">
                              {new Date(coupon.expiresAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-1">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">{coupon.usedBy.length} / {coupon.usageLimit}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                  <div 
                                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min((coupon.usedBy.length / coupon.usageLimit) * 100, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleDelete(coupon._id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-all duration-200 font-medium"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCoupons;
