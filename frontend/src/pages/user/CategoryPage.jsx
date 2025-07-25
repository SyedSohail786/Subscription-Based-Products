import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import axios from "axios";
import Select from 'react-select';
import ProductCard from "./ProductCard";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const CategoryPage = () => {
     const { category } = useParams();
     const [products, setProducts] = useState([]);
     const [loading, setLoading] = useState(true);
     const [sortBy, setSortBy] = useState("latest");
     const [selectedSubcategory, setSelectedSubcategory] = useState("");
     const navigate = useNavigate();

     useEffect(() => {
          const fetchProducts = async () => {
               setLoading(true);
               try {
                    const params = { category };
                    if (selectedSubcategory) params.subcategory = selectedSubcategory;

                    const res = await axios.get(`${BACKEND_URL}/api/products`, { params });
                    setProducts(res.data.products);
               } catch (error) {
                    console.error("Fetch error:", error);
               } finally {
                    setLoading(false);
               }
          };

          fetchProducts();
     }, [category, selectedSubcategory]);

     const sortProducts = (products) => {
          switch (sortBy) {
               case "price-high": return [...products].sort((a, b) => b.price - a.price);
               case "price-low": return [...products].sort((a, b) => a.price - b.price);
               case "name": return [...products].sort((a, b) => a.title.localeCompare(b.title));
               default: return products;
          }
     };

     return (
          <div className="min-h-screen bg-gray-50">
               <header className="sticky top-0 z-20 bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 py-4">
                         <div className="grid grid-cols-3 items-center">
                              <div className="flex justify-start">
                                   <h1 className="text-xl sm:text-2xl font-bold text-gray-900 capitalize whitespace-nowrap overflow-hidden text-ellipsis max-w-full px-2">
                                        All {category}
                                   </h1>
                              </div>
                              <div className="flex justify-center">
                                   <div className="w-20"></div>
                              </div>
                              <div className="flex justify-end">
                                   <button
                                        onClick={() => navigate(-1)}
                                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors group"
                                   >
                                        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" size={20} />
                                        <span className="font-medium text-base sm:text-lg">Back to Home</span>
                                   </button>
                              </div>
                         </div>
                    </div>
               </header>

               <main className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                         <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                              {products.length} {products.length === 1 ? 'item' : 'items'} found
                         </h2>

                         <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                              <Select
                                   className="text-sm w-full sm:w-48"
                                   options={[
                                        { value: '', label: 'All Subcategories' },
                                        { value: 'Science', label: 'Science' },
                                        { value: 'Fiction', label: 'Fiction' },
                                   ]}
                                   value={{ value: selectedSubcategory, label: selectedSubcategory || 'All Subcategories' }}
                                   onChange={(option) => setSelectedSubcategory(option.value)}
                              />

                              <Select
                                   className="text-sm w-full sm:w-48"
                                   options={[
                                        { value: 'latest', label: 'Recently Listed' },
                                        { value: 'name', label: 'By Name' },
                                        { value: 'price-low', label: 'Price: Low to High' },
                                        { value: 'price-high', label: 'Price: High to Low' }
                                   ]}
                                   value={{
                                        value: sortBy, label: sortBy === 'latest' ? 'Recently Listed' :
                                             sortBy === 'name' ? 'By Name' :
                                                  sortBy === 'price-low' ? 'Price: Low to High' : 'Price: High to Low'
                                   }}
                                   onChange={(option) => setSortBy(option.value)}
                              />
                         </div>
                    </div>

                    {loading ? (
                         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
                              {[...Array(10)].map((_, i) => <ProductCard key={i} loading />)}
                         </div>
                    ) : products.length === 0 ? (
                         <div className="text-center py-12">
                              <div className="text-gray-400 text-lg">No items found in this category</div>
                         </div>
                    ) : (
                         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
                              {sortProducts(products).map(product =>
                                   <ProductCard key={product._id} product={product} />
                              )}
                         </div>
                    )}
               </main>
          </div>
     );
};

export default CategoryPage;