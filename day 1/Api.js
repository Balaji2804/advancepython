import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Import external CSS file

function Login({ onLogin }) {
  const [error, setError] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch('/auth/profile', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          onLogin(data.username);
          setAuthenticated(true);
          navigate('/dashboard');
        } else {
          setAuthenticated(false);
        }
      } catch (err) {
        console.error('Error checking login status:', err);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, [onLogin, navigate]);

  const handleAzureLogin = async () => {
    try {
      setError(null);
      window.location.href = '/auth/signin';
    } catch (err) {
      setError('An error occurred during login. Please try again.');
      console.error('Login error:', err);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (authenticated) {
    return null;
  }

  return (
    <div className="login-container">
      <div className="background-animation">
        <div className="shape shape1"></div>
        <div className="shape shape2"></div>
        <div className="shape shape3"></div>
      </div>

      <div className="login-card">
        <h1 className="header">Resiliency Batch Platform</h1>

        {error && <div className="error-message">{error}</div>}

        <p className="welcome-text">Welcome! Sign in to access your dashboard.</p>
        <button className="login-button" onClick={handleAzureLogin}>
          Sign in with Azure
        </button>
      </div>
    </div>
  );
}

export default Login;

