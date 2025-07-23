import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const MyBag = () => {
  const [view, setView] = useState("owned"); // "owned" or "history"
  const [ownedProducts, setOwnedProducts] = useState([]);
  const [downloadHistory, setDownloadHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [view]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (view === "owned") {
        const res = await axios.get(`${BACKEND_URL}/api/user/owned-products`, {
          withCredentials: true,
        });
        setOwnedProducts(res.data.ownedProducts);
      } else if (view === "history") {
        const res = await axios.get(`${BACKEND_URL}/api/download/history`, {
          withCredentials: true,
        });
        setDownloadHistory(res.data);
      }
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

  const renderProductCard = (product, downloadDate = null) => (
    <div
      key={product._id + (downloadDate || "")}
      onClick={() => navigate(`/product/${product._id}`)}
      className="cursor-pointer border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden hover:-translate-y-1"
    >
      <div className="relative">
        <img
          src={`${BACKEND_URL}/${product.imageUrl}`}
          alt={product.title}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
          }}
        />
        {downloadDate && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
            {moment(downloadDate).fromNow()}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-1 truncate">{product.title}</h3>
        <p className="text-gray-600 text-sm line-clamp-2 mb-2">{product.description}</p>
        {downloadDate && (
          <p className="text-xs text-gray-500 mt-2">
            Downloaded: {moment(downloadDate).format("MMM D, YYYY")}
          </p>
        )}
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
      <h3 className="text-lg font-medium text-gray-700 mb-1">
        {view === "owned" ? "No products yet" : "No downloads yet"}
      </h3>
      <p className="text-gray-500 text-center max-w-md">
        {view === "owned"
          ? "Products you purchase will appear here"
          : "Your download history will appear here"}
      </p>
      {view === "owned" && (
        <button
          onClick={() => navigate("/")}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          Browse Products
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
          My Bag
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setView("owned")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              view === "owned"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Owned Products
          </button>
          <button
            onClick={() => setView("history")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              view === "history"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Download History
          </button>
        </div>
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
      ) : view === "owned" ? (
        ownedProducts.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {ownedProducts.map(renderProductCard)}
          </div>
        )
      ) : downloadHistory.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {downloadHistory.map((download) =>
            renderProductCard(download.product, download.downloadedAt)
          )}
        </div>
      )}
    </div>
  );
};

export default MyBag;