import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Check, X, AlertTriangle } from 'lucide-react';
import styles from './AdminMember.module.css';

const Members = () => {
  // Initial members data
  const initialMembers = [
    { id: 1, name: 'Sara Nabil', email: 'sara.nabil@mail.com', plan: 'Premium', trainer: 'Marcus Vale', joined: '2025-04-12', lastVisit: '2026-08-17', status: 'Active' },
    { id: 2, name: 'Omar Haddad', email: 'omar.haddad@mail.com', plan: 'VIP', trainer: 'Marcus Vale', joined: '2025-11-02', lastVisit: '2026-08-18', status: 'Active' },
    { id: 3, name: 'Lina Farouk', email: 'lina.farouk@mail.com', plan: 'Basic', trainer: 'Dario Khan', joined: '2026-02-20', lastVisit: '2026-08-15', status: 'Expiring' },
    { id: 4, name: 'Youssef Adel', email: 'y.adel@mail.com', plan: 'Premium', trainer: 'Elena Rossi', joined: '2025-08-08', lastVisit: '2026-08-16', status: 'Active' },
    { id: 5, name: 'Nour Salem', email: 'nour.salem@mail.com', plan: 'Basic', trainer: 'Elena Rossi', joined: '2024-12-01', lastVisit: '2026-06-29', status: 'Expired' },
    { id: 6, name: 'Karim Zaki', email: 'karim.zaki@mail.com', plan: 'VIP', trainer: 'Dario Khan', joined: '2026-01-15', lastVisit: '2026-08-18', status: 'Active' },
  ];

  const [members, setMembers] = useState(initialMembers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    plan: 'Basic',
    trainer: '',
    joined: '',
    lastVisit: '',
    status: 'Active',
  });

  // Filter and search members
  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filter === 'All' || member.status.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Open modal for adding
  const handleAdd = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      email: '',
      plan: 'Basic',
      trainer: '',
      joined: new Date().toISOString().split('T')[0],
      lastVisit: '',
      status: 'Active',
    });
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({ ...member });
    setIsModalOpen(true);
  };

  // Open delete confirmation modal
  const handleDeleteClick = (member) => {
    setMemberToDelete(member);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (memberToDelete) {
      setMembers((prev) => prev.filter((m) => m.id !== memberToDelete.id));
      showToastMessage(`${memberToDelete.name} has been removed`);
      setMemberToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setMemberToDelete(null);
    setIsDeleteModalOpen(false);
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingMember) {
      // Update existing member
      setMembers((prev) =>
        prev.map((m) => (m.id === editingMember.id ? { ...formData, id: m.id } : m))
      );
      showToastMessage('Member updated successfully');
    } else {
      // Add new member
      const newMember = {
        ...formData,
        id: Math.max(...members.map((m) => m.id)) + 1,
      };
      setMembers((prev) => [...prev, newMember]);
      showToastMessage('Member added successfully');
    }
    setIsModalOpen(false);
  };

  // Show toast notification
  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Get status badge class
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

  return (
    <div className={styles.membersPage}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Members</h1>
          <p className={styles.subtitle}>{members.length} registered members</p>
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
              className={`${styles.filterTab} ${filter === tab ? styles.active : ''}`}
              onClick={() => setFilter(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
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
            {filteredMembers.map((member) => (
              <tr key={member.id}>
                <td>
                  <div className={styles.memberCell}>
                    <span className={styles.memberName}>{member.name}</span>
                    <span className={styles.memberEmail}>{member.email}</span>
                  </div>
                </td>
                <td>{member.plan}</td>
                <td>{member.trainer}</td>
                <td>{member.joined}</td>
                <td>{member.lastVisit}</td>
                <td>
                  <span className={`${styles.statusBadge} ${getStatusClass(member.status)}`}>
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Member Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingMember ? 'Edit Member' : 'Add New Member'}
              </h2>
              <button 
                className={styles.closeBtn} 
                onClick={() => setIsModalOpen(false)}
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
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Plan</label>
                  <select
                    name="plan"
                    className={styles.formSelect}
                    value={formData.plan}
                    onChange={handleInputChange}
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
                    required
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
                    required
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
                    required
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
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn}>
                  {editingMember ? 'Update Member' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && memberToDelete && (
        <div className={styles.modalOverlay} onClick={cancelDelete}>
          <div className={styles.deleteModalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.deleteModalIcon}>
              <AlertTriangle size={48} />
            </div>
            
            <h2 className={styles.deleteModalTitle}>Delete Member</h2>
            
            <p className={styles.deleteModalText}>
              Are you sure you want to remove <strong>{memberToDelete.name}</strong>? 
              This action cannot be undone and will permanently delete their data.
            </p>

            <div className={styles.deleteModalInfo}>
              <div className={styles.deleteModalInfoItem}>
                <span className={styles.deleteModalInfoLabel}>Email:</span>
                <span className={styles.deleteModalInfoValue}>{memberToDelete.email}</span>
              </div>
              <div className={styles.deleteModalInfoItem}>
                <span className={styles.deleteModalInfoLabel}>Plan:</span>
                <span className={styles.deleteModalInfoValue}>{memberToDelete.plan}</span>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.deleteConfirmBtn}
                onClick={confirmDelete}
              >
                <Trash2 size={16} style={{ marginRight: '6px' }} />
                Delete Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className={styles.toast}>
          <div className={styles.toastIcon}>
            <Check size={16} />
          </div>
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default Members;