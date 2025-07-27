import { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { FiUser, FiCalendar, FiMail, FiCreditCard, FiCheck, FiX, FiLoader, FiArrowLeft } from "react-icons/fi";

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
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const { name, email, createdAt, subscription, freeDownloadsUsed } = user;
  const currentPlanId = subscription?.plan?._id;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600">Manage your account and subscription</p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 sm:p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center">
                <FiUser className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">{name}</h2>
                <p className="text-blue-100">{email}</p>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-6 border border-blue-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FiUser className="w-4 h-4 text-blue-600" />
                  </div>
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg mt-1">
                        <FiUser className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Full Name</p>
                        <p className="text-base font-semibold text-gray-900">{name}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg mt-1">
                        <FiMail className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Email Address</p>
                        <p className="text-base font-semibold text-gray-900 break-all">{email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg mt-1">
                        <FiCalendar className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Member Since</p>
                        <p className="text-base font-semibold text-gray-900">{moment(createdAt).format("MMMM D, YYYY")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscription Details */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 sm:p-6 border border-green-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FiCreditCard className="w-4 h-4 text-green-600" />
                  </div>
                  Subscription Details
                </h3>
                {user.subscription.paymentId === null ? (
                  <div className="bg-white rounded-xl p-6 shadow-sm text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiCreditCard className="w-8 h-8 text-gray-500" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No Active Plan</h4>
                    <p className="text-gray-600 text-sm">You haven't purchased any plan yet. Explore our plans to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-100 rounded-lg mt-1">
                          <FiCreditCard className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Current Plan</p>
                          <p className="text-base font-bold text-gray-900">{subscription.plan.name}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg mt-1">
                          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Downloads Available</p>
                          {subscription.plan.price !== 0 ? (
                            <p className="text-base font-bold text-green-600">Unlimited</p>
                          ) : (
                            <p className="text-base font-bold">
                              <span className={freeDownloadsUsed >= 5 ? "text-red-500" : "text-green-600"}>
                                {freeDownloadsUsed} / 5 Used
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg mt-1 ${subscription.active ? 'bg-green-100' : 'bg-red-100'}`}>
                          {subscription.active ? (
                            <FiCheck className="w-4 h-4 text-green-600" />
                          ) : (
                            <FiX className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Status</p>
                          <div className="flex items-center gap-2">
                            <span className={`text-base font-bold ${subscription.active ? "text-green-600" : "text-red-500"}`}>
                              {subscription.active ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg mt-1">
                          <FiCalendar className="w-4 h-4 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Expires On</p>
                          <p className="text-base font-bold text-gray-900">{moment(subscription.endDate).format("MMMM D, YYYY")}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={() => {
                  setShowModal(true);
                  fetchPlans();
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <FiCreditCard className="w-5 h-5" />
                {user.subscription.paymentId === null ? "Explore Plans" : "Upgrade Plan"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Subscription Plans Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-indigo-50 bg-opacity-50 transition-opacity duration-300"
            onClick={() => {
              setShowModal(false);
              setSelectedPlan(null);
            }}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-2 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 p-4 border-b border-gray-200 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-900">Choose a Plan</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedPlan(null);
                }}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {fetchingPlans ? (
                <div className="flex justify-center py-12">
                  <FiLoader className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              ) : plans.length === 0 ? (
                <p className="text-center text-gray-500 py-12">No plans available at the moment.</p>
              ) : (
                <div className="space-y-4">
                  {plans.map((plan) => (
                    <div 
                      key={plan._id} 
                      className={`border-2 rounded-xl p-3 transition-all duration-200 ${
                        selectedPlan?._id === plan._id 
                          ? "border-blue-500 bg-blue-50" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">{plan.name}</h3>
                            <p className="text-gray-600 text-sm mt-1">{plan.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-gray-900">₹{plan.price}</div>
                            <div className="text-xs text-gray-500">{plan.durationInDays} days</div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          {currentPlanId === plan._id ? (
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1">
                              <FiCheck className="w-3 h-3" />
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
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                selectedPlan?._id === plan._id
                                  ? "bg-blue-600 text-white"
                                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                              }`}
                            >
                              {selectedPlan?._id === plan._id ? "Selected" : "Select"}
                            </button>
                          )}
                        </div>

                        {selectedPlan?._id === plan._id && (
                          <div className="mt-4 space-y-3 pt-4 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row gap-2">
                              <input
                                type="text"
                                placeholder="Enter coupon code"
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={coupon}
                                onChange={(e) => setCoupon(e.target.value)}
                              />
                              <button
                                onClick={handleApplyCoupon}
                                disabled={checkingCoupon || !coupon}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  checkingCoupon || !coupon
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-green-600 hover:bg-green-700 text-white"
                                }`}
                              >
                                {checkingCoupon ? (
                                  <FiLoader className="w-4 h-4 animate-spin" />
                                ) : (
                                  "Apply"
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
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                            >
                              <FiCreditCard className="w-4 h-4" />
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
