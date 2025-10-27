import React, { useEffect, useState } from 'react';
import { fetchProducts } from '../features/products/product.js';
import ProductCard from '../components/ProductCard.jsx';

function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);

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

  if (loading) return <div className="text-center py-10 text-lg text-gray-500">Loading products...</div>;
  if (error) return <div className="text-center py-10 text-red-500 font-medium">{error}</div>;

  return (
    <section className="max-w-7xl mx-auto px-4 py-6">
      <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-gray-800">Featured Products</h2>

      {products.length === 0 ? (
        <p className="text-center text-gray-600">No products found.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

export default Home;
