import React, { useState } from 'react';
import { Dumbbell, ChevronDown, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import loginImage from '../../assets/hero-gym.jpg';
import styles from './Login.module.css';

// ===== FAKE ACCOUNTS FOR TESTING =====
const mockUsers = [
  {
    id: 1,
    email: 'member@fitcore.com',
    password: 'member123',
    name: 'Sara Nabil',
    role: 'Member',
    plan: 'Premium',
  },
  {
    id: 2,
    email: 'trainer@fitcore.com',
    password: 'trainer123',
    name: 'Marcus Vale',
    role: 'Trainer',
    specialty: 'Strength & Powerlifting',
  },
  {
    id: 3,
    email: 'admin@fitcore.com',
    password: 'admin123',
    name: 'Hana Adel',
    role: 'Admin',
  },
  {
    id: 4,
    email: 'omar@fitcore.com',
    password: 'omar123',
    name: 'Omar Haddad',
    role: 'Member',
    plan: 'VIP',
  },
  {
    id: 5,
    email: 'elena@fitcore.com',
    password: 'elena123',
    name: 'Elena Rossi',
    role: 'Trainer',
    specialty: 'Mobility & Conditioning',
  },
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Member');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API delay
    setTimeout(() => {
      // Find user by email and password
      const user = mockUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (!user) {
        setError('Invalid email or password. Try the demo accounts below.');
        setIsLoading(false);
        return;
      }

      // Check if role matches
      if (user.role.toLowerCase() !== role.toLowerCase()) {
        setError(`This account is for ${user.role}, not ${role}. Please select the correct role.`);
        setIsLoading(false);
        return;
      }

      // Store user info in localStorage (persists across pages)
      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.toLowerCase(),
        plan: user.plan || null,
        specialty: user.specialty || null,
        isAuthenticated: true,
        loginTime: new Date().toISOString(),
      };

      localStorage.setItem('fitcore_user', JSON.stringify(userData));

      // Redirect based on role
      setTimeout(() => {
        if (user.role === 'Member') {
          navigate('/dashboard');
        } else if (user.role === 'Trainer') {
          navigate('/trainer/overview');
        } else if (user.role === 'Admin') {
          navigate('/admin/overview');
        }
      }, 300);

    }, 800);
  };

  // Auto-fill demo account credentials
  const autofillDemo = (demoRole) => {
    let demoUser;
    if (demoRole === 'Member') {
      demoUser = mockUsers.find(u => u.role === 'Member');
    } else if (demoRole === 'Trainer') {
      demoUser = mockUsers.find(u => u.role === 'Trainer');
    } else if (demoRole === 'Admin') {
      demoUser = mockUsers.find(u => u.role === 'Admin');
    }
    
    if (demoUser) {
      setEmail(demoUser.email);
      setPassword(demoUser.password);
      setRole(demoUser.role);
    }
  };

  return (
    <div className={styles.page}>
      {/* Left — image panel */}
      <div className={styles.imagePanel}>
        <img
          src={loginImage}
          alt="Member deadlifting in the gym"
          className={styles.panelImage}
        />
        <div className={styles.panelOverlay} />

        <Link to="/" className={styles.logo}>
          <span className={styles.logoMark}>
            <Dumbbell size={18} strokeWidth={2.5} />
          </span>
          <span className={styles.logoText}>
            Fit<span className={styles.accent}>Core</span>
          </span>
        </Link>
        <div className={styles.panelText}>
          <h2 className={styles.panelTitle}>
            Strength is a
            <br />
            <span className={styles.accent}>system, not a mood.</span>
          </h2>
          <p className={styles.panelSubtitle}>
            Track every session, plan and payment in one place — built for
            members, trainers and gym administrators.
          </p>
        </div>
      </div>

      {/* Right — form panel */}
      <div className={styles.formPanel}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h1 className={styles.formTitle}>Welcome back</h1>
            <p className={styles.formSubtitle}>
              Sign in to pick up your training where you left off.
            </p>
          </div>

          {error && (
            <div className={styles.errorBanner}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.loginForm}>
            {/* Email */}
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.formLabel}>
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.formInput}
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.formLabel}>
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.formInput}
                required
                autoComplete="current-password"
              />
            </div>

            {/* Continue as */}
            <div className={styles.formGroup}>
              <label htmlFor="role" className={styles.formLabel}>
                Continue as
              </label>
              <div className={styles.selectWrapper}>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={styles.formSelect}
                >
                  <option value="Member">Member</option>
                  <option value="Trainer">Trainer</option>
                  <option value="Admin">Administrator</option>
                </select>
                <ChevronDown size={18} className={styles.selectIcon} />
              </div>
            </div>

            {/* Remember me & Forgot password */}
            <div className={styles.formOptions}>
              <label className={styles.rememberMe}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className={styles.customRadio} />
                Remember me
              </label>
              <Link to="/forgot-password" className={styles.forgotPassword}>
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Demo Accounts Section */}
          <div className={styles.demoAccounts}>
            <p className={styles.demoTitle}>Demo Accounts (Click to Auto-fill):</p>
            <div className={styles.demoButtons}>
              <button
                type="button"
                className={styles.demoBtn}
                onClick={() => autofillDemo('Member')}
              >
                Member
              </button>
              <button
                type="button"
                className={styles.demoBtn}
                onClick={() => autofillDemo('Trainer')}
              >
                Trainer
              </button>
              <button
                type="button"
                className={styles.demoBtn}
                onClick={() => autofillDemo('Admin')}
              >
                Admin
              </button>
            </div>
            <p className={styles.demoHint}>
              All passwords are: <strong>role123</strong> (e.g., member123, trainer123, admin123)
            </p>
          </div>

          <p className={styles.signupText}>
            New to FitCore?{' '}
            <Link to="/sign-up" className={styles.signupLink}>
              Create an account
            </Link>
          </p>
          <Link to="/" className={styles.backLink}>
            <ArrowRight size={14} className={styles.backIcon} />
            Back to FitCore
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;