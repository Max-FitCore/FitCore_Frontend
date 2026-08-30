import React, { useState, useRef } from 'react';
import { Dumbbell, Eye, EyeOff, ArrowRight, Mail, Lock, User, Loader, X, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Signup.module.css';

const API_URL = 'http://localhost:5000/api';

const Signup = () => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Verification modal state
  const [showModal, setShowModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [verificationSuccess, setVerificationSuccess] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  
  const inputRefs = useRef([]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    if (error) setError('');
  };

  // Handle verification code input
  const handleCodeChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...verificationCode];
    newCode[index] = value.slice(0, 1);
    setVerificationCode(newCode);
    setVerificationError('');
    setResendMessage('');

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle keydown for backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text');
    const digits = paste.replace(/\D/g, '').slice(0, 6);
    
    if (digits.length > 0) {
      const newCode = [...verificationCode];
      for (let i = 0; i < digits.length; i++) {
        newCode[i] = digits[i];
      }
      setVerificationCode(newCode);
      
      // Focus the next empty input or last input
      const nextIndex = Math.min(digits.length, 5);
      inputRefs.current[nextIndex].focus();
    }
  };

  // Validate form
  const validateForm = () => {
    const { fullName, email, password, confirmPassword } = formData;

    if (!fullName.trim()) {
      setError('Full name is required');
      return false;
    }

    if (!email.trim()) {
      setError('Email address is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (!agreeTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/signup`, {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });

      if (response.data.success) {
        setSuccessMessage(response.data.message || 'Account created successfully!');
        
        if (response.data.data?.token) {
          localStorage.setItem('token', response.data.data.token);
        }
        
        if (response.data.data?.user) {
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }

        setShowModal(true);
        setVerificationCode(['', '', '', '', '', '']);
        setVerificationError('');
        setVerificationSuccess('');
        setResendMessage('');
      }
    } catch (err) {
      console.error('Signup error:', err);
      
      if (err.response) {
        const errorMessage = err.response.data?.message || 'Signup failed. Please try again.';
        
        if (err.response.status === 400) {
          if (err.response.data?.message?.includes('already exists')) {
            setError('An account with this email already exists. Please sign in instead.');
          } else {
            setError(errorMessage);
          }
        } else if (err.response.status === 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(errorMessage);
        }
      } else if (err.request) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle verification
  const handleVerify = async (e) => {
    e.preventDefault();
    
    const code = verificationCode.join('');
    if (code.length !== 6) {
      setVerificationError('Please enter all 6 digits');
      return;
    }

    setIsVerifying(true);
    setVerificationError('');
    setVerificationSuccess('');

    try {
      const response = await axios.post(`${API_URL}/auth/verify`, {
        email: formData.email,
        otpCode: code
      });

      if (response.data.success) {
        setVerificationSuccess('Email verified successfully!');
        
        if (response.data.data?.token) {
          localStorage.setItem('token', response.data.data.token);
        }
        
        if (response.data.data?.user) {
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }

        setTimeout(() => {
          setShowModal(false);
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err) {
      console.error('Verification error:', err);
      
      if (err.response) {
        const errorMessage = err.response.data?.message || 'Verification failed. Please try again.';
        
        if (err.response.status === 400) {
          if (errorMessage.includes('expired')) {
            setVerificationError('Code has expired. Please request a new one.');
          } else if (errorMessage.includes('Invalid')) {
            setVerificationError('Invalid verification code. Please check and try again.');
          } else {
            setVerificationError(errorMessage);
          }
        } else {
          setVerificationError(errorMessage);
        }
      } else if (err.request) {
        setVerificationError('Network error. Please check your connection.');
      } else {
        setVerificationError('An unexpected error occurred.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle resend
  const handleResendCode = async () => {
    setResendLoading(true);
    setResendMessage('');
    setVerificationError('');

    try {
      const response = await axios.post(`${API_URL}/auth/resend-otp`, {
        email: formData.email
      });

      if (response.data.success) {
        setResendMessage('New verification code sent to your email!');
        setVerificationCode(['', '', '', '', '', '']);
        inputRefs.current[0].focus();
        setTimeout(() => setResendMessage(''), 5000);
      }
    } catch (err) {
      console.error('Resend error:', err);
      if (err.response) {
        setVerificationError(err.response.data?.message || 'Failed to resend code. Please try again.');
      } else {
        setVerificationError('Network error. Please try again.');
      }
    } finally {
      setResendLoading(false);
    }
  };

  const closeModal = () => {
    if (!isVerifying) {
      setShowModal(false);
      navigate('/sign-in');
    }
  };

  // Get verification code as string
  const getVerificationCodeString = () => {
    return verificationCode.join('');
  };

  return (
    <div className={styles.page}>
      {/* Left Panel - Image */}
      <div className={styles.imagePanel}>
        <div className={styles.imageContainer}>
          <div className={styles.imageOverlay} />
        </div>

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

      {/* Right Panel - Form */}
      <div className={styles.formPanel}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h1 className={styles.formTitle}>Create account</h1>
            <p className={styles.formSubtitle}>
              Start your fitness journey today
            </p>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className={styles.successMessage}>
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.signupForm}>
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
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

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
                  value={formData.email}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

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
                  value={formData.password}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  required
                  minLength={6}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className={styles.passwordHint}>
                Must be at least 6 characters with 1 uppercase, 1 lowercase, and 1 number
              </p>
            </div>

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
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className={styles.termsGroup}>
              <label className={styles.termsLabel}>
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  disabled={isLoading}
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

            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader size={18} className={styles.spinner} />
                  Creating account...
                </>
              ) : (
                <>
                  Create account <ArrowRight size={18} />
                </>
              )}
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

      {/* Verification Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button 
              className={styles.modalClose} 
              onClick={closeModal}
              disabled={isVerifying}
            >
              <X size={20} />
            </button>

            <div className={styles.modalIcon}>
              <Mail size={40} strokeWidth={1.5} />
            </div>

            <h2 className={styles.modalTitle}>Verify Your Email</h2>
            
            <p className={styles.modalText}>
              We've sent a verification code to <strong>{formData.email}</strong>. 
              Please enter the 6-digit code below to verify your account.
            </p>

            {verificationError && (
              <div className={styles.verificationError}>
                {verificationError}
              </div>
            )}

            {verificationSuccess && (
              <div className={styles.verificationSuccess}>
                <CheckCircle size={18} />
                {verificationSuccess}
              </div>
            )}

            {resendMessage && (
              <div className={styles.resendMessage}>
                {resendMessage}
              </div>
            )}

            <form onSubmit={handleVerify} className={styles.verificationForm}>
              <div className={styles.codeInputContainer}>
                {verificationCode.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className={`${styles.codeInput} ${digit ? styles.codeInputFilled : ''} ${
                      verificationError ? styles.codeInputError : ''
                    } ${verificationSuccess ? styles.codeInputSuccess : ''}`}
                    disabled={isVerifying || verificationSuccess}
                    autoFocus={index === 0 && !verificationCode[0]}
                  />
                ))}
              </div>

              <button 
                type="submit" 
                className={styles.verifyBtn}
                disabled={isVerifying || verificationSuccess || getVerificationCodeString().length !== 6}
              >
                {isVerifying ? (
                  <>
                    <Loader size={18} className={styles.spinner} />
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </button>
            </form>

            <div className={styles.resendSection}>
              <p className={styles.resendText}>
                Didn't receive the code? 
                <button 
                  onClick={handleResendCode} 
                  className={styles.resendBtn}
                  disabled={resendLoading || verificationSuccess}
                >
                  {resendLoading ? (
                    <>
                      <Loader size={14} className={styles.spinner} />
                      Sending...
                    </>
                  ) : (
                    'Resend Code'
                  )}
                </button>
              </p>
              <p className={styles.resendHint}>
                Check your spam folder if you don't see the email
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;