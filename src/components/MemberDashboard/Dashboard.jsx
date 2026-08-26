import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dumbbell,
  Timer,
  Flame,
  CalendarCheck,
  TrendingUp
} from 'lucide-react';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const navigate = useNavigate();

  // Mock user data
  const user = {
    name: 'Sara',
    planLabel: 'Hypertrophy Block A',
    week: 5,
    statusNote: "you're ahead of schedule.",
  };

  // Stat cards
  const stats = [
    {
      id: 1,
      icon: Dumbbell,
      label: 'Workouts this week',
      value: '5',
      badge: '12%',
      note: 'of 6 planned',
      highlight: true,
    },
    {
      id: 2,
      icon: Timer,
      label: 'Active minutes',
      value: '315',
      badge: '8%',
      note: 'last 7 days',
    },
    {
      id: 3,
      icon: Flame,
      label: 'Current streak',
      value: '12 days',
      badge: '4%',
      note: 'personal best 18',
    },
    {
      id: 4,
      icon: CalendarCheck,
      label: 'Classes booked',
      value: '3',
      note: 'this week',
    },
  ];

  // Weekly activity (relative bar heights)
  const weeklyActivity = [
    { day: 'Mon', value: 35 },
    { day: 'Tue', value: 50 },
    { day: 'Wed', value: 30 },
    { day: 'Thu', value: 55 },
    { day: 'Fri', value: 65 },
    { day: 'Sat', value: 45 },
    { day: 'Sun', value: 25 },
  ];

  // Membership
  const membership = {
    plan: 'Premium plan',
    renews: 'Renews 14 Sep 2026',
    status: 'Active',
    progress: 88,
  };

  // Upcoming sessions
  const sessions = [
    { id: 1, name: 'PT Session — Lower body', meta: 'Marcus Vale · Studio 2', time: 'Today · 18:00' },
    { id: 2, name: 'Mobility Flow', meta: 'Elena Rossi · Studio 1', time: 'Tue · 09:00' },
    { id: 3, name: 'Barbell Strength', meta: 'Marcus Vale · Main floor', time: 'Wed · 07:00' },
  ];

  // Plan progress
  const planProgress = [
    { id: 1, name: 'Hypertrophy Block A', percent: 62 },
    { id: 2, name: 'Fat Loss Conditioning', percent: 25 },
  ];

  // Navigation handlers
  const handleStartWorkout = () => {
    navigate('/workout-plans');
  };

  const handleManageBilling = () => {
    navigate('/membership');
  };

  return (
    <div className={styles.dashboard}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.title}>Welcome back, {user.name}</h1>
          <p className={styles.subtitle}>
            Week {user.week} of {user.planLabel} — {user.statusNote}
          </p>
        </div>
        <button className={styles.startBtn} onClick={handleStartWorkout}>
          Start workout
        </button>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              className={`${styles.statCard} ${stat.highlight ? styles.statCardHighlight : ''}`}
            >
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>{stat.label}</span>
                <div className={`${styles.statIcon} ${stat.highlight ? styles.statIconHighlight : ''}`}>
                  <Icon size={16} />
                </div>
              </div>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statMeta}>
                {stat.badge && (
                  <span className={styles.statBadge}>
                    <TrendingUp size={10} />
                    {stat.badge}
                  </span>
                )}
                <span className={styles.statNote}>{stat.note}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Row: Weekly Activity + Membership */}
      <div className={styles.topRow}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Weekly activity</h3>
          <div className={styles.weeklyChart}>
            {weeklyActivity.map((day) => (
              <div key={day.day} className={styles.barCol}>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ height: `${day.value}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className={styles.weeklyLabels}>
            {weeklyActivity.map((day) => (
              <span key={day.day} className={styles.barDay}>{day.day}</span>
            ))}
          </div>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Membership</h3>
          <p className={styles.membershipPlan}>{membership.plan}</p>
          <div className={styles.membershipRow}>
            <span className={styles.membershipRenew}>{membership.renews}</span>
            <span className={styles.statusBadge}>{membership.status}</span>
          </div>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${membership.progress}%` }} />
          </div>
          <button className={styles.manageBtn} onClick={handleManageBilling}>
            Manage billing
          </button>
        </div>
      </div>

      {/* Bottom Row: Upcoming Sessions + Plan Progress */}
      <div className={styles.bottomRow}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Upcoming sessions</h3>
          <div className={styles.sessionList}>
            {sessions.map((session) => (
              <div key={session.id} className={styles.sessionItem}>
                <div>
                  <p className={styles.sessionName}>{session.name}</p>
                  <p className={styles.sessionMeta}>{session.meta}</p>
                </div>
                <span className={styles.sessionTime}>{session.time}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Plan progress</h3>
          <div className={styles.planList}>
            {planProgress.map((plan) => (
              <div key={plan.id} className={styles.planItem}>
                <div className={styles.planRow}>
                  <span className={styles.planName}>{plan.name}</span>
                  <span className={styles.planPercent}>{plan.percent}%</span>
                </div>
                <div className={styles.progressTrack}>
                  <div className={styles.progressFill} style={{ width: `${plan.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;