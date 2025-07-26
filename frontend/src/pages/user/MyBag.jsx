import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const MyBag = () => {
  const [ownedProducts, setOwnedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/user/owned-products`, {
        withCredentials: true,
      });
      setOwnedProducts(res.data.ownedProducts);
    } catch (err) {
      console.error("Error fetching data", err);
      setError(err.response?.data?.message || "Failed to load data");
      if (err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderProductCard = (product) => (
    <div
      key={product._id}
      className="cursor-pointer border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden hover:-translate-y-1"
    >
      <div 
        className="relative aspect-square" 
        onClick={() => navigate(`/product/${product._id}`)}
      >
        <img
          src={`${BACKEND_URL}/${product.imageUrl.replace(/\\/g, "/")}`}
          alt={product.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
          }}
        />
      </div>
      <div className="p-4">
        <h3 
          className="font-semibold text-gray-800 mb-1 truncate hover:text-blue-600"
          onClick={() => navigate(`/product/${product._id}`)}
        >
          {product.title}
        </h3>
        <div className="flex justify-between items-center mt-3">
          <span className="text-gray-900 font-medium">₹{product.price}</span>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/product/${product._id}`);
            }}
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
          >
            View
          </button>
        </div>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="bg-gray-100 p-6 rounded-full mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 7h-4V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-700 mb-1">No products yet</h3>
      <p className="text-gray-500 text-center max-w-md">
        Products you purchase will appear here
      </p>
      <button
        onClick={() => navigate("/")}
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
      >
        Browse Products
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          My Bag
        </h1>
        <p className="text-gray-500 mt-1">
          {ownedProducts.length} {ownedProducts.length === 1 ? 'item' : 'items'}
        </p>
      </div>

      {error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : ownedProducts.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {ownedProducts.map(renderProductCard)}
        </div>
      )}
    </div>
  );
};

export default MyBag;