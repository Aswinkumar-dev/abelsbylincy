import React from 'react';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';

export default function CollectionsPage() {
  const { products } = useStore();

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <p className="section-subtitle">Curated Catalogue</p>
          <h1>Signature Collections</h1>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 80, paddingTop: 40 }}>
        <div className="bs-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {products.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </>
  );
}
