import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FiSearch, FiChevronDown, FiX, FiArrowRight } from "react-icons/fi";
import Select from 'react-select';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Subcategory Page Component
const SubcategoryPage = () => {
  const { subcategory } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("latest");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BACKEND_URL}/api/products`, {
          params: { subcategory }
        });
        setProducts(res.data.products);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [subcategory]);

  const sortProducts = (products) => {
    switch(sortBy) {
      case "price-high":
        return [...products].sort((a, b) => b.price - a.price);
      case "price-low":
        return [...products].sort((a, b) => a.price - b.price);
      case "name":
        return [...products].sort((a, b) => a.title.localeCompare(b.title));
      default:
        return products;
    }
  };

  const renderStars = (rating = 4) => (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-3 h-3 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-20 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button 
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:underline flex items-center mb-4"
          >
            <FiArrowRight className="rotate-180 mr-1" /> Back to Home
          </button>
          <h1 className="text-2xl font-bold text-gray-900 capitalize">
            {subcategory.replace('-', ' ')}
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {products.length} {products.length === 1 ? 'item' : 'items'} found
          </h2>
          <Select
            className="text-sm w-48"
            options={[
              { value: 'latest', label: 'Recently Listed' },
              { value: 'name', label: 'By Name' },
              { value: 'price-low', label: 'Price: Low to High' },
              { value: 'price-high', label: 'Price: High to Low' }
            ]}
            value={{ value: sortBy, label: sortBy === 'latest' ? 'Recently Listed' : 
                    sortBy === 'name' ? 'By Name' :
                    sortBy === 'price-low' ? 'Price: Low to High' : 'Price: High to Low' }}
            onChange={(option) => setSortBy(option.value)}
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm">
                <div className="aspect-[2/3] bg-gray-200 animate-pulse"></div>
                <div className="p-4">
                  <div className="h-5 bg-gray-200 rounded mb-3 w-4/5"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2 w-3/5"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/5"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">No items found in this category</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {sortProducts(products).map((product) => (
              <div 
                key={product._id} 
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
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
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                    {product.title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">{product.author}</p>
                  <div className="flex justify-between items-center">
                    {renderStars()}
                    <span className="text-sm font-semibold text-blue-600">
                      ₹{product.price}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

// Category Page Component (for View All)
const CategoryPage = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("latest");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BACKEND_URL}/api/products`, {
          params: { category }
        });
        setProducts(res.data.products);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  const sortProducts = (products) => {
    switch(sortBy) {
      case "price-high":
        return [...products].sort((a, b) => b.price - a.price);
      case "price-low":
        return [...products].sort((a, b) => a.price - b.price);
      case "name":
        return [...products].sort((a, b) => a.title.localeCompare(b.title));
      default:
        return products;
    }
  };

  const renderStars = (rating = 4) => (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-3 h-3 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-20 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button 
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:underline flex items-center mb-4"
          >
            <FiArrowRight className="rotate-180 mr-1" /> Back to Home
          </button>
          <h1 className="text-2xl font-bold text-gray-900 capitalize">
            All {category}
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {products.length} {products.length === 1 ? 'item' : 'items'} found
          </h2>
          <Select
            className="text-sm w-48"
            options={[
              { value: 'latest', label: 'Recently Listed' },
              { value: 'name', label: 'By Name' },
              { value: 'price-low', label: 'Price: Low to High' },
              { value: 'price-high', label: 'Price: High to Low' }
            ]}
            value={{ value: sortBy, label: sortBy === 'latest' ? 'Recently Listed' : 
                    sortBy === 'name' ? 'By Name' :
                    sortBy === 'price-low' ? 'Price: Low to High' : 'Price: High to Low' }}
            onChange={(option) => setSortBy(option.value)}
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm">
                <div className="aspect-[2/3] bg-gray-200 animate-pulse"></div>
                <div className="p-4">
                  <div className="h-5 bg-gray-200 rounded mb-3 w-4/5"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2 w-3/5"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/5"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">No items found in this category</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {sortProducts(products).map((product) => (
              <div 
                key={product._id} 
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
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
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                    {product.title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">{product.author}</p>
                  <div className="flex justify-between items-center">
                    {renderStars()}
                    <span className="text-sm font-semibold text-blue-600">
                      ₹{product.price}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [activeSection, setActiveSection] = useState("all");
  const [loading, setLoading] = useState(true);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const navigate = useNavigate();

  // Fetch categories on mount
  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/categories`)
      .then(res => setCategories(res.data))
      .catch(console.error);

    // Load recently viewed from localStorage
    const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    setRecentlyViewed(viewed);
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          category: selectedCategory,
          subcategory: selectedSubcategory,
          search: searchQuery,
          sortBy,
          section: activeSection
        };
        
        const res = await axios.get(`${BACKEND_URL}/api/products`, { params });
        setProducts(res.data.products);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, selectedSubcategory, searchQuery, sortBy, activeSection]);

  // Sort functions
  const sortProducts = (products) => {
    switch(sortBy) {
      case "price-high":
        return [...products].sort((a, b) => b.price - a.price);
      case "price-low":
        return [...products].sort((a, b) => a.price - b.price);
      case "name":
        return [...products].sort((a, b) => a.title.localeCompare(b.title));
      default: // latest
        return products;
    }
  };

  // Filter products by category
  const filterProductsByCategory = (categoryName) => {
    return products.filter(product => product.category?.name === categoryName);
  };

  // Render star ratings
  const renderStars = (rating = 4) => (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-3 h-3 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );

  // Render product card
  const renderProductCard = (product) => (
    <div 
      key={product._id} 
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => {
        navigate(`/product/${product._id}`);
        // Add to recently viewed
        const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        const newViewed = [product, ...viewed.filter(p => p._id !== product._id)].slice(0, 5);
        localStorage.setItem('recentlyViewed', JSON.stringify(newViewed));
        setRecentlyViewed(newViewed);
      }}
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
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
          {product.title}
        </h3>
        <p className="text-xs text-gray-500 mb-2">{product.author}</p>
        <div className="flex justify-between items-center">
          {renderStars()}
          <span className="text-sm font-semibold text-blue-600">
            ₹{product.price}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Search */}
      <header className="sticky top-0 z-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Centered Search Bar */}
          <div className="relative max-w-xl mx-auto mb-6">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search books, authors..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Centered Categories with Dropdown */}
          <div className="flex justify-center relative">
            <div className="flex space-x-6">
              {categories.map((category) => (
                <div 
                  key={category._id}
                  className="relative"
                  onMouseEnter={() => setHoveredCategory(category._id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <button
                    className={`flex items-center py-2 px-1 font-medium ${
                      selectedCategory === category.name ? 'text-blue-600' : 'text-gray-700 hover:text-blue-500'
                    }`}
                    onClick={() => {
                      setSelectedCategory(category.name);
                      setSelectedSubcategory("");
                    }}
                  >
                    {category.name}
                    <FiChevronDown className="ml-1" size={14} />
                  </button>

                  {/* Subcategory Dropdown */}
                  {hoveredCategory === category._id && (
                    <div className="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 py-1">
                      {category.subcategories.map((subcat) => (
                        <button
                          key={subcat}
                          className={`block w-full text-left px-4 py-2 text-sm ${
                            selectedSubcategory === subcat
                              ? 'bg-blue-50 text-blue-600'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                          onClick={() => {
                            setSelectedSubcategory(subcat);
                            setHoveredCategory(null);
                            navigate(`/subcategory/${subcat.toLowerCase().replace(' ', '-')}`);
                          }}
                        >
                          {subcat}
                        </button>
                      ))}
                      <Link
                        to={`/category/${category.name.toLowerCase()}`}
                        className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 font-medium"
                        onClick={() => setHoveredCategory(null)}
                      >
                        View All {category.name} →
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Section Title and Sort */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {activeSection === "all" && "Discover eBooks"}
            {activeSection === "recent" && "Recently Added"}
            {activeSection === "audio" && "Audio Books"}
          </h2>
          <Select
            className="text-sm w-48"
            options={[
              { value: 'latest', label: 'Recently Listed' },
              { value: 'name', label: 'By Name' },
              { value: 'price-low', label: 'Price: Low to High' },
              { value: 'price-high', label: 'Price: High to Low' }
            ]}
            value={{ value: sortBy, label: sortBy === 'latest' ? 'Recently Listed' : 
                    sortBy === 'name' ? 'By Name' :
                    sortBy === 'price-low' ? 'Price: Low to High' : 'Price: High to Low' }}
            onChange={(option) => setSortBy(option.value)}
          />
        </div>

        {/* Active Filters */}
        {(selectedCategory || selectedSubcategory) && (
          <div className="flex items-center mb-6 space-x-2">
            <span className="text-sm text-gray-500">Filters:</span>
            {selectedCategory && (
              <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
                {selectedCategory}
                <button 
                  onClick={() => {
                    setSelectedCategory("");
                    setSelectedSubcategory("");
                  }}
                  className="ml-1 text-gray-500 hover:text-gray-700"
                >
                  <FiX size={14} />
                </button>
              </div>
            )}
            {selectedSubcategory && (
              <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
                {selectedSubcategory}
                <button 
                  onClick={() => setSelectedSubcategory("")}
                  className="ml-1 text-gray-500 hover:text-gray-700"
                >
                  <FiX size={14} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* eBooks Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">eBooks</h3>
            <Link 
              to="/category/books" 
              className="text-blue-600 hover:underline flex items-center text-sm"
            >
              View All <FiArrowRight className="ml-1" />
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm">
                  <div className="aspect-[2/3] bg-gray-200 animate-pulse"></div>
                  <div className="p-4">
                    <div className="h-5 bg-gray-200 rounded mb-3 w-4/5"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2 w-3/5"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/5"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {sortProducts(filterProductsByCategory("Books")).slice(0, 5).map(renderProductCard)}
            </div>
          )}
        </section>

        {/* Recently Viewed Section */}
        {recentlyViewed.length > 0 && (
          <section className="mb-12">
            <h3 className="text-xl font-semibold mb-4">Recently Viewed</h3>
            <div className="overflow-x-auto pb-4 -mx-4 px-4">
              <div className="flex space-x-4" style={{ minWidth: `${recentlyViewed.length * 160}px` }}>
                {recentlyViewed.map(product => (
                  <div key={product._id} className="flex-shrink-0 w-40">
                    {renderProductCard(product)}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Audio Books Section */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Audio Books</h3>
            <Link 
              to="/category/audio" 
              className="text-blue-600 hover:underline flex items-center text-sm"
            >
              View All <FiArrowRight className="ml-1" />
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm">
                  <div className="aspect-[2/3] bg-gray-200 animate-pulse"></div>
                  <div className="p-4">
                    <div className="h-5 bg-gray-200 rounded mb-3 w-4/5"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2 w-3/5"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/5"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {sortProducts(filterProductsByCategory("Audio")).slice(0, 5).map(renderProductCard)}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Home;
export { SubcategoryPage, CategoryPage };