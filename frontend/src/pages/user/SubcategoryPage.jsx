// SubcategoryPage.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Select from 'react-select';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const SubcategoryPage = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [sortOption, setSortOption] = useState('recent');

  useEffect(() => {
    fetchSubcategoryProducts();
  }, [name, sortOption]);

  const fetchSubcategoryProducts = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/products`, {
        params: { subcategory: name, sort: sortOption }
      });
      setProducts(res.data);
    } catch (err) {
      toast.error('Failed to load products');
    }
  };

  const sortOptions = [
    { value: 'recent', label: 'Recently Listed' },
    { value: 'high', label: 'High Price' },
    { value: 'low', label: 'Low Price' }
  ];

  const handleSortChange = (option) => {
    setSortOption(option.value);
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Products in "{name}"</h2>
        <div className="w-60">
          <Select
            options={sortOptions}
            defaultValue={sortOptions[0]}
            onChange={handleSortChange}
          />
        </div>
      </div>

      {products.length === 0 ? (
        <p className="text-gray-500">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((product) => (
            <div
              key={product._id}
              className="border rounded-lg p-3 shadow hover:shadow-xl cursor-pointer"
              onClick={() => handleProductClick(product._id)}
            >
              <img src={product.thumbnail} alt={product.title} className="h-40 w-full object-cover rounded mb-2" />
              <h3 className="font-semibold text-lg">{product.title}</h3>
              <p className="text-gray-600">₹{product.price}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubcategoryPage;