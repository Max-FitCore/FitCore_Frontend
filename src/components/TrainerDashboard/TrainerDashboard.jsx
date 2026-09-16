import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Calendar,
  ClipboardList,
  Star,
  Loader2,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import styles from './TrainerDashboard.module.css';

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

const getCachedTrainerName = () => {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return '';
    const u = JSON.parse(raw);
    const full = u.fullName || u.name || '';
    return full.split(' ')[0];
  } catch {
    return '';
  }
};

const LEVEL_CLASS = {
  Beginner: 'levelBeginner',
  Intermediate: 'levelIntermediate',
  Advanced: 'levelAdvanced',
};

const TrainerDashboard = () => {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const trainerName = useMemo(() => getCachedTrainerName(), []);

  /* ============================================================
     Fetch
     ============================================================ */
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_BASE}/api/trainer-dashboard/stats`, {
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
  const sessions = data?.sessions || { total: 0, popular: [] };
  const plans = data?.plans || { total: 0, popular: [] };
  const today = data?.today || { sessions: [], totalSessionsToday: 0, totalParticipantsToday: 0 };
  const topMembers = data?.topMembers || [];
  const profile = data?.profile || {};

  const stats = [
    {
      id: 1,
      icon: Users,
      label: 'Unique members',
      value: String(overview.totalUniqueMembers ?? 0),
      note: `${overview.totalAssignments ?? 0} plan assignments`,
      highlight: true,
    },
    {
      id: 2,
      icon: Calendar,
      label: 'Active sessions',
      value: String(overview.totalSessions ?? 0),
      note:
        overview.fullSessionsCount > 0
          ? `${overview.fullSessionsCount} full`
          : `${overview.totalBookings ?? 0} total bookings`,
    },
    {
      id: 3,
      icon: ClipboardList,
      label: 'Active plans',
      value: String(overview.totalWorkoutPlans ?? 0),
      note: `${plans.totalAssignments ?? 0} assignments`,
    },
    {
      id: 4,
      icon: Star,
      label: 'Average rating',
      value:
        (overview.averageRating ?? 0) > 0
          ? Number(overview.averageRating).toFixed(1)
          : '—',
      note:
        plans.popular?.length > 0
          ? `${plans.popular.reduce((s, p) => s + (p.totalRatings || 0), 0)} reviews`
          : 'no ratings yet',
    },
  ];

  const scheduleNote =
    today.totalSessionsToday === 0
      ? 'No sessions on your schedule today.'
      : `${today.totalSessionsToday} session${
          today.totalSessionsToday !== 1 ? 's' : ''
        } today · ${today.totalParticipantsToday} participant${
          today.totalParticipantsToday !== 1 ? 's' : ''
        }`;

  // Top members — use engagement count as the "progress" driver
  const maxEngagement = Math.max(
    1,
    ...topMembers.map((m) => m.totalEngagement || 0)
  );

  const profileIncomplete =
    typeof profile.completion === 'number' && profile.completion < 100;

  /* ============================================================
     Render
     ============================================================ */
  return (
    <div className={styles.dashboard}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.title}>
            Good {getTimeOfDay()}
            {trainerName ? `, ${trainerName}` : ''}
          </h1>
          <p className={styles.subtitle}>{scheduleNote}</p>
        </div>
        {profileIncomplete && (
          <button
            className={styles.profileBadge}
            type="button"
            onClick={() => navigate('/trainer/profile')}
          >
            <AlertCircle size={14} />
            Profile {profile.completion}% complete — finish setup
          </button>
        )}
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
                {stat.note && (
                  <span className={styles.statNote}>{stat.note}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Row: Today's Sessions + Top Members */}
      <div className={styles.topRow}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Today's sessions</h3>
          {today.sessions.length === 0 ? (
            <div className={styles.emptyCard}>
              Nothing scheduled for {today.day || 'today'}.{' '}
              <button
                type="button"
                className={styles.inlineLink}
                onClick={() => navigate('/trainer/schedule')}
              >
                Manage schedule
              </button>
            </div>
          ) : (
            <div className={styles.classList}>
              {today.sessions.map((cls) => (
                <div key={cls._id} className={styles.classItem}>
                  <div>
                    <p className={styles.classItemName}>{cls.sessionName}</p>
                    <p className={styles.classItemMeta}>
                      {cls.time} · {cls.currentParticipants}/
                      {cls.maxParticipants} booked
                      {cls.location ? ` · ${cls.location}` : ''}
                    </p>
                  </div>
                  <span
                    className={`${styles.levelBadge} ${
                      styles[LEVEL_CLASS[cls.difficulty]] || styles.levelBeginner
                    }`}
                  >
                    {cls.difficulty}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Top members</h3>
          {topMembers.length === 0 ? (
            <div className={styles.emptyCard}>
              No member engagement yet. Members who book sessions or get
              assigned plans will appear here.
            </div>
          ) : (
            <div className={styles.progressList}>
              {topMembers.slice(0, 5).map((m) => {
                const pct = Math.round(
                  (m.totalEngagement / maxEngagement) * 100
                );
                return (
                  <div key={m._id} className={styles.progressItem}>
                    <div className={styles.progressRow}>
                      <span className={styles.progressName}>
                        {m.fullName || 'Unnamed'}
                      </span>
                      <span className={styles.progressPercent}>
                        {m.totalEngagement}
                      </span>
                    </div>
                    <div className={styles.progressTrack}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${Math.max(pct, 6)}%` }}
                      />
                    </div>
                    <p className={styles.progressSubMeta}>
                      {m.sessionBookings} booking
                      {m.sessionBookings !== 1 ? 's' : ''} · {m.workoutPlans}{' '}
                      plan{m.workoutPlans !== 1 ? 's' : ''}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Plans You Authored */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Plans you authored</h3>
        {plans.popular?.length === 0 ? (
          <div className={styles.emptyCard}>
            You haven't authored any workout plans yet.{' '}
            <button
              type="button"
              className={styles.inlineLink}
              onClick={() => navigate('/trainer/workouts')}
            >
              Create a plan
            </button>
          </div>
        ) : (
          <div className={styles.planGrid}>
            {plans.popular.slice(0, 6).map((plan) => {
              const engagementPct =
                plans.totalAssignments > 0
                  ? Math.round(
                      (plan.assignedCount / plans.totalAssignments) * 100
                    )
                  : 0;
              return (
                <div key={plan._id} className={styles.planCard}>
                  <div className={styles.planRow}>
                    <span className={styles.planName}>
                      {plan.planIcon || '💪'} {plan.planName}
                    </span>
                    <span
                      className={`${styles.levelBadge} ${
                        styles[LEVEL_CLASS[plan.planLevel]] ||
                        styles.levelBeginner
                      }`}
                    >
                      {plan.planLevel}
                    </span>
                  </div>
                  <p className={styles.planMeta}>
                    {plan.planType} · {plan.totalExercises} exercises
                    {plan.totalRatings > 0
                      ? ` · ${Number(plan.rating).toFixed(1)}★ (${plan.totalRatings})`
                      : ''}
                  </p>
                  <div className={styles.planStatsRow}>
                    <span className={styles.planStat}>
                      <Users size={12} /> {plan.assignedCount} assigned
                    </span>
                  </div>
                  <div className={styles.progressTrack}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${Math.max(engagementPct, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

/* ============================================================
   Helpers
   ============================================================ */
function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}

export default TrainerDashboard;