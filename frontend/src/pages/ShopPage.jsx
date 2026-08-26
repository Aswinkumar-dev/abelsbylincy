import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ArrowUpDown, X, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [sortOpen, setSortOpen] = useState(false);
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

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest First' },
    { value: 'name-asc', label: 'Name A–Z' },
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
      if (activeCategory === 'new-arrivals') return p.newArrival;
      if (activeCategory === 'best-sellers') return p.bestSeller;
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
      {/* Page Hero */}
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

      {/* Shop Layout */}
      <div className="container shop-layout">

        {/* Sidebar */}
        <aside className="shop-sidebar">
          {/* Categories */}
          <div className="sidebar-section">
            <h4 className="sidebar-section-title">Categories</h4>
            <ul className="sidebar-category-list">
              {sidebarCategories.map(cat => (
                <li key={cat.id}>
                  <button
                    className={`sidebar-cat-btn${activeCategory === cat.id ? ' active' : ''}`}
                    onClick={() => handleCategoryClick(cat.id)}
                  >
                    {cat.label}
                    <span className="sidebar-cat-count">
                      {cat.id === 'all' ? products.length :
                       cat.id === 'new-arrivals' ? products.filter(p => p.newArrival).length :
                       cat.id === 'best-sellers' ? products.filter(p => p.bestSeller).length :
                       products.filter(p => p.category === cat.id).length}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Materials */}
          <div className="sidebar-section">
            <h4 className="sidebar-section-title">Material</h4>
            {ALL_MATERIALS.map(m => (
              <label key={m} className="filter-checkbox-label">
                <input
                  type="checkbox"
                  className="filter-checkbox"
                  checked={selectedMaterials.includes(m)}
                  onChange={() => toggleMaterial(m)}
                />
                <span>{m}</span>
              </label>
            ))}
          </div>

          {/* Gemstones */}
          <div className="sidebar-section">
            <h4 className="sidebar-section-title">Gemstone</h4>
            {ALL_GEMSTONES.map(g => (
              <label key={g} className="filter-checkbox-label">
                <input
                  type="checkbox"
                  className="filter-checkbox"
                  checked={selectedGemstones.includes(g)}
                  onChange={() => toggleGemstone(g)}
                />
                <span>{g}</span>
              </label>
            ))}
          </div>

          {/* Price Range */}
          <div className="sidebar-section">
            <h4 className="sidebar-section-title">
              Max Price: <span style={{ color: 'var(--gold)', fontWeight: 700 }}>${maxPrice}</span>
            </h4>
            <input
              type="range"
              min={50}
              max={500}
              step={10}
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="price-range-slider"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--slate)' }}>
              <span>$50</span><span>$500</span>
            </div>
          </div>

          {hasActiveFilters && (
            <button className="btn-secondary" style={{ width: '100%', fontSize: 13 }} onClick={clearFilters}>
              Clear All Filters <X style={{ width: 13, height: 13 }} />
            </button>
          )}
        </aside>

        {/* Products Grid */}
        <div className="shop-main">
          {/* Top Bar */}
          <div className="shop-topbar">
            <p className="shop-count">{filteredProducts.length} piece{filteredProducts.length !== 1 ? 's' : ''} found</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Mobile filter */}
              <button className="mobile-filter-btn" onClick={() => setFilterOpen(true)}>
                <SlidersHorizontal style={{ width: 16, height: 16 }} /> Filters
              </button>
              {/* Sort */}
              <div style={{ position: 'relative' }}>
                <button className="sort-btn" onClick={() => setSortOpen(s => !s)}>
                  <ArrowUpDown style={{ width: 14, height: 14 }} />
                  {sortOptions.find(s => s.value === currentSort)?.label}
                  <ChevronDown style={{ width: 13, height: 13 }} />
                </button>
                {sortOpen && (
                  <div className="sort-dropdown">
                    {sortOptions.map(opt => (
                      <button
                        key={opt.value}
                        className={`sort-option${currentSort === opt.value ? ' active' : ''}`}
                        onClick={() => { setCurrentSort(opt.value); setSortOpen(false); }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="shop-empty">
              <p>No products found matching your filters.</p>
              <button className="btn-primary" onClick={clearFilters}>Clear Filters</button>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {filterOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setFilterOpen(false)}>
          <div className="mobile-filter-drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <h3>Filters</h3>
              <button onClick={() => setFilterOpen(false)}><X style={{ width: 20, height: 20 }} /></button>
            </div>
            <div className="drawer-body">
              <div className="sidebar-section">
                <h4 className="sidebar-section-title">Categories</h4>
                {sidebarCategories.map(cat => (
                  <button key={cat.id} className={`sidebar-cat-btn${activeCategory === cat.id ? ' active' : ''}`} onClick={() => { handleCategoryClick(cat.id); setFilterOpen(false); }}>
                    {cat.label}
                  </button>
                ))}
              </div>
              <div className="sidebar-section">
                <h4 className="sidebar-section-title">Material</h4>
                {ALL_MATERIALS.map(m => (
                  <label key={m} className="filter-checkbox-label">
                    <input type="checkbox" className="filter-checkbox" checked={selectedMaterials.includes(m)} onChange={() => toggleMaterial(m)} />
                    <span>{m}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="drawer-footer">
              <button className="btn-primary" style={{ flex: 2 }} onClick={() => setFilterOpen(false)}>Apply Filters</button>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => { clearFilters(); setFilterOpen(false); }}>Clear</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
