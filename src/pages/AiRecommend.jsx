import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getAiRecommendations, promptSearchWithAi } from '../features/ai/ai.js';
import { addToCart } from '../features/cart/cart.js';

function AiRecommend() {
  const navigate = useNavigate();
  const { isLoggedIn } = useSelector((state) => state.auth);

  // Active mode: 'prompt' (Natural Language) or 'specs' (Structured Form)
  const [activeTab, setActiveTab] = useState('prompt');

  // Natural Language Prompt State
  const [promptText, setPromptText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const searchHandlerRef = useRef(null);

  // Structured Spec Form Inputs
  const [category, setCategory] = useState('Laptops');
  const [ram, setRam] = useState('Any');
  const [processor, setProcessor] = useState('Any');
  const [storage, setStorage] = useState('Any');
  const [maxBudget, setMaxBudget] = useState('80000');
  const [usage, setUsage] = useState('Coding & College Work');
  const [query, setQuery] = useState('');

  // Execution & Results States
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [addingId, setAddingId] = useState(null);
  const [addedItems, setAddedItems] = useState({});

  // Dynamic spec options based on Category
  const getRamOptions = (cat) => {
    if (cat === 'Smartphones') return ['Any', '4GB', '6GB', '8GB', '12GB', '16GB'];
    if (cat === 'Audio') return [];
    if (cat === 'Tablets') return ['Any', '4GB', '8GB', '16GB'];
    return ['Any', '8GB', '16GB', '32GB', '64GB'];
  };

  const getProcessorOptions = (cat) => {
    if (cat === 'Smartphones') return ['Any', 'Snapdragon', 'Apple Bionic', 'MediaTek Dimensity', 'Google Tensor'];
    if (cat === 'Audio') return [];
    if (cat === 'Tablets') return ['Any', 'Apple M2', 'Apple A-Series', 'Snapdragon'];
    return ['Any', 'Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'AMD Ryzen 5', 'AMD Ryzen 7', 'Apple M2/M3'];
  };

  const getStorageOptions = (cat) => {
    if (cat === 'Audio') return [];
    if (cat === 'Smartphones') return ['Any', '64GB', '128GB', '256GB', '512GB'];
    return ['Any', '256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD'];
  };

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    setRam('Any');
    setProcessor('Any');
    setStorage('Any');
    if (newCat === 'Smartphones') {
      if (maxBudget === '80000') setMaxBudget('30000');
    }
  };

  const usageOptions = [
    'Coding & College Work',
    'Gaming & Streaming',
    'Everyday Browsing & Office',
    'Video & 3D Editing',
    'AI & Machine Learning'
  ];

  // Natural language prompt inspiration pills
  const samplePrompts = [
    '💻 Laptop for coding with 16GB RAM under 80k',
    '🎮 High-performance gaming laptop with RTX GPU',
    '📱 5G smartphone with AMOLED screen under 40000',
    '🎧 Best wireless noise-cancelling headphones',
    '🍎 Apple MacBook for creative design and editing',
    '⚡ Lightweight college laptop under 50000'
  ];

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setPromptText(transcript);
        setIsListening(false);
        searchHandlerRef.current?.(transcript);
      };
      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          toast.warn('Microphone permission denied. Please allow microphone access or type your query.');
        }
      };
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.info('Speech recognition is not supported in this browser. Please type your query.');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (err) {}
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Could not start recognition:', err);
      }
    }
  };

  // 1. Natural Language Prompt Search Handler
  const handlePromptSearch = async (overrideText) => {
    const textToQuery = (overrideText !== undefined ? overrideText : promptText).trim();
    if (!textToQuery) {
      toast.info('Please enter what you are looking for');
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const res = await promptSearchWithAi(textToQuery);
      const data = res?.data || res;

      if (data) {
        setResults({
          detectedIntent: data.detectedIntent || `Query: "${textToQuery}"`,
          items: data.matches || data.recommendations || []
        });
        toast.success('In-store matches retrieved!');
      } else {
        toast.error('No matching records found in store');
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Failed to search catalog');
    } finally {
      setLoading(false);
    }
  };

  searchHandlerRef.current = handlePromptSearch;

  // 2. Structured Spec Filter Handler
  const handleSpecSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setResults(null);

    try {
      const payload = {
        category: category !== 'All' ? category : null,
        ram: ram && ram !== 'Any' ? ram : null,
        processor: processor && processor !== 'Any' ? processor : null,
        storage: storage && storage !== 'Any' ? storage : null,
        maxBudget: maxBudget ? parseFloat(maxBudget) : null,
        usage,
        query
      };

      const res = await getAiRecommendations(payload);
      const data = res?.data || res;

      if (data) {
        setResults({
          detectedIntent: data.summary || `Criteria: ${category} | ${ram} | ${processor}`,
          items: data.recommendations || data.matches || []
        });
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

  searchHandlerRef.current = handlePromptSearch;

  // Add to cart handler
  const handleAddToCart = async (product) => {
    if (!isLoggedIn) {
      toast.info('Please sign in to add items to your cart');
      return navigate('/login');
    }

    try {
      setAddingId(product.id);
      const response = await addToCart({ productId: product.id, quantity: 1 });
      if (response.status === 200 || response.status === 201) {
        toast.success(`⚡ Added "${product.name}" to cart!`);
        setAddedItems((prev) => ({ ...prev, [product.id]: true }));
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
          <div className="absolute top-0 right-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-indigo-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>ShopVerse Neural Intelligence</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              AI Hardware Matchmaker
            </h1>
            <p className="text-slate-300 max-w-2xl text-sm sm:text-base leading-relaxed">
              Describe the tech you need in everyday language — your desired RAM, processor, budget, or use case.
              Our neural matching engine identifies the exact genuine products in our inventory with zero hallucinations.
            </p>
          </div>

          <div className="hidden md:flex flex-col items-center justify-center w-28 h-28 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-6xl shadow-inner shrink-0">
            🎙️
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center justify-center sm:justify-start gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('prompt')}
            className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'prompt'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>💬</span>
            <span>Prompt-to-Cart Search</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider bg-white/20 text-white">
              Instant AI
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'specs'
                ? 'bg-gradient-to-r from-slate-900 to-indigo-900 text-white shadow-md'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>⚙️</span>
            <span>Hardware Spec Matrix</span>
          </button>
        </div>

        {/* TAB 1: NATURAL LANGUAGE PROMPT SEARCH */}
        {activeTab === 'prompt' && (
          <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 p-6 sm:p-10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>Voice & Conversational Search</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    Zero Hallucinations
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Ask for RAM, processor, budget, brand, or purpose (e.g., "16GB laptop under 80000 for coding")
                </p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handlePromptSearch();
              }}
              className="space-y-4"
            >
              <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    placeholder="e.g. Laptop for coding under 80k with 16GB RAM and Core i7..."
                    className="w-full pl-5 pr-12 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none text-sm sm:text-base font-medium text-slate-800 transition"
                  />
                  {promptText && (
                    <button
                      type="button"
                      onClick={() => setPromptText('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Voice Input Mic Button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`py-4 px-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm transition shadow-sm cursor-pointer shrink-0 ${
                    isListening
                      ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-200'
                      : 'bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-700 border border-slate-200'
                  }`}
                  title={isListening ? 'Listening... click to stop' : 'Click to speak query'}
                >
                  <span className="text-lg">{isListening ? '🔴' : '🎙️'}</span>
                  <span className="hidden sm:inline">{isListening ? 'Listening...' : 'Voice'}</span>
                </button>

                {/* Search Button */}
                <button
                  type="submit"
                  disabled={loading || !promptText.trim()}
                  className="py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-sm sm:text-base shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  {loading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <span>Find</span>
                      <span>➔</span>
                    </>
                  )}
                </button>
              </div>

              {/* Listening feedback */}
              {isListening && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-pulse">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
                  <span>Listening through microphone... Speak now (e.g., "Find me gaming laptops with RTX under 1 lakh")</span>
                </div>
              )}

              {/* Inspiration prompt pills */}
              <div className="pt-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
                  <span>💡</span>
                  <span>Quick prompt examples to try:</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {samplePrompts.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setPromptText(p.replace(/^[^\s]+\s/, ''));
                        handlePromptSearch(p.replace(/^[^\s]+\s/, ''));
                      }}
                      className="text-xs bg-slate-100/80 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200/80 text-slate-700 font-medium px-3.5 py-2 rounded-xl transition cursor-pointer text-left"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: STRUCTURED SPEC FORM (CLASSIC) */}
        {activeTab === 'specs' && (
          <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 p-6 sm:p-10">
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Specify Your Hardware Criteria
                </h2>
                <p className="text-xs text-slate-500">Pick presets or type custom values</p>
              </div>
              <span className="text-xs font-mono font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-600">
                Hardware Spec Matrix
              </span>
            </div>

            <form onSubmit={handleSpecSearch} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Target Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50 text-slate-800 font-medium"
                  >
                    <option value="Laptops">Laptops</option>
                    <option value="Smartphones">Smartphones</option>
                    <option value="Tablets">Tablets</option>
                    <option value="Gaming">Gaming PCs / Consoles</option>
                    <option value="Audio">Audio & Headphones</option>
                    <option value="All">All Categories</option>
                  </select>
                </div>

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

              {/* Notice for Audio Category */}
              {category === 'Audio' ? (
                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-800 text-xs">
                  🎧 <strong>Audio & Headphones:</strong> RAM and Processor filters are skipped. Products are filtered strictly by your Target Budget Cap and Preferences.
                </div>
              ) : (
                <>
                  {/* RAM */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        Target RAM
                      </label>
                      <span className="text-xs text-slate-400">Selected: <strong className="text-indigo-600">{ram || 'Any'}</strong></span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {getRamOptions(category).map((opt) => (
                        <button
                          type="button"
                          key={opt}
                          onClick={() => setRam(opt)}
                          className={`px-4 py-2 text-xs sm:text-sm rounded-xl font-bold transition cursor-pointer ${
                            ram === opt ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Or type custom RAM (e.g. 16GB)"
                      value={ram === 'Any' ? '' : ram}
                      onChange={(e) => setRam(e.target.value || 'Any')}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
                    />
                  </div>

                  {/* Processor */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        Target Processor (CPU / Chipset)
                      </label>
                      <span className="text-xs text-slate-400">Selected: <strong className="text-indigo-600">{processor || 'Any'}</strong></span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {getProcessorOptions(category).map((opt) => (
                        <button
                          type="button"
                          key={opt}
                          onClick={() => setProcessor(opt)}
                          className={`px-4 py-2 text-xs sm:text-sm rounded-xl font-bold transition cursor-pointer ${
                            processor === opt ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Or type custom processor (e.g. Snapdragon, Core i7)"
                      value={processor === 'Any' ? '' : processor}
                      onChange={(e) => setProcessor(e.target.value || 'Any')}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
                    />
                  </div>

                  {/* Storage */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        Target Storage
                      </label>
                      <span className="text-xs text-slate-400">Selected: <strong className="text-indigo-600">{storage || 'Any'}</strong></span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {getStorageOptions(category).map((opt) => (
                        <button
                          type="button"
                          key={opt}
                          onClick={() => setStorage(opt)}
                          className={`px-4 py-2 text-xs sm:text-sm rounded-xl font-bold transition cursor-pointer ${
                            storage === opt ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Or type custom storage (e.g. 512GB SSD)"
                      value={storage === 'Any' ? '' : storage}
                      onChange={(e) => setStorage(e.target.value || 'Any')}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
                    />
                  </div>
                </>
              )}

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
                        usage === opt ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Query */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Extra Preferences (Optional)
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Need lightweight machine with high battery life"
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
                    <span>Filtering store inventory...</span>
                  </>
                ) : (
                  <span>✨ Get AI Recommendations</span>
                )}
              </button>
            </form>
          </div>
        )}

        {/* RESULTS SECTION */}
        {results && (
          <div className="space-y-6 pt-4 animate-fadeIn">
            {/* AI Detected Intent / Assessment Banner */}
            <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 border border-indigo-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
              <div className="flex items-start gap-4">
                <span className="text-3xl">🎯</span>
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-black text-indigo-950">
                    AI Understood
                  </h3>
                  <p className="text-indigo-900 text-sm sm:text-base font-semibold leading-relaxed">
                    {results.detectedIntent}
                  </p>
                </div>
              </div>
            </div>

            {/* Results Header */}
            <div className="flex justify-between items-center pt-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                In-Store Matches ({results.items?.length || 0})
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                Verified genuine products in DB
              </span>
            </div>

            {/* No matches */}
            {(!results.items || results.items.length === 0) ? (
              <div className="bg-white rounded-3xl p-10 text-center text-slate-500 border border-slate-200">
                <span className="text-4xl block mb-2">🔍</span>
                <p className="font-bold text-base text-slate-800">No matching products found in store inventory</p>
                <p className="text-xs text-slate-500 mt-1">Try broadening your budget or using more general specifications.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.items.map((item, idx) => {
                  const product = item.product || {};
                  const isAdded = addedItems[product.id];
                  const isAdding = addingId === product.id;

                  return (
                    <div
                      key={product.id || idx}
                      className="bg-white rounded-3xl border border-slate-200/80 hover:border-indigo-400 hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 p-6 flex flex-col justify-between"
                    >
                      <div>
                        {/* Top: Rank, Match Score & Highlight */}
                        <div className="flex justify-between items-center mb-4">
                          <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200/80 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            {item.matchScore || 90}% Match
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
                            className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-2xl border border-slate-100 bg-slate-50 p-2 cursor-pointer shrink-0 hover:scale-105 transition-transform"
                            onClick={() => navigate(`/product/${product.id}`)}
                          />
                          <div className="space-y-1 min-w-0">
                            {product.category && (
                              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
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

                        {/* Hardware Specs Pills */}
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

                        {/* Why AI Picked This */}
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs text-slate-700 leading-relaxed mb-4">
                          <strong className="text-indigo-700 block mb-1 font-bold">Why this matches your prompt:</strong>
                          {item.matchReason || 'Matches your hardware and budget criteria from our inventory.'}
                        </div>
                      </div>

                      {/* Action Buttons: 1-Click Add to Cart & View Details */}
                      <div className="flex gap-3 pt-3 border-t border-slate-100">
                        <button
                          onClick={() => navigate(`/product/${product.id}`)}
                          className="flex-1 py-3 px-4 text-xs sm:text-sm font-bold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                        >
                          View Details
                        </button>

                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={isAdding}
                          className={`flex-1 py-3 px-4 text-xs sm:text-sm font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
                            isAdded
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-900 hover:bg-indigo-600 text-white'
                          }`}
                        >
                          {isAdding ? (
                            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
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