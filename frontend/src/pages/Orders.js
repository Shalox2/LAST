import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders/');
      setOrders(response.data.results || response.data);
    } catch (err) {
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading orders...</p>
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

  const getOrderTitle = () => {
    if (user.role === 'buyer') return 'My Orders';
    if (user.role === 'seller') return 'Orders for My Products';
    return 'All Orders';
  };

  return (
    <div className="container">
      <div className="p-2">
        <h1>{getOrderTitle()}</h1>
        
        {orders.length === 0 ? (
          <div className="text-center p-2">
            <p>No orders found.</p>
            {user.role === 'buyer' && (
              <Link to="/products" className="btn btn--primary">
                Browse Products
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid--2">
            {orders.map(order => (
              <div key={order.id} className="card">
                <div className="card__header">
                  <h3 className="card__title">Order #{order.id}</h3>
                </div>
                <div className="card__body">
                  <p><strong>Product:</strong> 
                    <Link to={`/products/${order.product}`} style={{ marginLeft: '0.5rem' }}>
                      {order.product_name}
                    </Link>
                  </p>
                  <p><strong>Shop:</strong> {order.shop_name}</p>
                  {user.role !== 'buyer' && (
                    <p><strong>Buyer:</strong> {order.buyer_username}</p>
                  )}
                  <p><strong>Quantity:</strong> {order.quantity}</p>
                  <p><strong>Total Price:</strong> ${order.total_price}</p>
                  <p><strong>Status:</strong> 
                    <span style={{ 
                      color: order.status === 'delivered' ? '#27ae60' : 
                            order.status === 'cancelled' ? '#e74c3c' : '#f39c12',
                      marginLeft: '0.5rem',
                      textTransform: 'capitalize'
                    }}>
                      {order.status}
                    </span>
                  </p>
                  <p><small>Ordered: {new Date(order.created_at).toLocaleDateString()}</small></p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
