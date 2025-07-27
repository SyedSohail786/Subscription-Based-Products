import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiShoppingBag, FiEye, FiArrowLeft } from "react-icons/fi";

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
      className="group bg-white rounded-xl shadow-sm hover:shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 cursor-pointer"
      onClick={() => navigate(`/product/${product._id}`)}
    >
      <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
        <img
          src={`${BACKEND_URL}/${product.imageUrl.replace(/\\/g, "/")}`}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/300x400/f3f4f6/9ca3af?text=No+Image";
          }}
          loading="lazy"
        />
        <div className="absolute bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white rounded-full p-3 shadow-lg">
              <FiEye className="w-5 h-5 text-gray-700" />
            </div>
          </div>
        </div>
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm sm:text-base group-hover:text-blue-600 transition-colors">
          {product.title}
        </h3>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-3">
          <span className="text-base sm:text-lg font-bold text-gray-900">₹{product.price}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/product/${product._id}`);
            }}
            className="flex items-center justify-center gap-1 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors w-full sm:w-auto"
          >
            <FiEye className="w-3 h-3 sm:w-4 sm:h-4" />
            View
          </button>
        </div>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-full mb-6">
        <FiShoppingBag className="h-12 w-12 text-blue-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Your bag is empty</h3>
      <p className="text-gray-500 text-center max-w-md mb-6">
        Products you purchase will appear here. Start exploring our collection to find something you love!
      </p>
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
      >
        <FiArrowLeft className="w-4 h-4" />
        Browse Products
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                My Bag
              </h1>
              <p className="text-gray-600 mt-1">
                {loading ? "Loading..." : `${ownedProducts.length} ${ownedProducts.length === 1 ? 'item' : 'items'}`}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="h-4 w-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-red-800">Error loading your bag</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <button
                  onClick={fetchData}
                  className="mt-3 text-sm text-red-600 hover:text-red-500 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent"></div>
          </div>
        ) : ownedProducts.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {ownedProducts.map(renderProductCard)}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBag;
