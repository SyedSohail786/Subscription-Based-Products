import { useNavigate } from "react-router-dom";

const ProductCard = ({ product, loading = false }) => {
  const navigate = useNavigate();

  const handleProductClick = () => {
    try {
      const viewedStr = localStorage.getItem('recentlyViewed');
      let viewed = [];
      
      if (viewedStr) {
        try {
          viewed = JSON.parse(viewedStr);
          if (!Array.isArray(viewed)) {
            viewed = [];
          }
        } catch (e) {
          console.error('Error parsing recently viewed:', e);
          viewed = [];
        }
      }

      const updated = [
        product,
        ...viewed.filter(item => item?._id !== product._id)
      ].slice(0, 10);
      
      localStorage.setItem('recentlyViewed', JSON.stringify(updated));
      navigate(`/product/${product._id}`);
    } catch (error) {
      console.error('Error handling product click:', error);
      navigate(`/product/${product._id}`);
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
        <div className="aspect-[2/3] bg-gray-200 animate-pulse"></div>
        <div className="p-3 sm:p-4">
          <div className="h-4 sm:h-5 bg-gray-200 rounded mb-2 w-4/5"></div>
          <div className="h-3 sm:h-4 bg-gray-200 rounded mb-2 w-3/5"></div>
          <div className="h-4 sm:h-4 bg-gray-200 rounded w-2/5"></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-full bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100 h-full flex flex-col"
      onClick={handleProductClick}
    >
      <div className="aspect-[2/3] relative flex-shrink-0">
        <img
          src={`${import.meta.env.VITE_BACKEND_URL}/${product.imageUrl}`}
          alt={product.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/300x450?text=No+Image";
          }}
        />
      </div>
      <div className="p-3 sm:p-4 flex-grow flex flex-col">
        <h3 className="text-sm sm:text-base font-medium text-gray-900 line-clamp-2 mb-1 sm:mb-2">
          {product.title}
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3 line-clamp-1">
          {product.author}
        </p>
        <div className="mt-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {product.averageRating ? (
                <>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-xs sm:text-sm ml-1 text-gray-700">
                    {product.averageRating} ({product.reviewCount || 0})
                  </span>
                </>
              ) : (
                <span className="text-xs sm:text-sm text-gray-500">No reviews</span>
              )}
            </div>
            <span className="text-sm sm:text-base font-semibold text-blue-600">
              ₹{product.price}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;