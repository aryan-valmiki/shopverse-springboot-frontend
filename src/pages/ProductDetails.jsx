import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchProductById } from '../features/products/product.js';
import { addToCart } from '../features/cart/cart.js';
import { useSelector } from 'react-redux';
import { deleteProduct } from '../features/admin/admin.js';
import { toast } from 'react-toastify';

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  const { isLoggedIn, user } = useSelector((state) => state.auth);

  const handleAddToCart = async () => {
    if (!isLoggedIn) return navigate("/login");
    if (quantity <= 0) return setError('Please select a valid quantity');

    try {
      const response = await addToCart({ productId: product.id, quantity });

      if (response.status === 201) {
        toast.success("Product added to cart");
        navigate('/cart');
      } else {
        throw new Error('Unable to add product to cart');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message;
      setError(msg);
      toast.error(msg);
    }
  };

  const handleDelete = async () => {
    if (!isLoggedIn) return navigate("/login");
    if (!user?.isAdmin) return setError("Unauthorized request");

    const confirmed = window.confirm("Are you sure you want to delete this product?");
    if (!confirmed) return;

    try {
      await deleteProduct(id);
      toast.success("Product deleted successfully");
      navigate('/admin/dashboard');
    } catch (err) {
      const msg = err?.response?.data?.message || err.message;
      setError(msg);
      toast.error(msg);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchProductById(id);
        setProduct(res.data);
      } catch (err) {
        const msg = err?.response?.data?.message || err.message;
        setError(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="text-center text-xl p-10">Loading...</div>;
  if (error) return <div className="text-red-500 text-center text-lg p-5">{error}</div>;
  if (!product) return null;

  return (
    <div className="max-w-5xl mx-auto p-6 flex flex-col md:flex-row gap-8">
      <img
        src={product.imageUrl}
        alt={product.name}
        className="w-full md:w-1/2 h-96 object-contain rounded-lg border"
      />

      <div className="flex-1">
        <h1 className="text-3xl font-semibold mb-2">{product.name}</h1>
        <p className="text-gray-600 mb-4">{product.description}</p>
        <p className="text-2xl font-bold text-green-700 mb-6">₹{product.price}</p>

        {product.stock > 1 && (
          <div className="mb-4">
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
              Quantity:
            </label>
            <select
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="border rounded px-3 py-2 w-24"
            >
              {[...Array(product.stock)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-4">
          {!user?.isAdmin && (
            <button
            onClick={handleAddToCart}
            className="px-6 py-3 bg-yellow-500 text-black font-semibold rounded hover:bg-yellow-400 transition"
          >
            Add to Cart
          </button>
          )}

          {user?.isAdmin && (
            <button
              onClick={handleDelete}
              className="px-6 py-3 bg-red-600 text-white font-semibold rounded hover:bg-red-500 transition"
            >
              Delete Product
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
