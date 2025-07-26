import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import moment from 'moment';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const { user } = useAuthStore();

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h1>
      
      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600">You haven't placed any orders yet.</p>
          <Link 
            to="/" 
            className="mt-4 inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Mobile/Tablet View - Cards */}
          <div className="lg:hidden space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-16 w-16">
                      <img 
                        className="h-16 w-16 rounded object-cover" 
                        src={`${BACKEND_URL}/${order.productDetails.imageUrl}`} 
                        alt={order.productDetails.title} 
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">{order.productDetails.title}</h3>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Ordered on {moment(order.createdAt).format('MMM D, YYYY')}
                      </p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        ₹{order.amount}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-between">
                    <button
                      onClick={() => downloadProduct(order.productDetails.fileUrl, order.productDetails.title)}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => toggleOrderDetails(order._id)}
                      className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                    >
                      {expandedOrder === order._id ? 'Hide Details' : 'View Details'}
                    </button>
                  </div>
                  
                  {expandedOrder === order._id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Order Details</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-gray-500">Order ID:</div>
                        <div className="text-gray-900">#{order._id.slice(-6).toUpperCase()}</div>
                        
                        <div className="text-gray-500">Payment ID:</div>
                        <div className="text-gray-900">{order.razorpay_payment_id}</div>
                        
                        <div className="text-gray-500">Order Date:</div>
                        <div className="text-gray-900">{moment(order.createdAt).format('MMM D, YYYY h:mm A')}</div>
                        
                        <div className="text-gray-500">Amount Paid:</div>
                        <div className="text-gray-900">₹{order.amount}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Desktop View - Table */}
          <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <>
                      <tr key={order._id}>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img 
                                className="h-10 w-10 rounded" 
                                src={`${BACKEND_URL}/${order.productDetails.imageUrl}`} 
                                alt={order.productDetails.title} 
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{order.productDetails.title}</div>
                              <div className="text-sm text-gray-500">Order #{order._id.slice(-6).toUpperCase()}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {moment(order.createdAt).format('MMM D, YYYY')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{order.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => downloadProduct(order.productDetails.fileUrl, order.productDetails.title)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            Download
                          </button>
                          <button
                            onClick={() => toggleOrderDetails(order._id)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            {expandedOrder === order._id ? 'Hide Details' : 'View Details'}
                          </button>
                        </td>
                      </tr>
                      {expandedOrder === order._id && (
                        <tr className="bg-gray-50">
                          <td colSpan="5" className="px-6 py-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500">Order ID:</p>
                                <p className="text-gray-900">#{order._id.slice(-6).toUpperCase()}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Payment ID:</p>
                                <p className="text-gray-900">{order.razorpay_payment_id}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Order Date:</p>
                                <p className="text-gray-900">{moment(order.createdAt).format('MMM D, YYYY h:mm A')}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Amount Paid:</p>
                                <p className="text-gray-900">₹{order.amount}</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;