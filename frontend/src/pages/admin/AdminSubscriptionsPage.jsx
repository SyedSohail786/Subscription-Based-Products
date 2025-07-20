import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/api/subscriptions`, { withCredentials: true });
      setSubscriptions(res.data);
    } catch (err) {
      console.error("Failed to fetch subscriptions:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Subscriptions</h1>

      {loading ? (
        <p>Loading...</p>
      ) : subscriptions.length === 0 ? (
        <p>No subscriptions found.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">User</th>
              <th className="p-2 border">Plan</th>
              <th className="p-2 border">Start Date</th>
              <th className="p-2 border">End Date</th>
              <th className="p-2 border">Active</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => (
              <tr key={sub._id} className="text-center">
                <td className="p-2 border">{sub.user?.name || sub.user?.email}</td>
                <td className="p-2 border">{sub.plan?.name}</td>
                <td className="p-2 border">{new Date(sub.startDate).toLocaleDateString()}</td>
                <td className="p-2 border">{new Date(sub.endDate).toLocaleDateString()}</td>
                <td className="p-2 border">
                  <span className={sub.isActive ? "text-green-600" : "text-red-600"}>
                    {sub.isActive ? "Active" : "Expired"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
