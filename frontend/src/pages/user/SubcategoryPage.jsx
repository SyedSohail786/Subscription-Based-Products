import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import axios from 'axios';
import { FiArrowLeft, FiFilter, FiGrid, FiBookOpen, FiHeadphones } from "react-icons/fi";
import ProductCard from "./ProductCard";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const sortOptions = [
  { value: 'latest', label: 'Recently Added' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name', label: 'Name (A-Z)' }
];

const SubcategoryPage = () => {
  const { name, subcategory } = useParams();
  const [products, setProducts] = useState([]);
  const [sortBy, setSortBy] = useState('latest');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axios.get(`${BACKEND_URL}/api/products`, { 
      params: { category: name, subcategory: subcategory, sortBy } 
    })
      .then(res => {
        setProducts(res.data.products || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [name, subcategory, sortBy]);

  const sortProducts = (list) => {
    switch (sortBy) {
      case 'price-high': return [...list].sort((a, b) => b.price - a.price);
      case 'price-low': return [...list].sort((a, b) => a.price - b.price);
      case 'name': return [...list].sort((a, b) => a.title.localeCompare(b.title));
      default: return list;
    }
  };

  const getCategoryIcon = () => {
    switch (name?.toLowerCase()) {
      case 'books':
        return <FiBookOpen className="w-6 h-6" />;
      case 'audio':
        return <FiHeadphones className="w-6 h-6" />;
      default:
        return <FiGrid className="w-6 h-6" />;
    }
  };

  const getCategoryColor = () => {
    switch (name?.toLowerCase()) {
      case 'books':
        return 'from-green-500 to-emerald-600';
      case 'audio':
        return 'from-purple-500 to-indigo-600';
      default:
        return 'from-blue-500 to-indigo-600';
    }
  };

  const getSortLabel = (value) => {
    const option = sortOptions.find(opt => opt.value === value);
    return option ? option.label : 'Recently Added';
  };

  // Format subcategory name for display
  const formatSubcategoryName = (subcategoryParam) => {
    return subcategoryParam
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const displaySubcategory = formatSubcategoryName(subcategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className={`bg-gradient-to-r ${getCategoryColor()} p-6 sm:p-8 text-white`}>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  {getCategoryIcon()}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm bg-white/20 px-3 py-1 rounded-full font-medium">
                      {name?.charAt(0).toUpperCase() + name?.slice(1)}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold">{displaySubcategory}</h1>
                  <p className="text-white/90 mt-1">
                    Explore our {displaySubcategory.toLowerCase()} collection
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6 sm:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <FiGrid className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">
                      {loading ? "Loading..." : products.length} {products.length === 1 ? 'item' : 'items'}
                    </p>
                    <p className="text-sm text-gray-600">in {displaySubcategory}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center gap-2">
                    <FiFilter className="w-4 h-4 text-gray-500" />
                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                      Sort by:
                    </label>
                  </div>
                  <Select
                    className="react-select-container text-sm w-full sm:w-48"
                    classNamePrefix="react-select"
                    options={sortOptions}
                    value={{ value: sortBy, label: getSortLabel(sortBy) }}
                    onChange={(option) => setSortBy(option.value)}
                    isSearchable={false}
                    menuPortalTarget={document.body}
                    styles={{
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999
                      }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 9999
                      })
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <ProductCard key={i} loading />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                {getCategoryIcon()}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-600 mb-6">
                No items found in {displaySubcategory} subcategory. Check back later for new additions!
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate(`/category/${name?.toLowerCase()}`)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-6 rounded-xl transition-colors"
                >
                  Browse All {name}
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-colors"
                >
                  Go to Homepage
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {sortProducts(products).map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubcategoryPage;
