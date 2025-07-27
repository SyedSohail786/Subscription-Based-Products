import { useEffect, useRef, useState } from 'react';
import { useAdminProductStore } from '../../store/adminProductStore';
import AdminCategories from './AdminCategories';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiCheck, FiFile, FiImage, FiPackage, FiGrid } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import toast from 'react-hot-toast';

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
    category: null,
    subcategory: null,
    price: '',
    tags: [],
    file: null,
    image: null,
    tagsInput: '',
    about: '',
    author: '',
    releaseDate: '',
    returnAvailable: 'false'
  });

  const [preview, setPreview] = useState({ file: '', image: '' });
  const [editPreview, setEditPreview] = useState({ file: '', image: '' });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: null,
    subcategory: null,
    price: '',
    tags: [],
    file: null,
    image: null,
    tagsInput: '',
    about: '',
    author: '',
    releaseDate: '',
    returnAvailable: 'false'
  });
  const [subcategoryOptions, setSubcategoryOptions] = useState([]);

  const categoryOptions = categories?.map(cat => ({
    value: cat?._id,
    label: cat?.name
  })) || [];

  useEffect(() => {
    if (form.category) {
      const cat = categories?.find(c => c?._id === form.category?.value);
      setSubcategoryOptions(cat?.subcategories?.map(s => ({ label: s, value: s })) || []);
    }
  }, [form.category, categories]);

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

      setForm({
        title: '',
        description: '',
        category: null,
        subcategory: null,
        price: '',
        tags: [],
        file: null,
        image: null,
        tagsInput: '',
        about: '',
        author: '',
        releaseDate: '',
        returnAvailable: 'false'
      });
      setPreview({ file: '', image: '' });
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (imageInputRef.current) imageInputRef.current.value = '';
      toast.success('Product Added Successfully');
      fetchProducts();
    } catch (error) {
      console.error("Failed to create product:", error);
      toast.error('Failed to add product');
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
    setForm(prev => ({ ...prev, category: selectedOption, subcategory: null }));
  };

  const handleEditCategoryChange = (selectedOption) => {
    setEditForm(prev => ({ ...prev, category: selectedOption, subcategory: null }));
  };

  const handleSubcategoryChange = (selectedOption) => {
    setForm(prev => ({
      ...prev,
      subcategory: selectedOption || null
    }));
  };

  const startEdit = (product) => {
    if (!product) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      tagsInput: product.tags?.join(', ') || '',
      about: product.about || '',
      author: product.author || '',
      releaseDate: product.releaseDate || '',
      returnAvailable: product.returnAvailable ? 'true' : 'false'
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
      subcategory: selectedOption || null
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
      toast.success('Product Updated Successfully');
      fetchProducts();
    } catch (error) {
      console.error("Failed to update product:", error);
      toast.error('Failed to update product');
    } finally {
      setIsUpdating(false);
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditForm({
      title: '',
      description: '',
      category: null,
      subcategory: null,
      price: '',
      tags: [],
      file: null,
      image: null,
      tagsInput: '',
      about: '',
      author: '',
      releaseDate: '',
      returnAvailable: 'false'
    });
    setEditPreview({ file: '', image: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 sm:p-8 text-white">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <FiPackage className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">Product Management</h1>
                  <p className="text-white/90">Manage your products and categories</p>
                </div>
              </div>
            </div>
            
            {/* Tab Navigation */}
            <div className="p-6 sm:p-8 border-b border-gray-200">
              <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setSection('products')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium rounded-lg transition-all duration-200 ${
                    section === 'products'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FiPackage className="w-4 h-4" />
                  Products
                </button>
                <button
                  onClick={() => setSection('categories')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium rounded-lg transition-all duration-200 ${
                    section === 'categories'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FiGrid className="w-4 h-4" />
                  Categories
                </button>
              </div>
            </div>
          </div>
        </div>

        {section === 'categories' ? (
          <AdminCategories />
        ) : (
          <>
            {/* Product Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  {editId ? <FiEdit2 className="w-5 h-5 text-green-600" /> : <FiPlus className="w-5 h-5 text-green-600" />}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {editId ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {editId ? 'Update product information' : 'Create a new product listing'}
                  </p>
                </div>
              </div>

              <form onSubmit={editId ? handleUpdate : handleCreate} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Title*</label>
                    <input
                      name="title"
                      value={editId ? editForm.title : form.title}
                      onChange={editId ? handleEditChange : handleFormChange}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="Enter product title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Short Description</label>
                    <input
                      name="shortDescription"
                      value={editId ? editForm.shortDescription || '' : form.shortDescription || ''}
                      onChange={editId ? handleEditChange : handleFormChange}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="Brief description of the product"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category*</label>
                    <Select
                      options={categoryOptions}
                      value={editId ? editForm.category : form.category}
                      onChange={editId ? handleEditCategoryChange : handleCategoryChange}
                      classNamePrefix="react-select"
                      className="react-select-container"
                      isClearable
                      placeholder="Select category"
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                        menu: (base) => ({ ...base, zIndex: 9999 })
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Subcategory</label>
                    <Select
                      options={subcategoryOptions}
                      value={editId ? editForm.subcategory : form.subcategory}
                      onChange={editId ? handleEditSubcategoryChange : handleSubcategoryChange}
                      classNamePrefix="react-select"
                      className="react-select-container"
                      isClearable
                      placeholder="Select subcategory"
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                        menu: (base) => ({ ...base, zIndex: 9999 })
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Author Name</label>
                    <input
                      name="author"
                      value={editId ? editForm.author || '' : form.author || ''}
                      onChange={editId ? handleEditChange : handleFormChange}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="Author or creator name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Release Date</label>
                    <input
                      type="date"
                      name="releaseDate"
                      value={editId ? editForm.releaseDate || '' : form.releaseDate || ''}
                      onChange={editId ? handleEditChange : handleFormChange}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">About the Book / Audio</label>
                    <textarea
                      name="about"
                      rows="4"
                      value={editId ? editForm.about || '' : form.about || ''}
                      onChange={editId ? handleEditChange : handleFormChange}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                      placeholder="Detailed description about the product"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Price*</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
                      <input
                        type="number"
                        name="price"
                        value={editId ? editForm.price || '' : form.price || ''}
                        onChange={editId ? handleEditChange : handleFormChange}
                        className="w-full pl-8 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tags (comma separated)</label>
                    <input
                      type="text"
                      name="tagsInput"
                      value={editId ? editForm.tagsInput || '' : form.tagsInput || ''}
                      onChange={editId ? handleEditChange : handleFormChange}
                      placeholder="e.g. fiction, thriller, AI"
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Return Available</label>
                    <select
                      name="returnAvailable"
                      value={editId ? editForm.returnAvailable || 'false' : form.returnAvailable || 'false'}
                      onChange={editId ? handleEditChange : handleFormChange}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Product File</label>
                      <label className="cursor-pointer bg-gray-50 hover:bg-gray-100 px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 hover:border-indigo-300 flex items-center justify-center transition-all duration-200">
                        <FiFile className="mr-2 text-gray-500" />
                        <span className="text-sm text-gray-600">Choose File</span>
                        <input
                          type="file"
                          name="file"
                          accept=".pdf,.zip"
                          onChange={editId ? handleEditChange : handleFormChange}
                          ref={fileInputRef}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {editId
                          ? (editForm.file?.name || (editPreview.file ? 'Current file' : 'No file'))
                          : (form.file?.name || 'No file selected')}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Product Image</label>
                      <label className="cursor-pointer bg-gray-50 hover:bg-gray-100 px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 hover:border-indigo-300 flex items-center justify-center transition-all duration-200">
                        <FiImage className="mr-2 text-gray-500" />
                        <span className="text-sm text-gray-600">Choose Image</span>
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
                          className="h-16 w-16 mt-2 rounded-xl object-cover border-2 border-gray-200"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  {editId && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium flex items-center"
                      disabled={isUpdating}
                    >
                      <FiX className="mr-2" />
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium flex items-center disabled:opacity-50 shadow-lg hover:shadow-xl"
                    disabled={isCreating || isUpdating}
                  >
                    {editId ? (
                      <>
                        {isUpdating ? (
                          'Updating...'
                        ) : (
                          <>
                            <FiCheck className="mr-2" />
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
                            <FiPlus className="mr-2" />
                            Add Product
                          </>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Products List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 sm:p-8 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FiPackage className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Product List</h2>
                    <p className="text-sm text-gray-600">{products?.length || 0} products total</p>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="p-8">
                  <div className="animate-pulse space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded-xl"></div>
                    ))}
                  </div>
                </div>
              ) : !products?.length ? (
                <div className="text-center p-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiPackage className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-600">Get started by adding your first product</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Subcategory</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tags</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products?.map((product) => (
                        product && (
                          <motion.tr
                            key={product._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center min-w-[200px]">
                                {product?.imageUrl ? (
                                  <img
                                    src={`${BACKEND_URL}/${product.imageUrl}`}
                                    alt={product.title || 'Product'}
                                    className="h-12 w-12 rounded-xl object-cover mr-3 border border-gray-200"
                                  />
                                ) : (
                                  <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center mr-3">
                                    <FiImage className="text-gray-400" />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <div className="text-sm font-semibold text-gray-900 truncate">
                                    {product.title || 'Untitled Product'}
                                  </div>
                                  <div className="text-xs text-gray-500 truncate">
                                    by {product.author || 'Unknown Author'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                {product.category?.name || 'Uncategorized'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {product.subcategory || '-'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-gray-900">
                                ₹{product.price || '0'}
                              </div>
                            </td>
                            <td className="px-6 py-4 max-w-[200px]">
                              <div className="flex flex-wrap gap-1">
                                {product.tags?.slice(0, 2).map((tag, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 truncate max-w-[80px]"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {product.tags?.length > 2 && (
                                  <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-600">
                                    +{product.tags.length - 2}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => startEdit(product)}
                                  className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition-colors"
                                  title="Edit Product"
                                >
                                  <FiEdit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this product?')) {
                                      deleteProduct(product._id);
                                    }
                                  }}
                                  className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete Product"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </div>
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
    </div>
  );
}
