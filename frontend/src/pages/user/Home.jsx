import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Select from 'react-select';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState("");
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const navigate = useNavigate();

  const LIMIT = 6;

  const sortOptions = [
    { value: "latest", label: "Recently Listed" },
    { value: "name", label: "By Name" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" }
  ];

  useEffect(() => {
    setCategoryLoading(true);
    axios.get(`${BACKEND_URL}/api/categories`)
      .then((res) => {
        setCategories(res.data);
      })
      .catch(console.error)
      .finally(() => setCategoryLoading(false));
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selected, search, sortBy, page]);

  const fetchProducts = () => {
    setLoading(true);
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
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleFilter = (cat) => {
    setSelected(cat);
    setPage(1);
  };

  const handleSortChange = (selectedOption) => {
    setSortBy(selectedOption.value);
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-gray-50 p-4 md:sticky md:top-0 md:h-screen border-r">
        <h2 className="text-xl font-bold mb-6 text-gray-800">Filters</h2>
        
        <div className="mb-8">
          <h3 className="font-semibold mb-3 text-gray-700">Categories</h3>
          {categoryLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-6 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <button
                className={`block w-full text-left py-2 px-3 rounded-lg transition ${
                  selected === ""
                    ? "bg-indigo-100 text-indigo-700 font-medium"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
                onClick={() => handleFilter("")}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  className={`block w-full text-left py-2 px-3 rounded-lg transition ${
                    selected === cat.name
                      ? "bg-indigo-100 text-indigo-700 font-medium"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                  onClick={() => handleFilter(cat.name)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8">
        {/* Search & Sort Controls - Centered with sort on right */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="relative w-full md:w-1/2 mx-auto">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              value={search}
              onChange={handleSearchChange}
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          
          <div className="w-full md:w-auto">
            <Select
              options={sortOptions}
              defaultValue={sortOptions[0]}
              onChange={handleSortChange}
              className="react-select-container"
              classNamePrefix="react-select"
              isSearchable={false}
            />
          </div>
        </div>

        {/* Product Grid - Only Images with Product Name Overlay */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(LIMIT)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-1">No products found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div 
                  key={product._id} 
                  className="relative aspect-square rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  <img
                    src={`${BACKEND_URL}/${product.imageUrl}`}
                    alt={product.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/300x300?text=No+Image";
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <h3 className="text-white font-medium text-lg drop-shadow-md">
                      {product.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-10 gap-2">
                <button
                  disabled={page === 1}
                  className={`px-4 py-2 rounded-lg flex items-center gap-1 ${
                    page === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setPage((prev) => prev - 1)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Previous
                </button>
                
                <div className="flex items-center gap-1 mx-4">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      className={`w-10 h-10 rounded-full ${
                        page === num
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      onClick={() => setPage(num)}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                
                <button
                  disabled={page === totalPages}
                  className={`px-4 py-2 rounded-lg flex items-center gap-1 ${
                    page === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  Next
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;