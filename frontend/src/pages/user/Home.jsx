import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Select from 'react-select';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const navigate = useNavigate();

  const LIMIT = 8;

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
  }, [selectedCategory, selectedSubcategory, search, sortBy, page]);

  const fetchProducts = () => {
    setLoading(true);
    axios
      .get(`${BACKEND_URL}/api/products`, {
        params: {
          category: selectedCategory,
          subcategory: selectedSubcategory,
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

  const handleCategoryFilter = (cat) => {
    setSelectedCategory(cat);
    setSelectedSubcategory("");
    setPage(1);
  };

  const handleSubcategoryFilter = (subcat) => {
    setSelectedSubcategory(subcat);
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

  const getSubcategories = () => {
    if (!selectedCategory) return [];
    const category = categories.find(cat => cat.name === selectedCategory);
    return category?.subcategories || [];
  };

  // Generate star rating display
  const renderStars = (rating = 4) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Filters Section */}
      <div className="bg-white p-4 border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Discover Books</h2>
          
          {/* Search & Sort */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by title, author..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
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
            
            <div className="w-full md:w-64">
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

          {/* Category & Subcategory Filters */}
          <div className="flex flex-wrap gap-4">
            <div>
              <h3 className="font-semibold mb-2 text-gray-700">Categories</h3>
              {categoryLoading ? (
                <div className="flex gap-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <button
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedCategory === ""
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    onClick={() => handleCategoryFilter("")}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedCategory === cat.name
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      onClick={() => handleCategoryFilter(cat.name)}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedCategory && getSubcategories().length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 text-gray-700">Subcategories</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedSubcategory === ""
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    onClick={() => handleSubcategoryFilter("")}
                  >
                    All
                  </button>
                  {getSubcategories().map((subcat) => (
                    <button
                      key={subcat}
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedSubcategory === subcat
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      onClick={() => handleSubcategoryFilter(subcat)}
                    >
                      {subcat}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(LIMIT)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="aspect-[2/3] bg-gray-200 animate-pulse rounded-t-lg"></div>
                <div className="p-4">
                  <div className="h-5 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>
              </div>
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
            <h3 className="text-lg font-medium text-gray-700 mb-1">No books found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <>
            {/* Mobile - Horizontal Scroll */}
            <div className="md:hidden">
              <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4">
                {products.map((product) => (
                  <div 
                    key={product._id} 
                    className="flex-shrink-0 w-48 bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/product/${product._id}`)}
                  >
                    <div className="aspect-[2/3] relative">
                      <img
                        src={`${BACKEND_URL}/${product.imageUrl}`}
                        alt={product.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/300x450?text=No+Image";
                        }}
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                        {product.title}
                      </h3>
                      <p className="text-xs text-gray-500 mb-1">{product.author}</p>
                      {renderStars()}
                      <p className="text-sm text-indigo-600 font-semibold mt-1">₹{product.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop - Grid */}
            <div className="hidden md:grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              <div>
                
              <h1 className="text-2xl font-bold mb-4 text-gray-800">All Books</h1>
              </div>
              {products.map((product) => (
                <div 
                  key={product._id} 
                  className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-all group"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  <div className="aspect-[2/3] relative">
                    <img
                      src={`${BACKEND_URL}/${product.imageUrl}`}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/300x450?text=No+Image";
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-md font-medium text-gray-900 mb-1 line-clamp-2">
                      {product.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">{product.author}</p>
                    <div className="flex items-center mb-2">
                      {renderStars()}
                      <span className="text-xs text-gray-400 ml-1">(24)</span>
                    </div>
                    <p className="text-indigo-600 font-semibold">₹{product.price}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
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