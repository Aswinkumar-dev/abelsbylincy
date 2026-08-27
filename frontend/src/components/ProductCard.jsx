import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, wishlist, formatMoney } = useStore();
  const navigate = useNavigate();
  const isWishlisted = wishlist.includes(product.id);

  const handleCardClick = () => {
    navigate(`/product?id=${product.id}`);
  };

  return (
    <div className="bs-card" onClick={handleCardClick}>
      <div className="bs-card-img-wrap">
        <img
          src={product.images?.[0] || product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            const filename = (product.images?.[0] || product.image).split('/').pop();
            e.target.onerror = null;
            e.target.src = `/assets/${decodeURIComponent(filename)}`;
          }}
        />
        {product.bestSeller && <span className="bs-badge badge-bestseller">BEST SELLER</span>}
        {product.newArrival && !product.bestSeller && <span className="bs-badge badge-new">NEW</span>}

        <button
          type="button"
          className={`wishlist-btn${isWishlisted ? ' active' : ''}`}
          onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
          title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart style={{ width: 14, height: 14, fill: isWishlisted ? 'var(--danger)' : 'none', color: isWishlisted ? 'var(--danger)' : 'currentColor' }} />
        </button>
      </div>

      <div className="bs-card-body">
        <p className="product-category" style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 4 }}>{product.category}</p>
        <h4 className="bs-product-name">{product.name}</h4>

        <div className="product-rating-row" style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
          <div className="stars" style={{ display: 'flex', color: 'var(--gold)' }}>
            {[1,2,3,4,5].map(i => <Star key={i} style={{ width: 12, height: 12, fill: 'var(--gold)', color: 'var(--gold)' }} />)}
          </div>
          <span className="review-count" style={{ fontSize: 11, color: 'var(--slate-light)' }}>(0)</span>
        </div>

        <div className="bs-product-price" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {product.salePrice && product.salePrice > 0 && Number(product.salePrice) < Number(product.price) ? (
            <>
              <span style={{ textDecoration: 'line-through', color: 'var(--slate-light)', fontSize: 13, fontWeight: 400 }}>{formatMoney(product.price)}</span>
              <span style={{ fontWeight: 700, color: 'var(--onyx)' }}>{formatMoney(product.salePrice)}</span>
            </>
          ) : (
            <span style={{ fontWeight: 700, color: 'var(--onyx)' }}>{formatMoney(product.price)}</span>
          )}
        </div>
      </div>

      <button
        type="button"
        className="bs-add-to-cart-btn"
        onClick={(e) => { e.stopPropagation(); addToCart(product.id, 1); }}
        disabled={!product.inStock}
      >
        <ShoppingBag style={{ width: 13, height: 13, display: 'inline-block', verticalAlign: 'middle', marginRight: 6 }} />
        {product.inStock ? 'ADD TO BAG' : 'SOLD OUT'}
      </button>
    </div>
  );
}
