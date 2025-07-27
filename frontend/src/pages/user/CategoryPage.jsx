import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiFilter, FiGrid, FiBookOpen, FiHeadphones } from "react-icons/fi";
import axios from "axios";
import Select from 'react-select';
import ProductCard from "./ProductCard";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const CategoryPage = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("latest");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch subcategories first
        const categoriesRes = await axios.get(`${BACKEND_URL}/api/categories`);
        const currentCategory = categoriesRes.data.find(c => c.name.toLowerCase() === category.toLowerCase());
        
        if (currentCategory) {
          setSubcategories(currentCategory.subcategories || []);
        }

        // Then fetch products
        const params = { category };
        if (selectedSubcategory) params.subcategory = selectedSubcategory;
        
        const productsRes = await axios.get(`${BACKEND_URL}/api/products`, { params });
        setProducts(productsRes.data.products);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    window.scrollTo(0, 0);
  }, [category, selectedSubcategory]);

  const sortProducts = (products) => {
    switch (sortBy) {
      case "price-high": return [...products].sort((a, b) => b.price - a.price);
      case "price-low": return [...products].sort((a, b) => a.price - b.price);
      case "name": return [...products].sort((a, b) => a.title.localeCompare(b.title));
      default: return products;
    }
  };

  const getCategoryIcon = () => {
    switch (category.toLowerCase()) {
      case 'books':
        return <FiBookOpen className="w-6 h-6" />;
      case 'audio':
        return <FiHeadphones className="w-6 h-6" />;
      default:
        return <FiGrid className="w-6 h-6" />;
    }
  };

  const getCategoryColor = () => {
    switch (category.toLowerCase()) {
      case 'books':
        return 'from-green-500 to-emerald-600';
      case 'audio':
        return 'from-purple-500 to-indigo-600';
      default:
        return 'from-blue-500 to-indigo-600';
    }
  };

  // Prepare subcategory options for Select component
  const subcategoryOptions = [
    { value: '', label: 'All Subcategories' },
    ...(subcategories.map(sub => ({
      value: sub,
      label: sub
    })) || [])
  ];

  const sortOptions = [
    { value: 'latest', label: 'Recently Listed' },
    { value: 'name', label: 'By Name' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' }
  ];

  const getSortLabel = (value) => {
    const option = sortOptions.find(opt => opt.value === value);
    return option ? option.label : 'Recently Listed';
  };

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
                  <h1 className="text-2xl sm:text-3xl font-bold capitalize">{category}</h1>
                  <p className="text-white/90 mt-1">
                    Discover amazing {category.toLowerCase()} from our collection
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
                    <p className="text-sm text-gray-600">in this category</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  {subcategories.length > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                        Subcategory:
                      </label>
                      <Select
                        className="react-select-container text-sm w-full sm:w-48"
                        classNamePrefix="react-select"
                        options={subcategoryOptions}
                        value={subcategoryOptions.find(opt => opt.value === selectedSubcategory)}
                        onChange={(option) => setSelectedSubcategory(option.value)}
                        isDisabled={loading || subcategories.length === 0}
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
                  )}

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
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {[...Array(10)].map((_, i) => (
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
                {selectedSubcategory 
                  ? `No items found in "${selectedSubcategory}" subcategory.`
                  : `No items found in ${category} category.`
                }
              </p>
              <div className="space-y-3">
                {selectedSubcategory && (
                  <button
                    onClick={() => setSelectedSubcategory("")}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-6 rounded-xl transition-colors"
                  >
                    View All {category}
                  </button>
                )}
                <button
                  onClick={() => navigate("/")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-colors"
                >
                  Browse All Categories
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

export default CategoryPage;
