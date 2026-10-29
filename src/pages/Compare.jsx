import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { fetchProducts } from '../features/products/product.js';
import { compareProductsWithAi } from '../features/ai/ai.js';
import { addToCart } from '../features/cart/cart.js';
import { toast } from 'react-toastify';

function Compare() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useSelector((state) => state.auth);

  const [allProducts, setAllProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Selected Products
  const [p1Id, setP1Id] = useState(searchParams.get('p1') || '');
  const [p2Id, setP2Id] = useState(searchParams.get('p2') || '');
  const [preference, setPreference] = useState('Programming & Development');

  // AI Comparison Result State
  const [comparisonResult, setComparisonResult] = useState(null);
  const [comparing, setComparing] = useState(false);
  const [addingId, setAddingId] = useState(null);

  const preferencesList = [
    'Programming & Development',
    'Gaming & Graphics Power',
    'Portability & Battery Life',
    'Overall Value for Money',
    'Creative 3D & Video Editing'
  ];

  // Fetch all store products for the selectors
  useEffect(() => {
    (async () => {
      try {
        setLoadingProducts(true);
        const res = await fetchProducts();
        const list = res.data || [];
        setAllProducts(list);

        // If params not present, pick the first two products automatically
        if (!p1Id && list.length > 0) {
          setP1Id(String(list[0].id));
        }
        if (!p2Id && list.length > 1) {
          setP2Id(String(list[1].id));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingProducts(false);
      }
    })();
  }, []);

  // When p1Id and p2Id change in dropdown, auto-trigger comparison or update searchParams
  useEffect(() => {
    if (p1Id && p2Id && p1Id !== p2Id) {
      setSearchParams({ p1: p1Id, p2: p2Id });
      handleCompare(p1Id, p2Id, preference);
    }
  }, [p1Id, p2Id]);

  const handleCompare = async (id1 = p1Id, id2 = p2Id, pref = preference) => {
    if (!id1 || !id2) {
      return toast.info('Please select two products to compare');
    }
    if (id1 === id2) {
      return toast.warning('Please select two different products to compare');
    }

    try {
      setComparing(true);
      const res = await compareProductsWithAi(id1, id2, pref);
      if (res && res.data) {
        setComparisonResult(res.data);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to generate comparison');
    } finally {
      setComparing(false);
    }
  };

  const handleAddToCart = async (product) => {
    if (!isLoggedIn) {
      toast.info('Please sign in to add to cart');
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

  const product1 = allProducts.find((p) => String(p.id) === String(p1Id));
  const product2 = allProducts.find((p) => String(p.id) === String(p2Id));

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl shadow-indigo-950/20 border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-3 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-indigo-300">
            <span>⚔️ Tech Battle Engine</span>
            <span>• ShopVerse Intelligence</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Side-by-Side Product Battle
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Select any two machines from our store inventory. Our AI will analyze the hardware differences and deliver a definitive buying verdict.
          </p>
        </div>

        <div className="hidden md:flex w-24 h-24 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 items-center justify-center text-5xl shrink-0">
          ⚖️
        </div>
      </div>

      {/* Product Selectors Strip */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <h2 className="text-lg font-bold text-slate-800">Choose Products to Compare</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative">
          {/* Product 1 Selector */}
          <div className="space-y-3 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/60">
            <label className="block text-xs font-bold uppercase tracking-wider text-indigo-600">
              Product 1 (First Contender)
            </label>
            <select
              value={p1Id}
              onChange={(e) => setP1Id(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {allProducts.map((p) => (
                <option key={`p1-${p.id}`} value={p.id}>
                  {p.name} — ₹{p.price?.toLocaleString('en-IN')}
                </option>
              ))}
            </select>

            {product1 && (
              <div className="flex items-center gap-3 pt-2">
                <img
                  src={product1.imageUrl}
                  alt={product1.name}
                  className="w-16 h-16 object-contain bg-white rounded-xl border p-1 shrink-0"
                />
                <div>
                  <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{product1.name}</h4>
                  <p className="text-xs text-slate-500 font-medium">{product1.ram || 'RAM N/A'} • {product1.processor || 'CPU N/A'}</p>
                  <p className="text-sm font-black text-slate-900 pt-0.5">₹{product1.price?.toLocaleString('en-IN')}</p>
                </div>
              </div>
            )}
          </div>

          {/* Product 2 Selector */}
          <div className="space-y-3 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/60">
            <label className="block text-xs font-bold uppercase tracking-wider text-indigo-600">
              Product 2 (Second Contender)
            </label>
            <select
              value={p2Id}
              onChange={(e) => setP2Id(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {allProducts.map((p) => (
                <option key={`p2-${p.id}`} value={p.id}>
                  {p.name} — ₹{p.price?.toLocaleString('en-IN')}
                </option>
              ))}
            </select>

            {product2 && (
              <div className="flex items-center gap-3 pt-2">
                <img
                  src={product2.imageUrl}
                  alt={product2.name}
                  className="w-16 h-16 object-contain bg-white rounded-xl border p-1 shrink-0"
                />
                <div>
                  <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{product2.name}</h4>
                  <p className="text-xs text-slate-500 font-medium">{product2.ram || 'RAM N/A'} • {product2.processor || 'CPU N/A'}</p>
                  <p className="text-sm font-black text-slate-900 pt-0.5">₹{product2.price?.toLocaleString('en-IN')}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preference Selector & Action Button */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Evaluate For:
            </span>
            {preferencesList.map((pref) => (
              <button
                key={pref}
                onClick={() => {
                  setPreference(pref);
                  handleCompare(p1Id, p2Id, pref);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  preference === pref
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {pref}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleCompare(p1Id, p2Id, preference)}
            disabled={comparing || !p1Id || !p2Id}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer whitespace-nowrap flex items-center gap-2"
          >
            {comparing ? (
              <>
                <span className="animate-spin text-sm">⏳</span>
                <span>Generating Verdict...</span>
              </>
            ) : (
              <>
                <span>✨ Refresh AI Verdict</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Comparative Verdict Showcase */}
      {comparisonResult?.verdict && (
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 rounded-3xl p-6 sm:p-10 text-white border border-indigo-500/30 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🥇</span>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 block">
                  AI Verdict Recommendation
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {comparisonResult.verdict.winnerTitle}
                </h3>
              </div>
            </div>
            <span className="hidden sm:inline-block px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-xs font-bold uppercase tracking-wider">
              Optimal Match
            </span>
          </div>

          {/* Summary Box */}
          <p className="text-sm sm:text-base text-indigo-100 leading-relaxed font-medium">
            "{comparisonResult.verdict.summary}"
          </p>

          {/* Pros Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Product 1 Highlights */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
              <h4 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                <span>⚡</span> {product1?.name} Advantages
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {comparisonResult.verdict.product1Pros?.map((pro, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-2 border-t border-white/10 text-xs text-slate-400">
                <strong className="text-white block mb-0.5">Best Suited For:</strong>
                {comparisonResult.verdict.product1BestFor}
              </div>
            </div>

            {/* Product 2 Highlights */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
              <h4 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                <span>⚡</span> {product2?.name} Advantages
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {comparisonResult.verdict.product2Pros?.map((pro, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-2 border-t border-white/10 text-xs text-slate-400">
                <strong className="text-white block mb-0.5">Best Suited For:</strong>
                {comparisonResult.verdict.product2BestFor}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Side-by-Side Spec Matrix Table */}
      {product1 && product2 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-lg">Hardware Specification Matrix</h3>
            <span className="text-xs text-slate-400">Side-by-side comparison</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4 w-1/4">Specification</th>
                  <th className="px-6 py-4 w-[37.5%] text-indigo-900 font-extrabold">{product1.name}</th>
                  <th className="px-6 py-4 w-[37.5%] text-indigo-900 font-extrabold">{product2.name}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                <tr>
                  <td className="px-6 py-4 font-bold text-slate-400 text-xs uppercase">Brand</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{product1.brand || '—'}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{product2.brand || '—'}</td>
                </tr>

                <tr className="bg-slate-50/40">
                  <td className="px-6 py-4 font-bold text-slate-400 text-xs uppercase">Category</td>
                  <td className="px-6 py-4 font-semibold text-slate-800">{product1.category || 'General'}</td>
                  <td className="px-6 py-4 font-semibold text-slate-800">{product2.category || 'General'}</td>
                </tr>

                <tr>
                  <td className="px-6 py-4 font-bold text-slate-400 text-xs uppercase">System RAM</td>
                  <td className="px-6 py-4 font-bold text-indigo-600 bg-indigo-50/30">{product1.ram || 'Not specified'}</td>
                  <td className="px-6 py-4 font-bold text-indigo-600 bg-indigo-50/30">{product2.ram || 'Not specified'}</td>
                </tr>

                <tr className="bg-slate-50/40">
                  <td className="px-6 py-4 font-bold text-slate-400 text-xs uppercase">Processor (CPU)</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{product1.processor || 'Not specified'}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{product2.processor || 'Not specified'}</td>
                </tr>

                <tr>
                  <td className="px-6 py-4 font-bold text-slate-400 text-xs uppercase">Storage Capacity</td>
                  <td className="px-6 py-4 font-semibold text-slate-800">{product1.storage || 'Not specified'}</td>
                  <td className="px-6 py-4 font-semibold text-slate-800">{product2.storage || 'Not specified'}</td>
                </tr>

                <tr className="bg-slate-50/40">
                  <td className="px-6 py-4 font-bold text-slate-400 text-xs uppercase">Price</td>
                  <td className="px-6 py-4">
                    <span className="text-xl font-black text-slate-900 block">
                      ₹{product1.price?.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xl font-black text-slate-900 block">
                      ₹{product2.price?.toLocaleString('en-IN')}
                    </span>
                  </td>
                </tr>

                <tr>
                  <td className="px-6 py-4 font-bold text-slate-400 text-xs uppercase">Stock Status</td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-emerald-600">In Stock ({product1.stock} units)</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-emerald-600">In Stock ({product2.stock} units)</span>
                  </td>
                </tr>

                {/* Direct Action Buttons Row */}
                <tr className="bg-slate-50">
                  <td className="px-6 py-4 font-bold text-slate-400 text-xs uppercase">Take Action</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link
                        to={`/product/${product1.id}`}
                        className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition"
                      >
                        Details
                      </Link>
                      <button
                        onClick={() => handleAddToCart(product1)}
                        disabled={addingId === product1.id}
                        className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer"
                      >
                        {addingId === product1.id ? 'Adding...' : 'Add to Cart 🛒'}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link
                        to={`/product/${product2.id}`}
                        className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition"
                      >
                        Details
                      </Link>
                      <button
                        onClick={() => handleAddToCart(product2)}
                        disabled={addingId === product2.id}
                        className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer"
                      >
                        {addingId === product2.id ? 'Adding...' : 'Add to Cart 🛒'}
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Compare;
