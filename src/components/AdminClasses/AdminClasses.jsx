import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, AlertTriangle } from 'lucide-react';
import styles from './AdminClasses.module.css';

const Classes = () => {
  // Initial classes data
  const initialClasses = [
    { id: 1, name: 'Barbell Strength', trainer: 'Marcus Vale', day: 'Mon', time: '07:00', duration: '60 min', booked: '12/16', level: 'Intermediate' },
    { id: 2, name: 'HIIT Burn', trainer: 'Dario Khan', day: 'Mon', time: '18:30', duration: '45 min', booked: '20/20', level: 'Advanced' },
    { id: 3, name: 'Mobility Flow', trainer: 'Elena Rossi', day: 'Tue', time: '09:00', duration: '50 min', booked: '7/18', level: 'Beginner' },
    { id: 4, name: 'Olympic Lifting', trainer: 'Marcus Vale', day: 'Wed', time: '19:00', duration: '75 min', booked: '8/10', level: 'Advanced' },
    { id: 5, name: 'Core & Stability', trainer: 'Elena Rossi', day: 'Thu', time: '17:00', duration: '40 min', booked: '9/16', level: 'Beginner' },
    { id: 6, name: 'Metcon Circuit', trainer: 'Dario Khan', day: 'Fri', time: '06:30', duration: '55 min', booked: '13/22', level: 'Intermediate' },
  ];

  const [classes, setClasses] = useState(initialClasses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [classToDelete, setClassToDelete] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    trainer: '',
    day: 'Mon',
    time: '',
    duration: '',
    booked: '',
    level: 'Intermediate',
  });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Open modal for adding
  const handleAdd = () => {
    setEditingClass(null);
    setFormData({
      name: '',
      trainer: '',
      day: 'Mon',
      time: '',
      duration: '',
      booked: '',
      level: 'Intermediate',
    });
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleEdit = (classItem) => {
    setEditingClass(classItem);
    setFormData({ ...classItem });
    setIsModalOpen(true);
  };

  // Open delete confirmation modal
  const handleDeleteClick = (classItem) => {
    setClassToDelete(classItem);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (classToDelete) {
      setClasses((prev) => prev.filter((c) => c.id !== classToDelete.id));
      showToastMessage(`${classToDelete.name} has been removed`);
      setClassToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setClassToDelete(null);
    setIsDeleteModalOpen(false);
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingClass) {
      // Update existing class
      setClasses((prev) =>
        prev.map((c) => (c.id === editingClass.id ? { ...formData, id: c.id } : c))
      );
      showToastMessage(`${formData.name} has been updated successfully`);
    } else {
      // Add new class
      const newClass = {
        ...formData,
        id: Math.max(...classes.map((c) => c.id)) + 1,
      };
      setClasses((prev) => [...prev, newClass]);
      showToastMessage(`${newClass.name} has been added successfully`);
    }
    setIsModalOpen(false);
  };

  // Show toast notification
  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Get level badge class
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

  return (
    <div className={styles.classesPage}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Classes</h1>
          <p className={styles.subtitle}>Weekly timetable and capacity.</p>
        </div>
        <button className={styles.addBtn} onClick={handleAdd}>
          <Plus size={18} />
          New class
        </button>
      </div>

      {/* Table */}
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
            {classes.map((classItem) => (
              <tr key={classItem.id}>
                <td>
                  <span className={styles.className}>{classItem.name}</span>
                </td>
                <td>{classItem.trainer}</td>
                <td>{classItem.day}</td>
                <td>{classItem.time}</td>
                <td>{classItem.duration}</td>
                <td>{classItem.booked}</td>
                <td>
                  <span className={`${styles.levelBadge} ${getLevelClass(classItem.level)}`}>
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Class Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingClass ? 'Edit Class' : 'Add New Class'}
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
                <label className={styles.formLabel}>Class Name *</label>
                <input
                  type="text"
                  name="name"
                  className={styles.formInput}
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Barbell Strength"
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Trainer *</label>
                  <input
                    type="text"
                    name="trainer"
                    className={styles.formInput}
                    value={formData.trainer}
                    onChange={handleInputChange}
                    placeholder="e.g. Marcus Vale"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Level *</label>
                  <select
                    name="level"
                    className={styles.formSelect}
                    value={formData.level}
                    onChange={handleInputChange}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
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
                  >
                    <option value="Mon">Monday</option>
                    <option value="Tue">Tuesday</option>
                    <option value="Wed">Wednesday</option>
                    <option value="Thu">Thursday</option>
                    <option value="Fri">Friday</option>
                    <option value="Sat">Saturday</option>
                    <option value="Sun">Sunday</option>
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
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Duration *</label>
                  <input
                    type="text"
                    name="duration"
                    className={styles.formInput}
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="e.g. 60 min"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Booked *</label>
                  <input
                    type="text"
                    name="booked"
                    className={styles.formInput}
                    value={formData.booked}
                    onChange={handleInputChange}
                    placeholder="e.g. 12/16"
                    required
                  />
                </div>
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
                  {editingClass ? 'Update Class' : 'Add Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && classToDelete && (
        <div className={styles.modalOverlay} onClick={cancelDelete}>
          <div className={styles.deleteModalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.deleteModalIcon}>
              <AlertTriangle size={48} />
            </div>
            
            <h2 className={styles.deleteModalTitle}>Delete Class</h2>
            
            <p className={styles.deleteModalText}>
              Are you sure you want to remove <strong>{classToDelete.name}</strong>? 
              This action cannot be undone.
            </p>

            <div className={styles.deleteModalInfo}>
              <div className={styles.deleteModalInfoItem}>
                <span className={styles.deleteModalInfoLabel}>Trainer:</span>
                <span className={styles.deleteModalInfoValue}>{classToDelete.trainer}</span>
              </div>
              <div className={styles.deleteModalInfoItem}>
                <span className={styles.deleteModalInfoLabel}>Schedule:</span>
                <span className={styles.deleteModalInfoValue}>{classToDelete.day} · {classToDelete.time}</span>
              </div>
              <div className={styles.deleteModalInfoItem}>
                <span className={styles.deleteModalInfoLabel}>Booked:</span>
                <span className={styles.deleteModalInfoValue}>{classToDelete.booked}</span>
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
                Delete Class
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

export default Classes;