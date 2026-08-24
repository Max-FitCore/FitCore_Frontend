import React, { useState, useEffect } from 'react';
import { CheckCircle, User, TrendingUp, Check } from 'lucide-react';
import styles from './TrainerAttendance.module.css';

const Attendance = () => {
  // Class register data
  const initialMembers = [
    { id: 1, name: 'Sara Nabil', plan: 'Premium plan', present: true },
    { id: 2, name: 'Omar Haddad', plan: 'VIP plan', present: true },
    { id: 3, name: 'Lina Farouk', plan: 'Basic plan', present: false },
    { id: 4, name: 'Youssef Adel', plan: 'Premium plan', present: false },
    { id: 5, name: 'Nour Salem', plan: 'Basic plan', present: false },
    { id: 6, name: 'Karim Zaki', plan: 'VIP plan', present: false },
  ];

  const [members, setMembers] = useState(initialMembers);
  const [isSaved, setIsSaved] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Recent check-ins data
  const recentCheckins = [
    { id: 1, name: 'Karim Zaki', meta: 'Today · 06:42 · QR' },
    { id: 2, name: 'Omar Haddad', meta: 'Today · 07:15 · QR' },
    { id: 3, name: 'Sara Nabil', meta: 'Today · 08:03 · Front desk' },
    { id: 4, name: 'Youssef Adel', meta: 'Yesterday · 18:22 · QR' },
    { id: 5, name: 'Lina Farouk', meta: 'Yesterday · 19:05 · QR' },
  ];

  // Calculate stats
  const presentCount = members.filter((m) => m.present).length;
  const absentCount = members.filter((m) => !m.present).length;
  const attendanceRate = Math.round((presentCount / members.length) * 100);

  // Toggle attendance for a member
  const toggleAttendance = (id) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, present: !m.present } : m))
    );
    setIsSaved(false);
  };

  // Save register
  const handleSave = () => {
    setIsSaved(true);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Auto-dismiss toast
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  return (
    <div className={styles.attendance}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Attendance</h1>
          <p className={styles.subtitle}>Barbell Strength · Monday 07:00 · Main floor</p>
        </div>
        <button
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={isSaved}
        >
          {isSaved ? 'Saved ✓' : 'Save register'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {/* Present Card */}
        <div className={`${styles.statCard} ${styles.statCardHighlight}`}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Present</span>
            <div className={`${styles.statIcon} ${styles.statIconHighlight}`}>
              <CheckCircle size={16} />
            </div>
          </div>
          <div className={styles.statValue}>{presentCount}</div>
        </div>

        {/* Absent Card */}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Absent</span>
            <div className={styles.statIcon}>
              <User size={16} />
            </div>
          </div>
          <div className={styles.statValue}>{absentCount}</div>
        </div>

        {/* Attendance Rate Card */}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Attendance rate</span>
            <div className={styles.statIcon}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div className={styles.statValue}>{attendanceRate}%</div>
          <div className={styles.statMeta}>
            <span className={styles.statBadge}>
              <TrendingUp size={10} />
              4%
            </span>
            <span className={styles.statNote}>last 30 days</span>
          </div>
        </div>
      </div>

      {/* Class Register */}
      <div className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>Class register</h3>
        <div className={styles.registerList}>
          {members.map((member) => (
            <div key={member.id} className={styles.registerItem}>
              <div className={styles.memberInfo}>
                <p className={styles.memberName}>{member.name}</p>
                <p className={styles.memberPlan}>{member.plan}</p>
              </div>
              <button
                className={`${styles.toggleBtn} ${
                  member.present ? styles.toggleBtnPresent : styles.toggleBtnAbsent
                }`}
                onClick={() => toggleAttendance(member.id)}
              >
                {member.present ? 'Present' : 'Mark present'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Check-ins */}
      <div className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>Recent check-ins</h3>
        <div className={styles.checkinList}>
          {recentCheckins.map((checkin) => (
            <div key={checkin.id} className={styles.checkinItem}>
              <p className={styles.checkinName}>{checkin.name}</p>
              <span className={styles.checkinMeta}>{checkin.meta}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Success Toast */}
      {showToast && (
        <div className={styles.toast}>
          <div className={styles.toastIcon}>
            <Check size={16} />
          </div>
          Register saved successfully!
        </div>
      )}
    </div>
  );
};

export default Attendance;