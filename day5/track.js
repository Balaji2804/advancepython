import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingIcon from './Loading';

function Login({ onLogin }) {
  const [error, setError] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [guestMode, setGuestMode] = useState(false);
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
    return <LoadingIcon />;
  }

  if (authenticated) {
    return null;
  }

  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      fontFamily: 'Arial, sans-serif',
      marginLeft: '0'
    },
    backgroundAnimation: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
    },
    shape: {
      position: 'absolute',
      background: 'linear-gradient(45deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
      backdropFilter: 'blur(10px)',
      borderRadius: '15px',
      animation: 'float 20s infinite ease-in-out',
    },
    shape1: {
      width: '200px',
      height: '200px',
      top: '10%',
      left: '10%',
      animationDelay: '0s',
      transform: 'rotate(45deg)',
    },
    shape2: {
      width: '250px',
      height: '250px',
      top: '50%',
      right: '15%',
      animationDelay: '-5s',
      transform: 'rotate(30deg)',
    },
    shape3: {
      width: '150px',
      height: '150px',
      bottom: '20%',
      left: '5%',
      animationDelay: '-10s',
      transform: 'rotate(60deg)',
    },
    loginCard: {
      position: 'relative',
      width: '400px',
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '15px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      padding: '30px',
      textAlign: 'center',
      zIndex: 10,
      animation: 'card-appear 1s ease-out',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      ':hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.15)',
      },
    },
    header: {
      color: '#2c3e50',
      marginBottom: '20px',
      fontSize: '28px',
      fontWeight: '600',
      animation: 'fade-in 0.8s ease-out',
    },
    errorMessage: {
      backgroundColor: '#fff5f5',
      color: '#c53030',
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '20px',
      animation: 'shake 0.5s ease-in-out',
    },
    welcomeText: {
      color: '#4a5568',
      marginBottom: '25px',
      fontSize: '16px',
      lineHeight: '1.6',
      animation: 'fade-in 0.8s ease-out 0.2s both',
    },
    loginButton: {
      backgroundColor: '#2b6cb0',
      color: 'white',
      border: 'none',
      padding: '14px 28px',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      animation: 'fade-in 0.8s ease-out 0.4s both',
      ':hover': {
        backgroundColor: '#2c5282',
        transform: 'translateY(-2px)',
        boxShadow: '0 5px 15px rgba(43, 108, 176, 0.2)',
      },
      ':active': {
        transform: 'translateY(0)',
      },
    },
  };

  const keyframesStyle = `
    @keyframes float {
      0%, 100% {
        transform: translateY(0) rotate(0deg);
      }
      50% {
        transform: translateY(-20px) rotate(5deg);
      }
    }
    @keyframes card-appear {
      0% {
        opacity: 0;
        transform: translateY(20px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes fade-in {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-10px); }
      75% { transform: translateX(10px); }
    }
  `;

  return (
    <>
      <style>{keyframesStyle}</style>
      <div style={styles.container}>
        <div style={styles.backgroundAnimation}>
          <div style={{...styles.shape, ...styles.shape1}}></div>
          <div style={{...styles.shape, ...styles.shape2}}></div>
          <div style={{...styles.shape, ...styles.shape3}}></div>
        </div>

        <div style={styles.loginCard}>
          <div>
            <h1 style={styles.header}>Resiliency Batch Platform</h1>
          </div>

          {error && (
            <div style={styles.errorMessage}>
              <p>{error}</p>
            </div>
          )}

          <div>
            <p style={styles.welcomeText}>
              Welcome! Sign in to access your dashboard
            </p>

            <button
              onClick={handleAzureLogin}
              style={styles.loginButton}
            >
              Sign in with Azure
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
