import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import moment from "moment";
import useAuthStore from "../../store/authStore";
import { FiArrowLeft, FiShoppingBag, FiDownload, FiStar, FiUser, FiCalendar, FiTag, FiInfo } from "react-icons/fi";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inBag, setInBag] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const { user } = useAuthStore();

  // Load product and check purchase status
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, commentsRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/products/${id}`, { withCredentials: true }),
          axios.get(`${BACKEND_URL}/api/comments/${id}`)
        ]);

        setProduct(productRes.data);
        setAverageRating(productRes.data.averageRating || 0);
        setTotalReviews(productRes.data.reviewCount || 0);
        setComments(commentsRes.data.comments || []);

        await checkBagStatus();
        await checkPurchaseStatus();
      } catch (err) {
        console.error("Error loading product:", err);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    window.scrollTo(0, 0);
  }, [id]);

  // Check if product is in user's bag
  const checkBagStatus = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/user/owned-products`, {
        withCredentials: true,
      });
      const bagProductIds = res.data.ownedProducts.map((p) => p._id);
      setInBag(bagProductIds.includes(id));
    } catch (err) {
      if (err.response?.status === 401) {
        setInBag(false);
      } else {
        console.error("Failed to check bag status", err);
      }
    }
  };

  // Check if user has purchased the product
  const checkPurchaseStatus = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/orders/check-purchase/${id}`, {
        withCredentials: true,
      });
      setHasPurchased(res.data.hasPurchased);
    } catch (err) {
      if (err.response?.status === 401) {
        setHasPurchased(false);
      } else {
        console.error("Failed to check purchase status", err);
      }
    }
  };

  // Handle product download
  const downloadFileWithOriginalFormat = async (productId) => {
    try {
      // First get product details to extract filename and extension

      const res = await axios.post(`${BACKEND_URL}/api/download/log`, {
        productId: productId
      }, {
        withCredentials: true
      });

      const productRes = await axios.get(
        `${BACKEND_URL}/api/products/${productId}`,
        { withCredentials: true }
      );

      const product = productRes.data;
      const fileUrl = `${BACKEND_URL}/${product.fileUrl.replace(/\\/g, "/")}`;

      // Extract filename with extension from fileUrl
      const fileName = fileUrl.split('/').pop();

      // Fetch the file with proper headers
      const response = await fetch(fileUrl, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch file');

      // Get the blob data
      const blob = await response.blob();

      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', fileName); // Use original filename
      document.body.appendChild(link);
      link.click();

      // Clean up
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(link);

      toast.success("File downloaded in original format!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download file");
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
      const action = inBag ? 'remove-from-library' : 'add-to-library';
      const url = `${BACKEND_URL}/api/user/${action}/${id}`;

      await axios.post(url, {}, { withCredentials: true });
      setInBag(!inBag);
      toast.success(inBag ? "Removed from Bag" : "Added to Bag");
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        console.error("Error updating Bag", err);
        toast.error("Something went wrong!");
      }
    }
  };

  // Submit new comment
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/comments/${id}`,
        { text: commentText, rating },
        { withCredentials: true }
      );

      setComments((prev) => [res.data, ...prev]);
      setCommentText("");
      setRating(0);
      toast.success("Review submitted");

      const newAverage = (
        (parseFloat(averageRating) * totalReviews + rating
        ) / (totalReviews + 1));
      setAverageRating(newAverage.toFixed(1));
      setTotalReviews(totalReviews + 1);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        navigate("/login");
      } else if (err.response?.status === 403) {
        toast.error("Only customers who purchased this product can review it");
      } else {
        toast.error("Failed to add review");
      }
    }
  };

  const renderStars = (rating, size = "w-4 h-4") => {
    return [...Array(5)].map((_, i) => (
      <FiStar
        key={i}
        className={`${size} ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent"></div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center">
      <p className="text-gray-500">Product not found</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="lg:flex">
            {/* Product Image */}
            <div className="lg:w-2/5 p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="aspect-[3/4] w-full max-w-sm mx-auto relative overflow-hidden rounded-2xl bg-white shadow-lg">
                <img
                  className="absolute inset-0 w-full h-full object-contain"
                  src={`${BACKEND_URL}/${product.imageUrl}`}
                  alt={product.title}
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/300x450?text=No+Image";
                  }}
                />
              </div>
            </div>

            {/* Product Details */}
            <div className="lg:w-3/5 p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                <div className="flex-1">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                    {product.category?.name || 'Uncategorized'}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 leading-tight">{product.title}</h1>
                  <p className="text-lg text-gray-600 mb-4">by {product.author}</p>
                </div>
              </div>

              {/* Rating display */}
              <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="flex">
                  {renderStars(averageRating, "w-5 h-5")}
                </div>
                <span className="text-gray-700 font-medium">
                  {averageRating} ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
                </span>
              </div>

              {/* Price */}
              <div className="mb-8 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-bold text-gray-900">₹{product.price}</span>
                  <span className="text-sm text-gray-500">+ applicable taxes</span>
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-6 mb-8">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
                    <FiInfo className="w-5 h-5" />
                    Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{product.shortDescription}</p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
                    <FiUser className="w-5 h-5" />
                    About
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{product.about}</p>
                </div>

                {product.tags?.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
                      <FiTag className="w-5 h-5" />
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 text-sm font-medium bg-white border border-gray-200 text-gray-700 rounded-lg"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="flex items-center gap-2 text-sm text-gray-600">
                    <FiCalendar className="w-4 h-4" />
                    Released: {moment(product.releaseDate).format("MMMM Do, YYYY")}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {user?.subscription?.active === true ? (
                  <button
                    onClick={() => downloadFileWithOriginalFormat(id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <FiDownload className="w-5 h-5" />
                    Premium Download
                  </button>
                ) : (
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <FiShoppingBag className="w-5 h-5" />
                    Buy Now
                  </button>
                )}

                <button
                  onClick={handleToggleLibrary}
                  className={`flex-1 flex items-center justify-center gap-2 font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
                    inBag
                      ? "bg-red-100 hover:bg-red-200 text-red-800 border-2 border-red-200"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-800 border-2 border-gray-200"
                  }`}
                >
                  <FiShoppingBag className="w-5 h-5" />
                  {inBag ? "Remove from Bag" : "Add to Bag"}
                </button>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="border-t border-gray-200 p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Customer Reviews</h3>
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900">{averageRating}</div>
                    <div className="flex justify-center mt-1">
                      {renderStars(averageRating, "w-5 h-5")}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}</p>
                  </div>
                </div>
              </div>

              {hasPurchased ? (
                <>
                  {user._id !== comments[0]?.user._id ? (
                    <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm border border-gray-200">
                      <h4 className="text-lg font-bold text-gray-900 mb-4">Write a review</h4>
                      <form onSubmit={handleCommentSubmit}>
                        <div className="flex items-center mb-4">
                          <div className="flex mr-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                className="focus:outline-none p-1"
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(star)}
                              >
                                <FiStar
                                  className={`w-6 h-6 ${(hoverRating || rating) >= star ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                />
                              </button>
                            ))}
                          </div>
                          <span className="text-sm text-gray-600 font-medium">
                            {hoverRating > 0 ? hoverRating : rating > 0 ? rating : ''} star{hoverRating > 1 || rating > 1 ? 's' : ''}
                          </span>
                        </div>
                        <textarea
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Share your thoughts about this product..."
                          className="w-full border-2 border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                          rows="4"
                          required
                        />
                        <button
                          type="submit"
                          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                        >
                          Submit Review
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-8">
                      <p className="text-green-800 font-medium">✓ You have already reviewed this product</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
                  <p className="text-blue-800 font-medium text-center">
                    You must purchase this product to leave a review
                  </p>
                </div>
              )}

              {comments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiStar className="w-8 h-8 text-gray-500" />
                  </div>
                  <p className="text-gray-500 text-lg">No reviews yet. Be the first to review!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((c) => (
                    <div key={c._id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-lg flex-shrink-0">
                          {c.user.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                            <h5 className="font-bold text-gray-900">{c.user.name}</h5>
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {renderStars(c.rating, "w-4 h-4")}
                              </div>
                              <span className="text-sm text-gray-500">
                                {moment(c.createdAt).fromNow()}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{c.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
