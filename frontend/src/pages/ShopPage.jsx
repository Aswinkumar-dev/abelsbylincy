import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ArrowUpDown, X, ChevronDown } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';

const ALL_MATERIALS = ['18K Gold Plated', '22K Gold Plated', 'Rose Gold Plated', 'Sterling Silver'];
const ALL_GEMSTONES = ['Cubic Zirconia', 'Pearl', 'Diamond CZ', 'Freshwater Pearl', 'None'];
const CATEGORY_LABELS = {
  all: 'All Jewellery',
  'new-arrivals': 'New Arrivals',
  'best-sellers': 'Best Sellers',
  rings: 'Rings', necklaces: 'Necklaces', earrings: 'Earrings',
  bracelets: 'Bracelets', bangles: 'Bangles', charms: 'Charms',
  'silver-collections': 'Silver Collections', 'seasonal-collections': 'Seasonal Collections',
};

export default function ShopPage() {
  const { products } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedGemstones, setSelectedGemstones] = useState([]);
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

  const toggleMaterial = (m) => setSelectedMaterials(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  const toggleGemstone = (g) => setSelectedGemstones(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);

  const clearFilters = () => {
    setSelectedMaterials([]);
    setSelectedGemstones([]);
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
    .filter(p => {
      if (activeCategory === 'all') return true;
      if (activeCategory === 'new-arrivals') return Boolean(p.newArrival);
      if (activeCategory === 'best-sellers') return Boolean(p.bestSeller);
      if (activeCategory === 'silver-collections') return p.material?.toLowerCase().includes('silver');
      if (activeCategory === 'seasonal-collections') return p.tags?.includes('seasonal');
      return p.category === activeCategory;
    })
    .filter(p => selectedMaterials.length === 0 || selectedMaterials.includes(p.material))
    .filter(p => selectedGemstones.length === 0 || selectedGemstones.includes(p.gemstone))
    .filter(p => p.price <= maxPrice)
    .filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      switch (currentSort) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'newest': return (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0);
        case 'name-asc': return a.name.localeCompare(b.name);
        default: return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }
    });

  const hasActiveFilters = selectedMaterials.length > 0 || selectedGemstones.length > 0 || maxPrice < 500 || activeCategory !== 'all';

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
                  {(selectedMaterials.length + selectedGemstones.length + (maxPrice < 500 ? 1 : 0) + (activeCategory !== 'all' ? 1 : 0))}
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
                  const count = cat.id === 'all' ? products.length :
                                cat.id === 'new-arrivals' ? products.filter(p => p.newArrival).length :
                                cat.id === 'best-sellers' ? products.filter(p => p.bestSeller).length :
                                products.filter(p => p.category === cat.id).length;
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

            {/* Material */}
            <div className="filter-block">
              <h4 className="filter-title">Material</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {ALL_MATERIALS.map(m => (
                  <label key={m} className="filter-checkbox-label">
                    <input
                      type="checkbox"
                      className="filter-checkbox"
                      checked={selectedMaterials.includes(m)}
                      onChange={() => toggleMaterial(m)}
                    />
                    <span style={{ fontSize: 13, color: 'var(--slate)' }}>{m}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Gemstone */}
            <div className="filter-block">
              <h4 className="filter-title">Gemstone</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {ALL_GEMSTONES.map(g => (
                  <label key={g} className="filter-checkbox-label">
                    <input
                      type="checkbox"
                      className="filter-checkbox"
                      checked={selectedGemstones.includes(g)}
                      onChange={() => toggleGemstone(g)}
                    />
                    <span style={{ fontSize: 13, color: 'var(--slate)' }}>{g}</span>
                  </label>
                ))}
              </div>
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
                  {sidebarCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Material Checkboxes */}
              <div>
                <h4 className="filter-title" style={{ marginBottom: 10 }}>Material</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {ALL_MATERIALS.map(m => (
                    <label key={m} className="filter-checkbox-label" style={{ fontSize: 13 }}>
                      <input
                        type="checkbox"
                        className="filter-checkbox"
                        checked={selectedMaterials.includes(m)}
                        onChange={() => toggleMaterial(m)}
                      />
                      <span style={{ color: 'var(--onyx)' }}>{m}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Gemstone Checkboxes */}
              <div>
                <h4 className="filter-title" style={{ marginBottom: 10 }}>Gemstone</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {ALL_GEMSTONES.map(g => (
                    <label key={g} className="filter-checkbox-label" style={{ fontSize: 13 }}>
                      <input
                        type="checkbox"
                        className="filter-checkbox"
                        checked={selectedGemstones.includes(g)}
                        onChange={() => toggleGemstone(g)}
                      />
                      <span style={{ color: 'var(--onyx)' }}>{g}</span>
                    </label>
                  ))}
                </div>
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
