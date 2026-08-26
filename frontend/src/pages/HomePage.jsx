import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, Shield, RefreshCcw, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';

export default function HomePage() {
  const { products, categories, cms } = useStore();
  const [slideIdx, setSlideIdx] = useState(0);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const slideTimer = useRef(null);
  const heroSlides = cms?.heroSlides || [];

  // Auto-advance slideshow every 5s
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    slideTimer.current = setInterval(() => {
      setSlideIdx(i => (i + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(slideTimer.current);
  }, [heroSlides.length]);

  const goSlide = (idx) => {
    setSlideIdx(idx);
    clearInterval(slideTimer.current);
    slideTimer.current = setInterval(() => {
      setSlideIdx(i => (i + 1) % heroSlides.length);
    }, 5000);
  };

  const testimonials = [
    { name: 'Sarah M.', location: 'Sydney, NSW', rating: 5, text: "Abel's By Lincy is my go-to for fine jewellery. The quality is exceptional and their customer service is outstanding. My Celestial Necklace arrives every day." },
    { name: 'Emma J.', location: 'Melbourne, VIC', rating: 5, text: "I ordered the Aurora Ring Set for a special occasion and was blown away by the craftsmanship. The packaging was beautiful too — felt truly luxurious." },
    { name: 'Olivia C.', location: 'Brisbane, QLD', rating: 5, text: "Finally found a jeweller who truly understands fine craftsmanship at an accessible price point. The gold plating is thick and lasting. Highly recommend!" },
  ];

  // Auto-advance testimonials every 4s
  useEffect(() => {
    const t = setInterval(() => setTestimonialIdx(i => (i + 1) % testimonials.length), 4000);
    return () => clearInterval(t);
  }, [testimonials.length]);

  const newArrivals = products.filter(p => p.newArrival).slice(0, cms?.newArrivalsLimit || 10);
  const bestSellers = products.filter(p => p.bestSeller).slice(0, 4);

  const trustItems = [
    { icon: <Truck />, title: 'Free Express Shipping', desc: 'Complimentary express shipping on every Australian order' },
    { icon: <Shield />, title: 'Lifetime Quality Promise', desc: 'Every piece crafted to last with premium-grade materials' },
    { icon: <RefreshCcw />, title: '30-Day Easy Returns', desc: 'Hassle-free returns within 30 days of delivery' },
    { icon: <Award />, title: 'Certified Gold Plating', desc: '18K & 22K certified gold plating on all pieces' },
  ];

  const instagramImages = [
    'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=300&q=80',
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&q=80',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&q=80',
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300&q=80',
    'https://images.unsplash.com/photo-1573408301185-9519f94815d7?w=300&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80',
  ];

  return (
    <>
      {/* Hero Slideshow */}
      <section className="hero-section">
        {heroSlides.length === 0 ? (
          <div className="hero-slide" style={{ background: 'var(--cream)', minHeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="hero-content">
              <p className="section-subtitle">Fine Jewellery Sydney</p>
              <h1 className="hero-title">Abel's By Lincy</h1>
              <Link to="/shop" className="btn-primary">Shop Now <ArrowRight style={{ width: 16, height: 16 }} /></Link>
            </div>
          </div>
        ) : (
          <div className="hero-slides-container">
            {heroSlides.map((slide, idx) => (
              <div
                key={slide.id || idx}
                className={`hero-slide${idx === slideIdx ? ' active' : ''}`}
                style={{ backgroundImage: `url(${slide.image})` }}
                aria-hidden={idx !== slideIdx}
              >
                <div className="hero-overlay" />
                <div className="hero-content container">
                  <p className="section-subtitle">{slide.tagline}</p>
                  <h1 className="hero-title">{slide.title}</h1>
                  <p className="hero-description">{slide.description}</p>
                  <div className="hero-cta-group">
                    <Link to={slide.ctaLink || '/shop'} className="btn-primary">
                      {slide.ctaText || 'Shop Now'} <ArrowRight style={{ width: 16, height: 16 }} />
                    </Link>
                    <Link to="/collections" className="btn-secondary" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)' }}>
                      View Collections
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {/* Slide Controls */}
            {heroSlides.length > 1 && (
              <>
                <button className="hero-nav hero-nav-prev" onClick={() => goSlide((slideIdx - 1 + heroSlides.length) % heroSlides.length)} aria-label="Previous slide">
                  <ChevronLeft style={{ width: 24, height: 24 }} />
                </button>
                <button className="hero-nav hero-nav-next" onClick={() => goSlide((slideIdx + 1) % heroSlides.length)} aria-label="Next slide">
                  <ChevronRight style={{ width: 24, height: 24 }} />
                </button>
                <div className="hero-dots">
                  {heroSlides.map((_, i) => (
                    <button key={i} className={`hero-dot${i === slideIdx ? ' active' : ''}`} onClick={() => goSlide(i)} aria-label={`Slide ${i + 1}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </section>

      {/* Trust Bar */}
      <section className="trust-bar">
        <div className="trust-bar-inner container">
          {trustItems.map((item, i) => (
            <div key={i} className="trust-item">
              <div className="trust-icon">{item.icon}</div>
              <div>
                <p className="trust-title">{item.title}</p>
                <p className="trust-desc">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      {cms?.newArrivalsEnabled !== false && newArrivals.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <div>
                <p className="section-subtitle">{cms?.newArrivalsSubtitle || 'Just Dropped'}</p>
                <h2 className="section-title">{cms?.newArrivalsTitle || 'New Arrivals'}</h2>
              </div>
              <Link to="/shop?category=new-arrivals" className="btn-secondary">
                View All <ArrowRight style={{ width: 14, height: 14 }} />
              </Link>
            </div>
            <div className="products-grid">
              {newArrivals.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Categories Grid */}
      <section className="section section-cream">
        <div className="container">
          <div className="section-header">
            <div>
              <p className="section-subtitle">Browse by Style</p>
              <h2 className="section-title">Shop by Category</h2>
            </div>
            <Link to="/shop" className="btn-secondary">All Collections <ArrowRight style={{ width: 14, height: 14 }} /></Link>
          </div>
          <div className="categories-grid">
            {categories.map(cat => (
              <Link key={cat.id} to={`/shop?category=${cat.id}`} className="collection-card">
                <img src={cat.image} alt={cat.name} />
                <div className="collection-overlay">
                  <h3 className="collection-name">{cat.name}</h3>
                  <p className="collection-count">{products.filter(p => p.category === cat.id).length} Designs</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <div>
                <p className="section-subtitle">Client Favourites</p>
                <h2 className="section-title">Best Sellers</h2>
              </div>
              <Link to="/shop?category=best-sellers" className="btn-secondary">
                View All <ArrowRight style={{ width: 14, height: 14 }} />
              </Link>
            </div>
            <div className="products-grid">
              {bestSellers.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Instagram Grid */}
      <section className="section section-cream">
        <div className="container">
          <div className="section-header-center">
            <p className="section-subtitle">Follow Our Journey</p>
            <h2 className="section-title">@abelsbylincy</h2>
          </div>
          <div className="instagram-grid">
            {instagramImages.map((img, i) => (
              <a key={i} href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="instagram-item">
                <img src={img} alt={`Instagram post ${i + 1}`} loading="lazy" />
                <div className="instagram-overlay">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section">
        <div className="container">
          <div className="section-header-center">
            <p className="section-subtitle">The Abel's Promise</p>
            <h2 className="section-title">Why Choose Us</h2>
          </div>
          <div className="why-grid">
            {[
              { title: 'Hand-Crafted Perfection', desc: 'Every piece in our collection is individually hand-crafted by skilled artisans using traditional goldsmithing techniques combined with modern precision.' },
              { title: 'Premium Materials', desc: 'We use only the finest sterling silver bases with thick 18K and 22K gold plating, ensuring exceptional durability and a lasting, radiant finish.' },
              { title: 'Ethical Sourcing', desc: "We're committed to responsible sourcing across our entire supply chain, from conflict-free gemstones to recycled precious metals where possible." },
              { title: 'Personalised Service', desc: 'Our jewellery consultants are available to assist you in finding the perfect piece or creating custom designs for your most treasured moments.' },
            ].map((item, i) => (
              <div key={i} className="why-card">
                <div className="why-number">0{i + 1}</div>
                <h3 className="why-title">{item.title}</h3>
                <p className="why-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section section-cream">
        <div className="container">
          <div className="section-header-center">
            <p className="section-subtitle">Client Stories</p>
            <h2 className="section-title">What Our Clients Say</h2>
          </div>
          <div className="testimonial-slider">
            <div className="testimonial-card active">
              <div className="testimonial-stars">
                {[...Array(testimonials[testimonialIdx].rating)].map((_, i) => (
                  <Star key={i} style={{ width: 16, height: 16, fill: 'var(--gold)', color: 'var(--gold)' }} />
                ))}
              </div>
              <p className="testimonial-text">"{testimonials[testimonialIdx].text}"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{testimonials[testimonialIdx].name.charAt(0)}</div>
                <div>
                  <p className="testimonial-name">{testimonials[testimonialIdx].name}</p>
                  <p className="testimonial-location">{testimonials[testimonialIdx].location}</p>
                </div>
              </div>
            </div>
            <div className="testimonial-dots">
              {testimonials.map((_, i) => (
                <button key={i} className={`testimonial-dot${i === testimonialIdx ? ' active' : ''}`} onClick={() => setTestimonialIdx(i)} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
