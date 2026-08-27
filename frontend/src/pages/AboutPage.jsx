import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, Heart, Shield } from 'lucide-react';

export default function AboutPage() {
  const timelineNodes = [
    { year: '2018', title: 'The Dream Begins', desc: 'Lincy Titus, a passionate goldsmith from Kerala, India, arrives in Sydney with a vision to bring fine artisanal jewellery craftsmanship to Australia.', side: 'left' },
    { year: '2019', title: 'First Collection', desc: 'Launch of our debut Soleil collection — 12 hand-crafted gold-plated pieces that sold out in the first month.', side: 'right' },
    { year: '2020', title: 'Growing Circle', desc: 'Abel\'s By Lincy grows through word-of-mouth, serving over 500 loyal clients across Australia.', side: 'left' },
    { year: '2022', title: 'Online Presence', desc: 'Launch of abelsbylincy.com, bringing bespoke jewellery to clients across every Australian state and territory.', side: 'right' },
    { year: '2024', title: 'Award Recognition', desc: 'Recognized by the Sydney Small Business Excellence Awards for outstanding craftsmanship and customer care.', side: 'left' },
    { year: '2026', title: 'The Future', desc: 'Continuing to grow our atelier, introducing new collections, and expanding our bespoke custom design services.', side: 'right' },
  ];

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <p className="section-subtitle">The Abel's Legacy</p>
          <h1>Our Story</h1>
        </div>
      </div>

      {/* Founder Story Section */}
      <section className="section-padding">
        <div className="container">
          <div className="about-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
            <div className="about-founder-text">
              <p className="section-subtitle">Artisanal Heritage</p>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 34, marginBottom: 20, color: 'var(--onyx)' }}>Crafted with Heart in Sydney</h2>
              <p style={{ fontSize: 15, color: 'var(--slate)', lineHeight: 1.8, marginBottom: 16 }}>
                Founded by Lincy Titus in Sydney, Abel's By Lincy was born out of a deep reverence for fine jewellery craftsmanship and a belief that luxury should be accessible, durable, and deeply personal.
              </p>
              <p style={{ fontSize: 15, color: 'var(--slate)', lineHeight: 1.8, marginBottom: 24 }}>
                Drawing inspiration from traditional Kerala goldsmithing heritage and contemporary Australian aesthetics, every piece in our collection is thoughtfully designed and finished to heirloom quality standards.
              </p>
              <div style={{ borderLeft: '3px solid var(--gold)', paddingLeft: 20, fontStyle: 'italic', color: 'var(--onyx)', fontSize: 15, marginBottom: 28, background: 'var(--cream)', padding: '16px 20px', borderRadius: '0 8px 8px 0' }}>
                "Jewellery isn't just an accessory — it's a keepsake of life's most cherished moments and personal triumphs."
                <p style={{ fontStyle: 'normal', fontSize: 13, fontWeight: 700, color: 'var(--gold-dark)', marginTop: 8, margin: '8px 0 0 0' }}>— Lincy Titus, Founder &amp; Master Artisan</p>
              </div>
            </div>
            <div>
              <img
                src="https://res.cloudinary.com/gylnyxru/image/upload/v1787796760/abels_by_lincy/silver_collection_category.webp"
                alt="Lincy Titus Atelier"
                style={{ width: '100%', borderRadius: 16, boxShadow: 'var(--shadow-lg)', objectFit: 'cover', height: 440 }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/assets/silver collection category.webp';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="section-padding" style={{ background: 'var(--cream)' }}>
        <div className="container">
          <div className="section-header">
            <p className="section-subtitle">Our Journey</p>
            <h2 className="section-title">The Abel's Timeline</h2>
          </div>

          <div className="timeline-track">
            {timelineNodes.map((node, i) => (
              <div key={i} className={`timeline-node ${node.side}`}>
                <div className="timeline-dot" />
                <div className="timeline-content" style={{ background: '#FFFFFF', padding: 24, borderRadius: 12, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold-dark)', letterSpacing: '0.1em' }}>{node.year}</span>
                  <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 600, margin: '6px 0 8px 0', color: 'var(--onyx)' }}>{node.title}</h4>
                  <p style={{ fontSize: 13, color: 'var(--slate)', lineHeight: 1.6, margin: 0 }}>{node.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section-padding">
        <div className="container">
          <div className="section-header">
            <p className="section-subtitle">Guiding Principles</p>
            <h2 className="section-title">Our Core Values</h2>
          </div>
          <div className="bs-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 30 }}>
            <div style={{ background: 'var(--cream)', padding: 32, borderRadius: 12, border: '1px solid var(--border)', textAlign: 'center' }}>
              <Award style={{ width: 32, height: 32, color: 'var(--gold)', marginBottom: 16, display: 'inline-block' }} />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, marginBottom: 10, color: 'var(--onyx)' }}>Artisanal Craft</h3>
              <p style={{ fontSize: 14, color: 'var(--slate)', lineHeight: 1.6, margin: 0 }}>We honor age-old goldsmithing techniques combined with modern plating innovations to ensure lasting beauty.</p>
            </div>
            <div style={{ background: 'var(--cream)', padding: 32, borderRadius: 12, border: '1px solid var(--border)', textAlign: 'center' }}>
              <Shield style={{ width: 32, height: 32, color: 'var(--gold)', marginBottom: 16, display: 'inline-block' }} />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, marginBottom: 10, color: 'var(--onyx)' }}>Ethical Sourcing</h3>
              <p style={{ fontSize: 14, color: 'var(--slate)', lineHeight: 1.6, margin: 0 }}>Conflict-free gemstones and responsibly sourced precious metals in all our bespoke designs.</p>
            </div>
            <div style={{ background: 'var(--cream)', padding: 32, borderRadius: 12, border: '1px solid var(--border)', textAlign: 'center' }}>
              <Heart style={{ width: 32, height: 32, color: 'var(--gold)', marginBottom: 16, display: 'inline-block' }} />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, marginBottom: 10, color: 'var(--onyx)' }}>Personal Connections</h3>
              <p style={{ fontSize: 14, color: 'var(--slate)', lineHeight: 1.6, margin: 0 }}>Every client is family. We provide personalized styling guidance and lifetime care advice.</p>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 60, padding: '40px 20px', background: 'var(--cream)', borderRadius: 16, border: '1px solid var(--border)' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, marginBottom: 12, color: 'var(--onyx)' }}>Ready to Find Your Perfect Piece?</h3>
            <p style={{ fontSize: 14, color: 'var(--slate)', marginBottom: 24 }}>Explore our curated fine jewellery collections or reach out to our Sydney atelier.</p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
              <Link to="/shop" className="btn-primary" style={{ padding: '14px 28px' }}>Shop Collections <ArrowRight style={{ width: 14, marginLeft: 6 }} /></Link>
              <Link to="/contact" className="btn-secondary" style={{ padding: '14px 28px' }}>Contact Atelier</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
