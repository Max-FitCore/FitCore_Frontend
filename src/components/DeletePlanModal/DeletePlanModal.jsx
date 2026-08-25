import React from 'react';
import { X, AlertTriangle, Trash2, Dumbbell } from 'lucide-react';
import styles from './DeletePlanModal.module.css';

const DeletePlanModal = ({ isOpen, onClose, plan, onConfirmDelete }) => {
  if (!isOpen || !plan) return null;

  const handleConfirm = () => {
    onConfirmDelete();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerIcon}>
            <AlertTriangle size={24} />
          </div>
          <button className={styles.modalClose} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          <h2 className={styles.modalTitle}>Delete Workout Plan?</h2>
          <p className={styles.modalSubtitle}>
            Are you sure you want to delete <strong>"{plan.name}"</strong>?
          </p>
          
          <div className={styles.planPreview}>
            <div className={styles.planPreviewIcon}>
              {plan.image || '💪'}
            </div>
            <div className={styles.planPreviewInfo}>
              <span className={styles.planPreviewName}>{plan.name}</span>
              <span className={styles.planPreviewMeta}>
                {plan.type || 'Strength'} · {plan.difficulty || 'Intermediate'} · 
                {plan.days ? ` ${plan.days.length} days` : ' 0 days'}
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
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button className={styles.btnSecondary} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.btnDanger} onClick={handleConfirm}>
            <Trash2 size={16} />
            Delete Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletePlanModal;