import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  CreditCard
} from 'lucide-react';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const overview = {
    title: 'Gym overview',
    subtitle: 'August 2026 performance across all locations.',
  };

  const stats = [
    {
      id: 1,
      icon: DollarSign,
      label: 'Monthly revenue',
      value: '$33,480',
      badge: '7.6%',
      trend: 'up',
      note: 'vs $31,120 last month',
      highlight: true,
    },
    {
      id: 2,
      icon: Users,
      label: 'Active members',
      value: '351',
      badge: '6.9%',
      trend: 'up',
      note: '+23 this month',
    },
    {
      id: 3,
      icon: TrendingUp,
      label: 'Check-ins this week',
      value: '1,187',
      badge: '4.1%',
      trend: 'up',
    },
    {
      id: 4,
      icon: CreditCard,
      label: 'Pending payments',
      value: '$1,240',
      badge: '2.3%',
      trend: 'down',
      note: '7 invoices',
    },
  ];

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const planMix = [
    { id: 1, name: 'Basic', count: 148, percent: 42 },
    { id: 2, name: 'Premium', count: 132, percent: 38 },
    { id: 3, name: 'VIP', count: 71, percent: 20 },
  ];

  const needsAttention = [
    { id: 1, type: 'alert', name: 'Lina Farouk', meta: 'Basic plan', status: 'Expiring' },
    { id: 2, type: 'alert', name: 'Nour Salem', meta: 'Basic plan', status: 'Expired' },
    { id: 3, type: 'activity', name: 'Karim Zaki checked in', time: 'Today · 06:42' },
    { id: 4, type: 'activity', name: 'Omar Haddad checked in', time: 'Today · 07:15' },
  ];

  const handleAnalyticsClick = () => {
    navigate('/admin/analytics');
  };

  return (
    <div className={styles.dashboard}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.title}>{overview.title}</h1>
          <p className={styles.subtitle}>{overview.subtitle}</p>
        </div>
        <button className={styles.secondaryBtn} onClick={handleAnalyticsClick}>
          Full analytics
        </button>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'down' ? TrendingDown : TrendingUp;
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
                <span className={`${styles.statBadge} ${stat.trend === 'down' ? styles.statBadgeDown : ''}`}>
                  <TrendIcon size={10} />
                  {stat.badge}
                </span>
                {stat.note && <span className={styles.statNote}>{stat.note}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Row: Revenue Growth + Plan Mix */}
      <div className={styles.topRow}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Revenue growth</h3>
          <div className={styles.chartArea} />
          <div className={styles.chartLabels}>
            {months.map((month) => (
              <span key={month} className={styles.chartLabel}>{month}</span>
            ))}
          </div>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Plan mix</h3>
          <div className={styles.planMixList}>
            {planMix.map((plan) => (
              <div key={plan.id} className={styles.planMixItem}>
                <div className={styles.planMixRow}>
                  <span className={styles.planMixName}>{plan.name}</span>
                  <span className={styles.planMixCount}>{plan.count} · {plan.percent}%</span>
                </div>
                <div className={styles.progressTrack}>
                  <div className={styles.progressFill} style={{ width: `${plan.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Weekly Check-ins + Needs Attention */}
      <div className={styles.bottomRow}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Weekly check-ins</h3>
          <div className={styles.chartArea} />
          <div className={styles.chartLabels}>
            {weekDays.map((day) => (
              <span key={day} className={styles.chartLabel}>{day}</span>
            ))}
          </div>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Needs attention</h3>
          <div className={styles.attentionList}>
            {needsAttention.map((item) => (
              <div key={item.id} className={styles.attentionItem}>
                {item.type === 'alert' ? (
                  <>
                    <div>
                      <p className={styles.attentionName}>{item.name}</p>
                      <p className={styles.attentionMeta}>{item.meta}</p>
                    </div>
                    <span
                      className={`${styles.statusBadge} ${
                        item.status === 'Expiring' ? styles.statusExpiring : styles.statusExpired
                      }`}
                    >
                      {item.status}
                    </span>
                  </>
                ) : (
                  <>
                    <p className={styles.attentionName}>{item.name}</p>
                    <span className={styles.attentionTime}>{item.time}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;