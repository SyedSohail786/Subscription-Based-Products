import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const MyBag = () => {
  const [view, setView] = useState("owned"); // "owned" or "history"
  const [ownedProducts, setOwnedProducts] = useState([]);
  const [downloadHistory, setDownloadHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [view]);

  const fetchData = async () => {
    setLoading(true);
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
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const renderProductCard = (product) => (
    <div
      key={product._id}
      onClick={() => navigate(`/product/${product._id}`)}
      className="cursor-pointer border rounded-lg shadow hover:shadow-md transition"
    >
      <img
        src={`${BACKEND_URL}/${product.imageUrl}`}
        alt={product.title}
        className="w-full h-48 object-cover rounded-t-lg"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-1">{product.title}</h3>
        <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Bag</h1>
        <div className="space-x-2">
          <button
            onClick={() => setView("owned")}
            className={`px-4 py-2 rounded ${
              view === "owned" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Owned Products
          </button>
          <button
            onClick={() => setView("history")}
            className={`px-4 py-2 rounded ${
              view === "history" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Download History
          </button>
        </div>
      </div>

      {loading ? (
        <p className="p-6">Loading...</p>
      ) : view === "owned" ? (
        ownedProducts.length === 0 ? (
          <p className="p-6 text-gray-600">You haven’t added any products yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {ownedProducts.map(renderProductCard)}
          </div>
        )
      ) : downloadHistory.length === 0 ? (
        <p className="p-6 text-gray-600">No downloads yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {downloadHistory.map((download) =>
            renderProductCard(download.product)
          )}
        </div>
      )}
    </div>
  );
};

export default MyBag;
