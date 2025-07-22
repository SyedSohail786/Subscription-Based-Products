import { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [plans, setPlans] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch current user
  const fetchUser = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/user/me`, {
        withCredentials: true,
      });
      setUser(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load user profile", err);
    }
  };

  // Fetch subscription plans
  const fetchPlans = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/plans`, {
        withCredentials: true,
      });
      setPlans(res.data);
    } catch (err) {
      console.error("Failed to load plans", err);
    }
  };

  // Handle plan selection → redirect to /payment
  const handlePlanSelect = (plan) => {
    const amount = plan.price
    navigate(`/payment?amount=${amount}&productId=${plan._id}`);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading || !user) return <p className="p-6">Loading...</p>;

  const { name, email, createdAt, subscription, freeDownloadsUsed } = user;
  const currentPlanId = subscription?.plan?._id;
  const currentPlanName = subscription?.plan?.name;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      <div className="bg-white shadow p-6 rounded-md space-y-4">
        <div><strong>Name:</strong> {name}</div>
        <div><strong>Email:</strong> {email}</div>
        <div><strong>Joined On:</strong> {moment(createdAt).format("MMMM D, YYYY")}</div>

        <hr className="my-4" />

        <h2 className="text-lg font-semibold">Subscription</h2>
        {subscription && subscription.plan ? (
          <>
            <div><strong>Plan:</strong> {subscription.plan.name}</div>
            {
              subscription.plan.price != 0 ?
                <div><strong>Downloads: </strong> Unlimited </div> :
                <div><strong>Free Download Used:</strong> {freeDownloadsUsed} / 5</div>

            }
            <div><strong>Status:</strong> {subscription.active ? "Active" : "Inactive"}</div>
            <div><strong>Expires On:</strong> {moment(subscription.endDate).format("MMMM D, YYYY")}</div>
          </>
        ) : (
          <p className="text-gray-600">No active subscription.</p>
        )}

        <button
          onClick={() => {
            setShowModal(true);
            fetchPlans();
          }}
          className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Change Plan
        </button>
      </div>

      {/* 📦 Subscription Plans Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md w-full max-w-lg space-y-4">
            <h2 className="text-xl font-bold mb-4">Choose a Plan</h2>

            {plans.length === 0 ? (
              <p>No plans available.</p>
            ) : (
              plans.map((plan) => (
                <div key={plan._id} className="border rounded p-4 mb-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{plan.name} — ₹{plan.price}</h3>
                      <p className="text-sm text-gray-600">{plan.description}</p>
                      <p className="text-sm mt-1">Duration: {plan.durationInDays} days</p>
                    </div>

                    {currentPlanId === plan._id ? (
                      <span className="text-sm text-green-600 font-semibold">Already Selected</span>
                    ) : (

                      <>
                        {
                          plan.name === "Trial" && currentPlanId !== plan._id
                            ?
                            <span className="text-sm text-red-600 font-semibold">Invalid Plan</span>

                            :
                            <button
                              onClick={() => handlePlanSelect(plan)}
                              className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
                            >
                              Select
                            </button>
                        }
                      </>

                    )}
                  </div>
                </div>
              ))
            )}

            <button
              onClick={() => setShowModal(false)}
              className="text-sm text-gray-500 mt-4"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
