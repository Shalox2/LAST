import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Shops = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'handmade', label: 'Handmade & Crafts' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'fashion', label: 'Fashion & Clothing' },
    { value: 'home', label: 'Home & Garden' },
    { value: 'beauty', label: 'Health & Beauty' },
    { value: 'sports', label: 'Sports' },
    { value: 'books', label: 'Books' },
    { value: 'food', label: 'Food & Beverages' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const response = await axios.get('/api/shops/');
      setShops(response.data.results || response.data);
    } catch (err) {
      setError('Failed to fetch shops');
    } finally {
      setLoading(false);
    }
  };

  const filteredShops = shops.filter(shop => {
    const matchesSearch = shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shop.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const generateStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} style={{ color: '#ffd700' }}>★</span>);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<span key={i} style={{ color: '#ddd' }}>★</span>);
    }
    return stars;
  };

  const getShopHeroImage = (shopName) => {
    // Generate different hero images based on shop type
    const shopType = shopName.toLowerCase();
    if (shopType.includes('craft') || shopType.includes('handmade') || shopType.includes('artisan')) {
      return 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400&h=200&fit=crop';
    } else if (shopType.includes('tech') || shopType.includes('electronic')) {
      return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=200&fit=crop';
    } else if (shopType.includes('fashion') || shopType.includes('clothing')) {
      return 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=200&fit=crop';
    }
    return 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop';
  };

  const getShopCategory = (shopName) => {
    const name = shopName.toLowerCase();
    if (name.includes('craft') || name.includes('handmade') || name.includes('artisan')) return 'Handmade & Crafts';
    if (name.includes('tech') || name.includes('electronic')) return 'Electronics';
    if (name.includes('fashion') || name.includes('clothing')) return 'Fashion & Clothing';
    return 'General Store';
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading shops...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Search shops by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px',
              minWidth: '200px'
            }}
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          <button style={{
            padding: '12px 20px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            Sort
          </button>
        </div>
      </div>
      
      {filteredShops.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>No shops found matching your criteria.</p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
          gap: '24px' 
        }}>
          {filteredShops.map(shop => (
            <div key={shop.id} style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            }}>
              
              <div style={{ position: 'relative' }}>
                <img 
                  src={getShopHeroImage(shop.name)} 
                  alt={shop.name}
                  style={{ 
                    width: '100%', 
                    height: '180px', 
                    objectFit: 'cover'
                  }}
                />
                
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  backgroundColor: getShopCategory(shop.name) === 'Handmade & Crafts' ? '#8e44ad' :
                                 getShopCategory(shop.name) === 'Electronics' ? '#3498db' : '#e74c3c',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {getShopCategory(shop.name)}
                </div>
              </div>
              
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  {shop.logo && (
                    <img 
                      src={shop.logo} 
                      alt={`${shop.name} logo`}
                      style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%', 
                        objectFit: 'cover',
                        border: '2px solid #fff',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    />
                  )}
                  <div>
                    <h3 style={{ 
                      margin: '0', 
                      fontSize: '18px', 
                      fontWeight: '700',
                      color: '#2c3e50'
                    }}>
                      {shop.name}
                    </h3>
                  </div>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <span style={{ fontSize: '12px', color: '#7f8c8d' }}>📍</span>
                  <span style={{ fontSize: '14px', color: '#7f8c8d' }}>
                    {shop.business_address || 'Location not specified'}
                  </span>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {generateStars(4.8)}
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>
                    4.8
                  </span>
                  <span style={{ fontSize: '12px', color: '#999' }}>
                    (124)
                  </span>
                </div>
                
                <p style={{ 
                  margin: '0 0 16px 0', 
                  fontSize: '14px', 
                  color: '#666',
                  lineHeight: '1.4',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {shop.description || 'Handmade jewelry, pottery, and home decor items crafted with love and attention to detail.'}
                </p>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <span style={{ fontSize: '14px', color: '#7f8c8d' }}>
                    45 products
                  </span>
                  <span style={{
                    backgroundColor: shop.is_verified ? '#27ae60' : '#e74c3c',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {shop.is_verified ? '✓ Verified' : 'Not Verified'}
                  </span>
                </div>
                
                <Link 
                  to={`/shops/${shop.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    backgroundColor: '#3498db',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#2980b9';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#3498db';
                  }}
                >
                  <span>🏪</span> Visit Shop
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Shops;
