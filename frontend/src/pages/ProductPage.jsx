import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Star, X, ZoomIn, Shield, Truck, RefreshCcw, ChevronDown, ChevronUp } from 'lucide-react';
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
    try {
      const stored = localStorage.getItem(`abl_reviews_${productId}`);
      setReviews(stored ? JSON.parse(stored) : []);
    } catch { setReviews([]); }
  }, [productId, product, navigate]);

  if (!product) return null;

  const isWishlisted = wishlist.includes(product.id);

  // Dynamic & future-proof related products selection algorithm
  const relatedProducts = React.useMemo(() => {
    if (!product || !products) return [];
    const sameCategory = products.filter(p => p.id !== product.id && p.category === product.category);
    const sameMaterialOrGem = products.filter(p =>
      p.id !== product.id &&
      p.category !== product.category &&
      (p.material === product.material || p.gemstone === product.gemstone)
    );
    const fallbackOther = products.filter(p =>
      p.id !== product.id &&
      p.category !== product.category &&
      p.material !== product.material &&
      p.gemstone !== product.gemstone
    );
    return [...sameCategory, ...sameMaterialOrGem, ...fallbackOther].slice(0, 4);
  }, [product, products]);

  const images = product.images?.length > 0 ? product.images : [product.image];

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
      {/* Breadcrumb Navigation Bar */}
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

      {/* Main PDP Grid Layout */}
      <div className="container">
        <div className="pdp-grid">

          {/* Left Column: Image Gallery */}
          <div className="pdp-gallery-wrapper">
            <div className="pdp-thumbnails">
              {images.map((img, i) => (
                <button
                  key={i}
                  className={`thumbnail-btn${i === selectedImageIdx ? ' active' : ''}`}
                  onClick={() => setSelectedImageIdx(i)}
                >
                  <img src={img} alt={`${product.name} thumbnail ${i + 1}`} />
                </button>
              ))}
            </div>

            <div className="pdp-main-image" onClick={() => setZoomOpen(true)}>
              <img
                src={images[selectedImageIdx]}
                alt={product.name}
                onError={(e) => {
                  const filename = images[selectedImageIdx].split('/').pop();
                  e.target.onerror = null;
                  e.target.src = `/assets/${decodeURIComponent(filename)}`;
                }}
              />
              <button className="product-zoom-btn" onClick={(e) => { e.stopPropagation(); setZoomOpen(true); }} aria-label="Zoom image" style={{ position: 'absolute', bottom: 12, right: 12, width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
                <ZoomIn style={{ width: 18, height: 18 }} />
              </button>
            </div>
          </div>

          {/* Right Column: Product Details */}
          <div className="pdp-info">
            <p className="pdp-header-category">{product.category}</p>
            <h1 className="pdp-title">{product.name}</h1>

            <div className="pdp-rating-row">
              <div className="stars" style={{ display: 'flex', color: 'var(--gold)' }}>
                {[1,2,3,4,5].map(i => <Star key={i} style={{ width: 14, height: 14, fill: 'var(--gold)', color: 'var(--gold)' }} />)}
              </div>
              <span className="review-count" style={{ fontSize: 13, color: 'var(--slate)' }}>({reviews.length} reviews)</span>
            </div>

            <div className="pdp-price-row">
              <span className="pdp-price">{formatMoney(product.price)}</span>
            </div>

            <p className="pdp-description">{product.description}</p>

            {/* Quality Badges */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--onyx)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Shield style={{ width: 15, color: 'var(--gold)' }} /> {product.material}
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--onyx)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Truck style={{ width: 15, color: 'var(--gold)' }} /> Free Express Shipping
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--onyx)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <RefreshCcw style={{ width: 15, color: 'var(--gold)' }} /> 30-Day Returns
              </span>
            </div>

            {/* Size Options */}
            {product.sizes?.length > 0 && (
              <div className="pdp-option-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span className="pdp-option-label" style={{ margin: 0 }}>Size: {selectedSize}</span>
                  <button onClick={() => setSizeModalOpen(true)} style={{ fontSize: 12, color: 'var(--gold-dark)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>Size Guide</button>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {product.sizes.map(s => (
                    <button
                      key={s}
                      className={`btn-secondary${selectedSize === s ? ' active' : ''}`}
                      style={{ minWidth: 44, padding: '8px 14px', fontSize: 13, borderColor: selectedSize === s ? 'var(--gold)' : 'var(--border)', background: selectedSize === s ? 'var(--cream)' : 'none' }}
                      onClick={() => setSelectedSize(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + Add to Cart Row */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>-</button>
                <span style={{ padding: '0 12px', fontSize: 14, fontWeight: 600 }}>{qty}</span>
                <button onClick={() => setQty(q => q + 1)} style={{ padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>+</button>
              </div>

              <button
                className="btn-primary"
                style={{ flex: 1, padding: '15px 28px', fontSize: 13, letterSpacing: '0.1em' }}
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                <ShoppingBag style={{ width: 16, height: 16, display: 'inline-block', verticalAlign: 'middle', marginRight: 8 }} />
                {product.inStock ? 'ADD TO BAG' : 'SOLD OUT'}
              </button>

              <button
                className={`action-btn${isWishlisted ? ' active' : ''}`}
                style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => toggleWishlist(product.id)}
                title="Wishlist"
              >
                <Heart style={{ width: 20, height: 20, fill: isWishlisted ? 'var(--danger)' : 'none', color: isWishlisted ? 'var(--danger)' : 'currentColor' }} />
              </button>
            </div>

            {/* Accordion Info Tabs */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              {accordionTabs.map(tab => (
                <div key={tab.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <button
                    onClick={() => setOpenTab(openTab === tab.id ? '' : tab.id)}
                    style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: 'var(--onyx)' }}
                  >
                    {tab.label}
                    {openTab === tab.id ? <ChevronUp style={{ width: 16 }} /> : <ChevronDown style={{ width: 16 }} />}
                  </button>
                  {openTab === tab.id && (
                    <div style={{ paddingBottom: 16, fontSize: 13, lineHeight: 1.6, color: 'var(--slate)' }}>
                      <p>{tab.content}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="section-padding" style={{ background: 'var(--cream)' }}>
        <div className="container">
          <div className="section-header">
            <p className="section-subtitle">Client Experiences</p>
            <h2 className="section-title">Reviews ({reviews.length})</h2>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <button className="btn-secondary" onClick={() => { if (!currentUser) { navigate('/account'); } else { setReviewFormOpen(r => !r); } }}>
              Write a Review
            </button>
          </div>

          {reviewFormOpen && currentUser && (
            <form onSubmit={handleReviewSubmit} style={{ maxWidth: 600, margin: '0 auto 40px auto', background: 'var(--cloud-white)', padding: 24, borderRadius: 8, border: '1px solid var(--border)' }}>
              <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--gold-dark)', marginBottom: 8 }}>Rating (Mandatory)</p>
              <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                {[1,2,3,4,5].map(i => (
                  <button key={i} type="button" onClick={() => setReviewRating(i)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Star style={{ width: 24, height: 24, fill: i <= reviewRating ? 'var(--gold)' : 'none', color: 'var(--gold)' }} />
                  </button>
                ))}
              </div>

              <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--slate)', marginBottom: 8 }}>Feedback (Optional)</p>
              <textarea
                style={{ width: '100%', padding: 12, borderRadius: 6, border: '1px solid var(--border)', fontSize: 14, outline: 'none', marginBottom: 16, boxSizing: 'border-box' }}
                rows={4}
                placeholder="write your feedback"
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn-primary">Submit Review</button>
                <button type="button" className="btn-secondary" onClick={() => setReviewFormOpen(false)}>Cancel</button>
              </div>
            </form>
          )}

          {reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--slate)' }}>
              <p style={{ fontSize: 15 }}>No reviews yet. Be the first to review this piece!</p>
            </div>
          ) : (
            <div className="bs-grid">
              {reviews.map(r => (
                <div key={r.id} style={{ background: 'var(--cloud-white)', padding: 20, borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gold)', color: 'var(--onyx)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                      {r.author?.charAt(0)}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--onyx)' }}>{r.author}</p>
                      <p style={{ fontSize: 11, color: 'var(--slate)' }}>{r.date}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', color: 'var(--gold)', marginBottom: 8 }}>
                    {[...Array(r.rating)].map((_, i) => <Star key={i} style={{ width: 13, height: 13, fill: 'var(--gold)', color: 'var(--gold)' }} />)}
                  </div>
                  {r.text && <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--slate)' }}>{r.text}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="section-padding">
          <div className="container">
            <div className="section-header">
              <p className="section-subtitle">You May Also Like</p>
              <h2 className="section-title">Related Pieces</h2>
            </div>
            <div className="bs-grid">
              {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Zoom Modal */}
      {zoomOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setZoomOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
            <button onClick={() => setZoomOpen(false)} style={{ position: 'absolute', top: -40, right: 0, color: '#fff', background: 'none', border: 'none', cursor: 'pointer' }}><X style={{ width: 24, height: 24 }} /></button>
            <img src={images[selectedImageIdx]} alt={product.name} style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain' }} />
          </div>
        </div>
      )}

      {/* Ring Size Guide Modal */}
      {sizeModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setSizeModalOpen(false)}>
          <div style={{ background: '#fff', padding: 28, borderRadius: 12, maxWidth: 540, width: '100%', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 600 }}>Ring Size Guide</h3>
              <button onClick={() => setSizeModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X style={{ width: 20, height: 20 }} /></button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}><th style={{ padding: 8 }}>AU/UK</th><th style={{ padding: 8 }}>US/Canada</th><th style={{ padding: 8 }}>EU Size</th><th style={{ padding: 8 }}>Diameter (mm)</th></tr>
                </thead>
                <tbody>
                  {[
                    ['H', '4', '46.5', '14.8'], ['J', '4.75', '48', '15.3'], ['L', '5.75', '50', '15.9'],
                    ['M', '6.25', '51', '16.2'], ['N', '6.75', '52', '16.5'], ['O', '7.25', '54', '17.2'],
                    ['P', '7.75', '55', '17.5'], ['Q', '8.25', '57', '18.2'], ['R', '8.75', '58', '18.5'],
                  ].map(([au, us, eu, mm]) => (
                    <tr key={au} style={{ borderBottom: '1px solid var(--border)' }}><td style={{ padding: 8 }}>{au}</td><td style={{ padding: 8 }}>{us}</td><td style={{ padding: 8 }}>{eu}</td><td style={{ padding: 8 }}>{mm}mm</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
