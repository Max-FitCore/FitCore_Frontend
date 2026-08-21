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
      {/* Left — image panel */}
      <div className={styles.imagePanel}>
        <img
          src={loginImage}
          alt="Member training in the gym"
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
            Start your
            <br />
            <span className={styles.accent}>fitness journey today.</span>
          </h2>
          <p className={styles.panelSubtitle}>
            Join thousands of members who are already transforming their lives 
            with personalized training, class booking, and progress tracking.
          </p>
        </div>
      </div>

      {/* Right — form panel */}
      <div className={styles.formPanel}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h1 className={styles.formTitle}>Create account</h1>
            <p className={styles.formSubtitle}>
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

          <p className={styles.signinText}>
            Already have an account?{' '}
            <Link to="/sign-in" className={styles.signinLink}>
              Sign in instead
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

export default SignUp;