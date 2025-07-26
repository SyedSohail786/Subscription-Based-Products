import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const sortOptions = [
  { value: 'latest', label: 'Recently Added' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name', label: 'Name (A-Z)' }
];

const SubcategoryPage = () => {
  const { name, subcategory} = useParams();
  const [products, setProducts] = useState([]);
  const [sortBy, setSortBy] = useState('latest');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/products`, { params: {category: name, subcategory: subcategory, sortBy } })
      .then(res => setProducts(res.data.products || []))
      .catch(console.error);
  }, [name, subcategory, sortBy]);

  const sortProducts = (list) => {
    switch (sortBy) {
      case 'price-high': return [...list].sort((a, b) => b.price - a.price);
      case 'price-low': return [...list].sort((a, b) => a.price - b.price);
      case 'name': return [...list].sort((a, b) => a.title.localeCompare(b.title));
      default: return list;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold"> {name}-{subcategory} </h2>
        <div className="w-40">
          <Select
            options={sortOptions}
            defaultValue={sortOptions[0]}
            onChange={(option) => setSortBy(option.value)}
          />
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No books found in this subcategory</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {sortProducts(products).map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md cursor-pointer"
              onClick={() => navigate(`/product/${product._id}`)}
            >
              <div className="aspect-[2/3]">
                <img
                  src={`${BACKEND_URL}/${product.imageUrl}`}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  onError={(e) => e.target.src = 'https://via.placeholder.com/300x450?text=No+Image'}
                />
              </div>
              <div className="p-3">
                <h3 className="text-sm font-semibold line-clamp-2">{product.title}</h3>
                <p className="text-xs text-gray-500">{product.author}</p>
                <p className="text-blue-600 font-semibold mt-1 text-sm">₹{product.price}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubcategoryPage;
