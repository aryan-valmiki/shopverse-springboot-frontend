import React, { useEffect, useState } from 'react';
import { getOrder } from '../features/order/order.js';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice.js';

function Orders() {
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getOrder();
      setOrders(response.data.data || []);
    } catch (error) {
      if (error.response?.status === 401 && error.response?.data === "No cookies") {
        dispatch(logout());
        setError("Session timed out");
        toast.error("Session timed out");
        navigate("/login");
      } else if (error.response?.status !== 401) {
        const msg = error?.response?.data?.message || error?.message || "Failed to load orders";
        setError(msg);
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStepIndex = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'DELIVERED') return 4;
    if (s === 'SHIPPED') return 3;
    if (s === 'CONFIRMED') return 2;
    if (s === 'PENDING') return 1;
    return 1;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-indigo-600 mb-4"></div>
        <p className="text-slate-500 font-medium">Retrieving order history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center">
        <p className="text-rose-700 font-bold mb-4">{error}</p>
        <button
          onClick={fetchOrders}
          className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Your Order History</h1>
          <p className="text-slate-500 text-sm mt-1">Live tracking of your electronic purchases</p>
        </div>

        <Link
          to="/"
          className="px-4 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition"
        >
          Browse Store Catalog ➔
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-sm">
          <span className="text-4xl block mb-3">📦</span>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No Orders Placed Yet</h3>
          <p className="text-slate-500 text-sm mb-6">
            When you purchase tech products, your orders and live tracking details will appear here.
          </p>
          <Link
            to="/"
            className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 transition"
          >
            Start Browsing Store
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const status = (order.status || 'PENDING').toUpperCase();
            const stepIndex = getStepIndex(status);

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs hover:border-slate-300 transition space-y-6"
              >
                {/* Header Information */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-slate-400">
                        ORDER #{order.id}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
                          status === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : status === 'SHIPPED'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : status === 'CONFIRMED'
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : status === 'CANCELLED'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 font-medium">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-400 font-medium block">Total Amount</span>
                    <span className="text-2xl font-black text-slate-900">
                      ₹{order.totalAmount?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Progress Step Timeline (if not cancelled) */}
                {status !== 'CANCELLED' ? (
                  <div className="py-2">
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      {['Order Placed', 'Confirmed', 'Dispatched / Shipped', 'Delivered'].map((stepName, i) => {
                        const stepNum = i + 1;
                        const isDone = stepIndex >= stepNum;
                        const isCurrent = stepIndex === stepNum;

                        return (
                          <div key={stepName} className="space-y-2">
                            <div className="flex items-center justify-center">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                                  isDone
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-400'
                                } ${isCurrent ? 'ring-4 ring-emerald-100' : ''}`}
                              >
                                {isDone ? '✓' : stepNum}
                              </div>
                            </div>
                            <span
                              className={`block font-bold text-[11px] ${
                                isDone ? 'text-slate-800' : 'text-slate-400'
                              }`}
                            >
                              {stepName}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold text-center">
                    This order was cancelled.
                  </div>
                )}

                <div className="pt-2 flex justify-between items-center text-xs text-slate-500">
                  <span>Total Items: <strong className="text-slate-800">{order.totalQuantity} items</strong></span>
                  <span className="text-indigo-600 font-semibold">Need assistance? Use the chat box in the bottom right ➔</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Orders;
