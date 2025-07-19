import { useEffect, useState } from 'react';
import { useAdminProductStore } from '../../store/adminProductStore'; 

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

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    tags: '',
    file: null,
    image: null,
  });

  const [preview, setPreview] = useState({ file: '', image: '' });
  const [editPreview, setEditPreview] = useState({ file: '', image: '' });

  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleCreate = async () => {
    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      formData.append(key, key === 'tags' ? form[key].split(',') : form[key]);
    });
    await createProduct(formData);
    setForm({ title: '', description: '', category: '', price: '', tags: '', file: null, image: null });
    setPreview({ file: '', image: '' });
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

  const startEdit = (product) => {
    setEditId(product._id);
    setEditForm({
      title: product.title,
      description: product.description,
      category: product.category,
      price: product.price,
      tags: product.tags.join(','),
      file: null,
      image: null,
    });
    setEditPreview({ file: '', image: '' });
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

  const handleUpdate = async () => {
    const formData = new FormData();
    Object.keys(editForm).forEach((key) => {
      if (editForm[key]) {
        formData.append(key, key === 'tags' ? editForm[key].split(',') : editForm[key]);
      }
    });
    await updateProduct(editId, formData);
    setEditId(null);
    setEditForm({});
    setEditPreview({ file: '', image: '' });
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Products</h1>

      {/* CREATE FORM */}
      <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg mb-6">
        <input name="title" placeholder="Title" value={form.title} onChange={handleFormChange} className="border p-2" />
        <input name="description" placeholder="Description" value={form.description} onChange={handleFormChange} className="border p-2" />
        <select name="category" value={form.category} onChange={handleFormChange} className="border p-2">
          <option value="">Select Category</option>
          {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
        </select>
        <input name="price" placeholder="Price" value={form.price} onChange={handleFormChange} className="border p-2" />
        <input name="tags" placeholder="Tags (comma-separated)" value={form.tags} onChange={handleFormChange} className="border p-2" />
        <div>
          <input type="file" name="file" onChange={handleFormChange} className="border p-2" />
          {preview.file && <p className="text-xs text-gray-500 mt-1">Selected: {form.file?.name}</p>}
        </div>
        <div>
          <input type="file" name="image" onChange={handleFormChange} className="border p-2" />
          {preview.image && <img src={preview.image} alt="Preview" className="h-20 mt-2 rounded" />}
        </div>
        <button onClick={handleCreate} className="bg-blue-600 text-white py-2 px-4 rounded">Add Product</button>
      </div>

      {/* PRODUCT LIST */}
      <div className="grid gap-4">
        {products.map(product => (
          editId === product._id ? (
            <div key={product._id} className="p-4 border rounded grid grid-cols-2 gap-2">
              <input name="title" value={editForm.title} onChange={handleEditChange} className="border p-2" />
              <input name="description" value={editForm.description} onChange={handleEditChange} className="border p-2" />
              <select name="category" value={editForm.category} onChange={handleEditChange} className="border p-2">
                {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
              </select>
              <input name="price" value={editForm.price} onChange={handleEditChange} className="border p-2" />
              <input name="tags" value={editForm.tags} onChange={handleEditChange} className="border p-2" />
              <div>
                <input type="file" name="file" onChange={handleEditChange} className="border p-2" />
                {editPreview.file && <p className="text-xs text-gray-500 mt-1">Selected: {editForm.file?.name}</p>}
              </div>
              <div>
                <input type="file" name="image" onChange={handleEditChange} className="border p-2" />
                {editPreview.image && <img src={editPreview.image} alt="Preview" className="h-20 mt-2 rounded" />}
              </div>
              <div className="col-span-2 flex gap-4">
                <button onClick={handleUpdate} className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
                <button onClick={() => setEditId(null)} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
              </div>
            </div>
          ) : (
            <div key={product._id} className="border p-4 rounded shadow-sm flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">{product.title}</h2>
                <p className="text-sm">{product.description}</p>
                <p className="text-xs text-gray-500">₹ {product.price} | Category: {product.category}</p>
                <p className="text-xs text-gray-400">Tags: {product.tags.join(', ')}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(product)} className="text-blue-600 font-semibold">Edit</button>
                <button onClick={() => deleteProduct(product._id)} className="text-red-600 font-semibold">Delete</button>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}
