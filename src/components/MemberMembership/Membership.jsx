import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle,
  Clock,
  Calendar,
  CreditCard,
  Crown,
  AlertCircle,
  ArrowRight,
  XCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import styles from './Membership.module.css';

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

const fmtDate = (d) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
};

const fmtShort = (d) => {
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

const durationLabel = (d) => {
  switch (d) {
    case 'Monthly':
      return '/mo';
    case 'Quarterly':
      return '/qtr';
    case 'Half-Yearly':
      return '/6mo';
    case 'Yearly':
      return '/yr';
    default:
      return '/mo';
  }
};

const Membership = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Subscription
  const [subscription, setSubscription] = useState(null);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [loadingSub, setLoadingSub] = useState(true);
  const [subError, setSubError] = useState('');

  // Plans catalog
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [plansError, setPlansError] = useState('');

  // History
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState('');

  // Modals
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Actions
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [togglingAutoRenew, setTogglingAutoRenew] = useState(false);
  const [actionError, setActionError] = useState('');

  // Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  /* ============================================================
     FETCH — subscription
     ============================================================ */
  const fetchSubscription = useCallback(async () => {
    try {
      setLoadingSub(true);
      setSubError('');
      const res = await fetch(`${API_BASE}/api/membership/my-subscription`, {
        headers: authHeaders(),
      });
      if (res.status === 404) {
        // No active subscription — normal empty state
        setSubscription(null);
        setDaysRemaining(0);
        return;
      }
      const data = await parseResponse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.message || `Failed to load subscription (${res.status})`);
      }
      setSubscription(data.data.subscription);
      setDaysRemaining(data.data.daysRemaining ?? 0);
    } catch (err) {
      setSubError(err.message || 'Failed to load subscription');
    } finally {
      setLoadingSub(false);
    }
  }, []);

  /* ============================================================
     FETCH — plans (public)
     ============================================================ */
  const fetchPlans = useCallback(async () => {
    try {
      setLoadingPlans(true);
      setPlansError('');
      const res = await fetch(`${API_BASE}/api/membership-plans`);
      const data = await parseResponse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.message || `Failed to load plans (${res.status})`);
      }
      setPlans(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setPlansError(err.message || 'Failed to load plans');
    } finally {
      setLoadingPlans(false);
    }
  }, []);

  /* ============================================================
     FETCH — history
     ============================================================ */
  const fetchHistory = useCallback(async () => {
    try {
      setLoadingHistory(true);
      setHistoryError('');
      const res = await fetch(`${API_BASE}/api/membership/history`, {
        headers: authHeaders(),
      });
      const data = await parseResponse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.message || `Failed to load history (${res.status})`);
      }
      setHistory(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setHistoryError(err.message || 'Failed to load history');
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
    fetchPlans();
  }, [fetchSubscription, fetchPlans]);

  useEffect(() => {
    if (activeTab === 'payments') fetchHistory();
  }, [activeTab, fetchHistory]);

  /* ============================================================
     Toast
     ============================================================ */
  const showToastMessage = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
  };

  useEffect(() => {
    if (!showToast) return;
    const t = setTimeout(() => setShowToast(false), 3000);
    return () => clearTimeout(t);
  }, [showToast]);

  /* ============================================================
     SUBSCRIBE (upgrade/switch)
     ============================================================ */
  const handleUpgrade = (planName) => {
    const plan = plans.find((p) => p.planName === planName);
    setSelectedPlan(plan);
    setActionError('');
    setShowUpgradeModal(true);
  };

  const confirmUpgrade = async () => {
    if (!selectedPlan || submitting) return;
    try {
      setSubmitting(true);
      setActionError('');

      // If user already has an active subscription, cancel first
      if (subscription && subscription.status === 'active') {
        const cancelRes = await fetch(`${API_BASE}/api/membership/cancel`, {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify({
            cancellationReason: `Switching to ${selectedPlan.planName}`,
          }),
        });
        const cancelData = await parseResponse(cancelRes);
        if (!cancelRes.ok || !cancelData.success) {
          throw new Error(
            cancelData.message || `Cancel failed (${cancelRes.status})`
          );
        }
      }

      // Subscribe to new plan
      const res = await fetch(`${API_BASE}/api/membership/subscribe`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          planId: selectedPlan._id,
          paymentMethod: 'credit_card',
          autoRenew: true,
        }),
      });
      const data = await parseResponse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.message || `Subscribe failed (${res.status})`);
      }

      showToastMessage(`Subscribed to ${selectedPlan.planName}`);
      setShowUpgradeModal(false);
      setSelectedPlan(null);
      setActiveTab('overview');
      fetchSubscription();
      fetchHistory();
    } catch (err) {
      setActionError(err.message || 'Failed to subscribe');
    } finally {
      setSubmitting(false);
    }
  };

  /* ============================================================
     CANCEL
     ============================================================ */
  const confirmCancel = async () => {
    if (cancelling) return;
    try {
      setCancelling(true);
      setActionError('');
      const res = await fetch(`${API_BASE}/api/membership/cancel`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ cancellationReason: 'User cancelled' }),
      });
      const data = await parseResponse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.message || `Cancel failed (${res.status})`);
      }
      showToastMessage('Subscription cancelled');
      setShowCancelModal(false);
      fetchSubscription();
      fetchHistory();
    } catch (err) {
      setActionError(err.message || 'Failed to cancel');
    } finally {
      setCancelling(false);
    }
  };

  /* ============================================================
     AUTO-RENEW toggle
     ============================================================ */
  const handleToggleAutoRenew = async () => {
    if (!subscription || togglingAutoRenew) return;
    const next = !subscription.autoRenew;
    try {
      setTogglingAutoRenew(true);
      const res = await fetch(`${API_BASE}/api/membership/auto-renew`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ autoRenew: next }),
      });
      const data = await parseResponse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.message || `Toggle failed (${res.status})`);
      }
      setSubscription((s) => ({ ...s, autoRenew: next }));
      showToastMessage(`Auto-renew ${next ? 'enabled' : 'disabled'}`);
    } catch (err) {
      showToastMessage(err.message || 'Failed to update auto-renew');
    } finally {
      setTogglingAutoRenew(false);
    }
  };

  /* ============================================================
     Helpers
     ============================================================ */
  const getStatusBadge = (status) => {
    const badges = {
      active: { label: 'Active', className: styles.statusActive },
      pending: { label: 'Pending', className: styles.statusPending },
      cancelled: { label: 'Cancelled', className: styles.statusCancelled },
      expired: { label: 'Expired', className: styles.statusCancelled },
      paid: { label: 'Paid', className: styles.statusPaid },
    };
    return badges[status] || badges.active;
  };

  const currentPlan = subscription?.planId || null;
  const currentFeatures = currentPlan?.features || [];
  const isActive = subscription?.status === 'active';

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div className={styles.membership}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>My Membership</h1>
          <p className={styles.pageSubtitle}>
            Manage your plan, view benefits, and track payments
          </p>
        </div>
        <div className={styles.headerActions}>
          {isActive && (
            <button
              className={styles.btnSecondary}
              onClick={() => {
                setActionError('');
                setShowCancelModal(true);
              }}
            >
              Cancel Membership
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'overview' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'plans' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('plans')}
        >
          Plans & Upgrade
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'payments' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          History
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {/* ============ Overview Tab ============ */}
        {activeTab === 'overview' && (
          <div className={styles.overviewTab}>
            {loadingSub && (
              <div className={styles.stateMessage}>
                <Loader2 size={18} className={styles.spinner} />
                Loading your membership…
              </div>
            )}

            {!loadingSub && subError && (
              <div className={styles.stateError}>{subError}</div>
            )}

            {!loadingSub && !subError && !subscription && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <Crown size={28} />
                </div>
                <h2 className={styles.emptyTitle}>No active membership</h2>
                <p className={styles.emptyText}>
                  Pick a plan to unlock gym access, classes, and coaching.
                </p>
                <button
                  className={styles.btnPrimary}
                  onClick={() => setActiveTab('plans')}
                >
                  Browse plans <ArrowRight size={16} />
                </button>
              </div>
            )}

            {!loadingSub && !subError && subscription && (
              <>
                <div className={styles.currentPlanCard}>
                  <div className={styles.planHeader}>
                    <div className={styles.planInfo}>
                      <div className={styles.planBadge}>
                        <Crown size={18} />
                        Current Plan
                      </div>
                      <h2 className={styles.planName}>
                        {currentPlan?.planName || 'Plan'}
                      </h2>
                      <span
                        className={`${styles.statusBadge} ${
                          getStatusBadge(subscription.status).className
                        }`}
                      >
                        {getStatusBadge(subscription.status).label}
                      </span>
                    </div>
                    <div className={styles.planPrice}>
                      <span className={styles.priceAmount}>
                        ${subscription.finalPrice ?? subscription.price ?? 0}
                      </span>
                      <span className={styles.pricePeriod}>
                        {durationLabel(currentPlan?.duration)}
                      </span>
                    </div>
                  </div>

                  <div className={styles.planDetails}>
                    <div className={styles.detailGrid}>
                      <div className={styles.detailItem}>
                        <Calendar size={16} />
                        <div>
                          <span className={styles.detailLabel}>Start Date</span>
                          <span className={styles.detailValue}>
                            {fmtDate(subscription.startDate)}
                          </span>
                        </div>
                      </div>
                      <div className={styles.detailItem}>
                        <Clock size={16} />
                        <div>
                          <span className={styles.detailLabel}>
                            Renewal Date
                          </span>
                          <span className={styles.detailValue}>
                            {fmtDate(subscription.endDate)}
                          </span>
                        </div>
                      </div>
                      <div className={styles.detailItem}>
                        <CreditCard size={16} />
                        <div>
                          <span className={styles.detailLabel}>
                            Days Remaining
                          </span>
                          <span className={styles.detailValue}>
                            {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Auto-renew toggle */}
                    <div className={styles.autoRenewRow}>
                      <div className={styles.autoRenewInfo}>
                        <RefreshCw size={14} />
                        <span>
                          Auto-renew is{' '}
                          <strong>
                            {subscription.autoRenew ? 'enabled' : 'disabled'}
                          </strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        className={`${styles.toggleBtn} ${
                          subscription.autoRenew ? styles.toggleOn : ''
                        }`}
                        onClick={handleToggleAutoRenew}
                        disabled={togglingAutoRenew || !isActive}
                        aria-pressed={!!subscription.autoRenew}
                      >
                        <span className={styles.toggleKnob} />
                      </button>
                    </div>

                    {subscription.discountApplied > 0 && (
                      <div className={styles.discountNote}>
                        {subscription.discountApplied}% discount applied — you
                        saved $
                        {(
                          (subscription.price || 0) -
                          (subscription.finalPrice || 0)
                        ).toFixed(2)}
                      </div>
                    )}
                  </div>

                  <div className={styles.planFeatures}>
                    <h3 className={styles.featuresTitle}>
                      What's included
                      {currentPlan?.planName ? ` in ${currentPlan.planName}` : ''}
                    </h3>
                    {currentFeatures.length === 0 ? (
                      <p className={styles.featuresEmpty}>
                        No features listed for this plan.
                      </p>
                    ) : (
                      <ul className={styles.featuresList}>
                        {currentFeatures.map((feature, index) => (
                          <li key={index}>
                            <CheckCircle size={16} />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}

                    {currentPlan?.description && (
                      <p className={styles.planDescription}>
                        {currentPlan.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className={styles.quickActions}>
                  <h3 className={styles.quickActionsTitle}>Quick Actions</h3>
                  <div className={styles.actionGrid}>
                    <button
                      className={styles.actionCard}
                      onClick={() => setActiveTab('plans')}
                    >
                      <ArrowRight size={20} />
                      <div>
                        <span className={styles.actionLabel}>Change Plan</span>
                        <span className={styles.actionDesc}>
                          Switch to a different tier
                        </span>
                      </div>
                    </button>
                    <button
                      className={styles.actionCard}
                      onClick={() => {
                        setActionError('');
                        setShowCancelModal(true);
                      }}
                      disabled={!isActive}
                    >
                      <XCircle size={20} />
                      <div>
                        <span className={styles.actionLabel}>
                          Cancel Membership
                        </span>
                        <span className={styles.actionDesc}>
                          End your subscription
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ============ Plans Tab ============ */}
        {activeTab === 'plans' && (
          <div className={styles.plansTab}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Choose your plan</h2>
              <p className={styles.sectionSubtitle}>
                Upgrade or downgrade your membership at any time
              </p>
            </div>

            {loadingPlans && (
              <div className={styles.stateMessage}>
                <Loader2 size={18} className={styles.spinner} />
                Loading plans…
              </div>
            )}

            {!loadingPlans && plansError && (
              <div className={styles.stateError}>{plansError}</div>
            )}

            {!loadingPlans && !plansError && plans.length === 0 && (
              <div className={styles.stateMessage}>
                No plans available at the moment.
              </div>
            )}

            {!loadingPlans && !plansError && plans.length > 0 && (
              <div className={styles.plansGrid}>
                {plans.map((plan) => {
                  const isCurrentPlan =
                    subscription?.planId?._id === plan._id && isActive;

                  const effectivePrice =
                    plan.discount > 0
                      ? plan.price * (1 - plan.discount / 100)
                      : plan.price;

                  return (
                    <div
                      key={plan._id}
                      className={`${styles.planCard} ${
                        plan.isPopular ? styles.planCardPopular : ''
                      } ${isCurrentPlan ? styles.planCardCurrent : ''}`}
                    >
                      {plan.isPopular && !isCurrentPlan && (
                        <span className={styles.popularBadge}>Most Popular</span>
                      )}
                      {isCurrentPlan && (
                        <span className={styles.currentBadge}>
                          Current Plan
                        </span>
                      )}

                      <h3 className={styles.planCardName}>{plan.planName}</h3>

                      <div className={styles.planCardPrice}>
                        ${effectivePrice.toFixed(0)}
                        <span className={styles.planCardPeriod}>
                          {durationLabel(plan.duration)}
                        </span>
                      </div>

                      {plan.discount > 0 && (
                        <span className={styles.savingsBadge}>
                          {plan.discount}% off — save $
                          {(plan.price - effectivePrice).toFixed(0)}
                        </span>
                      )}

                      {plan.description && (
                        <p className={styles.planCardDescription}>
                          {plan.description}
                        </p>
                      )}

                      <ul className={styles.planCardFeatures}>
                        {plan.features.map((feature) => (
                          <li key={feature}>
                            <CheckCircle size={16} />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <button
                        className={`${styles.btnPrimary} ${
                          isCurrentPlan ? styles.btnDisabled : ''
                        }`}
                        onClick={() => !isCurrentPlan && handleUpgrade(plan.planName)}
                        disabled={isCurrentPlan}
                      >
                        {isCurrentPlan
                          ? 'Current Plan'
                          : subscription?.status === 'active'
                          ? `Switch to ${plan.planName}`
                          : `Subscribe to ${plan.planName}`}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============ History Tab ============ */}
        {activeTab === 'payments' && (
          <div className={styles.paymentsTab}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Subscription History</h2>
              <p className={styles.sectionSubtitle}>
                All your past and current subscriptions
              </p>
            </div>

            {loadingHistory && (
              <div className={styles.stateMessage}>
                <Loader2 size={18} className={styles.spinner} />
                Loading history…
              </div>
            )}

            {!loadingHistory && historyError && (
              <div className={styles.stateError}>{historyError}</div>
            )}

            {!loadingHistory && !historyError && history.length === 0 && (
              <div className={styles.stateMessage}>
                No subscription history yet.
              </div>
            )}

            {!loadingHistory && !historyError && history.length > 0 && (
              <div className={styles.paymentTable}>
                <div className={styles.tableHeader}>
                  <span>Plan</span>
                  <span>Amount</span>
                  <span>Status</span>
                  <span>Period</span>
                </div>
                {history.map((sub) => (
                  <div key={sub._id} className={styles.tableRow}>
                    <span className={styles.rowDate}>
                      {sub.planId?.planName || '—'}
                    </span>
                    <span className={styles.rowAmount}>
                      ${sub.finalPrice ?? sub.price ?? 0}
                    </span>
                    <span
                      className={`${styles.rowStatus} ${
                        getStatusBadge(sub.status).className
                      }`}
                    >
                      {getStatusBadge(sub.status).label}
                    </span>
                    <span className={styles.rowMethod}>
                      {fmtShort(sub.startDate)} → {fmtShort(sub.endDate)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && subscription && (
        <div
          className={styles.modalOverlay}
          onClick={() => !cancelling && setShowCancelModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIcon}>
              <AlertCircle size={40} />
            </div>
            <h2 className={styles.modalTitle}>Cancel Membership?</h2>
            <p className={styles.modalDescription}>
              Are you sure you want to cancel your{' '}
              <strong>{currentPlan?.planName}</strong> membership? You'll
              continue to have access until{' '}
              <strong>{fmtDate(subscription.endDate)}</strong>.
            </p>

            {actionError && (
              <div className={styles.modalError}>{actionError}</div>
            )}

            <div className={styles.modalActions}>
              <button
                className={styles.btnSecondary}
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
              >
                Keep Membership
              </button>
              <button
                className={styles.btnDanger}
                onClick={confirmCancel}
                disabled={cancelling}
              >
                {cancelling ? (
                  <>
                    <Loader2 size={14} className={styles.spinner} /> Cancelling…
                  </>
                ) : (
                  'Yes, Cancel'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && selectedPlan && (
        <div
          className={styles.modalOverlay}
          onClick={() => !submitting && setShowUpgradeModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIcon}>
              <Crown size={40} />
            </div>
            <h2 className={styles.modalTitle}>
              {isActive
                ? `Switch to ${selectedPlan.planName}`
                : `Subscribe to ${selectedPlan.planName}`}
            </h2>
            <p className={styles.modalDescription}>
              {isActive ? (
                <>
                  You're switching from{' '}
                  <strong>{currentPlan?.planName}</strong> to{' '}
                  <strong>{selectedPlan.planName}</strong>. Your current plan
                  will be cancelled and the new one will start immediately.
                </>
              ) : (
                <>
                  You're subscribing to{' '}
                  <strong>{selectedPlan.planName}</strong> for{' '}
                  <strong>
                    ${selectedPlan.price}
                    {durationLabel(selectedPlan.duration)}
                  </strong>
                  . Your new features will be available immediately.
                </>
              )}
            </p>

            {actionError && (
              <div className={styles.modalError}>{actionError}</div>
            )}

            <div className={styles.modalActions}>
              <button
                className={styles.btnSecondary}
                onClick={() => setShowUpgradeModal(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                className={styles.btnPrimary}
                onClick={confirmUpgrade}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className={styles.spinner} /> Processing…
                  </>
                ) : isActive ? (
                  'Confirm Switch'
                ) : (
                  'Confirm Subscribe'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div className={styles.toast}>
          <div className={styles.toastIcon}>
            <CheckCircle size={16} />
          </div>
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default Membership;