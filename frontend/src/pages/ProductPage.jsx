import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Star, X, ZoomIn, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Shield, Truck, RefreshCcw } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';

export default function ProductPage() {
  const { products, addToCart, toggleWishlist, wishlist, currentUser, formatMoney, showToast } = useStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const productId = searchParams.get('id');

  const product = products.find(p => p.id === productId);

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [qty, setQty] = useState(1);
  const [openTab, setOpenTab] = useState('craftsmanship');
  const [zoomOpen, setZoomOpen] = useState(false);
  const [sizeModalOpen, setSizeModalOpen] = useState(false);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (!productId) { navigate('/shop'); return; }
    if (!product) { navigate('/shop'); return; }
    setSelectedImageIdx(0);
    setSelectedSize(product?.sizes?.[0] || '');
    // Load reviews from localStorage
    try {
      const stored = localStorage.getItem(`abl_reviews_${productId}`);
      setReviews(stored ? JSON.parse(stored) : []);
    } catch { setReviews([]); }
  }, [productId, product, navigate]);

  if (!product) return null;

  const images = product.images?.length > 0 ? product.images : [product.image];
  const isWishlisted = wishlist.includes(product.id);
  const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      showToast('Please select a size', 'alert-circle');
      return;
    }
    addToCart(product.id, qty, selectedSize);
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!currentUser) { showToast('Please sign in to leave a review', 'alert-circle'); return; }
    const newReview = { id: Date.now(), author: currentUser.name, rating: reviewRating, text: reviewText, date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) };
    const updated = [newReview, ...reviews];
    setReviews(updated);
    localStorage.setItem(`abl_reviews_${productId}`, JSON.stringify(updated));
    setReviewText('');
    setReviewFormOpen(false);
    showToast('Review submitted!', 'check');
  };

  const accordionTabs = [
    { id: 'craftsmanship', label: 'Craftsmanship', content: `Each Abel's piece is individually hand-crafted by our Sydney artisans using traditional goldsmithing techniques. Our ${product.material} finish is applied in multiple layers for lasting brilliance and durability. All pieces pass our rigorous 12-point quality inspection before dispatch.` },
    { id: 'shipping', label: 'Shipping & Delivery', content: `Complimentary express shipping on all Australian orders. Orders are dispatched within 1-2 business days in our signature velvet presentation box. Track your parcel with our Australia Post tracking link sent via email.` },
    { id: 'care', label: 'Jewellery Care', content: `To maintain the lustre of your ${product.name}: Store in provided velvet pouch, avoid contact with water and perfumes, remove before exercising, clean gently with a soft dry cloth. With proper care, your gold plating will last 1-3+ years.` },
  ];

  return (
    <>
      {/* Breadcrumb */}
      <div className="breadcrumb-bar">
        <div className="container">
          <Link to="/" className="breadcrumb-link">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <Link to="/shop" className="breadcrumb-link">Shop</Link>
          <span className="breadcrumb-sep">/</span>
          <Link to={`/shop?category=${product.category}`} className="breadcrumb-link" style={{ textTransform: 'capitalize' }}>{product.category}</Link>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">{product.name}</span>
        </div>
      </div>

      {/* Product Detail */}
      <div className="container product-layout">

        {/* Image Gallery */}
        <div className="product-gallery">
          <div className="product-thumbnails">
            {images.map((img, i) => (
              <button
                key={i}
                className={`product-thumb${i === selectedImageIdx ? ' active' : ''}`}
                onClick={() => setSelectedImageIdx(i)}
              >
                <img src={img} alt={`${product.name} view ${i + 1}`} />
              </button>
            ))}
          </div>
          <div className="product-main-image-wrap">
            <img
              src={images[selectedImageIdx]}
              alt={product.name}
              className="product-main-image"
            />
            <button className="product-zoom-btn" onClick={() => setZoomOpen(true)} aria-label="Zoom image">
              <ZoomIn style={{ width: 18, height: 18 }} />
            </button>
            {!product.inStock && <div className="product-sold-out-overlay">Sold Out</div>}
          </div>
        </div>

        {/* Product Info */}
        <div className="product-info">
          <p className="product-info-category">{product.category}</p>
          <h1 className="product-info-title">{product.name}</h1>

          <div className="product-info-rating">
            {[1,2,3,4,5].map(i => <Star key={i} style={{ width: 14, height: 14, fill: 'var(--gold)', color: 'var(--gold)' }} />)}
            <span style={{ fontSize: 13, color: 'var(--slate)', marginLeft: 6 }}>{reviews.length + 24} reviews</span>
          </div>

          <div className="product-info-price">{formatMoney(product.price)}</div>
          <p className="product-info-price-note">All prices include GST & complimentary Express Shipping</p>

          <p className="product-info-desc">{product.description}</p>

          {/* Badges */}
          <div className="product-badges">
            <span className="product-info-badge"><Shield style={{ width: 13 }} /> 18K Gold Plated</span>
            <span className="product-info-badge"><Truck style={{ width: 13 }} /> Free Express</span>
            <span className="product-info-badge"><RefreshCcw style={{ width: 13 }} /> 30-Day Returns</span>
          </div>

          {/* Size Selector */}
          {product.sizes?.length > 0 && (
            <div className="product-size-section">
              <div className="product-size-label">
                <span>Size: <strong>{selectedSize}</strong></span>
                <button className="size-guide-link" onClick={() => setSizeModalOpen(true)}>Size Guide</button>
              </div>
              <div className="product-size-options">
                {product.sizes.map(s => (
                  <button
                    key={s}
                    className={`size-btn${selectedSize === s ? ' active' : ''}`}
                    onClick={() => setSelectedSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Options */}
          {product.colors?.length > 0 && (
            <div className="product-color-section">
              <p className="product-size-label">Finish: <strong>{product.colors[0]}</strong></p>
              <div className="product-color-options">
                {product.colors.map(c => (
                  <button key={c} className="color-btn" title={c}>{c}</button>
                ))}
              </div>
            </div>
          )}

          {/* Qty + Add to Cart */}
          <div className="product-atc-row">
            <div className="qty-control">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="qty-btn">-</button>
              <span className="qty-value">{qty}</span>
              <button onClick={() => setQty(q => q + 1)} className="qty-btn">+</button>
            </div>
            <button
              className="btn-primary product-atc-btn"
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              <ShoppingBag style={{ width: 16, height: 16 }} />
              {product.inStock ? 'Add to Bag' : 'Sold Out'}
            </button>
            <button
              className={`product-wishlist-btn${isWishlisted ? ' active' : ''}`}
              onClick={() => toggleWishlist(product.id)}
              aria-label="Toggle wishlist"
            >
              <Heart style={{ width: 20, height: 20, fill: isWishlisted ? 'currentColor' : 'none' }} />
            </button>
          </div>

          {/* Stock indicator */}
          {product.stockQty > 0 && product.stockQty <= 8 && (
            <p className="low-stock-indicator">⚡ Only {product.stockQty} left in stock!</p>
          )}

          {/* Accordion */}
          <div className="product-accordion">
            {accordionTabs.map(tab => (
              <div key={tab.id} className="accordion-item">
                <button
                  className="accordion-header"
                  onClick={() => setOpenTab(openTab === tab.id ? '' : tab.id)}
                >
                  {tab.label}
                  {openTab === tab.id ? <ChevronUp style={{ width: 16 }} /> : <ChevronDown style={{ width: 16 }} />}
                </button>
                {openTab === tab.id && (
                  <div className="accordion-body">
                    <p>{tab.content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="section section-cream">
        <div className="container">
          <div className="section-header">
            <div>
              <p className="section-subtitle">Client Experiences</p>
              <h2 className="section-title" style={{ fontSize: 26 }}>Reviews ({reviews.length + 24})</h2>
            </div>
            <button className="btn-secondary" onClick={() => { if (!currentUser) { navigate('/account'); } else { setReviewFormOpen(r => !r); } }}>
              Write a Review
            </button>
          </div>

          {reviewFormOpen && currentUser && (
            <form className="review-form" onSubmit={handleReviewSubmit}>
              <div className="review-rating-input">
                {[1,2,3,4,5].map(i => (
                  <button key={i} type="button" onClick={() => setReviewRating(i)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Star style={{ width: 22, fill: i <= reviewRating ? 'var(--gold)' : 'none', color: 'var(--gold)' }} />
                  </button>
                ))}
              </div>
              <textarea
                className="form-control"
                rows={4}
                placeholder="Share your experience with this piece..."
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                required
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn-primary">Submit Review</button>
                <button type="button" className="btn-secondary" onClick={() => setReviewFormOpen(false)}>Cancel</button>
              </div>
            </form>
          )}

          <div className="reviews-grid">
            {/* Static seed reviews */}
            {[
              { id: 's1', author: 'Sarah M.', rating: 5, text: 'Absolutely stunning piece. The gold plating is thick and lustrous — exceeded my expectations entirely.', date: '20 Aug 2026' },
              { id: 's2', author: 'Emma J.', rating: 5, text: 'Ordered as a gift and it was received with so much joy. Beautiful packaging too!', date: '15 Aug 2026' },
            ].concat(reviews).map(r => (
              <div key={r.id} className="review-card">
                <div className="review-header">
                  <div className="review-avatar">{r.author?.charAt(0)}</div>
                  <div>
                    <p className="review-author">{r.author}</p>
                    <p className="review-date">{r.date}</p>
                  </div>
                  <div className="review-stars">
                    {[...Array(r.rating)].map((_, i) => <Star key={i} style={{ width: 13, fill: 'var(--gold)', color: 'var(--gold)' }} />)}
                  </div>
                </div>
                <p className="review-text">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header-center">
              <p className="section-subtitle">You May Also Like</p>
              <h2 className="section-title">Related Pieces</h2>
            </div>
            <div className="products-grid">
              {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Zoom Modal */}
      {zoomOpen && (
        <div className="modal-overlay" onClick={() => setZoomOpen(false)}>
          <div className="zoom-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setZoomOpen(false)}><X style={{ width: 20 }} /></button>
            <img src={images[selectedImageIdx]} alt={product.name} style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain' }} />
          </div>
        </div>
      )}

      {/* Ring Size Guide Modal */}
      {sizeModalOpen && (
        <div className="modal-overlay" onClick={() => setSizeModalOpen(false)}>
          <div className="size-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Ring Size Guide</h3>
              <button className="modal-close" onClick={() => setSizeModalOpen(false)}><X style={{ width: 20 }} /></button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="size-guide-table">
                <thead>
                  <tr><th>AU/UK Size</th><th>US/Canada</th><th>EU Size</th><th>Inside Diameter (mm)</th></tr>
                </thead>
                <tbody>
                  {[
                    ['H', '4', '46.5', '14.8'], ['J', '4.75', '48', '15.3'], ['L', '5.75', '50', '15.9'],
                    ['M', '6.25', '51', '16.2'], ['N', '6.75', '52', '16.5'], ['O', '7.25', '54', '17.2'],
                    ['P', '7.75', '55', '17.5'], ['Q', '8.25', '57', '18.2'], ['R', '8.75', '58', '18.5'],
                    ['S', '9.25', '59', '18.8'], ['T', '9.75', '60', '19.1'],
                  ].map(([au, us, eu, mm]) => (
                    <tr key={au}><td>{au}</td><td>{us}</td><td>{eu}</td><td>{mm}mm</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: 12, color: 'var(--slate)', marginTop: 16, lineHeight: 1.6 }}>
              To find your ring size at home: Wrap a thin strip of paper around your finger, mark where it overlaps, measure the length in mm — this is your inside circumference. Divide by π (3.14159) to get the diameter.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
