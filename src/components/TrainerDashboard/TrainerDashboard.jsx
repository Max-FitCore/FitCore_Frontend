import React from 'react';
import {
  Users,
  Calendar,
  ClipboardList,
  Star,
  TrendingUp
} from 'lucide-react';
import styles from './TrainerDashboard.module.css';

const LEVEL_CLASS = {
  Beginner: 'levelBeginner',
  Intermediate: 'levelIntermediate',
  Advanced: 'levelAdvanced',
};

const TrainerDashboard = () => {
  const trainer = {
    name: 'Marcus',
    scheduleNote: "3 sessions and 1 class on today's schedule.",
  };

  const stats = [
    {
      id: 1,
      icon: Users,
      label: 'Assigned members',
      value: '34',
      badge: '11%',
      note: '4 new this month',
      highlight: true,
    },
    {
      id: 2,
      icon: Calendar,
      label: 'Sessions this week',
      value: '21',
      badge: '5%',
    },
    {
      id: 3,
      icon: ClipboardList,
      label: 'Active plans',
      value: '12',
      badge: '2%',
    },
    {
      id: 4,
      icon: Star,
      label: 'Average rating',
      value: '4.9',
      note: '128 reviews',
    },
  ];

  const todaysClasses = [
    { id: 1, name: 'Barbell Strength', meta: 'Mon · 07:00 · 12/16 booked', level: 'Intermediate' },
    { id: 2, name: 'Olympic Lifting', meta: 'Wed · 19:00 · 8/10 booked', level: 'Advanced' },
  ];

  const memberProgress = [
    { id: 1, name: 'Sara Nabil', percent: 78 },
    { id: 2, name: 'Omar Haddad', percent: 64 },
  ];

  const authoredPlans = [
    { id: 1, name: 'Hypertrophy Block A', meta: 'Build lean muscle · 8 weeks', level: 'Intermediate', percent: 60 },
    { id: 2, name: 'Fat Loss Conditioning', meta: 'Lose body fat · 6 weeks', level: 'Beginner', percent: 40 },
  ];

  return (
    <div className={styles.dashboard}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.title}>Good evening, {trainer.name}</h1>
          <p className={styles.subtitle}>{trainer.scheduleNote}</p>
        </div>
        <button className={styles.createBtn}>Create plan</button>
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
                {stat.note && <span className={styles.statNote}>{stat.note}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Row: Today's Classes + Member Progress */}
      <div className={styles.topRow}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Today's classes</h3>
          <div className={styles.classList}>
            {todaysClasses.map((cls) => (
              <div key={cls.id} className={styles.classItem}>
                <div>
                  <p className={styles.classItemName}>{cls.name}</p>
                  <p className={styles.classItemMeta}>{cls.meta}</p>
                </div>
                <span className={`${styles.levelBadge} ${styles[LEVEL_CLASS[cls.level]]}`}>
                  {cls.level}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Member progress</h3>
          <div className={styles.progressList}>
            {memberProgress.map((member) => (
              <div key={member.id} className={styles.progressItem}>
                <div className={styles.progressRow}>
                  <span className={styles.progressName}>{member.name}</span>
                  <span className={styles.progressPercent}>{member.percent}%</span>
                </div>
                <div className={styles.progressTrack}>
                  <div className={styles.progressFill} style={{ width: `${member.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Plans You Authored */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Plans you authored</h3>
        <div className={styles.planGrid}>
          {authoredPlans.map((plan) => (
            <div key={plan.id} className={styles.planCard}>
              <div className={styles.planRow}>
                <span className={styles.planName}>{plan.name}</span>
                <span className={`${styles.levelBadge} ${styles[LEVEL_CLASS[plan.level]]}`}>
                  {plan.level}
                </span>
              </div>
              <p className={styles.planMeta}>{plan.meta}</p>
              <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width: `${plan.percent}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrainerDashboard;