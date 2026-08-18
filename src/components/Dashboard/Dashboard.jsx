import React from 'react';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  return (
    <div className={styles.dashboard}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.pageSubtitle}>Welcome back, John! Here's your fitness overview.</p>
        </div>
        <button className={styles.btnPrimary}>+ New Workout</button>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>💪</div>
          <div>
            <div className={styles.statNumber}>24</div>
            <div className={styles.statLabel}>Workouts This Month</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🔥</div>
          <div>
            <div className={styles.statNumber}>1,847</div>
            <div className={styles.statLabel}>Calories Burned</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📅</div>
          <div>
            <div className={styles.statNumber}>12</div>
            <div className={styles.statLabel}>Days Active</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🏆</div>
          <div>
            <div className={styles.statNumber}>8</div>
            <div className={styles.statLabel}>Achievements</div>
          </div>
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Upcoming Sessions</h2>
        <div className={styles.sessionList}>
          <div className={styles.sessionItem}>
            <div className={styles.sessionTime}>
              <span className={styles.sessionTimeHour}>09:00</span>
              <span className={styles.sessionTimeAm}>AM</span>
            </div>
            <div className={styles.sessionInfo}>
              <h4 className={styles.sessionName}>Morning HIIT</h4>
              <p className={styles.sessionDetails}>Trainer: Sarah Johnson • 45 min</p>
            </div>
            <span className={styles.sessionStatus}>Today</span>
          </div>
          <div className={styles.sessionItem}>
            <div className={styles.sessionTime}>
              <span className={styles.sessionTimeHour}>14:30</span>
              <span className={styles.sessionTimeAm}>PM</span>
            </div>
            <div className={styles.sessionInfo}>
              <h4 className={styles.sessionName}>Strength Training</h4>
              <p className={styles.sessionDetails}>Trainer: Mike Chen • 60 min</p>
            </div>
            <span className={styles.sessionStatus}>Today</span>
          </div>
          <div className={styles.sessionItem}>
            <div className={styles.sessionTime}>
              <span className={styles.sessionTimeHour}>18:00</span>
              <span className={styles.sessionTimeAm}>PM</span>
            </div>
            <div className={styles.sessionInfo}>
              <h4 className={styles.sessionName}>Yoga Flow</h4>
              <p className={styles.sessionDetails}>Trainer: Emily Rodriguez • 50 min</p>
            </div>
            <span className={`${styles.sessionStatus} ${styles.sessionStatusUpcoming}`}>Tomorrow</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;