import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Select from 'react-select';
import ProductCard from "./ProductCard";
import { FiSearch, FiFilter, FiArrowLeft } from "react-icons/fi";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const SearchResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [results, setResults] = useState({ ebooks: [], audio: [] });
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState("latest");

    const searchQuery = new URLSearchParams(location.search).get('q');

    useEffect(() => {
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

    const totalResults = results.ebooks.length + results.audio.length;

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
                    
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <FiSearch className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Search Results</h1>
                                <p className="text-gray-600">
                                    for "{searchQuery}"
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Found</span>
                                <span className="font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full text-sm">
                                    {loading ? "..." : totalResults} {totalResults === 1 ? 'result' : 'results'}
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <FiFilter className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-500 font-medium">Sort by:</span>
                                </div>
                                <Select
                                    className="react-select-container text-sm w-48"
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

                {/* Results */}
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                        {[...Array(10)].map((_, i) => (
                            <ProductCard key={i} loading />
                        ))}
                    </div>
                ) : (
                    <>
                        {results.ebooks.length > 0 && (
                            <section className="mb-12">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">eBooks</h3>
                                        <p className="text-sm text-gray-600">{results.ebooks.length} {results.ebooks.length === 1 ? 'book' : 'books'} found</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                                    {sortProducts(results.ebooks).map(product => (
                                        <ProductCard key={product._id} product={product} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {results.audio.length > 0 && (
                            <section className="mb-12">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Audio Books</h3>
                                        <p className="text-sm text-gray-600">{results.audio.length} {results.audio.length === 1 ? 'audiobook' : 'audiobooks'} found</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                                    {sortProducts(results.audio).map(product => (
                                        <ProductCard key={product._id} product={product} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {totalResults === 0 && (
                            <div className="text-center py-16">
                                <div className="max-w-md mx-auto">
                                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                        <FiSearch className="w-10 h-10 text-gray-500" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                                    <p className="text-gray-600 mb-6">
                                        We couldn't find any products matching "{searchQuery}". Try adjusting your search terms or browse our categories.
                                    </p>
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => navigate("/")}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-colors"
                                        >
                                            Browse All Products
                                        </button>
                                        <p className="text-sm text-gray-500">
                                            or try searching for popular terms like "fiction", "self-help", or "mystery"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SearchResults;
