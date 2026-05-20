import { useContext, useState } from 'react';
import { AuthContext } from 'react-oauth2-code-pkce';
import { useNavigate, useLocation } from 'react-router';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';

const Navbar = () => {
  const { token, logIn, logOut } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    logOut();
    setMenuOpen(false);
  };

  const handleLogin = () => {
    logIn();
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        {/* Logo */}
        <div style={styles.logo} onClick={() => navigate('/')}>
          <div style={styles.logoIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="url(#bolt)" />
              <defs>
                <linearGradient id="bolt" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span style={styles.logoText}>FitTrack <span style={styles.logoAI}>AI</span></span>
        </div>

        {/* Desktop Nav Links */}
        {token && (
          <div style={styles.navLinks}>
            <button
              style={{
                ...styles.navLink,
                ...(isActive('/activities') ? styles.navLinkActive : {}),
              }}
              onClick={() => navigate('/activities')}
              onMouseEnter={(e) => {
                if (!isActive('/activities')) {
                  e.currentTarget.style.color = '#f1f5f9';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive('/activities')) {
                  e.currentTarget.style.color = '#94a3b8';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)';
                }
              }}
            >
              {/* Dumbbell icon */}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 4v16M18 4v16M6 12h12M3 8h3M3 16h3M18 8h3M18 16h3"/>
              </svg>
              My Activities
              {isActive('/activities') && <span style={styles.activeDot} />}
            </button>
          </div>
        )}

        {/* Actions */}
        <div style={styles.actions}>
          {token ? (
            <button style={styles.logoutBtn} onClick={handleLogout}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          ) : (
            <div style={styles.authButtons}>
              <button style={styles.loginBtn} onClick={handleLogin}>
                Sign In
              </button>
              <button style={styles.signupBtn} onClick={handleLogin}>
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'rgba(10, 11, 15, 0.85)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '24px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    textDecoration: 'none',
    flexShrink: 0,
  },
  logoIcon: {
    width: '36px',
    height: '36px',
    background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))',
    border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#f1f5f9',
    letterSpacing: '-0.3px',
  },
  logoAI: {
    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    flex: 1,
  },
  navLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.09)',
    color: '#94a3b8',
    fontSize: '13px',
    fontWeight: '500',
    padding: '7px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    letterSpacing: '0.1px',
    position: 'relative',
  },
  navLinkActive: {
    color: '#f1f5f9',
    background: 'rgba(99,102,241,0.18)',
    border: '1px solid rgba(99,102,241,0.35)',
    boxShadow: '0 0 14px rgba(99,102,241,0.15)',
  },
  activeDot: {
    display: 'inline-block',
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    background: '#6366f1',
    boxShadow: '0 0 6px #6366f1',
    marginLeft: '2px',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexShrink: 0,
  },
  authButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  loginBtn: {
    background: 'none',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#94a3b8',
    fontSize: '14px',
    fontWeight: '500',
    padding: '8px 18px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
  },
  signupBtn: {
    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
    border: 'none',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    padding: '8px 18px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    boxShadow: '0 0 20px rgba(99,102,241,0.3)',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.2)',
    color: '#f87171',
    fontSize: '14px',
    fontWeight: '500',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
  },
};

export default Navbar;
