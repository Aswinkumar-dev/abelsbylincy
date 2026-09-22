import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ArrowUpDown, X, ChevronDown } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';

const CATEGORY_LABELS = {
  all: 'All Jewellery',
  'new-arrivals': 'New Arrivals',
  'best-sellers': 'Best Sellers',
  rings: 'Rings', necklaces: 'Necklaces', earrings: 'Earrings',
  bracelets: 'Bracelets', bangles: 'Bangles', charms: 'Charms',
  'silver-collections': 'Silver Collections', 'seasonal-collections': 'Seasonal Collections',
};

export function isProductInCat(p, catId) {
  if (!p) return false;
  const pCat = (p.category || '').toLowerCase().trim();
  const active = (catId || 'all').toLowerCase().trim();

  if (active === 'all') return true;
  if (active === 'new-arrivals') return Boolean(p.newArrival || p.is_new_arrival || p.isNewArrival);
  if (active === 'best-sellers') return Boolean(p.bestSeller || p.is_best_seller || p.isBestSeller);

  // Normalize plural and singular forms to standard slugs
  const normalize = (cat) => {
    const c = (cat || '').toLowerCase().trim();
    if (c === 'rings' || c === 'ring') return 'rings';
    if (c === 'necklaces' || c === 'necklace') return 'necklaces';
    if (c === 'earrings' || c === 'earring') return 'earrings';
    if (c === 'bracelets' || c === 'bracelet') return 'bracelets';
    if (c === 'bangles' || c === 'bangle') return 'bangles';
    if (c === 'charms' || c === 'charm') return 'charms';
    if (c === 'silver-collections' || c === 'silver-collection' || c === 'silver') return 'silver-collections';
    if (c === 'seasonal-collections' || c === 'seasonal-collection' || c === 'seasonal') return 'seasonal-collections';
    return c;
  };

  const normActive = normalize(active);
  const normPCat = normalize(pCat);

  // Exact category match
  if (normPCat && normPCat === normActive) {
    return true;
  }

  // Handle collections and special categories
  if (normActive === 'silver-collections') {
    return normPCat === 'silver-collections' ||
      (p.material && p.material.toLowerCase().includes('silver')) ||
      (Array.isArray(p.tags) && p.tags.some(t => String(t).toLowerCase().includes('silver')));
  }

  if (normActive === 'seasonal-collections') {
    return normPCat === 'seasonal-collections' ||
      (p.collection && p.collection.toLowerCase().includes('seasonal')) ||
      (Array.isArray(p.tags) && p.tags.some(t => String(t).toLowerCase().includes('seasonal')));
  }

  // Fallback check against product tags
  if (Array.isArray(p.tags)) {
    return p.tags.some(t => normalize(t) === normActive);
  }

  return false;
}

export default function ShopPage() {
  const { products } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
  const [maxPrice, setMaxPrice] = useState(500);
  const [currentSort, setCurrentSort] = useState('featured');
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery] = useState(searchParams.get('q') || '');

  useEffect(() => {
    const cat = searchParams.get('category') || 'all';
    setActiveCategory(cat);
  }, [searchParams]);

  const sidebarCategories = [
    { id: 'all', label: 'All Jewellery' },
    { id: 'new-arrivals', label: 'New Arrivals' },
    { id: 'best-sellers', label: 'Best Sellers' },
    { id: 'necklaces', label: 'Necklaces' },
    { id: 'bangles', label: 'Bangles' },
    { id: 'rings', label: 'Rings' },
    { id: 'bracelets', label: 'Bracelets' },
    { id: 'earrings', label: 'Earrings' },
    { id: 'charms', label: 'Charms' },
    { id: 'silver-collections', label: 'Silver Collections' },
    { id: 'seasonal-collections', label: 'Seasonal Collections' },
  ];

  const clearFilters = () => {
    setMaxPrice(500);
    setActiveCategory('all');
    setCurrentSort('featured');
    setSearchParams({});
  };

  const handleCategoryClick = (id) => {
    setActiveCategory(id);
    setSearchParams(id !== 'all' ? { category: id } : {});
  };

  const filteredProducts = products
    .filter(p => isProductInCat(p, activeCategory))
    .filter(p => Number(p.price || 0) <= maxPrice)
    .filter(p => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (p.name || '').toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q);
    })
    .sort((a, b) => {
      switch (currentSort) {
        case 'price-asc': return (Number(a.price) || 0) - (Number(b.price) || 0);
        case 'price-desc': return (Number(b.price) || 0) - (Number(a.price) || 0);
        case 'newest': return (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0);
        case 'name-asc': return (a.name || '').localeCompare(b.name || '');
        default: return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }
    });

  const hasActiveFilters = maxPrice < 500 || activeCategory !== 'all';

  return (
    <>
      {/* Page Hero Header */}
      <div className="page-hero">
        <div className="container">
          <p className="section-subtitle">Curated Fine Jewellery</p>
          <h1>{CATEGORY_LABELS[activeCategory] || 'Shop All'}</h1>
        </div>
      </div>

      {searchQuery && (
        <div className="container" style={{ paddingTop: 16 }}>
          <p style={{ fontSize: 14, color: 'var(--slate)' }}>
            Showing results for: <strong>"{searchQuery}"</strong>
          </p>
        </div>
      )}

      {/* Main Shop Page Layout */}
      <div className="container">
        {/* Mobile Sticky Filter & Sort Bar */}
        <div className="mobile-filter-bar">
          <div className="mobile-filter-inner">
            <button className="mobile-bar-btn" onClick={() => setFilterOpen(true)}>
              <SlidersHorizontal style={{ width: 16, height: 16 }} />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="filter-count-badge">
                  {((maxPrice < 500 ? 1 : 0) + (activeCategory !== 'all' ? 1 : 0))}
                </span>
              )}
            </button>
            <div className="mobile-bar-divider" />
            <div className="mobile-bar-btn" style={{ position: 'relative' }}>
              <ArrowUpDown style={{ width: 16, height: 16, color: 'var(--onyx)' }} />
              <select
                className="sort-select"
                value={currentSort}
                onChange={e => setCurrentSort(e.target.value)}
                style={{ border: 'none', background: 'transparent', padding: 0, fontSize: 13, fontWeight: 600, color: 'var(--onyx)', cursor: 'pointer' }}
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-asc">Price: Low–High</option>
                <option value="price-desc">Price: High–Low</option>
                <option value="newest">Newest First</option>
                <option value="name-asc">Name A–Z</option>
              </select>
            </div>
          </div>
        </div>

        <div className="shop-page-layout">

          {/* Sidebar Filters */}
          <aside className="shop-sidebar">

            {/* Categories */}
            <div className="filter-block">
              <h4 className="filter-title">Categories</h4>
              <ul className="filter-list">
                {sidebarCategories.map(cat => {
                  const count = products.filter(p => isProductInCat(p, cat.id)).length;
                  return (
                    <li
                      key={cat.id}
                      className={`filter-option${activeCategory === cat.id ? ' active' : ''}`}
                      onClick={() => handleCategoryClick(cat.id)}
                    >
                      <span>{cat.label}</span>
                      <span style={{ fontSize: 12, opacity: 0.7 }}>({count})</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Price Slider */}
            <div className="filter-block">
              <h4 className="filter-title">Max Price: ${maxPrice}</h4>
              <input
                type="range"
                min={50}
                max={500}
                step={10}
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                className="price-range-slider"
              />
              <div className="price-slider-values">
                <span>$50</span><span>$500</span>
              </div>
            </div>

            {hasActiveFilters && (
              <button className="btn-secondary" style={{ width: '100%', fontSize: 12, padding: '10px 16px' }} onClick={clearFilters}>
                Clear All Filters <X style={{ width: 13, height: 13, marginLeft: 4 }} />
              </button>
            )}
          </aside>

          {/* Products Column */}
          <main style={{ width: '100%' }}>
            {/* Toolbar */}
            <div className="shop-toolbar">
              <p style={{ fontSize: 14, color: 'var(--slate)' }}>
                Showing <strong>{filteredProducts.length}</strong> piece{filteredProducts.length !== 1 ? 's' : ''}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 13, color: 'var(--slate)' }}>Sort By:</span>
                <select
                  className="sort-select"
                  value={currentSort}
                  onChange={e => setCurrentSort(e.target.value)}
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="name-asc">Name A–Z</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <p style={{ fontSize: 16, color: 'var(--slate)', marginBottom: 20 }}>No products found matching your filters.</p>
                <button className="btn-primary" onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              <div className="bs-grid">
                {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Bottom-Sheet Filter Drawer */}
      {filterOpen && (
        <div className="mobile-drawer-backdrop" onClick={() => setFilterOpen(false)}>
          <div className="mobile-drawer-content" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, margin: 0, fontWeight: 600, color: 'var(--onyx)' }}>Filter & Sort Jewellery</h3>
              <button type="button" onClick={() => setFilterOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate)' }}>
                <X style={{ width: 20, height: 20 }} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Category Dropdown */}
              <div>
                <h4 className="filter-title" style={{ marginBottom: 10 }}>Category</h4>
                <select
                  className="sort-select"
                  value={activeCategory}
                  onChange={e => handleCategoryClick(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', fontSize: 14 }}
                >
                  {sidebarCategories.map(cat => {
                    const count = products.filter(p => isProductInCat(p, cat.id)).length;
                    return (
                      <option key={cat.id} value={cat.id}>{cat.label} ({count})</option>
                    );
                  })}
                </select>
              </div>

              {/* Max Price Slider */}
              <div>
                <h4 className="filter-title" style={{ marginBottom: 10 }}>Max Price: ${maxPrice}</h4>
                <input
                  type="range"
                  min={50}
                  max={500}
                  step={10}
                  value={maxPrice}
                  onChange={e => setMaxPrice(Number(e.target.value))}
                  className="price-range-slider"
                />
                <div className="price-slider-values">
                  <span>$50</span><span>$500</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 12, background: 'var(--cloud-white)' }}>
              {hasActiveFilters && (
                <button className="btn-secondary" style={{ flex: 1, padding: '12px', fontSize: 13 }} onClick={clearFilters}>
                  Clear All
                </button>
              )}
              <button className="btn-primary" style={{ flex: 2, padding: '12px', fontSize: 13 }} onClick={() => setFilterOpen(false)}>
                Show {filteredProducts.length} Piece{filteredProducts.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
