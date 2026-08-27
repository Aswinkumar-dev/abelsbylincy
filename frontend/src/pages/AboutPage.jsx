import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, Heart, ShieldCheck, Sparkles, Store, Users } from 'lucide-react';

export default function AboutPage() {
  const milestoneNodes = [
    {
      year: 'March 2026',
      title: 'The Journey Begins in Sydney',
      desc: "Abel’s by Lincy was founded in Sydney, Australia, born from a passion for fashion and a desire to make beautiful, stylish, and affordable jewellery easily accessible to women.",
      side: 'left'
    },
    {
      year: '2026',
      title: 'Versatile Styling Solutions',
      desc: "Recognized the need for high-quality, anti-tarnish jewellery in Australia that seamlessly transitions between traditional Indian outfits and everyday Western wear.",
      side: 'right'
    },
    {
      year: '2026',
      title: 'Local Markets & Exhibition Stalls',
      desc: "Expanded our presence through Sydney local markets, exhibition stalls, and a growing Instagram community, connecting directly with jewellery lovers.",
      side: 'left'
    },
    {
      year: 'Key Milestone',
      title: 'Customer Love & Organic Growth',
      desc: "Our most meaningful milestone: seeing happy customers return, recommend Abel's by Lincy to friends, and share their genuine love for our pieces.",
      side: 'right'
    }
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
          <div className="about-layout">
            <div className="about-founder-text">
              <p className="section-subtitle">The Story Behind Us</p>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 34, marginBottom: 20, color: 'var(--onyx)' }}>Elegance for Every Wear</h2>
              <p style={{ fontSize: 15, color: 'var(--slate)', lineHeight: 1.8, marginBottom: 16 }}>
                <strong>Abel’s by Lincy</strong> was started in <strong>March 2026</strong> in Sydney, Australia. The idea came from a deep love for jewellery and fashion, driven by a desire to make beautiful, stylish, and affordable pieces easily accessible to women.
              </p>
              <p style={{ fontSize: 15, color: 'var(--slate)', lineHeight: 1.8, marginBottom: 20 }}>
                The journey began when founder <strong>Lincy Titus</strong> noticed a gap in Australia: finding good-quality, trendy, and affordable jewellery that suited both traditional Indian outfits and everyday Western wear could be challenging. She wanted to create a brand that combined elegance, quality, and affordability — offering pieces women could wear with confidence every single day.
              </p>
              <div style={{ borderLeft: '3px solid var(--gold)', color: 'var(--onyx)', fontSize: 15, marginBottom: 28, background: 'var(--cream)', padding: '18px 22px', borderRadius: '0 8px 8px 0', width: '100%', boxSizing: 'border-box' }}>
                <p style={{ fontStyle: 'italic', margin: 0, lineHeight: 1.6 }}>
                  "I wanted to create jewellery that effortlessly bridges traditional celebration with everyday modern style — pieces that make women feel confident, elegant, and treasured."
                </p>
                <p style={{ fontStyle: 'normal', fontSize: 13, fontWeight: 700, color: 'var(--gold-dark)', marginTop: 10, margin: '10px 0 0 0' }}>— Lincy Titus, Founder</p>
              </div>
            </div>
            <div>
              <img
                src="https://res.cloudinary.com/gylnyxru/image/upload/v1787796753/abels_by_lincy/Ring_Category.png"
                alt="Abel's By Lincy Ring Collection"
                style={{ width: '100%', borderRadius: 16, boxShadow: 'var(--shadow-lg)', objectFit: 'cover', maxHeight: 460 }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/assets/Ring Category.png';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Key Milestones & Growth Section */}
      <section className="section-padding" style={{ background: 'var(--cream)' }}>
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', marginBottom: 44 }}>
            <p className="section-subtitle">Our Journey</p>
            <h2 className="section-title">Key Milestones &amp; Growth</h2>
            <p style={{ fontSize: 15, color: 'var(--slate)', marginTop: 8, maxWidth: 640, margin: '8px auto 0' }}>
              For a growing small business, genuine customer relationships and repeat purchases are our true measure of success.
            </p>
          </div>

          <div className="timeline-track">
            {milestoneNodes.map((node, i) => (
              <div key={i} className={`timeline-node ${node.side}`}>
                <div className="timeline-dot" />
                <div className="timeline-content" style={{ background: '#FFFFFF', padding: 24, borderRadius: 14, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold-dark)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{node.year}</span>
                  <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 600, margin: '6px 0 8px 0', color: 'var(--onyx)' }}>{node.title}</h4>
                  <p style={{ fontSize: 13, color: 'var(--slate)', lineHeight: 1.6, margin: 0 }}>{node.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Growth Year Highlights Grid */}
      <section className="section-padding">
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', marginBottom: 40 }}>
            <p className="section-subtitle">2026 Expansion</p>
            <h2 className="section-title">How We Are Growing</h2>
          </div>

          <div className="about-values-grid">
            <div style={{ background: 'var(--cream)', padding: 30, borderRadius: 16, border: '1px solid var(--border)', textAlign: 'center' }}>
              <Sparkles style={{ width: 32, height: 32, color: 'var(--gold)', marginBottom: 14, display: 'inline-block' }} />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 19, marginBottom: 10, color: 'var(--onyx)' }}>Expanded Collections</h3>
              <p style={{ fontSize: 14, color: 'var(--slate)', lineHeight: 1.6, margin: 0 }}>Introduced anti-tarnish earrings, bangles, necklaces, bracelets, and rings designed for everyday shine.</p>
            </div>
            <div style={{ background: 'var(--cream)', padding: 30, borderRadius: 16, border: '1px solid var(--border)', textAlign: 'center' }}>
              <Store style={{ width: 32, height: 32, color: 'var(--gold)', marginBottom: 14, display: 'inline-block' }} />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 19, marginBottom: 10, color: 'var(--onyx)' }}>Markets &amp; Exhibitions</h3>
              <p style={{ fontSize: 14, color: 'var(--slate)', lineHeight: 1.6, margin: 0 }}>Active participation in local Sydney markets and exhibition stalls, building direct customer connections.</p>
            </div>
            <div style={{ background: 'var(--cream)', padding: 30, borderRadius: 16, border: '1px solid var(--border)', textAlign: 'center' }}>
              <Users style={{ width: 32, height: 32, color: 'var(--gold)', marginBottom: 14, display: 'inline-block' }} />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 19, marginBottom: 10, color: 'var(--onyx)' }}>Community Support</h3>
              <p style={{ fontSize: 14, color: 'var(--slate)', lineHeight: 1.6, margin: 0 }}>Growing Instagram community and strong support from repeat customers who love and recommend our brand.</p>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 56, padding: '40px 24px', background: 'var(--cream)', borderRadius: 16, border: '1px solid var(--border)' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, marginBottom: 12, color: 'var(--onyx)' }}>Ready to Find Your Everyday Piece?</h3>
            <p style={{ fontSize: 14, color: 'var(--slate)', marginBottom: 24 }}>Explore our anti-tarnish gold jewellery crafted for traditional celebrations and daily style.</p>
            <div className="about-cta-btns">
              <Link to="/shop" className="btn-primary" style={{ padding: '14px 28px' }}>Shop Collections <ArrowRight style={{ width: 14, marginLeft: 6 }} /></Link>
              <Link to="/contact" className="btn-secondary" style={{ padding: '14px 28px' }}>Contact Us</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
