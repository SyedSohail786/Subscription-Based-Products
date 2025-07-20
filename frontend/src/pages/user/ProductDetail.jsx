import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [owned, setOwned] = useState(false); // ✅ Track if owned

  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/products/${id}`, { withCredentials: true })
      .then(res => {
        setProduct(res.data);
        setLoading(false);
        checkOwnership(); // ✅ Check ownership after product loads
      })
      .catch(err => {
        console.error("Product not found", err);
        navigate("/");
      });
  }, [id]);

  const checkOwnership = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/user/owned-products`, { withCredentials: true });
      const ownedProductIds = res.data.ownedProducts.map(p => p._id);
      setOwned(ownedProductIds.includes(id));
    } catch (err) {
      if (err.response?.status === 401) {
        setOwned(false);
      } else {
        console.error("Failed to check ownership", err);
      }
    }
  };

  const handleDownload = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/user/check-access/${id}`, { withCredentials: true });

      if (res.data.canDownload) {
        const fileUrl = `${BACKEND_URL}/${product.fileUrl.replace(/\\/g, "/")}`;
        window.open(fileUrl, "_blank");
      } else {
        navigate("/login");
      }
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        console.error("Error downloading", err);
      }
    }
  };

  const handleToggleLibrary = async () => {
    try {
      const url = owned
        ? `${BACKEND_URL}/api/user/remove-from-library/${id}`
        : `${BACKEND_URL}/api/user/add-to-library/${id}`;
      
      await axios.post(url, {}, { withCredentials: true });
      setOwned(!owned);
      toast.success(owned ? "Removed from Bag" : "Added to Bag");
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        console.error("Error updating Bag", err);
        toast.error("Something went wrong!");
      }
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <img src={`${BACKEND_URL}/${product.imageUrl}`} alt={product.name} className="w-full h-auto rounded" />

        <div>
          <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
          <p className="text-gray-600 mb-4">{product.description}</p>
          <p className="text-indigo-600 font-bold text-xl mb-4">₹{product.price}</p>

          <div className="flex gap-4">
            <button
              onClick={handleDownload}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Download
            </button>

            <button
              onClick={handleToggleLibrary}
              className={`px-4 py-2 rounded text-white ${owned ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
            >
              {owned ? "Remove from Bag" : "Add to Bag"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
