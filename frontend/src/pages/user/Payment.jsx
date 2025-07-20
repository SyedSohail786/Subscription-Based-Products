import { useEffect } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

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

const Payment = () => {
     const [params] = useSearchParams();
     const navigate = useNavigate();
     const amount = params.get("amount");
     const productId = params.get("productId");
     const { user } = useAuthStore()
     const userId = user._id

     const handlePayment = async () => {
          const res = await loadRazorpayScript();
          if (!res) return alert("Razorpay SDK failed to load");

          const { data: order } = await axios.post(`${BACKEND_URL}/api/payments/create-order`, { amount }, { withCredentials: true });

          const razor = new window.Razorpay({
               key: import.meta.env.VITE_RAZORPAY_KEY_ID,
               amount: order.amount,
               currency: "INR",
               name: "Digital Store",
               description: "Buy Digital Product",
               order_id: order.id,
               handler: async (response) => {
                    const payload = {
                         razorpay_order_id: response.razorpay_order_id,
                         razorpay_payment_id: response.razorpay_payment_id,
                         razorpay_signature: response.razorpay_signature,
                         userId,
                         planId: productId, // If using productId as planId
                    };

                    const verifyRes = await axios.post(`${BACKEND_URL}/api/payments/verify`, payload, { withCredentials: true });
                    if (verifyRes.data.success) {
                         alert("Payment Successful!");
                         navigate("/"); // or redirect to success page
                    } else {
                         alert("Payment Verification Failed");
                    }
               },
               prefill: {
                    email: localStorage.getItem("email"),
                    name: localStorage.getItem("name"),
               },
               theme: { color: "#4f46e5" },
          });

          razor.open();
     };

     useEffect(() => {
          if (amount && productId) handlePayment();
     }, []);

     return (
          <div className="flex justify-center items-center h-screen">
               <p>Processing your payment...</p>
          </div>
     );
};

export default Payment;
