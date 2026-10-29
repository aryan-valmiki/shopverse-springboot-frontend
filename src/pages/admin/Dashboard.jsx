import React, { useEffect, useState, useRef } from 'react';
import {
  getAllOrder,
  updateProductStatus,
  updateOrderStatus,
  deleteProduct
} from '../../features/admin/admin.js';
import { fetchProducts } from '../../features/products/product.js';
import {
  getAdminChatConversations,
  getAdminCustomerMessages,
  sendChatMessage
} from '../../features/chat/chat.js';
import { toast } from "react-toastify";
import { Link } from 'react-router-dom';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('products'); // 'products', 'orders', 'chats'

  // Orders State
  const [allOrders, setAllOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Products State
  const [allProducts, setAllProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  // Chats State (Admin Support View)
  const [conversations, setConversations] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null); // Customer object
  const [customerMessages, setCustomerMessages] = useState([]);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [loadingChats, setLoadingChats] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);

  const chatEndRef = useRef(null);

  // Fetch Orders
  const fetchAllOrderData = async () => {
    try {
      setLoadingOrders(true);
      const response = await getAllOrder();
      setAllOrders(response.data.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load orders");
    } finally {
      setLoadingOrders(false);
    }
  };

  // Fetch Products
  const fetchAllProductData = async () => {
    try {
      setLoadingProducts(true);
      const response = await fetchProducts();
      setAllProducts(response.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load products");
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fetch Chat Conversations
  const fetchChatConversations = async () => {
    try {
      setLoadingChats(true);
      const res = await getAdminChatConversations();
      setConversations(res.data || []);
      // If none selected, default to first conversation
      if (!selectedCustomer && res.data && res.data.length > 0) {
        selectConversation(res.data[0]);
      }
    } catch (error) {
      console.error("Failed to load chat conversations", error);
    } finally {
      setLoadingChats(false);
    }
  };

  const selectConversation = async (conv) => {
    setSelectedCustomer(conv);
    try {
      const res = await getAdminCustomerMessages(conv.userId);
      setCustomerMessages(res.data || []);
    } catch (err) {
      toast.error("Could not load messages for customer");
    }
  };

  useEffect(() => {
    fetchAllOrderData();
    fetchAllProductData();
    fetchChatConversations();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [customerMessages]);

  // Handle Order Status Change (PENDING -> SHIPPED -> DELIVERED, etc.)
  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
      const response = await updateOrderStatus(orderId, newStatus);
      if (response.status === 200) {
        toast.success(`Order #${orderId} marked as ${newStatus}`);
        setAllOrders(prev =>
          prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not update order status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Handle Product Status Change
  const handleProductStatusChange = async (productId, newStatus) => {
    try {
      setUpdatingStatusId(productId);
      const response = await updateProductStatus(productId, newStatus);
      if (response.status === 200) {
        toast.success(`Product status updated to ${newStatus}`);
        setAllProducts(prev =>
          prev.map(p => (p.id === productId ? { ...p, status: newStatus } : p))
        );
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not update status");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (productId, productName) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${productName}"?`);
    if (!confirmed) return;

    try {
      const response = await deleteProduct(productId);
      if (response.status === 200) {
        toast.success("Product deleted successfully");
        setAllProducts(prev => prev.filter(p => p.id !== productId));
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete product");
    }
  };

  // Handle Admin Reply to Customer Chat
  const handleAdminSendReply = async (e) => {
    if (e) e.preventDefault();
    if (!adminReplyText.trim() || !selectedCustomer) return;

    try {
      setSendingReply(true);
      const res = await sendChatMessage(adminReplyText.trim(), selectedCustomer.userId);
      if (res && res.data) {
        setCustomerMessages(prev => [...prev, res.data]);
        setAdminReplyText('');
        toast.success("Reply sent to customer!");
        // Refresh conversations to update last message
        const convRes = await getAdminChatConversations();
        setConversations(convRes.data || []);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send reply");
    } finally {
      setSendingReply(false);
    }
  };

  // Compute metrics
  const totalRevenue = allOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const activeProductsCount = allProducts.filter(p => (p.status || 'ACTIVE').toUpperCase() === 'ACTIVE').length;
  const outOfStockCount = allProducts.filter(p => (p.status || '').toUpperCase() === 'OUT_OF_STOCK').length;
  const pendingOrdersCount = allOrders.filter(o => o.status === 'PENDING').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-1">
            Executive Portal
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Dashboard</h1>
        </div>

        <Link
          to="/admin/createProduct"
          className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition flex items-center gap-2"
        >
          <span>➕</span>
          <span>Add New Product</span>
        </Link>
      </div>

      {/* KPI Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Inventory
          </span>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-black text-slate-900">{allProducts.length}</p>
            <span className="text-xs text-emerald-600 font-semibold">{activeProductsCount} Active</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Gross Revenue
          </span>
          <p className="text-3xl font-black text-emerald-600">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Customer Orders
          </span>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-black text-slate-900">{allOrders.length}</p>
            <span className="text-xs text-amber-600 font-semibold">{pendingOrdersCount} Pending</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Support Threads
          </span>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-black text-indigo-600">{conversations.length}</p>
            <span className="text-xs text-indigo-600 font-semibold">Active Customers</span>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('products')}
          className={`py-3.5 px-6 font-bold text-sm border-b-2 transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'products'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>🛍️</span>
          <span>Products & Status ({allProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`py-3.5 px-6 font-bold text-sm border-b-2 transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'orders'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>📦</span>
          <span>Orders Management ({allOrders.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('chats');
            fetchChatConversations();
          }}
          className={`py-3.5 px-6 font-bold text-sm border-b-2 transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'chats'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>💬</span>
          <span>Customer Chats ({conversations.length})</span>
        </button>
      </div>

      {/* TAB 1: PRODUCTS MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Manage Products & Change Status</h2>
              <p className="text-xs text-slate-500">Toggle products between Active, Inactive, or Out of Stock</p>
            </div>
            <button
              onClick={fetchAllProductData}
              className="text-xs text-indigo-600 hover:underline font-semibold"
            >
              🔄 Refresh List
            </button>
          </div>

          {loadingProducts ? (
            <div className="p-16 text-center text-slate-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-indigo-600 mb-2"></div>
              <p className="text-xs">Loading products...</p>
            </div>
          ) : allProducts.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              No products found in the database. Click "+ Add New Product" to create one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Category / Brand</th>
                    <th className="px-6 py-4">Hardware Specs</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4">Change Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allProducts.map((product) => {
                    const currentStatus = (product.status || 'ACTIVE').toUpperCase();

                    return (
                      <tr key={product.id} className="hover:bg-slate-50/60 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-12 h-12 object-contain rounded-xl border border-slate-100 bg-slate-50 p-1 shrink-0"
                            />
                            <div>
                              <Link
                                to={`/product/${product.id}`}
                                className="font-bold text-slate-900 hover:text-indigo-600 line-clamp-1 max-w-xs transition-colors"
                              >
                                {product.name}
                              </Link>
                              <span className="text-[11px] text-slate-400 font-mono">ID: #{product.id}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-slate-800 block">
                            {product.category || 'General'}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {product.brand || '—'}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          {(product.ram || product.processor || product.storage) ? (
                            <div className="text-xs text-slate-600 space-y-0.5">
                              {product.ram && <span className="block font-semibold">RAM: {product.ram}</span>}
                              {product.processor && <span className="block text-slate-500 truncate max-w-[140px]">{product.processor}</span>}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No specs</span>
                          )}
                        </td>

                        <td className="px-6 py-4 font-bold text-slate-900">
                          ₹{product.price?.toLocaleString('en-IN')}
                        </td>

                        <td className="px-6 py-4 font-semibold text-slate-700">
                          {product.stock} units
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <select
                              value={currentStatus}
                              disabled={updatingStatusId === product.id}
                              onChange={(e) => handleProductStatusChange(product.id, e.target.value)}
                              className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition ${
                                currentStatus === 'ACTIVE'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : currentStatus === 'OUT_OF_STOCK'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : 'bg-slate-100 text-slate-600 border-slate-300'
                              }`}
                            >
                              <option value="ACTIVE">🟢 ACTIVE</option>
                              <option value="OUT_OF_STOCK">🟡 OUT OF STOCK</option>
                              <option value="INACTIVE">⚪ INACTIVE (Hidden)</option>
                            </select>

                            {updatingStatusId === product.id && (
                              <span className="animate-spin text-xs">⏳</span>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                            className="text-xs font-bold text-rose-500 hover:text-rose-700 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ORDERS MANAGEMENT & STATUS CONTROL */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Customer Purchase Orders & Status</h2>
              <p className="text-xs text-slate-500">Update order status: PENDING → CONFIRMED → SHIPPED → DELIVERED</p>
            </div>
            <button
              onClick={fetchAllOrderData}
              className="text-xs text-indigo-600 hover:underline font-semibold"
            >
              🔄 Refresh Orders
            </button>
          </div>

          {loadingOrders ? (
            <div className="p-16 text-center text-slate-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-indigo-600 mb-2"></div>
              <p className="text-xs">Loading orders...</p>
            </div>
          ) : allOrders.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              No customer orders recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Qty</th>
                    <th className="px-6 py-4">Total Amount</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Update Order Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allOrders.map((order) => {
                    const status = (order.status || 'PENDING').toUpperCase();

                    return (
                      <tr key={order.id} className="hover:bg-slate-50/60 transition">
                        <td className="px-6 py-4 font-mono font-bold text-slate-800">#{order.id}</td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{order.userName || 'Anonymous User'}</p>
                          <span className="text-xs text-slate-400">User ID: #{order.userId}</span>
                        </td>
                        <td className="px-6 py-4 font-semibold">{order.totalQuantity} items</td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          ₹{order.totalAmount?.toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <select
                              value={status}
                              disabled={updatingOrderId === order.id}
                              onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                              className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition ${
                                status === 'DELIVERED'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : status === 'SHIPPED'
                                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                                  : status === 'CONFIRMED'
                                  ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                  : status === 'CANCELLED'
                                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              <option value="PENDING">🟡 PENDING</option>
                              <option value="CONFIRMED">🟣 CONFIRMED</option>
                              <option value="SHIPPED">🔵 SHIPPED</option>
                              <option value="DELIVERED">🟢 DELIVERED</option>
                              <option value="CANCELLED">🔴 CANCELLED</option>
                            </select>

                            {updatingOrderId === order.id && (
                              <span className="animate-spin text-xs">⏳</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CUSTOMER SUPPORT CHATS */}
      {activeTab === 'chats' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
          {/* Left Column: Conversation Threads */}
          <div className="md:col-span-4 border-r border-slate-100 flex flex-col bg-slate-50/50">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm">Customer Conversations</h3>
              <button
                onClick={fetchChatConversations}
                className="text-xs text-indigo-600 hover:underline"
              >
                🔄 Refresh
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {loadingChats ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading chats...</div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No customer messages yet.</div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.userId}
                    onClick={() => selectConversation(conv)}
                    className={`p-4 cursor-pointer transition ${
                      selectedCustomer?.userId === conv.userId
                        ? 'bg-white border-l-4 border-indigo-600 shadow-2xs'
                        : 'hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">
                        {conv.userName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        #{conv.userId}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{conv.lastMessage}</p>
                    <div className="flex justify-between items-center mt-2 text-[10px] text-slate-400">
                      <span>{conv.messageCount} messages</span>
                      <span>
                        {conv.lastMessageTime ? new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Chat Window with Selected Customer */}
          <div className="md:col-span-8 flex flex-col bg-white">
            {selectedCustomer ? (
              <>
                {/* Active Chat Header */}
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs uppercase">
                      {selectedCustomer.userName ? selectedCustomer.userName[0] : 'C'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{selectedCustomer.userName}</h4>
                      <p className="text-[11px] text-slate-400">{selectedCustomer.userEmail || `User #${selectedCustomer.userId}`}</p>
                    </div>
                  </div>
                </div>

                {/* Message Stream */}
                <div className="flex-1 p-6 overflow-y-auto space-y-3 bg-slate-50/40 max-h-[380px]">
                  {customerMessages.map((msg) => {
                    const isAdmin = msg.senderRole === 'ADMIN';

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-baseline gap-1.5 mb-1 px-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            {isAdmin ? 'You (Seller Support)' : msg.senderName}
                          </span>
                          <span className="text-[9px] text-slate-400">
                            {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>

                        <div
                          className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                            isAdmin
                              ? 'bg-slate-900 text-white rounded-tr-xs'
                              : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                          }`}
                        >
                          {msg.message}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>

                {/* Reply Form */}
                <form onSubmit={handleAdminSendReply} className="p-4 border-t border-slate-100 flex items-center gap-3">
                  <input
                    type="text"
                    placeholder={`Reply to ${selectedCustomer.userName}...`}
                    value={adminReplyText}
                    onChange={(e) => setAdminReplyText(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={sendingReply || !adminReplyText.trim()}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition disabled:opacity-40 cursor-pointer"
                  >
                    {sendingReply ? 'Sending...' : 'Reply as Seller'}
                  </button>
                </form>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center text-slate-400">
                <span className="text-4xl mb-2">💬</span>
                <p className="text-sm font-medium">Select a customer thread on the left to start chatting</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
