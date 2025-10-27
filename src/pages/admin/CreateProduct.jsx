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
  const [error, setError] = useState(null)
  const user = useSelector((state) => state.auth)

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user.isLoggedIn) return navigate("login")
    if (!user.user.isAdmin) return setError("Unauthorized request")
    if (!name || !price || !description || !stock || !image) {
      return setError("All fields are required")
    }
    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("description", description);
    formData.append("stock", stock);
    formData.append("image", image);

    try {
      const response = await createProduct(formData);
      if (response.status === 201) {
        toast.success('Product Created');
        navigate('/admin/dashboard');
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10">
      <h2 className="text-2xl font-semibold mb-6">Create Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="Name"
          placeholder="name"
          className="w-full border p-2 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Price"
          className="w-full border p-2 rounded"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <textarea
          placeholder="Description"
          className="w-full border p-2 rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="number"
          placeholder="stock"
          className="w-full border p-2 rounded"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        />
        <input
          type="file"
          className="w-full border p-2 rounded"
          onChange={(e) => setImage(e.target.files[0])}
        />
        {error && <div>{error}</div>}
        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
        >
          Create
        </button>
      </form>
    </div>
  );
}

export default CreateProduct;
