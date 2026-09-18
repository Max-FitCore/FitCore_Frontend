import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import axios from 'axios';
import styles from './AdminMember.module.css';

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

const adminMemberService = {
  getAll: async () => {
    const { data } = await api.get('/admin/members');
    return data;
  },
  getById: async (id) => {
    const { data } = await api.get(`/admin/members/${id}`);
    return data;
  },
  create: async (payload) => {
    const { data } = await api.post('/admin/members/add', payload);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await api.put(`/admin/members/${id}`, payload);
    return data;
  },
  remove: async (id) => {
    const { data } = await api.delete(`/admin/members/${id}`);
    return data;
  },
};

/* ============================================================
   BACKEND → UI MAPPER
   ============================================================ */
const formatDate = (d) => {
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

const mapFromBackend = (u) => {
  if (!u) return null;
  return {
    id: u._id,
    name: u.fullName || '',
    email: u.email || '',
    phone: u.phone || '',
    location: u.location || '',
    bio: u.bio || '',
    isActive: u.isActive !== false,
    status: u.isActive === false ? 'Inactive' : 'Active',
    joined: formatDate(u.createdAt),
    joinedRaw: u.createdAt ? u.createdAt.split('T')[0] : '',
    // Member details (from memberDetails subdoc)
    dateOfBirth: u.memberDetails?.dateOfBirth
      ? u.memberDetails.dateOfBirth.split('T')[0]
      : '',
    gender: u.memberDetails?.gender || '',
    address: u.memberDetails?.address || '',
    emergencyContact: {
      name: u.memberDetails?.emergencyContact?.name || '',
      phone: u.memberDetails?.emergencyContact?.phone || '',
      relationship: u.memberDetails?.emergencyContact?.relationship || '',
    },
    medicalConditions: Array.isArray(u.memberDetails?.medicalConditions)
      ? u.memberDetails.medicalConditions.join(', ')
      : '',
    fitnessGoals: Array.isArray(u.memberDetails?.fitnessGoals)
      ? u.memberDetails.fitnessGoals.join(', ')
      : '',
    // Read-only stats from backend
    stats: {
      totalBookedSessions: u.stats?.totalBookedSessions ?? 0,
      totalAssignedPlans: u.stats?.totalAssignedPlans ?? 0,
    },
  };
};

const splitCsv = (value) =>
  String(value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

/* ============================================================
   COMPONENT
   ============================================================ */
const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [memberToDelete, setMemberToDelete] = useState(null);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const [password, setPassword] = useState('');

  const [formData, setFormData] = useState({
    // Base
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    status: 'Active',
    joined: '',
    // Member details
    dateOfBirth: '',
    gender: '',
    address: '',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelationship: '',
    medicalConditions: '',
    fitnessGoals: '',
  });

  /* ============================================================
     FETCH
     ============================================================ */
  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminMemberService.getAll();
      const list = (res.data || []).map(mapFromBackend).filter(Boolean);
      setMembers(list);
    } catch (err) {
      console.error('Fetch members error:', err);
      setError(
        err.response?.data?.message ||
          'Failed to load members. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  /* ============================================================
     FILTER
     ============================================================ */
  const filteredMembers = members.filter((m) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      m.name.toLowerCase().includes(term) ||
      m.email.toLowerCase().includes(term);
    const matchesFilter =
      filter === 'All' || m.status.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      location: '',
      bio: '',
      status: 'Active',
      joined: new Date().toISOString().split('T')[0],
      dateOfBirth: '',
      gender: '',
      address: '',
      emergencyName: '',
      emergencyPhone: '',
      emergencyRelationship: '',
      medicalConditions: '',
      fitnessGoals: '',
    });
    setPassword('');
  };

  const handleAdd = () => {
    setEditingMember(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name || '',
      email: member.email || '',
      phone: member.phone || '',
      location: member.location || '',
      bio: member.bio || '',
      status: member.status || 'Active',
      joined: member.joinedRaw || '',
      dateOfBirth: member.dateOfBirth || '',
      gender: member.gender || '',
      address: member.address || '',
      emergencyName: member.emergencyContact?.name || '',
      emergencyPhone: member.emergencyContact?.phone || '',
      emergencyRelationship: member.emergencyContact?.relationship || '',
      medicalConditions: member.medicalConditions || '',
      fitnessGoals: member.fitnessGoals || '',
    });
    setIsModalOpen(true);
  };

  /* ============================================================
     DELETE
     ============================================================ */
  const handleDeleteClick = (member) => {
    setMemberToDelete(member);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!memberToDelete) return;
    try {
      setDeleting(true);
      await adminMemberService.remove(memberToDelete.id);
      setMembers((prev) => prev.filter((m) => m.id !== memberToDelete.id));
      showToastMessage(`${memberToDelete.name} has been removed`);
      setMemberToDelete(null);
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error('Delete member error:', err);
      showToastMessage(
        err.response?.data?.message || 'Failed to delete member',
        'error'
      );
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setMemberToDelete(null);
    setIsDeleteModalOpen(false);
  };

  /* ============================================================
     SUBMIT
     ============================================================ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    // Shared memberDetails payload
    const emergencyContact = {
      name: formData.emergencyName?.trim() || '',
      phone: formData.emergencyPhone?.trim() || '',
      relationship: formData.emergencyRelationship?.trim() || '',
    };
    const hasEmergency =
      emergencyContact.name ||
      emergencyContact.phone ||
      emergencyContact.relationship;

    const medicalConditionsArr = splitCsv(formData.medicalConditions);
    const fitnessGoalsArr = splitCsv(formData.fitnessGoals);

    try {
      if (editingMember) {
        // ---- UPDATE ----
        const payload = {
          fullName: formData.name?.trim(),
          phone: formData.phone?.trim() || null,
          location: formData.location?.trim() || null,
          bio: formData.bio?.trim() || null,
          isActive: formData.status === 'Active',
        };

        if (formData.dateOfBirth) payload.dateOfBirth = formData.dateOfBirth;
        if (formData.gender) payload.gender = formData.gender;
        if (formData.address !== undefined) {
          payload.address = formData.address?.trim() || '';
        }
        if (hasEmergency) payload.emergencyContact = emergencyContact;
        if (medicalConditionsArr.length > 0) {
          payload.medicalConditions = medicalConditionsArr;
        }
        if (fitnessGoalsArr.length > 0) {
          payload.fitnessGoals = fitnessGoalsArr;
        }

        const res = await adminMemberService.update(editingMember.id, payload);
        const updated = mapFromBackend({
          ...res.data,
          stats: editingMember.stats, // preserve stats (update endpoint doesn't return them)
        });

        setMembers((prev) =>
          prev.map((m) => (m.id === editingMember.id ? updated : m))
        );
        showToastMessage('Member updated successfully');
      } else {
        // ---- CREATE ----
        if (!password || password.length < 6) {
          showToastMessage('Password must be at least 6 characters', 'error');
          return;
        }
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
          showToastMessage(
            'Password must contain 1 uppercase, 1 lowercase, and 1 number',
            'error'
          );
          return;
        }

        const payload = {
          fullName: formData.name?.trim(),
          email: formData.email?.trim(),
          password,
          phone: formData.phone?.trim() || null,
          location: formData.location?.trim() || null,
          bio: formData.bio?.trim() || null,
        };

        if (formData.dateOfBirth) payload.dateOfBirth = formData.dateOfBirth;
        if (formData.gender) payload.gender = formData.gender;
        if (formData.address?.trim()) payload.address = formData.address.trim();
        if (hasEmergency) payload.emergencyContact = emergencyContact;
        if (medicalConditionsArr.length > 0) {
          payload.medicalConditions = medicalConditionsArr;
        }
        if (fitnessGoalsArr.length > 0) {
          payload.fitnessGoals = fitnessGoalsArr;
        }

        const res = await adminMemberService.create(payload);
        const created = mapFromBackend({
          ...res.data,
          stats: { totalBookedSessions: 0, totalAssignedPlans: 0 },
        });

        setMembers((prev) => [created, ...prev]);
        showToastMessage('Member added successfully');
      }

      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      console.error('Submit member error:', err);
      showToastMessage(
        err.response?.data?.message || 'Operation failed. Please try again.',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Active':
        return styles.statusActive;
      case 'Inactive':
        return styles.statusExpired;
      default:
        return styles.statusActive;
    }
  };

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div className={styles.membersPage}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Members</h1>
          <p className={styles.subtitle}>
            {loading
              ? 'Loading…'
              : `${members.length} registered member${
                  members.length !== 1 ? 's' : ''
                }`}
          </p>
        </div>
        <button
          className={styles.addBtn}
          onClick={handleAdd}
          type="button"
        >
          <Plus size={18} />
          Add member
        </button>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search name or email..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.filterTabs}>
          {['All', 'Active', 'Inactive'].map((tab) => (
            <button
              key={tab}
              type="button"
              className={`${styles.filterTab} ${
                filter === tab ? styles.active : ''
              }`}
              onClick={() => setFilter(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className={styles.stateMessage}>
          <Loader2 size={22} className={styles.spin} />
          Loading members…
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className={styles.stateError}>
          {error}
          <button className={styles.retryBtn} onClick={fetchMembers}>
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Member</th>
                <th>Phone</th>
                <th>Location</th>
                <th>Joined</th>
                <th>Sessions</th>
                <th>Plans</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    style={{
                      textAlign: 'center',
                      padding: '2rem',
                      color: '#6b7280',
                    }}
                  >
                    No members found
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <div className={styles.memberCell}>
                        <span className={styles.memberName}>
                          {member.name}
                        </span>
                        <span className={styles.memberEmail}>
                          {member.email}
                        </span>
                      </div>
                    </td>
                    <td>{member.phone || '—'}</td>
                    <td>{member.location || '—'}</td>
                    <td>{member.joined}</td>
                    <td>{member.stats.totalBookedSessions}</td>
                    <td>{member.stats.totalAssignedPlans}</td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${getStatusClass(
                          member.status
                        )}`}
                      >
                        {member.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`${styles.actionBtn} ${styles.editBtn}`}
                        onClick={() => handleEdit(member)}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        onClick={() => handleDeleteClick(member)}
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
                {editingMember ? 'Edit Member' : 'Add New Member'}
              </h2>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              {/* ---------- Account ---------- */}
              <h3 className={styles.formSectionTitle}>Account</h3>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  className={styles.formInput}
                  value={formData.name}
                  onChange={handleInputChange}
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
                  required
                  disabled={!!editingMember || submitting}
                />
                {editingMember && (
                  <span className={styles.formHint}>
                    Email cannot be changed after creation.
                  </span>
                )}
              </div>

              {!editingMember && (
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
                <label className={styles.formLabel}>Bio</label>
                <textarea
                  name="bio"
                  className={styles.formInput}
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={2}
                  maxLength={500}
                  style={{ resize: 'vertical', fontFamily: 'inherit' }}
                  disabled={submitting}
                />
              </div>

              {editingMember && (
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Joined</label>
                    <input
                      type="date"
                      className={styles.formInput}
                      value={formData.joined}
                      disabled
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Status</label>
                    <select
                      name="status"
                      className={styles.formSelect}
                      value={formData.status}
                      onChange={handleInputChange}
                      disabled={submitting}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              )}

              {/* ---------- Personal Details ---------- */}
              <h3 className={styles.formSectionTitle}>Personal Details</h3>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    className={styles.formInput}
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    disabled={submitting}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Gender</label>
                  <select
                    name="gender"
                    className={styles.formSelect}
                    value={formData.gender}
                    onChange={handleInputChange}
                    disabled={submitting}
                  >
                    <option value="">Not set</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Address</label>
                <input
                  type="text"
                  name="address"
                  className={styles.formInput}
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={submitting}
                />
              </div>

              {/* ---------- Emergency Contact ---------- */}
              <h3 className={styles.formSectionTitle}>Emergency Contact</h3>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Name</label>
                <input
                  type="text"
                  name="emergencyName"
                  className={styles.formInput}
                  value={formData.emergencyName}
                  onChange={handleInputChange}
                  disabled={submitting}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Phone</label>
                  <input
                    type="text"
                    name="emergencyPhone"
                    className={styles.formInput}
                    value={formData.emergencyPhone}
                    onChange={handleInputChange}
                    disabled={submitting}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Relationship</label>
                  <input
                    type="text"
                    name="emergencyRelationship"
                    className={styles.formInput}
                    value={formData.emergencyRelationship}
                    onChange={handleInputChange}
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* ---------- Fitness ---------- */}
              <h3 className={styles.formSectionTitle}>Fitness Profile</h3>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Medical Conditions
                </label>
                <input
                  type="text"
                  name="medicalConditions"
                  className={styles.formInput}
                  value={formData.medicalConditions}
                  onChange={handleInputChange}
                  placeholder="Comma-separated (e.g. asthma, hypertension)"
                  disabled={submitting}
                />
                <span className={styles.formHint}>
                  Separate multiple items with commas.
                </span>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Fitness Goals</label>
                <input
                  type="text"
                  name="fitnessGoals"
                  className={styles.formInput}
                  value={formData.fitnessGoals}
                  onChange={handleInputChange}
                  placeholder="Comma-separated (e.g. lose weight, build muscle)"
                  disabled={submitting}
                />
                <span className={styles.formHint}>
                  Separate multiple items with commas.
                </span>
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
                    : editingMember
                    ? 'Update Member'
                    : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============ Delete Modal ============ */}
      {isDeleteModalOpen && memberToDelete && (
        <div className={styles.modalOverlay} onClick={cancelDelete}>
          <div
            className={styles.deleteModalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.deleteModalIcon}>
              <AlertTriangle size={48} />
            </div>

            <h2 className={styles.deleteModalTitle}>Delete Member</h2>

            <p className={styles.deleteModalText}>
              Are you sure you want to remove{' '}
              <strong>{memberToDelete.name}</strong>? This action cannot be
              undone and will permanently delete their data.
            </p>

            <div className={styles.deleteModalInfo}>
              <div className={styles.deleteModalInfoItem}>
                <span className={styles.deleteModalInfoLabel}>Email:</span>
                <span className={styles.deleteModalInfoValue}>
                  {memberToDelete.email}
                </span>
              </div>
              <div className={styles.deleteModalInfoItem}>
                <span className={styles.deleteModalInfoLabel}>
                  Booked sessions:
                </span>
                <span className={styles.deleteModalInfoValue}>
                  {memberToDelete.stats.totalBookedSessions}
                </span>
              </div>
              <div className={styles.deleteModalInfoItem}>
                <span className={styles.deleteModalInfoLabel}>
                  Assigned plans:
                </span>
                <span className={styles.deleteModalInfoValue}>
                  {memberToDelete.stats.totalAssignedPlans}
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
                {deleting ? 'Deleting…' : 'Delete Member'}
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

export default Members;