import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiChevronDown } from "react-icons/fi";

const CategoryDropdown = ({ categories }) => {
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const navigate = useNavigate();

  return (
    <div className="flex justify-center">
      <div className="flex space-x-4 sm:space-x-6">
        {categories.map((category) => (
          <div 
            key={category._id}
            className="relative"
            onMouseEnter={() => setHoveredCategory(category._id)}
            onMouseLeave={() => setHoveredCategory(null)}
          >
            <div
              className={`flex items-center py-2 px-3 sm:px-4 font-medium cursor-pointer text-sm sm:text-base transition-colors ${
                hoveredCategory === category._id 
                  ? 'text-blue-600' 
                  : 'text-gray-700 hover:text-blue-500'
              }`}
            >
              {category.name}
              <FiChevronDown className="ml-1 w-3 h-3" />
            </div>

            {hoveredCategory === category._id && (
              <div className="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10 py-1">
                {category.subcategories.map((subcat) => (
                  <button
                    key={subcat}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      navigate(`/subcategory/${category.name.toLowerCase()}/${subcat.toLowerCase().replace(' ', '-')}`);
                      setHoveredCategory(null);
                    }}
                  >
                    {subcat}
                  </button>
                ))}
                <Link
                  to={`/category/${category.name.toLowerCase()}`}
                  className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 font-medium border-t border-gray-100 mt-1 pt-2"
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
  );
};

export default CategoryDropdown;
