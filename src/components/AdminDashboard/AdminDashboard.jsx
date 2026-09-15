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
} from 'lucide-react';
import styles from './AdminDashboard.module.css';

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

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [overview, setOverview] = useState(null);
  const [recent, setRecent] = useState(null);
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
        const res = await fetch(`${API_BASE}/admin/dashboard`, {
          headers: authHeaders(),
        });
        const data = await parseResponse(res);
        if (!res.ok || !data.success) {
          throw new Error(data.message || `Failed to load dashboard (${res.status})`);
        }
        setOverview(data.data.overview);
        setRecent(data.data.recent);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAnalyticsClick = () => navigate('/admin/analytics');

  // Build a real "activity growth" chart from recent members created dates
  // grouped by day for the last 7 days
  const memberActivity = useMemo(() => {
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

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.stateMessage}>Loading dashboard…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboard}>
        <div className={`${styles.stateMessage} ${styles.stateError}`}>
          {error}
        </div>
      </div>
    );
  }

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

  const maxCount = Math.max(1, ...memberActivity.map((d) => d.count));

  return (
    <div className={styles.dashboard}>
      {/* ---------- Top Bar ---------- */}
      <div className={styles.topBar}>
        <div>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>Gym overview</h1>
            <span className={styles.liveBadge}>
              <span className={styles.liveDot} />
              Live
            </span>
          </div>
          <p className={styles.subtitle}>
            Live snapshot of members, trainers, and classes.
          </p>
        </div>
        <button className={styles.secondaryBtn} onClick={handleAnalyticsClick}>
          <Sparkles size={16} />
          Full analytics
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

      {/* ---------- Activity chart (real data) ---------- */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h3 className={styles.cardTitle}>New members this week</h3>
            <p className={styles.cardSubtitle}>
              Based on the {recent.members.length} most recent signups
            </p>
          </div>
          <span className={styles.cardBadge}>
            {memberActivity.reduce((s, d) => s + d.count, 0)} total
          </span>
        </div>

        <div className={styles.chartWrap}>
          {/* Gridlines */}
          <div className={styles.chartGrid}>
            {[1, 0.75, 0.5, 0.25, 0].map((p, i) => (
              <div key={i} className={styles.gridLine}>
                <span className={styles.gridLabel}>
                  {Math.round(maxCount * p)}
                </span>
              </div>
            ))}
          </div>

          {/* Bars */}
          <div className={styles.chartBars}>
            {memberActivity.map((d, i) => {
              const heightPct = (d.count / maxCount) * 100;
              return (
                <div key={i} className={styles.chartBarCol}>
                  <div className={styles.chartBarTrack}>
                    <div
                      className={styles.chartBarFill}
                      style={{ height: `${Math.max(heightPct, 3)}%` }}
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

      {/* ---------- Middle Row: Recent members + Recent trainers ---------- */}
      <div className={styles.midRow}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Recent members</h3>
              <p className={styles.cardSubtitle}>Latest signups</p>
            </div>
            <button
              className={styles.linkBtn}
              onClick={() => navigate('/admin/members')}
            >
              View all <ArrowUpRight size={12} />
            </button>
          </div>
          <div className={styles.list}>
            {recent.members.length === 0 ? (
              <p className={styles.emptyNote}>No members yet.</p>
            ) : (
              recent.members.map((m) => (
                <div key={m._id} className={styles.listItem}>
                  <div className={styles.avatar}>
                    {m.fullName?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className={styles.listInfo}>
                    <span className={styles.listName}>{m.fullName}</span>
                    <span className={styles.listMeta}>{m.email}</span>
                  </div>
                  <span className={styles.listTime}>
                    {new Date(m.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Recent trainers</h3>
              <p className={styles.cardSubtitle}>Latest onboarded</p>
            </div>
            <button
              className={styles.linkBtn}
              onClick={() => navigate('/admin/trainers')}
            >
              View all <ArrowUpRight size={12} />
            </button>
          </div>
          <div className={styles.list}>
            {recent.trainers.length === 0 ? (
              <p className={styles.emptyNote}>No trainers yet.</p>
            ) : (
              recent.trainers.map((t) => (
                <div key={t._id} className={styles.listItem}>
                  <div className={`${styles.avatar} ${styles.avatarViolet}`}>
                    {t.fullName?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className={styles.listInfo}>
                    <span className={styles.listName}>{t.fullName}</span>
                    <span className={styles.listMeta}>{t.email}</span>
                  </div>
                  <span className={styles.listTime}>
                    {new Date(t.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ---------- Bottom Row: Upcoming sessions + Quick actions ---------- */}
      <div className={styles.bottomRow}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Upcoming sessions</h3>
              <p className={styles.cardSubtitle}>Next classes on the schedule</p>
            </div>
            <button
              className={styles.linkBtn}
              onClick={() => navigate('/admin/classes')}
            >
              View all <ArrowUpRight size={12} />
            </button>
          </div>
          <div className={styles.list}>
            {recent.upcomingSessions.length === 0 ? (
              <p className={styles.emptyNote}>No upcoming sessions.</p>
            ) : (
              recent.upcomingSessions.map((s) => (
                <div key={s._id} className={styles.listItem}>
                  <div className={`${styles.avatar} ${styles.avatarCyan}`}>
                    <Calendar size={16} />
                  </div>
                  <div className={styles.listInfo}>
                    <span className={styles.listName}>{s.sessionName}</span>
                    <span className={styles.listMeta}>
                      {s.trainerId?.fullName || 'Unassigned trainer'}
                    </span>
                  </div>
                  <span className={styles.sessionPill}>
                    {s.day} · {s.time}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Quick actions</h3>
              <p className={styles.cardSubtitle}>Jump straight to management</p>
            </div>
          </div>
          <div className={styles.actionGrid}>
            <button
              className={styles.actionCard}
              onClick={() => navigate('/admin/plans')}
            >
              <ClipboardList size={18} />
              <span>Plans</span>
            </button>
            <button
              className={styles.actionCard}
              onClick={() => navigate('/admin/trainers')}
            >
              <UserCog size={18} />
              <span>Trainers</span>
            </button>
            <button
              className={styles.actionCard}
              onClick={() => navigate('/admin/members')}
            >
              <Users size={18} />
              <span>Members</span>
            </button>
            <button
              className={styles.actionCard}
              onClick={() => navigate('/admin/classes')}
            >
              <Calendar size={18} />
              <span>Classes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;