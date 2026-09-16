import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  Clock,
  Calendar,
  Dumbbell,
  CheckCircle,
  Circle,
  ChevronRight,
  Play,
  Users,
  Flame,
  Target,
  ArrowRight,
  X,
  Star,
  Loader2,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import styles from './WorkoutPlans.module.css';

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

const WorkoutPlans = () => {
  const [activeTab, setActiveTab] = useState('my-plans');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPlanDetails, setShowPlanDetails] = useState(false);

  // My plans
  const [myPlans, setMyPlans] = useState([]);
  const [loadingMy, setLoadingMy] = useState(true);
  const [myError, setMyError] = useState('');

  // Available plans
  const [availablePlans, setAvailablePlans] = useState([]);
  const [loadingAvailable, setLoadingAvailable] = useState(true);
  const [availableError, setAvailableError] = useState('');

  // Rating
  const [ratingPlan, setRatingPlan] = useState(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingError, setRatingError] = useState('');

  // Toast
  const [toast, setToast] = useState(null);

  /* ============================================================
     FETCH — my workouts (assigned to logged-in member)
     ============================================================ */
  const fetchMyPlans = useCallback(async () => {
    try {
      setLoadingMy(true);
      setMyError('');
      const res = await fetch(`${API_BASE}/api/workout-plans/my-workouts`, {
        headers: authHeaders(),
      });
      const data = await parseResponse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.message || `Failed to load your plans (${res.status})`);
      }
      setMyPlans(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setMyError(err.message || 'Failed to load your plans');
    } finally {
      setLoadingMy(false);
    }
  }, []);

  /* ============================================================
     FETCH — public plans
     ============================================================ */
  const fetchPublicPlans = useCallback(async () => {
    try {
      setLoadingAvailable(true);
      setAvailableError('');
      const res = await fetch(`${API_BASE}/api/workout-plans/public`);
      const data = await parseResponse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.message || `Failed to load plans (${res.status})`);
      }
      setAvailablePlans(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setAvailableError(err.message || 'Failed to load plans');
    } finally {
      setLoadingAvailable(false);
    }
  }, []);

  useEffect(() => {
    fetchMyPlans();
    fetchPublicPlans();
  }, [fetchMyPlans, fetchPublicPlans]);

  /* ============================================================
     Toast helper
     ============================================================ */
  const showToastMessage = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ============================================================
     RATE a plan
     ============================================================ */
  const openRating = (plan) => {
    setRatingPlan(plan);
    setRatingValue(Math.round(plan.rating || 0));
    setRatingError('');
  };

  const submitRating = async () => {
    if (!ratingPlan || submittingRating) return;
    if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
      setRatingError('Please choose a rating from 1 to 5');
      return;
    }
    try {
      setSubmittingRating(true);
      setRatingError('');
      const res = await fetch(
        `${API_BASE}/api/workout-plans/${ratingPlan._id}/rate`,
        {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ rating: ratingValue }),
        }
      );
      const data = await parseResponse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.message || `Rating failed (${res.status})`);
      }

      // Update the plan in both lists with the new aggregate rating
      const newRating = data.data.rating;
      const newTotal = data.data.totalRatings;
      setMyPlans((prev) =>
        prev.map((p) =>
          p._id === ratingPlan._id
            ? { ...p, rating: newRating, totalRatings: newTotal }
            : p
        )
      );
      setAvailablePlans((prev) =>
        prev.map((p) =>
          p._id === ratingPlan._id
            ? { ...p, rating: newRating, totalRatings: newTotal }
            : p
        )
      );

      showToastMessage(`Thanks! You rated this plan ${ratingValue}★`);
      setRatingPlan(null);
    } catch (err) {
      setRatingError(err.message || 'Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  /* ============================================================
     Derived stats (real, from myPlans)
     ============================================================ */
  const stats = useMemo(() => {
    const totalPlans = myPlans.length;
    const totalDays = myPlans.reduce(
      (sum, p) => sum + (p.workoutDays?.length || 0),
      0
    );
    const totalSessions = myPlans.reduce(
      (sum, p) => sum + (p.totalSessions || 0),
      0
    );
    const avgRating =
      myPlans.length > 0
        ? (
            myPlans.reduce((s, p) => s + (p.rating || 0), 0) / myPlans.length
          ).toFixed(1)
        : '—';
    return { totalPlans, totalDays, totalSessions, avgRating };
  }, [myPlans]);

  /* ============================================================
     Helpers
     ============================================================ */
  const trainerName = (plan) =>
    plan.trainerId?.fullName || plan.trainerId?.name || 'Your trainer';

  const getTypeIcon = (type = '') => {
    const icons = {
      Strength: '💪',
      Cardio: '🔥',
      Flexibility: '🧘',
      'Cross Training': '⚡',
      HIIT: '🔥',
      Yoga: '🧘',
      Pilates: '🧘',
    };
    return icons[type] || '🏋️';
  };

  const isAlreadyJoined = (publicPlan) =>
    myPlans.some((p) => p._id === publicPlan._id);

  const filteredPlans = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return availablePlans;
    return availablePlans.filter(
      (p) =>
        p.planName?.toLowerCase().includes(q) ||
        p.planType?.toLowerCase().includes(q) ||
        p.planLevel?.toLowerCase().includes(q) ||
        trainerName(p).toLowerCase().includes(q)
    );
  }, [availablePlans, searchQuery]);

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div className={styles.workoutPlans}>
      {/* Toast */}
      {toast && (
        <div
          className={styles.toast}
          style={
            toast.type === 'error'
              ? { borderColor: 'rgba(248,113,113,0.5)', color: '#fca5a5' }
              : undefined
          }
        >
          <CheckCircle size={18} />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Workout Plans</h1>
          <p className={styles.pageSubtitle}>
            Track your assigned programs and explore what your trainers offer
          </p>
        </div>
      </div>

      {/* Stats Overview — real, from my-workouts */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Layers size={20} />
          </div>
          <div>
            <div className={styles.statNumber}>{stats.totalPlans}</div>
            <div className={styles.statLabel}>Assigned Plans</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Calendar size={20} />
          </div>
          <div>
            <div className={styles.statNumber}>{stats.totalDays}</div>
            <div className={styles.statLabel}>Workout Days</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Dumbbell size={20} />
          </div>
          <div>
            <div className={styles.statNumber}>{stats.totalSessions}</div>
            <div className={styles.statLabel}>Total Sessions</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Star size={20} />
          </div>
          <div>
            <div className={styles.statNumber}>{stats.avgRating}</div>
            <div className={styles.statLabel}>Avg. Rating</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'my-plans' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('my-plans')}
        >
          My Plans {myPlans.length > 0 && `(${myPlans.length})`}
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'available' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('available')}
        >
          Available Plans {availablePlans.length > 0 && `(${availablePlans.length})`}
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {/* ============ My Plans Tab ============ */}
        {activeTab === 'my-plans' && (
          <div className={styles.myPlansTab}>
            {loadingMy && (
              <div className={styles.stateMessage}>
                <Loader2 size={18} className={styles.spinner} />
                Loading your plans…
              </div>
            )}

            {!loadingMy && myError && (
              <div className={styles.stateError}>
                {myError}
                <button className={styles.retryBtn} onClick={fetchMyPlans}>
                  Retry
                </button>
              </div>
            )}

            {!loadingMy && !myError && myPlans.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🏋️</div>
                <h3 className={styles.emptyTitle}>No workout plans yet</h3>
                <p className={styles.emptyDescription}>
                  Your trainer hasn't assigned you any plans yet. Browse the
                  available catalog to see what's on offer.
                </p>
                <button
                  className={styles.btnPrimary}
                  onClick={() => setActiveTab('available')}
                >
                  Browse Plans
                </button>
              </div>
            )}

            {!loadingMy && !myError && myPlans.length > 0 && (
              <div className={styles.plansList}>
                {myPlans.map((plan) => (
                  <div key={plan._id} className={styles.planCard}>
                    <div className={styles.planCardHeader}>
                      <div className={styles.planCardInfo}>
                        <span className={styles.planEmoji}>
                          {plan.planIcon || getTypeIcon(plan.planType)}
                        </span>
                        <div>
                          <h3 className={styles.planCardName}>
                            {plan.planName}
                          </h3>
                          <div className={styles.planCardMeta}>
                            <span className={styles.planType}>
                              {plan.planType}
                            </span>
                            <span className={styles.planLevel}>
                              {plan.planLevel}
                            </span>
                            <span className={styles.planTrainer}>
                              <Users size={14} />
                              {trainerName(plan)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span
                        className={`${styles.statusBadge} ${styles.statusActive}`}
                      >
                        Active
                      </span>
                    </div>

                    <div className={styles.planCardBody}>
                      <div className={styles.planStats}>
                        <div className={styles.planStat}>
                          <Calendar size={16} />
                          <span>{plan.sessionsPerWeek}× / week</span>
                        </div>
                        <div className={styles.planStat}>
                          <Dumbbell size={16} />
                          <span>{plan.totalSessions} sessions total</span>
                        </div>
                        <div className={styles.planStat}>
                          <Layers size={16} />
                          <span>
                            {plan.workoutDays?.length || 0} workout day
                            {(plan.workoutDays?.length || 0) !== 1 ? 's' : ''}
                          </span>
                        </div>
                        {plan.rating > 0 && (
                          <div className={styles.planStat}>
                            <Star
                              size={16}
                              style={{ color: 'var(--accent-lime)' }}
                            />
                            <span>
                              {plan.rating.toFixed(1)} ({plan.totalRatings || 0})
                            </span>
                          </div>
                        )}
                      </div>

                      {plan.description && (
                        <p className={styles.planDescription}>
                          {plan.description}
                        </p>
                      )}

                      {plan.workoutDays?.length > 0 && (
                        <div className={styles.daysPreview}>
                          {plan.workoutDays.map((d, i) => (
                            <span key={i} className={styles.dayChip}>
                              {d.day?.slice(0, 3)} · {d.focus}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className={styles.planCardActions}>
                      <button
                        className={styles.btnPrimarySmall}
                        onClick={() => {
                          setSelectedPlan(plan);
                          setShowPlanDetails(true);
                        }}
                      >
                        <Play size={16} />
                        View Details
                      </button>
                      <button
                        className={styles.btnSecondarySmall}
                        onClick={() => openRating(plan)}
                      >
                        <Star size={16} />
                        Rate Plan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============ Available Plans Tab ============ */}
        {activeTab === 'available' && (
          <div className={styles.availableTab}>
            <div className={styles.searchSection}>
              <div className={styles.searchWrapper}>
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Search plans by name, type, level, or trainer…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
            </div>

            {loadingAvailable && (
              <div className={styles.stateMessage}>
                <Loader2 size={18} className={styles.spinner} />
                Loading plans…
              </div>
            )}

            {!loadingAvailable && availableError && (
              <div className={styles.stateError}>
                {availableError}
                <button className={styles.retryBtn} onClick={fetchPublicPlans}>
                  Retry
                </button>
              </div>
            )}

            {!loadingAvailable &&
              !availableError &&
              filteredPlans.length === 0 && (
                <div className={styles.stateMessage}>
                  {availablePlans.length === 0
                    ? 'No public plans available yet.'
                    : 'No plans match your search.'}
                </div>
              )}

            {!loadingAvailable && !availableError && filteredPlans.length > 0 && (
              <div className={styles.availableGrid}>
                {filteredPlans.map((plan) => {
                  const joined = isAlreadyJoined(plan);
                  return (
                    <div key={plan._id} className={styles.availableCard}>
                      <div className={styles.availableCardHeader}>
                        <span className={styles.planEmojiLarge}>
                          {plan.planIcon || getTypeIcon(plan.planType)}
                        </span>
                        <div className={styles.availableCardTop}>
                          <span className={styles.planType}>
                            {plan.planType}
                          </span>
                          <span className={styles.planLevel}>
                            {plan.planLevel}
                          </span>
                        </div>
                      </div>

                      <h3 className={styles.availableCardName}>
                        {plan.planName}
                      </h3>
                      {plan.description && (
                        <p className={styles.availableCardDescription}>
                          {plan.description}
                        </p>
                      )}

                      <div className={styles.availableCardMeta}>
                        <div className={styles.availableMetaItem}>
                          <Users size={14} />
                          <span>
                            {plan.assignedMembers?.length || 0} members
                          </span>
                        </div>
                        <div className={styles.availableMetaItem}>
                          <Star
                            size={14}
                            style={{ color: 'var(--accent-lime)' }}
                          />
                          <span>
                            {plan.rating ? plan.rating.toFixed(1) : 'New'}
                          </span>
                        </div>
                        <div className={styles.availableMetaItem}>
                          <Clock size={14} />
                          <span>{plan.sessionsPerWeek}× / week</span>
                        </div>
                      </div>

                      <div className={styles.availableCardFooter}>
                        <span className={styles.trainerName}>
                          By {trainerName(plan)}
                        </span>
                        {joined ? (
                          <span className={styles.joinedBadge}>
                            <CheckCircle size={14} /> Assigned
                          </span>
                        ) : (
                          <span className={styles.notAssignedBadge}>
                            Ask your trainer to assign
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============ Plan Details Modal ============ */}
      {showPlanDetails && selectedPlan && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowPlanDetails(false)}
        >
          <div
            className={styles.modalLarge}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.planEmojiLarge}>
                  {selectedPlan.planIcon || getTypeIcon(selectedPlan.planType)}
                </span>
                <h2 className={styles.modalTitle}>
                  {selectedPlan.planName}
                </h2>
                <div className={styles.modalMeta}>
                  <span className={styles.planType}>
                    {selectedPlan.planType}
                  </span>
                  <span className={styles.planLevel}>
                    {selectedPlan.planLevel}
                  </span>
                  <span className={styles.planTrainer}>
                    <Users size={14} />
                    {trainerName(selectedPlan)}
                  </span>
                </div>
              </div>
              <button
                className={styles.modalClose}
                onClick={() => setShowPlanDetails(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {selectedPlan.description && (
                <p className={styles.modalDescriptionText}>
                  {selectedPlan.description}
                </p>
              )}

              <div className={styles.detailStats}>
                <div className={styles.detailStat}>
                  <span className={styles.detailStatLabel}>Sessions/Wk</span>
                  <span className={styles.detailStatValue}>
                    {selectedPlan.sessionsPerWeek}
                  </span>
                </div>
                <div className={styles.detailStat}>
                  <span className={styles.detailStatLabel}>Total</span>
                  <span className={styles.detailStatValue}>
                    {selectedPlan.totalSessions}
                  </span>
                </div>
                <div className={styles.detailStat}>
                  <span className={styles.detailStatLabel}>Days</span>
                  <span className={styles.detailStatValue}>
                    {selectedPlan.workoutDays?.length || 0}
                  </span>
                </div>
                <div className={styles.detailStat}>
                  <span className={styles.detailStatLabel}>Rating</span>
                  <span className={styles.detailStatValue}>
                    {selectedPlan.rating
                      ? `${selectedPlan.rating.toFixed(1)} ★`
                      : 'New'}
                  </span>
                </div>
              </div>

              <div className={styles.exerciseList}>
                <h4 className={styles.exerciseTitle}>
                  Workout Days ({selectedPlan.workoutDays?.length || 0})
                </h4>

                {!selectedPlan.workoutDays ||
                selectedPlan.workoutDays.length === 0 ? (
                  <p className={styles.featuresEmpty}>
                    No workout days configured.
                  </p>
                ) : (
                  selectedPlan.workoutDays.map((d, i) => (
                    <div key={i} className={styles.dayBlock}>
                      <div className={styles.dayBlockHeader}>
                        <span className={styles.dayBlockTitle}>{d.day}</span>
                        <span className={styles.dayBlockFocus}>{d.focus}</span>
                      </div>
                      <ul className={styles.dayExerciseList}>
                        {d.exercises.map((ex, j) => (
                          <li key={j}>
                            <Circle size={12} />
                            <span>{ex}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.btnSecondary}
                onClick={() => setShowPlanDetails(false)}
              >
                Close
              </button>
              <button
                className={styles.btnPrimary}
                onClick={() => {
                  setShowPlanDetails(false);
                  openRating(selectedPlan);
                }}
              >
                <Star size={16} />
                Rate This Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ Rating Modal ============ */}
      {ratingPlan && (
        <div
          className={styles.modalOverlay}
          onClick={() => !submittingRating && setRatingPlan(null)}
        >
          <div
            className={styles.confirmModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.ratingStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`${styles.ratingStar} ${
                    star <= ratingValue ? styles.ratingStarActive : ''
                  }`}
                  onClick={() => setRatingValue(star)}
                  disabled={submittingRating}
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                  <Star
                    size={32}
                    fill={star <= ratingValue ? 'currentColor' : 'none'}
                  />
                </button>
              ))}
            </div>

            <h3 className={styles.confirmModalTitle}>
              Rate "{ratingPlan.planName}"
            </h3>
            <p className={styles.confirmModalDescription}>
              Your feedback helps other members find great programs.
            </p>

            {ratingError && (
              <div className={styles.ratingError}>{ratingError}</div>
            )}

            <div className={styles.confirmModalActions}>
              <button
                className={styles.btnSecondary}
                onClick={() => setRatingPlan(null)}
                disabled={submittingRating}
              >
                Cancel
              </button>
              <button
                className={styles.btnPrimary}
                onClick={submitRating}
                disabled={submittingRating || ratingValue === 0}
              >
                {submittingRating ? (
                  <>
                    <Loader2 size={14} className={styles.spinner} /> Submitting…
                  </>
                ) : (
                  'Submit Rating'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutPlans;