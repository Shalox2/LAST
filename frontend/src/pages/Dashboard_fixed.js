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
            console.log('No shop found or error fetching shop');
          }
        }

        // Fetch orders
        const ordersResponse = await axios.get('/api/orders/');
        setOrders(ordersResponse.data.results || ordersResponse.data);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user.role, user.id]);

  const fetchDashboardData = async () => {
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
          console.log('No shop found or error fetching shop');
        }
      }

      // Fetch orders
      const ordersResponse = await axios.get('/api/orders/');
      setOrders(ordersResponse.data.results || ordersResponse.data);
    } catch (err) {
      setError('Failed to load dashboard data');
    }
  };

  const handleCreateShop = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

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
      setShopForm({ name: '', description: '', logo: null });
      setShowShopForm(false);
      setSuccess('Shop created successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create shop');
    }
  };

  const handleJoinPayment = async () => {
    setError('');
    setSuccess('');

    try {
      await axios.post('/api/shops/join-payment/');
      fetchDashboardData();
      setSuccess('Join fee payment successful!');
    } catch (err) {
      setError(err.response?.data?.error || 'Payment failed');
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

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
      setProductForm({
        name: '',
        description: '',
        price: '',
        stock_quantity: '',
        category: 'other',
        image: null
      });
      setShowProductForm(false);
      setSuccess('Product created successfully!');
    } catch (err) {
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

  return (
    <div className="container">
      <div className="p-2">
        <h1>Dashboard</h1>
        
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        
        {/* Debug Info */}
        <div style={{ padding: '10px', backgroundColor: '#f0f0f0', marginBottom: '20px' }}>
          <p><strong>Debug Info:</strong></p>
          <p>User Role: {user?.role || 'Not set'}</p>
          <p>Shop Exists: {shop ? 'Yes' : 'No'}</p>
          {shop && (
            <>
              <p>Shop Name: {shop.name}</p>
              <p>Verification Status: {shop.verification_status}</p>
              <p>Fee Paid: {shop.joined_fee_paid ? 'Yes' : 'No'}</p>
            </>
          )}
        </div>

        {user.role === 'seller' && (
          <div className="mb-2">
            <h2>Shop Management</h2>
            
            {!shop ? (
              <div className="card">
                <div className="card__body">
                  <p>You don't have a shop yet. Create one to start selling!</p>
                  
                  {!showShopForm ? (
                    <button 
                      onClick={() => setShowShopForm(true)}
                      className="btn btn--primary"
                    >
                      Create Shop
                    </button>
                  ) : (
                    <form onSubmit={handleCreateShop} className="form" encType="multipart/form-data">
                      <div className="form__group">
                        <label htmlFor="name">Shop Name</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={shopForm.name}
                          onChange={(e) => {
                            if (e.target.type === 'file') {
                              setShopForm({
                                ...shopForm,
                                [e.target.name]: e.target.files[0]
                              });
                            } else {
                              setShopForm({
                                ...shopForm,
                                [e.target.name]: e.target.value
                              });
                            }
                          }}
                          required
                        />
                      </div>
                      
                      <div className="form__group">
                        <label htmlFor="description">Description</label>
                        <textarea
                          id="description"
                          name="description"
                          value={shopForm.description}
                          onChange={(e) => {
                            setShopForm({
                              ...shopForm,
                              [e.target.name]: e.target.value
                            });
                          }}
                          rows="4"
                        />
                      </div>
                      
                      <div className="form__group">
                        <label htmlFor="logo">Shop Logo/Image</label>
                        <input
                          type="file"
                          id="logo"
                          name="logo"
                          accept="image/*"
                          onChange={(e) => {
                            setShopForm({
                              ...shopForm,
                              [e.target.name]: e.target.files[0]
                            });
                          }}
                        />
                      </div>
                      
                      <button type="submit" className="btn btn--primary">
                        Create Shop
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setShowShopForm(false)}
                        className="btn btn--danger"
                        style={{ marginLeft: '1rem' }}
                      >
                        Cancel
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ) : (
              <div className="card">
                <div className="card__body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    {shop.logo && (
                      <img 
                        src={shop.logo} 
                        alt={`${shop.name} logo`}
                        style={{ 
                          width: '80px', 
                          height: '80px', 
                          borderRadius: '8px', 
                          objectFit: 'cover',
                          border: '2px solid #ddd'
                        }}
                      />
                    )}
                    <div>
                      <h3>{shop.name}</h3>
                      <p>{shop.description}</p>
                    </div>
                  </div>
                  <p><strong>Status:</strong> 
                    <span className={`status status--${shop.verification_status}`}>
                      {shop.verification_status.replace('_', ' ').toUpperCase()}
                    </span>
                  </p>
                  <p><strong>Join Fee:</strong> 
                    <span style={{ 
                      color: shop.joined_fee_paid ? '#27ae60' : '#e74c3c',
                      marginLeft: '0.5rem'
                    }}>
                      {shop.joined_fee_paid ? 'Paid' : 'Not Paid'}
                    </span>
                  </p>
                  
                  {!shop.joined_fee_paid && (
                    <button 
                      onClick={handleJoinPayment}
                      className="btn btn--success mt-1"
                    >
                      Pay Join Fee (Placeholder)
                    </button>
                  )}
                  
                  {shop.joined_fee_paid && shop.verification_status === 'pending' && (
                    <div className="mt-1">
                      <Link 
                        to={`/shops/${shop.id}/documents`}
                        className="btn btn--primary"
                      >
                        Upload Verification Documents
                      </Link>
                    </div>
                  )}
                  
                  {shop.verification_status === 'documents_submitted' && (
                    <div className="mt-1">
                      <p><em>Documents submitted. Awaiting admin review.</em></p>
                    </div>
                  )}
                  
                  {shop.verification_status === 'under_review' && (
                    <div className="mt-1">
                      <p><em>Your shop is under admin review.</em></p>
                    </div>
                  )}
                  
                  {shop.verification_status === 'rejected' && (
                    <div className="mt-1">
                      <p style={{ color: '#e74c3c' }}><em>Shop verification was rejected.</em></p>
                      {shop.rejection_reason && (
                        <p><strong>Reason:</strong> {shop.rejection_reason}</p>
                      )}
                      <Link 
                        to={`/shops/${shop.id}/documents`}
                        className="btn btn--warning"
                      >
                        Resubmit Documents
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {user.role === 'seller' && shop && (
          <div className="mb-2">
            <h2>Product Management</h2>
            
            {shop.verification_status !== 'verified' && (
              <div className="card" style={{ backgroundColor: '#fff3cd', borderColor: '#ffeaa7' }}>
                <div className="card__body">
                  <p><strong>⚠️ Shop Verification Required</strong></p>
                  <p>You need to complete shop verification before you can add products.</p>
                  <p><strong>Current Status:</strong> {shop.verification_status?.replace('_', ' ').toUpperCase()}</p>
                </div>
              </div>
            )}
            
            {shop.verification_status === 'verified' && (
              <div>
                <div className="mb-1">
                  {!showProductForm ? (
                    <button 
                      onClick={() => setShowProductForm(true)}
                      className="btn btn--primary"
                    >
                      Add New Product
                    </button>
                  ) : (
                    <div className="card">
                      <div className="card__body">
                        <h3>Add New Product</h3>
                        <form onSubmit={handleCreateProduct}>
                          <div className="form__group">
                            <label className="form__label">Product Name</label>
                            <input
                              type="text"
                              value={productForm.name}
                              onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                              className="form__input"
                              required
                            />
                          </div>
                          
                          <div className="form__group">
                            <label className="form__label">Description</label>
                            <textarea
                              value={productForm.description}
                              onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                              className="form__input"
                              rows="3"
                            />
                          </div>
                          
                          <div className="form__group">
                            <label className="form__label">Price</label>
                            <input
                              type="number"
                              step="0.01"
                              value={productForm.price}
                              onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                              className="form__input"
                              required
                            />
                          </div>
                          
                          <div className="form__group">
                            <label className="form__label">Stock Quantity</label>
                            <input
                              type="number"
                              value={productForm.stock_quantity}
                              onChange={(e) => setProductForm({...productForm, stock_quantity: e.target.value})}
                              className="form__input"
                              required
                            />
                          </div>
                          
                          <div className="form__group">
                            <label className="form__label">Category</label>
                            <select
                              value={productForm.category}
                              onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                              className="form__input"
                            >
                              <option value="electronics">Electronics</option>
                              <option value="clothing">Clothing</option>
                              <option value="books">Books</option>
                              <option value="home_garden">Home & Garden</option>
                              <option value="sports">Sports</option>
                              <option value="toys">Toys</option>
                              <option value="beauty">Beauty</option>
                              <option value="automotive">Automotive</option>
                              <option value="food">Food</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          
                          <div className="form__group">
                            <label className="form__label">Product Image</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setProductForm({...productForm, image: e.target.files[0]})}
                              className="form__input"
                            />
                          </div>
                          
                          <div className="form__group">
                            <button type="submit" className="btn btn--primary">Add Product</button>
                            <button 
                              type="button" 
                              onClick={() => setShowProductForm(false)}
                              className="btn btn--danger"
                              style={{ marginLeft: '1rem' }}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="products-grid">
                  {products.length > 0 ? (
                    products.map(product => (
                      <div key={product.id} className="card">
                        <div className="card__body">
                          {product.image && (
                            <img 
                              src={product.image} 
                              alt={product.name}
                              style={{ 
                                width: '100%', 
                                height: '200px', 
                                objectFit: 'cover',
                                borderRadius: '4px',
                                marginBottom: '1rem'
                              }}
                            />
                          )}
                          <h4>{product.name}</h4>
                          <p>{product.description}</p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#27ae60' }}>
                              ${product.price}
                            </span>
                            <span className="badge" style={{ backgroundColor: '#3498db', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                              {product.category}
                            </span>
                          </div>
                          <p style={{ marginTop: '0.5rem', color: '#666' }}>
                            Stock: {product.stock_quantity}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No products yet. Add your first product above!</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mb-2">
          <h2>Recent Orders</h2>
          <div className="card">
            <div className="card__body">
              {orders.length > 0 ? (
                <div className="orders-list">
                  {orders.map(order => (
                    <div key={order.id} className="order-item" style={{ borderBottom: '1px solid #eee', padding: '1rem 0' }}>
                      <p><strong>Order #{order.id}</strong></p>
                      <p>Status: {order.status}</p>
                      <p>Total: ${order.total_amount}</p>
                      <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No orders yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
