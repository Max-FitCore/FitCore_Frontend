import React, { useState, useRef, useEffect } from 'react';
import { Dumbbell, ArrowRight, Mail, CheckCircle, AlertCircle, Lock, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './ForgotPassword.module.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  
  // Step management
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  
  // Email step
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // OTP step
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  
  // Password step
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Auto-focus first OTP input on step change
  useEffect(() => {
    if (step === 2 && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [step]);

  // OTP Timer
  useEffect(() => {
    if (step === 2 && otpTimer > 0) {
      const timer = setTimeout(() => {
        setOtpTimer(otpTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (otpTimer === 0) {
      setCanResend(true);
    }
  }, [step, otpTimer]);

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);
    setOtpError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle OTP keydown (backspace)
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const numbers = pastedData.replace(/\D/g, '').slice(0, 6);
    
    if (numbers) {
      const newOtp = [...otp];
      numbers.split('').forEach((char, index) => {
        if (index < 6) newOtp[index] = char;
      });
      setOtp(newOtp);
      
      // Focus last filled input
      const lastIndex = Math.min(numbers.length, 5);
      if (inputRefs.current[lastIndex]) {
        inputRefs.current[lastIndex].focus();
      }
    }
  };

  // STEP 1: Submit Email
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');

    // Validate email
    if (!email) {
      setEmailError('Please enter your email address');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    // Simulate API call to send OTP
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // Mock success - in real app, check if email exists
      setStep(2);
      setOtpTimer(60);
      setCanResend(false);
    } catch (err) {
      setEmailError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2: Verify OTP
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      setOtpError('Please enter all 6 digits');
      return;
    }

    setIsOtpLoading(true);

    // Simulate API call to verify OTP
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      // Mock verification - in real app, verify OTP
      setStep(3);
    } catch (err) {
      setOtpError('Invalid verification code. Please try again.');
    } finally {
      setIsOtpLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    
    setIsOtpLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setOtpTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      setOtpError('');
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } catch (err) {
      setOtpError('Failed to resend code. Please try again.');
    } finally {
      setIsOtpLoading(false);
    }
  };

  // STEP 3: Set New Password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    // Validate password
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setIsPasswordLoading(true);

    // Simulate API call to reset password
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSuccess(true);
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/sign-in');
      }, 2000);
    } catch (err) {
      setPasswordError('Something went wrong. Please try again.');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  // Render email step
  const renderEmailStep = () => (
    <>
      <div className={styles.stepIndicator}>
        <span className={`${styles.stepDot} ${styles.active}`}>1</span>
        <span className={styles.stepLine}></span>
        <span className={styles.stepDot}>2</span>
        <span className={styles.stepLine}></span>
        <span className={styles.stepDot}>3</span>
      </div>

      <div className={styles.forgotHeader}>
        <div className={styles.lockIcon}>🔐</div>
        <h1 className={styles.forgotTitle}>Forgot password?</h1>
        <p className={styles.forgotSubtitle}>
          Enter your email and we'll send you a verification code to reset your password.
        </p>
      </div>

      <form onSubmit={handleEmailSubmit} className={styles.forgotForm}>
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
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError('');
              }}
              className={`${styles.formInput} ${emailError ? styles.inputError : ''}`}
              required
              disabled={isLoading}
            />
            {emailError && (
              <div className={styles.errorIcon}>
                <AlertCircle size={18} />
              </div>
            )}
          </div>
          {emailError && (
            <p className={styles.errorMessage}>{emailError}</p>
          )}
        </div>

        <button 
          type="submit" 
          className={styles.submitBtn}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className={styles.spinner}></span>
              Sending code...
            </>
          ) : (
            <>
              Send verification code <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <div className={styles.forgotFooter}>
        <p className={styles.footerText}>
          Remember your password?{' '}
          <Link to="/sign-in" className={styles.footerLink}>
            Sign in instead
          </Link>
        </p>
      </div>
    </>
  );

  // Render OTP step
  const renderOtpStep = () => (
    <>
      <div className={styles.stepIndicator}>
        <span className={styles.stepDot}>1</span>
        <span className={styles.stepLine}></span>
        <span className={`${styles.stepDot} ${styles.active}`}>2</span>
        <span className={styles.stepLine}></span>
        <span className={styles.stepDot}>3</span>
      </div>

      <div className={styles.forgotHeader}>
        <h2 className={styles.otpTitle}>Enter verification code</h2>
        <p className={styles.otpSubtitle}>
          We've sent a 6-digit code to <strong className={styles.emailHighlight}>{email}</strong>
        </p>
      </div>

      <form onSubmit={handleOtpSubmit} className={styles.otpForm}>
        <div className={styles.otpInputs}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(index, e)}
              onPaste={index === 0 ? handleOtpPaste : undefined}
              className={`${styles.otpInput} ${otpError ? styles.otpInputError : ''}`}
              disabled={isOtpLoading}
            />
          ))}
        </div>
        {otpError && (
          <p className={styles.errorMessage}>{otpError}</p>
        )}

        <div className={styles.otpActions}>
          <button
            type="button"
            onClick={handleResendOtp}
            className={`${styles.resendBtn} ${!canResend ? styles.resendDisabled : ''}`}
            disabled={!canResend || isOtpLoading}
          >
            {canResend ? 'Resend code' : `Resend in ${otpTimer}s`}
          </button>
        </div>

        <button 
          type="submit" 
          className={styles.submitBtn}
          disabled={isOtpLoading}
        >
          {isOtpLoading ? (
            <>
              <span className={styles.spinner}></span>
              Verifying...
            </>
          ) : (
            <>
              Verify code <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <div className={styles.forgotFooter}>
        <button
          type="button"
          onClick={() => setStep(1)}
          className={styles.backBtn}
        >
          ← Back to email
        </button>
      </div>
    </>
  );

  // Render password step
  const renderPasswordStep = () => {
    if (isSuccess) {
      return (
        <div className={styles.successState}>
          <div className={styles.successIcon}>
            <CheckCircle size={48} strokeWidth={1.5} />
          </div>
          <h2 className={styles.successTitle}>Password reset successful!</h2>
          <p className={styles.successDescription}>
            Your password has been updated. Redirecting to login...
          </p>
        </div>
      );
    }

    return (
      <>
        <div className={styles.stepIndicator}>
          <span className={styles.stepDot}>1</span>
          <span className={styles.stepLine}></span>
          <span className={styles.stepDot}>2</span>
          <span className={styles.stepLine}></span>
          <span className={`${styles.stepDot} ${styles.active}`}>3</span>
        </div>

        <div className={styles.forgotHeader}>
          <h2 className={styles.otpTitle}>Set new password</h2>
          <p className={styles.otpSubtitle}>
            Choose a strong password for your account
          </p>
        </div>

        <form onSubmit={handlePasswordSubmit} className={styles.passwordForm}>
          {/* New Password */}
          <div className={styles.formGroup}>
            <label htmlFor="newPassword" className={styles.formLabel}>
              New password
            </label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordError('');
                }}
                className={`${styles.formInput} ${passwordError ? styles.inputError : ''}`}
                required
                disabled={isPasswordLoading}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                disabled={isPasswordLoading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className={styles.passwordHint}>Must be at least 8 characters</p>
          </div>

          {/* Confirm Password */}
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
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordError('');
                }}
                className={`${styles.formInput} ${passwordError ? styles.inputError : ''}`}
                required
                disabled={isPasswordLoading}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isPasswordLoading}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {passwordError && (
              <p className={styles.errorMessage}>{passwordError}</p>
            )}
          </div>

          <button 
            type="submit" 
            className={styles.submitBtn}
            disabled={isPasswordLoading}
          >
            {isPasswordLoading ? (
              <>
                <span className={styles.spinner}></span>
                Resetting password...
              </>
            ) : (
              <>
                Reset password <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className={styles.forgotFooter}>
          <button
            type="button"
            onClick={() => setStep(2)}
            className={styles.backBtn}
          >
            ← Back to verification
          </button>
        </div>
      </>
    );
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
          <Link to="/sign-up" className={styles.primaryBtn}>
            Join now
          </Link>
        </div>
      </header>

      {/* Forgot Password Form */}
      <section className={styles.forgotSection}>
        <div className={styles.forgotContainer}>
          <div className={styles.forgotCard}>
            {step === 1 && renderEmailStep()}
            {step === 2 && renderOtpStep()}
            {step === 3 && renderPasswordStep()}
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

export default ForgotPassword;