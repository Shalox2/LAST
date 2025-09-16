import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="container">
      <div className="text-center p-2 animate-fadeInUp">
        <h1 className="text-5xl font-bold gradient-text mb-4 animate-pulse">
          Welcome to WeShop
        </h1>
        <p className="text-xl text-secondary mb-8 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          Your multi-seller marketplace for everything you need
        </p>
        
        {!user ? (
          <div className="mb-8 animate-slideInRight" style={{ animationDelay: '0.4s' }}>
            <Link to="/register" className="btn btn--primary btn--lg hover-glow" style={{ marginRight: '1rem' }}>
              Get Started
            </Link>
            <Link to="/login" className="btn btn--success btn--lg hover-glow">
              Login
            </Link>
          </div>
        ) : (
          <div className="mb-8 animate-slideInRight" style={{ animationDelay: '0.4s' }}>
            <h2 className="text-3xl font-bold mb-4">Welcome back, {user.username}!</h2>
            <Link to="/dashboard" className="btn btn--primary btn--lg hover-glow" style={{ marginRight: '1rem' }}>
              Go to Dashboard
            </Link>
            <Link to="/shops" className="btn btn--success btn--lg hover-glow">
              Browse Shops
            </Link>
          </div>
        )}

        <div className="grid grid--3 mt-8 grid--animated">
          <div className="card hover-lift glass">
            <div className="card__body text-center">
              <div className="text-4xl mb-4 animate-float">🛍️</div>
              <h3 className="text-2xl font-bold mb-4 gradient-text-blue">Browse Shops</h3>
              <p className="text-secondary mb-6">Discover amazing shops from verified sellers</p>
              <Link to="/shops" className="btn btn--primary hover-scale">View Shops</Link>
            </div>
          </div>
          
          <div className="card hover-lift glass">
            <div className="card__body text-center">
              <div className="text-4xl mb-4 animate-float" style={{ animationDelay: '0.5s' }}>🔍</div>
              <h3 className="text-2xl font-bold mb-4 gradient-text-warm">Find Products</h3>
              <p className="text-secondary mb-6">Search through thousands of products</p>
              <Link to="/products" className="btn btn--primary hover-scale">View Products</Link>
            </div>
          </div>
          
          <div className="card hover-lift glass">
            <div className="card__body text-center">
              <div className="text-4xl mb-4 animate-float" style={{ animationDelay: '1s' }}>💼</div>
              <h3 className="text-2xl font-bold mb-4 gradient-text-success">Start Selling</h3>
              <p className="text-secondary mb-6">Join as a seller and create your own shop</p>
              {!user ? (
                <Link to="/register" className="btn btn--success hover-scale">Register</Link>
              ) : user.role === 'seller' ? (
                <Link to="/dashboard" className="btn btn--success hover-scale">Dashboard</Link>
              ) : (
                <p className="text-tertiary">Switch to seller account to start selling</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
