import { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [plans, setPlans] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [coupon, setCoupon] = useState("");
  const [couponStatus, setCouponStatus] = useState(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchingPlans, setFetchingPlans] = useState(false);
  const navigate = useNavigate();

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/user/me`, {
        withCredentials: true,
      });
      setUser(res.data);
    } catch (err) {
      console.error("Failed to load user profile", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      setFetchingPlans(true);
      const res = await axios.get(`${BACKEND_URL}/api/plans`, {
        withCredentials: true,
      });
      setPlans(res.data);
    } catch (err) {
      console.error("Failed to load plans", err);
    } finally {
      setFetchingPlans(false);
    }
  };

  const handleApplyCoupon = async () => {
    try {
      setCheckingCoupon(true);
      const res = await axios.post(
        `${BACKEND_URL}/api/coupons/apply`,
        { code: coupon },
        { withCredentials: true }
      );

      const { discountType, discountValue } = res.data;
      let discountAmount = 0;

      if (discountType === "flat") {
        discountAmount = discountValue;
      } else if (discountType === "percentage") {
        discountAmount = Math.floor((selectedPlan.price * discountValue) / 100);
      }

      setCouponStatus({ valid: true, discountAmount });
    } catch (err) {
      const message = err.response?.data?.message || "Invalid coupon";
      setCouponStatus({ valid: false, message });
    } finally {
      setCheckingCoupon(false);
    }
  };

  const handleCheckout = () => {
    let finalAmount = selectedPlan.price;
    if (couponStatus?.valid) {
      finalAmount -= couponStatus.discountAmount;
    }
    navigate(`/payment?amount=${finalAmount}&productId=${selectedPlan._id}`);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const { name, email, createdAt, subscription, freeDownloadsUsed } = user;
  const currentPlanId = subscription?.plan?._id;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
          <h1 className="text-2xl md:text-3xl font-bold">My Profile</h1>
          <p className="text-indigo-100">Manage your account and subscription</p>
        </div>

        {/* Profile Details */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Personal Information</h2>
              <div className="space-y-2">
                <p><span className="font-medium text-gray-700">Name:</span> {name}</p>
                <p><span className="font-medium text-gray-700">Email:</span> {email}</p>
                <p><span className="font-medium text-gray-700">Member Since:</span> {moment(createdAt).format("MMMM D, YYYY")}</p>
              </div>
            </div>
            {
              user.subscription.paymentId === null ?
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Subscription Details</h2>
                <p>You have not purchased any plan yet</p>
              </div>
              :
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Subscription Details</h2>
                {subscription && subscription.plan ? (
                  <div className="space-y-2">
                    <p><span className="font-medium text-gray-700">Plan:</span> {subscription.plan.name}</p>
                    {subscription.plan.price !== 0 ? (
                      <p><span className="font-medium text-gray-700">Downloads:</span> Unlimited</p>
                    ) : (
                      <p>
                        <span className="font-medium text-gray-700">Free Downloads:</span>{" "}
                        <span className={freeDownloadsUsed >= 5 ? "text-red-500" : "text-green-600"}>
                          {freeDownloadsUsed} / 5
                        </span>
                      </p>
                    )}
                    <p><span className="font-medium text-gray-700">Status:</span>{" "}
                      <span className={subscription.active ? "text-green-600" : "text-red-500"}>
                        {subscription.active ? "Active" : "Inactive"}
                      </span>
                    </p>
                    <p><span className="font-medium text-gray-700">Expiry Date:</span> {moment(subscription.endDate).format("MMMM D, YYYY")}</p>
                  </div>
                ) : (
                  <p className="text-gray-600">No active subscription</p>
                )}
              </div>
            }
          </div>

          <button
            onClick={() => {
              setShowModal(true);
              fetchPlans();
            }}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200 flex items-center justify-center"
          >
            {user.subscription.paymentId === null ? "Buy Plan" : "Change Plan"}
          </button>
        </div>
      </div>

      {/* Enhanced Subscription Plans Modal with Animations */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with fade-in animation */}
          <div 
            className="fixed inset-0 bg-indigo-200 bg-opacity-50 transition-opacity duration-300"
            style={{
              opacity: showModal ? 1 : 0,
              backdropFilter: 'blur(4px)'
            }}
            onClick={() => {
              setShowModal(false);
              setSelectedPlan(null);
            }}
          />
          
          {/* Modal container with slide-up animation */}
          <div
            className={`relative bg-white rounded-xl shadow-xl w-full max-w-md mx-2 max-h-[90vh] overflow-y-auto transform transition-all duration-300 ${
              showModal ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <div className="sticky top-0 bg-white z-10 p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Choose a Plan</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedPlan(null);
                }}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4">
              {fetchingPlans ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : plans.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No plans available at the moment.</p>
              ) : (
                <div className="space-y-4">
                  {plans.map((plan) => (
                    <div 
                      key={plan._id} 
                      className={`border rounded-lg p-4 transition-all duration-200 ${
                        selectedPlan?._id === plan._id 
                          ? "border-indigo-500 bg-indigo-50 shadow-md" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-800">{plan.name}</h3>
                            <p className="text-gray-600 text-sm mt-1">{plan.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-gray-800">₹{plan.price}</div>
                            <div className="text-xs text-gray-500">{plan.durationInDays} days</div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          {currentPlanId === plan._id ? (
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              Current Plan
                            </span>
                          ) : plan.name === "Trial" ? (
                            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                              Not Available
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedPlan(plan);
                                setCoupon("");
                                setCouponStatus(null);
                              }}
                              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                selectedPlan?._id === plan._id
                                  ? "bg-indigo-600 text-white"
                                  : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                              }`}
                            >
                              {selectedPlan?._id === plan._id ? "Selected" : "Select"}
                            </button>
                          )}
                        </div>

                        {selectedPlan?._id === plan._id && (
                          <div className="mt-3 space-y-3">
                            <div className="flex flex-col sm:flex-row gap-2">
                              <input
                                type="text"
                                placeholder="Enter coupon code"
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                value={coupon}
                                onChange={(e) => setCoupon(e.target.value)}
                              />
                              <button
                                onClick={handleApplyCoupon}
                                disabled={checkingCoupon || !coupon}
                                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                  checkingCoupon || !coupon
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700 text-white"
                                }`}
                              >
                                {checkingCoupon ? (
                                  <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Applying...
                                  </span>
                                ) : (
                                  "Apply Coupon"
                                )}
                              </button>
                            </div>

                            {couponStatus && (
                              <div className={`p-3 rounded-lg text-sm ${
                                couponStatus.valid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}>
                                {couponStatus.valid ? (
                                  <p>🎉 Coupon applied! You saved ₹{couponStatus.discountAmount}</p>
                                ) : (
                                  <p>{couponStatus.message}</p>
                                )}
                              </div>
                            )}

                            <button
                              onClick={handleCheckout}
                              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 text-sm"
                            >
                              Proceed to Payment - ₹
                              {couponStatus?.valid ? selectedPlan.price - couponStatus.discountAmount : selectedPlan.price}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;