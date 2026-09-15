import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Plus,
  Pencil,
  Trash2,
  Users,
  Clock,
  MapPin,
  Loader2,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import styles from './TrainerSchedule.module.css';

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

const DAYS = [
  { short: 'Mon', full: 'Monday' },
  { short: 'Tue', full: 'Tuesday' },
  { short: 'Wed', full: 'Wednesday' },
  { short: 'Thu', full: 'Thursday' },
  { short: 'Fri', full: 'Friday' },
  { short: 'Sat', full: 'Saturday' },
  { short: 'Sun', full: 'Sunday' },
];

// Map any incoming day string back to its short key for grouping
const toShortDay = (day = '') => {
  const found = DAYS.find(
    (d) => d.short === day || d.full === day || d.full.slice(0, 3) === day
  );
  return found ? found.short : day.slice(0, 3);
};

const emptyForm = {
  day: 'Mon',                // short key used by the form
  time: '',
  sessionName: '',
  difficulty: 'Intermediate',
  description: '',
  maxParticipants: 20,
  duration: 60,
  location: 'Gym Main Floor',
};

const Schedule = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [editingSession, setEditingSession] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');

  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [viewingSession, setViewingSession] = useState(null);
  const [sessionDetail, setSessionDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  const [toast, setToast] = useState(null);

  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  // ---------- Load sessions ----------
  const loadSessions = async () => {
    try {
      setLoading(true);
      setPageError('');
      const res = await fetch(`${API_BASE}/api/sessions/my-sessions`, {
        headers: authHeaders(),
      });
      const data = await parseResponse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.message || `Failed to load sessions (${res.status})`);
      }
      setSessions(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setPageError(err.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const weeklySchedule = useMemo(() => {
    const grouped = {};
    DAYS.forEach((d) => (grouped[d.short] = []));
    sessions.forEach((s) => {
      const key = toShortDay(s.day);
      if (grouped[key]) grouped[key].push(s);
    });
    Object.keys(grouped).forEach((k) =>
      grouped[k].sort((a, b) => (a.time || '').localeCompare(b.time || ''))
    );
    return grouped;
  }, [sessions]);

  // ============================================================
  // CREATE
  // ============================================================
  const handleCreateChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: '' }));
    if (submitError) setSubmitError('');
  };

  const validateCreate = () => {
    const e = {};
    if (!formData.day) e.day = 'Day is required';
    if (!formData.time) e.time = 'Time is required';
    if (!formData.sessionName.trim()) e.sessionName = 'Session name is required';
    if (!formData.difficulty) e.difficulty = 'Difficulty is required';
    if (formData.maxParticipants && formData.maxParticipants < 1)
      e.maxParticipants = 'Must be at least 1';
    if (formData.duration && formData.duration < 1)
      e.duration = 'Must be at least 1';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!validateCreate()) return;

    // Send the FULL day name for compatibility with stricter schemas
    const fullDay = DAYS.find((d) => d.short === formData.day)?.full || formData.day;

    const payload = {
      day: fullDay,
      time: formData.time,
      sessionName: formData.sessionName.trim(),
      difficulty: formData.difficulty,
      description: formData.description.trim() || null,
      maxParticipants: Number(formData.maxParticipants) || 20,
      duration: Number(formData.duration) || 60,
      location: formData.location.trim() || 'Gym Main Floor',
    };

    try {
      setSubmitting(true);
      setSubmitError('');
      const res = await fetch(`${API_BASE}/api/sessions/create`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await parseResponse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.message || `Failed to create session (${res.status})`);
      }
      setSessions((prev) => [...prev, data.data]);
      setToast({ type: 'success', message: 'Session created' });
      setFormData(emptyForm);
      setIsCreateOpen(false);
    } catch (err) {
      setSubmitError(err.message || 'Failed to create session');
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // EDIT
  // ============================================================
  const openEdit = (session) => {
    setEditingSession(session);
    setEditForm({
      day: toShortDay(session.day) || 'Mon',
      time: session.time || '',
      sessionName: session.sessionName || '',
      difficulty: session.difficulty || 'Intermediate',
      description: session.description || '',
      maxParticipants: session.maxParticipants ?? 20,
      duration: session.duration ?? 60,
      location: session.location || 'Gym Main Floor',
    });
    setEditError('');
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
    if (editError) setEditError('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (editSubmitting || !editingSession?._id) return;

    const fullDay = DAYS.find((d) => d.short === editForm.day)?.full || editForm.day;

    const payload = {
      day: fullDay,
      time: editForm.time,
      sessionName: editForm.sessionName.trim(),
      difficulty: editForm.difficulty,
      description: editForm.description.trim() || null,
      maxParticipants: Number(editForm.maxParticipants) || 20,
      duration: Number(editForm.duration) || 60,
      location: editForm.location.trim() || 'Gym Main Floor',
    };

    try {
      setEditSubmitting(true);
      setEditError('');
      const res = await fetch(
        `${API_BASE}/api/sessions/${editingSession._id}`,
        {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify(payload),
        }
      );
      const data = await parseResponse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.message || `Failed to update session (${res.status})`);
      }
      setSessions((prev) =>
        prev.map((s) => (s._id === data.data._id ? data.data : s))
      );
      setToast({ type: 'success', message: 'Session updated' });
      setEditingSession(null);
    } catch (err) {
      setEditError(err.message || 'Failed to update session');
    } finally {
      setEditSubmitting(false);
    }
  };

  // ============================================================
  // DELETE
  // ============================================================
  const handleDeleteConfirm = async () => {
    if (!sessionToDelete || deleting) return;
    try {
      setDeleting(true);
      setDeleteError('');
      const res = await fetch(
        `${API_BASE}/api/sessions/${sessionToDelete._id}`,
        { method: 'DELETE', headers: authHeaders() }
      );
      const data = await parseResponse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.message || `Failed to delete session (${res.status})`);
      }
      setSessions((prev) => prev.filter((s) => s._id !== sessionToDelete._id));
      setToast({ type: 'success', message: 'Session deleted' });
      setSessionToDelete(null);
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete session');
    } finally {
      setDeleting(false);
    }
  };

  // ============================================================
  // VIEW DETAIL
  // ============================================================
  const openDetail = async (session) => {
    setViewingSession(session);
    setSessionDetail(null);
    setDetailError('');
    try {
      setDetailLoading(true);
      const [detailRes, partRes] = await Promise.all([
        fetch(`${API_BASE}/api/sessions/${session._id}`, {
          headers: authHeaders(),
        }),
        fetch(`${API_BASE}/api/sessions/${session._id}/participants`, {
          headers: authHeaders(),
        }),
      ]);
      const detailData = await parseResponse(detailRes);
      const partData = await parseResponse(partRes);

      if (!detailRes.ok || !detailData.success) {
        throw new Error(detailData.message || `Failed to load session (${detailRes.status})`);
      }
      if (!partRes.ok || !partData.success) {
        throw new Error(partData.message || `Failed to load participants (${partRes.status})`);
      }

      setSessionDetail({
        session: detailData.data,
        participants: partData.data.participants || [],
        totalParticipants: partData.data.totalParticipants ?? 0,
        maxParticipants: partData.data.maxParticipants ?? 0,
        availableSpots: partData.data.availableSpots ?? 0,
      });
    } catch (err) {
      setDetailError(err.message || 'Failed to load session details');
    } finally {
      setDetailLoading(false);
    }
  };

  const getDifficultyClass = (difficulty = '') => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return styles.difficultyBeginner;
      case 'intermediate':
        return styles.difficultyIntermediate;
      case 'advanced':
        return styles.difficultyAdvanced;
      default:
        return styles.difficultyBeginner;
    }
  };

  // ---------- Render ----------
  if (loading) {
    return (
      <div className={styles.schedule}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>Schedule</h1>
            <p className={styles.subtitle}>Loading your sessions…</p>
          </div>
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className={styles.schedule}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>Schedule</h1>
          </div>
        </div>
        <div className={styles.stateError}>{pageError}</div>
      </div>
    );
  }

  return (
    <div className={styles.schedule}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Schedule</h1>
          <p className={styles.subtitle}>
            {sessions.length} session{sessions.length === 1 ? '' : 's'} scheduled this week.
          </p>
        </div>
        <button
          className={styles.addSessionBtn}
          onClick={() => {
            setFormData(emptyForm);
            setFormErrors({});
            setSubmitError('');
            setIsCreateOpen(true);
          }}
        >
          <Plus size={16} /> Add session
        </button>
      </div>

      {/* Weekly Grid — ALL 7 DAYS */}
      {sessions.length === 0 ? (
        <div className={styles.emptyState}>
          No sessions yet. Click <strong>Add session</strong> to create your first one.
        </div>
      ) : (
        <div className={styles.weeklyGrid}>
          {DAYS.map(({ short }) => (
            <div key={short} className={styles.dayColumn}>
              <div className={styles.dayHeader}>{short}</div>
              {weeklySchedule[short].length === 0 ? (
                <p className={styles.emptyDay}>No sessions</p>
              ) : (
                weeklySchedule[short].map((slot) => (
                  <div
                    key={slot._id}
                    className={styles.timeSlot}
                    onClick={() => openDetail(slot)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className={styles.slotTopRow}>
                      <span className={styles.slotTime}>
                        <Clock size={12} /> {slot.time}
                      </span>
                      <div
                        className={styles.slotActions}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          className={styles.iconBtn}
                          onClick={() => openEdit(slot)}
                          title="Edit session"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          type="button"
                          className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                          onClick={() => {
                            setDeleteError('');
                            setSessionToDelete(slot);
                          }}
                          title="Delete session"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    <div className={styles.slotName}>{slot.sessionName}</div>
                    <div className={styles.slotMetaRow}>
                      <span className={styles.slotMeta}>
                        <Users size={11} />
                        {slot.currentParticipants ?? 0}/{slot.maxParticipants ?? 0}
                      </span>
                      {slot.location && (
                        <span className={styles.slotMeta}>
                          <MapPin size={11} />
                          {slot.location}
                        </span>
                      )}
                    </div>
                    <span
                      className={`${styles.difficultyBadge} ${getDifficultyClass(slot.difficulty)}`}
                    >
                      {slot.difficulty}
                    </span>
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      )}

      {/* ============ CREATE MODAL ============ */}
      {isCreateOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => !submitting && setIsCreateOpen(false)}
        >
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Add New Session</h2>
            <form onSubmit={handleCreateSubmit} className={styles.modalForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Day</label>
                  <select
                    className={styles.formInput}
                    value={formData.day}
                    onChange={(e) => handleCreateChange('day', e.target.value)}
                    disabled={submitting}
                  >
                    {DAYS.map(({ short, full }) => (
                      <option key={short} value={short}>{full}</option>
                    ))}
                  </select>
                  {formErrors.day && <span className={styles.errorMessage}>{formErrors.day}</span>}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Time</label>
                  <input
                    type="time"
                    className={styles.formInput}
                    value={formData.time}
                    onChange={(e) => handleCreateChange('time', e.target.value)}
                    disabled={submitting}
                  />
                  {formErrors.time && <span className={styles.errorMessage}>{formErrors.time}</span>}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Session Name</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="e.g. Barbell Strength"
                  value={formData.sessionName}
                  onChange={(e) => handleCreateChange('sessionName', e.target.value)}
                  disabled={submitting}
                />
                {formErrors.sessionName && (
                  <span className={styles.errorMessage}>{formErrors.sessionName}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Difficulty</label>
                <select
                  className={styles.formInput}
                  value={formData.difficulty}
                  onChange={(e) => handleCreateChange('difficulty', e.target.value)}
                  disabled={submitting}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Max participants</label>
                  <input
                    type="number"
                    min="1"
                    className={styles.formInput}
                    value={formData.maxParticipants}
                    onChange={(e) =>
                      handleCreateChange('maxParticipants', parseInt(e.target.value) || 0)
                    }
                    disabled={submitting}
                  />
                  {formErrors.maxParticipants && (
                    <span className={styles.errorMessage}>{formErrors.maxParticipants}</span>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Duration (min)</label>
                  <input
                    type="number"
                    min="1"
                    className={styles.formInput}
                    value={formData.duration}
                    onChange={(e) =>
                      handleCreateChange('duration', parseInt(e.target.value) || 0)
                    }
                    disabled={submitting}
                  />
                  {formErrors.duration && (
                    <span className={styles.errorMessage}>{formErrors.duration}</span>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Location</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="e.g. Gym Main Floor"
                  value={formData.location}
                  onChange={(e) => handleCreateChange('location', e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Description</label>
                <textarea
                  className={styles.formTextarea}
                  placeholder="Optional notes about the session…"
                  value={formData.description}
                  onChange={(e) => handleCreateChange('description', e.target.value)}
                  rows={2}
                  maxLength={500}
                  disabled={submitting}
                />
              </div>

              {submitError && <div className={styles.submitError}>{submitError}</div>}

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setIsCreateOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn} disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 size={14} className={styles.spinner} /> Creating…
                    </>
                  ) : (
                    'Add session'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============ EDIT MODAL ============ */}
      {editingSession && (
        <div
          className={styles.modalOverlay}
          onClick={() => !editSubmitting && setEditingSession(null)}
        >
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Edit Session</h2>
            <form onSubmit={handleEditSubmit} className={styles.modalForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Day</label>
                  <select
                    className={styles.formInput}
                    value={editForm.day}
                    onChange={(e) => handleEditChange('day', e.target.value)}
                    disabled={editSubmitting}
                  >
                    {DAYS.map(({ short, full }) => (
                      <option key={short} value={short}>{full}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Time</label>
                  <input
                    type="time"
                    className={styles.formInput}
                    value={editForm.time}
                    onChange={(e) => handleEditChange('time', e.target.value)}
                    disabled={editSubmitting}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Session Name</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={editForm.sessionName}
                  onChange={(e) => handleEditChange('sessionName', e.target.value)}
                  disabled={editSubmitting}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Difficulty</label>
                <select
                  className={styles.formInput}
                  value={editForm.difficulty}
                  onChange={(e) => handleEditChange('difficulty', e.target.value)}
                  disabled={editSubmitting}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Max participants</label>
                  <input
                    type="number"
                    min="1"
                    className={styles.formInput}
                    value={editForm.maxParticipants}
                    onChange={(e) =>
                      handleEditChange('maxParticipants', parseInt(e.target.value) || 0)
                    }
                    disabled={editSubmitting}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Duration (min)</label>
                  <input
                    type="number"
                    min="1"
                    className={styles.formInput}
                    value={editForm.duration}
                    onChange={(e) =>
                      handleEditChange('duration', parseInt(e.target.value) || 0)
                    }
                    disabled={editSubmitting}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Location</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={editForm.location}
                  onChange={(e) => handleEditChange('location', e.target.value)}
                  disabled={editSubmitting}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Description</label>
                <textarea
                  className={styles.formTextarea}
                  value={editForm.description}
                  onChange={(e) => handleEditChange('description', e.target.value)}
                  rows={2}
                  maxLength={500}
                  disabled={editSubmitting}
                />
              </div>

              {editError && <div className={styles.submitError}>{editError}</div>}

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setEditingSession(null)}
                  disabled={editSubmitting}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn} disabled={editSubmitting}>
                  {editSubmitting ? (
                    <>
                      <Loader2 size={14} className={styles.spinner} /> Saving…
                    </>
                  ) : (
                    'Save changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============ DELETE MODAL ============ */}
      {sessionToDelete && (
        <div
          className={styles.modalOverlay}
          onClick={() => !deleting && setSessionToDelete(null)}
        >
          <div
            className={`${styles.modalContent} ${styles.deleteModal}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.deleteIcon}>
              <AlertTriangle size={32} />
            </div>
            <h2 className={styles.modalTitle}>Delete Session?</h2>
            <p className={styles.deleteText}>
              Are you sure you want to delete <strong>{sessionToDelete.sessionName}</strong> on{' '}
              {sessionToDelete.day} at {sessionToDelete.time}? This action cannot be undone.
            </p>

            {deleteError && <div className={styles.submitError}>{deleteError}</div>}

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setSessionToDelete(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 size={14} className={styles.spinner} /> Deleting…
                  </>
                ) : (
                  <>
                    <Trash2 size={14} /> Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ DETAIL MODAL ============ */}
      {viewingSession && (
        <div
          className={styles.modalOverlay}
          onClick={() => setViewingSession(null)}
        >
          <div
            className={`${styles.modalContent} ${styles.detailModal}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.detailHeader}>
              <div>
                <h2 className={styles.modalTitle}>{viewingSession.sessionName}</h2>
                <p className={styles.detailMeta}>
                  {viewingSession.day} · {viewingSession.time}
                  {viewingSession.location ? ` · ${viewingSession.location}` : ''}
                </p>
              </div>
              <button
                className={styles.closeBtn}
                onClick={() => setViewingSession(null)}
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            {detailLoading && (
              <div className={styles.detailLoading}>
                <Loader2 size={18} className={styles.spinner} /> Loading details…
              </div>
            )}

            {detailError && <div className={styles.submitError}>{detailError}</div>}

            {!detailLoading && !detailError && sessionDetail && (
              <>
                <div className={styles.detailStatsRow}>
                  <div className={styles.detailStat}>
                    <UserCheck size={14} />
                    <span className={styles.detailStatLabel}>Booked</span>
                    <span className={styles.detailStatValue}>
                      {sessionDetail.totalParticipants}/{sessionDetail.maxParticipants}
                    </span>
                  </div>
                  <div className={styles.detailStat}>
                    <Users size={14} />
                    <span className={styles.detailStatLabel}>Spots left</span>
                    <span className={styles.detailStatValue}>
                      {sessionDetail.availableSpots}
                    </span>
                  </div>
                </div>

                {sessionDetail.session?.description && (
                  <div className={styles.detailDescription}>
                    {sessionDetail.session.description}
                  </div>
                )}

                <h3 className={styles.detailSectionTitle}>
                  Participants ({sessionDetail.participants.length})
                </h3>

                {sessionDetail.participants.length === 0 ? (
                  <p className={styles.emptyNote}>No members booked yet.</p>
                ) : (
                  <div className={styles.participantList}>
                    {sessionDetail.participants.map((p) => (
                      <div key={p._id} className={styles.participantItem}>
                        <div className={styles.participantAvatar}>
                          {(p.fullName || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className={styles.participantInfo}>
                          <span className={styles.participantName}>{p.fullName}</span>
                          <span className={styles.participantMeta}>
                            {p.email}
                            {p.phone ? ` · ${p.phone}` : ''}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={styles.toast}
          style={
            toast.type === 'error'
              ? { borderColor: 'rgba(248, 113, 113, 0.5)', color: '#fca5a5' }
              : undefined
          }
        >
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default Schedule;