import React, { useState } from 'react';
import { Dumbbell, Eye, EyeOff, ArrowRight, Mail, Lock, User, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './SignUp.module.css';

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle sign up logic here
    console.log('Sign up attempt:', { fullName, email, password, confirmPassword, agreeTerms });
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
          <Link to="/sign-in" className={styles.signIn}>
            Sign in
          </Link>
          <Link to="/" className={styles.primaryBtn}>
            Back to home
          </Link>
        </div>
      </header>

      {/* Sign Up Form */}
      <section className={styles.signupSection}>
        <div className={styles.signupContainer}>
          <div className={styles.signupCard}>
            <div className={styles.signupHeader}>
              <h1 className={styles.signupTitle}>
                Create your account
              </h1>
              <p className={styles.signupSubtitle}>
                Start your fitness journey today
              </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.signupForm}>
              {/* Full Name Field */}
              <div className={styles.formGroup}>
                <label htmlFor="fullName" className={styles.formLabel}>
                  Full name
                </label>
                <div className={styles.inputWrapper}>
                  <User size={18} className={styles.inputIcon} />
                  <input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={styles.formInput}
                    required
                  />
                </div>
              </div>

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
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles.formInput}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className={styles.passwordHint}>
                  Must be at least 8 characters
                </p>
              </div>

              {/* Confirm Password Field */}
              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword" className={styles.formLabel}>
                  Confirm password
                </label>
                <div className={styles.inputWrapper}>
                  <Lock size={18} className={styles.inputIcon} />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={styles.formInput}
                    required
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className={styles.termsGroup}>
                <label className={styles.termsLabel}>
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    required
                  />
                  <span>
                    I agree to the{' '}
                    <Link to="/terms" className={styles.termsLink}>
                      Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link to="/privacy" className={styles.termsLink}>
                      Privacy Policy
                    </Link>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button type="submit" className={styles.submitBtn}>
                Create account <ArrowRight size={18} />
              </button>
            </form>

            <div className={styles.signupFooter}>
              <p className={styles.footerText}>
                Already have an account?{' '}
                <Link to="/sign-in" className={styles.footerLink}>
                  Sign in instead
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

export default SignUp;