import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">QR Attendance</Link>
      </div>
      
      <div className="nav-links">
        {user ? (
          <>
            <Link to="/">Home</Link>
            <Link to="/profile">Profile</Link>
            {user.role === 'user' && <Link to="/scanner">Scan QR</Link>}
            <button onClick={handleLogout} className="logout-btn">
              Logout ({user.name})
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register-user">Register User</Link>
            <Link to="/register-org">Register Org</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
