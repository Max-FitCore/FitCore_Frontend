import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Dumbbell,
  Users,
  Calendar,
  UserPlus,
  Search,
  X,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import CreatePlanModal from '../CreatePlanModal/CreatePlanModal';
import EditPlanModal from '../EditPlanModal/EditPlanModal';
import DeletePlanModal from '../DeletePlanModal/DeletePlanModal';
import styles from './TrainerWorkouts.module.css';

const API_BASE = 'http://localhost:5000';

const parseResponse = async (res) => {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      return await res.json();
    } catch {
      return { success: false, message: `Invalid JSON (${res.status})` };
    }
  }
  const text = await res.text();
  const clean = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return { success: false, message: clean.slice(0, 200) || `HTTP ${res.status}` };
};

const authHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const TrainerPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [assignPlan, setAssignPlan] = useState(null);

  const [toast, setToast] = useState(null);

  /* ============================================================
     Load my plans
     ============================================================ */
  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/workout-plans/my-plans`, {
        headers: authHeaders(),
      });
      const data = await parseResponse(res);
      if (!res.ok || data.success === false) {
        throw new Error(data.message || 'Failed to load plans');
      }
      setPlans(data.data || []);
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  /* Toast auto-dismiss */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  /* ============================================================
     Modal callbacks
     ============================================================ */
  const handlePlanCreated = (newPlan) => {
    setPlans((prev) => [newPlan, ...prev]);
    setToast({ type: 'success', message: 'Workout plan created' });
  };

  const handlePlanUpdated = (updatedPlan) => {
    setPlans((prev) =>
      prev.map((p) => (p._id === updatedPlan._id ? updatedPlan : p))
    );
    setToast({ type: 'success', message: 'Plan updated' });
  };

  const handlePlanDeleted = (deletedId) => {
    setPlans((prev) => prev.filter((p) => p._id !== deletedId));
    setToast({ type: 'success', message: 'Plan deleted' });
  };

  /* After a successful assign, refresh to get updated counts */
  const handleMembersAssigned = () => {
    fetchPlans();
    setToast({ type: 'success', message: 'Members assigned' });
  };

  /* ============================================================
     Render
     ============================================================ */
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
        <button
          className={styles.createBtn}
          onClick={() => setShowCreate(true)}
          type="button"
        >
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
          <button
            className={styles.createBtn}
            onClick={() => setShowCreate(true)}
            type="button"
          >
            <Plus size={16} /> Create your first plan
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {plans.map((plan) => {
            const assignedCount = (plan.assignedMembers || []).length;
            return (
              <div key={plan._id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.planIcon}>
                    {plan.planIcon || '💪'}
                  </div>
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
                    {assignedCount} member{assignedCount !== 1 ? 's' : ''}
                  </span>
                </div>

                {plan.description && (
                  <p className={styles.planDescription}>{plan.description}</p>
                )}

                <div className={styles.actions}>
                  <button
                    className={`${styles.btn} ${styles.btnAssign}`}
                    onClick={() => setAssignPlan(plan)}
                    type="button"
                  >
                    <UserPlus size={14} /> Assign
                  </button>
                  <button
                    className={`${styles.btn} ${styles.btnSecondary}`}
                    onClick={() => setEditingPlan(plan)}
                    type="button"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    className={`${styles.btn} ${styles.btnDanger}`}
                    onClick={() => setPlanToDelete(plan)}
                    type="button"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============ Modals ============ */}
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

      <AssignMembersModal
        plan={assignPlan}
        onClose={() => setAssignPlan(null)}
        onAssigned={handleMembersAssigned}
      />

      {/* Toast */}
      {toast && (
        <div
          className={styles.toast}
          style={
            toast.type === 'error'
              ? { borderColor: 'rgba(248, 113, 113, 0.5)', color: '#fca5a5' }
              : undefined
          }
        >
          {toast.message}
        </div>
      )}
    </div>
  );
};

/* ============================================================
   Assign Members Modal — separate component in the same file
   ============================================================ */
const AssignMembersModal = ({ plan, onClose, onAssigned }) => {
  const [members, setMembers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState('');

  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSummary, setSubmitSummary] = useState(null);

  /* Fetch public members when modal opens for a plan */
  useEffect(() => {
    if (!plan) return;
    let cancelled = false;

    (async () => {
      try {
        setLoadingMembers(true);
        setLoadError('');
        const res = await fetch(
          `${API_BASE}/api/public/members?limit=200`,
          { headers: { 'Content-Type': 'application/json' } }
        );
        const data = await parseResponse(res);
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to load members');
        }
        if (!cancelled) {
          setMembers(Array.isArray(data.data) ? data.data : []);
          setSelectedIds([]);
          setSearch('');
          setSubmitError('');
          setSubmitSummary(null);
        }
      } catch (err) {
        if (!cancelled) setLoadError(err.message || 'Failed to load members');
      } finally {
        if (!cancelled) setLoadingMembers(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [plan]);

  /* Filter members */
  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.fullName?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.location?.toLowerCase().includes(q)
    );
  }, [members, search]);

  /* Toggle selection */
  const toggleMember = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  /* Select / deselect all in current filter */
  const allFilteredSelected =
    filteredMembers.length > 0 &&
    filteredMembers.every((m) => selectedIds.includes(m._id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      const idsToRemove = new Set(filteredMembers.map((m) => m._id));
      setSelectedIds((prev) => prev.filter((id) => !idsToRemove.has(id)));
    } else {
      const merged = new Set([
        ...selectedIds,
        ...filteredMembers.map((m) => m._id),
      ]);
      setSelectedIds(Array.from(merged));
    }
  };

  /* Submit assignment */
  const handleSubmit = async () => {
    if (!plan || selectedIds.length === 0 || submitting) return;
    try {
      setSubmitting(true);
      setSubmitError('');
      setSubmitSummary(null);

      const res = await fetch(
        `${API_BASE}/api/workout-plans/assign/${plan._id}`,
        {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ memberIds: selectedIds }),
        }
      );
      const data = await parseResponse(res);

      // The backend returns 400 with already-assigned payload when everyone
      // was already assigned. Treat that as informational, not a fatal error.
      if (res.status === 400 && data.alreadyAssigned) {
        setSubmitError(
          'All selected members are already assigned to this plan.'
        );
        return;
      }
      if (!res.ok || !data.success) {
        throw new Error(data.message || `Assignment failed (${res.status})`);
      }

      setSubmitSummary({
        newly: data.data?.summary?.newlyAssigned ?? 0,
        already: data.data?.summary?.alreadyAssigned ?? 0,
        total: data.data?.summary?.totalAssignedNow ?? 0,
      });
      setSelectedIds([]);

      if (typeof onAssigned === 'function') onAssigned();
    } catch (err) {
      setSubmitError(err.message || 'Failed to assign members');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  if (!plan) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div
        className={styles.assignModal}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Assign Members</h2>
            <p className={styles.modalSubtitle}>
              {plan.planIcon || '💪'} {plan.planName} · {plan.planType}
            </p>
          </div>
          <button
            className={styles.modalClose}
            onClick={handleClose}
            disabled={submitting}
            type="button"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Search + Select all bar */}
          <div className={styles.assignToolbar}>
            <div className={styles.searchWrapper}>
              <Search size={16} />
              <input
                type="text"
                placeholder="Search members by name, email, or location…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.searchInput}
                disabled={loadingMembers || submitting}
              />
            </div>
            {!loadingMembers && filteredMembers.length > 0 && (
              <button
                type="button"
                className={styles.selectAllBtn}
                onClick={toggleSelectAll}
                disabled={submitting}
              >
                {allFilteredSelected ? 'Deselect all' : 'Select all'}
              </button>
            )}
          </div>

          {/* Body */}
          {loadingMembers && (
            <div className={styles.stateMessage}>
              <Loader2 size={16} className={styles.spinner} />
              Loading members…
            </div>
          )}

          {!loadingMembers && loadError && (
            <div className={styles.stateError}>{loadError}</div>
          )}

          {!loadingMembers && !loadError && members.length === 0 && (
            <div className={styles.stateMessage}>
              No members available yet.
            </div>
          )}

          {!loadingMembers && !loadError && members.length > 0 && (
            <>
              {filteredMembers.length === 0 ? (
                <div className={styles.stateMessage}>
                  No members match your search.
                </div>
              ) : (
                <div className={styles.memberList}>
                  {filteredMembers.map((member) => {
                    const selected = selectedIds.includes(member._id);
                    return (
                      <button
                        key={member._id}
                        type="button"
                        className={`${styles.memberRow} ${
                          selected ? styles.memberRowSelected : ''
                        }`}
                        onClick={() => toggleMember(member._id)}
                        disabled={submitting}
                      >
                        <div className={styles.checkbox}>
                          {selected && <Check size={12} />}
                        </div>
                        <div className={styles.memberAvatar}>
                          {(member.fullName || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className={styles.memberInfo}>
                          <span className={styles.memberName}>
                            {member.fullName || 'Unnamed'}
                          </span>
                          <span className={styles.memberEmail}>
                            {member.email || '—'}
                          </span>
                        </div>
                        {member.location && (
                          <span className={styles.memberLocation}>
                            {member.location}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Feedback block */}
          {submitError && (
            <div className={styles.assignInfo}>{submitError}</div>
          )}

          {submitSummary && (
            <div className={styles.assignSuccess}>
              <div className={styles.assignSuccessLine}>
                ✓ {submitSummary.newly} member
                {submitSummary.newly !== 1 ? 's' : ''} newly assigned
              </div>
              {submitSummary.already > 0 && (
                <div className={styles.assignSuccessSub}>
                  {submitSummary.already} were already assigned
                </div>
              )}
              <div className={styles.assignSuccessSub}>
                Plan now has {submitSummary.total} assigned member
                {submitSummary.total !== 1 ? 's' : ''} total.
              </div>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={handleClose}
            disabled={submitting}
          >
            {submitSummary ? 'Close' : 'Cancel'}
          </button>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={handleSubmit}
            disabled={submitting || selectedIds.length === 0 || loadingMembers}
          >
            {submitting ? (
              <>
                <Loader2 size={14} className={styles.spinner} /> Assigning…
              </>
            ) : (
              <>
                <UserPlus size={14} />
                Assign {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainerPlans;