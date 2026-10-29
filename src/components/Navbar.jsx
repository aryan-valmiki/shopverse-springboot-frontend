import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logoutUser } from '../features/auth/auth';
import { logout } from '../redux/slices/authSlice';

function Navbar() {
  const user = useSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await logoutUser();
      dispatch(logout());
      navigate('/login');
    } catch (error) {
      console.error(error?.response?.data?.message || error.message);
    }
  };

  const openPromptSearch = () => {
    window.dispatchEvent(new CustomEvent('open-ai-prompt-search'));
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo & Main Nav */}
          <div className="flex items-center gap-6 lg:gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
                S
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
                  Shop<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Verse</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-600 tracking-widest uppercase">
                  AI Tech Store
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5 text-sm font-medium">
              <Link
                to="/"
                className={`px-3 py-2 rounded-xl transition ${
                  isActive('/')
                    ? 'text-indigo-600 bg-indigo-50/80 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                Store
              </Link>

              {/* Compare Products Link */}
              <Link
                to="/compare"
                className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
                  isActive('/compare')
                    ? 'text-indigo-600 bg-indigo-50/80 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                <span>⚔️</span>
                <span>Compare</span>
              </Link>

              {/* AI Advisor Link */}
              <Link
                to="/ai-recommend"
                className={`group relative inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${
                  isActive('/ai-recommend')
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-indigo-500/25'
                    : 'bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 text-indigo-700 hover:from-indigo-100 hover:to-blue-100 border border-indigo-100/80'
                }`}
              >
                <span className="text-base group-hover:rotate-12 transition-transform">✨</span>
                <span>AI Finder</span>
                <span className="hidden xl:inline-block px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  Smart AI
                </span>
              </Link>

              {/* Prompt-to-Cart Quick Drawer Button */}
              <button
                type="button"
                onClick={openPromptSearch}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 transition cursor-pointer border border-purple-200 shadow-xs"
                title="Search with Voice or Plain English Prompt"
              >
                <span className="animate-pulse">🎙️</span>
                <span>Prompt-to-Cart</span>
              </button>
            </nav>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile Voice / Prompt Search */}
            <button
              type="button"
              onClick={openPromptSearch}
              className="md:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200 cursor-pointer"
              title="Voice Search"
            >
              <span>🎙️</span>
            </button>

            {/* Mobile Compare Button */}
            <Link
              to="/compare"
              className="md:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold"
            >
              <span>⚔️</span>
            </Link>

            {/* Mobile AI Advisor Button */}
            <Link
              to="/ai-recommend"
              className="md:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200"
            >
              <span>✨ AI</span>
            </Link>

            {/* Cart Button */}
            <Link
              to="/cart"
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                isActive('/cart')
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100/80 text-slate-700 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="hidden sm:inline">Cart</span>
            </Link>

            {/* User Profile / Auth State */}
            {!user.isLoggedIn ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100/60 rounded-xl transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition"
                >
                  Get Started
                </Link>
              </div>
            ) : (
              <div className="relative group">
                <button className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition cursor-pointer">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center uppercase">
                    {user.user?.name ? user.user.name[0] : 'U'}
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-800 hidden sm:inline">
                    {user.user?.name?.split(' ')[0]}
                  </span>
                  <svg className="w-4 h-4 text-slate-400 group-hover:rotate-180 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                    <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                    <p className="text-sm font-bold text-slate-800 truncate">{user.user?.name}</p>
                    {user.user?.isAdmin && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-amber-100 text-amber-800">
                        Admin Access
                      </span>
                    )}
                  </div>

                  {!user.user?.isAdmin ? (
                    <Link
                      to="/orders"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition font-medium"
                    >
                      <span>📦</span> My Orders
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/admin/dashboard"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition font-medium"
                      >
                        <span>📊</span> Admin Dashboard
                      </Link>
                      <Link
                        to="/admin/createProduct"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition font-medium"
                      >
                        <span>➕</span> Add Product
                      </Link>
                    </>
                  )}

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-xl transition font-medium cursor-pointer"
                  >
                    <span>🚪</span> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
