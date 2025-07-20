import React, { useEffect, useState } from 'react';
import { useAdminPlanStore } from '../../store/adminPlanStore';
import toast from 'react-hot-toast';

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

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const { name, price, durationInDays } = form;
    if (!name || !price || !durationInDays) {
      return toast.error('Please fill all required fields');
    }

    if (editId) {
      await updatePlan(editId, form);
      setEditId(null);
    } else {
      await createPlan(form);
    }

    setForm({ name: '', price: '', durationInDays: '', description: '' });
  };

  const handleEdit = (plan) => {
    setForm(plan);
    setEditId(plan._id);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this plan?')) {
      await deletePlan(id);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">{editId ? 'Edit Plan' : 'Create Plan'}</h2>

      <div className="grid grid-cols-1 gap-4 bg-white p-4 rounded shadow">
        <input
          type="text"
          name="name"
          placeholder="Plan Name (Monthly, Yearly...)"
          value={form.name}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="number"
          name="durationInDays"
          placeholder="Duration in Days (e.g. 30)"
          value={form.durationInDays}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <textarea
          name="description"
          placeholder="Description (optional)"
          value={form.description}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {editId ? 'Update Plan' : 'Create Plan'}
        </button>
      </div>

      <h3 className="text-xl font-semibold mt-8 mb-4">All Plans</h3>

      <div className="overflow-x-auto">
        <table className="w-full border mt-2">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Price</th>
              <th className="p-2 border">Duration (Days)</th>
              <th className="p-2 border">Description</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr key={plan._id} className="text-center">
                <td className="p-2 border">{plan.name}</td>
                <td className="p-2 border">₹{plan.price}</td>
                <td className="p-2 border">{plan.durationInDays}</td>
                <td className="p-2 border">{plan.description || '-'}</td>
                <td className="p-2 border space-x-2">
                  <button
                    onClick={() => handleEdit(plan)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(plan._id)}
                    className="bg-red-600 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {plans.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center p-4">
                  No plans found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPlansPage;
