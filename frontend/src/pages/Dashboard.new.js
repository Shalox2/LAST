import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Shop creation form
  const [shopForm, setShopForm] = useState({
    name: '',
    description: '',
    logo: null
  });

  // Product creation form
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    category: 'other',
    image: null
  });

  const [showShopForm, setShowShopForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch user's shop if seller
        if (user.role === 'seller') {
          try {
            const shopResponse = await axios.get('/api/shops/');
            const userShop = shopResponse.data.results?.find(s => s.owner === user.id) || 
                            shopResponse.data.find(s => s.owner === user.id);
            setShop(userShop);

            if (userShop) {
              // Fetch shop's products
              const productsResponse = await axios.get(`/api/products/?shop=${userShop.id}`);
              setProducts(productsResponse.data.results || productsResponse.data);
            }
          } catch (err) {
            console.error('Error fetching shop data:', err);
            setError('Failed to load shop data');
          }
        }
        setLoading(false);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleShopSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', shopForm.name);
      formData.append('description', shopForm.description);
      if (shopForm.logo) {
        formData.append('logo', shopForm.logo);
      }

      const response = await axios.post('/api/shops/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setShop(response.data);
      setShowShopForm(false);
      setSuccess('Shop created successfully!');
    } catch (err) {
      console.error('Error creating shop:', err);
      setError(err.response?.data?.error || 'Failed to create shop');
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('description', productForm.description);
      formData.append('price', productForm.price);
      formData.append('stock_quantity', productForm.stock_quantity);
      formData.append('category', productForm.category);
      if (productForm.image) {
        formData.append('image', productForm.image);
      }

      const response = await axios.post('/api/products/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
        },
      });

      setProducts([...products, response.data]);
      setShowProductForm(false);
      setSuccess('Product added successfully!');
    } catch (err) {
      console.error('Error creating product:', err);
      setError(err.response?.data?.error || 'Failed to create product');
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="p-2">
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="p-2">
          <h1>Error</h1>
          <p className="error">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="p-2">
        <h1>Dashboard</h1>
        
        {success && <div className="success">{success}</div>}
        
        {!shop ? (
          <div className="no-shop">
            <p>You don't have a shop yet. Would you like to create one?</p>
            <button 
              onClick={() => setShowShopForm(true)}
              className="btn btn-primary"
            >
              Create Shop
            </button>
            
            {showShopForm && (
              <div className="modal">
                <div className="modal-content">
                  <h2>Create New Shop</h2>
                  <form onSubmit={handleShopSubmit}>
                    <div className="form-group">
                      <label>Shop Name</label>
                      <input
                        type="text"
                        value={shopForm.name}
                        onChange={(e) => setShopForm({...shopForm, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        value={shopForm.description}
                        onChange={(e) => setShopForm({...shopForm, description: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Logo</label>
                      <input
                        type="file"
                        onChange={(e) => setShopForm({...shopForm, logo: e.target.files[0]})}
                        accept="image/*"
                      />
                    </div>
                    <div className="form-actions">
                      <button type="button" onClick={() => setShowShopForm(false)}>
                        Cancel
                      </button>
                      <button type="submit">Create Shop</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="shop-info">
            <div className="shop-header">
              {shop.logo && (
                <img 
                  src={shop.logo} 
                  alt={shop.name} 
                  className="shop-logo"
                />
              )}
              <div>
                <h2>{shop.name}</h2>
                <p className="shop-description">{shop.description}</p>
              </div>
            </div>
            
            <div className="shop-status">
              <p>
                <strong>Status:</strong>
                <span className={`status-badge ${shop.verification_status || 'unknown'}`}>
                  {shop.verification_status ? 
                    shop.verification_status.replace(/_/g, ' ').toUpperCase() : 
                    'UNKNOWN'}
                </span>
              </p>
              
              <p>
                <strong>Join Fee:</strong>
                <span className={`fee-status ${shop.joined_fee_paid ? 'paid' : 'unpaid'}`}>
                  {shop.joined_fee_paid ? 'Paid' : 'Not Paid'}
                </span>
              </p>
            </div>

            {user.role === 'seller' && (
              <div className="shop-management">
                <div className="section-header">
                  <h2>Shop Management</h2>
                  <button 
                    onClick={() => setShowProductForm(true)}
                    className="btn btn-primary"
                  >
                    Add Product
                  </button>
                </div>

                {showProductForm && (
                  <div className="modal">
                    <div className="modal-content">
                      <h2>Add New Product</h2>
                      <form onSubmit={handleProductSubmit}>
                        <div className="form-group">
                          <label>Product Name</label>
                          <input
                            type="text"
                            value={productForm.name}
                            onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Description</label>
                          <textarea
                            value={productForm.description}
                            onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                            required
                          />
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Price ($)</label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={productForm.price}
                              onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Stock Quantity</label>
                            <input
                              type="number"
                              min="0"
                              value={productForm.stock_quantity}
                              onChange={(e) => setProductForm({...productForm, stock_quantity: e.target.value})}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Category</label>
                            <select
                              value={productForm.category}
                              onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                            >
                              <option value="electronics">Electronics</option>
                              <option value="clothing">Clothing</option>
                              <option value="books">Books</option>
                              <option value="home">Home & Garden</option>
                              <option value="sports">Sports & Outdoors</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Product Image</label>
                          <input
                            type="file"
                            onChange={(e) => setProductForm({...productForm, image: e.target.files[0]})}
                            accept="image/*"
                          />
                        </div>
                        <div className="form-actions">
                          <button 
                            type="button" 
                            onClick={() => setShowProductForm(false)}
                            className="btn btn-secondary"
                          >
                            Cancel
                          </button>
                          <button type="submit" className="btn btn-primary">
                            Add Product
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                <div className="products-section">
                  <h3>Your Products</h3>
                  {products.length > 0 ? (
                    <div className="products-grid">
                      {products.map(product => (
                        <div key={product.id} className="product-card">
                          {product.image && (
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="product-image"
                            />
                          )}
                          <div className="product-details">
                            <h4>{product.name}</h4>
                            <p className="product-price">${parseFloat(product.price).toFixed(2)}</p>
                            <p className="product-stock">In Stock: {product.stock_quantity}</p>
                            <div className="product-actions">
                              <button className="btn btn-sm btn-edit">Edit</button>
                              <button className="btn btn-sm btn-delete">Delete</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-products">
                      <p>No products yet. Add your first product to get started!</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
