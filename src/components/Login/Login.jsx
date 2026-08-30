import React, { useState, useEffect, useRef } from 'react';
import { Dumbbell, ChevronDown, ArrowRight, X, Mail, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import loginImage from '../../assets/hero-gym.jpg';
import styles from './Login.module.css';
import axios from 'axios';

// API base URL - adjust based on your environment
const API_BASE_URL = 'http://localhost:5000/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('member');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Verification modal states
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const inputRefs = useRef([]);

  // Role mapping
  const roleMapping = {
    'member': 'member',
    'trainer': 'trainer',
    'administrator': 'administrator'
  };

  // Handle login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: email.trim(),
        password: password.trim(),
        userType: roleMapping[role] || 'member'
      });

      if (response.data.success) {
        const { user, token } = response.data.data;

        // Store user info and token in localStorage
        const userData = {
          id: user._id,
          name: user.fullName,
          email: user.email,
          role: user.role,
          token: token,
          isAuthenticated: true,
          loginTime: new Date().toISOString(),
          plan: user.plan || null,
          specialty: user.specialty || null,
        };

        localStorage.setItem('token', token);
        localStorage.setItem('fitcore_user', JSON.stringify(userData));

        if (rememberMe) {
          localStorage.setItem('fitcore_remembered_email', email);
        } else {
          localStorage.removeItem('fitcore_remembered_email');
        }

        // Redirect based on role
        setTimeout(() => {
          if (user.role === 'member') {
            navigate('/dashboard');
          } else if (user.role === 'trainer') {
            navigate('/trainer/overview');
          } else if (user.role === 'administrator') {
            navigate('/admin/overview');
          }
        }, 300);
      }
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 400:
            setError(data.message || 'Invalid request. Please check your input.');
            break;
          case 401:
            setError(data.message || 'Invalid email or password. Please try again.');
            break;
          case 403:
            if (data.requiresVerification) {
              // Show verification modal and send email
              const emailToVerify = data.email || email;
              setVerificationEmail(emailToVerify);
              setShowVerificationModal(true);
              setError('');
              // Send verification email automatically
              await sendVerificationEmail(emailToVerify);
            } else {
              setError(data.message || 'Access denied. Please contact support.');
            }
            break;
          case 404:
            setError('Account not found. Please check your email or sign up.');
            break;
          default:
            setError(data.message || 'An error occurred during login. Please try again.');
        }
      } else if (error.request) {
        setError('Unable to connect to the server. Please check your internet connection.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Send verification email
  const sendVerificationEmail = async (emailAddress) => {
    setIsSendingEmail(true);
    setVerificationError('');
    
    try {
      await axios.post(`${API_BASE_URL}/auth/resend-otp`, {
        email: emailAddress
      });
      
      setVerificationSuccess(true);
      setTimeout(() => setVerificationSuccess(false), 5000);
      
      // Start cooldown
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error) {
      setVerificationError(error.response?.data?.message || 'Failed to send verification email. Please try again.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Handle verification code submission
  const handleVerify = async (e) => {
    e.preventDefault();
    const code = verificationCode.join('');
    
    if (code.length < 6) {
      setVerificationError('Please enter all 6 digits of the verification code.');
      return;
    }

    setIsVerifying(true);
    setVerificationError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify`, {
        email: verificationEmail,
        otpCode: code
      });

      if (response.data.success) {
        const { user, token } = response.data.data;

        // Store user data
        const userData = {
          id: user._id,
          name: user.fullName,
          email: user.email,
          role: user.role,
          token: token,
          isAuthenticated: true,
          loginTime: new Date().toISOString(),
          plan: user.plan || null,
          specialty: user.specialty || null,
        };

        localStorage.setItem('token', token);
        localStorage.setItem('fitcore_user', JSON.stringify(userData));

        setVerificationSuccess(true);
        
        // Close modal and redirect after success
        setTimeout(() => {
          setShowVerificationModal(false);
          setVerificationSuccess(false);
          
          // Redirect based on role
          if (user.role === 'member') {
            navigate('/dashboard');
          } else if (user.role === 'trainer') {
            navigate('/trainer/overview');
          } else if (user.role === 'administrator') {
            navigate('/admin/overview');
          }
        }, 1500);
      }
    } catch (error) {
      if (error.response) {
        setVerificationError(error.response.data.message || 'Invalid verification code. Please try again.');
        // Clear the code on error for better UX
        setVerificationCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setVerificationError('An error occurred. Please try again.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle resend verification code
  const handleResendCode = async () => {
    if (resendCooldown > 0 || isResending) return;
    
    setIsResending(true);
    await sendVerificationEmail(verificationEmail);
    setIsResending(false);
  };

  // Handle input change for 6-digit code
  const handleCodeChange = (index, value) => {
    // Only allow numbers
    const numericValue = value.replace(/\D/g, '');
    
    const newCode = [...verificationCode];
    newCode[index] = numericValue;
    setVerificationCode(newCode);

    // Auto-advance to next input
    if (numericValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle keydown for backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...verificationCode];
    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i];
    }
    setVerificationCode(newCode);
    
    // Focus the next empty input or last input
    const nextEmptyIndex = newCode.findIndex(val => val === '');
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }
  };

  // Auto-fill remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('fitcore_remembered_email');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  // Reset verification code when modal opens
  useEffect(() => {
    if (showVerificationModal) {
      setVerificationCode(['', '', '', '', '', '']);
      setVerificationError('');
      // Focus first input after modal opens
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [showVerificationModal]);

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
                disabled={isLoading}
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
                disabled={isLoading}
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
                  disabled={isLoading}
                >
                  <option value="member">Member</option>
                  <option value="trainer">Trainer</option>
                  <option value="administrator">Administrator</option>
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
                  disabled={isLoading}
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

      {/* Verification Modal */}
      {showVerificationModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button
              className={styles.modalClose}
              onClick={() => setShowVerificationModal(false)}
            >
              <X size={20} />
            </button>

            <div className={styles.modalHeader}>
              <div className={styles.modalIcon}>
                <Mail size={24} />
              </div>
              <h2 className={styles.modalTitle}>Verify Your Email</h2>
              <p className={styles.modalSubtitle}>
                We've sent a verification code to <strong>{verificationEmail}</strong>
              </p>
              {isSendingEmail && (
                <p className={styles.sendingStatus}>Sending verification code...</p>
              )}
            </div>

            {verificationSuccess && !verificationError && (
              <div className={styles.verificationSuccess}>
                <CheckCircle size={20} />
                <span>Verification code sent successfully!</span>
              </div>
            )}

            <form onSubmit={handleVerify} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label htmlFor="verificationCode" className={styles.formLabel}>
                  Enter 6-Digit Verification Code
                </label>
                <div className={styles.codeInputContainer}>
                  {verificationCode.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className={`${styles.codeInput} ${digit ? styles.codeInputFilled : ''}`}
                      disabled={isVerifying || isSendingEmail}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
                <p className={styles.codeHint}>
                  Enter the 6-digit code sent to your email
                </p>
              </div>

              {verificationError && (
                <div className={styles.modalError}>
                  {verificationError}
                </div>
              )}

              <button
                type="submit"
                className={styles.verifyBtn}
                disabled={isVerifying || verificationCode.some(d => d === '') || isSendingEmail}
              >
                {isVerifying ? 'Verifying...' : 'Verify Email'}
              </button>

              <div className={styles.resendSection}>
                <button
                  type="button"
                  className={styles.resendBtn}
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0 || isResending || isSendingEmail}
                >
                  {isResending || isSendingEmail
                    ? 'Sending...' 
                    : resendCooldown > 0 
                      ? `Resend in ${resendCooldown}s` 
                      : 'Resend Code'}
                </button>
                <button
                  type="button"
                  className={styles.changeEmailBtn}
                  onClick={() => {
                    setShowVerificationModal(false);
                    setVerificationEmail('');
                    setVerificationCode(['', '', '', '', '', '']);
                    setVerificationError('');
                    setVerificationSuccess(false);
                  }}
                >
                  Change email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;