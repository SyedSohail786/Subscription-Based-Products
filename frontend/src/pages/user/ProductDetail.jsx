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
      const action = owned ? 'remove-from-library' : 'add-to-library';
      const url = `${BACKEND_URL}/api/user/${action}/${id}`;

      await axios.post(url, {}, { withCredentials: true });
      setOwned(!owned);
      toast.success(owned ? "Removed from Bag" : "Added to Bag");
      
      // Refresh ownership status after adding to bag
      if (!owned) {
        await checkOwnership();
      }
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
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
        <div className="md:flex">
          {/* Product Image */}
          <div className="md:w-1/3 p-6 flex items-center justify-center bg-gray-50">
            <img
              className="max-h-96 w-auto object-contain rounded-lg"
              src={`${BACKEND_URL}/${product.imageUrl}`}
              alt={product.title}
            />
          </div>

          {/* Product Details */}
          <div className="md:w-2/3 p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.title}</h1>
                <p className="text-gray-600 mb-4">by {product.author}</p>
              </div>
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                {product.category.name}
              </span>
            </div>

            <div className="mb-6">
              <span className="text-3xl font-bold text-gray-900">₹{product.price}</span>
              <span className="ml-2 text-sm text-gray-500">+ applicable taxes</span>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-1">Description</h3>
                <p className="text-gray-600">{product.shortDescription}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-1">Details</h3>
                <p className="text-gray-600">{product.about}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <button
                onClick={handleBuyNow}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-md transition transform hover:scale-105"
              >
                Buy Now
              </button>
              
              <button
                onClick={handleToggleLibrary}
                className={`flex-1 font-medium py-3 px-6 rounded-md transition transform hover:scale-105 ${
                  owned 
                    ? "bg-red-100 hover:bg-red-200 text-red-800 border border-red-200"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200"
                }`}
              >
                {owned ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Remove from Bag
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                    </svg>
                    Add to Bag
                  </span>
                )}
              </button>
            </div>

            <p className="text-sm text-gray-500">
              Released: {moment(product.releaseDate).format("MMMM Do, YYYY")}
            </p>
          </div>
        </div>

        {/* Comments Section */}
        <div className="border-t border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Reviews</h3>
          
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Share your thoughts about this product..."
              className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows="3"
            />
            <button
              type="submit"
              className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Post Review
            </button>
          </form>

          {comments.length === 0 ? (
            <p className="text-gray-500">No reviews yet. Be the first to review!</p>
          ) : (
            <div className="space-y-4">
              {comments.map((c) => (
                <div key={c._id} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-medium">
                      {c.user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{c.user.name}</p>
                      <p className="text-xs text-gray-500">
                        {moment(c.createdAt).fromNow()}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700">{c.text}</p>
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