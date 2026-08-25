import React, { useState } from 'react';
import { DollarSign, AlertCircle, XCircle, Download, Check } from 'lucide-react';
import styles from './AdminPayments.module.css';

const Payments = () => {
  // Initial invoices data
  const initialInvoices = [
    { id: 'INV-2081', member: 'Sara Nabil', plan: 'Premium', date: '2026-08-01', amount: 59.00, status: 'Paid' },
    { id: 'INV-2082', member: 'Omar Haddad', plan: 'VIP', date: '2026-08-02', amount: 119.00, status: 'Paid' },
    { id: 'INV-2083', member: 'Lina Farouk', plan: 'Basic', date: '2026-08-05', amount: 29.00, status: 'Pending' },
    { id: 'INV-2084', member: 'Youssef Adel', plan: 'Premium', date: '2026-08-07', amount: 59.00, status: 'Paid' },
    { id: 'INV-2085', member: 'Nour Salem', plan: 'Basic', date: '2026-07-30', amount: 29.00, status: 'Failed' },
    { id: 'INV-2086', member: 'Karim Zaki', plan: 'VIP', date: '2026-08-11', amount: 119.00, status: 'Paid' },
  ];

  const [invoices] = useState(initialInvoices);
  const [showToast, setShowToast] = useState(false);

  // Calculate stats
  const collected = invoices
    .filter(inv => inv.status === 'Paid')
    .reduce((sum, inv) => sum + inv.amount, 0);
  
  const pendingCount = invoices.filter(inv => inv.status === 'Pending').length;
  const failedCount = invoices.filter(inv => inv.status === 'Failed').length;
  const paidCount = invoices.filter(inv => inv.status === 'Paid').length;

  // Export to CSV
  const handleExportCSV = () => {
    // Create CSV content
    const headers = ['Invoice', 'Member', 'Plan', 'Date', 'Amount', 'Status'];
    const csvRows = [
      headers.join(','),
      ...invoices.map(inv => [
        inv.id,
        inv.member,
        inv.plan,
        inv.date,
        `$${inv.amount.toFixed(2)}`,
        inv.status
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `payments_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show success toast
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Get status badge class
  const getStatusClass = (status) => {
    switch (status) {
      case 'Paid':
        return styles.statusPaid;
      case 'Pending':
        return styles.statusPending;
      case 'Failed':
        return styles.statusFailed;
      default:
        return styles.statusPending;
    }
  };

  return (
    <div className={styles.paymentsPage}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Payments</h1>
          <p className={styles.subtitle}>Invoice status across all members.</p>
        </div>
        <button className={styles.exportBtn} onClick={handleExportCSV}>
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {/* Collected Card */}
        <div className={`${styles.statCard} ${styles.statCardHighlight}`}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Collected</span>
            <div className={`${styles.statIcon} ${styles.statIconHighlight}`}>
              <DollarSign size={16} />
            </div>
          </div>
          <div className={styles.statValue}>${collected.toFixed(0)}</div>
          <div className={styles.statMeta}>
            <span className={styles.statBadge}>
              <Check size={10} />
              7%
            </span>
            <span className={styles.statNote}>{paidCount} invoices</span>
          </div>
        </div>

        {/* Pending Card */}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Pending</span>
            <div className={`${styles.statIcon} ${styles.statIconWarning}`}>
              <AlertCircle size={16} />
            </div>
          </div>
          <div className={styles.statValue}>{pendingCount}</div>
        </div>

        {/* Failed Card */}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Failed</span>
            <div className={`${styles.statIcon} ${styles.statIconError}`}>
              <XCircle size={16} />
            </div>
          </div>
          <div className={styles.statValue}>{failedCount}</div>
          <div className={styles.statMeta}>
            <span className={`${styles.statBadge} ${styles.statBadgeDecrease}`}>
              <XCircle size={10} />
              1%
            </span>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className={styles.tableContainer}>
        <h3 className={styles.tableTitle}>All invoices</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Member</th>
              <th>Plan</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td>
                  <span className={styles.invoiceId}>{invoice.id}</span>
                </td>
                <td>
                  <span className={styles.memberName}>{invoice.member}</span>
                </td>
                <td>{invoice.plan}</td>
                <td>{invoice.date}</td>
                <td>
                  <span className={styles.amount}>${invoice.amount.toFixed(2)}</span>
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${getStatusClass(invoice.status)}`}>
                    {invoice.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Toast Notification */}
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

export default Payments;