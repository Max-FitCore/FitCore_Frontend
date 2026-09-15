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

// Attach auth token on every request
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
const mapFromBackend = (u) => {
  if (!u) return null;
  return {
    id: u._id,
    name: u.fullName || '',
    email: u.email || '',
    phone: u.phone || '',
    location: u.location || '',
    bio: u.bio || '',
    // UI-only fields (not persisted to backend):
    plan: 'Basic',
    trainer: '—',
    joined: u.createdAt
      ? new Date(u.createdAt).toISOString().split('T')[0]
      : '',
    lastVisit: '—',
    // Map isActive → status string
    status: u.isActive === false ? 'Expired' : 'Active',
  };
};

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
    name: '',
    email: '',
    phone: '',
    location: '',
    plan: 'Basic',
    trainer: '',
    joined: '',
    lastVisit: '',
    status: 'Active',
  });

  // ============ FETCH ============
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

  // ============ FILTER ============
  const filteredMembers = members.filter((m) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      m.name.toLowerCase().includes(term) ||
      m.email.toLowerCase().includes(term);
    const matchesFilter =
      filter === 'All' || m.status.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

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
      email: '',
      phone: '',
      location: '',
      plan: 'Basic',
      trainer: '',
      joined: new Date().toISOString().split('T')[0],
      lastVisit: '',
      status: 'Active',
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
      plan: member.plan || 'Basic',
      trainer: member.trainer || '',
      joined: member.joined || '',
      lastVisit: member.lastVisit || '',
      status: member.status || 'Active',
    });
    setIsModalOpen(true);
  };

  // ============ DELETE ============
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

  // ============ SUBMIT ============
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingMember) {
        // ---- UPDATE ----
        const payload = {
          fullName: formData.name?.trim(),
          phone: formData.phone?.trim() || null,
          location: formData.location?.trim() || null,
          isActive: formData.status === 'Active',
        };

        const res = await adminMemberService.update(editingMember.id, payload);

        const updated = {
          ...mapFromBackend(res.data),
          plan: formData.plan,
          trainer: formData.trainer,
          lastVisit: formData.lastVisit,
        };

        setMembers((prev) =>
          prev.map((m) => (m.id === editingMember.id ? updated : m))
        );
        showToastMessage('Member updated successfully');
      } else {
        // ---- CREATE ----
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
        };

        const res = await adminMemberService.create(payload);

        const created = {
          ...mapFromBackend(res.data),
          plan: formData.plan,
          trainer: formData.trainer,
          lastVisit: formData.lastVisit,
        };

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
      case 'Expiring':
        return styles.statusExpiring;
      case 'Expired':
        return styles.statusExpired;
      default:
        return styles.statusActive;
    }
  };

  // ============ RENDER ============
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
        <button className={styles.addBtn} onClick={handleAdd}>
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
          {['All', 'Active', 'Expiring', 'Expired'].map((tab) => (
            <button
              key={tab}
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
          Loading members…
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
            onClick={fetchMembers}
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

      {/* Table */}
      {!loading && !error && (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Member</th>
                <th>Plan</th>
                <th>Trainer</th>
                <th>Joined</th>
                <th>Last visit</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
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
                    <td>{member.plan}</td>
                    <td>{member.trainer}</td>
                    <td>{member.joined}</td>
                    <td>{member.lastVisit}</td>
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
                        className={`${styles.actionBtn} ${styles.editBtn}`}
                        onClick={() => handleEdit(member)}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
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
                className={styles.closeBtn}
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Full Name</label>
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
                <label className={styles.formLabel}>Email</label>
                <input
                  type="email"
                  name="email"
                  className={styles.formInput}
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={!!editingMember || submitting}
                />
              </div>

              {!editingMember && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Password</label>
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

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Plan</label>
                  <select
                    name="plan"
                    className={styles.formSelect}
                    value={formData.plan}
                    onChange={handleInputChange}
                    disabled={submitting}
                  >
                    <option value="Basic">Basic</option>
                    <option value="Premium">Premium</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Trainer</label>
                  <input
                    type="text"
                    name="trainer"
                    className={styles.formInput}
                    value={formData.trainer}
                    onChange={handleInputChange}
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Joined Date</label>
                  <input
                    type="date"
                    name="joined"
                    className={styles.formInput}
                    value={formData.joined}
                    onChange={handleInputChange}
                    disabled
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Last Visit</label>
                  <input
                    type="date"
                    name="lastVisit"
                    className={styles.formInput}
                    value={formData.lastVisit}
                    onChange={handleInputChange}
                    disabled={submitting}
                  />
                </div>
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
                  <option value="Expiring">Expiring</option>
                  <option value="Expired">Expired</option>
                </select>
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
                <span className={styles.deleteModalInfoLabel}>Plan:</span>
                <span className={styles.deleteModalInfoValue}>
                  {memberToDelete.plan}
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