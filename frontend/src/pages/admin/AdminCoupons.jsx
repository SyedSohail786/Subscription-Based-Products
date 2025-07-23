import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
    try {
      const payload = {
        ...form,
        expiresAt: form.expiresAt.toISOString()
      };
      await axios.post(`${BACKEND_URL}/api/coupons`, payload, { withCredentials: true });
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Coupon Management</h2>
      </div>

      {/* Create Coupon Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Create New Coupon</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Code</label>
            <input
              type="text"
              name="code"
              placeholder="e.g. SUMMER20"
              value={form.code}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Discount Type</label>
            <Select
              name="discountType"
              options={discountTypeOptions}
              value={discountTypeOptions.find(option => option.value === form.discountType)}
              onChange={handleSelectChange}
              className="basic-single"
              classNamePrefix="select"
              isSearchable={false}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {form.discountType === 'percentage' ? 'Percentage' : 'Amount'}
            </label>
            <input
              type="number"
              name="discountValue"
              placeholder={form.discountType === 'percentage' ? 'e.g. 20' : 'e.g. 10'}
              value={form.discountValue}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
            <DatePicker
              selected={form.expiresAt}
              onChange={handleDateChange}
              minDate={new Date()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Usage Limit</label>
            <input
              type="number"
              name="usageLimit"
              placeholder="e.g. 100"
              value={form.usageLimit}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2 lg:col-span-5 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Create Coupon
            </button>
          </div>
        </form>
      </div>

      {/* Coupons List */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Active Coupons</h3>
        
        {coupons.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No coupons available. Create your first coupon above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {coupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm font-mono">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {coupon.discountType === 'percentage' ? (
                        <span className="text-green-600 font-medium">{coupon.discountValue}% off</span>
                      ) : (
                        <span className="text-green-600 font-medium">₹{coupon.discountValue} off</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {new Date(coupon.expiresAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-600">
                        {coupon.usedBy.length} / {coupon.usageLimit}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-start">
                      <button
                        onClick={() => handleDelete(coupon._id)}
                        className="text-red-600 hover:text-red-900 hover:bg-red-50 px-3 py-1 rounded-md transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCoupons;