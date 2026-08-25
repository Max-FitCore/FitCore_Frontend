import React from 'react';
import { X, Pencil, Calendar, Dumbbell, Users, Clock, Target } from 'lucide-react';
import styles from './ViewPlanModal.module.css';

const ViewPlanModal = ({ isOpen, onClose, plan, onEdit }) => {
  if (!isOpen || !plan) return null;

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return styles.difficultyBeginner;
      case 'intermediate': return styles.difficultyIntermediate;
      case 'advanced': return styles.difficultyAdvanced;
      default: return styles.difficultyBeginner;
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerContent}>
            <div className={styles.planIcon}>{plan.image || '💪'}</div>
            <div>
              <h2 className={styles.modalTitle}>{plan.name}</h2>
              <p className={styles.modalSubtitle}>{plan.description}</p>
            </div>
          </div>
          <button className={styles.modalClose} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          {/* Stats */}
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <Target size={18} className={styles.statIcon} />
              <div>
                <span className={styles.statLabel}>Level</span>
                <span className={`${styles.statValue} ${getDifficultyColor(plan.difficulty)}`}>
                  {plan.difficulty}
                </span>
              </div>
            </div>
            <div className={styles.statItem}>
              <Calendar size={18} className={styles.statIcon} />
              <div>
                <span className={styles.statLabel}>Duration</span>
                <span className={styles.statValue}>{plan.duration || '8 weeks'}</span>
              </div>
            </div>
            <div className={styles.statItem}>
              <Clock size={18} className={styles.statIcon} />
              <div>
                <span className={styles.statLabel}>Sessions</span>
                <span className={styles.statValue}>{plan.sessions || 12} total</span>
              </div>
            </div>
            <div className={styles.statItem}>
              <Dumbbell size={18} className={styles.statIcon} />
              <div>
                <span className={styles.statLabel}>Type</span>
                <span className={styles.statValue}>{plan.type || 'Strength'}</span>
              </div>
            </div>
          </div>

          {/* Trainer */}
          {plan.trainer && (
            <div className={styles.trainerSection}>
              <div className={styles.trainerInfo}>
                <Users size={18} className={styles.trainerIcon} />
                <span className={styles.trainerLabel}>Trainer:</span>
                <span className={styles.trainerName}>{plan.trainer}</span>
              </div>
            </div>
          )}

          {/* Days */}
          {plan.days && plan.days.length > 0 && (
            <div className={styles.daysSection}>
              <h4 className={styles.sectionTitle}>Weekly Plan</h4>
              <div className={styles.daysGrid}>
                {plan.days.map((day, index) => (
                  <div key={index} className={styles.dayCard}>
                    <h5 className={styles.dayTitle}>
                      {day.day} — {day.focus}
                    </h5>
                    <ul className={styles.exerciseList}>
                      {day.exercises.map((exercise, exIndex) => (
                        <li key={exIndex} className={styles.exerciseListItem}>
                          {exercise}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button className={styles.btnSecondary} onClick={onClose}>
            Close
          </button>
          <button className={styles.btnPrimary} onClick={onEdit}>
            <Pencil size={16} />
            Edit Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewPlanModal;