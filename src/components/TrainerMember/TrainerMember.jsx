import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Users,
  ClipboardList,
  AlertTriangle,
  Trash2,
  X,
  Loader2,
} from 'lucide-react';
import styles from './TrainerMember.module.css';

const API_BASE = 'http://localhost:5000/api';

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

const initialsOf = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const Members = () => {
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [members, setMembers] = useState([]);
  const [planName, setPlanName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [error, setError] = useState('');

  // Unassign flow
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState('');

  // Toast
  const [toast, setToast] = useState(null);

  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const showToastMessage = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ============================================================
     1. Load the trainer's own plans
     ============================================================ */
  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoadingPlans(true);
        setError('');
        const res = await fetch(`${API_BASE}/workout-plans/my-plans`, {
          headers: authHeaders(),
        });
        const data = await parseResponse(res);
        if (!res.ok || !data.success) {
          throw new Error(data.message || `Failed to load plans (${res.status})`);
        }
        const list = Array.isArray(data.data) ? data.data : [];
        setPlans(list);
        if (list.length > 0) setSelectedPlanId(list[0]._id);
      } catch (err) {
        setError(err.message || 'Failed to load plans');
      } finally {
        setLoadingPlans(false);
      }
    };
    loadPlans();
  }, []);

  /* ============================================================
     2. Load assigned members whenever a plan is selected
     ============================================================ */
  useEffect(() => {
    if (!selectedPlanId) {
      setMembers([]);
      setPlanName('');
      return;
    }

    const loadMembers = async () => {
      try {
        setLoadingMembers(true);
        setError('');
        const res = await fetch(
          `${API_BASE}/workout-plans/${selectedPlanId}/members`,
          { headers: authHeaders() }
        );
        const data = await parseResponse(res);
        if (!res.ok || !data.success) {
          throw new Error(data.message || `Failed to load members (${res.status})`);
        }
        setMembers(Array.isArray(data.data.members) ? data.data.members : []);
        setPlanName(data.data.planName || '');
      } catch (err) {
        setError(err.message || 'Failed to load members');
        setMembers([]);
      } finally {
        setLoadingMembers(false);
      }
    };

    loadMembers();
  }, [selectedPlanId]);

  /* ============================================================
     Unassign flow
     ============================================================ */
  const handleRemoveClick = (member) => {
    setRemoveError('');
    setMemberToRemove(member);
  };

  const cancelRemove = () => {
    if (removing) return;
    setMemberToRemove(null);
    setRemoveError('');
  };

  const confirmRemove = async () => {
    if (!memberToRemove || !selectedPlanId || removing) return;

    try {
      setRemoving(true);
      setRemoveError('');

      const res = await fetch(
        `${API_BASE}/workout-plans/unassign/${memberToRemove._id}/${selectedPlanId}`,
        { method: 'DELETE', headers: authHeaders() }
      );
      const data = await parseResponse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.message || `Unassign failed (${res.status})`);
      }

      // Remove from local list
      setMembers((prev) => prev.filter((m) => m._id !== memberToRemove._id));

      // Update the corresponding plan's assignedMembers in the plans array
      setPlans((prev) =>
        prev.map((p) =>
          p._id === selectedPlanId
            ? {
                ...p,
                assignedMembers: (p.assignedMembers || []).filter(
                  (id) => String(id) !== String(memberToRemove._id)
                ),
              }
            : p
        )
      );

      showToastMessage(
        `${memberToRemove.fullName || 'Member'} removed from ${planName || 'plan'}`
      );
      setMemberToRemove(null);
    } catch (err) {
      setRemoveError(err.message || 'Failed to unassign member');
    } finally {
      setRemoving(false);
    }
  };

  /* ============================================================
     Filtering
     ============================================================ */
  const filteredMembers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.fullName?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.location?.toLowerCase().includes(q)
    );
  }, [members, searchTerm]);

  const selectedPlan = plans.find((p) => p._id === selectedPlanId);

  /* ============================================================
     Loading / error / empty states
     ============================================================ */
  if (loadingPlans) {
    return (
      <div className={styles.membersPage}>
        <div className={styles.stateMessage}>Loading your plans…</div>
      </div>
    );
  }

  if (error && plans.length === 0) {
    return (
      <div className={styles.membersPage}>
        <div className={`${styles.stateMessage} ${styles.stateError}`}>
          {error}
        </div>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className={styles.membersPage}>
        <div className={styles.header}>
          <h1 className={styles.title}>My members</h1>
          <p className={styles.subtitle}>
            Assigned clients and their training progress.
          </p>
        </div>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <ClipboardList size={28} />
          </div>
          <h2 className={styles.emptyTitle}>No workout plans yet</h2>
          <p className={styles.emptyText}>
            Create a workout plan first — then you can see the members assigned
            to it here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.membersPage}>
      {/* Toast */}
      {toast && (
        <div
          className={styles.toast}
          style={
            toast.type === 'error'
              ? { borderColor: 'rgba(248,113,113,0.5)', color: '#fca5a5' }
              : undefined
          }
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>My members</h1>
        <p className={styles.subtitle}>
          Assigned clients and their training progress.
        </p>
      </div>

      {/* Plan selector pills */}
      <div className={styles.planBar}>
        <div className={styles.planPills}>
          {plans.map((plan) => (
            <button
              key={plan._id}
              type="button"
              className={`${styles.planPill} ${
                plan._id === selectedPlanId ? styles.planPillActive : ''
              }`}
              onClick={() => setSelectedPlanId(plan._id)}
            >
              <span className={styles.planPillIcon}>
                {plan.planIcon || '💪'}
              </span>
              <span className={styles.planPillName}>{plan.planName}</span>
              <span className={styles.planPillLevel}>{plan.planLevel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchContainer}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search members…"
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {selectedPlan && (
          <div className={styles.planMeta}>
            <span className={styles.planMetaLabel}>Plan:</span>
            <span className={styles.planMetaValue}>{planName}</span>
            <span className={styles.planMetaDivider} />
            <span className={styles.planMetaCount}>
              <Users size={12} />
              {members.length} {members.length === 1 ? 'member' : 'members'}
            </span>
          </div>
        )}
      </div>

      {/* Loading / error for member fetch */}
      {loadingMembers && (
        <div className={styles.stateMessage}>Loading members…</div>
      )}

      {!loadingMembers && error && (
        <div className={`${styles.stateMessage} ${styles.stateError}`}>
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loadingMembers && !error && filteredMembers.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Users size={26} />
          </div>
          <h2 className={styles.emptyTitle}>
            {members.length === 0
              ? 'No members assigned to this plan'
              : 'No matches'}
          </h2>
          <p className={styles.emptyText}>
            {members.length === 0
              ? 'Assign this plan to a member from the Workout Plans page to see them here.'
              : 'Try a different search term.'}
          </p>
        </div>
      )}

      {/* Members Grid */}
      {!loadingMembers && !error && filteredMembers.length > 0 && (
        <div className={styles.grid}>
          {filteredMembers.map((member) => (
            <div key={member._id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.memberInfo}>
                  <div className={styles.avatar}>
                    {initialsOf(member.fullName)}
                  </div>
                  <div className={styles.nameGroup}>
                    <p className={styles.memberName}>{member.fullName}</p>
                    <p className={styles.memberGoal}>{member.email}</p>
                  </div>
                </div>
                <span
                  className={`${styles.statusBadge} ${
                    member.isActive === false
                      ? styles.statusExpired
                      : styles.statusActive
                  }`}
                >
                  {member.isActive === false ? 'Inactive' : 'Active'}
                </span>
              </div>

              <div className={styles.metaBlock}>
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>Location</span>
                  <span className={styles.metaValue}>
                    {member.location || '—'}
                  </span>
                </div>
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>Phone</span>
                  <span className={styles.metaValue}>
                    {member.phone || '—'}
                  </span>
                </div>
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>Plan</span>
                  <span className={styles.metaValue}>
                    {selectedPlan?.planName || '—'}
                  </span>
                </div>
              </div>

              <div className={styles.actions}>
                <button
                  className={`${styles.btn} ${styles.btnDanger}`}
                  onClick={() => handleRemoveClick(member)}
                  type="button"
                >
                  <Trash2 size={14} />
                  Remove from plan
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================
          Confirm Remove Modal
          ============================================================ */}
      {memberToRemove && (
        <div className={styles.modalOverlay} onClick={cancelRemove}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>Remove from plan</h2>
                <p className={styles.modalSubtitle}>
                  {memberToRemove.fullName || 'Member'}
                </p>
              </div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={cancelRemove}
                disabled={removing}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.removeInfo}>
                <div className={styles.removeIconWrap}>
                  <AlertTriangle size={32} />
                </div>
                <p className={styles.removeText}>
                  Are you sure you want to unassign{' '}
                  <strong>{memberToRemove.fullName || 'this member'}</strong>{' '}
                  from <strong>{planName || 'this plan'}</strong>? They will no
                  longer see this plan in their workouts.
                </p>

                {removeError && (
                  <div className={styles.removeError}>{removeError}</div>
                )}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={cancelRemove}
                disabled={removing}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnDanger}`}
                onClick={confirmRemove}
                disabled={removing}
              >
                {removing ? (
                  <>
                    <Loader2 size={14} className={styles.spinner} />
                    Removing…
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    Remove
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;