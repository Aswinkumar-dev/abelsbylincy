import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, ShieldCheck, RefreshCw, Award, ChevronLeft, ChevronRight, Sparkles, DropletOff, Gift } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';

export default function HomePage() {
  const { products, categories, cms } = useStore();
  const [slideIdx, setSlideIdx] = useState(0);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const slideTimer = useRef(null);

  // Hero slides using ONLY images ending with '-hero.webp' / 'hero.webp'
  const heroSlides = [
    {
      id: 'slide-1',
      tagline: 'THE BRACELET COLLECTION',
      title: 'Stack. <b>Style</b>. Shine.',
      description: 'Your everyday essentials, elevated.',
      image: '/assets/bracelets- hero.webp',
      ctaText: 'SHOP BRACELETS',
      ctaLink: '/shop?category=bracelets',
      theme: 'gold'
    },
    {
      id: 'slide-2',
      tagline: 'THE NECKLACE COLLECTION',
      title: 'A Touch of <b>Gold</b>, Made to Shine.',
      description: 'Discover necklaces designed for effortless elegance.',
      image: '/assets/necklace-hero.webp',
      ctaText: 'SHOP NECKLACES',
      ctaLink: '/shop?category=necklaces',
      theme: 'gold'
    },
    {
      id: 'slide-3',
      tagline: 'THE EARRING COLLECTION',
      title: 'Frame Your <b>Style</b>.',
      description: 'Statement or subtle — make it yours.',
      image: '/assets/earrings-hero.webp',
      ctaText: 'SHOP EARRINGS',
      ctaLink: '/shop?category=earrings',
      theme: 'gold'
    },
    {
      id: 'slide-4',
      tagline: 'THE BANGLE COLLECTION',
      title: 'Timeless Around Your <b>Wrist</b>.',
      description: 'A classic touch of gold for every occasion.',
      image: '/assets/bangles-hero.webp',
      ctaText: 'SHOP BANGLES',
      ctaLink: '/shop?category=bangles',
      theme: 'gold'
    }
  ];

  const currentSlide = heroSlides[slideIdx % heroSlides.length];

  // Auto-advance hero slideshow every 5s
  useEffect(() => {
    slideTimer.current = setInterval(() => {
      setSlideIdx(i => (i + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(slideTimer.current);
  }, [heroSlides.length]);

  // Ensure Elfsight initializes on mount
  useEffect(() => {
    if (window.ElfsightApp) {
      window.ElfsightApp.init();
    }
  }, []);

  const goSlide = (idx) => {
    setSlideIdx(idx);
    clearInterval(slideTimer.current);
    slideTimer.current = setInterval(() => {
      setSlideIdx(i => (i + 1) % heroSlides.length);
    }, 5000);
  };

  const testimonials = [
    {
      name: 'Sarah Mitchell',
      location: 'Sydney, NSW',
      rating: 5,
      quote: "Abel's By Lincy is my go-to for fine jewellery. The quality is exceptional and their customer service is outstanding. My Celestial Necklace arrives every day.",
      product: 'CELESTIAL CRESCENT NECKLACE',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop'
    },
    {
      name: 'Emma Johnson',
      location: 'Melbourne, VIC',
      rating: 5,
      quote: "I ordered the Aurora Ring Set for a special occasion and was blown away by the craftsmanship. The packaging was beautiful too — felt truly luxurious.",
      product: 'AURORA STACKING RING SET',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop'
    },
    {
      name: 'Olivia Chen',
      location: 'Brisbane, QLD',
      rating: 5,
      quote: "Finally found a jeweller who truly understands fine craftsmanship at an accessible price point. The gold plating is thick and lasting. Highly recommend!",
      product: 'SOLEIL GOLD BANGLE',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop'
    },
  ];

  // Auto-advance testimonials every 4s
  useEffect(() => {
    const t = setInterval(() => setTestimonialIdx(i => (i + 1) % testimonials.length), 4000);
    return () => clearInterval(t);
  }, [testimonials.length]);

  const currentTestimonial = testimonials[testimonialIdx % testimonials.length];

  const newArrivals = products.filter(p => p.newArrival);
  const bestSellers = products.filter(p => p.bestSeller);

  return (
    <>
      {/* Hero Slideshow Section */}
      <section className="hero-slideshow-section">
        <button className="hero-nav-btn prev" onClick={() => goSlide((slideIdx - 1 + heroSlides.length) % heroSlides.length)} aria-label="Previous Slide">
          <ChevronLeft style={{ width: 24, height: 24 }} />
        </button>
        <button className="hero-nav-btn next" onClick={() => goSlide((slideIdx + 1) % heroSlides.length)} aria-label="Next Slide">
          <ChevronRight style={{ width: 24, height: 24 }} />
        </button>

        <div className="hero-slide-wrapper">
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <img
              src={currentSlide.image}
              alt={currentSlide.tagline}
              loading="eager"
              fetchpriority="high"
              style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                const filename = currentSlide.image.split('/').pop();
                e.target.onerror = null;
                e.target.src = `/assets/${decodeURIComponent(filename)}`;
              }}
            />
            
            <div className="hero-slide-content-overlay">
              <div className={`hero-slide-text-box theme-${currentSlide.theme || 'gold'}`}>
                {currentSlide.tagline && <p className="hero-slide-tagline">{currentSlide.tagline}</p>}
                <h2 className="hero-slide-title" dangerouslySetInnerHTML={{ __html: currentSlide.title }}></h2>
                {currentSlide.description && <p className="hero-slide-desc">{currentSlide.description}</p>}
                <Link to={currentSlide.ctaLink || '/shop'} className="hero-slide-cta">
                  {currentSlide.ctaText || 'SHOP COLLECTION'} <ArrowRight style={{ width: 16, height: 16 }} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-dots">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              className={`hero-dot${i === slideIdx ? ' active' : ''}`}
              onClick={() => goSlide(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Trust Bar Section */}
      <section className="trust-bar-section">
        <div className="trust-bar-wrapper">
          <div className="trust-bar-track">
            <div className="trust-item">
              <Award className="trust-icon" style={{ width: 18, height: 18 }} />
              <span>Premium Gold-Plated</span>
            </div>
            <div className="trust-item">
              <ShieldCheck className="trust-icon" style={{ width: 18, height: 18 }} />
              <span>Anti-Tarnish Warranty</span>
            </div>
            <div className="trust-item">
              <Truck className="trust-icon" style={{ width: 18, height: 18 }} />
              <span>Australia Shipping</span>
            </div>
            <div className="trust-item">
              <RefreshCw className="trust-icon" style={{ width: 18, height: 18 }} />
              <span>Easy Returns</span>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      {newArrivals.length > 0 && (
        <section className="section-padding new-arrivals-section" style={{ background: 'var(--off-white)' }}>
          <div className="container">
            <div className="section-header">
              <p className="section-subtitle">Just Dropped</p>
              <h2 className="section-title">New Arrivals</h2>
            </div>
            
            <div className="bs-grid">
              {newArrivals.map(p => <ProductCard key={p.id} product={p} />)}
            </div>

            <div style={{ textAlign: 'center', marginTop: 48 }}>
              <Link to="/shop?category=new-arrivals" className="btn-primary" style={{ padding: '12px 36px' }}>
                VIEW NEW ARRIVALS <ArrowRight style={{ width: 15, height: 15, verticalAlign: 'middle', marginLeft: 6 }} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Shop By Category Section */}
      <section className="section-padding shop-by-category-section" style={{ background: 'var(--cloud-white)' }}>
        <div className="container">
          <div className="section-header">
            <p className="section-subtitle">Curated Catalogue</p>
            <h2 className="section-title">Shop By Category</h2>
          </div>

          <div className="collections-grid">
            {categories.map(cat => (
              <Link key={cat.id} to={`/shop?category=${cat.id}`} className="collection-card">
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    const filename = cat.image.split('/').pop();
                    e.target.onerror = null;
                    e.target.src = `/assets/${decodeURIComponent(filename)}`;
                  }}
                />
                <div className="collection-overlay">
                  <h3 className="collection-name">{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      {bestSellers.length > 0 && (
        <section className="section-padding bs-section" style={{ background: 'var(--cream)' }}>
          <div className="container">
            <div className="section-header">
              <p className="section-subtitle">Most Treasured Pieces</p>
              <h2 className="section-title">Best Sellers</h2>
            </div>
            
            <div className="bs-grid">
              {bestSellers.map(p => <ProductCard key={p.id} product={p} />)}
            </div>

            <div style={{ textAlign: 'center', marginTop: 48 }}>
              <Link to="/shop?category=best-sellers" className="btn-primary" style={{ padding: '12px 36px' }}>
                VIEW ALL PRODUCTS <ArrowRight style={{ width: 15, height: 15, verticalAlign: 'middle', marginLeft: 6 }} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Elfsight Live Instagram Feed Widget Section */}
      <section className="section-padding-sm instagram-section" style={{ background: 'var(--off-white)' }}>
        <div className="container">
          <div className="elfsight-app-250a2098-72ab-46c7-affc-6d1bad6d683e" data-elfsight-app-lazy></div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-section">
        <div className="container">
          <div className="section-header" style={{ marginBottom: 70 }}>
            <p className="section-subtitle">Exquisite Value</p>
            <h2 className="section-title">Why Choose Us</h2>
            <p className="section-desc" style={{ maxWidth: 600, margin: '12px auto 0', color: 'var(--slate)', fontSize: 15, lineHeight: 1.6 }}>
              We're committed to delivering more than just jewellery — <br />we deliver trust, care, and timeless elegance.
            </p>
          </div>

          <div className="why-choose-grid">
            <div className="why-choose-card">
              <div className="why-icon-outer">
                <div className="why-icon-inner">
                  <Sparkles style={{ width: 22, height: 22 }} />
                </div>
              </div>
              <div className="why-choose-line"></div>
              <h4>Gold-Plated</h4>
              <div className="why-title-divider"></div>
              <p>Premium 18K gold plating over durable base metals for long-lasting brilliance.</p>
              <div className="why-card-number">01</div>
            </div>

            <div className="why-choose-card">
              <div className="why-icon-outer">
                <div className="why-icon-inner">
                  <DropletOff style={{ width: 22, height: 22 }} />
                </div>
              </div>
              <div className="why-choose-line"></div>
              <h4>Anti-Tarnish</h4>
              <div className="why-title-divider"></div>
              <p>Special anti-tarnish coating to keep your jewellery shiny, fresh, and worry-free.</p>
              <div className="why-card-number">02</div>
            </div>

            <div className="why-choose-card">
              <div className="why-icon-outer">
                <div className="why-icon-inner">
                  <Award style={{ width: 22, height: 22 }} />
                </div>
              </div>
              <div className="why-choose-line"></div>
              <h4>Quality</h4>
              <div className="why-title-divider"></div>
              <p>Crafted by skilled artisans with strict quality checks at every step.</p>
              <div className="why-card-number">03</div>
            </div>

            <div className="why-choose-card">
              <div className="why-icon-outer">
                <div className="why-icon-inner">
                  <Gift style={{ width: 22, height: 22 }} />
                </div>
              </div>
              <div className="why-choose-line"></div>
              <h4>Carefully Packed</h4>
              <div className="why-title-divider"></div>
              <p>Your jewellery is packed with love and care to ensure it reaches you safely.</p>
              <div className="why-card-number">04</div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="section-padding testimonials-section" style={{ background: 'var(--cloud-white)' }}>
        <div className="container">
          <div className="section-header">
            <p className="section-subtitle">Kind Words</p>
            <h2 className="section-title">Customer Reviews</h2>
          </div>

          <div className="testimonial-container">
            <div className="stars" style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 16, color: 'var(--gold)' }}>
              {[...Array(currentTestimonial.rating)].map((_, i) => (
                <Star key={i} style={{ width: 18, height: 18, fill: 'var(--gold)', color: 'var(--gold)' }} />
              ))}
            </div>

            <p className="testimonial-quote">"{currentTestimonial.quote}"</p>

            <div className="testimonial-author-row">
              <img src={currentTestimonial.avatar} alt={currentTestimonial.name} className="testimonial-avatar" />
              <div className="testimonial-info" style={{ textAlign: 'left' }}>
                <h5>{currentTestimonial.name}</h5>
                <p>{currentTestimonial.location}</p>
              </div>
            </div>

            <p className="testimonial-product">{currentTestimonial.product}</p>

            <div className="testimonial-nav">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  className={`hero-dot${i === testimonialIdx ? ' active' : ''}`}
                  onClick={() => setTestimonialIdx(i)}
                  aria-label={`Testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
