import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dumbbell,
  Flame,
  CalendarCheck,
  TrendingUp,
  Users,
  Loader2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import styles from './Dashboard.module.css';

const API_BASE = 'http://localhost:5000';

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

const authHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const getCachedUserName = () => {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return '';
    const u = JSON.parse(raw);
    return (u.fullName || u.name || '').split(' ')[0];
  } catch {
    return '';
  }
};

const DAY_ORDER = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Dashboard = () => {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userName = useMemo(() => getCachedUserName(), []);

  /* ============================================================
     Fetch dashboard stats
     ============================================================ */
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_BASE}/api/member-dashboard/stats`, {
        headers: authHeaders(),
      });
      const json = await parseResponse(res);
      if (!res.ok || !json.success) {
        throw new Error(json.message || `Failed to load dashboard (${res.status})`);
      }
      setData(json.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleStartWorkout = () => navigate('/workout-plans');
  const handleManageBilling = () => navigate('/membership');
  const handleViewClasses = () => navigate('/classes');

  /* ============================================================
     Loading / error
     ============================================================ */
  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.stateMessage}>
          <Loader2 size={18} className={styles.spinner} />
          Loading your dashboard…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.stateError}>
          {error}
          <button className={styles.retryBtn} onClick={fetchStats}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* ============================================================
     Derived data
     ============================================================ */
  const overview = data?.overview || {};
  const subscription = data?.subscription;
  const today = data?.today || { day: '', sessions: [], workouts: [], totalActivities: 0 };
  const sessions = data?.sessions || { total: 0, byDay: {}, upcoming: [] };
  const workouts = data?.workouts || { total: 0, plans: [] };
  const profile = data?.profile || {};

  // Stats grid — real data
  const stats = [
    {
      id: 1,
      icon: Dumbbell,
      label: 'Assigned plans',
      value: String(overview.totalAssignedPlans ?? 0),
      note: `${overview.totalExercises ?? 0} exercises`,
      highlight: true,
    },
    {
      id: 2,
      icon: CalendarCheck,
      label: 'Booked classes',
      value: String(overview.totalBookedSessions ?? 0),
      note: sessions.upcoming?.length > 0
        ? `${sessions.upcoming.length} upcoming`
        : 'this week',
    },
    {
      id: 3,
      icon: Flame,
      label: "Today's activities",
      value: String(today.totalActivities ?? 0),
      note: today.day || '—',
    },
    {
      id: 4,
      icon: Users,
      label: 'Profile completion',
      value: `${profile.completion ?? 0}%`,
      note: profile.missingFields?.length
        ? `${profile.missingFields.length} field${profile.missingFields.length === 1 ? '' : 's'} missing`
        : 'all set',
    },
  ];

  // Weekly chart from sessions.byDay
  const weeklyActivity = DAY_ORDER.map((day) => ({
    day: day.slice(0, 3),
    value: sessions.byDay?.[day] || 0,
  }));
  const maxWeekly = Math.max(1, ...weeklyActivity.map((d) => d.value));

  // Subscription renewal formatting
  const fmtDate = (d) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  // Subscription progress bar — % of cycle elapsed
  const subscriptionProgress = (() => {
    if (!subscription?.startDate || !subscription?.endDate) return 0;
    const start = new Date(subscription.startDate).getTime();
    const end = new Date(subscription.endDate).getTime();
    const now = Date.now();
    if (end <= start) return 0;
    const pct = ((now - start) / (end - start)) * 100;
    return Math.max(0, Math.min(100, Math.round(pct)));
  })();

  // Plan progress — relative to the plan with most exercises
  const maxExercises = Math.max(
    1,
    ...workouts.plans.map((p) => p.totalExercises || 0)
  );

  return (
    <div className={styles.dashboard}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.title}>
            Welcome back{userName ? `, ${userName}` : ''}
          </h1>
          <p className={styles.subtitle}>
            {today.day && `Today is ${today.day}`}
            {today.totalActivities > 0
              ? ` · ${today.totalActivities} activit${today.totalActivities === 1 ? 'y' : 'ies'} scheduled`
              : ' · nothing on the schedule yet'}
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
                <span className={styles.statNote}>{stat.note}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Row: Weekly Activity + Membership */}
      <div className={styles.topRow}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Weekly class schedule</h3>
          {sessions.total === 0 ? (
            <div className={styles.emptyCard}>
              No classes booked yet. Book your first class to see activity here.
            </div>
          ) : (
            <>
              <div className={styles.weeklyChart}>
                {weeklyActivity.map((day) => (
                  <div key={day.day} className={styles.barCol}>
                    <div className={styles.barTrack}>
                      <div
                        className={styles.barFill}
                        style={{
                          height: `${Math.max(
                            (day.value / maxWeekly) * 100,
                            day.value > 0 ? 12 : 0
                          )}%`,
                          opacity: day.value > 0 ? 1 : 0.15,
                        }}
                        title={`${day.value} session${day.value !== 1 ? 's' : ''}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.weeklyLabels}>
                {weeklyActivity.map((day) => (
                  <span key={day.day} className={styles.barDay}>
                    {day.day}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Membership</h3>
          {subscription ? (
            <>
              <p className={styles.membershipPlan}>
                {subscription.planName}
              </p>
              <div className={styles.membershipRow}>
                <span className={styles.membershipRenew}>
                  {subscription.daysRemaining} day
                  {subscription.daysRemaining !== 1 ? 's' : ''} remaining
                </span>
                <span className={styles.statusBadge}>Active</span>
              </div>
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${subscriptionProgress}%` }}
                />
              </div>
              <p className={styles.membershipMetaSmall}>
                Renews {fmtDate(subscription.endDate)}
                {subscription.autoRenew ? ' · auto-renew on' : ' · auto-renew off'}
              </p>
              <button
                className={styles.manageBtn}
                onClick={handleManageBilling}
              >
                Manage billing
              </button>
            </>
          ) : (
            <div className={styles.emptyCard}>
              No active membership.{' '}
              <button
                type="button"
                className={styles.inlineLink}
                onClick={() => navigate('/membership')}
              >
                Browse plans
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Upcoming Sessions + Plan Progress */}
      <div className={styles.bottomRow}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Upcoming sessions</h3>
          {sessions.upcoming?.length === 0 ? (
            <div className={styles.emptyCard}>
              No upcoming sessions.{' '}
              <button
                type="button"
                className={styles.inlineLink}
                onClick={handleViewClasses}
              >
                Book a class
              </button>
            </div>
          ) : (
            <div className={styles.sessionList}>
              {sessions.upcoming.slice(0, 5).map((session) => (
                <div key={session._id} className={styles.sessionItem}>
                  <div>
                    <p className={styles.sessionName}>
                      {session.sessionName}
                    </p>
                    <p className={styles.sessionMeta}>
                      {session.trainer?.name || 'Trainer'} ·{' '}
                      {session.location || 'Gym'}
                    </p>
                  </div>
                  <span className={styles.sessionTime}>
                    {session.day?.slice(0, 3)} · {session.time}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Plan progress</h3>
          {workouts.plans?.length === 0 ? (
            <div className={styles.emptyCard}>
              No workout plans assigned yet.
            </div>
          ) : (
            <div className={styles.planList}>
              {workouts.plans.slice(0, 5).map((plan) => {
                const pct = Math.round(
                  ((plan.totalExercises || 0) / maxExercises) * 100
                );
                return (
                  <div key={plan._id} className={styles.planItem}>
                    <div className={styles.planRow}>
                      <span className={styles.planName}>
                        {plan.planIcon || '💪'} {plan.planName}
                      </span>
                      <span className={styles.planPercent}>
                        {plan.totalExercises} ex
                      </span>
                    </div>
                    <div className={styles.progressTrack}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${Math.max(pct, 4)}%` }}
                      />
                    </div>
                    <p className={styles.planSubMeta}>
                      {plan.sessionsPerWeek}× / week · {plan.planLevel}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;