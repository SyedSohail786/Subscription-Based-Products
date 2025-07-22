import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState("");
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const LIMIT = 6;

  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/categories`).then((res) => {
      setCategories(res.data);
    });
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selected, search, sortBy, page]);

  const fetchProducts = () => {
    axios
      .get(`${BACKEND_URL}/api/products`, {
        params: {
          category: selected,
          search,
          sortBy,
          page,
          limit: LIMIT,
        },
      })
      .then((res) => {
        setProducts(res.data.products);
        setTotalPages(res.data.totalPages || 1);
      });
  };

  const handleFilter = (cat) => {
    setSelected(cat);
    setPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
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
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Search & Sort Controls */}
        <div className="flex justify-between items-center mb-6">
          <input
            type="text"
            placeholder="Search products..."
            className="border px-3 py-2 rounded w-1/2"
            value={search}
            onChange={handleSearchChange}
          />
          <select
            className="border px-2 py-2 rounded ml-4"
            value={sortBy}
            onChange={handleSortChange}
          >
            <option value="latest">Recently Listed</option>
            <option value="name">By Name</option>
          </select>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product._id} className="border p-4 shadow-md rounded">
              <div onClick={() => navigate(`/product/${product._id}`)}>
                <img
                  src={`${BACKEND_URL}/${product.imageUrl}`}
                  alt=""
                  className="w-full h-40 object-cover mb-2"
                />
              </div>
              <h3 className="font-semibold text-lg">{product.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{product.description}</p>
              <button
                className="px-4 py-2 rounded bg-indigo-600 text-white"
                onClick={() => navigate(`/product/${product._id}`)}
              >
                View Details
              </button>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 gap-4">
            <button
              disabled={page === 1}
              className="px-4 py-2 border rounded disabled:opacity-50"
              onClick={() => setPage((prev) => prev - 1)}
            >
              ⬅ Prev
            </button>
            <span className="self-center">Page {page} of {totalPages}</span>
            <button
              disabled={page === totalPages}
              className="px-4 py-2 border rounded disabled:opacity-50"
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next ➡
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
