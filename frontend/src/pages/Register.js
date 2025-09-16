import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    role: 'buyer'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
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
    setErrors({});

    const result = await register(formData);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrors(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="container">
      <form className="form form--auth" onSubmit={handleSubmit}>
        <h2 className="form__title">Register for WeShop</h2>
        
        {errors.non_field_errors && (
          <div className="error">{errors.non_field_errors[0]}</div>
        )}
        
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
          {errors.username && <div className="error">{errors.username[0]}</div>}
        </div>

        <div className="form__group">
          <label className="form__label">Email</label>
          <input
            type="email"
            name="email"
            className="form__input"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <div className="error">{errors.email[0]}</div>}
        </div>

        <div className="form__group">
          <label className="form__label">Role</label>
          <select
            name="role"
            className="form__select"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
          </select>
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
          {errors.password && <div className="error">{errors.password[0]}</div>}
        </div>

        <div className="form__group">
          <label className="form__label">Confirm Password</label>
          <input
            type="password"
            name="password_confirm"
            className="form__input"
            value={formData.password_confirm}
            onChange={handleChange}
            required
          />
          {errors.password_confirm && <div className="error">{errors.password_confirm[0]}</div>}
        </div>

        <button 
          type="submit" 
          className="btn btn--primary btn--full"
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>

        <p className="text-center mt-1">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </form>
      </div>
    </div>
  );
};

export default Register;
