import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.username, formData.password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="container">
      <form className="form form--auth" onSubmit={handleSubmit}>
        <h2 className="form__title">Login to WeShop</h2>
        
        {error && <div className="error">{error}</div>}
        
        <div className="form__group">
          <label className="form__label">Username</label>
          <input
            type="text"
            name="username"
            className="form__input"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form__group">
          <label className="form__label">Password</label>
          <input
            type="password"
            name="password"
            className="form__input"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button 
          type="submit" 
          className="btn btn--primary btn--full"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="text-center mt-1">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </form>
      </div>
    </div>
  );
};

export default Login;
