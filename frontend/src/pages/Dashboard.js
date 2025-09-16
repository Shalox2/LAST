import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
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

        // Fetch orders (only when buyer)
        if (user.role === 'buyer') {
        const ordersResponse = await axios.get('/api/orders/');
        setOrders(ordersResponse.data.results || ordersResponse.data);
        }
        
        // Fetch notifications if seller
        if (user.role === 'seller') {
          try {
            const notificationsResponse = await axios.get('/api/notifications/');
            setNotifications(notificationsResponse.data.results || notificationsResponse.data);
          } catch (err) {
            console.log('No notifications or error fetching notifications');
          }
        }
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
      if (user.role === 'seller') {
        try {
          const shopResponse = await axios.get('/api/shops/');
          const userShop = shopResponse.data.results?.find(s => s.owner === user.id) || 
                          shopResponse.data.find(s => s.owner === user.id);
          setShop(userShop);

          if (userShop) {
            const productsResponse = await axios.get(`/api/products/?shop=${userShop.id}`);
            setProducts(productsResponse.data.results || productsResponse.data);
          }
        } catch (err) {
          console.log('No shop found or error fetching shop');
        }
      }

      if (user.role === 'buyer') {
      const ordersResponse = await axios.get('/api/orders/');
      setOrders(ordersResponse.data.results || ordersResponse.data);
      }
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
        
        {/* Seller view */}
        {user.role === 'seller' && (
          !shop ? (
          <div className="no-shop">
            <p>You don't have a shop yet. Would you like to create one?</p>
              {!showShopForm ? (
                <button onClick={() => setShowShopForm(true)} className="btn btn--primary">Create Shop</button>
              ) : (
                <form onSubmit={handleCreateShop} className="form" encType="multipart/form-data">
                  <div className="form__group">
                    <label className="form__label">Shop Name</label>
                    <input
                      type="text"
                      value={shopForm.name}
                      onChange={(e) => setShopForm({ ...shopForm, name: e.target.value })}
                      className="form__input"
                      required
                    />
                  </div>
                  <div className="form__group">
                    <label className="form__label">Description</label>
                    <textarea
                      value={shopForm.description}
                      onChange={(e) => setShopForm({ ...shopForm, description: e.target.value })}
                      className="form__input"
                      rows="3"
                      required
                    />
                  </div>
                  <div className="form__group">
                    <label className="form__label">Logo (optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setShopForm({ ...shopForm, logo: e.target.files?.[0] || null })}
                      className="form__input"
                    />
                  </div>
                  <div className="form__actions">
                    <button type="submit" className="btn btn--success">Save Shop</button>
                    <button type="button" className="btn btn--secondary" onClick={() => setShowShopForm(false)}>Cancel</button>
                  </div>
                </form>
              )}
          </div>
        ) : (
          <div className="shop-info">
            <div className="shop-header">
              {shop.logo && (
                <img 
                  src={shop.logo} 
                  alt={shop.name} 
                  style={{
                    width: '100px',
                    height: '100px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    marginRight: '20px',
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
              <span className={`status status--${shop.verification_status || 'unknown'}`}>
                {shop.verification_status ? 
                  shop.verification_status.replace(/_/g, ' ').toUpperCase() : 
                  'UNKNOWN'}
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
                <button className="btn btn--primary mb-2" onClick={handleJoinPayment}>Pay Join Fee</button>
              )}

              <div className="shop-management">
                <h2>Shop Management</h2>
                {/* Edit Shop Details */}
                <div className="card mb-2">
                  <div className="card__body">
                    <h3>Edit Shop Details</h3>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                          const form = new FormData();
                          const address = e.currentTarget.elements.namedItem('business_address').value;
                          const phone = e.currentTarget.elements.namedItem('business_phone').value;
                          const email = e.currentTarget.elements.namedItem('business_email').value;
                          const logoFile = e.currentTarget.elements.namedItem('logo').files?.[0];
                          if (address) form.append('business_address', address);
                          if (phone) form.append('business_phone', phone);
                          if (email) form.append('business_email', email);
                          if (logoFile) form.append('logo', logoFile);
                          await axios.post(`/api/shops/${shop.id}/documents/`, form, {
                            headers: { 'Content-Type': 'multipart/form-data' }
                          });
                          // Refresh shop details
                          const refreshed = await axios.get(`/api/shops/${shop.id}/`);
                          setShop(refreshed.data);
                          setSuccess('Shop details updated');
                        } catch (err) {
                          setError(err.response?.data?.error || 'Failed to update shop');
                        }
                      }}
                      encType="multipart/form-data"
                      style={{ marginTop: '8px' }}
                    >
                      <div className="form__group">
                        <label className="form__label">Business Address</label>
                        <input name="business_address" className="form__input" defaultValue={shop.business_address || ''} />
                      </div>
                      <div className="form__group">
                        <label className="form__label">Business Phone</label>
                        <input name="business_phone" className="form__input" defaultValue={shop.business_phone || ''} />
                      </div>
                      <div className="form__group">
                        <label className="form__label">Business Email</label>
                        <input name="business_email" type="email" className="form__input" defaultValue={shop.business_email || ''} />
                      </div>
                      <div className="form__group">
                        <label className="form__label">Logo</label>
                        <input name="logo" type="file" accept="image/*" className="form__input" />
                      </div>
                      <div className="form__actions">
                        <button type="submit" className="btn btn--primary">Save</button>
                      </div>
                    </form>
                  </div>
                </div>
                {/* Notifications Section */}
                {notifications.length > 0 && (
                  <div className="card mb-2">
                    <div className="card__body">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3>📢 Notifications ({notifications.filter(n => !n.is_read).length} unread)</h3>
                        {notifications.some(n => !n.is_read) && (
                          <button
                            onClick={async () => {
                              try {
                                await axios.post('/api/notifications/read-all/');
                                const res = await axios.get('/api/notifications/');
                                setNotifications(res.data.results || res.data);
                              } catch (e) {
                                console.error('Failed to mark all read', e);
                              }
                            }}
                            className="btn btn--secondary"
                          >
                            Mark All Read
                          </button>
                        )}
                      </div>
                      <div className="notifications-list">
                        {notifications.slice(0, 5).map(notification => (
                          <div key={notification.id} className={`notification ${!notification.is_read ? 'unread' : ''}`}>
                            <div className="notification-content">
                              <h5>{notification.title}</h5>
                              <p>{notification.message}</p>
                              {notification.order_info && (
                                <div className="order-info">
                                  <p><strong>Order Details:</strong></p>
                                  <p>Product: {notification.order_info.product_name}</p>
                                  <p>Buyer: {notification.order_info.buyer_username}</p>
                                  <p>Phone: {notification.order_info.buyer_phone}</p>
                                  <p>Quantity: {notification.order_info.quantity}</p>
                                  <p>Total: ${notification.order_info.total_price}</p>
                                  {!notification.is_read && (
                                    <button
                                      onClick={async () => {
                                        try {
                                          await axios.post(`/api/orders/${notification.order_info.id}/fulfill/`);
                                          // Refresh notifications after fulfill
                                          const res = await axios.get('/api/notifications/');
                                          setNotifications(res.data.results || res.data);
                                        } catch (e) {
                                          console.error('Failed to fulfill order', e);
                                        }
                                      }}
                                      className="btn btn--success"
                                      style={{ marginTop: '8px' }}
                                    >
                                      Fulfill & Mark Read
                                    </button>
                                  )}
                                  {!notification.is_read && (
                                    <button
                                      onClick={async () => {
                                        try {
                                          await axios.post(`/api/notifications/${notification.id}/read/`);
                                          const res = await axios.get('/api/notifications/');
                                          setNotifications(res.data.results || res.data);
                                        } catch (e) {
                                          console.error('Failed to mark read', e);
                                        }
                                      }}
                                      className="btn"
                                      style={{ marginTop: '8px', marginLeft: '8px' }}
                                    >
                                      Mark Read
                                    </button>
                                  )}
                                </div>
                              )}
                              <small>{new Date(notification.created_at).toLocaleString()}</small>
                            </div>
                          </div>
                        ))}
                      </div>
                      {notifications.length > 5 && (
                        <p><small>Showing 5 of {notifications.length} notifications</small></p>
                      )}
                    </div>
                  </div>
                )}

                <div className="card">
                  <div className="card__body">
                    <h3>Products</h3>
                    <button onClick={() => setShowProductForm(true)}>Add New Product</button>
                    {showProductForm && (
                      <form onSubmit={handleCreateProduct} className="form" encType="multipart/form-data" style={{marginTop: '1rem'}}>
                        <div className="form__group">
                          <label className="form__label">Name</label>
                          <input className="form__input" value={productForm.name} onChange={(e)=>setProductForm({...productForm, name:e.target.value})} required />
                        </div>
                        <div className="form__group">
                          <label className="form__label">Description</label>
                          <textarea className="form__input" rows="3" value={productForm.description} onChange={(e)=>setProductForm({...productForm, description:e.target.value})} required />
                        </div>
                        <div className="form__group">
                          <label className="form__label">Price</label>
                          <input type="number" step="0.01" className="form__input" value={productForm.price} onChange={(e)=>setProductForm({...productForm, price:e.target.value})} required />
                        </div>
                        <div className="form__group">
                          <label className="form__label">Stock</label>
                          <input type="number" className="form__input" value={productForm.stock_quantity} onChange={(e)=>setProductForm({...productForm, stock_quantity:e.target.value})} required />
                        </div>
                        <div className="form__group">
                          <label className="form__label">Category</label>
                          <select className="form__input" value={productForm.category} onChange={(e)=>setProductForm({...productForm, category:e.target.value})}>
                            <option value="electronics">Electronics</option>
                            <option value="clothing">Clothing</option>
                            <option value="home">Home & Garden</option>
                            <option value="books">Books</option>
                            <option value="sports">Sports</option>
                            <option value="beauty">Beauty</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div className="form__group">
                          <label className="form__label">Image</label>
                          <input type="file" accept="image/*" className="form__input" onChange={(e)=>setProductForm({...productForm, image: e.target.files?.[0] || null})} />
                        </div>
                        <div className="form__actions">
                          <button type="submit" className="btn btn--success">Save Product</button>
                          <button type="button" className="btn btn--secondary" onClick={()=>setShowProductForm(false)}>Cancel</button>
                        </div>
                      </form>
                    )}
                    
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
                            <h4>{product.name}</h4>
                            <p>${product.price}</p>
                            <p>In Stock: {product.stock_quantity}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>No products yet. Add your first product!</p>
                    )}
                  </div>
                </div>
              </div>
          </div>
          )
        )}

        {/* Buyer view */}
        {user.role === 'buyer' && (
          <div className="mb-2">
            <h2>Your Orders</h2>
            {orders.length > 0 ? (
              <div className="orders-list">
                {orders.map(order => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <h4>Order #{order.id}</h4>
                      <span className={`status status--${order.status}`}>{order.status}</span>
                      </div>
                    <div className="order-details">
                      <p><strong>Total:</strong> ${order.total_price}</p>
                      <p><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
                      <p><strong>Items:</strong> {order.items?.length || 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No orders yet. Start shopping!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;