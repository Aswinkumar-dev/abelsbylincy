import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, Heart, Shield } from 'lucide-react';

export default function AboutPage() {
  return (
    <>
      <div className="page-hero">
        <div className="container">
          <p className="section-subtitle">The Abel's Legacy</p>
          <h1>Our Story</h1>
        </div>
      </div>

      {/* Founder Section */}
      <section className="section">
        <div className="container">
          <div className="about-layout">
            <div className="about-founder-text">
              <p className="section-subtitle">Artisanal Roots</p>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, marginBottom: 20 }}>Crafted with Heart in Sydney</h2>
              <p style={{ fontSize: 15, color: 'var(--slate)', lineHeight: 1.8, marginBottom: 16 }}>
                Founded by Lincy Titus in Sydney, Abel's By Lincy was born out of a deep reverence for fine jewellery craftsmanship and a belief that luxury should be accessible, durable, and deeply personal.
              </p>
              <p style={{ fontSize: 15, color: 'var(--slate)', lineHeight: 1.8, marginBottom: 24 }}>
                Drawing inspiration from traditional Kerala goldsmithing heritage and contemporary Australian aesthetics, every piece in our collection is thoughtfully designed and finished to heirloom quality standards.
              </p>
              <div style={{ borderLeft: '3px solid var(--gold)', paddingLeft: 20, fontStyle: 'italic', color: 'var(--onyx)', fontSize: 16, marginBottom: 28 }}>
                "Jewellery isn't just an accessory — it's a keepsake of life's most cherished moments and personal triumphs."
                <p style={{ fontStyle: 'normal', fontSize: 13, fontWeight: 700, color: 'var(--gold)', marginTop: 8 }}>— Lincy Titus, Founder &amp; Master Artisan</p>
              </div>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80"
                alt="Lincy Titus Atelier"
                style={{ width: '100%', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section section-cream">
        <div className="container">
          <div className="section-header-center">
            <p className="section-subtitle">Our Journey</p>
            <h2 className="section-title">The Abel's Timeline</h2>
          </div>
          <div className="about-timeline">
            {[
              { year: '2018', title: 'The Dream Begins', desc: 'Lincy Titus arrives in Sydney with a vision to bring fine artisanal jewellery craftsmanship to Australia.' },
              { year: '2019', title: 'First Collection', desc: 'Launch of our debut Soleil collection — 12 hand-crafted gold-plated pieces that sold out in the first month.' },
              { year: '2020', title: 'Growing Circle', desc: 'Abel\'s By Lincy grows through word-of-mouth, serving over 500 loyal clients across Australia.' },
              { year: '2022', title: 'Online Presence', desc: 'Launch of abelsbylincy.com, bringing bespoke jewellery to clients across every Australian state.' },
              { year: '2024', title: 'Award Recognition', desc: 'Recognized by the Sydney Small Business Excellence Awards for outstanding craftsmanship and customer care.' },
              { year: '2026', title: 'The Future', desc: 'Continuing to grow our atelier, introducing new collections, and expanding our custom design services.' },
            ].map((t, i) => (
              <div key={i} className="timeline-item">
                <div className="timeline-year">{t.year}</div>
                <div className="timeline-content">
                  <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 600, marginBottom: 6 }}>{t.title}</h4>
                  <p style={{ fontSize: 13, color: 'var(--slate)', margin: 0 }}>{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section">
        <div className="container">
          <div className="section-header-center">
            <p className="section-subtitle">Guiding Principles</p>
            <h2 className="section-title">Our Values</h2>
          </div>
          <div className="about-values-grid">
            <div className="about-value-card">
              <Award style={{ width: 28, height: 28, color: 'var(--gold)', marginBottom: 16 }} />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, marginBottom: 10 }}>Artisanal Craft</h3>
              <p style={{ fontSize: 14, color: 'var(--slate)', lineHeight: 1.6 }}>We honor age-old techniques combined with modern plating innovations to ensure longevity.</p>
            </div>
            <div className="about-value-card">
              <Shield style={{ width: 28, height: 28, color: 'var(--gold)', marginBottom: 16 }} />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, marginBottom: 10 }}>Ethical Sourcing</h3>
              <p style={{ fontSize: 14, color: 'var(--slate)', lineHeight: 1.6 }}>Conflict-free gemstones and responsibly sourced precious metals in all our designs.</p>
            </div>
            <div className="about-value-card">
              <Heart style={{ width: 28, height: 28, color: 'var(--gold)', marginBottom: 16 }} />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, marginBottom: 10 }}>Personal Connections</h3>
              <p style={{ fontSize: 14, color: 'var(--slate)', lineHeight: 1.6 }}>Every client is family. We provide personalized styling guidance and lifetime care advice.</p>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 50 }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, marginBottom: 16 }}>Ready to Find Your Perfect Piece?</h3>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Link to="/shop" className="btn-primary">Shop Collections <ArrowRight style={{ width: 14 }} /></Link>
              <Link to="/contact" className="btn-secondary">Contact Atelier</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
