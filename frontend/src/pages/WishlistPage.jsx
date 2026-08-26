import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';

export default function WishlistPage() {
  const { wishlist, products, currentUser } = useStore();
  const navigate = useNavigate();

  // Auth guard (redirect to account if not logged in)
  useEffect(() => {
    if (!currentUser) navigate('/account');
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <p className="section-subtitle">Saved Favourites</p>
          <h1>Your Wishlist</h1>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 80, paddingTop: 40 }}>
        {wishlistedProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 16px' }}>
            <Heart style={{ width: 64, height: 64, color: 'var(--border)', marginBottom: 20 }} />
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, marginBottom: 12 }}>Your wishlist is empty</h2>
            <p style={{ color: 'var(--slate)', marginBottom: 28 }}>Explore our collections and save your favourite fine jewellery pieces.</p>
            <Link to="/shop" className="btn-primary">Explore Jewellery <ArrowRight style={{ width: 16 }} /></Link>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: 14, color: 'var(--slate)', marginBottom: 24 }}>
              {wishlistedProducts.length} saved piece{wishlistedProducts.length > 1 ? 's' : ''}
            </p>
            <div className="products-grid">
              {wishlistedProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
