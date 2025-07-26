import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import moment from "moment";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [owned, setOwned] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");

  // Load product and ownership
  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/api/products/${id}`, { withCredentials: true })
      .then((res) => {
        setProduct(res.data);
        setLoading(false);
        checkOwnership();
        fetchComments();
      })
      .catch((err) => {
        console.error("Product not found", err);
        navigate("/");
      });
  }, [id]);

  // Check if user owns product
  const checkOwnership = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/user/owned-products`, {
        withCredentials: true,
      });
      const ownedProductIds = res.data.ownedProducts.map((p) => p._id);
      setOwned(ownedProductIds.includes(id));
    } catch (err) {
      if (err.response?.status === 401) {
        setOwned(false);
      } else {
        console.error("Failed to check ownership", err);
      }
    }
  };

  // Handle product purchase
  const handleBuyNow = async () => {
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/payments/create-product-order`,
        { productId: id },
        { withCredentials: true }
      );
      navigate(`/buy-product?amount=${res.data.amount / 100}&productId=${id}&orderId=${res.data.id}`);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        toast.error("Failed to initiate payment");
        console.error("Payment initiation error:", err);
      }
    }
  };

  // Add or remove from bag
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

  // Load comments
  const fetchComments = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/comments/${id}`);
      setComments(res.data);
    } catch (err) {
      console.error("Failed to load comments", err);
    }
  };

  // Submit new comment
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/comments/${id}`,
        { text: commentText },
        { withCredentials: true }
      );
      setComments((prev) => [res.data, ...prev]);
      setCommentText("");
      toast.success("Comment added");
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        toast.error("Failed to add comment");
      }
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="md:flex">
          {/* Product Image - Made smaller and more professional */}
          <div className="md:w-1/3 p-6 flex items-center justify-center bg-gray-50">
            <img
              className="max-h-80 w-auto object-contain rounded-lg"
              src={`${BACKEND_URL}/${product.imageUrl}`}
              alt={product.title}
            />
          </div>

          {/* Product Details */}
          <div className="md:w-2/3 p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">{product.title}</h1>
                <p className="text-gray-600 mt-1">by {product.author}</p>
              </div>
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                {product.category.name}
              </span>
            </div>

            <div className="mt-4">
              <span className="text-3xl font-bold text-gray-900">₹{product.price}</span>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Description</h3>
                <p className="mt-1 text-sm text-gray-600">{product.shortDescription}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Details</h3>
                <p className="mt-1 text-sm text-gray-600">{product.about}</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900">Tags</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              {owned ? (
                <button
                  onClick={() => navigate('/my-bag')}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition"
                >
                  View in Library
                </button>
              ) : (
                <>
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition"
                  >
                    Buy Now
                  </button>
                  <button
                    onClick={handleToggleLibrary}
                    className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-md transition"
                  >
                    {owned ? "Remove from Bag" : "Add to Bag"}
                  </button>
                </>
              )}
            </div>

            <div className="mt-4 text-xs text-gray-500">
              <p>Released: {moment(product.releaseDate).format("MMMM Do, YYYY")}</p>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="border-t border-gray-200 px-6 py-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Reviews</h3>
          
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Share your thoughts about this product..."
              className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              rows="3"
            />
            <button
              type="submit"
              className="mt-2 bg-indigo-600 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-indigo-700 transition"
            >
              Post Review
            </button>
          </form>

          {comments.length === 0 ? (
            <p className="text-sm text-gray-500">No reviews yet. Be the first to review!</p>
          ) : (
            <div className="space-y-4">
              {comments.map((c) => (
                <div key={c._id} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-medium text-sm">
                        {c.user.name.charAt(0)}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{c.user.name}</p>
                      <p className="text-xs text-gray-500">
                        {moment(c.createdAt).fromNow()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-700">
                    <p>{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;