import React, { useState } from 'react';
import { Dumbbell, ChevronDown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import loginImage from '../../assets/hero-gym.jpg'; // Adjust path based on your folder structure
import styles from './Login.module.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Member');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login attempt:', { email, password, role, rememberMe });
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
            <button type="submit" className={styles.submitBtn}>
              Sign in
            </button>
          </form>

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