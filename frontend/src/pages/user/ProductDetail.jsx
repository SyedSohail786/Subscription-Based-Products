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

  // Handle product download
  const handleDownload = async () => {
    try {
      const res = await axios.get(
        `${BACKEND_URL}/api/user/check-access/${id}`,
        { withCredentials: true }
      );

      if (res.data.canDownload) {
        const fileUrl = `${BACKEND_URL}/${product.fileUrl.replace(/\\/g, "/")}`;
        toast.success("Downloading...");
        window.open(fileUrl, "_blank");
      } else if (res.data.canDownload === false) {
        toast.error(res.data.message);
        navigate("/profile");
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

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <img
          src={`${BACKEND_URL}/${product.imageUrl}`}
          alt={product.title}
          className="w-full h-auto rounded"
        />

        <div>
          <h2 className="text-2xl font-bold mb-2">{product.title}</h2>
          <p className="text-gray-600 mb-2">{product.author}</p>
          <p className="text-gray-600 mb-2">{product.shortDescription}</p>
          <p className="text-gray-600 mb-2">{product.about}</p>
          <p className="text-gray-600 mb-2">{product.tags.join(", ")}</p>
          <p className="text-gray-800 font-semibold mb-2">₹{product.price}</p>
          <p className="text-gray-500 mb-4">
            Released: {moment(product.releaseDate).format("DD/MM/YYYY")}
          </p>

          <div className="flex gap-4">
            <button
              onClick={handleDownload}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Download
            </button>

            <button
              onClick={handleToggleLibrary}
              className={`px-4 py-2 rounded text-white ${
                owned
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {owned ? "Remove from Bag" : "Add to Bag"}
            </button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold mb-2">Comments</h3>

        <form onSubmit={handleCommentSubmit} className="mb-4">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            className="w-full border rounded p-2 mb-2"
            rows="3"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Post Comment
          </button>
        </form>

        {comments.length === 0 ? (
          <p className="text-gray-500">No comments yet.</p>
        ) : (
          <ul>
            {comments.map((c) => (
              <li key={c._id} className="mb-4 border-b pb-2">
                <p className="font-semibold">{c.user.name}</p>
                <p className="text-gray-700">{c.text}</p>
                <p className="text-sm text-gray-400">
                  {moment(c.createdAt).fromNow()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
