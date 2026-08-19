import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Layout.module.css';

// SVG Icon Components
const Icons = {
  Dashboard: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  Membership: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  ),
  Workout: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 6.5l11 11" />
      <path d="M6.5 6.5L4 4" />
      <path d="M17.5 17.5L20 20" />
      <path d="M6.5 17.5L4 20" />
      <path d="M17.5 6.5L20 4" />
      <path d="M12 4v3" />
      <path d="M12 17v3" />
      <path d="M4 12h3" />
      <path d="M17 12h3" />
    </svg>
  ),
  Payments: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  Classes: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Notifications: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  ),
  Settings: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
  Search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
};

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Map routes to nav labels
  const routeToLabel = {
    '/dashboard': 'Dashboard',
    '/membership': 'My Membership',
    '/workout-plans': 'Workout Plans',
    '/payments': 'Payments',
    '/classes': 'Classes',
    '/notifications': 'Notifications',
    '/settings': 'Settings',
  };

  const [activeItem, setActiveItem] = useState(
    routeToLabel[location.pathname] || 'Dashboard'
  );

  const navItems = [
    { icon: Icons.Dashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Icons.Membership, label: 'My Membership', path: '/membership' },
    { icon: Icons.Workout, label: 'Workout Plans', path: '/workout-plans' },
    { icon: Icons.Payments, label: 'Payments', path: '/payments' },
    { icon: Icons.Classes, label: 'Classes', path: '/classes' },
    { icon: Icons.Notifications, label: 'Notifications', path: '/notifications' },
    { icon: Icons.Settings, label: 'Settings', path: '/settings' },
  ];

  const handleNavClick = (label, path, e) => {
    e.preventDefault();
    setActiveItem(label);
    navigate(path);
  };

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>💪</span>
          <span className={styles.logoText}>Fit<span className={styles.logoAccent}>Core</span></span>
        </div>

        <div className={styles.searchWrapper}>
          <Icons.Search />
          <input 
            type="text" 
            placeholder="Search..." 
            className={styles.searchInput}
          />
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.path}
              className={`${styles.navItem} ${activeItem === item.label ? styles.active : ''}`}
              onClick={(e) => handleNavClick(item.label, item.path, e)}
            >
              <item.icon />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className={styles.userSection}>
          <div className={styles.userAvatar}>
            <img 
              src="https://ui-avatars.com/api/?name=John+Doe&background=A6F13B&color=05070A&size=64" 
              alt="User"
            />
          </div>
          <div>
            <div className={styles.userName}>John Doe</div>
            <div className={styles.userRole}>Premium Member</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
};

export default Layout;