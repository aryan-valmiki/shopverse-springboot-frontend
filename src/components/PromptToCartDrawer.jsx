import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { promptSearchWithAi } from '../features/ai/ai.js';
import { addToCart } from '../features/cart/cart.js';

function PromptToCartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [addingId, setAddingId] = useState(null);
  const [addedItems, setAddedItems] = useState({});

  const { isLoggedIn } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);
  const searchHandlerRef = useRef(null);

  // Listen to open events from Navbar or anywhere in the app
  useEffect(() => {
    const handleOpenEvent = (e) => {
      setIsOpen(true);
      if (e.detail?.prompt) {
        setPrompt(e.detail.prompt);
        executeSearch(e.detail.prompt);
      }
      setTimeout(() => inputRef.current?.focus(), 250);
    };

    window.addEventListener('open-ai-prompt-search', handleOpenEvent);
    return () => window.removeEventListener('open-ai-prompt-search', handleOpenEvent);
  }, []);

  // Keyboard shortcut: ESC to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setPrompt(transcript);
        setIsListening(false);
        searchHandlerRef.current?.(transcript);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          toast.warn('Microphone access denied. Please allow microphone access or type your query.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.info('Speech recognition is not supported in this browser. Please type your query.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Could not start recognition:', err);
      }
    }
  };

  const executeSearch = async (queryText) => {
    const textToSearch = (queryText !== undefined ? queryText : prompt).trim();
    if (!textToSearch) return;

    setLoading(true);
    setError(null);

    try {
      const data = await promptSearchWithAi(textToSearch);
      setResults(data?.data || data);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to search';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  searchHandlerRef.current = executeSearch;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    executeSearch();
  };

  const handleQuickPrompt = (quickText) => {
    setPrompt(quickText);
    executeSearch(quickText);
  };

  const handleAddToCart = async (product) => {
    if (!isLoggedIn) {
      toast.info('Please sign in to add items to your cart');
      setIsOpen(false);
      return navigate('/login');
    }

    try {
      setAddingId(product.id);
      const res = await addToCart({ productId: product.id, quantity: 1 });
      if (res.status === 200 || res.status === 201) {
        toast.success(`⚡ Added "${product.name}" to cart!`);
        setAddedItems((prev) => ({ ...prev, [product.id]: true }));
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add item to cart');
    } finally {
      setAddingId(null);
    }
  };

  const quickPrompts = [
    '💻 Laptop for coding under 80k with 16GB RAM',
    '🎮 Gaming laptop with RTX graphics and high refresh rate',
    '📱 Flagship 5G smartphone with AMOLED screen',
    '🎧 Best wireless noise-cancelling headphones',
    '🍎 Apple MacBook for creative design and editing',
  ];

  return (
    <>
      {/* Floating Trigger Tab on right edge of screen */}
      <button
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 250);
        }}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-gradient-to-b from-indigo-600 via-purple-600 to-indigo-700 text-white py-4 px-2.5 rounded-l-2xl shadow-2xl shadow-indigo-500/30 hover:px-3.5 transition-all duration-300 flex flex-col items-center gap-2 group cursor-pointer border-l-2 border-y-2 border-white/20"
        title="Open AI Prompt & Voice Search"
        aria-label="Open AI Prompt & Voice Search"
      >
        <span className="text-xl group-hover:scale-125 transition-transform animate-pulse">🎙️</span>
        <span className="text-[11px] font-black tracking-widest uppercase [writing-mode:vertical-lr] rotate-180 flex items-center gap-1.5">
          <span>AI Search</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        </span>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 transition-opacity duration-300 animate-fadeIn"
        />
      )}

      {/* Slide-out Drawer */}
      <div
        className={`fixed inset-y-0 right-0 max-w-full w-full sm:w-[500px] md:w-[560px] bg-slate-50 z-50 shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="bg-white border-b border-slate-200/80 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-xl shadow-md shadow-indigo-500/20">
              🎙️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Prompt-to-Cart AI
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ShopVerse AI
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Speak or type plain English to find & cart products
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition cursor-pointer"
            aria-label="Close drawer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Input Bar & Voice Mic */}
        <div className="p-4 sm:p-5 bg-white border-b border-slate-200">
          <form onSubmit={handleFormSubmit} className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Laptop for coding under 80k with 16GB RAM..."
                className="w-full pl-4 pr-10 py-3 rounded-2xl bg-slate-100/80 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none text-sm font-medium text-slate-800 transition"
              />
              {prompt && (
                <button
                  type="button"
                  onClick={() => setPrompt('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Voice Mic Button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition shadow-sm cursor-pointer ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-200'
                  : 'bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 border border-slate-200'
              }`}
              title={isListening ? 'Listening... click to stop' : 'Click to speak'}
            >
              {isListening ? (
                <span className="text-lg">🔴</span>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </button>

            {/* Search Submit Button */}
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition cursor-pointer flex items-center gap-1.5"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Find</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Voice listening status */}
          {isListening && (
            <p className="mt-2 text-xs text-rose-600 font-semibold flex items-center gap-2 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
              Listening... Speak now (e.g., "Show me gaming laptops under 1 lakh")
            </p>
          )}

          {/* Quick Prompt Ideas */}
          {!results && !loading && (
            <div className="mt-4">
              <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                💡 Try asking like this:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {quickPrompts.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickPrompt(q)}
                    className="text-left text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200/80 text-slate-700 font-medium px-3 py-1.5 rounded-xl transition cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Body - Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Loading State */}
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="relative mb-4">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl shadow-xl shadow-indigo-500/30 animate-pulse">
                  🤖
                </div>
                <div className="absolute -inset-1 rounded-3xl bg-indigo-500/20 blur-md animate-ping"></div>
              </div>
              <h3 className="text-base font-bold text-slate-800">
                ShopVerse AI is matching store inventory...
              </h3>
              <p className="text-xs text-slate-600 max-w-xs mt-1">
                Parsing your hardware specs, matching RAM, CPU, budget, and ranking the best options.
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              <p className="font-bold mb-1">⚠️ Search failed</p>
              <p>{error}</p>
            </div>
          )}

          {/* Results State */}
          {results && !loading && (
            <>
              {/* Detected Intent Banner */}
              {results.detectedIntent && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 border border-indigo-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">🎯</span>
                    <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700">
                      AI Understood
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
                    {results.detectedIntent}
                  </p>
                </div>
              )}

              {/* No matches fallback */}
              {(!results.matches || results.matches.length === 0) && (
                <div className="py-8 text-center text-slate-600">
                  <span className="text-3xl block mb-2">🔍</span>
                  <p className="font-bold text-sm text-slate-800">No exact matches found</p>
                  <p className="text-xs mt-1">
                    Try broadening your budget or asking for different specifications.
                  </p>
                </div>
              )}

              {/* Product Match Cards */}
              <div className="space-y-3">
                {results.matches?.map((item, index) => {
                  const prod = item.product || {};
                  const isAdded = addedItems[item.productId];
                  const isAdding = addingId === item.productId;

                  return (
                    <div
                      key={item.productId || index}
                      className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex flex-col gap-3"
                    >
                      {/* Top Row: Rank & Match Score */}
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-600">
                          Option #{index + 1}
                        </span>
                        {item.matchScore && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <span>⚡</span>
                            <span>{item.matchScore}% Match</span>
                          </span>
                        )}
                      </div>

                      {/* Product Info Row */}
                      <div className="flex gap-3 items-start">
                        {/* Image */}
                        <div
                          onClick={() => {
                            setIsOpen(false);
                            navigate(`/product/${item.productId}`);
                          }}
                          className="w-20 h-20 rounded-xl bg-slate-50 border border-slate-100 p-1 flex-shrink-0 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                        >
                          <img
                            src={prod.imageUrl}
                            alt={prod.name}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        {/* Title & Brand */}
                        <div className="flex-1 min-w-0">
                          {prod.brand && (
                            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                              {prod.brand}
                            </p>
                          )}
                          <h4
                            onClick={() => {
                              setIsOpen(false);
                              navigate(`/product/${item.productId}`);
                            }}
                            className="text-xs sm:text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-2 cursor-pointer"
                          >
                            {prod.name}
                          </h4>

                          {/* Price */}
                          <div className="mt-1">
                            <span className="text-sm sm:text-base font-black text-slate-900">
                              ₹{prod.price?.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Hardware Specs Chips */}
                      {(prod.ram || prod.processor || prod.storage) && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {prod.ram && (
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                              RAM: {prod.ram}
                            </span>
                          )}
                          {prod.processor && (
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold truncate max-w-[150px]">
                              CPU: {prod.processor}
                            </span>
                          )}
                          {prod.storage && (
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                              Storage: {prod.storage}
                            </span>
                          )}
                        </div>
                      )}

                      {/* AI Highlight Tag & Reason */}
                      <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-xs">
                        {item.highlight && (
                          <p className="font-bold text-indigo-700 flex items-center gap-1 mb-0.5 text-[11px]">
                            <span>✨</span>
                            <span>{item.highlight}</span>
                          </p>
                        )}
                        <p className="text-slate-600 text-[11px] leading-relaxed">
                          {item.matchReason}
                        </p>
                      </div>

                      {/* Actions: Direct 1-Click Add to Cart & View Details */}
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                        <button
                          onClick={() => handleAddToCart(prod)}
                          disabled={isAdding}
                          className={`flex-1 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm ${
                            isAdded
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-900 hover:bg-indigo-600 text-white'
                          }`}
                        >
                          {isAdding ? (
                            <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                          ) : isAdded ? (
                            <>
                              <span>✓</span>
                              <span>Added to Cart</span>
                            </>
                          ) : (
                            <>
                              <span>⚡</span>
                              <span>1-Click Add to Cart</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            setIsOpen(false);
                            navigate(`/product/${item.productId}`);
                          }}
                          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-600">
          <span>ShopVerse Neural Search Core</span>
          <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-mono font-bold">
            ESC to close
          </span>
        </div>
      </div>
    </>
  );
}

export default PromptToCartDrawer;
