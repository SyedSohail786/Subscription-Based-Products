import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import axios from "axios";
import ProductCard from "./ProductCard";
import CategoryDropdown from "./CategoryDropdown";
import SearchInput from "./SearchInput";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const scrollRefs = {
    books: useRef(null),
    audio: useRef(null),
    recent: useRef(null)
  };

  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/categories`)
      .then(res => setCategories(res.data))
      .catch(console.error);

    axios.get(`${BACKEND_URL}/api/products`, { params: { limit: 20 } })
      .then(res => {
        setProducts(res.data.products);
        setLoading(false);
      })
      .catch(console.error);

    const loadRecentlyViewed = () => {
      try {
        const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        const validViewed = viewed.filter(item =>
          item && item._id && item.title && item.imageUrl && item.price
        );
        setRecentlyViewed(validViewed.slice(0, 20));
      } catch (error) {
        console.error('Error loading recently viewed:', error);
        localStorage.removeItem('recentlyViewed');
        setRecentlyViewed([]);
      }
    };

    loadRecentlyViewed();
  }, []);

  const clearRecentlyViewed = () => {
    localStorage.removeItem('recentlyViewed');
    setRecentlyViewed([]);
  };

  const filterProductsByCategory = (categoryName) => {
    return products.filter(product => product.category?.name === categoryName);
  };

  const handleSearch = (query) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const scroll = (ref, direction) => {
    const container = ref.current;
    if (container) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      container.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const Carousel = ({ title, products, refKey, viewAllLink }) => (
    <section className="mb-8 sm:mb-12 relative">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg sm:text-xl font-semibold">{title}</h3>
        <Link
          to={viewAllLink}
          className="text-blue-600 hover:underline flex items-center text-sm sm:text-base"
        >
          View All <FiArrowRight className="ml-1" />
        </Link>
      </div>
      <div className="relative group">
        <button
          onClick={() => scroll(scrollRefs[refKey], 'left')}
          className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100"
          style={{ transform: 'translate(-50%, -50%)' }}
        >
          <FiChevronLeft className="w-5 h-5" />
        </button>
        <div
          ref={scrollRefs[refKey]}
          className="flex gap-4 overflow-x-auto px-1 scrollbar-hide"
          style={{ scrollSnapType: 'x mandatory', scrollPadding: '0 16px' }}
        >
          {loading ?
            [...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-40 sm:w-48"
                style={{ scrollSnapAlign: 'start' }}
              >
                <ProductCard loading />
              </div>
            )) :
            products.map(product => (
              <div
                key={product._id}
                className="flex-shrink-0 w-40 sm:w-48"
                style={{ scrollSnapAlign: 'start' }}
              >
                <ProductCard product={product} />
              </div>
            ))
          }
        </div>
        <button
          onClick={() => scroll(scrollRefs[refKey], 'right')}
          className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100"
          style={{ transform: 'translate(50%, -50%)' }}
        >
          <FiChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="relative max-w-xl mx-auto mb-4 sm:mb-6">
            <SearchInput onSearch={handleSearch} />
          </div>
          <CategoryDropdown categories={categories} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Carousel
          title="Discover eBooks"
          products={filterProductsByCategory("Books")}
          refKey="books"
          viewAllLink="/category/books"
        />

        <Carousel
          title="Discover Audio Books"
          products={filterProductsByCategory("Audio")}
          refKey="audio"
          viewAllLink="/category/audio"
        />

        {recentlyViewed.length > 0 ? (
          <div className="relative">
            <Carousel
              title="Recently Viewed"
              products={recentlyViewed}
              refKey="recent"
              viewAllLink="#"
            />
            <button
              onClick={clearRecentlyViewed}
              className="absolute top-0 right-32 text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Clear History
            </button>
          </div>
        ) : (
          <div className="mb-8 sm:mb-12 text-center py-8">
            <p className="text-gray-500">Your recently viewed items will appear here</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
