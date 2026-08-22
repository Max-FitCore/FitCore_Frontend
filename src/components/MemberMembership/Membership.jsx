import React, { useState } from 'react';
import { 
  CheckCircle, 
  Clock, 
  Calendar, 
  CreditCard, 
  Crown, 
  AlertCircle,
  ArrowRight,
  XCircle
} from 'lucide-react';
import styles from './Membership.module.css';

const Membership = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Current membership data
  const currentMembership = {
    plan: 'Premium',
    status: 'active',
    startDate: 'January 15, 2026',
    renewDate: 'February 15, 2026',
    price: '$59.00',
    billingCycle: 'monthly',
    features: [
      'Unlimited gym access',
      'Unlimited group classes',
      'Personalised workout plans',
      'Monthly progress review',
      'Nutrition guidance',
    ],
    nextPayment: '$59.00 on Feb 15, 2026',
  };

  // Available plans
  const plans = [
    {
      name: 'Basic',
      price: '$29',
      period: '/mo',
      features: ['Full gym floor access', '2 group classes / month', 'Attendance tracking', 'Mobile app access'],
      popular: false,
      savings: null,
    },
    {
      name: 'Premium',
      price: '$59',
      period: '/mo',
      features: [
        'Unlimited gym access',
        'Unlimited group classes',
        'Personalised workout plans',
        'Monthly progress review',
        'Nutrition guidance',
      ],
      popular: true,
      savings: null,
    },
    {
      name: 'VIP',
      price: '$119',
      period: '/mo',
      features: [
        'Everything in Premium',
        '8 personal training sessions',
        'Priority class booking',
        'Body composition scans',
        'Recovery & sauna suite',
      ],
      popular: false,
      savings: 'Save $21/month',
    },
  ];

  // Payment history
  const paymentHistory = [
    { id: 1, date: 'Jan 15, 2026', amount: '$59.00', status: 'paid', method: 'Visa •••• 4242' },
    { id: 2, date: 'Dec 15, 2025', amount: '$59.00', status: 'paid', method: 'Visa •••• 4242' },
    { id: 3, date: 'Nov 15, 2025', amount: '$59.00', status: 'paid', method: 'Visa •••• 4242' },
    { id: 4, date: 'Oct 15, 2025', amount: '$59.00', status: 'paid', method: 'Visa •••• 4242' },
  ];

  const handleUpgrade = (planName) => {
    setSelectedPlan(planName);
    setShowUpgradeModal(true);
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const confirmUpgrade = () => {
    // API call to upgrade membership
    console.log(`Upgrading to ${selectedPlan}`);
    setShowUpgradeModal(false);
    setActiveTab('overview');
    // Show success toast
  };

  const confirmCancel = () => {
    // API call to cancel membership
    console.log('Cancelling membership');
    setShowCancelModal(false);
    setActiveTab('overview');
    // Show success toast
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { label: 'Active', className: styles.statusActive },
      pending: { label: 'Pending', className: styles.statusPending },
      cancelled: { label: 'Cancelled', className: styles.statusCancelled },
      paid: { label: 'Paid', className: styles.statusPaid },
    };
    return badges[status] || badges.active;
  };

  return (
    <div className={styles.membership}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>My Membership</h1>
          <p className={styles.pageSubtitle}>Manage your plan, view benefits, and track payments</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnSecondary} onClick={handleCancel}>
            Cancel Membership
          </button>
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
          Payment History
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className={styles.overviewTab}>
            {/* Current Plan Card */}
            <div className={styles.currentPlanCard}>
              <div className={styles.planHeader}>
                <div className={styles.planInfo}>
                  <div className={styles.planBadge}>
                    <Crown size={18} />
                    Current Plan
                  </div>
                  <h2 className={styles.planName}>{currentMembership.plan}</h2>
                  <span className={`${styles.statusBadge} ${getStatusBadge(currentMembership.status).className}`}>
                    {getStatusBadge(currentMembership.status).label}
                  </span>
                </div>
                <div className={styles.planPrice}>
                  <span className={styles.priceAmount}>{currentMembership.price}</span>
                  <span className={styles.pricePeriod}>/{currentMembership.billingCycle}</span>
                </div>
              </div>

              <div className={styles.planDetails}>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <Calendar size={16} />
                    <div>
                      <span className={styles.detailLabel}>Start Date</span>
                      <span className={styles.detailValue}>{currentMembership.startDate}</span>
                    </div>
                  </div>
                  <div className={styles.detailItem}>
                    <Clock size={16} />
                    <div>
                      <span className={styles.detailLabel}>Renewal Date</span>
                      <span className={styles.detailValue}>{currentMembership.renewDate}</span>
                    </div>
                  </div>
                  <div className={styles.detailItem}>
                    <CreditCard size={16} />
                    <div>
                      <span className={styles.detailLabel}>Next Payment</span>
                      <span className={styles.detailValue}>{currentMembership.nextPayment}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.planFeatures}>
                <h3 className={styles.featuresTitle}>What's included</h3>
                <ul className={styles.featuresList}>
                  {currentMembership.features.map((feature, index) => (
                    <li key={index}>
                      <CheckCircle size={16} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Quick Actions */}
            <div className={styles.quickActions}>
              <h3 className={styles.quickActionsTitle}>Quick Actions</h3>
              <div className={styles.actionGrid}>
                <button className={styles.actionCard} onClick={() => setActiveTab('plans')}>
                  <ArrowRight size={20} />
                  <div>
                    <span className={styles.actionLabel}>Upgrade Plan</span>
                    <span className={styles.actionDesc}>Get more features & benefits</span>
                  </div>
                </button>
                <button className={styles.actionCard} onClick={handleCancel}>
                  <XCircle size={20} />
                  <div>
                    <span className={styles.actionLabel}>Cancel Membership</span>
                    <span className={styles.actionDesc}>End your subscription</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Plans Tab */}
        {activeTab === 'plans' && (
          <div className={styles.plansTab}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Choose your plan</h2>
              <p className={styles.sectionSubtitle}>
                Upgrade or downgrade your membership at any time
              </p>
            </div>

            <div className={styles.plansGrid}>
              {plans.map((plan, index) => {
                const isCurrentPlan = plan.name === currentMembership.plan;
                return (
                  <div
                    key={plan.name}
                    className={`${styles.planCard} ${plan.popular ? styles.planCardPopular : ''} ${isCurrentPlan ? styles.planCardCurrent : ''}`}
                  >
                    {plan.popular && (
                      <span className={styles.popularBadge}>Most Popular</span>
                    )}
                    {isCurrentPlan && (
                      <span className={styles.currentBadge}>Current Plan</span>
                    )}
                    
                    <h3 className={styles.planCardName}>{plan.name}</h3>
                    <div className={styles.planCardPrice}>
                      {plan.price}
                      <span className={styles.planCardPeriod}>{plan.period}</span>
                    </div>
                    {plan.savings && (
                      <span className={styles.savingsBadge}>{plan.savings}</span>
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
                      className={`${styles.btnPrimary} ${isCurrentPlan ? styles.btnDisabled : ''}`}
                      onClick={() => handleUpgrade(plan.name)}
                      disabled={isCurrentPlan}
                    >
                      {isCurrentPlan ? 'Current Plan' : `Upgrade to ${plan.name}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className={styles.paymentsTab}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Payment History</h2>
              <p className={styles.sectionSubtitle}>
                View all your past transactions
              </p>
            </div>

            <div className={styles.paymentTable}>
              <div className={styles.tableHeader}>
                <span>Date</span>
                <span>Amount</span>
                <span>Status</span>
                <span>Method</span>
              </div>
              {paymentHistory.map((payment) => (
                <div key={payment.id} className={styles.tableRow}>
                  <span className={styles.rowDate}>{payment.date}</span>
                  <span className={styles.rowAmount}>{payment.amount}</span>
                  <span className={`${styles.rowStatus} ${getStatusBadge(payment.status).className}`}>
                    {getStatusBadge(payment.status).label}
                  </span>
                  <span className={styles.rowMethod}>{payment.method}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCancelModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIcon}>
              <AlertCircle size={40} />
            </div>
            <h2 className={styles.modalTitle}>Cancel Membership?</h2>
            <p className={styles.modalDescription}>
              Are you sure you want to cancel your {currentMembership.plan} membership?
              You'll lose access to all benefits and features immediately.
            </p>
            <div className={styles.modalActions}>
              <button
                className={styles.btnSecondary}
                onClick={() => setShowCancelModal(false)}
              >
                Keep Membership
              </button>
              <button
                className={styles.btnDanger}
                onClick={confirmCancel}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className={styles.modalOverlay} onClick={() => setShowUpgradeModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIcon}>
              <Crown size={40} />
            </div>
            <h2 className={styles.modalTitle}>Upgrade to {selectedPlan}</h2>
            <p className={styles.modalDescription}>
              You're upgrading from <strong>{currentMembership.plan}</strong> to{' '}
              <strong>{selectedPlan}</strong>. Your new features will be available immediately.
            </p>
            <div className={styles.modalActions}>
              <button
                className={styles.btnSecondary}
                onClick={() => setShowUpgradeModal(false)}
              >
                Cancel
              </button>
              <button
                className={styles.btnPrimary}
                onClick={confirmUpgrade}
              >
                Confirm Upgrade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Membership;