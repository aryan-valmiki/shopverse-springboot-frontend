import React from 'react';
import { useNavigate } from 'react-router-dom';

function ProductCard({ product }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="bg-white rounded-2xl p-4 border hover:shadow-md transition-shadow cursor-pointer flex flex-col"
    >
      <img
        src={product.imageUrl}
        alt={product.name}
        className="w-full h-48 object-contain mb-4 rounded"
      />
      <h2 className="text-base sm:text-lg font-medium text-gray-800 line-clamp-2 mb-1">
        {product.name}
      </h2>
      <p className="text-sm sm:text-base font-semibold text-green-600">₹{product.price}</p>
    </div>
  );
}

export default ProductCard;
