import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { fetchProducts } from '../features/products/product.js';
import ProductCard from '../components/ProductCard.jsx';

function Home() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);

  // Filter & Search States
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Sorting State
  const [sortBy, setSortBy] = useState('default');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const categories = ['All', 'Laptops', 'Smartphones', 'Tablets', 'Gaming'];

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await fetchProducts();
        setProducts(data || []);
      } catch (error) {
        const msg = error?.response?.data?.message || error?.message || "Something went wrong.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filter & Sort Logic
  const processedProducts = useMemo(() => {
    // 1. Filter out INACTIVE products for normal customers
    let filtered = products.filter((p) => {
      const status = (p.status || 'ACTIVE').toUpperCase();
      if (!user?.user?.isAdmin && status === 'INACTIVE') {
        return false;
      }

      // Category match
      const matchCat =
        selectedCategory === 'All' ||
        (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());

      // Search query match
      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        p.name?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.brand?.toLowerCase().includes(query) ||
        p.ram?.toLowerCase().includes(query) ||
        p.processor?.toLowerCase().includes(query);

      return matchCat && matchSearch;
    });

    // 2. Sorting
    switch (sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price_desc':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'name_asc':
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'name_desc':
        filtered.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      default:
        // Newest / ID desc by default
        filtered.sort((a, b) => (b.id || 0) - (a.id || 0));
        break;
    }

    return filtered;
  }, [products, selectedCategory, searchQuery, sortBy, user]);

  // Reset page to 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, sortBy]);

  // Pagination Math
  const totalProducts = processedProducts.length;
  const totalPages = Math.ceil(totalProducts / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = processedProducts.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      const catalogEl = document.getElementById('catalog');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Premium Hero Banner */}
      <section className="relative overflow-hidden bg-slate-950 text-white pt-12 pb-20 px-6 sm:px-8 border-b border-slate-900">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-indigo-300 uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              Powered by Groq AI & Llama 3.3
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1]">
              Next-Gen Tech, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-300">
                Matched to Your Exact Specs.
              </span>
            </h1>

            <p className="text-slate-400 text-base sm:text-lg max-w-xl leading-relaxed">
              Stop guessing. Tell our AI your required RAM, processor, and budget, and get instant recommendations strictly from our genuine in-store inventory.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => navigate('/ai-recommend')}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm sm:text-base transition shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                <span>✨ Ask AI Hardware Advisor</span>
                <span>➔</span>
              </button>

              <button
                onClick={() => window.dispatchEvent(new CustomEvent('open-ai-prompt-search'))}
                className="hidden inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm sm:text-base transition shadow-lg shadow-purple-600/30 cursor-pointer"
              >
                {/* <span>🎙️ Voice / Prompt Search</span> */}
              </button>

              <a
                href="#catalog"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-sm sm:text-base transition cursor-pointer"
              >
                Browse Store Catalog
              </a>
            </div>

            <div className="pt-6 grid grid-cols-3 gap-6 border-t border-slate-900/80 max-w-lg">
              <div>
                <p className="text-2xl font-black text-white">100%</p>
                <p className="text-xs text-slate-400 font-medium">Genuine Tech</p>
              </div>
              <div>
                <p className="text-2xl font-black text-indigo-400">&lt; 1s</p>
                <p className="text-xs text-slate-400 font-medium">Groq Inference</p>
              </div>
              <div>
                <p className="text-2xl font-black text-emerald-400">0%</p>
                <p className="text-xs text-slate-400 font-medium">Hallucinations</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl p-1 bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 shadow-2xl shadow-indigo-500/20">
              <div className="bg-slate-900 rounded-[22px] p-6 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">ai_advisor.groq</span>
                </div>

                <div className="bg-slate-950/80 rounded-2xl p-4 text-xs font-mono text-slate-300 space-y-2 border border-slate-800/80">
                  <p className="text-indigo-400">&gt; User query:</p>
                  <p className="text-slate-100">"Need 16GB RAM laptop with Intel i7 under ₹1,20,000 for coding."</p>
                  <p className="text-emerald-400 pt-2">&gt; AI Recommendation [Groq 70B]:</p>
                  <p className="text-slate-200">
                    "Matched <span className="text-indigo-300 font-bold">Dell XPS 15</span> (96% Match) — 16GB DDR5, i7 13th Gen, within your budget."
                  </p>
                </div>

                <div className="pt-2 flex justify-between items-center text-xs text-slate-400">
                  <span>⚡ Instant spec matching</span>
                  <button
                    onClick={() => navigate('/ai-recommend')}
                    className="text-indigo-400 hover:text-indigo-300 font-bold underline"
                  >
                    Try it yourself ➔
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Section */}
      <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Controls Bar: Search & Sorting */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-indigo-600 mb-1">
              <span>EXPLORE CATALOG</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Featured Electronics
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Showing {totalProducts === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + itemsPerPage, totalProducts)} of {totalProducts} verified products
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-3.5 py-2 shadow-xs">
              <span className="text-xs text-slate-400 font-bold uppercase">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="default">✨ Newest First</option>
                <option value="price_asc">💰 Price: Low to High</option>
                <option value="price_desc">💎 Price: High to Low</option>
                <option value="name_asc">🔤 Name: A to Z</option>
                <option value="name_desc">🔤 Name: Z to A</option>
              </select>
            </div>

            {/* Search Box */}
            <div className="w-full sm:w-72 relative">
              <input
                type="text"
                placeholder="Search name, RAM, CPU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-xs"
              />
              <svg
                className="w-4 h-4 text-slate-400 absolute left-3.5 top-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Voice & Prompt Search Trigger Button */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-ai-prompt-search'))}
              className="hidden px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 text-purple-700 hover:from-purple-100 hover:to-indigo-100 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
              title="Open AI Prompt & Voice Search Drawer"
            >
              {/* <span className="text-sm">🎙️</span> */}
              {/* <span className="hidden sm:inline">AI Prompt</span> */}
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-indigo-600 mb-3"></div>
            <p className="text-slate-500 font-medium text-sm">Loading store inventory...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-700 font-medium">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && totalProducts === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-md mx-auto shadow-sm">
            <span className="text-4xl mb-3 block">🔍</span>
            <h3 className="text-lg font-bold text-slate-800 mb-1">No products found</h3>
            <p className="text-slate-500 text-sm mb-4">
              Try adjusting your search criteria, sorting, or category filter.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
                setSortBy('default');
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Paginated Product Grid */}
        {!loading && !error && totalProducts > 0 && (
          <div className="space-y-10">
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {currentProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
                <span className="text-xs text-slate-500 font-medium">
                  Page <strong className="text-slate-800">{currentPage}</strong> of <strong className="text-slate-800">{totalPages}</strong>
                </span>

                <div className="flex items-center gap-1.5">
                  {/* Prev Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    ← Prev
                  </button>

                  {/* Page Numbers */}
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition ${
                          currentPage === pageNum
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* AI Recommendation CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl shadow-indigo-950/20 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-indigo-100">
              Not sure which product to pick?
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold">
              Let our AI Advisor analyze your needs
            </h3>
            <p className="text-indigo-200 text-sm">
              Input your RAM, processor, and intended usage to get instant, data-backed hardware picks from our store.
            </p>
          </div>

          <button
            onClick={() => navigate('/ai-recommend')}
            className="px-8 py-4 bg-white text-indigo-900 font-bold rounded-2xl hover:bg-indigo-50 shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer whitespace-nowrap text-sm sm:text-base"
          >
            Launch AI Advisor ✨
          </button>
        </div>
      </section>
    </div>
  );
}

export default Home;
