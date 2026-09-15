import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCog,
  Calendar,
  ClipboardList,
  BookOpen,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  Activity,
  Award,
} from 'lucide-react';
import styles from './AdminAnalytics.module.css';

const API_BASE = 'http://localhost:5000/api';

const parseResponse = async (res) => {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      return await res.json();
    } catch {
      return { success: false, message: `Invalid JSON (${res.status})` };
    }
  }
  const text = await res.text();
  const clean = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return { success: false, message: clean.slice(0, 200) || `HTTP ${res.status}` };
};

const AdminAnalytics = () => {
  const navigate = useNavigate();

  const [overview, setOverview] = useState(null);
  const [recent, setRecent] = useState(null);
  const [classStats, setClassStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');

        const [dashRes, classRes] = await Promise.all([
          fetch(`${API_BASE}/admin/dashboard`, { headers: authHeaders() }),
          fetch(`${API_BASE}/admin/classes/stats/overview`, { headers: authHeaders() }),
        ]);

        const dashData = await parseResponse(dashRes);
        const classData = await parseResponse(classRes);

        if (!dashRes.ok || !dashData.success) {
          throw new Error(dashData.message || `Failed to load overview (${dashRes.status})`);
        }
        if (!classRes.ok || !classData.success) {
          throw new Error(classData.message || `Failed to load class stats (${classRes.status})`);
        }

        setOverview(dashData.data.overview);
        setRecent(dashData.data.recent);
        setClassStats(classData.data);
      } catch (err) {
        setError(err.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Growth chart: newest member signups across last 7 days
  const growthData = useMemo(() => {
    if (!recent?.members) return [];
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        date: d,
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        count: 0,
      });
    }
    recent.members.forEach((m) => {
      const created = new Date(m.createdAt);
      const day = days.find(
        (d) => d.date.toDateString() === created.toDateString()
      );
      if (day) day.count += 1;
    });
    return days;
  }, [recent]);

  // Attendance chart: comes from real backend data
  const attendanceData = useMemo(() => {
    if (!classStats?.byDay) return [];
    const order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return order
      .map((day) => {
        const match = classStats.byDay.find((d) => d.day === day);
        return {
          day,
          value: match?.totalParticipants || 0,
          count: match?.count || 0,
        };
      });
  }, [classStats]);

  if (loading) {
    return (
      <div className={styles.analyticsPage}>
        <div className={styles.stateMessage}>Loading analytics…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.analyticsPage}>
        <div className={`${styles.stateMessage} ${styles.stateError}`}>
          {error}
        </div>
      </div>
    );
  }

  // Stat cards (real)
  const stats = [
    {
      id: 1,
      icon: Users,
      label: 'Active members',
      value: overview.totalMembers,
      accent: 'lime',
      highlight: true,
    },
    {
      id: 2,
      icon: UserCog,
      label: 'Active trainers',
      value: overview.totalTrainers,
      accent: 'violet',
    },
    {
      id: 3,
      icon: Calendar,
      label: 'Active classes',
      value: overview.totalSessions,
      accent: 'cyan',
    },
    {
      id: 4,
      icon: ClipboardList,
      label: 'Workout plans',
      value: overview.totalWorkoutPlans,
      accent: 'amber',
    },
    {
      id: 5,
      icon: BookOpen,
      label: 'Total bookings',
      value: overview.totalBookings,
      accent: 'pink',
    },
  ];

  const maxGrowth = Math.max(1, ...growthData.map((d) => d.count));
  const maxAttendance = Math.max(1, ...attendanceData.map((d) => d.value));
  const totalAttendance = attendanceData.reduce((s, d) => s + d.value, 0);

  return (
    <div className={styles.analyticsPage}>
      {/* ---------- Top Bar ---------- */}
      <div className={styles.topBar}>
        <div>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>Analytics</h1>
            <span className={styles.liveBadge}>
              <span className={styles.liveDot} />
              Live
            </span>
          </div>
          <p className={styles.subtitle}>
            Real-time performance across members, classes, and activity.
          </p>
        </div>
        <button
          className={styles.secondaryBtn}
          onClick={() => navigate('/admin/overview')}
        >
          <Sparkles size={16} />
          Back to overview
          <ArrowUpRight size={14} />
        </button>
      </div>

      {/* ---------- Stats Grid ---------- */}
      <div className={styles.statsGrid}>
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              className={`${styles.statCard} ${styles[`accent_${stat.accent}`]} ${
                stat.highlight ? styles.statCardHighlight : ''
              }`}
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <div className={styles.statGlow} />
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>{stat.label}</span>
                <div className={styles.statIcon}>
                  <Icon size={18} />
                </div>
              </div>
              <div className={styles.statValue}>
                {stat.value.toLocaleString()}
              </div>
              <div className={styles.statFooter}>
                <TrendingUp size={12} />
                <span>Active</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ---------- Highlight row: two real charts ---------- */}
      <div className={styles.chartRow}>
        {/* Attendance chart (real data from classStats.byDay) */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Attendance by day</h3>
              <p className={styles.cardSubtitle}>
                Bookings across all active classes
              </p>
            </div>
            <span className={styles.cardBadge}>
              {totalAttendance.toLocaleString()} total
            </span>
          </div>

          <div className={styles.chartWrap}>
            <div className={styles.chartGrid}>
              {[1, 0.75, 0.5, 0.25, 0].map((p, i) => (
                <div key={i} className={styles.gridLine}>
                  <span className={styles.gridLabel}>
                    {Math.round(maxAttendance * p)}
                  </span>
                </div>
              ))}
            </div>
            <div className={styles.chartBars}>
              {attendanceData.map((d, i) => {
                const heightPct = (d.value / maxAttendance) * 100;
                return (
                  <div key={d.day} className={styles.chartBarCol}>
                    <div className={styles.chartBarTrack}>
                      <div
                        className={`${styles.chartBarFill} ${styles.chartBarCyan}`}
                        style={{
                          height: `${Math.max(heightPct, 3)}%`,
                          animationDelay: `${i * 60}ms`,
                        }}
                      >
                        <span className={styles.chartBarValue}>{d.value}</span>
                      </div>
                    </div>
                    <span className={styles.chartBarLabel}>{d.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Growth chart (from recent members) */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>New members this week</h3>
              <p className={styles.cardSubtitle}>
                Based on the last {recent.members.length} signups
              </p>
            </div>
            <span className={styles.cardBadge}>
              {growthData.reduce((s, d) => s + d.count, 0)} total
            </span>
          </div>

          <div className={styles.chartWrap}>
            <div className={styles.chartGrid}>
              {[1, 0.75, 0.5, 0.25, 0].map((p, i) => (
                <div key={i} className={styles.gridLine}>
                  <span className={styles.gridLabel}>
                    {Math.round(maxGrowth * p)}
                  </span>
                </div>
              ))}
            </div>
            <div className={styles.chartBars}>
              {growthData.map((d, i) => {
                const heightPct = (d.count / maxGrowth) * 100;
                return (
                  <div key={i} className={styles.chartBarCol}>
                    <div className={styles.chartBarTrack}>
                      <div
                        className={styles.chartBarFill}
                        style={{
                          height: `${Math.max(heightPct, 3)}%`,
                          animationDelay: `${i * 60}ms`,
                        }}
                      >
                        <span className={styles.chartBarValue}>{d.count}</span>
                      </div>
                    </div>
                    <span className={styles.chartBarLabel}>{d.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Bottom row: Popular classes + Quick stats ---------- */}
      <div className={styles.bottomRow}>
        {/* Popular classes (real) */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Popular classes</h3>
              <p className={styles.cardSubtitle}>Highest booking count</p>
            </div>
            <button
              className={styles.linkBtn}
              onClick={() => navigate('/admin/classes')}
            >
              View all <ArrowUpRight size={12} />
            </button>
          </div>

          <div className={styles.list}>
            {classStats.popularClasses.length === 0 ? (
              <p className={styles.emptyNote}>No classes booked yet.</p>
            ) : (
              classStats.popularClasses.map((c, idx) => {
                const top = classStats.popularClasses[0]?.bookings || 1;
                const pct = (c.bookings / top) * 100;
                return (
                  <div key={c._id} className={styles.popularItem}>
                    <div className={styles.popularRank}>#{idx + 1}</div>
                    <div className={styles.popularInfo}>
                      <div className={styles.popularTopRow}>
                        <span className={styles.listName}>{c.sessionName}</span>
                        <span className={styles.listTime}>
                          {c.bookings} booking{c.bookings === 1 ? '' : 's'}
                        </span>
                      </div>
                      <div className={styles.popularMetaRow}>
                        <span className={styles.listMeta}>
                          {c.trainer || 'Unassigned'} · {c.day} · {c.time}
                        </span>
                      </div>
                      <div className={styles.progressTrack}>
                        <div
                          className={styles.progressFill}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Aggregated class stats */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Class performance</h3>
              <p className={styles.cardSubtitle}>Aggregated across all classes</p>
            </div>
            <span className={styles.cardBadge}>
              <Activity size={11} style={{ marginRight: 4 }} />
              Live
            </span>
          </div>

          <div className={styles.metricList}>
            <div className={styles.metricItem}>
              <div className={`${styles.metricIcon} ${styles.metricIconLime}`}>
                <Calendar size={16} />
              </div>
              <div className={styles.metricInfo}>
                <span className={styles.metricLabel}>Active classes</span>
                <span className={styles.metricValue}>
                  {classStats.overview.totalClasses}
                </span>
              </div>
            </div>

            <div className={styles.metricItem}>
              <div className={`${styles.metricIcon} ${styles.metricIconCyan}`}>
                <BookOpen size={16} />
              </div>
              <div className={styles.metricInfo}>
                <span className={styles.metricLabel}>Total bookings</span>
                <span className={styles.metricValue}>
                  {classStats.overview.totalBookings}
                </span>
              </div>
            </div>

            <div className={styles.metricItem}>
              <div className={`${styles.metricIcon} ${styles.metricIconViolet}`}>
                <TrendingUp size={16} />
              </div>
              <div className={styles.metricInfo}>
                <span className={styles.metricLabel}>Avg. participants</span>
                <span className={styles.metricValue}>
                  {classStats.overview.averageParticipants}
                </span>
              </div>
            </div>

            <div className={styles.metricItem}>
              <div className={`${styles.metricIcon} ${styles.metricIconAmber}`}>
                <Award size={16} />
              </div>
              <div className={styles.metricInfo}>
                <span className={styles.metricLabel}>Top class bookings</span>
                <span className={styles.metricValue}>
                  {classStats.popularClasses[0]?.bookings || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;