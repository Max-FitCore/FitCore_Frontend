import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  DollarSign,
  AlertCircle,
  XCircle,
  Download,
  Check,
  Loader2,
  Search,
  Users,
  Calendar,
} from 'lucide-react';
import styles from './AdminPayments.module.css';

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
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
};

const shortId = (id = '') => {
  if (!id) return '—';
  return `SUB-${id.slice(-6).toUpperCase()}`;
};

const AdminPayments = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState({ active: 0, cancelled: 0, expired: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [showToast, setShowToast] = useState(false);

  /* ============================================================
     FETCH subscriptions
     ============================================================ */
  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_BASE}/api/admin/subscriptions`, {
        headers: authHeaders(),
      });
      const data = await parseResponse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.message || `Failed to load subscriptions (${res.status})`);
      }
      setSubscriptions(Array.isArray(data.data) ? data.data : []);
      setStats(data.stats || { active: 0, cancelled: 0, expired: 0 });
    } catch (err) {
      setError(err.message || 'Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  /* ============================================================
     Derived
     ============================================================ */
  const totalRevenue = useMemo(
    () =>
      subscriptions
        .filter((s) => s.paymentStatus === 'paid')
        .reduce((sum, s) => sum + (s.finalPrice ?? s.price ?? 0), 0),
    [subscriptions]
  );

  const filteredSubscriptions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return subscriptions.filter((s) => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (!q) return true;
      const name = s.memberId?.fullName?.toLowerCase() || '';
      const email = s.memberId?.email?.toLowerCase() || '';
      const plan = s.planId?.planName?.toLowerCase() || '';
      const ref = shortId(s._id).toLowerCase();
      return (
        name.includes(q) || email.includes(q) || plan.includes(q) || ref.includes(q)
      );
    });
  }, [subscriptions, searchQuery, statusFilter]);

  /* ============================================================
     CSV export
     ============================================================ */
  const handleExportCSV = () => {
    const headers = [
      'Subscription',
      'Member',
      'Email',
      'Plan',
      'Status',
      'Payment',
      'Start',
      'End',
      'Amount',
    ];

    const rows = filteredSubscriptions.map((s) => [
      shortId(s._id),
      s.memberId?.fullName || '—',
      s.memberId?.email || '—',
      s.planId?.planName || '—',
      s.status || '—',
      s.paymentStatus || '—',
      s.startDate ? new Date(s.startDate).toISOString().split('T')[0] : '—',
      s.endDate ? new Date(s.endDate).toISOString().split('T')[0] : '—',
      (s.finalPrice ?? s.price ?? 0).toFixed(2),
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => {
            const str = String(cell ?? '');
            return str.includes(',') || str.includes('"') || str.includes('\n')
              ? `"${str.replace(/"/g, '""')}"`
              : str;
          })
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `subscriptions_export_${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  /* ============================================================
     Helpers
     ============================================================ */
  const getStatusClass = (status) => {
    switch (status) {
      case 'active':
        return styles.statusPaid;
      case 'cancelled':
        return styles.statusPending;
      case 'expired':
        return styles.statusFailed;
      default:
        return styles.statusPending;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'cancelled':
        return 'Cancelled';
      case 'expired':
        return 'Expired';
      default:
        return status || 'Unknown';
    }
  };

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div className={styles.paymentsPage}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Payments</h1>
          <p className={styles.subtitle}>
            Subscription records across all members.
          </p>
        </div>
        <button
          className={styles.exportBtn}
          onClick={handleExportCSV}
          disabled={loading || filteredSubscriptions.length === 0}
          type="button"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className={styles.stateMessage}>
          <Loader2 size={18} className={styles.spinner} />
          Loading subscriptions…
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className={styles.stateError}>
          {error}
          <button className={styles.retryBtn} onClick={fetchSubscriptions}>
            Retry
          </button>
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          {/* Stats Grid */}
          <div className={styles.statsGrid}>
            <div className={`${styles.statCard} ${styles.statCardHighlight}`}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>Collected</span>
                <div className={`${styles.statIcon} ${styles.statIconHighlight}`}>
                  <DollarSign size={16} />
                </div>
              </div>
              <div className={styles.statValue}>
                ${totalRevenue.toFixed(0)}
              </div>
              <div className={styles.statMeta}>
                <span className={styles.statBadge}>
                  <Check size={10} />
                  {stats.active}
                </span>
                <span className={styles.statNote}>active subscriptions</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>Cancelled</span>
                <div className={`${styles.statIcon} ${styles.statIconWarning}`}>
                  <AlertCircle size={16} />
                </div>
              </div>
              <div className={styles.statValue}>{stats.cancelled}</div>
              <div className={styles.statMeta}>
                <span className={styles.statNote}>total records</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <span className={styles.statLabel}>Expired</span>
                <div className={`${styles.statIcon} ${styles.statIconError}`}>
                  <XCircle size={16} />
                </div>
              </div>
              <div className={styles.statValue}>{stats.expired}</div>
              <div className={styles.statMeta}>
                <span className={styles.statNote}>total records</span>
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className={styles.toolbar}>
            <div className={styles.searchWrapper}>
              <Search size={18} />
              <input
                type="text"
                placeholder="Search by member, email, plan, or reference…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.filterGroup}>
              {['all', 'active', 'cancelled', 'expired'].map((status) => (
                <button
                  key={status}
                  type="button"
                  className={`${styles.filterBtn} ${
                    statusFilter === status ? styles.filterBtnActive : ''
                  }`}
                  onClick={() => setStatusFilter(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className={styles.tableContainer}>
            <h3 className={styles.tableTitle}>
              Subscriptions ({filteredSubscriptions.length})
            </h3>

            {filteredSubscriptions.length === 0 ? (
              <div className={styles.emptyState}>
                {subscriptions.length === 0
                  ? 'No subscriptions yet.'
                  : 'No subscriptions match your filters.'}
              </div>
            ) : (
              <div className={styles.tableScroll}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Ref</th>
                      <th>Member</th>
                      <th>Plan</th>
                      <th>Period</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubscriptions.map((s) => (
                      <tr key={s._id}>
                        <td>
                          <span className={styles.invoiceId}>
                            {shortId(s._id)}
                          </span>
                        </td>
                        <td>
                          <div className={styles.memberCell}>
                            <span className={styles.memberName}>
                              {s.memberId?.fullName || 'Unknown'}
                            </span>
                            {s.memberId?.email && (
                              <span className={styles.memberEmail}>
                                {s.memberId.email}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>{s.planId?.planName || '—'}</td>
                        <td>
                          <div className={styles.periodCell}>
                            <span>{fmtDate(s.startDate)}</span>
                            <span className={styles.periodArrow}>→</span>
                            <span>{fmtDate(s.endDate)}</span>
                          </div>
                        </td>
                        <td>
                          <span className={styles.amount}>
                            ${(s.finalPrice ?? s.price ?? 0).toFixed(2)}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`${styles.statusBadge} ${getStatusClass(
                              s.status
                            )}`}
                          >
                            {getStatusLabel(s.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Toast */}
      {showToast && (
        <div className={styles.toast}>
          <div className={styles.toastIcon}>
            <Check size={16} />
          </div>
          CSV file exported successfully!
        </div>
      )}
    </div>
  );
};

export default AdminPayments;