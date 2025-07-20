import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/products/${id}`)
      .then(res => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Product not found", err);
        navigate("/");
      });
  }, [id]);

  const toggleCart = async () => {
    try {
      if (addedToCart) {
        await axios.delete(`${BACKEND_URL}/api/cart/remove/${product._id}`, { withCredentials:  true});
        setAddedToCart(false);
      } else {
        await axios.post(`${BACKEND_URL}/api/cart/add`, { productId: product._id }, { withCredentials:  true});
        setAddedToCart(true);
      }
    } catch (err) {
      console.error("Cart error", err);
    }
  };

  const handleBuyNow = async () => {
    // Redirect to Razorpay checkout (we’ll integrate that next)
    navigate(`/payment/${product._id}`);
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <img src={`${BACKEND_URL}/${product.imageUrl}`} alt={product.name} className="w-full h-auto rounded" />
        
        <div>
          <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
          <p className="text-gray-600 mb-4">{product.description}</p>
          <p className="text-indigo-600 font-bold text-xl mb-4">{product.price} ₹</p>

          <div className="flex gap-4">
            <button
              onClick={toggleCart}
              className={`px-4 py-2 rounded text-white ${
                addedToCart ? "bg-red-500" : "bg-green-600"
              }`}
            >
              {addedToCart ? "Remove from Cart" : "Add to Cart"}
            </button>
            <button
              onClick={handleBuyNow}
              className="px-4 py-2 rounded bg-indigo-600 text-white"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
