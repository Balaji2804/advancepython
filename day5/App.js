//import React, { useState, useEffect } from 'react';
//import { BrowserRouter as Router, Route, Routes, NavLink, Navigate, useNavigate } from 'react-router-dom';
//import Dashboard from './components/Dashboard';
//import Login from './components/Login';
//import Onboard from './components/Onboard';
//import PlatformView from './components/PlatformView';
//import { CacheProvider } from './components/CacheProvider';
//import LoadingIcon from './components/Loading';
//import SideNavBar from './components/SideNavBar';
//import { getCacheData } from './api';
//
//// Centralized API function for logout
//const logoutUser = async () => {
//  try {
//    const response = await fetch('/auth/logout', {
//      method: 'GET',
//      credentials: 'include', // Important for handling cookies
//      headers: {
//        'Content-Type': 'application/json',
//      },
//    });
//
//    if (response.ok) {
//      return true; // Successful logout
//    } else {
//      console.error('Logout failed');
//      return false;
//    }
//  } catch (error) {
//    console.error('Logout error:', error);
//    return false;
//  }
//};
//
//function App() {
//  const [isLoggedIn, setIsLoggedIn] = useState(false);
//  const [username, setUsername] = useState('');
//  const [loading, setLoading] = useState(true);
//
//  useEffect(() => {
//    // Simulate an async operation like fetching user data
//    setTimeout(() => {
//      setLoading(false);
//    }, 2000); // Adjust the timeout as needed
//  }, []);
//
////  const handleLogin = (user) => {
////    setIsLoggedIn(true);
////    setUsername(user);
////  };
//
//const handleLogin = async (user) => {
//  setIsLoggedIn(true);
//  setUsername(user);
////  try {
////    const response = await getCacheData();
////    updateCache(response.data); // Update the cache with the fetched data
////  } catch (error) {
////    console.error('Error updating cache during login:', error);
////  }
//};
//
//  const handleLogout = async () => {
//    try {
//      const logoutResult = await logoutUser();
//      if (logoutResult) {
//        setIsLoggedIn(false);
//        setUsername('');
//      }
//    } catch (err) {
//      console.error('Logout process error:', err);
//    }
//  };
//
//  const styles = {
//    appContainer: {
//      fontFamily: 'Arial, sans-serif',
//      margin: 0,
//      padding: 0,
//      height: '100vh',
//      display: 'flex',
//      flexDirection: 'column',
//      background: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)',
//      position: 'relative',
//      overflow: 'hidden',
//    },
//    backgroundAnimation: {
//      position: 'fixed',
//      top: 0,
//      left: 0,
//      width: '100%',
//      height: '100%',
//      zIndex: 0,
//      overflow: 'hidden',
//    },
//    animatedCircle: {
//      position: 'absolute',
//      borderRadius: '50%',
//      background: 'rgba(255, 255, 255, 0.1)',
//      animation: 'float-circle 15s infinite alternate',
//    },
//    animatedSquare: {
//      position: 'absolute',
//      background: 'rgba(255, 255, 255, 0.1)',
//      animation: 'float-square 20s infinite alternate',
//    },
//    navbar: {
//      display: 'flex',
//      justifyContent: 'space-between',
//      alignItems: 'center',
//      padding: '15px 30px',
//      background: 'rgba(0, 0, 0, 0.7)',
//      backdropFilter: 'blur(10px)',
//      zIndex: 10,
//      position: 'relative',
//    },
//    navbarBrand: {
//      color: 'white',
//      fontSize: '24px',
//      fontWeight: 'bold',
//    },
//    navList: {
//      display: 'flex',
//      listStyle: 'none',
//      margin: 0,
//      padding: 0,
//    },
//    navItem: {
//      margin: '0 15px',
//    },
//    navLink: {
//      color: 'white',
//      textDecoration: 'none',
//      transition: 'color 0.3s ease',
//      padding: '10px 15px',
//      borderRadius: '5px',
//      cursor: 'pointer',
//    },
//    logoutButton: {
//      background: 'none',
//      border: 'none',
//      color: 'white',
//      cursor: 'pointer',
//      padding: '10px 15px',
//    },
//    activeNavLink: {
//      background: 'rgba(255, 255, 255, 0.2)',
//    },
//    contentContainer: {
//      flex: 1,
//      zIndex: 1,
//      position: 'relative',
//      overflow: 'auto',
//      padding: '20px',
//    },
//  };
//
//  const updatedStyles = {
//  ...styles,
//  contentContainer: {
//    ...styles.contentContainer,
//    marginLeft: '60px', // Width of collapsed sidebar
//    transition: 'margin-left 0.3s ease',
//  },
//};
//
//  const keyframesStyle = `
//    @keyframes float-circle {
//      0% {
//        transform: translateY(0) rotate(0deg);
//      }
//      100% {
//        transform: translateY(-50px) rotate(360deg);
//      }
//    }
//    @keyframes float-square {
//      0% {
//        transform: translateY(0) rotate(0deg);
//      }
//      100% {
//        transform: translateY(-30px) rotate(45deg);
//      }
//    }
//  `;
//
//  const renderBackgroundShapes = () => {
//    const shapes = [
//      { type: 'circle', top: '10%', left: '10%', size: 200, delay: '-2s' },
//      { type: 'circle', top: '50%', right: '15%', size: 300, delay: '-4s' },
//      { type: 'circle', bottom: '20%', left: '5%', size: 150, delay: '-6s' },
//      { type: 'circle', bottom: '10%', right: '5%', size: 250, delay: '-8s' },
//      { type: 'circle', top: '30%', left: '50%', size: 180, delay: '-10s' },
//      { type: 'square', top: '20%', left: '20%', size: 100, delay: '-12s' },
//      { type: 'square', bottom: '30%', right: '10%', size: 150, delay: '-14s' },
//    ];
//
//    return shapes.map((shape, index) => (
//      <div
//        key={index}
//        style={{
//          ...styles[shape.type === 'circle' ? 'animatedCircle' : 'animatedSquare'],
//          width: shape.size,
//          height: shape.size,
//          top: shape.top,
//          left: shape.left,
//          right: shape.right,
//          bottom: shape.bottom,
//          animationDelay: shape.delay,
//        }}
//      />
//    ));
//  };
//
//  if (loading) {
//    return <LoadingIcon />;
//  }
//
//  return (
//    <>
//      <style>{keyframesStyle}</style>
//      <CacheProvider>
//        <Router>
//          <AppContent
//            isLoggedIn={isLoggedIn}
//            username={username}
//            handleLogin={handleLogin}
//            handleLogout={handleLogout}
//            styles={styles}
//            renderBackgroundShapes={renderBackgroundShapes}
//          />
//        </Router>
//      </CacheProvider>
//    </>
//  );
//}
//
//function AppContent({ isLoggedIn, username, handleLogin, handleLogout, styles, renderBackgroundShapes }) {
//  const navigate = useNavigate();
//
//  const onLogoutClick = async () => {
//    await handleLogout();
//    navigate('/');
//  };
//
//  return (
//    <div style={styles.appContainer}>
//      <div style={styles.backgroundAnimation}>
//        {renderBackgroundShapes()}
//      </div>
//
//       <SideNavBar isLoggedIn={isLoggedIn} />
//
//      {isLoggedIn && (
//        <nav style={styles.navbar}>
//          <div style={styles.navbarBrand}>Resiliency Framework</div>
//          <ul style={styles.navList}>
//            <li style={styles.navItem}>
//              <NavLink
//                to="/dashboard"
//                style={({ isActive }) => ({
//                  ...styles.navLink,
//                  ...(isActive ? styles.activeNavLink : {}),
//                })}
//              >
//                Dashboard
//              </NavLink>
//            </li>
//            <li style={styles.navItem}>
//              <NavLink
//                to="/onboard"
//                style={({ isActive }) => ({
//                  ...styles.navLink,
//                  ...(isActive ? styles.activeNavLink : {}),
//                })}
//              >
//                Onboard
//              </NavLink>
//            </li>
//            <li style={styles.navItem}>
//              <NavLink
//                to="/failover/config"
//                style={({ isActive }) => ({
//                  ...styles.navLink,
//                  ...(isActive ? styles.activeNavLink : {}),
//                })}
//              >
//                Platforms
//              </NavLink>
//            </li>
//            <li style={styles.navItem}>
//              <span style={styles.navLink}>{username}</span>
//            </li>
//            <li style={styles.navItem}>
//              <button
//                onClick={onLogoutClick}
//                style={{...styles.navLink, ...styles.logoutButton}}
//              >
//                Logout
//              </button>
//            </li>
//          </ul>
//        </nav>
//      )}
//
//      <div style={styles.contentContainer}>
//        <Routes>
//          <Route path="/" element={<Login onLogin={handleLogin} />} />
//          {isLoggedIn ? (
//            <>
//              <Route path="/dashboard" element={<Dashboard />} />
//              <Route path="/onboard" element={<Onboard />} />
//              <Route path="/failover/config" element={<PlatformView />} />
//              <Route path="*" element={<Navigate to="/dashboard" />} />
//            </>
//          ) : (
//            <Route path="*" element={<Navigate to="/" />} />
//          )}
//        </Routes>
//      </div>
//    </div>
//  );
//}
//
//export default App;
//
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Onboard from './components/Onboard';
import PlatformView from './components/PlatformView';
import SideNavBar from './components/SideNavBar';
import { CacheProvider } from './components/CacheProvider';
import LoadingIcon from './components/Loading';

const logoutUser = async () => {
  try {
    const response = await fetch('/auth/logout', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return true;
    } else {
      console.error('Logout failed');
      return false;
    }
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  const handleLogin = async (user) => {
    setIsLoggedIn(true);
    setUsername(user);
  };

  const handleLogout = async () => {
    try {
      const logoutResult = await logoutUser();
      if (logoutResult) {
        setIsLoggedIn(false);
        setUsername('');
      }
    } catch (err) {
      console.error('Logout process error:', err);
    }
  };

  const styles = {
    appContainer: {
      fontFamily: 'Arial, sans-serif',
      margin: 0,
      padding: 0,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)',
      position: 'relative',
      overflow: 'hidden',
    },
    backgroundAnimation: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 0,
      overflow: 'hidden',
    },
    animatedCircle: {
      position: 'absolute',
      borderRadius: '50%',
      background: 'rgba(255, 255, 255, 0.1)',
      animation: 'float-circle 15s infinite alternate',
    },
    animatedSquare: {
      position: 'absolute',
      background: 'rgba(255, 255, 255, 0.1)',
      animation: 'float-square 20s infinite alternate',
    },
    contentContainer: {
      flex: 1,
      zIndex: 1,
      position: 'relative',
      overflow: 'auto',
      padding: '20px',
      marginLeft: isLoggedIn ? '60px' : '0', // Add margin for sidebar
      transition: 'margin-left 0.3s ease',
    },
  };

  const keyframesStyle = `
    @keyframes float-circle {
      0% {
        transform: translateY(0) rotate(0deg);
      }
      100% {
        transform: translateY(-50px) rotate(360deg);
      }
    }
    @keyframes float-square {
      0% {
        transform: translateY(0) rotate(0deg);
      }
      100% {
        transform: translateY(-30px) rotate(45deg);
      }
    }
  `;

  const renderBackgroundShapes = () => {
    const shapes = [
      { type: 'circle', top: '10%', left: '10%', size: 200, delay: '-2s' },
      { type: 'circle', top: '50%', right: '15%', size: 300, delay: '-4s' },
      { type: 'circle', bottom: '20%', left: '5%', size: 150, delay: '-6s' },
      { type: 'circle', bottom: '10%', right: '5%', size: 250, delay: '-8s' },
      { type: 'circle', top: '30%', left: '50%', size: 180, delay: '-10s' },
      { type: 'square', top: '20%', left: '20%', size: 100, delay: '-12s' },
      { type: 'square', bottom: '30%', right: '10%', size: 150, delay: '-14s' },
    ];

    return shapes.map((shape, index) => (
      <div
        key={index}
        style={{
          ...styles[shape.type === 'circle' ? 'animatedCircle' : 'animatedSquare'],
          width: shape.size,
          height: shape.size,
          top: shape.top,
          left: shape.left,
          right: shape.right,
          bottom: shape.bottom,
          animationDelay: shape.delay,
        }}
      />
    ));
  };

  if (loading) {
    return <LoadingIcon />;
  }

  return (
    <>
      <style>{keyframesStyle}</style>
      <CacheProvider>
        <Router>
          <div style={styles.appContainer}>
            <div style={styles.backgroundAnimation}>
              {renderBackgroundShapes()}
            </div>

            <SideNavBar
              isLoggedIn={isLoggedIn}
              username={username}
              handleLogout={handleLogout}
            />

            <div style={styles.contentContainer}>
              <Routes>
                <Route path="/" element={<Login onLogin={handleLogin} />} />
                {isLoggedIn ? (
                  <>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/onboard" element={<Onboard />} />
                    <Route path="/failover/config" element={<PlatformView />} />
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                  </>
                ) : (
                  <Route path="*" element={<Navigate to="/" />} />
                )}
              </Routes>
            </div>
          </div>
        </Router>
      </CacheProvider>
    </>
  );
}

export default App;
