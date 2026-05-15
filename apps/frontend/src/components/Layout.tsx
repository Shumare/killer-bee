import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const navLinkStyle = (isActive: boolean): React.CSSProperties => ({
  color: isActive ? '#3b82f6' : '#fff',
  textDecoration: 'none',
  padding: '8px 12px',
  borderRadius: '4px',
  fontSize: '14px',
  fontWeight: isActive ? 600 : 400,
  backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
  transition: 'background-color 0.15s',
});

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav
        style={{
          backgroundColor: '#1e3a5f',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '56px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span
            style={{
              color: '#fff',
              fontWeight: 700,
              fontSize: '18px',
              marginRight: '24px',
            }}
          >
            KillerBee
          </span>
          <NavLink
            to="/models"
            style={({ isActive }) => navLinkStyle(isActive)}
          >
            Modeles
          </NavLink>
          <NavLink
            to="/ingredients"
            style={({ isActive }) => navLinkStyle(isActive)}
          >
            Ingredients
          </NavLink>
          <NavLink
            to="/processes"
            style={({ isActive }) => navLinkStyle(isActive)}
          >
            Procedes
          </NavLink>
          <NavLink
            to="/tests"
            style={({ isActive }) => navLinkStyle(isActive)}
          >
            Tests
          </NavLink>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user && (
            <span style={{ color: '#93c5fd', fontSize: '13px' }}>{user.email}</span>
          )}
          <button
            onClick={handleLogout}
            style={{
              padding: '6px 14px',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255,255,255,0.4)',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '13px',
              transition: 'border-color 0.15s',
            }}
          >
            Deconnexion
          </button>
        </div>
      </nav>

      <main
        style={{
          flex: 1,
          padding: '24px',
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
        }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
