import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import axios from "axios";
import HorizontalScroll from "./HorizontalScroll";
import SearchInput from "./SearchInput";
import ProductCard from "./ProductCard";
import CategoryDropdown from "./CategoryDropdown";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/categories`)
      .then(res => setCategories(res.data))
      .catch(console.error);

    const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    setRecentlyViewed(viewed);

    // Fetch showcase products
    axios.get(`${BACKEND_URL}/api/products`, { params: { limit: 10 } })
      .then(res => {
        setProducts(res.data.products);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const filterProductsByCategory = (categoryName) => {
    return products.filter(product => product.category?.name === categoryName);
  };

  const handleSearch = (query) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="relative max-w-xl mx-auto mb-6">
            <SearchInput onSearch={handleSearch} />
          </div>
          <CategoryDropdown categories={categories} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* eBooks Section */}
        <section className="mb-8 sm:mb-12">
  <div className="flex justify-between items-center mb-4">
    <h3 className="text-lg sm:text-xl font-semibold">Discover eBooks</h3>
    <Link
      to="/category/books"
      className="text-blue-600 hover:underline flex items-center text-sm sm:text-base"
    >
      View All <FiArrowRight className="ml-1" />
    </Link>
  </div>
  <div className="relative">
    <HorizontalScroll>
      {loading ? 
        [...Array(5)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-40 sm:w-48 px-2">
            <ProductCard loading />
          </div>
        )) :
        filterProductsByCategory("Books").map(product => (
          <div key={product._id} className="flex-shrink-0 w-40 sm:w-48 px-2">
            <ProductCard product={product} />
          </div>
        ))
      }
    </HorizontalScroll>
  </div>
</section>

          {/* Audio Books Section */}
<section className="mb-8 sm:mb-12">
  <div className="flex justify-between items-center mb-4">
    <h3 className="text-lg sm:text-xl font-semibold">Discover Audio Books</h3>
    <Link
      to="/category/audio"
      className="text-blue-600 hover:underline flex items-center text-sm sm:text-base"
    >
      View All <FiArrowRight className="ml-1" />
    </Link>
  </div>
  <div className="relative">
    <HorizontalScroll>
      {loading ? 
        [...Array(5)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-40 sm:w-48">
            <ProductCard loading />
          </div>
        )) :
        filterProductsByCategory("Audio").map(product => (
          <div key={product._id} className="flex-shrink-0 w-40 sm:w-48">
            <ProductCard product={product} />
          </div>
        ))
      }
    </HorizontalScroll>
  </div>
</section>
        {/* Recently Viewed Section */}
        {recentlyViewed.length > 0 && (
  <section>
    <h3 className="text-lg sm:text-xl font-semibold mb-4">Recently Viewed</h3>
    <div className="relative">
      <HorizontalScroll>
        {recentlyViewed.map(product => (
          <div key={product._id} className="flex-shrink-0 w-40 sm:w-48 px-2">
            <ProductCard product={product} />
          </div>
        ))}
      </HorizontalScroll>
    </div>
  </section>
)}
      </main>
    </div>
  );
};

export default Home;