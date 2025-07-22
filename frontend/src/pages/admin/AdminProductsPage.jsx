import { useEffect, useRef, useState } from 'react';
import { useAdminProductStore } from '../../store/adminProductStore';
import AdminCategories from './AdminCategories';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiCheck, FiFile, FiImage } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const animatedComponents = makeAnimated();

export default function AdminProductsPage() {
  const {
    products,
    categories,
    fetchProducts,
    fetchCategories,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useAdminProductStore();

  const [section, setSection] = useState('products');
  const fileInputRef = useRef();
  const imageInputRef = useRef();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    tags: [],
    file: null,
    image: null,
  });

  const [preview, setPreview] = useState({ file: '', image: '' });
  const [editPreview, setEditPreview] = useState({ file: '', image: '' });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Format categories for React Select
  const categoryOptions = categories.map(cat => ({
    value: cat._id,
    label: cat.name
  }));

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (section === 'products') {
        await fetchProducts();
        await fetchCategories();
      }
      setLoading(false);
    };
    loadData();
  }, [section]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        if (key === 'tags') {
          formData.append(key, JSON.stringify(form[key].map(tag => tag.value)));
        } else if (key === 'category') {
          formData.append(key, form[key].value);
        } else {
          formData.append(key, form[key]);
        }
      });

      await createProduct(formData);

      // Clear form state
      setForm({ 
        title: '', 
        description: '', 
        category: '', 
        price: '', 
        tags: [], 
        file: null, 
        image: null 
      });
      setPreview({ file: '', image: '' });

      // Reset input DOM elements
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (imageInputRef.current) imageInputRef.current.value = '';
    } catch (error) {
      console.error("Failed to create product:", error);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      const file = files[0];
      setForm({ ...form, [name]: file });
      const url = URL.createObjectURL(file);
      setPreview({ ...preview, [name]: url });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleTagsChange = (selectedOptions) => {
    setForm({ ...form, tags: selectedOptions });
  };

  const handleCategoryChange = (selectedOption) => {
    setForm({ ...form, category: selectedOption });
  };

  const startEdit = (product) => {
    setEditId(product._id);
    setEditForm({
      title: product.title,
      description: product.description,
      category: { value: product.category._id, label: product.category.name },
      price: product.price,
      tags: product.tags.map(tag => ({ value: tag, label: tag })),
      file: null,
      image: null,
    });
    setEditPreview({ 
      file: product.fileUrl ? `${BACKEND_URL}/${product.fileUrl}` : '', 
      image: product.imageUrl ? `${BACKEND_URL}/${product.imageUrl}` : '' 
    });
  };

  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      const file = files[0];
      setEditForm({ ...editForm, [name]: file });
      const url = URL.createObjectURL(file);
      setEditPreview({ ...editPreview, [name]: url });
    } else {
      setEditForm({ ...editForm, [name]: value });
    }
  };

  const handleEditTagsChange = (selectedOptions) => {
    setEditForm({ ...editForm, tags: selectedOptions });
  };

  const handleEditCategoryChange = (selectedOption) => {
    setEditForm({ ...editForm, category: selectedOption });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();

      Object.keys(editForm).forEach((key) => {
        if (editForm[key] !== null && editForm[key] !== '') {
          if (key === 'tags') {
            formData.append(key, JSON.stringify(editForm[key].map(tag => tag.value)));
          } else if (key === 'category') {
            formData.append(key, editForm[key].value);
          } else if (key === 'file' || key === 'image') {
            if (editForm[key] instanceof File) {
              formData.append(key, editForm[key]);
            }
          } else {
            formData.append(key, editForm[key]);
          }
        }
      });

      await updateProduct(editId, formData);
      setEditId(null);
      setEditForm({});
      setEditPreview({ file: '', image: '' });
    } catch (error) {
      console.error("Failed to update product:", error);
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditForm({});
    setEditPreview({ file: '', image: '' });
  };

  // Function to create tag options from comma-separated string
  const createTagOptions = (tagsString) => {
    if (!tagsString) return [];
    return tagsString.split(',').map(tag => ({
      value: tag.trim(),
      label: tag.trim()
    }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Toggle Header */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setSection('products')}
          className={`px-4 py-3 font-medium ${section === 'products' 
            ? 'text-indigo-600 border-b-2 border-indigo-600' 
            : 'text-gray-500 hover:text-gray-700'}`}
        >
          Products
        </button>
        <button
          onClick={() => setSection('categories')}
          className={`px-4 py-3 font-medium ${section === 'categories' 
            ? 'text-indigo-600 border-b-2 border-indigo-600' 
            : 'text-gray-500 hover:text-gray-700'}`}
        >
          Categories
        </button>
      </div>

      {/* Render Based on Toggle */}
      {section === 'categories' ? (
        <AdminCategories />
      ) : (
        <>
          {/* CREATE PRODUCT FORM */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {editId ? 'Edit Product' : 'Add New Product'}
            </h2>
            
            <form onSubmit={editId ? handleUpdate : handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
                <input
                  name="title"
                  placeholder="Product title"
                  value={editId ? editForm.title : form.title}
                  onChange={editId ? handleEditChange : handleFormChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category*</label>
                {editId ? (
                  <Select
                    options={categoryOptions}
                    value={editForm.category}
                    onChange={handleEditCategoryChange}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    isClearable
                    required
                  />
                ) : (
                  <Select
                    options={categoryOptions}
                    value={form.category}
                    onChange={handleCategoryChange}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    isClearable
                    required
                  />
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  placeholder="Product description"
                  value={editId ? editForm.description : form.description}
                  onChange={editId ? handleEditChange : handleFormChange}
                  rows="3"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price*</label>
                <input
                  type="number"
                  name="price"
                  placeholder="0.00"
                  value={editId ? editForm.price : form.price}
                  onChange={editId ? handleEditChange : handleFormChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                {editId ? (
                  <Select
                    isMulti
                    components={animatedComponents}
                    options={editForm.tags}
                    value={editForm.tags}
                    onChange={handleEditTagsChange}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="Add tags..."
                    isClearable
                  />
                ) : (
                  <Select
                    isMulti
                    components={animatedComponents}
                    options={form.tags}
                    value={form.tags}
                    onChange={handleTagsChange}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="Add tags..."
                    isClearable
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product File</label>
                <div className="flex items-center">
                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg border border-gray-300 flex items-center">
                    <FiFile className="mr-2" />
                    Choose File
                    <input
                      type="file"
                      name="file"
                      accept=".pdf,.zip"
                      onChange={editId ? handleEditChange : handleFormChange}
                      ref={fileInputRef}
                      className="hidden"
                    />
                  </label>
                  <span className="ml-2 text-sm text-gray-500 truncate max-w-xs">
                    {editId 
                      ? (editForm.file?.name || (editPreview.file ? 'Current file' : 'No file'))
                      : (form.file?.name || 'No file selected')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                <div className="flex items-center">
                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg border border-gray-300 flex items-center">
                    <FiImage className="mr-2" />
                    Choose Image
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={editId ? handleEditChange : handleFormChange}
                      ref={imageInputRef}
                      className="hidden"
                    />
                  </label>
                  {(editId ? editPreview.image : preview.image) && (
                    <img 
                      src={editId ? editPreview.image : preview.image} 
                      alt="Preview" 
                      className="h-10 w-10 ml-2 rounded object-cover" 
                    />
                  )}
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end space-x-3 pt-2">
                {editId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <FiX className="inline mr-2" />
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                >
                  {editId ? (
                    <>
                      <FiCheck className="mr-2" />
                      Update Product
                    </>
                  ) : (
                    <>
                      <FiPlus className="mr-2" />
                      Add Product
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* PRODUCT LIST - Improved Layout */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <h2 className="text-xl font-semibold p-6 text-gray-800">Product List</h2>
            
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center p-8 text-gray-500">No products found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <motion.tr 
                        key={product._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center min-w-[200px]">
                            {product.imageUrl && (
                              <img 
                                src={`${BACKEND_URL}/${product.imageUrl}`} 
                                alt={product.title} 
                                className="h-10 w-10 rounded-full object-cover mr-3" 
                              />
                            )}
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">{product.title}</div>
                              {/* <div className="text-sm text-gray-500 truncate">{product.description}</div> */}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {product.category?.name || 'Uncategorized'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">₹{product.price}</div>
                        </td>
                        <td className="px-6 py-4 max-w-[200px]">
                          <div className="flex flex-wrap gap-1">
                            {product.tags?.map((tag, index) => (
                              <span 
                                key={index} 
                                className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800 truncate max-w-[100px]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => startEdit(product)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            <FiEdit2 className="inline mr-1" /> Edit
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this product?')) {
                                deleteProduct(product._id);
                              }
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FiTrash2 className="inline mr-1" /> Delete
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}