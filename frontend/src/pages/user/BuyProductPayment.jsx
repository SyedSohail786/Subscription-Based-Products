import { useEffect } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import toast from "react-hot-toast";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const BuyProductPayment = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const amount = params.get("amount");
  console.log(amount)
  const productId = params.get("productId");
  const { user } = useAuthStore();
  const userId = user._id;

  const handlePayment = async () => {
    const res = await loadRazorpayScript();
    if (!res) return toast.error("Razorpay SDK failed to load");

    const { data: order } = await axios.post(
      `${BACKEND_URL}/api/payments/create-product-order`, 
      { productId },
      { withCredentials: true }
    );

    const razor = new window.Razorpay({
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: "INR",
      name: "Digital Store",
      description: "Purchase Digital Product",
      order_id: order.id,
      handler: async (response) => {
        const payload = {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          productId,
        };

        const verifyRes = await axios.post(
          `${BACKEND_URL}/api/payments/verify-product`, 
          payload, 
          { withCredentials: true }
        );
        
        if (verifyRes.data.success) {
          toast.success("Payment Successful! Product added to your library.");
          navigate("/profile");
        } else {
          toast.error("Payment Verification Failed");
        }
      },
      prefill: {
        email: user.email,
        name: user.name,
      },
      theme: { color: "#4f46e5" },
    });

    razor.open();
  };

  useEffect(() => {
    if (amount && productId) handlePayment();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md overflow-hidden p-6 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mx-auto mb-6"></div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Processing Your Payment</h2>
        <p className="text-gray-600 mb-6">
          You'll be redirected to Razorpay's secure payment page shortly.
        </p>
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Amount:</span>
            <span className="font-medium">₹{amount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Payment Method:</span>
            <span className="font-medium">Credit/Debit Card, UPI, Net Banking</span>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          If you're not redirected automatically, please check your pop-up blocker settings.
        </p>
      </div>
    </div>
  );
};

export default BuyProductPayment;