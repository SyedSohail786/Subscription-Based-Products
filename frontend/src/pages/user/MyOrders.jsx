import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import moment from 'moment';
import React from 'react';
import { FiDownload, FiChevronDown, FiChevronUp, FiShoppingCart, FiArrowLeft, FiCalendar, FiCreditCard, FiPackage } from 'react-icons/fi';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/orders/my-orders`, {
          withCredentials: true
        });
        setOrders(res.data);
      } catch (err) {
        console.error('Error fetching orders:', err);
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const downloadProduct = async (fileUrl, productName) => {
    try {
      const response = await fetch(`${BACKEND_URL}/${fileUrl.replace(/\\/g, "/")}`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch file');
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', productName || 'product-file');
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(link);
      
      toast.success('Download started!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-full mb-6">
        <FiShoppingCart className="h-12 w-12 text-blue-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
      <p className="text-gray-500 text-center max-w-md mb-6">
        You haven't placed any orders yet. Start exploring our collection and make your first purchase!
      </p>
      <Link 
        to="/" 
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
      >
        <FiArrowLeft className="w-4 h-4" />
        Browse Products
      </Link>
    </div>
  );

  const renderOrderCard = (order) => (
    <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <img 
              className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg object-cover border border-gray-200" 
              src={`${BACKEND_URL}/${order.productDetails.imageUrl}`} 
              alt={order.productDetails.title}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/80x80?text=No+Image";
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{order.productDetails.title}</h3>
              <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <FiCalendar className="w-4 h-4" />
                <span>Ordered on {moment(order.createdAt).format('MMM D, YYYY')}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiCreditCard className="w-4 h-4" />
                <span className="font-semibold text-gray-900">₹{order.amount}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiPackage className="w-4 h-4" />
                <span>Order #{order._id.slice(-6).toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => downloadProduct(order.productDetails.fileUrl, order.productDetails.title)}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex-1"
          >
            <FiDownload className="w-4 h-4" />
            Download
          </button>
          <button
            onClick={() => toggleOrderDetails(order._id)}
            className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {expandedOrder === order._id ? (
              <>
                <FiChevronUp className="w-4 h-4" />
                Hide Details
              </>
            ) : (
              <>
                <FiChevronDown className="w-4 h-4" />
                View Details
              </>
            )}
          </button>
        </div>
        
        {expandedOrder === order._id && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Order Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500 font-medium">Order ID</p>
                <p className="text-gray-900 font-semibold">#{order._id.slice(-6).toUpperCase()}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500 font-medium">Payment ID</p>
                <p className="text-gray-900 font-semibold">{order.razorpay_payment_id}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500 font-medium">Order Date</p>
                <p className="text-gray-900 font-semibold">{moment(order.createdAt).format('MMM D, YYYY h:mm A')}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500 font-medium">Amount Paid</p>
                <p className="text-gray-900 font-semibold">₹{order.amount}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600">
              {loading ? "Loading..." : `${orders.length} ${orders.length === 1 ? 'order' : 'orders'}`}
            </p>
          </div>
        </div>
        
        {orders.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="space-y-6">
            {orders.map(renderOrderCard)}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
