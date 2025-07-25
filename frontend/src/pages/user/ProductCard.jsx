import { FiStar } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product, loading = false }) => {
  const navigate = useNavigate();

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
      className="w-full bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100"
      onClick={() => navigate(`/product/${product._id}`)}
    >
      <div className="aspect-[2/3] relative">
        <img
          src={`${import.meta.env.VITE_BACKEND_URL}/${product.imageUrl}`}
          alt={product.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/300x450?text=No+Image";
          }}
        />
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="text-sm sm:text-base font-medium text-gray-900 line-clamp-2 mb-1 sm:mb-2">
          {product.title}
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">{product.author}</p>
        <div className="flex justify-between items-center">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <FiStar
                key={i}
                className={`w-3 h-3 sm:w-4 sm:h-4 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`}
              />
            ))}
          </div>
          <span className="text-sm sm:text-base font-semibold text-blue-600">
            ₹{product.price}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;