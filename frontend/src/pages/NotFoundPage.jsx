import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function NotFoundPage() {
  const collections = [
    { name: 'Rings', link: '/shop?category=rings', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80' },
    { name: 'Necklaces', link: '/shop?category=necklaces', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80' },
    { name: 'Earrings', link: '/shop?category=earrings', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80' },
    { name: 'Bracelets', link: '/shop?category=bracelets', image: 'https://images.unsplash.com/photo-1573408301185-9519f94815d7?w=400&q=80' },
  ];

  return (
    <div className="container" style={{ padding: '80px 16px', textAlign: 'center', maxWidth: 800 }}>
      <p className="section-subtitle" style={{ fontSize: 13, letterSpacing: '0.2em' }}>Page Not Found</p>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 72, color: 'var(--gold)', fontWeight: 700, margin: '10px 0' }}>404</h1>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, marginBottom: 16 }}>Lost in Elegance</h2>
      <p style={{ color: 'var(--slate)', fontSize: 15, lineHeight: 1.6, maxWidth: 500, margin: '0 auto 36px auto' }}>
        The page you're looking for has been moved, renamed, or doesn't exist. Let us guide you back to our curated collection.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 40 }}>
        {collections.map(c => (
          <Link key={c.name} to={c.link} className="collection-card" style={{ aspectRatio: '1/1' }}>
            <img src={c.image} alt={c.name} />
            <div className="collection-overlay">
              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: 16, color: '#fff', margin: 0 }}>{c.name}</h4>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <Link to="/" className="btn-primary">Return to Storefront <ArrowRight style={{ width: 14 }} /></Link>
        <Link to="/shop" className="btn-secondary">Browse All Jewellery</Link>
      </div>
    </div>
  );
}
