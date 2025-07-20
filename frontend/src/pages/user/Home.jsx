import { useEffect, useState } from "react";
import axios from "axios";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState("");
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/categories`).then(res => setCategories(res.data));
    fetchProducts();
  }, []);

  const fetchProducts = (category = "") => {
    axios.get(`${BACKEND_URL}/api/products`, { params: { category } })
      .then(res => setProducts(res.data));
  };

  const handleFilter = (cat) => {
    setSelected(cat);
    fetchProducts(cat);
  };

  return (
    <div className="p-6">
      <div className="flex gap-3 mb-6">
        <button onClick={() => handleFilter("")}>All</button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            className={selected === cat.name ? "font-bold" : ""}
            onClick={() => handleFilter(cat.name)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product._id} className="border p-4">
            <h3 className="font-semibold">{product.name}</h3>
            <p>{product.description}</p>
            <p className="text-sm text-gray-500">{product.price} ₹</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
