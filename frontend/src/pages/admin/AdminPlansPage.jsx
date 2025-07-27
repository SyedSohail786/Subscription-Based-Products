import React, { useEffect, useState } from 'react';
import { useAdminPlanStore } from '../../store/adminPlanStore';
import { toast } from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiCheck, FiCreditCard, FiClock, FiDollarSign, FiFileText } from 'react-icons/fi';
import { motion } from 'framer-motion';

const AdminPlansPage = () => {
  const {
    plans,
    fetchPlans,
    createPlan,
    updatePlan,
    deletePlan,
  } = useAdminPlanStore();

  const [form, setForm] = useState({
    name: '',
    price: '',
    durationInDays: '',
    description: '',
  });

  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLoadiing, setIsLoading]=useState("")

  useEffect(() => {
    const loadPlans = async () => {
      setLoading(true);
      await fetchPlans();
      setLoading(false);
    };
    loadPlans();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(editId ? "Updating" : "Submitting")
    const { name, price, durationInDays } = form;
    
    if (!name || !price || !durationInDays) {
      return toast.error('Please fill all required fields');
    }

    try {
      if (editId) {
        await updatePlan(editId, form);
        toast.success('Plan updated successfully');
      } else {
        await createPlan(form);
        toast.success('Plan created successfully');
      }
      setForm({ name: '', price: '', durationInDays: '', description: '' });
      setEditId(null);
      setIsLoading("")
    } catch (error) {
      toast.error(error.message || 'An error occurred');
      setIsLoading("")
    }
  };

  const handleEdit = (plan) => {
    setForm(plan);
    setEditId(plan._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        await deletePlan(id);
        toast.success('Plan deleted successfully');
      } catch (error) {
        toast.error(error.message || 'Failed to delete plan');
      }
    }
  };

  const resetForm = () => {
    setForm({ name: '', price: '', durationInDays: '', description: '' });
    setEditId(null);
  };

  const getDurationText = (days) => {
    if (days === 1) return '1 day';
    if (days === 7) return '1 week';
    if (days === 30) return '1 month';
    if (days === 365) return '1 year';
    if (days % 365 === 0) return `${days / 365} year${days / 365 > 1 ? 's' : ''}`;
    if (days % 30 === 0) return `${days / 30} month${days / 30 > 1 ? 's' : ''}`;
    if (days % 7 === 0) return `${days / 7} week${days / 7 > 1 ? 's' : ''}`;
    return `${days} day${days > 1 ? 's' : ''}`;
  };

  const getPlanStats = () => {
    const totalPlans = plans.length;
    const totalRevenue = plans.reduce((sum, plan) => sum + parseFloat(plan.price || 0), 0);
    const averagePrice = totalPlans > 0 ? totalRevenue / totalPlans : 0;
    
    return { totalPlans, totalRevenue, averagePrice };
  };

  const { totalPlans, totalRevenue, averagePrice } = getPlanStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 sm:p-8 text-white">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <FiCreditCard className="w-8 h-8" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Subscription Plans</h1>
                    <p className="text-white/90">Manage your subscription plans and pricing</p>
                  </div>
                </div>
              </div>
              
              {/* Stats Cards */}
              <div className="p-6 sm:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600">Total Plans</p>
                        <p className="text-2xl font-bold text-blue-900">{totalPlans}</p>
                      </div>
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <FiCreditCard className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-green-900">₹{totalRevenue.toLocaleString()}</p>
                      </div>
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <FiDollarSign className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-600">Average Price</p>
                        <p className="text-2xl font-bold text-purple-900">₹{averagePrice.toFixed(0)}</p>
                      </div>
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <FiClock className="w-5 h-5 text-purple-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Plan Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                {editId ? <FiEdit2 className="w-5 h-5 text-purple-600" /> : <FiPlus className="w-5 h-5 text-purple-600" />}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editId ? 'Edit Subscription Plan' : 'Create New Plan'}
                </h2>
                <p className="text-sm text-gray-600">
                  {editId ? 'Update plan details and pricing' : 'Add a new subscription plan for users'}
                </p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Plan Name*</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCreditCard className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      placeholder="e.g. Monthly Premium, Yearly Pro..."
                      value={form.name}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹)*</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiDollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      name="price"
                      placeholder="e.g. 999"
                      value={form.price}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (Days)*</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiClock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      name="durationInDays"
                      placeholder="e.g. 30 for monthly, 365 for yearly"
                      value={form.durationInDays}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                      required
                      min="1"
                    />
                  </div>
                  {form.durationInDays && (
                    <p className="text-xs text-gray-500 mt-1">
                      Duration: {getDurationText(parseInt(form.durationInDays))}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <div className="relative">
                    <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                      <FiFileText className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea
                      name="description"
                      placeholder="Plan features and benefits..."
                      value={form.description}
                      onChange={handleChange}
                      rows="3"
                      className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                {editId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  >
                    <FiX className="mr-2 inline" />
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 font-medium flex items-center shadow-lg hover:shadow-xl"
                >
                  {editId ? (
                    <>
                      <FiCheck className="mr-2" />
                      { isLoadiing === "Updating" ? "Updating..." : "Update Plan"}
                    </>
                  ) : (
                    <>
                      <FiPlus className="mr-2" />
                      { isLoadiing === "Submitting" ? "Creating..." : "Create Plan"}
                      
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Plans List */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <FiCreditCard className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">All Subscription Plans</h3>
                  <p className="text-sm text-gray-600">{plans.length} plans available</p>
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Plan</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Duration</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {plans.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center">
                          <div className="max-w-sm mx-auto">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <FiCreditCard className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No plans found</h3>
                            <p className="text-gray-600">Get started by creating your first subscription plan</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      plans.map((plan, index) => (
                        <motion.tr 
                          key={plan._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                                <FiCreditCard className="text-purple-600 w-6 h-6" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-gray-900">{plan.name}</div>
                                <div className="text-xs text-gray-500">
                                  Plan ID: {plan._id.slice(-6).toUpperCase()}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-lg font-bold text-gray-900">₹{plan.price}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                              {getDurationText(plan.durationInDays)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-700 max-w-xs">
                              {plan.description || (
                                <span className="text-gray-400 italic">No description</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleEdit(plan)}
                                className="p-2 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded-lg transition-colors"
                                title="Edit Plan"
                              >
                                <FiEdit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(plan._id)}
                                className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Plan"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminPlansPage;
