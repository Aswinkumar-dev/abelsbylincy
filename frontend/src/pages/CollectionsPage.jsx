import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function CollectionsPage() {
  const collections = [
    {
      id: 'lumiere',
      title: 'Lumière Diamond Collection',
      subtitle: 'Brilliant Diamond CZ in 18K Gold',
      desc: 'Our most prestigious line, featuring hand-set brilliant-cut diamond CZ stones in 18K gold settings. Each piece is designed to reflect light from every angle, capturing the radiance of fine diamond jewellery.',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
      link: '/shop?category=necklaces',
      reverse: false,
    },
    {
      id: 'soleil',
      title: 'Soleil Artisanal Gold',
      subtitle: 'Hammered & Brushed 22K Gold Finishes',
      desc: 'Traditional goldsmithing techniques meet contemporary design in our signature Soleil range. Featuring rich 22K gold plating with organic hammered textures that celebrate the mark of the artisan.',
      image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80',
      link: '/shop?category=bangles',
      reverse: true,
    },
    {
      id: 'aurora',
      title: 'Aurora Lustre Pearls',
      subtitle: 'Freshwater Pearls & Gold Accents',
      desc: 'Freshwater pearls sourced from pristine waters, paired with our signature gold settings for timeless, romantic elegance. Perfectly versatile from everyday wear to bridal luxury.',
      image: 'https://images.unsplash.com/photo-1573408301185-9519f94815d7?w=800&q=80',
      link: '/shop?category=bracelets',
      reverse: false,
    },
  ];

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <p className="section-subtitle">Curated Fine Lines</p>
          <h1>Signature Collections</h1>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 80, paddingTop: 40 }}>
        {collections.map(col => (
          <section key={col.id} className={`collections-section${col.reverse ? ' reverse' : ''}`}>
            <div className="collections-split-image">
              <img src={col.image} alt={col.title} loading="lazy" />
            </div>
            <div className="collections-split-content">
              <p className="section-subtitle">{col.subtitle}</p>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, marginBottom: 16 }}>{col.title}</h2>
              <p style={{ color: 'var(--slate)', fontSize: 15, lineHeight: 1.8, marginBottom: 28 }}>{col.desc}</p>
              <Link to={col.link} className="btn-primary" style={{ display: 'inline-flex' }}>
                Explore Collection <ArrowRight style={{ width: 14 }} />
              </Link>
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
