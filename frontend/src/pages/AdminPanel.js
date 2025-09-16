import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const AdminPanel = () => {
  const { user } = useAuth();
  const [shops, setShops] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verifying, setVerifying] = useState(null);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  const fetchAdminData = async () => {
    try {
      const [shopsResponse, ordersResponse] = await Promise.all([
        axios.get('/api/shops/'),
        axios.get('/api/orders/')
      ]);
      
      setShops(shopsResponse.data.results || shopsResponse.data);
      setOrders(ordersResponse.data.results || ordersResponse.data);
    } catch (err) {
      setError('Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyShop = async (shopId, status) => {
    setVerifying(shopId);
    const rejectionReason = status === 'rejected' ? 
      prompt('Please provide a reason for rejection:') : '';
    
    if (status === 'rejected' && !rejectionReason) {
      setVerifying(null);
      return;
    }

    try {
      await axios.post(`/api/shops/${shopId}/verify/`, {
        verification_status: status,
        rejection_reason: rejectionReason,
        verification_notes: status === 'verified' ? 'Shop approved by admin' : rejectionReason
      });
      fetchAdminData();
      setSuccess(`Shop ${status} successfully!`);
    } catch (error) {
      console.error('Error updating shop verification:', error);
      setError('Failed to update shop verification');
    } finally {
      setVerifying(null);
    }
  };

  const getStatusBadge = (shop) => {
    if (shop.is_verified) {
      return <span style={{ color: '#27ae60', fontWeight: 'bold' }}>✓ Verified</span>;
    } else if (shop.joined_fee_paid) {
      return <span style={{ color: '#f39c12', fontWeight: 'bold' }}>⏳ Pending Verification</span>;
    } else {
      return <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>❌ Fee Not Paid</span>;
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="p-2">
        <h1>Admin Panel</h1>
        
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        {/* Shop Verification Section */}
        <div className="mb-2">
          <h2>Shop Verification</h2>
          
          {shops.length === 0 ? (
            <p>No shops found.</p>
          ) : (
            <div className="grid grid--2">
              {shops.map(shop => (
                <div key={shop.id} className="card">
                  <div className="card__header">
                    <h3 className="card__title">{shop.name}</h3>
                  </div>
                  <div className="card__body">
                    <p><strong>Owner:</strong> {shop.owner_username}</p>
                    <p><strong>Status:</strong> {getStatusBadge(shop)}</p>
                    <p><strong>Join Fee:</strong> 
                      <span style={{ 
                        color: shop.joined_fee_paid ? '#27ae60' : '#e74c3c',
                        marginLeft: '0.5rem'
                      }}>
                        {shop.joined_fee_paid ? 'Paid' : 'Not Paid'}
                      </span>
                    </p>
                    {shop.description && <p><strong>Description:</strong> {shop.description}</p>}
                    <p><small>Created: {new Date(shop.created_at).toLocaleDateString()}</small></p>
                  </div>
                  <div className="card__footer">
                    {shop.verification_status === 'documents_submitted' ? (
                      <div className="verification-actions">
                        <button 
                          onClick={() => handleVerifyShop(shop.id, 'verified')}
                          className="btn btn-success"
                          disabled={verifying === shop.id}
                        >
                          {verifying === shop.id ? 'Processing...' : 'Approve'}
                        </button>
                        <button 
                          onClick={() => handleVerifyShop(shop.id, 'rejected')}
                          className="btn btn-danger"
                          disabled={verifying === shop.id}
                          style={{ marginLeft: '0.5rem' }}
                        >
                          Reject
                        </button>
                      </div>
                    ) : shop.verification_status === 'verified' ? (
                      <span style={{ color: '#27ae60', fontWeight: 'bold' }}>✓ Verified</span>
                    ) : shop.verification_status === 'rejected' ? (
                      <span style={{ color: '#dc3545', fontWeight: 'bold' }}>❌ Rejected</span>
                    ) : (
                      <span style={{ color: '#6c757d' }}>Waiting for documents</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Orders Overview Section */}
        <div className="mb-2">
          <h2>Orders Overview</h2>
          
          {orders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            <div>
              <div className="mb-1">
                <p><strong>Total Orders:</strong> {orders.length}</p>
                <p><strong>Pending Orders:</strong> {orders.filter(o => o.status === 'pending').length}</p>
                <p><strong>Delivered Orders:</strong> {orders.filter(o => o.status === 'delivered').length}</p>
              </div>
              
              <div className="grid grid--2">
                {orders.slice(0, 10).map(order => (
                  <div key={order.id} className="card">
                    <div className="card__header">
                      <h4 className="card__title">Order #{order.id}</h4>
                    </div>
                    <div className="card__body">
                      <p><strong>Product:</strong> {order.product_name}</p>
                      <p><strong>Shop:</strong> {order.shop_name}</p>
                      <p><strong>Buyer:</strong> {order.buyer_username}</p>
                      <p><strong>Quantity:</strong> {order.quantity}</p>
                      <p><strong>Total:</strong> ${order.total_price}</p>
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
              
              {orders.length > 10 && (
                <p className="text-center mt-1">
                  <em>Showing first 10 orders. Total: {orders.length}</em>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Statistics Section */}
        <div className="mb-2">
          <h2>Platform Statistics</h2>
          <div className="grid grid--3">
            <div className="card">
              <div className="card__body text-center">
                <h3>{shops.length}</h3>
                <p>Total Shops</p>
              </div>
            </div>
            <div className="card">
              <div className="card__body text-center">
                <h3>{shops.filter(s => s.is_verified).length}</h3>
                <p>Verified Shops</p>
              </div>
            </div>
            <div className="card">
              <div className="card__body text-center">
                <h3>{shops.filter(s => s.joined_fee_paid && !s.is_verified).length}</h3>
                <p>Pending Verification</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
