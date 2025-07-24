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
    products = [],
    categories = [],
    fetchProducts,
    fetchCategories,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useAdminProductStore();

  const [section, setSection] = useState('products');
  const fileInputRef = useRef();
  const imageInputRef = useRef();
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    price: '',
    tags: [],
    file: null,
    image: null,
  });

  const [preview, setPreview] = useState({ file: '', image: '' });
  const [editPreview, setEditPreview] = useState({ file: '', image: '' });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [subcategoryOptions, setSubcategoryOptions] = useState([]);

  // Format categories for React Select
  const categoryOptions = categories?.map(cat => ({
    value: cat?._id,
    label: cat?.name
  })) || [];

  // When a category is selected in create form
  useEffect(() => {
    if (form.category) {
      const cat = categories?.find(c => c?._id === form.category?.value);
      setSubcategoryOptions(cat?.subcategories?.map(s => ({ label: s, value: s })) || []);
    }
  }, [form.category, categories]);

  // When editing an existing product
  useEffect(() => {
    if (editForm.category) {
      const cat = categories?.find(c => c?._id === editForm.category?.value);
      setSubcategoryOptions(cat?.subcategories?.map(s => ({ label: s, value: s })) || []);
    }
  }, [editForm.category, categories]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        if (section === 'products') {
          await fetchProducts();
          await fetchCategories();
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [section]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setIsCreating(true);
      const formData = new FormData();
      
      Object.keys(form).forEach((key) => {
        if (key === 'tags') {
          formData.append(key, JSON.stringify(form[key]?.map(tag => tag?.value) || []));
        } else if (key === 'category') {
          if (form[key]?.value) {
            formData.append(key, form[key].value);
          }
        } else if (key === 'subcategory') {
          // Handle subcategory value extraction
          if (form[key]?.value) {
            formData.append(key, form[key].value);
          } else if (typeof form[key] === 'string') {
            formData.append(key, form[key]);
          }
        } else if (form[key] !== null && form[key] !== undefined) {
          formData.append(key, form[key]);
        }
      });

      await createProduct(formData);

      // Reset form
      setForm({
        title: '',
        description: '',
        category: '',
        subcategory: '',
        price: '',
        tags: [],
        file: null,
        image: null,
      });
      setPreview({ file: '', image: '' });
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (imageInputRef.current) imageInputRef.current.value = '';
    } catch (error) {
      console.error("Failed to create product:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      const file = files[0];
      setForm(prev => ({ ...prev, [name]: file }));
      const url = URL.createObjectURL(file);
      setPreview(prev => ({ ...prev, [name]: url }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCategoryChange = (selectedOption) => {
    setForm(prev => ({ ...prev, category: selectedOption, subcategory: '' }));
  };

  const handleSubcategoryChange = (selectedOption) => {
    // Store just the value if selectedOption exists, otherwise store empty string
    setForm(prev => ({ 
      ...prev, 
      subcategory: selectedOption ? selectedOption.value : '' 
    }));
  };

  const startEdit = (product) => {
    if (!product) return;
    
    setEditId(product._id);
    setEditForm({
      title: product.title || '',
      description: product.description || '',
      category: product.category ? { 
        value: product.category._id, 
        label: product.category.name 
      } : null,
      subcategory: product.subcategory ? {
        value: product.subcategory,
        label: product.subcategory
      } : null,
      price: product.price || '',
      tags: product.tags?.map(tag => ({ value: tag, label: tag })) || [],
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
      setEditForm(prev => ({ ...prev, [name]: file }));
      const url = URL.createObjectURL(file);
      setEditPreview(prev => ({ ...prev, [name]: url }));
    } else {
      setEditForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEditSubcategoryChange = (selectedOption) => {
    setEditForm(prev => ({
      ...prev,
      subcategory: selectedOption ? selectedOption.value : ''
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      const formData = new FormData();

      Object.keys(editForm).forEach((key) => {
        if (editForm[key] !== null && editForm[key] !== undefined) {
          if (key === 'tags') {
            formData.append(key, JSON.stringify(editForm[key]?.map(tag => tag?.value) || []));
          } else if (key === 'category') {
            if (editForm[key]?.value) {
              formData.append(key, editForm[key].value);
            }
          } else if (key === 'subcategory') {
            // Handle subcategory value extraction
            if (editForm[key]?.value) {
              formData.append(key, editForm[key].value);
            } else if (typeof editForm[key] === 'string') {
              formData.append(key, editForm[key]);
            }
          } else if (editForm[key] instanceof File) {
            formData.append(key, editForm[key]);
          } else if (typeof editForm[key] !== 'object') {
            formData.append(key, editForm[key]);
          }
        }
      });

      await updateProduct(editId, formData);
      cancelEdit();
    } catch (error) {
      console.error("Failed to update product:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditForm({});
    setEditPreview({ file: '', image: '' });
  };

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

      {section === 'categories' ? (
        <AdminCategories />
      ) : (
        <>
          {/* CREATE/EDIT PRODUCT FORM */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {editId ? 'Edit Product' : 'Add New Product'}
            </h2>

            <form onSubmit={editId ? handleUpdate : handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
                <input
                  name="title"
                  value={editId ? editForm.title : form.title}
                  onChange={editId ? handleEditChange : handleFormChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                <input
                  name="shortDescription"
                  value={editId ? editForm.shortDescription : form.shortDescription || ''}
                  onChange={editId ? handleEditChange : handleFormChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category*</label>
                <Select
                  options={categoryOptions}
                  value={editId ? editForm.category : form.category}
                  onChange={editId ? handleEditCategoryChange : handleCategoryChange}
                  classNamePrefix="react-select"
                  isClearable
                  required
                />
              </div>

              {/* Subcategory */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                <Select
                  options={subcategoryOptions}
                  value={editId ? editForm.subcategory : form.subcategory}
                  onChange={editId ? handleEditSubcategoryChange : handleSubcategoryChange}
                  classNamePrefix="react-select"
                  isClearable
                  placeholder="Select subcategory"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">About the Book / Audio</label>
                <textarea
                  name="about"
                  rows="3"
                  value={editId ? editForm.about : form.about || ''}
                  onChange={editId ? handleEditChange : handleFormChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author Name</label>
                <input
                  name="author"
                  value={editId ? editForm.author : form.author || ''}
                  onChange={editId ? handleEditChange : handleFormChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Release Date</label>
                <input
                  type="date"
                  name="releaseDate"
                  value={editId ? editForm.releaseDate : form.releaseDate || ''}
                  onChange={editId ? handleEditChange : handleFormChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price*</label>
                <input
                  type="number"
                  name="price"
                  value={editId ? editForm.price : form.price}
                  onChange={editId ? handleEditChange : handleFormChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={editId ? editForm.tagsInput || '' : form.tagsInput || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (editId) {
                      setEditForm({
                        ...editForm,
                        tagsInput: value,
                        tags: createTagOptions(value)
                      });
                    } else {
                      setForm({
                        ...form,
                        tagsInput: value,
                        tags: createTagOptions(value)
                      });
                    }
                  }}
                  placeholder="e.g. fiction, thriller, AI"
                  className="w-full p-2.5 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Return Available</label>
                <select
                  name="returnAvailable"
                  value={editId ? editForm.returnAvailable : form.returnAvailable || 'false'}
                  onChange={editId ? handleEditChange : handleFormChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg"
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
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
                    disabled={isUpdating}
                  >
                    <FiX className="inline mr-2" />
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center disabled:opacity-50"
                  disabled={isCreating || isUpdating}
                >
                  {editId ? (
                    <>
                      {isUpdating ? (
                        'Updating...'
                      ) : (
                        <>
                          <FiCheck className="inline mr-2" />
                          Update Product
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {isCreating ? (
                        'Creating...'
                      ) : (
                        <>
                          <FiPlus className="inline mr-2" />
                          Add Product
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* PRODUCT LIST */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <h2 className="text-xl font-semibold p-6 text-gray-800">Product List</h2>

            {loading ? (
              <div className="p-8">
                <div className="animate-pulse space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            ) : !products?.length ? (
              <div className="text-center p-8 text-gray-500">No products found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subcategory</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products?.map((product) => (
                      product && (
                        <motion.tr
                          key={product._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center min-w-[200px]">
                              {product?.imageUrl ? (
                                <img
                                  src={`${BACKEND_URL}/${product.imageUrl}`}
                                  alt={product.title || 'Product'}
                                  className="h-10 w-10 rounded-full object-cover mr-3"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <FiImage className="text-gray-400" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {product.title || 'Untitled Product'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {product.category?.name || 'Uncategorized'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {product.subcategory || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              ₹{product.price || '0'}
                            </div>
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
                      )
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