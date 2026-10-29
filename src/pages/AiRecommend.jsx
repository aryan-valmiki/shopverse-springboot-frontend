import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getAiRecommendations } from '../features/ai/ai.js';
import { addToCart } from '../features/cart/cart.js';

function AiRecommend() {
  const navigate = useNavigate();
  const { isLoggedIn } = useSelector((state) => state.auth);

  // Form inputs
  const [category, setCategory] = useState('Laptops');
  const [ram, setRam] = useState('16GB');
  const [processor, setProcessor] = useState('Intel Core i7');
  const [storage, setStorage] = useState('512GB SSD');
  const [maxBudget, setMaxBudget] = useState('80000');
  const [usage, setUsage] = useState('Coding & College Work');
  const [query, setQuery] = useState('');

  // States
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [addingId, setAddingId] = useState(null);

  // Quick preset options
  const ramOptions = ['8GB', '16GB', '32GB', '64GB'];
  const processorOptions = [
    'Intel Core i5',
    'Intel Core i7',
    'Intel Core i9',
    'AMD Ryzen 5',
    'AMD Ryzen 7',
    'Apple M2/M3'
  ];
  const storageOptions = ['256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD'];
  const usageOptions = [
    'Coding & College Work',
    'Gaming & Streaming',
    'Everyday Browsing & Office',
    'Video & 3D Editing',
    'AI & Machine Learning'
  ];

  const handleRecommend = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        category,
        ram,
        processor,
        storage,
        maxBudget: maxBudget ? parseFloat(maxBudget) : null,
        usage,
        query
      };

      const res = await getAiRecommendations(payload);
      if (res && res.data) {
        setResults(res.data);
        toast.success('AI recommendations ready!');
      } else {
        toast.error('Could not fetch recommendations');
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Failed to get AI recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    if (!isLoggedIn) {
      toast.info('Please sign in to add items to your cart');
      return navigate('/login');
    }

    try {
      setAddingId(product.id);
      const response = await addToCart({ productId: product.id, quantity: 1 });
      if (response.status === 201) {
        toast.success(`${product.name} added to cart!`);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not add to cart');
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Hero Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl shadow-indigo-950/20 border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-indigo-300">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              <span>Groq Llama 3.3 Engine</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              AI Hardware Advisor
            </h1>
            <p className="text-slate-300 max-w-2xl text-sm sm:text-base leading-relaxed">
              Define your required RAM, processor, and budget. Our AI matches your exact specs against the products currently in our store inventory with zero hallucinations.
            </p>
          </div>

          <div className="hidden md:flex flex-col items-center justify-center w-28 h-28 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-6xl shadow-inner shrink-0">
            🤖
          </div>
        </div>

        {/* Input Form Card */}
        <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 p-6 sm:p-10">
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Specify Your Hardware Criteria
              </h2>
              <p className="text-xs text-slate-500">Pick presets or type custom values</p>
            </div>
            <span className="text-xs font-mono font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-600">
              Step 1 of 2
            </span>
          </div>

          <form onSubmit={handleRecommend} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Target Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50 text-slate-800 font-medium"
                >
                  <option value="Laptops">Laptops</option>
                  <option value="Smartphones">Smartphones</option>
                  <option value="Tablets">Tablets</option>
                  <option value="Gaming">Gaming PCs / Consoles</option>
                  <option value="All">All Categories</option>
                </select>
              </div>

              {/* Max Budget */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Target Budget Cap (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 80000"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50 text-slate-800 font-medium"
                />
              </div>
            </div>

            {/* RAM Selection */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Target RAM
                </label>
                <span className="text-xs text-slate-400">Selected: <strong className="text-indigo-600">{ram || 'None'}</strong></span>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {ramOptions.map((opt) => (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => setRam(opt)}
                    className={`px-4 py-2 text-xs sm:text-sm rounded-xl font-bold transition cursor-pointer ${
                      ram === opt
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Or type custom RAM (e.g. 16GB LPDDR5X)"
                value={ram}
                onChange={(e) => setRam(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
              />
            </div>

            {/* Processor Selection */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Target Processor (CPU)
                </label>
                <span className="text-xs text-slate-400">Selected: <strong className="text-indigo-600">{processor || 'None'}</strong></span>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {processorOptions.map((opt) => (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => setProcessor(opt)}
                    className={`px-4 py-2 text-xs sm:text-sm rounded-xl font-bold transition cursor-pointer ${
                      processor === opt
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Or type custom processor (e.g. Intel Core i7 13th Gen)"
                value={processor}
                onChange={(e) => setProcessor(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
              />
            </div>

            {/* Storage Selection */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Target Storage
                </label>
                <span className="text-xs text-slate-400">Selected: <strong className="text-indigo-600">{storage || 'None'}</strong></span>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {storageOptions.map((opt) => (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => setStorage(opt)}
                    className={`px-4 py-2 text-xs sm:text-sm rounded-xl font-bold transition cursor-pointer ${
                      storage === opt
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Or type custom storage (e.g. 1TB NVMe PCIe 4.0 SSD)"
                value={storage}
                onChange={(e) => setStorage(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
              />
            </div>

            {/* Primary Usage */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Primary Use Case
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {usageOptions.map((opt) => (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => setUsage(opt)}
                    className={`px-3.5 py-1.5 text-xs sm:text-sm rounded-xl font-semibold transition cursor-pointer ${
                      usage === opt
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Query / Notes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Extra Preferences / Details (Optional)
              </label>
              <textarea
                rows="2"
                placeholder="e.g. Need lightweight machine with high battery life, backlit keyboard, and matte screen"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 text-base disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>AI is matching store inventory...</span>
                </>
              ) : (
                <>
                  <span>✨ Get AI Recommendations</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Section */}
        {results && (
          <div className="space-y-6 pt-4">
            {/* AI Summary Banner */}
            <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 border border-indigo-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
              <div className="flex items-start gap-4">
                <span className="text-3xl">💡</span>
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-black text-indigo-950">
                    AI Advisor Assessment
                  </h3>
                  <p className="text-indigo-900 text-sm sm:text-base leading-relaxed">
                    {results.summary}
                  </p>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="flex justify-between items-center pt-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Top In-Store Matches ({results.recommendations?.length || 0})
              </h2>
              <span className="text-xs text-slate-400 font-medium">Ranked by Spec Relevance</span>
            </div>

            {(!results.recommendations || results.recommendations.length === 0) ? (
              <div className="bg-white rounded-3xl p-10 text-center text-slate-500 border border-slate-200">
                No matching products found in the current inventory. Try broadening your budget or spec criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.recommendations.map((item) => {
                  const product = item.product;
                  if (!product) return null;

                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-3xl border border-slate-200/80 hover:border-indigo-400 hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 p-6 flex flex-col justify-between"
                    >
                      <div>
                        {/* Match Score & Highlight */}
                        <div className="flex justify-between items-center mb-4">
                          <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200/80 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            {item.matchScore}% Match
                          </span>
                          {item.highlight && (
                            <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full border border-indigo-200/60">
                              {item.highlight}
                            </span>
                          )}
                        </div>

                        {/* Image + Title */}
                        <div className="flex gap-4 items-center mb-4">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-2xl border border-slate-100 bg-slate-50 p-2 cursor-pointer shrink-0"
                            onClick={() => navigate(`/product/${product.id}`)}
                          />
                          <div className="space-y-1">
                            {product.category && (
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                {product.category} {product.brand ? `• ${product.brand}` : ''}
                              </span>
                            )}
                            <h3
                              onClick={() => navigate(`/product/${product.id}`)}
                              className="font-bold text-slate-900 hover:text-indigo-600 cursor-pointer line-clamp-2 text-base transition-colors"
                            >
                              {product.name}
                            </h3>
                            <p className="text-xl font-black text-slate-900">
                              ₹{product.price?.toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>

                        {/* Specs Pill List */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {product.ram && (
                            <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
                              RAM: {product.ram}
                            </span>
                          )}
                          {product.processor && (
                            <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
                              CPU: {product.processor}
                            </span>
                          )}
                          {product.storage && (
                            <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
                              Storage: {product.storage}
                            </span>
                          )}
                        </div>

                        {/* AI Match Explanation Box */}
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs text-slate-700 leading-relaxed mb-4">
                          <strong className="text-indigo-700 block mb-1 font-bold">Why AI recommends this:</strong>
                          {item.matchReason}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-3 border-t border-slate-100">
                        <button
                          onClick={() => navigate(`/product/${product.id}`)}
                          className="flex-1 py-3 px-4 text-xs sm:text-sm font-bold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={addingId === product.id}
                          className="flex-1 py-3 px-4 text-xs sm:text-sm font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {addingId === product.id ? 'Adding...' : 'Add to Cart 🛒'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AiRecommend;
