import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import moment from "moment";
import useAuthStore from "../../store/authStore";

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

  

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  if (!product) return (
    <div className="flex justify-center items-center h-screen">
      <p className="text-gray-500">Product not found</p>
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
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/300x450?text=No+Image";
              }}
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
                {product.category?.name || 'Uncategorized'}
              </span>
            </div>

            {/* Rating display */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-gray-700">
                {averageRating} ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
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

            {product.tags?.length > 0 && (
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
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              {
                user.subscription.active === true ? 
                <>
                <button
                onClick={() => downloadFileWithOriginalFormat(id)}
                className="flex-1 bg-yellow-300 hover:bg-yellow-400 text-black font-medium py-3 px-6 rounded-md transition transform hover:scale-105"
              >
                Premium Download
              </button>
              </>
              :
              <button
                onClick={handleBuyNow}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-md transition transform hover:scale-105"
              >
                Buy Now
              </button>
              }
              
              
              <button
                onClick={handleToggleLibrary}
                className={`flex-1 font-medium py-3 px-6 rounded-md transition transform hover:scale-105 ${
                  inBag 
                    ? "bg-red-100 hover:bg-red-200 text-red-800 border border-red-200"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200"
                }`}
              >
                {inBag ? (
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

        {/* Reviews Section */}
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-800">{averageRating}</div>
              <div className="flex justify-center mt-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-1">{totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Customer Reviews</h3>
              {!hasPurchased && (
                <p className="text-sm text-gray-600">
                  Only customers who purchased this product can leave reviews
                </p>
              )}
            </div>
          </div>
          
          {hasPurchased ? (
            <>{
              user._id !== comments[0]?.user._id ? (
                <form onSubmit={handleCommentSubmit} className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Write a review</h4>
              <div className="flex items-center mb-3">
                <div className="flex mr-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="focus:outline-none"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                    >
                      <svg
                        className={`w-6 h-6 ${(hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {hoverRating > 0 ? hoverRating : rating > 0 ? rating : ''} star{hoverRating > 1 || rating > 1 ? 's' : ''}
                </span>
              </div>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your thoughts about this product..."
                className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows="3"
                required
              />
              <button
                type="submit"
                className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Submit Review
              </button>
            </form>
              ) : (
                <p className="text-gray-500 mb-5">You have already reviewed this product</p>
              )
            }
            
            </>
          ) : (
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-blue-800">
                You must purchase this product to leave a review
              </p>
            </div>
          )}

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
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-gray-800">{c.user.name}</p>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < c.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
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