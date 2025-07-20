import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const MyBag = () => {
  const [ownedProducts, setOwnedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/user/owned-products`, { withCredentials: true })
      .then(res => {
        setOwnedProducts(res.data.ownedProducts);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching owned products", err);
        navigate("/login");
      });
  }, []);

  if (loading) return <p className="p-6">Loading...</p>;

  if (ownedProducts.length === 0) {
    return <p className="p-6 text-gray-600">You haven’t added any products yet.</p>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Bag</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {ownedProducts.map(product => (
          <div
            key={product._id}
            onClick={() => navigate(`/product/${product._id}`)}
            className="cursor-pointer border rounded-lg shadow hover:shadow-md transition"
          >
            <img
              src={`${BACKEND_URL}/${product.imageUrl}`}
              alt={product.name}
              className="w-full h-48 object-cover rounded-t-lg"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-1">{product.name}</h3>
              <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyBag;
