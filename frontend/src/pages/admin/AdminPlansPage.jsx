import React, { useEffect, useState } from 'react';
import { useAdminPlanStore } from '../../store/adminPlanStore';
import { toast } from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiCheck } from 'react-icons/fi';
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
    } catch (error) {
      toast.error(error.message || 'An error occurred');
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

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="p-6 max-w-6xl mx-auto"
    >
      {/* Plan Form */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {editId ? 'Edit Plan' : 'Create New Plan'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Monthly, Yearly..."
                value={form.name}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
              <input
                type="number"
                name="price"
                placeholder="e.g. 999"
                value={form.price}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Days)</label>
              <input
                type="number"
                name="durationInDays"
                placeholder="e.g. 30 for monthly"
                value={form.durationInDays}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
                min="1"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
              <textarea
                name="description"
                placeholder="Plan features and benefits..."
                value={form.description}
                onChange={handleChange}
                rows="3"
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-2">
            {editId && (
              <button
                type="button"
                onClick={() => {
                  setForm({ name: '', price: '', durationInDays: '', description: '' });
                  setEditId(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <FiX className="inline mr-2" />
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
            >
              {editId ? (
                <>
                  <FiCheck className="mr-2" />
                  Update Plan
                </>
              ) : (
                <>
                  <FiPlus className="mr-2" />
                  Create Plan
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Plans List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <h3 className="text-xl font-semibold p-6 text-gray-800">All Subscription Plans</h3>
        
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {plans.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      No plans found. Create your first plan above.
                    </td>
                  </tr>
                ) : (
                  plans.map((plan) => (
                    <motion.tr 
                      key={plan._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{plan.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">₹{plan.price}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{plan.durationInDays} days</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {plan.description || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(plan)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          <FiEdit2 className="inline mr-1" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(plan._id)}
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
        )}
      </div>
    </motion.div>
  );
};

export default AdminPlansPage;