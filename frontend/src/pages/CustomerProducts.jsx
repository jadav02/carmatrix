// ==========================================
// Customer Storefront Product Catalog Page
// ==========================================
import React, { useState, useEffect } from 'react';
import { getVehicles } from '../api/vehicles';
import { useCart } from '../context/CartContext';
import { formatINR } from '../utils/formatters';
import { 
  Search, 
  Filter, 
  Car, 
  ShoppingBag, 
  CheckCircle, 
  RefreshCw, 
  ArrowUpDown,
  Sparkles,
  Layers
} from 'lucide-react';
import './CustomerProducts.css';

const CATEGORIES = ['All', 'Sedan', 'SUV', 'Truck', 'Coupe', 'Electric', 'Hybrid', 'Convertible', 'Wagon', 'Van'];

export default function CustomerProducts() {
  const { addToCart } = useCart();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default'); // 'default' | 'price_asc' | 'price_desc'
  const [toastMessage, setToastMessage] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getVehicles({ in_stock_only: true });
      setVehicles(data || []);
    } catch (err) {
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddToCart = (v) => {
    addToCart(v, 1);
    setToastMessage(`Added ${v.make} ${v.model} to your cart!`);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Filter & Sort logic
  const filteredVehicles = vehicles
    .filter(v => {
      const matchSearch = `${v.make} ${v.model}`.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === 'All' || v.category === category;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      return 0;
    });

  return (
    <div className="customer-storefront">
      {/* Banner */}
      <div className="store-banner glass-panel">
        <div className="banner-content">
          <div className="welcome-tag">
            <Sparkles size={16} />
            <span>CarMatrix Showroom</span>
          </div>
          <h1>Explore Premium <span className="gradient-text">Dealership Vehicles</span></h1>
          <p>Find your ideal car, add it to your shopping cart, and complete your purchase online.</p>
        </div>
      </div>

      {toastMessage && (
        <div className="alert alert-success">
          <CheckCircle size={18} style={{ flexShrink: 0 }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Controls Bar */}
      <div className="controls-bar glass-panel">
        <div className="search-box">
          <input
            type="text"
            className="form-input"
            placeholder="Search car make or model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="input-icon" size={18} />
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <Filter size={16} className="text-muted" />
            <select
              className="form-input select-input filter-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <ArrowUpDown size={16} className="text-muted" />
            <select
              className="form-input select-input filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">Sort by Default</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          <button className="btn btn-secondary icon-only-btn" onClick={fetchProducts} title="Refresh Showroom">
            <RefreshCw size={18} className={loading ? 'spin-icon' : ''} />
          </button>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="table-loading" style={{ padding: '3rem 0' }}>
          <div className="spinner" style={{ width: '40px', height: '40px' }} />
          <p>Loading available vehicles...</p>
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="table-empty glass-panel" style={{ padding: '3rem' }}>
          <Car size={56} className="empty-icon" />
          <h3>No Vehicles Match Your Search</h3>
          <p>Try adjusting your search query, category, or price sorting filters.</p>
        </div>
      ) : (
        <div className="product-grid">
          {filteredVehicles.map(v => (
            <div key={v.id} className="product-card glass-panel">
              <div className="product-badge">
                <Layers size={14} />
                <span>{v.category}</span>
              </div>

              <div className="product-image-container">
                <Car size={64} className="car-avatar" />
              </div>

              <div className="product-details">
                <h3 className="product-title">{v.make} {v.model}</h3>
                <div className="product-price">{formatINR(v.price)}</div>
                
                <div className="product-stock">
                  <span className={`stock-badge ${v.quantity === 0 ? 'out' : v.quantity <= 3 ? 'low' : 'good'}`}>
                    {v.quantity === 0 ? 'Out of Stock' : `${v.quantity} Units Available`}
                  </span>
                </div>

                <button
                  className="btn btn-primary btn-full add-cart-btn"
                  onClick={() => handleAddToCart(v)}
                  disabled={v.quantity === 0}
                >
                  <ShoppingBag size={18} />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
