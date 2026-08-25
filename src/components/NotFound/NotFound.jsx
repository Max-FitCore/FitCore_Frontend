import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Dumbbell, Users, Calendar, HelpCircle } from 'lucide-react';
import styles from './NotFound.module.css';

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className={styles.notFound}>
      {/* Background Decorations */}
      <div className={`${styles.bgDecoration} ${styles.bgDecoration1}`} />
      <div className={`${styles.bgDecoration} ${styles.bgDecoration2}`} />

      {/* Main Content */}
      <div className={styles.content}>
        {/* Animated Icon */}
        <div className={styles.iconWrapper}>
          <Dumbbell size={40} className={styles.icon} />
        </div>

        {/* 404 Code */}
        <h1 className={styles.errorCode}>404</h1>

        {/* Text Content */}
        <h2 className={styles.title}>Page not found</h2>
        <p className={styles.subtitle}>
          Looks like you've wandered off the workout floor. 
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button className={styles.primaryBtn} onClick={handleGoHome}>
            <Home size={18} />
            Back to home
          </button>
          <button className={styles.secondaryBtn} onClick={handleGoBack}>
            <ArrowLeft size={18} />
            Go back
          </button>
        </div>

        {/* Quick Links */}
        <div className={styles.quickLinks}>
          <button className={styles.quickLink} onClick={() => navigate('/dashboard')}>
            <Users size={14} />
            Members
          </button>
          <button className={styles.quickLink} onClick={() => navigate('/trainer/overview')}>
            <Dumbbell size={14} />
            Trainers
          </button>
          <button className={styles.quickLink} onClick={() => navigate('/admin/overview')}>
            <Calendar size={14} />
            Admin
          </button>
          <button className={styles.quickLink} onClick={() => navigate('/sign-in')}>
            <HelpCircle size={14} />
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;