import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CreditCard,
  Plus,
  Trash2,
  Star,
  CheckCircle,
  AlertCircle,
  X,
  Loader2,
  Pencil,
  Wallet,
  ShieldCheck,
} from 'lucide-react';
import styles from './Payments.module.css';

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

const BRAND_ICONS = {
  Visa: '💳',
  Mastercard: '💳',
  Amex: '💳',
  Discover: '💳',
  Other: '💳',
};

const cleanCardNumber = (v = '') => v.replace(/[\s-]/g, '');

const formatCardInput = (v = '') => {
  const cleaned = v.replace(/\D/g, '').slice(0, 16);
  return cleaned.replace(/(.{4})/g, '$1 ').trim();
};

const formatExpiryInput = (v = '') => {
  const cleaned = v.replace(/\D/g, '').slice(0, 4);
  if (cleaned.length <= 2) return cleaned;
  return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
};

const Payments = () => {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [methodToDelete, setMethodToDelete] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    isDefault: false,
  });

  const showToastMessage = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ============================================================
     FETCH
     ============================================================ */
  const fetchMethods = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError('');
      const res = await fetch(`${API_BASE}/api/payment-methods`, {
        headers: authHeaders(),
      });
      const data = await parseResponse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.message || `Failed to load cards (${res.status})`);
      }
      setMethods(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setLoadError(err.message || 'Failed to load cards');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMethods();
  }, [fetchMethods]);

  /* ============================================================
     FORM
     ============================================================ */
  const resetForm = () => {
    setFormData({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      nameOnCard: '',
      isDefault: false,
    });
    setFieldErrors({});
    setActionError('');
  };

  const handleAdd = () => {
    resetForm();
    setEditingMethod(null);
    setShowAddModal(true);
  };

  const handleEdit = (method) => {
    resetForm();
    setEditingMethod(method);
    setFormData({
      cardNumber: '',
      expiryDate: method.expiryDate || '',
      cvv: '',
      nameOnCard: method.nameOnCard || '',
      isDefault: !!method.isDefault,
    });
    setShowAddModal(true);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    if (actionError) setActionError('');
  };

  const validateAddForm = () => {
    const errs = {};

    const digits = cleanCardNumber(formData.cardNumber);
    if (!digits) errs.cardNumber = 'Card number is required';
    else if (!/^\d{15,16}$/.test(digits))
      errs.cardNumber = 'Must be 15 or 16 digits';

    if (!formData.expiryDate) errs.expiryDate = 'Expiry is required';
    else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate))
      errs.expiryDate = 'Format must be MM/YY';

    if (!formData.cvv) errs.cvv = 'CVV is required';
    else if (!/^\d{3,4}$/.test(formData.cvv))
      errs.cvv = 'Must be 3 or 4 digits';

    const name = formData.nameOnCard.trim();
    if (!name) errs.nameOnCard = 'Name is required';
    else if (name.length < 2 || name.length > 100)
      errs.nameOnCard = 'Must be 2–100 characters';

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateEditForm = () => {
    const errs = {};

    if (!formData.expiryDate) errs.expiryDate = 'Expiry is required';
    else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate))
      errs.expiryDate = 'Format must be MM/YY';

    const name = formData.nameOnCard.trim();
    if (!name) errs.nameOnCard = 'Name is required';
    else if (name.length < 2 || name.length > 100)
      errs.nameOnCard = 'Must be 2–100 characters';

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ============================================================
     SUBMIT
     ============================================================ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (editingMethod) {
      if (!validateEditForm()) return;
      try {
        setSubmitting(true);
        setActionError('');
        const res = await fetch(
          `${API_BASE}/api/payment-methods/${editingMethod._id}`,
          {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({
              expiryDate: formData.expiryDate,
              nameOnCard: formData.nameOnCard.trim(),
            }),
          }
        );
        const data = await parseResponse(res);
        if (!res.ok || !data.success) {
          throw new Error(data.message || `Update failed (${res.status})`);
        }
        setMethods((prev) =>
          prev.map((m) => (m._id === data.data._id ? data.data : m))
        );
        showToastMessage('Card updated');
        setShowAddModal(false);
        setEditingMethod(null);
        resetForm();
      } catch (err) {
        setActionError(err.message || 'Failed to update card');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!validateAddForm()) return;

    const payload = {
      cardNumber: cleanCardNumber(formData.cardNumber),
      expiryDate: formData.expiryDate,
      cvv: formData.cvv,
      nameOnCard: formData.nameOnCard.trim(),
      isDefault: formData.isDefault,
    };

    try {
      setSubmitting(true);
      setActionError('');
      const res = await fetch(`${API_BASE}/api/payment-methods`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await parseResponse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.message || `Add failed (${res.status})`);
      }
      await fetchMethods();
      showToastMessage('Card added');
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      setActionError(err.message || 'Failed to add card');
    } finally {
      setSubmitting(false);
    }
  };

  /* ============================================================
     SET DEFAULT
     ============================================================ */
  const handleSetDefault = async (method) => {
    if (method.isDefault) return;
    try {
      const res = await fetch(
        `${API_BASE}/api/payment-methods/${method._id}/default`,
        { method: 'PUT', headers: authHeaders() }
      );
      const data = await parseResponse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.message || `Set default failed (${res.status})`);
      }
      setMethods((prev) =>
        prev.map((m) => ({ ...m, isDefault: m._id === method._id }))
      );
      showToastMessage('Default card updated');
    } catch (err) {
      showToastMessage(err.message || 'Failed to set default', 'error');
    }
  };

  /* ============================================================
     DELETE
     ============================================================ */
  const handleDeleteClick = (method) => {
    setActionError('');
    setMethodToDelete(method);
  };

  const confirmDelete = async () => {
    if (!methodToDelete || deleting) return;
    try {
      setDeleting(true);
      setActionError('');
      const res = await fetch(
        `${API_BASE}/api/payment-methods/${methodToDelete._id}`,
        { method: 'DELETE', headers: authHeaders() }
      );
      const data = await parseResponse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.message || `Delete failed (${res.status})`);
      }
      await fetchMethods();
      showToastMessage('Card removed');
      setMethodToDelete(null);
    } catch (err) {
      setActionError(err.message || 'Failed to delete card');
    } finally {
      setDeleting(false);
    }
  };

  /* ============================================================
     DERIVED
     ============================================================ */
  const summary = useMemo(
    () => ({
      total: methods.length,
      defaultCard: methods.find((m) => m.isDefault) || null,
    }),
    [methods]
  );

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div className={styles.payments}>
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
          <CheckCircle size={18} />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Payments</h1>
          <p className={styles.pageSubtitle}>
            Manage your saved cards and payment preferences
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.btnPrimary}
            onClick={handleAdd}
            type="button"
          >
            <Plus size={18} />
            Add Card
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div
            className={styles.summaryIcon}
            style={{ background: 'rgba(166, 241, 59, 0.15)', color: '#A6F13B' }}
          >
            <CreditCard size={20} />
          </div>
          <div>
            <div className={styles.summaryLabel}>Saved Cards</div>
            <div className={styles.summaryValue}>{summary.total}</div>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div
            className={styles.summaryIcon}
            style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6' }}
          >
            <Star size={20} />
          </div>
          <div>
            <div className={styles.summaryLabel}>Default Card</div>
            <div className={styles.summaryValue}>
              {summary.defaultCard
                ? `${summary.defaultCard.cardType} •••• ${summary.defaultCard.lastFourDigits}`
                : '—'}
            </div>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div
            className={styles.summaryIcon}
            style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22C55E' }}
          >
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className={styles.summaryLabel}>Secure</div>
            <div className={styles.summaryValue}>Encrypted at rest</div>
          </div>
        </div>
      </div>

      {/* Cards List */}
      <div className={styles.tabContent}>
        {loading && (
          <div className={styles.stateMessage}>
            <Loader2 size={18} className={styles.spinner} />
            Loading cards…
          </div>
        )}

        {!loading && loadError && (
          <div className={styles.stateError}>
            {loadError}
            <button className={styles.retryBtn} onClick={fetchMethods}>
              Retry
            </button>
          </div>
        )}

        {!loading && !loadError && methods.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Wallet size={32} />
            </div>
            <h3 className={styles.emptyTitle}>No payment methods yet</h3>
            <p className={styles.emptyDescription}>
              Add a card to speed up checkout and enable auto-renew.
            </p>
            <button
              className={styles.btnPrimary}
              onClick={handleAdd}
              style={{ marginTop: '1rem' }}
              type="button"
            >
              <Plus size={16} />
              Add your first card
            </button>
          </div>
        )}

        {!loading && !loadError && methods.length > 0 && (
          <div className={styles.methodsGrid}>
            {methods.map((method) => (
              <div
                key={method._id}
                className={`${styles.methodCard} ${
                  method.isDefault ? styles.methodCardDefault : ''
                }`}
              >
                <div className={styles.methodCardHeader}>
                  <div className={styles.methodIcon}>
                    {BRAND_ICONS[method.cardType] || BRAND_ICONS.Other}
                  </div>
                  <div className={styles.methodInfo}>
                    <div className={styles.methodTitle}>
                      {method.cardType || 'Card'}
                      {method.isDefault && (
                        <span className={styles.defaultBadge}>Default</span>
                      )}
                    </div>
                    <div className={styles.methodDetails}>
                      •••• {method.lastFourDigits || '----'} · Exp{' '}
                      {method.expiryDate || '--/--'}
                    </div>
                    {method.nameOnCard && (
                      <div className={styles.methodHolder}>
                        {method.nameOnCard}
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.methodCardActions}>
                  {!method.isDefault && (
                    <button
                      className={styles.btnSecondarySmall}
                      onClick={() => handleSetDefault(method)}
                      type="button"
                    >
                      <Star size={14} />
                      Set Default
                    </button>
                  )}
                  <button
                    className={styles.btnSecondarySmall}
                    onClick={() => handleEdit(method)}
                    type="button"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                  <button
                    className={styles.btnDangerSmall}
                    onClick={() => handleDeleteClick(method)}
                    type="button"
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                </div>
              </div>
            ))}

            {/* Add tile */}
            <button
              className={styles.addMethodCard}
              onClick={handleAdd}
              type="button"
            >
              <Plus size={24} />
              <span>Add New Card</span>
            </button>
          </div>
        )}
      </div>

      {/* ============ Add / Edit Modal ============ */}
      {showAddModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => !submitting && setShowAddModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>
                  {editingMethod ? 'Edit Card' : 'Add Payment Method'}
                </h2>
                <div className={styles.modalSubtitle}>
                  {editingMethod
                    ? `Update •••• ${editingMethod.lastFourDigits}`
                    : 'Enter your card details'}
                </div>
              </div>
              <button
                className={styles.modalClose}
                onClick={() => setShowAddModal(false)}
                disabled={submitting}
                type="button"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                {!editingMethod && (
                  <>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Card Number</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="1234 5678 9012 3456"
                        value={formData.cardNumber}
                        onChange={(e) =>
                          handleChange(
                            'cardNumber',
                            formatCardInput(e.target.value)
                          )
                        }
                        className={`${styles.formInput} ${
                          fieldErrors.cardNumber ? styles.inputError : ''
                        }`}
                        disabled={submitting}
                      />
                      {fieldErrors.cardNumber && (
                        <span className={styles.errorMessage}>
                          {fieldErrors.cardNumber}
                        </span>
                      )}
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                          Expiry (MM/YY)
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="12/26"
                          value={formData.expiryDate}
                          onChange={(e) =>
                            handleChange(
                              'expiryDate',
                              formatExpiryInput(e.target.value)
                            )
                          }
                          className={`${styles.formInput} ${
                            fieldErrors.expiryDate ? styles.inputError : ''
                          }`}
                          disabled={submitting}
                        />
                        {fieldErrors.expiryDate && (
                          <span className={styles.errorMessage}>
                            {fieldErrors.expiryDate}
                          </span>
                        )}
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>CVV</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="123"
                          maxLength={4}
                          value={formData.cvv}
                          onChange={(e) =>
                            handleChange(
                              'cvv',
                              e.target.value.replace(/\D/g, '').slice(0, 4)
                            )
                          }
                          className={`${styles.formInput} ${
                            fieldErrors.cvv ? styles.inputError : ''
                          }`}
                          disabled={submitting}
                        />
                        {fieldErrors.cvv && (
                          <span className={styles.errorMessage}>
                            {fieldErrors.cvv}
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {editingMethod && (
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Expiry (MM/YY)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="12/26"
                      value={formData.expiryDate}
                      onChange={(e) =>
                        handleChange(
                          'expiryDate',
                          formatExpiryInput(e.target.value)
                        )
                      }
                      className={`${styles.formInput} ${
                        fieldErrors.expiryDate ? styles.inputError : ''
                      }`}
                      disabled={submitting}
                    />
                    {fieldErrors.expiryDate && (
                      <span className={styles.errorMessage}>
                        {fieldErrors.expiryDate}
                      </span>
                    )}
                  </div>
                )}

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Name on Card</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={formData.nameOnCard}
                    onChange={(e) =>
                      handleChange('nameOnCard', e.target.value)
                    }
                    className={`${styles.formInput} ${
                      fieldErrors.nameOnCard ? styles.inputError : ''
                    }`}
                    disabled={submitting}
                  />
                  {fieldErrors.nameOnCard && (
                    <span className={styles.errorMessage}>
                      {fieldErrors.nameOnCard}
                    </span>
                  )}
                </div>

                {!editingMethod && (
                  <div className={styles.formGroup}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={formData.isDefault}
                        onChange={(e) =>
                          handleChange('isDefault', e.target.checked)
                        }
                        disabled={submitting}
                      />
                      <span>Set as default card</span>
                    </label>
                  </div>
                )}

                {actionError && (
                  <div className={styles.actionError}>{actionError}</div>
                )}
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setShowAddModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.btnPrimary}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={14} className={styles.spinner} /> Saving…
                    </>
                  ) : editingMethod ? (
                    'Save Changes'
                  ) : (
                    'Add Card'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============ Delete Modal ============ */}
      {methodToDelete && (
        <div
          className={styles.modalOverlay}
          onClick={() => !deleting && setMethodToDelete(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>Remove Card</h2>
                <div className={styles.modalSubtitle}>
                  {methodToDelete.cardType || 'Card'} ••••{' '}
                  {methodToDelete.lastFourDigits || '----'}
                </div>
              </div>
              <button
                className={styles.modalClose}
                onClick={() => setMethodToDelete(null)}
                disabled={deleting}
                type="button"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.deleteInfo}>
                <div className={styles.deleteIconWrap}>
                  <AlertCircle size={32} />
                </div>
                <p className={styles.deleteText}>
                  Are you sure you want to remove this card? You'll need to
                  add it again to use it for payments.
                </p>
                {methodToDelete.isDefault && (
                  <div className={styles.warnNotice}>
                    This is your default card. Another saved card will be set
                    as default automatically.
                  </div>
                )}
                {actionError && (
                  <div className={styles.actionError}>{actionError}</div>
                )}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setMethodToDelete(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.btnDanger}
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 size={14} className={styles.spinner} />
                    Removing…
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    Remove Card
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

export default Payments;