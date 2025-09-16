import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerMessage, setBuyerMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({ rating: 5, content: '' });
  const [commentMsg, setCommentMsg] = useState('');

  const fetchProduct = useCallback(async () => {
    try {
      const response = await axios.get(`/api/products/${id}/`);
      setProduct(response.data);
    } catch (err) {
      setError('Failed to fetch product details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchComments = useCallback(async () => {
    try {
      const res = await axios.get(`/api/products/${id}/comments/`);
      const list = Array.isArray(res.data) ? res.data : (res.data.results || []);
      setComments(list);
    } catch (e) {
      // silent
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
    fetchComments();
  }, [fetchProduct, fetchComments]);

  const submitComment = async (e) => {
    e.preventDefault();
    setCommentMsg('');
    try {
      await axios.post(`/api/products/${id}/comments/`, {
        product: parseInt(id),
        rating: newComment.rating,
        content: newComment.content.trim()
      });
      setNewComment({ rating: 5, content: '' });
      setCommentMsg('Review submitted');
      fetchComments();
    } catch (err) {
      setCommentMsg(err.response?.data || 'Failed to submit review');
    }
  };

  const handleOrder = async () => {
    if (!user) {
      setError('Please login to place an order');
      return;
    }

    if (user.role !== 'buyer') {
      setError('Only buyers can place orders');
      return;
    }

    if (!buyerPhone.trim()) {
      setError('Please provide your phone number for seller contact');
      return;
    }

    setOrderLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post('/api/orders/', {
        product: product.id,
        quantity: quantity,
        buyer_phone: buyerPhone.trim(),
        buyer_message: buyerMessage.trim()
      });
      setSuccess('Order placed successfully! The seller will contact you soon.');
      setBuyerPhone('');
      setBuyerMessage('');
      setQuantity(1);
      // Refresh product to update stock
      fetchProduct();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to place order');
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner spinner--lg animate-pulse"></div>
          <p className="text-lg font-medium">Loading product details...</p>
          <div className="mt-4">
            <div className="skeleton skeleton--title"></div>
            <div className="skeleton skeleton--text"></div>
            <div className="skeleton skeleton--text"></div>
            <div className="skeleton skeleton--button"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="container">
        <div className="alert error animate-fadeInUp">
          <span className="text-2xl">⚠️</span>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="p-2">
        <div className="card hover-lift animate-fadeInUp">
          <div className="card__header">
            <h1 className="card__title text-4xl font-bold gradient-text">{product.name}</h1>
            <div className="flex gap-2 mt-2">
              <span className={`badge ${product.is_active ? 'badge--success' : 'badge--danger'}`}>
                {product.is_active ? 'Active' : 'Inactive'}
              </span>
              <span className="badge badge--sky">
                Stock: {product.stock_quantity}
              </span>
              <span className="badge badge--primary">
                ${product.price}
              </span>
            </div>
          </div>
          <div className="card__body">
            <div className="grid grid--2">
              <div className="animate-slideInRight">
                <div className="mb-6">
                  <div className="text-3xl font-bold text-success mb-2">
                    ${product.price}
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">🏪</span>
                    <Link to={`/shops/${product.shop}`} className="text-primary hover-glow">
                      {product.shop_name}
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">👤</span>
                    <span className="font-medium">Seller: {product.shop_owner}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">📦</span>
                    <span className="font-medium">Stock: {product.stock_quantity} available</span>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">📅</span>
                    <span className="text-sm text-tertiary">
                      Added: {new Date(product.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                <h3 className="text-2xl font-bold mb-4">Description</h3>
                <p className="text-lg text-secondary mb-6">{product.description}</p>
                
                {user && user.role === 'buyer' && product.is_active && product.stock_quantity > 0 && (
                  <div className="mt-6 p-6 glass rounded-xl">
                    <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <span className="text-2xl">🛒</span>
                      Place Order
                    </h4>
                    {error && <div className="alert error mb-4">{error}</div>}
                    {success && <div className="alert success mb-4">{success}</div>}
                    
                    <div className="form__group">
                      <label className="form__label">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        max={product.stock_quantity}
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value))}
                        className="form__input focus-ring"
                      />
                    </div>
                    
                    <div className="form__group">
                      <label className="form__label">Your Phone Number *</label>
                      <input
                        type="tel"
                        value={buyerPhone}
                        onChange={(e) => setBuyerPhone(e.target.value)}
                        placeholder="Enter your phone number for seller contact"
                        className="form__input focus-ring"
                        required
                      />
                      <small className="form__help">The seller will use this to contact you about your order</small>
                    </div>
                    
                    <div className="form__group">
                      <label className="form__label">Message (Optional)</label>
                      <textarea
                        value={buyerMessage}
                        onChange={(e) => setBuyerMessage(e.target.value)}
                        placeholder="Any additional message for the seller..."
                        className="form__input focus-ring"
                        rows="3"
                      />
                    </div>
                    
                    <div className="bg-primary-50 p-4 rounded-lg mb-4">
                      <p className="text-xl font-bold text-primary">
                        Total: ${(product.price * quantity).toFixed(2)}
                      </p>
                    </div>
                    
                    <button 
                      onClick={handleOrder}
                      disabled={orderLoading}
                      className="btn btn--success btn--full btn--lg hover-glow"
                    >
                      {orderLoading ? (
                        <>
                          <div className="spinner spinner--sm"></div>
                          Placing Order...
                        </>
                      ) : (
                        <>
                          <span className="text-xl">🚀</span>
                          Place Order
                        </>
                      )}
                    </button>
                  </div>
                )}
                
                {product.stock_quantity === 0 && (
                  <div className="alert warning mt-4">
                    <span className="text-2xl">⚠️</span>
                    Out of Stock
                  </div>
                )}
                
                {!user && (
                  <div className="mt-4 p-4 glass rounded-lg text-center">
                    <p className="text-lg mb-2">Please <Link to="/login" className="text-primary hover-glow">login</Link> to place an order.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Product Reviews */}
          <div className="card hover-lift animate-fadeInUp" style={{ marginTop: '24px', animationDelay: '0.4s' }}>
            <div className="card__header">
              <h3 className="card__title text-2xl font-bold flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                Reviews ({comments.length})
              </h3>
            </div>
            <div className="card__body">
              {comments.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-lg text-secondary">No reviews yet. Be the first to review this product!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((c, index) => (
                    <div key={c.id} className="notification hover-lift animate-fadeInUp" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">👤</span>
                          <span className="font-bold text-lg">{c.user?.username || 'User'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`text-xl ${i < c.rating ? 'text-warning-500' : 'text-gray-300'}`}>
                              ⭐
                            </span>
                          ))}
                          <span className="ml-2 text-sm text-tertiary">{c.rating}/5</span>
                        </div>
                      </div>
                      <div className="text-secondary mb-2">{c.content}</div>
                      <small className="text-tertiary">{new Date(c.created_at).toLocaleString()}</small>
                    </div>
                  ))}
                </div>
              )}

              {user && user.role === 'buyer' && (
                <form onSubmit={submitComment} className="mt-8 p-6 glass rounded-xl">
                  <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="text-2xl">✍️</span>
                    Write a Review
                  </h4>
                  {commentMsg && (
                    <div className={`alert ${/review submitted/i.test(commentMsg) ? 'success' : 'error'} mb-4`}>
                      {typeof commentMsg === 'string' ? commentMsg : JSON.stringify(commentMsg)}
                    </div>
                  )}
                  <div className="form__group">
                    <label className="form__label">Rating</label>
                    <select
                      className="form__input focus-ring"
                      value={newComment.rating}
                      onChange={(e) => setNewComment({ ...newComment, rating: parseInt(e.target.value) })}
                    >
                      {[5,4,3,2,1].map(r => (
                        <option key={r} value={r}>
                          {r} Star{r > 1 ? 's' : ''} - {['Terrible', 'Poor', 'Fair', 'Good', 'Excellent'][5-r]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form__group">
                    <label className="form__label">Your review</label>
                    <textarea
                      className="form__input focus-ring"
                      rows="4"
                      value={newComment.content}
                      onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
                      placeholder="Share your experience with this product..."
                      required
                    />
                  </div>
                  <button className="btn btn--primary hover-glow" type="submit">
                    <span className="text-lg">📝</span>
                    Submit Review
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
