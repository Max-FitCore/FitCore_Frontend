import React, { useState } from 'react';
import { Dumbbell, Eye, EyeOff, ArrowRight, Mail, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './Login.module.css';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login attempt:', { email, password, rememberMe });
  };

  return (
    <div className={styles.page}>
      {/* Navbar */}
      <header className={styles.navbar}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoMark}>
            <Dumbbell size={18} strokeWidth={2.5} />
          </span>
          <span className={styles.logoText}>
            Fit<span className={styles.accent}>Core</span>
          </span>
        </Link>

        <div className={styles.navActions}>
          <Link to="/sign-up" className={styles.signUp}>
            Create account
          </Link>
          <Link to="/" className={styles.primaryBtn}>
            Back to home
          </Link>
        </div>
      </header>

      {/* Login Form */}
      <section className={styles.loginSection}>
        <div className={styles.loginContainer}>
          <div className={styles.loginCard}>
            <div className={styles.loginHeader}>
              <h1 className={styles.loginTitle}>
                Welcome back
              </h1>
              <p className={styles.loginSubtitle}>
                Sign in to continue your fitness journey
              </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.loginForm}>
              {/* Email Field */}
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.formLabel}>
                  Email address
                </label>
                <div className={styles.inputWrapper}>
                  <Mail size={18} className={styles.inputIcon} />
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.formInput}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className={styles.formGroup}>
                <label htmlFor="password" className={styles.formLabel}>
                  Password
                </label>
                <div className={styles.inputWrapper}>
                  <Lock size={18} className={styles.inputIcon} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles.formInput}
                    required
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className={styles.formOptions}>
                <label className={styles.rememberMe}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className={styles.forgotPassword}>
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button type="submit" className={styles.submitBtn}>
                Sign in <ArrowRight size={18} />
              </button>
            </form>

            <div className={styles.loginFooter}>
              <p className={styles.footerText}>
                Don't have an account?{' '}
                <Link to="/sign-up" className={styles.footerLink}>
                  Create one now
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.logo}>
          <span className={styles.logoMark}>
            <Dumbbell size={16} strokeWidth={2.5} />
          </span>
          <span className={styles.logoText}>
            Fit<span className={styles.accent}>Core</span>
          </span>
        </div>
        <p className={styles.footerText}>© {new Date().getFullYear()} FitCore. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Login;