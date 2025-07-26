import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Select from 'react-select';
import ProductCard from "./ProductCard";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const SearchResults = () => {
     const location = useLocation();
     const navigate = useNavigate();
     const [results, setResults] = useState({ ebooks: [], audio: [] });
     const [loading, setLoading] = useState(true);
     const [sortBy, setSortBy] = useState("latest");

     useEffect(() => {
          const searchQuery = new URLSearchParams(location.search).get('q');
          if (searchQuery) {
               setLoading(true);
               axios.get(`${BACKEND_URL}/api/products`, { params: { search: searchQuery } })
                    .then(res => {
                         const ebooks = res.data.products.filter(p => p.category?.name === "Books");
                         const audio = res.data.products.filter(p => p.category?.name === "Audio");
                         setResults({ ebooks, audio });
                         setLoading(false);
                    })
                    .catch(console.error);
          }
     }, [location.search]);

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
               <main className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                         <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
                              Search Results for "{new URLSearchParams(location.search).get('q')}"
                         </h2>
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

                    {loading ? (
                         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                              {[...Array(10)].map((_, i) => <ProductCard key={i} loading />)}
                         </div>
                    ) : (
                         <>
                              {results.ebooks.length > 0 && (
                                   <section className="mb-12">
                                        <h3 className="text-xl font-semibold mb-4">eBooks</h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                                             {sortProducts(results.ebooks).map(product =>
                                                  <div key={product._id} className="h-full">
                                                       <ProductCard product={product} />
                                                  </div>
                                             )}
                                        </div>
                                   </section>
                              )}

                              {results.audio.length > 0 && (
                                   <section>
                                        <h3 className="text-xl font-semibold mb-4">Audio Books</h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                                             {sortProducts(results.audio).map(product =>
                                                  <ProductCard key={product._id} product={product} />
                                             )}
                                        </div>
                                   </section>
                              )}

                              {results.ebooks.length === 0 && results.audio.length === 0 && (
                                   <div className="text-center py-12">
                                        <div className="text-gray-400 mb-4">No matching items found</div>
                                   </div>
                              )}
                         </>
                    )}
               </main>
          </div>
     );
};

export default SearchResults;