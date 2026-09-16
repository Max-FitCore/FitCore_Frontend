import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  User,
  Search,
  Filter,
  X,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  List,
  Grid,
  Loader2,
  BookOpen,
  Info,
} from 'lucide-react';
import styles from './Classes.module.css';

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

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const Classes = () => {
  const [activeTab, setActiveTab] = useState('booked');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedClass, setSelectedClass] = useState(null);
  const [showClassDetails, setShowClassDetails] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showUnbookModal, setShowUnbookModal] = useState(false);

  // Data
  const [booked, setBooked] = useState([]);
  const [available, setAvailable] = useState([]);
  const [loadingBooked, setLoadingBooked] = useState(true);
  const [loadingAvailable, setLoadingAvailable] = useState(true);
  const [bookedError, setBookedError] = useState('');
  const [availableError, setAvailableError] = useState('');

  // Actions
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');

  // Toast
  const [toast, setToast] = useState(null);

  const showToastMessage = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ============================================================
     FETCH — my bookings
     ============================================================ */
  const fetchBooked = useCallback(async () => {
    try {
      setLoadingBooked(true);
      setBookedError('');
      const res = await fetch(`${API_BASE}/api/sessions/my-bookings`, {
        headers: authHeaders(),
      });
      const data = await parseResponse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.message || `Failed to load bookings (${res.status})`);
      }
      setBooked(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setBookedError(err.message || 'Failed to load bookings');
    } finally {
      setLoadingBooked(false);
    }
  }, []);

  /* ============================================================
     FETCH — available sessions
     ============================================================ */
  const fetchAvailable = useCallback(async () => {
    try {
      setLoadingAvailable(true);
      setAvailableError('');
      const res = await fetch(`${API_BASE}/api/sessions/available`, {
        headers: authHeaders(),
      });
      const data = await parseResponse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.message || `Failed to load classes (${res.status})`);
      }
      // Filter out sessions the member is already booked in
      const bookedIds = new Set(booked.map((b) => b._id));
      setAvailable(
        (Array.isArray(data.data) ? data.data : []).filter(
          (s) => !bookedIds.has(s._id)
        )
      );
    } catch (err) {
      setAvailableError(err.message || 'Failed to load classes');
    } finally {
      setLoadingAvailable(false);
    }
  }, [booked]);

  useEffect(() => {
    fetchBooked();
  }, [fetchBooked]);

  useEffect(() => {
    // Wait for bookings to load so we can exclude them
    if (!loadingBooked) fetchAvailable();
  }, [loadingBooked, fetchAvailable]);

  /* ============================================================
     ACTIONS
     ============================================================ */
  const handleBookClass = (classItem) => {
    setSelectedClass(classItem);
    setActionError('');
    setShowBookingModal(true);
  };

  const confirmBooking = async () => {
    if (!selectedClass || submitting) return;
    try {
      setSubmitting(true);
      setActionError('');
      const res = await fetch(
        `${API_BASE}/api/sessions/${selectedClass._id}/book`,
        { method: 'POST', headers: authHeaders() }
      );
      const data = await parseResponse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.message || `Booking failed (${res.status})`);
      }
      showToastMessage(`Booked "${selectedClass.sessionName}"!`);
      setShowBookingModal(false);
      setSelectedClass(null);
      await fetchBooked();
      await fetchAvailable();
    } catch (err) {
      setActionError(err.message || 'Failed to book class');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnbookClass = (classItem) => {
    setSelectedClass(classItem);
    setActionError('');
    setShowUnbookModal(true);
  };

  const confirmUnbook = async () => {
    if (!selectedClass || submitting) return;
    try {
      setSubmitting(true);
      setActionError('');
      const res = await fetch(
        `${API_BASE}/api/sessions/${selectedClass._id}/cancel`,
        { method: 'DELETE', headers: authHeaders() }
      );
      const data = await parseResponse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.message || `Cancel failed (${res.status})`);
      }
      showToastMessage(`Unbooked "${selectedClass.sessionName}".`);
      setShowUnbookModal(false);
      setSelectedClass(null);
      await fetchBooked();
      await fetchAvailable();
    } catch (err) {
      setActionError(err.message || 'Failed to cancel booking');
    } finally {
      setSubmitting(false);
    }
  };

  /* ============================================================
     HELPERS
     ============================================================ */
  const getLevelBadge = (difficulty = '') => {
    const d = difficulty.toLowerCase();
    if (d === 'beginner') return { label: 'Beginner', className: styles.levelBeginner };
    if (d === 'advanced') return { label: 'Advanced', className: styles.levelAdvanced };
    if (d === 'intermediate') return { label: 'Intermediate', className: styles.levelIntermediate };
    return { label: difficulty || 'All Levels', className: styles.levelAll };
  };

  const getDifficultyIcon = (difficulty = '') => {
    const d = difficulty.toLowerCase();
    if (d === 'beginner') return '🌱';
    if (d === 'intermediate') return '🔥';
    if (d === 'advanced') return '💪';
    return '🏋️';
  };

  const formatDay = (day) => {
    if (!day) return '';
    const found = DAY_ORDER.find((d) => d.toLowerCase() === day.toLowerCase());
    return found || day;
  };

  const matchesSearch = (s, q) => {
    if (!q) return true;
    const needle = q.toLowerCase();
    return (
      s.sessionName?.toLowerCase().includes(needle) ||
      s.trainerId?.fullName?.toLowerCase().includes(needle) ||
      s.location?.toLowerCase().includes(needle) ||
      s.difficulty?.toLowerCase().includes(needle)
    );
  };

  /* ============================================================
     DERIVED
     ============================================================ */
  const filteredBooked = useMemo(
    () => booked.filter((s) => matchesSearch(s, searchQuery)),
    [booked, searchQuery]
  );

  const filteredAvailable = useMemo(
    () => available.filter((s) => matchesSearch(s, searchQuery)),
    [available, searchQuery]
  );

  const currentList =
    activeTab === 'booked' ? filteredBooked : filteredAvailable;

  const isLoading = activeTab === 'booked' ? loadingBooked : loadingAvailable;
  const currentError = activeTab === 'booked' ? bookedError : availableError;

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div className={styles.classes}>
      {/* Toast */}
      {toast && (
        <div
          className={styles.toast}
          style={
            toast.type === 'error'
              ? { borderColor: 'rgba(248,113,113,0.5)' }
              : undefined
          }
        >
          <CheckCircle size={18} />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Classes</h1>
          <p className={styles.pageSubtitle}>
            Book classes, view your schedule, and stay on track
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'booked' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('booked')}
        >
          <CheckCircle size={16} />
          My Bookings {booked.length > 0 && `(${booked.length})`}
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'available' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('available')}
        >
          <BookOpen size={16} />
          Available {available.length > 0 && `(${available.length})`}
        </button>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search classes by name, trainer, or location…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.toolbarActions}>
          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.viewActive : ''}`}
              onClick={() => setViewMode('grid')}
              type="button"
            >
              <Grid size={16} />
            </button>
            <button
              className={`${styles.viewBtn} ${viewMode === 'list' ? styles.viewActive : ''}`}
              onClick={() => setViewMode('list')}
              type="button"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {isLoading && (
          <div className={styles.stateMessage}>
            <Loader2 size={18} className={styles.spinner} />
            Loading classes…
          </div>
        )}

        {!isLoading && currentError && (
          <div className={styles.stateError}>
            {currentError}
            <button
              className={styles.retryBtn}
              onClick={activeTab === 'booked' ? fetchBooked : fetchAvailable}
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !currentError && currentList.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              {activeTab === 'booked' ? '📅' : '🏫'}
            </div>
            <h3 className={styles.emptyTitle}>
              {activeTab === 'booked'
                ? 'No booked classes'
                : 'No available classes'}
            </h3>
            <p className={styles.emptyDescription}>
              {activeTab === 'booked'
                ? "You haven't booked any classes yet. Switch to Available to find one."
                : 'Every class is currently booked. Check back later.'}
            </p>
            {activeTab === 'booked' && (
              <button
                className={styles.btnPrimary}
                onClick={() => setActiveTab('available')}
                style={{ marginTop: '1rem' }}
              >
                Browse Classes
              </button>
            )}
          </div>
        )}

        {!isLoading && !currentError && currentList.length > 0 && (
          <div
            className={
              viewMode === 'grid' ? styles.classesGrid : styles.classesList
            }
          >
            {currentList.map((classItem) => {
              const level = getLevelBadge(classItem.difficulty);
              const isBooked = activeTab === 'booked';
              const spotsLeft =
                (classItem.maxParticipants || 0) -
                (classItem.currentParticipants || 0);

              return (
                <div
                  key={classItem._id}
                  className={
                    viewMode === 'grid'
                      ? styles.classCard
                      : styles.classListItem
                  }
                >
                  <div className={styles.classCardHeader}>
                    <div className={styles.classCardTop}>
                      <span className={styles.classEmoji}>
                        {getDifficultyIcon(classItem.difficulty)}
                      </span>
                      <span
                        className={`${styles.levelBadge} ${level.className}`}
                      >
                        {level.label}
                      </span>
                    </div>
                    <span
                      className={`${styles.statusBadge} ${
                        isBooked ? styles.statusBooked : styles.statusAvailable
                      }`}
                    >
                      {isBooked ? 'Booked' : 'Available'}
                    </span>
                  </div>

                  <h3 className={styles.classCardName}>
                    {classItem.sessionName}
                  </h3>

                  {classItem.description && (
                    <p className={styles.classCardDescription}>
                      {classItem.description}
                    </p>
                  )}

                  <div className={styles.classCardMeta}>
                    <div className={styles.metaItem}>
                      <Calendar size={14} />
                      <span>{formatDay(classItem.day)}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <Clock size={14} />
                      <span>{classItem.time}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <MapPin size={14} />
                      <span>{classItem.location || 'Gym Main Floor'}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <User size={14} />
                      <span>
                        {classItem.trainerId?.fullName || 'Trainer'}
                      </span>
                    </div>
                  </div>

                  <div className={styles.classCardStats}>
                    <div className={styles.statItem}>
                      <Users size={14} />
                      <span>
                        {classItem.currentParticipants || 0}/
                        {classItem.maxParticipants || 0}
                      </span>
                    </div>
                    <div className={styles.statItem}>
                      <Clock size={14} />
                      <span>{classItem.duration || 60} min</span>
                    </div>
                    {!isBooked && spotsLeft > 0 && (
                      <div className={styles.statItem}>
                        <CheckCircle size={14} />
                        <span>{spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left</span>
                      </div>
                    )}
                  </div>

                  <div className={styles.classCardActions}>
                    {isBooked ? (
                      <button
                        className={styles.btnUnbook}
                        onClick={() => handleUnbookClass(classItem)}
                        type="button"
                      >
                        <X size={16} />
                        Unbook
                      </button>
                    ) : (
                      <button
                        className={styles.btnPrimary}
                        onClick={() => handleBookClass(classItem)}
                        type="button"
                      >
                        Book Now
                        <ChevronRight size={16} />
                      </button>
                    )}
                    <button
                      className={styles.btnIcon}
                      onClick={() => {
                        setSelectedClass(classItem);
                        setShowClassDetails(true);
                      }}
                      type="button"
                    >
                      <Info size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ============ Booking Modal ============ */}
      {showBookingModal && selectedClass && (
        <div
          className={styles.modalOverlay}
          onClick={() => !submitting && setShowBookingModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>Confirm Booking</h2>
                <div className={styles.modalSubtitle}>
                  {selectedClass.sessionName}
                </div>
              </div>
              <button
                className={styles.modalClose}
                onClick={() => setShowBookingModal(false)}
                disabled={submitting}
                type="button"
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.bookingSummary}>
                <div className={styles.bookingItem}>
                  <Calendar size={16} />
                  <span>{formatDay(selectedClass.day)}</span>
                </div>
                <div className={styles.bookingItem}>
                  <Clock size={16} />
                  <span>{selectedClass.time}</span>
                </div>
                <div className={styles.bookingItem}>
                  <MapPin size={16} />
                  <span>{selectedClass.location || 'Gym Main Floor'}</span>
                </div>
                <div className={styles.bookingItem}>
                  <User size={16} />
                  <span>
                    {selectedClass.trainerId?.fullName || 'Trainer'}
                  </span>
                </div>
              </div>
              <div className={styles.bookingNotice}>
                <AlertCircle size={16} />
                <span>Please arrive 10 minutes before class starts.</span>
              </div>
              {actionError && (
                <div className={styles.actionError}>{actionError}</div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.btnSecondary}
                onClick={() => setShowBookingModal(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                className={styles.btnPrimary}
                onClick={confirmBooking}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className={styles.spinner} /> Booking…
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ Unbook Modal ============ */}
      {showUnbookModal && selectedClass && (
        <div
          className={styles.modalOverlay}
          onClick={() => !submitting && setShowUnbookModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>Unbook Class</h2>
                <div className={styles.modalSubtitle}>
                  {selectedClass.sessionName}
                </div>
              </div>
              <button
                className={styles.modalClose}
                onClick={() => setShowUnbookModal(false)}
                disabled={submitting}
                type="button"
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.unbookInfo}>
                <div className={styles.unbookIcon}>
                  <AlertCircle size={32} />
                </div>
                <p className={styles.unbookDescription}>
                  Are you sure you want to unbook{' '}
                  <strong>{selectedClass.sessionName}</strong>? Your spot will
                  be released to others.
                </p>
                <div className={styles.bookingSummary}>
                  <div className={styles.bookingItem}>
                    <Calendar size={16} />
                    <span>{formatDay(selectedClass.day)}</span>
                  </div>
                  <div className={styles.bookingItem}>
                    <Clock size={16} />
                    <span>{selectedClass.time}</span>
                  </div>
                  <div className={styles.bookingItem}>
                    <MapPin size={16} />
                    <span>{selectedClass.location || 'Gym Main Floor'}</span>
                  </div>
                  <div className={styles.bookingItem}>
                    <User size={16} />
                    <span>
                      {selectedClass.trainerId?.fullName || 'Trainer'}
                    </span>
                  </div>
                </div>
                {actionError && (
                  <div className={styles.actionError}>{actionError}</div>
                )}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.btnSecondary}
                onClick={() => setShowUnbookModal(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                className={styles.btnDanger}
                onClick={confirmUnbook}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className={styles.spinner} /> Cancelling…
                  </>
                ) : (
                  'Confirm Unbook'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ Class Details Modal ============ */}
      {showClassDetails && selectedClass && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowClassDetails(false)}
        >
          <div
            className={styles.modalLarge}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <div className={styles.modalEmoji}>
                  {getDifficultyIcon(selectedClass.difficulty)}
                </div>
                <h2 className={styles.modalTitle}>
                  {selectedClass.sessionName}
                </h2>
                <div className={styles.modalMeta}>
                  <span
                    className={`${styles.levelBadge} ${
                      getLevelBadge(selectedClass.difficulty).className
                    }`}
                  >
                    {getLevelBadge(selectedClass.difficulty).label}
                  </span>
                </div>
              </div>
              <button
                className={styles.modalClose}
                onClick={() => setShowClassDetails(false)}
                type="button"
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Trainer</span>
                  <span className={styles.detailValue}>
                    {selectedClass.trainerId?.fullName || 'Trainer'}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Day</span>
                  <span className={styles.detailValue}>
                    {formatDay(selectedClass.day)}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Time</span>
                  <span className={styles.detailValue}>
                    {selectedClass.time}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Duration</span>
                  <span className={styles.detailValue}>
                    {selectedClass.duration || 60} minutes
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Location</span>
                  <span className={styles.detailValue}>
                    {selectedClass.location || 'Gym Main Floor'}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Capacity</span>
                  <span className={styles.detailValue}>
                    {selectedClass.currentParticipants || 0}/
                    {selectedClass.maxParticipants || 0}
                  </span>
                </div>
              </div>

              {selectedClass.description && (
                <div className={styles.detailSection}>
                  <h4 className={styles.detailSectionTitle}>Description</h4>
                  <p className={styles.detailDescription}>
                    {selectedClass.description}
                  </p>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.btnSecondary}
                onClick={() => setShowClassDetails(false)}
              >
                Close
              </button>
              {activeTab === 'booked' ? (
                <button
                  className={styles.btnDanger}
                  onClick={() => {
                    setShowClassDetails(false);
                    handleUnbookClass(selectedClass);
                  }}
                >
                  Unbook
                </button>
              ) : (
                <button
                  className={styles.btnPrimary}
                  onClick={() => {
                    setShowClassDetails(false);
                    handleBookClass(selectedClass);
                  }}
                >
                  Book Now
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classes;