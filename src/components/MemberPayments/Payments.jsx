import React, { useState } from 'react';
import {
  CreditCard,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Download,
  Filter,
  Search,
  ChevronRight,
  Eye,
  MoreVertical,
  Edit,
  Trash2,
  ArrowRight,
  Wallet,
  Receipt,
  Banknote,
  TrendingUp,
  TrendingDown,
  Printer,
  Send,
  RefreshCw,
  X
} from 'lucide-react';
import styles from './Payments.module.css';

const Payments = () => {
  const [activeTab, setActiveTab] = useState('transactions');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Payment methods
  const paymentMethods = [
    {
      id: 1,
      type: 'card',
      brand: 'Visa',
      last4: '4242',
      expiry: '12/26',
      isDefault: true,
      icon: '💳'
    },
    {
      id: 2,
      type: 'card',
      brand: 'Mastercard',
      last4: '8888',
      expiry: '08/25',
      isDefault: false,
      icon: '💳'
    },
    {
      id: 3,
      type: 'paypal',
      email: 'john.doe@example.com',
      isDefault: false,
      icon: '📧'
    },
  ];

  // Transaction history
  const transactions = [
    {
      id: 'INV-2026-001',
      date: '2026-01-15T10:30:00',
      description: 'Premium Membership - Monthly',
      amount: 59.00,
      status: 'paid',
      type: 'payment',
      method: 'Visa •••• 4242',
      invoiceUrl: '#',
      receiptUrl: '#'
    },
    {
      id: 'INV-2026-002',
      date: '2026-01-12T14:15:00',
      description: 'Personal Training Session - Mike Chen',
      amount: 45.00,
      status: 'paid',
      type: 'payment',
      method: 'Mastercard •••• 8888',
      invoiceUrl: '#',
      receiptUrl: '#'
    },
    {
      id: 'INV-2026-003',
      date: '2026-01-10T09:00:00',
      description: 'Gym Merch - FitCore Hoodie',
      amount: 34.99,
      status: 'pending',
      type: 'payment',
      method: 'PayPal',
      invoiceUrl: '#',
      receiptUrl: '#'
    },
    {
      id: 'INV-2025-124',
      date: '2025-12-15T11:45:00',
      description: 'Premium Membership - Monthly',
      amount: 59.00,
      status: 'paid',
      type: 'payment',
      method: 'Visa •••• 4242',
      invoiceUrl: '#',
      receiptUrl: '#'
    },
    {
      id: 'INV-2025-123',
      date: '2025-12-14T16:20:00',
      description: 'Refund - Class Cancellation',
      amount: -25.00,
      status: 'paid',
      type: 'refund',
      method: 'Visa •••• 4242',
      invoiceUrl: '#',
      receiptUrl: '#'
    },
    {
      id: 'INV-2025-122',
      date: '2025-12-10T08:30:00',
      description: 'Nutrition Consultation',
      amount: 75.00,
      status: 'paid',
      type: 'payment',
      method: 'Mastercard •••• 8888',
      invoiceUrl: '#',
      receiptUrl: '#'
    },
    {
      id: 'INV-2025-121',
      date: '2025-12-08T13:00:00',
      description: 'Premium Membership - Monthly',
      amount: 59.00,
      status: 'failed',
      type: 'payment',
      method: 'Visa •••• 4242',
      invoiceUrl: '#',
      receiptUrl: '#'
    },
  ];

  // Upcoming payments
  const upcomingPayments = [
    {
      id: 1,
      description: 'Premium Membership - Monthly',
      amount: 59.00,
      dueDate: '2026-02-15',
      status: 'upcoming',
      method: 'Visa •••• 4242'
    },
    {
      id: 2,
      description: 'Personal Training - Package Renewal',
      amount: 180.00,
      dueDate: '2026-02-20',
      status: 'upcoming',
      method: 'Mastercard •••• 8888'
    }
  ];

  // Financial summary
  const financialSummary = {
    totalSpent: 387.99,
    monthlyAverage: 59.00,
    pendingCharges: 34.99,
    refunds: 25.00,
    upcomingPayments: 239.00,
  };

  const getStatusBadge = (status) => {
    const badges = {
      paid: { label: 'Paid', className: styles.statusPaid, icon: CheckCircle },
      pending: { label: 'Pending', className: styles.statusPending, icon: Clock },
      failed: { label: 'Failed', className: styles.statusFailed, icon: XCircle },
      upcoming: { label: 'Upcoming', className: styles.statusUpcoming, icon: Calendar },
      refunded: { label: 'Refunded', className: styles.statusRefunded, icon: ArrowRight },
    };
    return badges[status] || badges.paid;
  };

  const getAmountColor = (amount) => {
    if (amount < 0) return styles.amountNegative;
    return styles.amountPositive;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const filteredTransactions = transactions.filter(transaction =>
    transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.method.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionDetails(true);
  };

  const handleDownloadInvoice = (transactionId) => {
    console.log(`Downloading invoice for ${transactionId}`);
    // API call to download invoice
  };

  const handleSetDefaultMethod = (methodId) => {
    console.log(`Setting payment method ${methodId} as default`);
    // API call to set default
  };

  const handleRemoveMethod = (methodId) => {
    console.log(`Removing payment method ${methodId}`);
    // API call to remove method
  };

  const handlePayNow = (paymentId) => {
    console.log(`Processing payment for ${paymentId}`);
    // API call to process payment
  };

  const handleSchedulePayment = (paymentId) => {
    console.log(`Scheduling payment for ${paymentId}`);
    // API call to schedule payment
  };

  return (
    <div className={styles.payments}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Payments</h1>
          <p className={styles.pageSubtitle}>Manage your transactions, payment methods, and billing</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnSecondary}>
            <Download size={18} />
            Export
          </button>
          <button 
            className={styles.btnPrimary}
            onClick={() => setShowAddPaymentMethod(true)}
          >
            <Plus size={18} />
            Add Payment Method
          </button>
        </div>
      </div>

      {/* Financial Summary */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon} style={{ background: 'rgba(166, 241, 59, 0.15)', color: '#A6F13B' }}>
            <DollarSign size={20} />
          </div>
          <div>
            <div className={styles.summaryLabel}>Total Spent</div>
            <div className={styles.summaryValue}>{formatCurrency(financialSummary.totalSpent)}</div>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon} style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6' }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <div className={styles.summaryLabel}>Monthly Average</div>
            <div className={styles.summaryValue}>{formatCurrency(financialSummary.monthlyAverage)}</div>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon} style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
            <Clock size={20} />
          </div>
          <div>
            <div className={styles.summaryLabel}>Pending Charges</div>
            <div className={styles.summaryValue}>{formatCurrency(financialSummary.pendingCharges)}</div>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon} style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}>
            <TrendingDown size={20} />
          </div>
          <div>
            <div className={styles.summaryLabel}>Refunds</div>
            <div className={styles.summaryValue}>{formatCurrency(financialSummary.refunds)}</div>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon} style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6' }}>
            <Calendar size={20} />
          </div>
          <div>
            <div className={styles.summaryLabel}>Upcoming Payments</div>
            <div className={styles.summaryValue}>{formatCurrency(financialSummary.upcomingPayments)}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'transactions' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          <Receipt size={16} />
          Transactions
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'methods' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('methods')}
        >
          <CreditCard size={16} />
          Payment Methods
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'upcoming' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          <Calendar size={16} />
          Upcoming Payments
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'invoices' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('invoices')}
        >
          <Banknote size={16} />
          Invoices
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className={styles.transactionsTab}>
            <div className={styles.searchSection}>
              <div className={styles.searchWrapper}>
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
              <button className={styles.filterBtn}>
                <Filter size={18} />
                Filter
              </button>
            </div>

            <div className={styles.transactionsTable}>
              <div className={styles.tableHeader}>
                <span>Transaction</span>
                <span>Date</span>
                <span>Method</span>
                <span>Amount</span>
                <span>Status</span>
                <span>Actions</span>
              </div>
              {filteredTransactions.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>💳</div>
                  <h3 className={styles.emptyTitle}>No transactions found</h3>
                  <p className={styles.emptyDescription}>
                    Try adjusting your search or filter to find what you're looking for.
                  </p>
                </div>
              ) : (
                filteredTransactions.map((transaction) => {
                  const StatusIcon = getStatusBadge(transaction.status).icon;
                  const isRefund = transaction.type === 'refund';
                  return (
                    <div key={transaction.id} className={styles.tableRow}>
                      <div className={styles.rowTransaction}>
                        <div className={styles.rowIcon}>
                          {isRefund ? '↩️' : '💳'}
                        </div>
                        <div>
                          <div className={styles.rowTitle}>{transaction.description}</div>
                          <div className={styles.rowId}>{transaction.id}</div>
                        </div>
                      </div>
                      <div className={styles.rowDate}>
                        <div>{formatDate(transaction.date)}</div>
                        <div className={styles.rowTime}>{formatTime(transaction.date)}</div>
                      </div>
                      <div className={styles.rowMethod}>{transaction.method}</div>
                      <div className={`${styles.rowAmount} ${getAmountColor(transaction.amount)}`}>
                        {formatCurrency(transaction.amount)}
                      </div>
                      <div className={styles.rowStatus}>
                        <span className={`${styles.statusBadge} ${getStatusBadge(transaction.status).className}`}>
                          <StatusIcon size={14} />
                          {getStatusBadge(transaction.status).label}
                        </span>
                      </div>
                      <div className={styles.rowActions}>
                        <button 
                          className={styles.btnIcon}
                          onClick={() => handleViewTransaction(transaction)}
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          className={styles.btnIcon}
                          onClick={() => handleDownloadInvoice(transaction.id)}
                        >
                          <Download size={16} />
                        </button>
                        <button className={styles.btnIcon}>
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Payment Methods Tab */}
        {activeTab === 'methods' && (
          <div className={styles.methodsTab}>
            <div className={styles.methodsGrid}>
              {paymentMethods.map((method) => (
                <div key={method.id} className={styles.methodCard}>
                  <div className={styles.methodCardHeader}>
                    <div className={styles.methodIcon}>
                      {method.type === 'paypal' ? '📧' : '💳'}
                    </div>
                    <div className={styles.methodInfo}>
                      <div className={styles.methodTitle}>
                        {method.type === 'paypal' ? 'PayPal' : method.brand}
                        {method.isDefault && (
                          <span className={styles.defaultBadge}>Default</span>
                        )}
                      </div>
                      <div className={styles.methodDetails}>
                        {method.type === 'paypal' 
                          ? method.email 
                          : `•••• ${method.last4} · Expires ${method.expiry}`
                        }
                      </div>
                    </div>
                  </div>
                  <div className={styles.methodCardActions}>
                    {!method.isDefault && (
                      <button 
                        className={styles.btnSecondarySmall}
                        onClick={() => handleSetDefaultMethod(method.id)}
                      >
                        Set as Default
                      </button>
                    )}
                    <button 
                      className={styles.btnSecondarySmall}
                      onClick={() => handleRemoveMethod(method.id)}
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <button 
                className={styles.addMethodCard}
                onClick={() => setShowAddPaymentMethod(true)}
              >
                <Plus size={24} />
                <span>Add New Payment Method</span>
              </button>
            </div>
          </div>
        )}

        {/* Upcoming Payments Tab */}
        {activeTab === 'upcoming' && (
          <div className={styles.upcomingTab}>
            <div className={styles.upcomingList}>
              {upcomingPayments.map((payment) => (
                <div key={payment.id} className={styles.upcomingCard}>
                  <div className={styles.upcomingLeft}>
                    <div className={styles.upcomingIcon}>
                      <Calendar size={20} />
                    </div>
                    <div>
                      <div className={styles.upcomingTitle}>{payment.description}</div>
                      <div className={styles.upcomingMeta}>
                        <span>Due: {formatDate(payment.dueDate)}</span>
                        <span>•</span>
                        <span>{payment.method}</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.upcomingRight}>
                    <div className={styles.upcomingAmount}>
                      {formatCurrency(payment.amount)}
                    </div>
                    <div className={styles.upcomingActions}>
                      <button 
                        className={styles.btnPrimarySmall}
                        onClick={() => handlePayNow(payment.id)}
                      >
                        Pay Now
                      </button>
                      <button 
                        className={styles.btnSecondarySmall}
                        onClick={() => handleSchedulePayment(payment.id)}
                      >
                        Schedule
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className={styles.invoicesTab}>
            <div className={styles.invoicesHeader}>
              <h2 className={styles.sectionTitle}>Recent Invoices</h2>
              <button className={styles.btnSecondary}>
                <Download size={18} />
                Download All
              </button>
            </div>
            <div className={styles.invoicesList}>
              {transactions
                .filter(t => t.type === 'payment')
                .slice(0, 5)
                .map((invoice) => (
                  <div key={invoice.id} className={styles.invoiceCard}>
                    <div className={styles.invoiceInfo}>
                      <div className={styles.invoiceIcon}>
                        <Receipt size={20} />
                      </div>
                      <div>
                        <div className={styles.invoiceTitle}>{invoice.description}</div>
                        <div className={styles.invoiceMeta}>
                          <span>{invoice.id}</span>
                          <span>•</span>
                          <span>{formatDate(invoice.date)}</span>
                          <span>•</span>
                          <span className={`${styles.statusBadge} ${getStatusBadge(invoice.status).className}`}>
                            {getStatusBadge(invoice.status).label}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.invoiceRight}>
                      <div className={styles.invoiceAmount}>
                        {formatCurrency(invoice.amount)}
                      </div>
                      <div className={styles.invoiceActions}>
                        <button 
                          className={styles.btnIcon}
                          onClick={() => handleDownloadInvoice(invoice.id)}
                        >
                          <Download size={16} />
                        </button>
                        <button className={styles.btnIcon}>
                          <Printer size={16} />
                        </button>
                        <button className={styles.btnIcon}>
                          <Send size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Payment Method Modal */}
      {showAddPaymentMethod && (
        <div className={styles.modalOverlay} onClick={() => setShowAddPaymentMethod(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Add Payment Method</h2>
              <button 
                className={styles.modalClose}
                onClick={() => setShowAddPaymentMethod(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.paymentMethodOptions}>
                <button className={styles.methodOption}>
                  <CreditCard size={24} />
                  <span>Credit / Debit Card</span>
                </button>
                <button className={styles.methodOption}>
                  <Wallet size={24} />
                  <span>PayPal</span>
                </button>
                <button className={styles.methodOption}>
                  <Banknote size={24} />
                  <span>Bank Transfer</span>
                </button>
              </div>

              <div className={styles.divider}>or</div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Card Number</label>
                <input 
                  type="text" 
                  placeholder="1234 5678 9012 3456"
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Expiry Date</label>
                  <input 
                    type="text" 
                    placeholder="MM/YY"
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>CVV</label>
                  <input 
                    type="text" 
                    placeholder="123"
                    className={styles.formInput}
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Name on Card</label>
                <input 
                  type="text" 
                  placeholder="John Doe"
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" defaultChecked />
                  <span>Set as default payment method</span>
                </label>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.btnSecondary}
                onClick={() => setShowAddPaymentMethod(false)}
              >
                Cancel
              </button>
              <button className={styles.btnPrimary}>
                Add Payment Method
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {showTransactionDetails && selectedTransaction && (
        <div className={styles.modalOverlay} onClick={() => setShowTransactionDetails(false)}>
          <div className={styles.modalLarge} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>Transaction Details</h2>
                <div className={styles.modalSubtitle}>{selectedTransaction.id}</div>
              </div>
              <button 
                className={styles.modalClose}
                onClick={() => setShowTransactionDetails(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Description</span>
                  <span className={styles.detailValue}>{selectedTransaction.description}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Amount</span>
                  <span className={`${styles.detailValue} ${getAmountColor(selectedTransaction.amount)}`}>
                    {formatCurrency(selectedTransaction.amount)}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Date</span>
                  <span className={styles.detailValue}>{formatDate(selectedTransaction.date)}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Time</span>
                  <span className={styles.detailValue}>{formatTime(selectedTransaction.date)}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Payment Method</span>
                  <span className={styles.detailValue}>{selectedTransaction.method}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Status</span>
                  <span className={`${styles.statusBadge} ${getStatusBadge(selectedTransaction.status).className}`}>
                    {getStatusBadge(selectedTransaction.status).label}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Type</span>
                  <span className={styles.detailValue}>
                    {selectedTransaction.type.charAt(0).toUpperCase() + selectedTransaction.type.slice(1)}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Invoice</span>
                  <button 
                    className={styles.linkButton}
                    onClick={() => handleDownloadInvoice(selectedTransaction.id)}
                  >
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.btnSecondary}
                onClick={() => setShowTransactionDetails(false)}
              >
                Close
              </button>
              <button className={styles.btnPrimary}>
                <Download size={16} />
                Download Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;