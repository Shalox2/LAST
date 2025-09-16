import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Fashion & Clothing' },
    { value: 'books', label: 'Books' },
    { value: 'home_garden', label: 'Home & Garden' },
    { value: 'sports', label: 'Sports' },
    { value: 'toys', label: 'Toys' },
    { value: 'beauty', label: 'Health & Beauty' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'food', label: 'Food' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products/');
      setProducts(response.data.results || response.data);
    } catch (err) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const generateStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} style={{ color: '#ffd700' }}>★</span>);
    }
    if (hasHalfStar) {
      stars.push(<span key="half" style={{ color: '#ffd700' }}>☆</span>);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<span key={i} style={{ color: '#ddd' }}>★</span>);
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading products...</p>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>Showing {filteredProducts.length} products</h1>
          <button style={{ 
            background: 'none', 
            border: '1px solid #ddd', 
            padding: '8px 16px', 
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>⚙</span> More Filters
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Search products..."
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
        </div>
      </div>
      
      {filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>No products found matching your criteria.</p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '24px' 
        }}>
          {filteredProducts.map(product => (
            <div key={product.id} style={{
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
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name}
                    style={{ 
                      width: '100%', 
                      height: '200px', 
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '200px',
                    backgroundColor: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#999'
                  }}>
                    No Image
                  </div>
                )}
                
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  HOT
                </div>
                
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}>
                  ♡
                </div>
              </div>
              
              <div style={{ padding: '16px' }}>
                <h3 style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: '16px', 
                  fontWeight: '600',
                  color: '#333',
                  lineHeight: '1.4'
                }}>
                  {product.name}
                </h3>
                
                <p style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: '14px', 
                  color: '#666',
                  fontWeight: '500'
                }}>
                  {product.shop_name || 'Unknown Shop'}
                </p>
                
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {generateStars(4.5)}
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>
                    4.5
                  </span>
                  <span style={{ fontSize: '12px', color: '#999' }}>
                    (124)
                  </span>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <div>
                    <span style={{ 
                      fontSize: '18px', 
                      fontWeight: '700', 
                      color: '#2c3e50'
                    }}>
                      ${product.price}
                    </span>
                    <span style={{ 
                      fontSize: '14px', 
                      color: '#999', 
                      textDecoration: 'line-through',
                      marginLeft: '8px'
                    }}>
                      ${(parseFloat(product.price) * 1.2).toFixed(2)}
                    </span>
                  </div>
                  <span style={{
                    backgroundColor: categories.find(c => c.value === product.category)?.value === 'electronics' ? '#3498db' : 
                                   categories.find(c => c.value === product.category)?.value === 'clothing' ? '#e74c3c' : '#27ae60',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {categories.find(c => c.value === product.category)?.label || product.category}
                  </span>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link 
                    to={`/products/${product.id}`}
                    style={{
                      flex: 1,
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      color: '#333',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      textAlign: 'center',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f8f9fa';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'white';
                    }}
                  >
                    View Details
                  </Link>
                  <button style={{
                    flex: 1,
                    backgroundColor: '#3498db',
                    border: 'none',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#2980b9';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#3498db';
                  }}>
                    🛒
                  </button>
                </div>
                
                <p style={{ 
                  margin: '8px 0 0 0', 
                  fontSize: '12px', 
                  color: '#27ae60',
                  fontWeight: '500'
                }}>
                  {product.stock_quantity} in stock
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
