import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { createProduct } from '../../features/admin/admin.js';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function CreateProduct() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState(null);

  // New hardware specification fields
  const [category, setCategory] = useState('Laptops');
  const [brand, setBrand] = useState('');
  const [ram, setRam] = useState('');
  const [processor, setProcessor] = useState('');
  const [storage, setStorage] = useState('');

  const [error, setError] = useState(null);
  const user = useSelector((state) => state.auth);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user.isLoggedIn) return navigate("/login");
    if (!user.user.isAdmin) return setError("Unauthorized request");
    if (!name || !price || !description || !stock || !image) {
      return setError("Name, price, description, stock, and image are required");
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("description", description);
    formData.append("stock", stock);
    formData.append("image", image);

    // Optional hardware specs
    if (category) formData.append("category", category);
    if (brand) formData.append("brand", brand);
    if (ram) formData.append("ram", ram);
    if (processor) formData.append("processor", processor);
    if (storage) formData.append("storage", storage);

    try {
      const response = await createProduct(formData);
      if (response.status === 201) {
        toast.success('Product Created Successfully');
        navigate('/admin/dashboard');
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl border shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
          <input
            type="text"
            placeholder="e.g. Dell XPS 15"
            className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            >
              <option value="Laptops">Laptops</option>
              <option value="Smartphones">Smartphones</option>
              <option value="Tablets">Tablets</option>
              <option value="Gaming">Gaming PCs</option>
              <option value="Accessories">Accessories</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
            <input
              type="text"
              placeholder="e.g. Dell, Apple, HP"
              className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">RAM</label>
            <input
              type="text"
              placeholder="e.g. 16GB"
              className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={ram}
              onChange={(e) => setRam(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Processor (CPU)</label>
            <input
              type="text"
              placeholder="e.g. Intel Core i7"
              className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={processor}
              onChange={(e) => setProcessor(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Storage</label>
            <input
              type="text"
              placeholder="e.g. 512GB SSD"
              className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={storage}
              onChange={(e) => setStorage(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
            <input
              type="number"
              placeholder="Price"
              className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
            <input
              type="number"
              placeholder="Stock"
              className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            rows="3"
            placeholder="Product description and features"
            className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Image *</label>
          <input
            type="file"
            className="w-full border p-2 rounded-lg"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>

        {error && <div className="text-red-500 text-sm font-medium">{error}</div>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition cursor-pointer"
        >
          Create Product
        </button>
      </form>
    </div>
  );
}

export default CreateProduct;
