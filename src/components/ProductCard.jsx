import React from 'react';
import { useNavigate } from 'react-router-dom';

function ProductCard({ product }) {
  const navigate = useNavigate();
  const currentStatus = (product.status || 'ACTIVE').toUpperCase();
  const isOutOfStock = currentStatus === 'OUT_OF_STOCK' || product.stock <= 0;

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="group bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 hover:border-indigo-300 hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-1 relative"
    >
      <div>
        {/* Image Container with Badges */}
        <div className="relative w-full h-48 sm:h-52 bg-slate-50/90 rounded-2xl flex items-center justify-center p-4 mb-4 overflow-hidden border border-slate-100 group-hover:bg-indigo-50/20 transition-colors">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {/* Category Badge */}
          {product.category && (
            <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-slate-700 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-lg border border-slate-200/60 shadow-sm">
              {product.category}
            </span>
          )}

          {/* Stock / Availability Status Badge */}
          {isOutOfStock ? (
            <span className="absolute top-3 right-3 flex items-center gap-1.5 bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Out of Stock
            </span>
          ) : (
            <span className="absolute top-3 right-3 flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              In Stock
            </span>
          )}
        </div>

        {/* Brand & Name */}
        {product.brand && (
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
            {product.brand}
          </p>
        )}

        <h3 className="text-sm sm:text-base font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug mb-2">
          {product.name}
        </h3>

        {/* Hardware Specs Chips Preview (RAM, CPU, Storage) */}
        {(product.ram || product.processor || product.storage) && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {product.ram && (
              <span className="bg-slate-100 text-slate-600 text-[11px] font-semibold px-2 py-0.5 rounded-md">
                {product.ram}
              </span>
            )}
            {product.processor && (
              <span className="bg-slate-100 text-slate-600 text-[11px] font-semibold px-2 py-0.5 rounded-md truncate max-w-[130px]">
                {product.processor}
              </span>
            )}
            {product.storage && (
              <span className="bg-slate-100 text-slate-600 text-[11px] font-semibold px-2 py-0.5 rounded-md">
                {product.storage}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Price & Action Strip */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
        <div>
          <span className="text-[11px] text-slate-400 font-medium block">Price</span>
          <span className="text-lg sm:text-xl font-black text-slate-900">
            ₹{product.price?.toLocaleString('en-IN')}
          </span>
        </div>

        <button className="w-9 h-9 rounded-xl bg-slate-900 text-white group-hover:bg-indigo-600 flex items-center justify-center transition-colors shadow-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
