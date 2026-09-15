import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import axios from 'axios';
import styles from './AdminClasses.module.css';

/* ============================================================
   INLINE API SERVICE
   ============================================================ */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('authToken') ||
      sessionStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

const adminClassService = {
  getAll: async () => {
    const { data } = await api.get('/admin/classes');
    return data;
  },
  getById: async (id) => {
    const { data } = await api.get(`/admin/classes/${id}`);
    return data;
  },
  create: async (payload) => {
    const { data } = await api.post('/admin/classes/add', payload);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await api.put(`/admin/classes/${id}`, payload);
    return data;
  },
  remove: async (id) => {
    const { data } = await api.delete(`/admin/classes/${id}`);
    return data;
  },
  getStats: async () => {
    const { data } = await api.get('/admin/classes/stats/overview');
    return data;
  },
};

const adminTrainerService = {
  getAll: async () => {
    const { data } = await api.get('/admin/trainers');
    return data;
  },
};

/* ============================================================
   HELPERS
   ============================================================ */
const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAYS_LONG = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday',
};
const LONG_TO_SHORT = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
};

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

// Backend Session → UI class shape
const mapFromBackend = (s) => {
  if (!s) return null;

  const trainerName =
    s.trainerId && typeof s.trainerId === 'object'
      ? s.trainerId.fullName
      : '—';

  const trainerId =
    s.trainerId && typeof s.trainerId === 'object'
      ? s.trainerId._id
      : s.trainerId;

  const current = s.currentParticipants ?? (s.bookedMembers?.length || 0);
  const max = s.maxParticipants || 0;

  return {
    id: s._id,
    name: s.sessionName || '',
    description: s.description || '',
    trainerId,
    trainer: trainerName,
    day: LONG_TO_SHORT[s.day] || s.day || 'Mon',
    time: s.time || '',
    durationNum: s.duration || 60,
    duration: `${s.duration || 60} min`,
    maxParticipants: max,
    currentParticipants: current,
    booked: `${current}/${max}`,
    location: s.location || 'Gym Main Floor',
    level: s.difficulty || 'Intermediate',
  };
};

/* ============================================================
   COMPONENT
   ============================================================ */
const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [classToDelete, setClassToDelete] = useState(null);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const [formData, setFormData] = useState({
    name: '',
    trainerId: '',
    day: 'Mon',
    time: '',
    durationNum: 60,
    maxParticipants: 20,
    currentParticipants: 0,
    level: 'Intermediate',
    description: '',
    location: 'Gym Main Floor',
  });

  // ============ FETCH ============
  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [classesRes, trainersRes] = await Promise.all([
        adminClassService.getAll(),
        adminTrainerService.getAll(),
      ]);

      const classList = (classesRes.data || [])
        .map(mapFromBackend)
        .filter(Boolean);
      setClasses(classList);

      const trainerList = (trainersRes.data || []).map((t) => ({
        id: t._id,
        name: t.fullName,
      }));
      setTrainers(trainerList);
    } catch (err) {
      console.error('Fetch classes error:', err);
      setError(
        err.response?.data?.message ||
          'Failed to load classes. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ============ TOAST ============
  const showToastMessage = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // ============ FORM ============
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      trainerId: '',
      day: 'Mon',
      time: '',
      durationNum: 60,
      maxParticipants: 20,
      currentParticipants: 0,
      level: 'Intermediate',
      description: '',
      location: 'Gym Main Floor',
    });
  };

  // ============ ADD ============
  const handleAdd = () => {
    setEditingClass(null);
    resetForm();
    setIsModalOpen(true);
  };

  // ============ EDIT ============
  const handleEdit = (classItem) => {
    setEditingClass(classItem);
    setFormData({
      name: classItem.name || '',
      trainerId: classItem.trainerId || '',
      day: classItem.day || 'Mon',
      time: classItem.time || '',
      durationNum: classItem.durationNum || 60,
      maxParticipants: classItem.maxParticipants || 20,
      currentParticipants: classItem.currentParticipants || 0,
      level: classItem.level || 'Intermediate',
      description: classItem.description || '',
      location: classItem.location || 'Gym Main Floor',
    });
    setIsModalOpen(true);
  };

  // ============ DELETE ============
  const handleDeleteClick = (classItem) => {
    setClassToDelete(classItem);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!classToDelete) return;
    try {
      setDeleting(true);
      await adminClassService.remove(classToDelete.id);
      setClasses((prev) => prev.filter((c) => c.id !== classToDelete.id));
      showToastMessage(`${classToDelete.name} has been removed`);
      setClassToDelete(null);
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error('Delete class error:', err);
      showToastMessage(
        err.response?.data?.message || 'Failed to delete class',
        'error'
      );
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setClassToDelete(null);
    setIsDeleteModalOpen(false);
  };

  // ============ SUBMIT ============
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.trainerId) {
      showToastMessage('Please select a trainer', 'error');
      return;
    }

    // Normalize time to HH:MM
    const normalizeTime = (t) => {
      if (!t) return '';
      const parts = t.split(':');
      if (parts.length < 2) return t;
      const hh = parts[0].padStart(2, '0');
      const mm = parts[1].padStart(2, '0');
      return `${hh}:${mm}`;
    };

    // Build payload — convert short day → long day for backend
    const payload = {
      trainerId: formData.trainerId,
      day: DAYS_LONG[formData.day] || formData.day,
      time: normalizeTime(formData.time),
      sessionName: formData.name?.trim(),
      difficulty: formData.level,
      description: formData.description?.trim() || null,
      maxParticipants: Number(formData.maxParticipants) || 20,
      duration: Number(formData.durationNum) || 60,
      location: formData.location?.trim() || 'Gym Main Floor',
    };

    setSubmitting(true);
    try {
      if (editingClass) {
        const res = await adminClassService.update(editingClass.id, payload);
        const updated = mapFromBackend(res.data);
        setClasses((prev) =>
          prev.map((c) => (c.id === editingClass.id ? updated : c))
        );
        showToastMessage(`${formData.name} has been updated successfully`);
      } else {
        const res = await adminClassService.create(payload);
        const created = mapFromBackend(res.data);
        setClasses((prev) => [...prev, created]);
        showToastMessage(`${formData.name} has been added successfully`);
      }

      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      console.error('Submit class error:', err);
      console.error('Backend data:', err.response?.data);
      showToastMessage(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Operation failed. Please try again.',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ============ LEVEL BADGE ============
  const getLevelClass = (level) => {
    switch (level) {
      case 'Beginner':
        return styles.levelBeginner;
      case 'Intermediate':
        return styles.levelIntermediate;
      case 'Advanced':
        return styles.levelAdvanced;
      default:
        return styles.levelIntermediate;
    }
  };

  // ============ RENDER ============
  return (
    <div className={styles.classesPage}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Classes</h1>
          <p className={styles.subtitle}>
            {loading
              ? 'Loading…'
              : `Weekly timetable — ${classes.length} class${
                  classes.length !== 1 ? 'es' : ''
                }`}
          </p>
        </div>
        <button className={styles.addBtn} onClick={handleAdd}>
          <Plus size={18} />
          New class
        </button>
      </div>

      {loading && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '3rem',
            color: '#9ca3af',
            gap: '0.75rem',
          }}
        >
          <Loader2 size={22} className="spin" />
          Loading classes…
        </div>
      )}

      {!loading && error && (
        <div
          style={{
            padding: '1.5rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            color: '#ef4444',
            textAlign: 'center',
          }}
        >
          {error}
          <button
            onClick={fetchAll}
            style={{
              marginLeft: '1rem',
              padding: '0.4rem 1rem',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Class</th>
                <th>Trainer</th>
                <th>Day</th>
                <th>Time</th>
                <th>Duration</th>
                <th>Booked</th>
                <th>Level</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    style={{
                      textAlign: 'center',
                      padding: '2rem',
                      color: '#6b7280',
                    }}
                  >
                    No classes yet. Click "New class" to add one.
                  </td>
                </tr>
              ) : (
                classes.map((classItem) => (
                  <tr key={classItem.id}>
                    <td>
                      <span className={styles.className}>
                        {classItem.name}
                      </span>
                    </td>
                    <td>{classItem.trainer}</td>
                    <td>{classItem.day}</td>
                    <td>{classItem.time}</td>
                    <td>{classItem.duration}</td>
                    <td>{classItem.booked}</td>
                    <td>
                      <span
                        className={`${styles.levelBadge} ${getLevelClass(
                          classItem.level
                        )}`}
                      >
                        {classItem.level}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`${styles.actionBtn} ${styles.editBtn}`}
                        onClick={() => handleEdit(classItem)}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        onClick={() => handleDeleteClick(classItem)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => !submitting && setIsModalOpen(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingClass ? 'Edit Class' : 'Add New Class'}
              </h2>
              <button
                className={styles.closeBtn}
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Class Name *</label>
                <input
                  type="text"
                  name="name"
                  className={styles.formInput}
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Barbell Strength"
                  required
                  disabled={submitting}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Trainer *</label>
                  <select
                    name="trainerId"
                    className={styles.formSelect}
                    value={formData.trainerId}
                    onChange={handleInputChange}
                    required
                    disabled={submitting || trainers.length === 0}
                  >
                    <option value="">
                      {trainers.length === 0
                        ? 'No trainers available'
                        : 'Select a trainer…'}
                    </option>
                    {trainers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Level *</label>
                  <select
                    name="level"
                    className={styles.formSelect}
                    value={formData.level}
                    onChange={handleInputChange}
                    disabled={submitting}
                  >
                    {LEVELS.map((lv) => (
                      <option key={lv} value={lv}>
                        {lv}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Day *</label>
                  <select
                    name="day"
                    className={styles.formSelect}
                    value={formData.day}
                    onChange={handleInputChange}
                    disabled={submitting}
                  >
                    {DAYS_SHORT.map((d) => (
                      <option key={d} value={d}>
                        {DAYS_LONG[d]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Time *</label>
                  <input
                    type="time"
                    name="time"
                    className={styles.formInput}
                    value={formData.time}
                    onChange={handleInputChange}
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Duration (min) *
                  </label>
                  <input
                    type="number"
                    name="durationNum"
                    className={styles.formInput}
                    value={formData.durationNum}
                    onChange={handleInputChange}
                    min="5"
                    max="300"
                    required
                    disabled={submitting}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Max Participants *
                  </label>
                  <input
                    type="number"
                    name="maxParticipants"
                    className={styles.formInput}
                    value={formData.maxParticipants}
                    onChange={handleInputChange}
                    min="1"
                    max="200"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Location</label>
                <input
                  type="text"
                  name="location"
                  className={styles.formInput}
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g. Gym Main Floor"
                  disabled={submitting}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Description</label>
                <textarea
                  name="description"
                  className={styles.formInput}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Short description (optional)"
                  rows={3}
                  disabled={submitting}
                  style={{ resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={submitting}
                >
                  {submitting
                    ? 'Saving…'
                    : editingClass
                    ? 'Update Class'
                    : 'Add Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && classToDelete && (
        <div className={styles.modalOverlay} onClick={cancelDelete}>
          <div
            className={styles.deleteModalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.deleteModalIcon}>
              <AlertTriangle size={48} />
            </div>

            <h2 className={styles.deleteModalTitle}>Delete Class</h2>

            <p className={styles.deleteModalText}>
              Are you sure you want to remove{' '}
              <strong>{classToDelete.name}</strong>? This action cannot be
              undone.
            </p>

            <div className={styles.deleteModalInfo}>
              <div className={styles.deleteModalInfoItem}>
                <span className={styles.deleteModalInfoLabel}>Trainer:</span>
                <span className={styles.deleteModalInfoValue}>
                  {classToDelete.trainer}
                </span>
              </div>
              <div className={styles.deleteModalInfoItem}>
                <span className={styles.deleteModalInfoLabel}>Schedule:</span>
                <span className={styles.deleteModalInfoValue}>
                  {classToDelete.day} · {classToDelete.time}
                </span>
              </div>
              <div className={styles.deleteModalInfoItem}>
                <span className={styles.deleteModalInfoLabel}>Booked:</span>
                <span className={styles.deleteModalInfoValue}>
                  {classToDelete.booked}
                </span>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={cancelDelete}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.deleteConfirmBtn}
                onClick={confirmDelete}
                disabled={deleting}
              >
                <Trash2 size={16} style={{ marginRight: '6px' }} />
                {deleting ? 'Deleting…' : 'Delete Class'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div
          className={styles.toast}
          style={
            toastType === 'error'
              ? {
                  borderColor: 'rgba(239, 68, 68, 0.4)',
                  boxShadow:
                    '0 12px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(239, 68, 68, 0.2)',
                }
              : undefined
          }
        >
          <div
            className={styles.toastIcon}
            style={
              toastType === 'error'
                ? {
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#ef4444',
                  }
                : undefined
            }
          >
            {toastType === 'error' ? <X size={16} /> : <Check size={16} />}
          </div>
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default Classes;