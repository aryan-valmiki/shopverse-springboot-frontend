import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 mt-20">
      {/* Value Proposition Strip */}
      <div className="border-b border-slate-900 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xl text-indigo-400">
              🤖
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">AI-Powered Matching</h4>
              <p className="text-xs text-slate-500">Spec-level recommendations</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl text-emerald-400">
              🛡️
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">100% Genuine Tech</h4>
              <p className="text-xs text-slate-500">Brand warranty guaranteed</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xl text-blue-400">
              ⚡
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Express Delivery</h4>
              <p className="text-xs text-slate-500">Fast & tracked dispatch</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl text-amber-400">
              🔒
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Secure Payments</h4>
              <p className="text-xs text-slate-500">Encrypted transactions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-5 gap-10 text-sm">
        <div className="md:col-span-2">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-black text-white tracking-tight mb-4">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-indigo-500/30">
              S
            </span>
            <span>Shop<span className="text-indigo-400">Verse</span></span>
          </Link>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm mb-6">
            The next-generation electronics marketplace powered by AI. Find laptops, smartphones, and gear matched accurately to your hardware specifications.
          </p>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              ShopVerse AI Core Active
            </span>
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 text-xs tracking-wider uppercase">Navigation</h4>
          <ul className="space-y-2.5">
            <li><Link to="/" className="hover:text-white transition">Home</Link></li>
            <li><Link to="/ai-recommend" className="hover:text-white transition text-indigo-400 font-medium flex items-center gap-1">✨ AI Advisor</Link></li>
            <li><Link to="/cart" className="hover:text-white transition">Shopping Cart</Link></li>
            <li><Link to="/orders" className="hover:text-white transition">Track Orders</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 text-xs tracking-wider uppercase">Categories</h4>
          <ul className="space-y-2.5">
            <li><span className="text-slate-400">High-Performance Laptops</span></li>
            <li><span className="text-slate-400">Flagship Smartphones</span></li>
            <li><span className="text-slate-400">Pro Tablets</span></li>
            <li><span className="text-slate-400">Gaming Rigs & Consoles</span></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 text-xs tracking-wider uppercase">Project Info</h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li>Full Stack E-Commerce</li>
            <li>Spring Boot 3 + React 19</li>
            <li>Prompt-to-Cart AI Engine</li>
            <li>MySQL Database Engine</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-900 max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
        <p>© {new Date().getFullYear()} ShopVerse. All rights reserved.</p>
        <div className="flex gap-6">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>College Project Edition</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
