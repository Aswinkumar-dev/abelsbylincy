import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, wishlist, formatMoney } = useStore();
  const isWishlisted = wishlist.includes(product.id);

  return (
    <div className="product-card">
      <div className="product-card-image-wrap">
        <Link to={`/product?id=${product.id}`}>
          <img
            src={product.images?.[0] || product.image}
            alt={product.name}
            className="product-card-img"
            loading="lazy"
          />
        </Link>
        {product.newArrival && <span className="product-badge product-badge-new">New</span>}
        {product.bestSeller && !product.newArrival && <span className="product-badge product-badge-best">Best Seller</span>}
        {!product.inStock && <span className="product-badge product-badge-out">Sold Out</span>}

        <button
          className={`wishlist-btn${isWishlisted ? ' active' : ''}`}
          onClick={() => toggleWishlist(product.id)}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart style={{ width: 16, height: 16, fill: isWishlisted ? 'currentColor' : 'none' }} />
        </button>
      </div>

      <div className="product-card-body">
        <p className="product-card-category">{product.category}</p>
        <Link to={`/product?id=${product.id}`} className="product-card-title">{product.name}</Link>

        <div className="product-card-rating">
          {[1,2,3,4,5].map(i => <Star key={i} style={{ width: 11, height: 11, fill: 'var(--gold)', color: 'var(--gold)' }} />)}
          <span className="product-card-reviews">(24)</span>
        </div>

        <div className="product-card-footer">
          <span className="product-card-price">{formatMoney(product.price)}</span>
          <button
            className="btn-primary product-card-atc"
            onClick={() => addToCart(product.id, 1)}
            disabled={!product.inStock}
          >
            <ShoppingBag style={{ width: 14, height: 14 }} />
            {product.inStock ? 'Add to Bag' : 'Sold Out'}
          </button>
        </div>
      </div>
    </div>
  );
}
