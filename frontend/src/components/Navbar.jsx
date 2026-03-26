import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePoints } from '../context/PointsContext';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Navbar({ searchTerm, onSearchChange }) {
  const { user, logout }            = useAuth();
  const { points, walletBalance }   = usePoints();
  const { notifications, clearNotifications } = useSocket();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate                    = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);

  const unreadCount = notifications.length;

  return (
    <header className="navbar">
      {/* ── Row 1: Brand + Hamburger ── */}
      <div className="navbar-top">
        <div className="brand-wrap" onClick={() => navigate('/')} style={{display:'flex', alignItems:'center', gap:'8px', cursor:'pointer'}}>
          <div className="auth-trophy-icon" style={{width: 32, height: 32, marginBottom:0, flexShrink:0}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00E1FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z"></path>
            </svg>
          </div>
          <h1 className="auth-logo-title" style={{fontSize: '1.4rem'}}>NOVA<span className="auth-logo-dot" style={{width:6, height:6}}></span></h1>
        </div>

        {/* Desktop: center search + home */}
        <div className="nav-center nav-center-desktop">
          <button className="nav-home-btn" onClick={() => navigate('/')}>🏠 Home</button>
          <input
            type="text"
            className="search-input"
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search promotions, users, posts..."
            aria-label="Search"
          />
        </div>

        {/* Desktop: right actions */}
        <div className="nav-right nav-right-desktop">
          <NavActions
            points={points} walletBalance={walletBalance}
            notifications={notifications} unreadCount={unreadCount}
            showNotifs={showNotifs} setShowNotifs={setShowNotifs}
            clearNotifications={clearNotifications}
            onToggleDarkMode={toggleTheme}
            user={user} logout={logout} navigate={navigate}
          />
        </div>

        {/* Mobile: bell + hamburger */}
        <div className="navbar-mobile-icons">
          <div className="notif-wrapper">
            <button
              className="icon-btn notif-bell-btn"
              onClick={() => { setShowNotifs(v => !v); setMenuOpen(false); }}
              aria-label="Notifications"
            >
              🔔
              {unreadCount > 0 && (
                <span className="notif-count-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </button>
            {showNotifs && (
              <NotifDropdown
                notifications={notifications} unreadCount={unreadCount}
                clearNotifications={clearNotifications} onClose={() => setShowNotifs(false)}
              />
            )}
          </div>

          <button
            className="hamburger-btn"
            onClick={() => { setMenuOpen(v => !v); setShowNotifs(false); }}
            aria-label="Toggle menu"
          >
            <span className={`ham-bar ${menuOpen ? 'open' : ''}`} />
            <span className={`ham-bar ${menuOpen ? 'open' : ''}`} />
            <span className={`ham-bar ${menuOpen ? 'open' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Mobile search ── */}
      <div className="navbar-mobile-search">
        <input
          type="text"
          className="search-input"
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search posts, users..."
          aria-label="Search"
          style={{ width: '100%' }}
        />
      </div>

      {/* ── Mobile drawer menu ── */}
      {menuOpen && (
        <nav className="mobile-menu">
          <button className="nav-home-btn mobile-menu-item" onClick={() => { navigate('/'); setMenuOpen(false); }}>
            🏠 Home
          </button>
          <button
            className="nav-home-btn mobile-menu-item"
            onClick={() => {
              if (user?.username) {
                navigate(`/profile/${user.username}`);
              }
              setMenuOpen(false);
            }}
          >
            👤 Profile
          </button>
          <button className="nav-home-btn mobile-menu-item" onClick={() => { navigate('/wallet'); setMenuOpen(false); }}>
            💰 Wallet — ₹{walletBalance}
          </button>
          <div className="mobile-menu-divider" />
          <div className="mobile-menu-row">
            <span>⭐ {points} pts</span>
            <button className="icon-btn" onClick={toggleTheme} title="Toggle Theme">{isDarkMode ? '☀️' : '🌙'}</button>
            <button className="button-text small" onClick={() => { logout(); setMenuOpen(false); }}>
              Log out
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}

/* ── Shared notification dropdown ── */
function NotifDropdown({ notifications, unreadCount, clearNotifications, onClose }) {
  return (
    <div className="notif-dropdown">
      <div className="notif-dropdown-header">
        <span style={{ fontWeight: 700, fontSize: 14 }}>Notifications</span>
        {unreadCount > 0 && (
          <button className="notif-clear-btn" onClick={() => { clearNotifications(); onClose(); }}>
            Clear all
          </button>
        )}
      </div>
      {notifications.length === 0 ? (
        <p className="notif-empty">No notifications yet</p>
      ) : (
        <ul className="notif-list">
          {notifications.map((n, i) => (
            <li key={i} className="notif-item">
              <span className="notif-icon">
                {n.type === 'like' ? '❤️' : n.type === 'comment' ? '💬' : n.type === 'friend_request' ? '👋' : '✅'}
              </span>
              <span className="notif-msg">{n.message}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── Desktop right-side actions ── */
function NavActions({ points, walletBalance, notifications, unreadCount, showNotifs, setShowNotifs, clearNotifications, onToggleDarkMode, user, logout, navigate }) {
  return (
    <div className="flex-items">
      <div
        className="badge badge-star pts-badge"
        style={{ cursor: 'pointer' }}
        onClick={() => {
          toast(`You currently have ${points} points.`, { duration: 1800 });
          navigate('/wallet');
        }}
      >
        {points} ⭐
      </div>
      <div className="badge badge-money" style={{ cursor: 'pointer' }} onClick={() => navigate('/wallet')}>
        ₹{walletBalance}
      </div>

      <div className="notif-wrapper">
        <button
          className="icon-btn notif-bell-btn"
          aria-label="Notifications"
          onClick={() => setShowNotifs(v => !v)}
        >
          🔔
          {unreadCount > 0 && (
            <>
              <span className="notif-dot" />
              <span className="notif-count-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            </>
          )}
        </button>
        {showNotifs && (
          <NotifDropdown
            notifications={notifications} unreadCount={unreadCount}
            clearNotifications={clearNotifications} onClose={() => setShowNotifs(false)}
          />
        )}
      </div>

      <button className="icon-btn" onClick={onToggleDarkMode} title="Toggle Theme">☀️</button>

      <div className="profile-group">
        <div 
          className="avatar avatar-gradient" 
          onClick={() => {
            if (user?.username) navigate(`/profile/${user.username}`);
          }}
          style={{cursor: 'pointer'}}
        >
          {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
        </div>
        <button className="button-text small" onClick={logout}>Log out</button>
      </div>
    </div>
  );
}
