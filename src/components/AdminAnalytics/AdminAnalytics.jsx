import React from 'react';
import { DollarSign, UserPlus, RefreshCw, TrendingUp } from 'lucide-react';
import styles from './AdminAnalytics.module.css';

const Analytics = () => {
  // Stats data
  const stats = [
    {
      id: 1,
      icon: DollarSign,
      label: 'YTD revenue',
      value: '$201,780',
      badge: '18%',
      note: '',
      highlight: true,
    },
    {
      id: 2,
      icon: UserPlus,
      label: 'New members',
      value: '141',
      badge: '12%',
      note: 'since January',
      highlight: false,
    },
    {
      id: 3,
      icon: RefreshCw,
      label: 'Retention rate',
      value: '91%',
      badge: '3%',
      note: '',
      highlight: false,
    },
    {
      id: 4,
      icon: TrendingUp,
      label: 'Avg. visits / member',
      value: '11.4',
      badge: '5%',
      note: 'per month',
      highlight: false,
    },
  ];

  // Revenue vs Member Growth data (Jan - Aug)
  const revenueData = [
    { month: 'Jan', revenue: 18000, members: 12 },
    { month: 'Feb', revenue: 22000, members: 18 },
    { month: 'Mar', revenue: 25000, members: 22 },
    { month: 'Apr', revenue: 28000, members: 20 },
    { month: 'May', revenue: 24000, members: 16 },
    { month: 'Jun', revenue: 30000, members: 25 },
    { month: 'Jul', revenue: 32000, members: 28 },
    { month: 'Aug', revenue: 22780, members: 20 },
  ];

  const maxRevenue = Math.max(...revenueData.map(d => d.revenue));
  const maxMembers = Math.max(...revenueData.map(d => d.members));

  // Attendance by day
  const attendanceData = [
    { day: 'Mon', value: 65 },
    { day: 'Tue', value: 55 },
    { day: 'Wed', value: 70 },
    { day: 'Thu', value: 60 },
    { day: 'Fri', value: 80 },
    { day: 'Sat', value: 90 },
    { day: 'Sun', value: 45 },
  ];

  const maxAttendance = Math.max(...attendanceData.map(d => d.value));

  // Membership distribution
  const distributionData = [
    { name: 'Basic', count: 148, percent: 42 },
    { name: 'Premium', count: 132, percent: 38 },
    { name: 'VIP', count: 71, percent: 20 },
  ];

  return (
    <div className={styles.analyticsPage}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Analytics</h1>
        <p className={styles.subtitle}>Eight-month performance trend.</p>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              className={`${styles.statCard} ${
                stat.highlight ? styles.statCardHighlight : ''
              }`}
            >
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>{stat.label}</span>
                <div
                  className={`${styles.statIcon} ${
                    stat.highlight ? styles.statIconHighlight : ''
                  }`}
                >
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
                {stat.note && (
                  <span className={styles.statNote}>{stat.note}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue vs Member Growth Chart */}
      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>Revenue vs member growth</h3>
        <div className={styles.revenueChart}>
          {revenueData.map((data) => (
            <div key={data.month} className={styles.chartBarGroup}>
              <div className={styles.chartBars}>
                <div
                  className={`${styles.chartBar} ${styles.chartBarRevenue}`}
                  style={{
                    height: `${(data.revenue / maxRevenue) * 100}%`,
                  }}
                  title={`Revenue: $${data.revenue.toLocaleString()}`}
                />
                <div
                  className={`${styles.chartBar} ${styles.chartBarMembers}`}
                  style={{
                    height: `${(data.members / maxMembers) * 100}%`,
                  }}
                  title={`Members: ${data.members}`}
                />
              </div>
              <span className={styles.chartMonth}>{data.month}</span>
            </div>
          ))}
        </div>
        <div className={styles.chartLegend}>
          <div className={styles.legendItem}>
            <div className={`${styles.legendDot} ${styles.legendDotRevenue}`} />
            <span>Revenue</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendDot} ${styles.legendDotMembers}`} />
            <span>Members</span>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className={styles.bottomRow}>
        {/* Attendance by Day */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Attendance by day</h3>
          <div className={styles.attendanceChart}>
            {attendanceData.map((data) => (
              <div key={data.day} className={styles.attendanceBarCol}>
                <div
                  className={styles.attendanceBar}
                  style={{
                    height: `${(data.value / maxAttendance) * 100}%`,
                  }}
                  title={`${data.day}: ${data.value}%`}
                />
                <span className={styles.attendanceDay}>{data.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Membership Distribution */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Membership distribution</h3>
          <div className={styles.distributionList}>
            {distributionData.map((item) => (
              <div key={item.name} className={styles.distributionItem}>
                <div className={styles.distributionHeader}>
                  <span className={styles.distributionName}>{item.name}</span>
                  <span className={styles.distributionStats}>
                    {item.count} · {item.percent}%
                  </span>
                </div>
                <div className={styles.distributionTrack}>
                  <div
                    className={styles.distributionFill}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;