import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
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
  Overview: () => (
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
  Members: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  Trainers: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
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
  Schedule: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
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
  Payments: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  Plans: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  ),
  Analytics: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  Attendance: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
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
  Profile: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  SignOut: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Menu: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  Close: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
};

// Navigation configuration for each role
const navConfig = {
  member: {
    label: 'Member',
    items: [
      { icon: Icons.Dashboard, label: 'Dashboard', path: '/dashboard' },
      { icon: Icons.Membership, label: 'My Membership', path: '/membership' },
      { icon: Icons.Workout, label: 'Workout Plans', path: '/workout-plans' },
      { icon: Icons.Classes, label: 'Classes', path: '/classes' },
      { icon: Icons.Payments, label: 'Payments', path: '/payments' },
      { icon: Icons.Settings, label: 'Settings', path: '/settings' },
    ]
  },
  trainer: {
    label: 'Trainer',
    items: [
      { icon: Icons.Overview, label: 'Overview', path: '/trainer/overview' },
      { icon: Icons.Members, label: 'My Members', path: '/trainer/members' },
      { icon: Icons.Workout, label: 'Workout Plans', path: '/trainer/workout-plans' },
      { icon: Icons.Schedule, label: 'Schedule', path: '/trainer/schedule' },
      { icon: Icons.Attendance, label: 'Attendance', path: '/trainer/attendance' },
      { icon: Icons.Profile, label: 'Profile', path: '/trainer/profile' },
    ]
  },
  admin: {
    label: 'Admin',
    items: [
      { icon: Icons.Overview, label: 'Overview', path: '/admin/overview' },
      { icon: Icons.Members, label: 'Members', path: '/admin/members' },
      { icon: Icons.Trainers, label: 'Trainers', path: '/admin/trainers' },
      { icon: Icons.Classes, label: 'Classes', path: '/admin/classes' },
      { icon: Icons.Payments, label: 'Payments', path: '/admin/payments' },
      { icon: Icons.Plans, label: 'Plans', path: '/admin/plans' },
      { icon: Icons.Analytics, label: 'Analytics', path: '/admin/analytics' },
      { icon: Icons.Settings, label: 'Settings', path: '/admin/settings' },
    ]
  }
};

// Axios instance with base configuration
const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const Layout = ({ children, userRole = 'member' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState({
    name: '',
    initials: '',
    role: '',
    avatar: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    membershipPlan: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Default user fallback based on role
  const defaultUser = {
    member: {
      name: 'John Doe',
      initials: 'JD',
      role: 'Member',
      avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=A6F13B&color=05070A&size=64'
    },
    trainer: {
      name: 'Marcus Vale',
      initials: 'MV',
      role: 'Trainer',
      avatar: 'https://ui-avatars.com/api/?name=Marcus+Vale&background=A6F13B&color=05070A&size=64'
    },
    admin: {
      name: 'Hana Adel',
      initials: 'HA',
      role: 'Admin',
      avatar: 'https://ui-avatars.com/api/?name=Hana+Adel&background=A6F13B&color=05070A&size=64'
    }
  };

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get('/profile/me');
        
        if (response.data.success) {
          const userData = response.data.data;
          
          // Map user data to the format expected by the component
          const userName = userData.fullName || userData.name || 'User';
          const userInitials = userName
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
          
          setUser({
            name: userName,
            initials: userInitials,
            role: userData.role || userRole,
            avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=A6F13B&color=05070A&size=64`,
            email: userData.email || '',
            phone: userData.phone || '',
            location: userData.location || '',
            bio: userData.bio || '',
            membershipPlan: userData.membershipPlan || null,
            // Store the full user data if needed
            ...userData
          });
        } else {
          // Use default user if API returns error
          setUser(defaultUser[userRole] || defaultUser.member);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.response?.data?.message || 'Failed to load profile');
        // Use default user if API call fails
        setUser(defaultUser[userRole] || defaultUser.member);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userRole]); // Re-fetch if userRole changes

  // Get navigation items based on role
  const navItems = navConfig[userRole]?.items || navConfig.member.items;
  const roleLabel = navConfig[userRole]?.label || 'Member';

  // Map routes to labels for active state
  const routeToLabel = {};
  navItems.forEach(item => {
    routeToLabel[item.path] = item.label;
  });

  const [activeItem, setActiveItem] = useState(
    routeToLabel[location.pathname] || navItems[0]?.label || 'Dashboard'
  );

  const handleNavClick = (label, path, e) => {
    e.preventDefault();
    setActiveItem(label);
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = () => {
    // Clear token and redirect to sign in
    localStorage.removeItem('token');
    navigate('/sign-in');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Show loading state if fetching profile
  if (loading) {
    return (
      <div className={styles.layout}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          width: '100%', 
          height: '100vh',
          color: '#FFFFFF'
        }}>
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      {/* Mobile Header Bar */}
      <div className={styles.mobileHeader}>
        <button 
          className={styles.mobileMenuBtn}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <Icons.Close /> : <Icons.Menu />}
        </button>
        <div className={styles.mobileLogo}>
          <span className={styles.mobileLogoIcon}>💪</span>
          <span className={styles.mobileLogoText}>
            Fit<span className={styles.mobileLogoAccent}>Core</span>
          </span>
        </div>
        <div className={styles.mobileUserAvatar}>
          <img src={user.avatar} alt={user.name} />
        </div>
      </div>

      {/* Backdrop for mobile */}
      {isMobileMenuOpen && (
        <div 
          className={styles.backdrop}
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}></span>
          <span className={styles.logoText}>
            Fit<span className={styles.logoAccent}>Core</span>
          </span>
        </div>

        <div className={styles.searchWrapper}>
          <Icons.Search />
          <input 
            type="text" 
            placeholder="Search..." 
            className={styles.searchInput}
          />
        </div>

        <div className={styles.roleLabel}>{roleLabel}</div>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.path}
              className={`${styles.navItem} ${activeItem === item.label ? styles.active : ''}`}
              onClick={(e) => handleNavClick(item.label, item.path, e)}
              data-tooltip={item.label} // For tablet tooltip
            >
              <item.icon />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className={styles.userSection}>
          <div className={styles.userAvatar}>
            <img src={user.avatar} alt={user.name} />
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{user.name}</div>
            <div className={styles.userRole}>{user.role}</div>
          </div>
          <button 
            className={styles.signOutBtn}
            onClick={handleSignOut}
            aria-label="Sign out"
          >
            <Icons.SignOut />
            <span className={styles.signOutText}>Sign out</span>
          </button>
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