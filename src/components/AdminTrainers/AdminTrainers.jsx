import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Plus,
  Edit2,
  Calendar,
  Trash2,
  Star,
  Users,
  Check,
  X,
  AlertTriangle,
  Image as ImageIcon,
  Loader2,
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
const DEFAULT_PHOTO =
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

const mapFromBackend = (t) => {
  if (!t) return null;
  return {
    id: t._id,
    name: t.fullName || '',
    email: t.email || '',
    phone: t.phone || '',
    location: t.location || '',
    bio: t.bio || '',
    specialty: t.speciality || '—',
    certifications: t.certifications || '',
    availability: t.availability || '',
    // UI-only fields (not persisted):
    experience: t.certifications || 'Certified Trainer',
    rating: 5.0,
    members: t.stats?.totalBookings ?? 0,
    photo: t.photo || DEFAULT_PHOTO,
    stats: t.stats || null,
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
  const [photoPreview, setPhotoPreview] = useState(null);
  const [password, setPassword] = useState('');

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialty: '',
    experience: '',
    phone: '',
    location: '',
    bio: '',
    certifications: '',
    availability: '',
    rating: 4.5,
    members: 0,
    photo: null,
  });

  // ============ FETCH ============
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

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToastMessage('Please upload an image file', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToastMessage('Image size should be less than 5MB', 'error');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);
    setFormData((prev) => ({ ...prev, photo: file }));
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const removePhoto = () => {
    setPhotoPreview(null);
    setFormData((prev) => ({ ...prev, photo: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      specialty: '',
      experience: '',
      phone: '',
      location: '',
      bio: '',
      certifications: '',
      availability: '',
      rating: 4.5,
      members: 0,
      photo: null,
    });
    setPassword('');
    setPhotoPreview(null);
  };

  // ============ ADD ============
  const handleAdd = () => {
    setEditingTrainer(null);
    resetForm();
    setIsModalOpen(true);
  };

  // ============ EDIT ============
  const handleEdit = (trainer) => {
    setEditingTrainer(trainer);
    setFormData({
      name: trainer.name || '',
      email: trainer.email || '',
      specialty: trainer.specialty || '',
      experience: trainer.experience || '',
      phone: trainer.phone || '',
      location: trainer.location || '',
      bio: trainer.bio || '',
      certifications: trainer.certifications || '',
      availability: trainer.availability || '',
      rating: trainer.rating || 4.5,
      members: trainer.members || 0,
      photo: null,
    });
    setPhotoPreview(trainer.photo);
    setIsModalOpen(true);
  };

  // ============ DELETE ============
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

  // ============ SUBMIT ============
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingTrainer) {
        // ---- UPDATE ----
        const payload = {
          fullName: formData.name?.trim(),
          phone: formData.phone?.trim() || null,
          location: formData.location?.trim() || null,
          bio: formData.bio?.trim() || null,
          speciality: formData.specialty?.trim() || null,
          certifications: formData.certifications?.trim() || null,
          availability: formData.availability?.trim() || null,
          isActive: true,
        };

        const res = await adminTrainerService.update(editingTrainer.id, payload);

        const updated = {
          ...mapFromBackend(res.data),
          rating: formData.rating,
          members: formData.members,
          photo: photoPreview || editingTrainer.photo,
        };

        setTrainers((prev) =>
          prev.map((t) => (t.id === editingTrainer.id ? updated : t))
        );
        showToastMessage(`${formData.name} has been updated successfully`);
      } else {
        // ---- CREATE ----
        if (!formData.email?.trim()) {
          showToastMessage('Email is required', 'error');
          setSubmitting(false);
          return;
        }
        if (!password || password.length < 6) {
          showToastMessage('Password must be at least 6 characters', 'error');
          setSubmitting(false);
          return;
        }
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
          showToastMessage(
            'Password must contain 1 uppercase, 1 lowercase, and 1 number',
            'error'
          );
          setSubmitting(false);
          return;
        }

        const payload = {
          fullName: formData.name?.trim(),
          email: formData.email?.trim(),
          password,
          phone: formData.phone?.trim() || null,
          location: formData.location?.trim() || null,
          bio: formData.bio?.trim() || null,
          speciality: formData.specialty?.trim() || null,
          certifications: formData.certifications?.trim() || null,
          availability: formData.availability?.trim() || null,
        };

        const res = await adminTrainerService.create(payload);

        const created = {
          ...mapFromBackend(res.data),
          rating: formData.rating,
          members: formData.members,
          photo: photoPreview || DEFAULT_PHOTO,
        };

        setTrainers((prev) => [...prev, created]);
        showToastMessage(`${created.name} has been invited successfully`);
      }

      // Cleanup blob URL
      if (photoPreview && photoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview);
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

  // ============ SCHEDULE (placeholder) ============
  const handleSchedule = (trainer) => {
    showToastMessage(`Viewing schedule for ${trainer.name}`);
  };

  // ============ RENDER ============
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
        <button className={styles.inviteBtn} onClick={handleAdd}>
          <Plus size={18} />
          Invite trainer
        </button>
      </div>

      {/* Loading */}
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
          Loading trainers…
        </div>
      )}

      {/* Error */}
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
            onClick={fetchTrainers}
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

      {/* Grid */}
      {!loading && !error && (
        <div className={styles.trainersGrid}>
          {trainers.length === 0 ? (
            <p
              style={{
                color: '#6b7280',
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '2rem',
              }}
            >
              No trainers yet. Click "Invite trainer" to add one.
            </p>
          ) : (
            trainers.map((trainer) => (
              <div key={trainer.id} className={styles.trainerCard}>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDeleteClick(trainer)}
                  title="Delete trainer"
                >
                  <Trash2 size={16} />
                </button>

                <div className={styles.imageContainer}>
                  <img
                    src={trainer.photo}
                    alt={trainer.name}
                    className={styles.trainerImage}
                  />
                </div>

                <div className={styles.trainerInfo}>
                  <h3 className={styles.trainerName}>{trainer.name}</h3>
                  <p className={styles.trainerSpecialty}>
                    {trainer.specialty}
                  </p>
                  <p className={styles.trainerExperience}>
                    {trainer.experience}
                  </p>

                  <div className={styles.trainerStats}>
                    <div className={styles.rating}>
                      <Star
                        size={16}
                        className={styles.starIcon}
                        fill="currentColor"
                      />
                      <span>{trainer.rating}</span>
                    </div>
                    <div className={styles.membersCount}>
                      <Users size={16} className={styles.userIcon} />
                      <span>{trainer.members} members</span>
                    </div>
                  </div>

                  <div className={styles.actionButtons}>
                    <button
                      className={`${styles.actionBtn} ${styles.editBtn}`}
                      onClick={() => handleEdit(trainer)}
                    >
                      <Edit2 size={14} style={{ marginRight: '4px' }} />
                      Edit
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.scheduleBtn}`}
                      onClick={() => handleSchedule(trainer)}
                    >
                      <Calendar size={14} style={{ marginRight: '4px' }} />
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
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              {/* Personal Information */}
              <div className={styles.formSection}>
                <h3 className={styles.formSectionTitle}>
                  Personal Information
                </h3>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    className={styles.formInput}
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. John Smith"
                    required
                    disabled={submitting}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Email *</label>
                  <input
                    type="email"
                    name="email"
                    className={styles.formInput}
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="trainer@example.com"
                    required
                    disabled={!!editingTrainer || submitting}
                  />
                </div>

                {!editingTrainer && (
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Password *</label>
                    <input
                      type="password"
                      className={styles.formInput}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 chars, 1 upper, 1 lower, 1 number"
                      required
                      disabled={submitting}
                    />
                  </div>
                )}

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Phone</label>
                    <input
                      type="text"
                      name="phone"
                      className={styles.formInput}
                      value={formData.phone}
                      onChange={handleInputChange}
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
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Specialty *</label>
                  <input
                    type="text"
                    name="specialty"
                    className={styles.formInput}
                    value={formData.specialty}
                    onChange={handleInputChange}
                    placeholder="e.g. Strength & Powerlifting"
                    required
                    disabled={submitting}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Bio</label>
                  <textarea
                    name="bio"
                    className={styles.formInput}
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Short bio (max 500 chars)"
                    maxLength={500}
                    rows={3}
                    disabled={submitting}
                    style={{ resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </div>
              </div>

              {/* Professional Details */}
              <div className={styles.formSection}>
                <h3 className={styles.formSectionTitle}>
                  Professional Details
                </h3>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Experience</label>
                    <input
                      type="text"
                      name="experience"
                      className={styles.formInput}
                      value={formData.experience}
                      onChange={handleInputChange}
                      placeholder="e.g. 5 years"
                      disabled={submitting}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Rating</label>
                    <select
                      name="rating"
                      className={styles.formSelect}
                      value={formData.rating}
                      onChange={handleInputChange}
                      disabled={submitting}
                    >
                      <option value="5.0">5.0 - Excellent</option>
                      <option value="4.9">4.9</option>
                      <option value="4.8">4.8</option>
                      <option value="4.7">4.7</option>
                      <option value="4.6">4.6</option>
                      <option value="4.5">4.5 - Good</option>
                      <option value="4.0">4.0</option>
                      <option value="3.5">3.5</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Certifications</label>
                  <input
                    type="text"
                    name="certifications"
                    className={styles.formInput}
                    value={formData.certifications}
                    onChange={handleInputChange}
                    placeholder="e.g. NASM-CPT, ACE"
                    maxLength={500}
                    disabled={submitting}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Availability</label>
                  <input
                    type="text"
                    name="availability"
                    className={styles.formInput}
                    value={formData.availability}
                    onChange={handleInputChange}
                    placeholder="e.g. Mon-Fri 9am-5pm"
                    maxLength={500}
                    disabled={submitting}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Current Members</label>
                  <input
                    type="number"
                    name="members"
                    className={styles.formInput}
                    value={formData.members}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="0"
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Photo */}
              <div className={styles.formSection}>
                <h3 className={styles.formSectionTitle}>Profile Photo</h3>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Upload Photo</label>

                  <div className={styles.photoUploadContainer}>
                    {photoPreview ? (
                      <div className={styles.photoPreviewWrapper}>
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className={styles.photoPreview}
                        />
                        <button
                          type="button"
                          className={styles.removePhotoBtn}
                          onClick={removePhoto}
                          disabled={submitting}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div
                        className={styles.photoUploadBox}
                        onClick={triggerFileInput}
                      >
                        <ImageIcon size={40} className={styles.uploadIcon} />
                        <p className={styles.uploadText}>
                          Click to upload photo
                        </p>
                        <p className={styles.uploadHint}>
                          PNG, JPG up to 5MB
                        </p>
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className={styles.hiddenFileInput}
                    />
                  </div>
                </div>
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
                    : editingTrainer
                    ? 'Update Trainer'
                    : 'Send Invitation'}
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
                ⚠️ This will affect {trainerToDelete.members} assigned members
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