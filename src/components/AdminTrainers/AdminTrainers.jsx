import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Edit2,
  Calendar,
  Trash2,
  Users,
  Check,
  X,
  AlertTriangle,
  Loader2,
  Dumbbell,
  ClipboardList,
} from 'lucide-react';
import axios from 'axios';
import styles from './AdminTrainers.module.css';

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

const adminTrainerService = {
  getAll: async () => {
    const { data } = await api.get('/admin/trainers');
    return data;
  },
  getById: async (id) => {
    const { data } = await api.get(`/admin/trainers/${id}`);
    return data;
  },
  create: async (payload) => {
    const { data } = await api.post('/admin/trainers/add', payload);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await api.put(`/admin/trainers/${id}`, payload);
    return data;
  },
  remove: async (id) => {
    const { data } = await api.delete(`/admin/trainers/${id}`);
    return data;
  },
};

/* ============================================================
   BACKEND → UI MAPPER
   ============================================================ */
const mapFromBackend = (t) => {
  if (!t) return null;
  return {
    id: t._id,
    name: t.fullName || '',
    email: t.email || '',
    phone: t.phone || '',
    location: t.location || '',
    bio: t.bio || '',
    speciality: t.speciality || '',
    certifications: t.certifications || '',
    availability: t.availability || '',
    photoUrl: t.profilePicture?.url || '',
    photoPublicId: t.profilePicture?.publicId || '',
    isActive: t.isActive !== false,
    stats: {
      totalSessions: t.stats?.totalSessions ?? 0,
      totalWorkoutPlans: t.stats?.totalWorkoutPlans ?? 0,
      totalBookings: t.stats?.totalBookings ?? 0,
    },
  };
};

/* ============================================================
   COMPONENT
   ============================================================ */
const Trainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState(null);
  const [trainerToDelete, setTrainerToDelete] = useState(null);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    speciality: '',
    certifications: '',
    availability: '',
    isActive: true,
  });

  /* ============================================================
     FETCH
     ============================================================ */
  const fetchTrainers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminTrainerService.getAll();
      const list = (res.data || []).map(mapFromBackend).filter(Boolean);
      setTrainers(list);
    } catch (err) {
      console.error('Fetch trainers error:', err);
      setError(
        err.response?.data?.message ||
          'Failed to load trainers. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrainers();
  }, [fetchTrainers]);

  /* ============================================================
     TOAST
     ============================================================ */
  const showToastMessage = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  /* ============================================================
     FORM
     ============================================================ */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      location: '',
      bio: '',
      speciality: '',
      certifications: '',
      availability: '',
      isActive: true,
    });
    setPassword('');
    setFieldErrors({});
  };

  const handleAdd = () => {
    setEditingTrainer(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (trainer) => {
    setEditingTrainer(trainer);
    setFormData({
      name: trainer.name || '',
      email: trainer.email || '',
      phone: trainer.phone || '',
      location: trainer.location || '',
      bio: trainer.bio || '',
      speciality: trainer.speciality || '',
      certifications: trainer.certifications || '',
      availability: trainer.availability || '',
      isActive: trainer.isActive !== false,
    });
    setPassword('');
    setFieldErrors({});
    setIsModalOpen(true);
  };

  /* ============================================================
     DELETE
     ============================================================ */
  const handleDeleteClick = (trainer) => {
    setTrainerToDelete(trainer);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!trainerToDelete) return;
    try {
      setDeleting(true);
      await adminTrainerService.remove(trainerToDelete.id);
      setTrainers((prev) => prev.filter((t) => t.id !== trainerToDelete.id));
      showToastMessage(`${trainerToDelete.name} has been removed`);
      setTrainerToDelete(null);
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error('Delete trainer error:', err);
      showToastMessage(
        err.response?.data?.message || 'Failed to delete trainer',
        'error'
      );
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setTrainerToDelete(null);
    setIsDeleteModalOpen(false);
  };

  /* ============================================================
     VALIDATION
     ============================================================ */
  const validateForm = () => {
    const errs = {};

    const name = formData.name?.trim() || '';
    if (!name) errs.name = 'Full name is required';
    else if (name.length < 2) errs.name = 'Must be at least 2 characters';
    else if (name.length > 50) errs.name = 'Cannot exceed 50 characters';

    if (!editingTrainer) {
      const email = formData.email?.trim() || '';
      if (!email) errs.email = 'Email is required';
      else if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = 'Invalid email';

      if (!password) errs.password = 'Password is required';
      else if (password.length < 6) errs.password = 'At least 6 characters';
      else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password))
        errs.password = 'Must contain 1 uppercase, 1 lowercase, and 1 number';
    }

    if (formData.bio && formData.bio.length > 500)
      errs.bio = 'Bio cannot exceed 500 characters';
    if (formData.speciality && formData.speciality.length > 200)
      errs.speciality = 'Speciality cannot exceed 200 characters';
    if (formData.certifications && formData.certifications.length > 500)
      errs.certifications = 'Certifications cannot exceed 500 characters';
    if (formData.availability && formData.availability.length > 500)
      errs.availability = 'Availability cannot exceed 500 characters';

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ============================================================
     SUBMIT
     ============================================================ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!validateForm()) return;

    setSubmitting(true);

    try {
      if (editingTrainer) {
        // ---- UPDATE ----
        const payload = {
          fullName: formData.name.trim(),
          phone: formData.phone?.trim() || null,
          location: formData.location?.trim() || null,
          bio: formData.bio?.trim() || null,
          speciality: formData.speciality?.trim() || null,
          certifications: formData.certifications?.trim() || null,
          availability: formData.availability?.trim() || null,
          isActive: formData.isActive,
        };

        const res = await adminTrainerService.update(editingTrainer.id, payload);
        const updated = mapFromBackend(res.data);
        // Preserve stats (update endpoint doesn't recompute)
        updated.stats = editingTrainer.stats;

        setTrainers((prev) =>
          prev.map((t) => (t.id === editingTrainer.id ? updated : t))
        );
        showToastMessage(`${payload.fullName} has been updated successfully`);
      } else {
        // ---- CREATE ----
        const payload = {
          fullName: formData.name.trim(),
          email: formData.email.trim(),
          password,
          phone: formData.phone?.trim() || null,
          location: formData.location?.trim() || null,
          bio: formData.bio?.trim() || null,
          speciality: formData.speciality?.trim() || null,
          certifications: formData.certifications?.trim() || null,
          availability: formData.availability?.trim() || null,
        };

        const res = await adminTrainerService.create(payload);
        const created = mapFromBackend(res.data);
        created.stats = {
          totalSessions: 0,
          totalWorkoutPlans: 0,
          totalBookings: 0,
        };

        setTrainers((prev) => [created, ...prev]);
        showToastMessage(`${created.name} has been invited successfully`);
      }

      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      console.error('Submit trainer error:', err);
      showToastMessage(
        err.response?.data?.message || 'Operation failed. Please try again.',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ============================================================
     SCHEDULE (placeholder)
     ============================================================ */
  const handleSchedule = (trainer) => {
    showToastMessage(
      `${trainer.name} runs ${trainer.stats.totalSessions} active session${
        trainer.stats.totalSessions === 1 ? '' : 's'
      }`
    );
  };

  /* ============================================================
     AVATAR HELPER
     ============================================================ */
  const initialsOf = (name = '') =>
    name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div className={styles.trainersPage}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Trainers</h1>
          <p className={styles.subtitle}>
            {loading
              ? 'Loading…'
              : `${trainers.length} coaching staff member${
                  trainers.length !== 1 ? 's' : ''
                }`}
          </p>
        </div>
        <button
          className={styles.inviteBtn}
          onClick={handleAdd}
          type="button"
        >
          <Plus size={18} />
          Invite trainer
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className={styles.stateMessage}>
          <Loader2 size={22} className={styles.spin} />
          Loading trainers…
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className={styles.stateError}>
          {error}
          <button className={styles.retryBtn} onClick={fetchTrainers}>
            Retry
          </button>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && (
        <div className={styles.trainersGrid}>
          {trainers.length === 0 ? (
            <p className={styles.emptyNote}>
              No trainers yet. Click "Invite trainer" to add one.
            </p>
          ) : (
            trainers.map((trainer) => (
              <div key={trainer.id} className={styles.trainerCard}>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDeleteClick(trainer)}
                  title="Delete trainer"
                  type="button"
                >
                  <Trash2 size={16} />
                </button>

                <div className={styles.imageContainer}>
                  {trainer.photoUrl ? (
                    <img
                      src={trainer.photoUrl}
                      alt={trainer.name}
                      className={styles.trainerImage}
                    />
                  ) : (
                    <div className={styles.trainerImagePlaceholder}>
                      {initialsOf(trainer.name)}
                    </div>
                  )}
                </div>

                <div className={styles.trainerInfo}>
                  <div className={styles.nameRow}>
                    <h3 className={styles.trainerName}>{trainer.name}</h3>
                    <span
                      className={`${styles.statusDot} ${
                        trainer.isActive
                          ? styles.statusActive
                          : styles.statusInactive
                      }`}
                      title={trainer.isActive ? 'Active' : 'Inactive'}
                    />
                  </div>

                  <p className={styles.trainerSpecialty}>
                    {trainer.speciality || 'Speciality not set'}
                  </p>

                  {trainer.email && (
                    <p className={styles.trainerEmail}>{trainer.email}</p>
                  )}

                  <div className={styles.trainerStats}>
                    <div className={styles.stat}>
                      <Calendar size={14} className={styles.statIcon} />
                      <span>{trainer.stats.totalSessions} sessions</span>
                    </div>
                    <div className={styles.stat}>
                      <Dumbbell size={14} className={styles.statIcon} />
                      <span>{trainer.stats.totalWorkoutPlans} plans</span>
                    </div>
                    <div className={styles.stat}>
                      <Users size={14} className={styles.statIcon} />
                      <span>{trainer.stats.totalBookings} bookings</span>
                    </div>
                  </div>

                  <div className={styles.actionButtons}>
                    <button
                      className={`${styles.actionBtn} ${styles.editBtn}`}
                      onClick={() => handleEdit(trainer)}
                      type="button"
                    >
                      <Edit2 size={14} style={{ marginRight: '4px' }} />
                      Edit
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.scheduleBtn}`}
                      onClick={() => handleSchedule(trainer)}
                      type="button"
                    >
                      <ClipboardList
                        size={14}
                        style={{ marginRight: '4px' }}
                      />
                      Schedule
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ============ Add/Edit Modal ============ */}
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
                {editingTrainer ? 'Edit Trainer' : 'Invite New Trainer'}
              </h2>
              <button
                className={styles.closeBtn}
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
                type="button"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              {/* ---------- Account ---------- */}
              <div className={styles.formSection}>
                <h3 className={styles.formSectionTitle}>Account</h3>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    className={`${styles.formInput} ${
                      fieldErrors.name ? styles.inputError : ''
                    }`}
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. John Smith"
                    disabled={submitting}
                  />
                  {fieldErrors.name && (
                    <span className={styles.errorMessage}>
                      {fieldErrors.name}
                    </span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Email *</label>
                  <input
                    type="email"
                    name="email"
                    className={`${styles.formInput} ${
                      fieldErrors.email ? styles.inputError : ''
                    }`}
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="trainer@example.com"
                    disabled={!!editingTrainer || submitting}
                  />
                  {fieldErrors.email && (
                    <span className={styles.errorMessage}>
                      {fieldErrors.email}
                    </span>
                  )}
                  {editingTrainer && (
                    <span className={styles.formHint}>
                      Email cannot be changed after creation.
                    </span>
                  )}
                </div>

                {!editingTrainer && (
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Password *</label>
                    <input
                      type="password"
                      className={`${styles.formInput} ${
                        fieldErrors.password ? styles.inputError : ''
                      }`}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (fieldErrors.password)
                          setFieldErrors((p) => ({ ...p, password: '' }));
                      }}
                      placeholder="Min 6 chars, 1 upper, 1 lower, 1 number"
                      disabled={submitting}
                    />
                    {fieldErrors.password && (
                      <span className={styles.errorMessage}>
                        {fieldErrors.password}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* ---------- Personal Information ---------- */}
              <div className={styles.formSection}>
                <h3 className={styles.formSectionTitle}>
                  Personal Information
                </h3>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Phone</label>
                    <input
                      type="text"
                      name="phone"
                      className={styles.formInput}
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+20 100 000 0000"
                      disabled={submitting}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Location</label>
                    <input
                      type="text"
                      name="location"
                      className={styles.formInput}
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g. Cairo, Egypt"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Bio</label>
                  <textarea
                    name="bio"
                    className={`${styles.formInput} ${
                      fieldErrors.bio ? styles.inputError : ''
                    }`}
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Short bio (max 500 chars)"
                    maxLength={500}
                    rows={3}
                    disabled={submitting}
                    style={{ resize: 'vertical', fontFamily: 'inherit' }}
                  />
                  {fieldErrors.bio && (
                    <span className={styles.errorMessage}>
                      {fieldErrors.bio}
                    </span>
                  )}
                </div>
              </div>

              {/* ---------- Professional Details ---------- */}
              <div className={styles.formSection}>
                <h3 className={styles.formSectionTitle}>
                  Professional Details
                </h3>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Speciality</label>
                  <input
                    type="text"
                    name="speciality"
                    className={`${styles.formInput} ${
                      fieldErrors.speciality ? styles.inputError : ''
                    }`}
                    value={formData.speciality}
                    onChange={handleInputChange}
                    placeholder="e.g. Strength & Powerlifting"
                    maxLength={200}
                    disabled={submitting}
                  />
                  {fieldErrors.speciality && (
                    <span className={styles.errorMessage}>
                      {fieldErrors.speciality}
                    </span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Certifications</label>
                  <input
                    type="text"
                    name="certifications"
                    className={`${styles.formInput} ${
                      fieldErrors.certifications ? styles.inputError : ''
                    }`}
                    value={formData.certifications}
                    onChange={handleInputChange}
                    placeholder="e.g. NASM-CPT, ACE"
                    maxLength={500}
                    disabled={submitting}
                  />
                  {fieldErrors.certifications && (
                    <span className={styles.errorMessage}>
                      {fieldErrors.certifications}
                    </span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Availability</label>
                  <input
                    type="text"
                    name="availability"
                    className={`${styles.formInput} ${
                      fieldErrors.availability ? styles.inputError : ''
                    }`}
                    value={formData.availability}
                    onChange={handleInputChange}
                    placeholder="e.g. Mon-Fri 9am-5pm"
                    maxLength={500}
                    disabled={submitting}
                  />
                  {fieldErrors.availability && (
                    <span className={styles.errorMessage}>
                      {fieldErrors.availability}
                    </span>
                  )}
                </div>
              </div>

              {/* ---------- Status (edit only) ---------- */}
              {editingTrainer && (
                <div className={styles.formSection}>
                  <h3 className={styles.formSectionTitle}>Status</h3>
                  <div className={styles.highlightToggle}>
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      disabled={submitting}
                    />
                    <label htmlFor="isActive">
                      Active (visible and bookable)
                    </label>
                  </div>
                </div>
              )}

              {/* ---------- Photo (edit only) ---------- */}
              {editingTrainer && (
                <div className={styles.formSection}>
                  <h3 className={styles.formSectionTitle}>Profile Photo</h3>
                  <div className={styles.photoNotice}>
                    <p>
                      Trainers upload their own photo from their profile page.
                      {editingTrainer.photoUrl
                        ? ' A photo is currently set.'
                        : ' No photo uploaded yet.'}
                    </p>
                  </div>
                </div>
              )}

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
                    : editingTrainer
                    ? 'Update Trainer'
                    : 'Add Trainer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============ Delete Modal ============ */}
      {isDeleteModalOpen && trainerToDelete && (
        <div className={styles.modalOverlay} onClick={cancelDelete}>
          <div
            className={styles.deleteModalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.deleteModalIcon}>
              <AlertTriangle size={48} />
            </div>

            <h2 className={styles.deleteModalTitle}>Delete Trainer</h2>

            <p className={styles.deleteModalText}>
              Are you sure you want to remove{' '}
              <strong>{trainerToDelete.name}</strong>? This action cannot be
              undone and will remove all associated data.
            </p>

            <div className={styles.deleteModalWarning}>
              <p>
                ⚠️ This will also delete{' '}
                {trainerToDelete.stats.totalSessions} session(s) and{' '}
                {trainerToDelete.stats.totalWorkoutPlans} workout plan(s)
              </p>
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
                {deleting ? 'Deleting…' : 'Delete Trainer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ Toast ============ */}
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

export default Trainers;