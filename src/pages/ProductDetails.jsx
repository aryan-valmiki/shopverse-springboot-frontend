import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { fetchProductById } from '../features/products/product.js';
import { addToCart } from '../features/cart/cart.js';
import { useSelector } from 'react-redux';
import { deleteProduct, updateProductStatus } from '../features/admin/admin.js';
import { toast } from 'react-toastify';

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const navigate = useNavigate();
  const { isLoggedIn, user } = useSelector((state) => state.auth);

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      toast.info("Please log in to add items to your cart");
      return navigate("/login");
    }
    if (quantity <= 0) return setError('Please select a valid quantity');

    try {
      setAddingToCart(true);
      const response = await addToCart({ productId: product.id, quantity });

      if (response.status === 201) {
        toast.success("Product added to cart!");
      } else {
        throw new Error('Unable to add product to cart');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message;
      setError(msg);
      toast.error(msg);
    } finally {
      setAddingToCart(false);
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

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      const res = await updateProductStatus(id, newStatus);
      if (res.status === 200) {
        toast.success(`Product status updated to ${newStatus}`);
        setProduct(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
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

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-indigo-600 mb-4"></div>
        <p className="text-slate-500 font-medium">Loading product specifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center">
        <p className="text-rose-700 font-bold mb-4">{error}</p>
        <Link to="/" className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold">
          Return to Store
        </Link>
      </div>
    );
  }

  if (!product) return null;

  const currentStatus = (product.status || 'ACTIVE').toUpperCase();
  const isOutOfStock = currentStatus === 'OUT_OF_STOCK' || product.stock <= 0;
  const isInactive = currentStatus === 'INACTIVE';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Quick Control Banner */}
      {user?.isAdmin && (
        <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-300 px-2.5 py-1 rounded-lg">
              Admin Control Panel
            </span>
            <span className="text-xs text-slate-400">Change product availability on store:</span>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={currentStatus}
              disabled={updatingStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
            >
              <option value="ACTIVE">🟢 Set ACTIVE</option>
              <option value="OUT_OF_STOCK">🟡 Set OUT OF STOCK</option>
              <option value="INACTIVE">⚪ Set INACTIVE (Hidden)</option>
            </select>
            {updatingStatus && <span className="text-xs text-indigo-400 animate-spin">⏳</span>}
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400">
        <Link to="/" className="hover:text-slate-800 transition">Store</Link>
        <span>/</span>
        <span className="text-slate-600">{product.category || 'Electronics'}</span>
        <span>/</span>
        <span className="text-slate-900 truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Product Image Container */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm flex items-center justify-center relative overflow-hidden group">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-80 sm:h-[420px] object-contain group-hover:scale-105 transition-transform duration-300"
          />

          {product.category && (
            <span className="absolute top-6 left-6 bg-slate-900 text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-xl shadow-md">
              {product.category}
            </span>
          )}

          {/* Status Badge */}
          <span className={`absolute top-6 right-6 text-xs font-bold px-3 py-1 rounded-full border ${
            currentStatus === 'ACTIVE'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : currentStatus === 'OUT_OF_STOCK'
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-slate-100 text-slate-700 border-slate-300'
          }`}>
            {currentStatus === 'ACTIVE' ? '🟢 In Stock' : currentStatus === 'OUT_OF_STOCK' ? '🟡 Out of Stock' : '⚪ Inactive'}
          </span>
        </div>

        {/* Right: Product Details & Purchase Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            {product.brand && (
              <span className="text-xs font-black uppercase tracking-wider text-indigo-600 block mb-1">
                {product.brand}
              </span>
            )}
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {product.name}
            </h1>
          </div>

          {/* Pricing & Stock Status */}
          <div className="flex items-baseline gap-4 pb-4 border-b border-slate-200/80">
            <span className="text-3xl sm:text-4xl font-black text-slate-900">
              ₹{product.price?.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-400 font-medium">Inclusive of all taxes</span>
            <span className={`ml-auto inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${
              isOutOfStock
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`}></span>
              {isOutOfStock ? 'Out of Stock' : `Available (${product.stock} units)`}
            </span>
          </div>

          {/* Description */}
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {product.description}
          </p>

          {/* Hardware Specifications Grid */}
          {(product.ram || product.processor || product.storage || product.brand) && (
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Verified Hardware Specifications
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {product.ram && (
                  <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-xs">
                    <span className="text-[11px] text-slate-400 block font-medium">System RAM</span>
                    <span className="text-sm font-bold text-slate-800">{product.ram}</span>
                  </div>
                )}
                {product.processor && (
                  <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-xs">
                    <span className="text-[11px] text-slate-400 block font-medium">Processor (CPU)</span>
                    <span className="text-sm font-bold text-slate-800 truncate block">{product.processor}</span>
                  </div>
                )}
                {product.storage && (
                  <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-xs">
                    <span className="text-[11px] text-slate-400 block font-medium">Storage Capacity</span>
                    <span className="text-sm font-bold text-slate-800">{product.storage}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          {!isOutOfStock && product.stock > 0 && (
            <div className="flex items-center gap-4">
              <label htmlFor="qty" className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Quantity:
              </label>
              <select
                id="qty"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {[...Array(Math.min(product.stock, 8))].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Action Buttons Strip */}
          <div className="flex flex-wrap gap-3 pt-2">
            {!user?.isAdmin && (
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || isOutOfStock || isInactive}
                className={`flex-1 py-4 px-6 rounded-2xl font-bold text-sm sm:text-base transition shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                  isOutOfStock || isInactive
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                    : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20'
                }`}
              >
                <span>🛒</span>
                <span>
                  {isInactive
                    ? 'Product Inactive'
                    : isOutOfStock
                    ? 'Currently Out of Stock'
                    : addingToCart
                    ? 'Adding to Cart...'
                    : 'Add to Shopping Cart'}
                </span>
              </button>
            )}

            {user?.isAdmin && (
              <button
                onClick={handleDelete}
                className="py-4 px-6 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm transition shadow-lg shadow-rose-600/20 cursor-pointer"
              >
                Delete Product (Admin)
              </button>
            )}

            {/* Compare Button */}
            <Link
              to={`/compare?p1=${product.id}`}
              className="py-4 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <span>⚔️ Compare</span>
            </Link>

            {/* AI Advisor Button */}
            <Link
              to="/ai-recommend"
              className="py-4 px-5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-sm transition flex items-center justify-center gap-1.5"
            >
              <span>✨ Ask AI</span>
            </Link>
          </div>

          {/* Value Props Strip */}
          <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-base block mb-0.5">🚚</span>
              <span className="text-[11px] font-semibold text-slate-700 block">Free Express Dispatch</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-base block mb-0.5">🛡️</span>
              <span className="text-[11px] font-semibold text-slate-700 block">1 Year Warranty</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-base block mb-0.5">🔄</span>
              <span className="text-[11px] font-semibold text-slate-700 block">7-Day Replacement</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
