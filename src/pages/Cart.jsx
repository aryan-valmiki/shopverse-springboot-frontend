import React, { useEffect, useState } from 'react';
import { deleteItem, getCart, updateQuantity } from '../features/cart/cart.js';
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { createorder } from '../features/order/order.js';
import { logout } from '../redux/slices/authSlice.js';
import { toast } from 'react-toastify';

function Cart() {
  const [loading, setLoading] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState({ items: [] });
  const [totalAmount, setTotalAmount] = useState(0);

  const loggedInUser = useSelector((state) => state.auth.isLoggedIn);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      if (!loggedInUser) return navigate("/login");
      try {
        setLoading(true);
        setError(null);
        const response = await getCart();
        setCart(response.data.data);
      } catch (error) {
        if (error.response?.status === 401 && error.response?.data === "No cookies") {
          dispatch(logout());
          setError("Session timed out");
          toast.error("Session timed out");
          navigate("/login");
        } else if (error.response?.status !== 401) {
          const msg = error?.response?.data?.message || error?.message || "Failed to load cart";
          setError(msg);
          toast.error(msg);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [loggedInUser]);

  useEffect(() => {
    if (cart?.items) {
      const amount = cart.items.reduce((acc, item) => {
        return acc + (item.product?.price || 0) * item.quantity;
      }, 0);
      setTotalAmount(Number(amount));
    }
  }, [cart]);

  const refreshCart = async () => {
    try {
      const response = await getCart();
      setCart(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleUpdateQuantity = async (cartId, quantity) => {
    if (!loggedInUser) return setError("Login to update quantity");
    try {
      await updateQuantity({ cartId, quantity });
      await refreshCart();
      toast.success("Quantity updated");
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!loggedInUser) return setError("Login to delete item");
    try {
      await deleteItem(id);
      await refreshCart();
      toast.success("Item removed from cart");
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handlePlaceOrder = async () => {
    if (!loggedInUser) return setError("Login to place order");

    try {
      setPlacingOrder(true);
      const response = await createorder();
      if (response.status === 200) {
        toast.success("Order placed successfully! 🎉");
        setCart({ items: [] });
        navigate("/orders");
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-indigo-600 mb-4"></div>
        <p className="text-slate-500 font-medium">Loading your shopping cart...</p>
      </div>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
          🛒
        </div>
        <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Your Shopping Cart is Empty</h2>
        <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
          Explore our AI-recommended tech products or browse the catalog to add items.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            to="/"
            className="px-5 py-3 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition"
          >
            Explore Catalog
          </Link>
          <Link
            to="/ai-recommend"
            className="px-5 py-3 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-sm border border-indigo-200 hover:bg-indigo-100 transition"
          >
            ✨ Ask AI Advisor
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-8">
        Shopping Cart ({cart.items.length} items)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {cart.items.map((cartItem) => {
            const product = cartItem.product;
            if (!product) return null;

            return (
              <div
                key={cartItem.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
              >
                {/* Product Thumbnail & Details */}
                <div className="flex items-center gap-4 flex-1">
                  <div
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="w-24 h-24 bg-slate-50 rounded-2xl p-2 border border-slate-100 flex items-center justify-center cursor-pointer shrink-0"
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="space-y-1">
                    {product.brand && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                        {product.brand}
                      </span>
                    )}
                    <h3
                      onClick={() => navigate(`/product/${product.id}`)}
                      className="text-base font-bold text-slate-800 hover:text-indigo-600 transition cursor-pointer line-clamp-1"
                    >
                      {product.name}
                    </h3>

                    {/* Specs Tags */}
                    {(product.ram || product.processor || product.storage) && (
                      <p className="text-xs text-slate-500 font-medium">
                        {[product.ram, product.processor, product.storage].filter(Boolean).join(' • ')}
                      </p>
                    )}

                    <p className="text-base font-extrabold text-slate-900 pt-1">
                      ₹{product.price?.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Quantity & Delete Controls */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">Qty:</span>
                    <select
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={cartItem.quantity}
                      onChange={(e) => handleUpdateQuantity(cartItem.id, Number(e.target.value))}
                    >
                      {[...Array(10)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => handleDeleteItem(cartItem.id)}
                    className="text-xs font-semibold text-rose-500 hover:text-rose-700 transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>🗑️ Remove</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Order Summary Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6 sticky top-24">
          <h2 className="text-lg font-bold text-slate-800 pb-4 border-b border-slate-100">
            Order Summary
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Items Total</span>
              <span className="font-semibold text-slate-800">₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Delivery Charge</span>
              <span className="text-emerald-600 font-bold">FREE</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Tax (GST)</span>
              <span className="text-slate-400 text-xs">Included in Price</span>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-baseline">
              <span className="text-base font-bold text-slate-900">Total Payable</span>
              <span className="text-2xl font-black text-slate-900">
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={placingOrder}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 hover:from-slate-800 hover:to-indigo-900 text-white font-bold text-base transition shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>💳</span>
            <span>{placingOrder ? 'Processing Order...' : 'Place Order & Pay'}</span>
          </button>

          <div className="text-center pt-2">
            <p className="text-[11px] text-slate-400">
              🔒 Safe & Secure 256-Bit SSL Encrypted Checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
