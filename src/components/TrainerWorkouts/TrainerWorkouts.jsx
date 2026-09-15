import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Dumbbell, Users, Calendar } from 'lucide-react';
import CreatePlanModal from '../CreatePlanModal/CreatePlanModal';
import EditPlanModal from '../EditPlanModal/EditPlanModal';
import DeletePlanModal from '../DeletePlanModal/DeletePlanModal';
import styles from './TrainerWorkouts.module.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const TrainerPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [toast, setToast] = useState(null);

  /* ---------- Load plans (only fetch this component owns) ---------- */
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/workout-plans/my-plans`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.success === false) {
          throw new Error(data.message || 'Failed to load plans');
        }
        setPlans(data.data || []);
      } catch (err) {
        setToast({ type: 'error', message: err.message });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* Auto-dismiss toast */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  /* ---------- Modal callbacks — no network calls here ---------- */

  // CreatePlanModal calls this AFTER it successfully POSTs
  const handlePlanCreated = (newPlan) => {
    setPlans((prev) => [newPlan, ...prev]);
    setToast({ type: 'success', message: 'Workout plan created' });
  };

  // EditPlanModal calls this AFTER it successfully PUTs
  const handlePlanUpdated = (updatedPlan) => {
    setPlans((prev) =>
      prev.map((p) => (p._id === updatedPlan._id ? updatedPlan : p))
    );
    setToast({ type: 'success', message: 'Plan updated' });
  };

  // DeletePlanModal calls this AFTER it successfully DELETEs
  const handlePlanDeleted = (deletedId) => {
    setPlans((prev) => prev.filter((p) => p._id !== deletedId));
    setToast({ type: 'success', message: 'Plan deleted' });
  };

  /* ---------- Render ---------- */
  if (loading) {
    return (
      <div className={styles.plansPage}>
        <div className={styles.header}>
          <h1 className={styles.title}>Workout Plans</h1>
          <p className={styles.subtitle}>Loading your plans…</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.plansPage}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Workout Plans</h1>
          <p className={styles.subtitle}>
            {plans.length} plan{plans.length !== 1 ? 's' : ''} created
          </p>
        </div>
        <button className={styles.createBtn} onClick={() => setShowCreate(true)}>
          <Plus size={16} /> New plan
        </button>
      </div>

      {plans.length === 0 ? (
        <div className={styles.empty}>
          <Dumbbell size={40} className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>No workout plans yet</p>
          <p className={styles.emptyText}>
            Create your first plan to start assigning workouts to members.
          </p>
          <button className={styles.createBtn} onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Create your first plan
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {plans.map((plan) => (
            <div key={plan._id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.planIcon}>{plan.planIcon || '💪'}</div>
                <div className={styles.planHeaderText}>
                  <p className={styles.planName}>{plan.planName}</p>
                  <p className={styles.planMeta}>
                    {plan.planType} · {plan.planLevel}
                  </p>
                </div>
              </div>

              <div className={styles.statsRow}>
                <span className={styles.stat}>
                  <Calendar size={14} />
                  {(plan.workoutDays || []).length} day
                  {(plan.workoutDays || []).length !== 1 ? 's' : ''}
                </span>
                <span className={styles.stat}>
                  <Dumbbell size={14} />
                  {plan.totalSessions} sessions
                </span>
                <span className={styles.stat}>
                  <Users size={14} />
                  {(plan.assignedMembers || []).length} members
                </span>
              </div>

              {plan.description && (
                <p className={styles.planDescription}>{plan.description}</p>
              )}

              <div className={styles.actions}>
                <button
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  onClick={() => setEditingPlan(plan)}
                >
                  <Pencil size={14} /> Edit
                </button>
                <button
                  className={`${styles.btn} ${styles.btnDanger}`}
                  onClick={() => setPlanToDelete(plan)}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals — prop names match what each component expects */}
      <CreatePlanModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onPlanCreated={handlePlanCreated}
      />

      <EditPlanModal
        isOpen={!!editingPlan}
        onClose={() => setEditingPlan(null)}
        plan={editingPlan}
        onUpdated={handlePlanUpdated}
      />

      <DeletePlanModal
        isOpen={!!planToDelete}
        onClose={() => setPlanToDelete(null)}
        plan={planToDelete}
        onDeleted={handlePlanDeleted}
      />

      {toast && (
        <div
          className={styles.toast}
          style={
            toast.type === 'error'
              ? { borderColor: 'rgba(248, 113, 113, 0.5)' }
              : undefined
          }
        >
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default TrainerPlans;