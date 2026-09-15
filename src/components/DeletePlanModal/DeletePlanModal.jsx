import React, { useState } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import styles from './DeletePlanModal.module.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const DeletePlanModal = ({ isOpen, onClose, plan, onDeleted }) => {
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  if (!isOpen || !plan) return null;

  const handleConfirm = async () => {
    setServerError('');
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/workout-plans/${plan._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        throw new Error(data.message || 'Failed to delete plan');
      }
      if (onDeleted) onDeleted(plan._id);
      onClose();
    } catch (err) {
      setServerError(err.message || 'Failed to delete plan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    setServerError('');
    onClose();
  };

  const planName = plan.planName || plan.name || 'this plan';
  const planType = plan.planType || plan.type || 'Strength';
  const planLevel = plan.planLevel || plan.level || plan.difficulty || 'Intermediate';
  const planIcon = plan.planIcon || plan.image || '💪';
  const daysCount = (plan.workoutDays || plan.days || []).length;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.headerIcon}>
            <AlertTriangle size={24} />
          </div>
          <button className={styles.modalClose} onClick={handleClose} disabled={submitting}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <h2 className={styles.modalTitle}>Delete Workout Plan?</h2>
          <p className={styles.modalSubtitle}>
            Are you sure you want to delete <strong>"{planName}"</strong>?
          </p>

          <div className={styles.planPreview}>
            <div className={styles.planPreviewIcon}>{planIcon}</div>
            <div className={styles.planPreviewInfo}>
              <span className={styles.planPreviewName}>{planName}</span>
              <span className={styles.planPreviewMeta}>
                {planType} · {planLevel} · {daysCount} day{daysCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className={styles.warningBox}>
            <AlertTriangle size={18} className={styles.warningIcon} />
            <div>
              <p className={styles.warningTitle}>This action cannot be undone</p>
              <p className={styles.warningText}>
                Deleting this workout plan will permanently remove all associated
                exercises, schedules, and progress data.
              </p>
            </div>
          </div>

          {serverError && (
            <div className={styles.errorMessage || ''} style={{ color: '#f87171', marginTop: '0.75rem', fontSize: '0.813rem' }}>
              {serverError}
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnSecondary} onClick={handleClose} disabled={submitting}>
            Cancel
          </button>
          <button className={styles.btnDanger} onClick={handleConfirm} disabled={submitting}>
            <Trash2 size={16} />
            {submitting ? 'Deleting…' : 'Delete Plan'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletePlanModal;