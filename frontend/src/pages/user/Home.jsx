import { useEffect, useState } from "react";
import axios from "axios";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState("");
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/categories`)
      .then(res => setCategories(res.data));
    fetchProducts();
  }, []);

  const fetchProducts = (category = "") => {
    axios
      .get(`${BACKEND_URL}/api/products`, {
        params: { category }
      })
      .then(res => setProducts(res.data));
  };

  const handleFilter = (cat) => {
    setSelected(cat);
    fetchProducts(cat);
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-64 min-h-screen bg-gray-100 p-4 sticky top-0">
        <h2 className="text-lg font-bold mb-4">Filters</h2>
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Categories</h3>
          <button
            className={`block w-full text-left py-1 ${selected === "" ? "font-bold" : ""}`}
            onClick={() => handleFilter("")}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              className={`block w-full text-left py-1 ${selected === cat.name ? "font-bold" : ""}`}
              onClick={() => handleFilter(cat.name)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Optional Price Filter UI */}
        <div>
          <h3 className="font-semibold mb-2">Price Range</h3>
          <input type="range" min="0" max="1000" className="w-full" />
        </div>
      </div>

      {/* Main Product Grid */}
      <div className="flex-1 p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product._id} className="border p-4 shadow-md rounded">
            <div>
              <img src={`${BACKEND_URL}/${product.imageUrl}`} alt="" />
            </div>
            <h3 className="font-semibold text-lg">{product.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{product.description}</p>
            <p className="text-indigo-600 font-bold">{product.price} ₹</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
