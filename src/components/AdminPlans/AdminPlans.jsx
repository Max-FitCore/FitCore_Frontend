import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X, AlertTriangle, CheckCircle } from 'lucide-react';
import styles from './AdminPlans.module.css';

const API_BASE = 'http://localhost:5000/api';

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planToDelete, setPlanToDelete] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const emptyForm = {
    planName: '',
    description: '',
    price: '',
    duration: 'Monthly',
    discount: 0,
    isPopular: false,
    isActive: true,
    features: [''],
  };
  const [formData, setFormData] = useState(emptyForm);

  // ---------- Auth headers ----------
  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  // ---------- Load plans ----------
  const loadPlans = async () => {
    try {
      setLoading(true);
      setLoadError('');
      const res = await fetch(`${API_BASE}/admin/membership-plans`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to load plans');
      }
      setPlans(data.data);
    } catch (err) {
      setLoadError(err.message || 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  // ---------- Form handlers ----------
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData((prev) => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    setFormData((prev) => ({ ...prev, features: [...prev.features, ''] }));
  };

  const removeFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      features: newFeatures.length ? newFeatures : [''],
    }));
  };

  // ---------- Open modals ----------
  const handleAdd = () => {
    setEditingPlan(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      planName: plan.planName,
      description: plan.description,
      price: String(plan.price ?? ''),
      duration: plan.duration || 'Monthly',
      discount: plan.discount ?? 0,
      isPopular: !!plan.isPopular,
      isActive: plan.isActive !== false,
      features: plan.features?.length ? [...plan.features] : [''],
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (plan) => {
    setPlanToDelete(plan);
    setIsDeleteModalOpen(true);
  };

  // ---------- Submit (create / update) ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const filteredFeatures = formData.features
      .map((f) => f.trim())
      .filter(Boolean);

    if (filteredFeatures.length === 0) {
      showToastMessage('Please add at least one feature');
      return;
    }

    const payload = {
      planName: formData.planName.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price) || 0,
      duration: formData.duration,
      discount: Number(formData.discount) || 0,
      isPopular: formData.isPopular,
      isActive: formData.isActive,
      features: filteredFeatures,
    };

    try {
      setSubmitting(true);

      if (editingPlan) {
        const res = await fetch(
          `${API_BASE}/admin/membership-plans/${editingPlan._id}`,
          {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(payload),
          }
        );
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Update failed');
        }
        setPlans((prev) =>
          prev.map((p) => (p._id === editingPlan._id ? data.data : p))
        );
        showToastMessage(`${payload.planName} plan has been updated successfully`);
      } else {
        const res = await fetch(`${API_BASE}/admin/membership-plans`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Create failed');
        }
        setPlans((prev) => [...prev, data.data]);
        showToastMessage(`${payload.planName} plan has been added successfully`);
      }

      setIsModalOpen(false);
    } catch (err) {
      showToastMessage(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Delete ----------
  const confirmDelete = async () => {
    if (!planToDelete || deleting) return;
    try {
      setDeleting(true);
      const res = await fetch(
        `${API_BASE}/admin/membership-plans/${planToDelete._id}`,
        {
          method: 'DELETE',
          headers: authHeaders(),
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Delete failed');
      }
      setPlans((prev) => prev.filter((p) => p._id !== planToDelete._id));
      showToastMessage(`${planToDelete.planName} plan has been removed`);
      setPlanToDelete(null);
      setIsDeleteModalOpen(false);
    } catch (err) {
      showToastMessage(err.message || 'Failed to delete plan');
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    if (deleting) return;
    setPlanToDelete(null);
    setIsDeleteModalOpen(false);
  };

  // ---------- Toast ----------
  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // ---------- Helpers ----------
  const durationShort = (d) => {
    switch (d) {
      case 'Monthly':
        return 'mo';
      case 'Quarterly':
        return 'qtr';
      case 'Half-Yearly':
        return '6mo';
      case 'Yearly':
        return 'yr';
      default:
        return 'mo';
    }
  };

  // ---------- Render ----------
  if (loading) {
    return (
      <div className={styles.plansPage}>
        <div className={styles.stateMessage}>Loading plans…</div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={styles.plansPage}>
        <div className={`${styles.stateMessage} ${styles.stateError}`}>
          {loadError}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.plansPage}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Membership plans</h1>
          <p className={styles.subtitle}>Pricing tiers offered to members.</p>
        </div>
        <button className={styles.addBtn} onClick={handleAdd}>
          <Plus size={18} />
          New plan
        </button>
      </div>

      {/* Plans Grid */}
      {plans.length === 0 ? (
        <div className={styles.stateMessage}>
          No plans yet. Click “New plan” to create one.
        </div>
      ) : (
        <div className={styles.plansGrid}>
          {plans.map((plan) => (
            <div
              key={plan._id}
              className={`${styles.planCard} ${
                plan.isPopular ? styles.planCardHighlight : ''
              }`}
            >
              <button
                className={styles.deleteBtn}
                onClick={() => handleDeleteClick(plan)}
                title="Delete plan"
              >
                <Trash2 size={16} />
              </button>

              <div className={styles.planHeader}>
                <h3 className={styles.planName}>{plan.planName}</h3>
                <p className={styles.planDescription}>{plan.description}</p>
              </div>

              <div className={styles.planPricing}>
                <div className={styles.planPrice}>
                  <span className={styles.priceAmount}>${plan.price}</span>
                  <span className={styles.pricePeriod}>
                    /{durationShort(plan.duration)}
                  </span>
                </div>
                {plan.discount > 0 && (
                  <p className={styles.planSubscribers}>
                    {plan.discount}% discount
                  </p>
                )}
              </div>

              <ul className={styles.featuresList}>
                {plan.features.map((feature, index) => (
                  <li key={index} className={styles.featureItem}>
                    <CheckCircle size={16} className={styles.featureIcon} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={styles.editBtn}
                onClick={() => handleEdit(plan)}
              >
                Edit plan
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Plan Modal */}
      {isModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => !submitting && setIsModalOpen(false)}
        >
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingPlan ? 'Edit Plan' : 'Add New Plan'}
              </h2>
              <button
                className={styles.closeBtn}
                onClick={() => !submitting && setIsModalOpen(false)}
                disabled={submitting}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Plan Name *</label>
                  <input
                    type="text"
                    name="planName"
                    className={styles.formInput}
                    value={formData.planName}
                    onChange={handleInputChange}
                    placeholder="e.g. Premium"
                    minLength={3}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Price (USD) *</label>
                  <input
                    type="number"
                    name="price"
                    className={styles.formInput}
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="59"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Description *</label>
                <textarea
                  name="description"
                  className={styles.formTextarea}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="e.g. Structured training with real coaching."
                  rows={2}
                  maxLength={500}
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Duration</label>
                  <select
                    name="duration"
                    className={styles.formInput}
                    value={formData.duration}
                    onChange={handleInputChange}
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Half-Yearly">Half-Yearly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Discount (%)</label>
                  <input
                    type="number"
                    name="discount"
                    className={styles.formInput}
                    value={formData.discount}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Features *</label>
                <div className={styles.featuresEditor}>
                  {formData.features.map((feature, index) => (
                    <div key={index} className={styles.featureInputRow}>
                      <input
                        type="text"
                        className={styles.formInput}
                        value={feature}
                        onChange={(e) =>
                          handleFeatureChange(index, e.target.value)
                        }
                        placeholder={`Feature ${index + 1}`}
                      />
                      {formData.features.length > 1 && (
                        <button
                          type="button"
                          className={styles.removeFeatureBtn}
                          onClick={() => removeFeature(index)}
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className={styles.addFeatureBtn}
                    onClick={addFeature}
                  >
                    <Plus size={14} />
                    Add feature
                  </button>
                </div>
                <p className={styles.formHint}>
                  Add the key benefits included in this plan
                </p>
              </div>

              <div className={styles.highlightToggle}>
                <input
                  type="checkbox"
                  id="isPopular"
                  name="isPopular"
                  checked={formData.isPopular}
                  onChange={handleInputChange}
                />
                <label htmlFor="isPopular">
                  Highlight this plan (featured with lime border)
                </label>
              </div>

              <div className={styles.highlightToggle}>
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                />
                <label htmlFor="isActive">Visible to members (active)</label>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={submitting}
                >
                  {submitting
                    ? 'Saving…'
                    : editingPlan
                    ? 'Update Plan'
                    : 'Add Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && planToDelete && (
        <div className={styles.modalOverlay} onClick={cancelDelete}>
          <div
            className={styles.deleteModalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.deleteModalIcon}>
              <AlertTriangle size={48} />
            </div>

            <h2 className={styles.deleteModalTitle}>Delete Plan</h2>

            <p className={styles.deleteModalText}>
              Are you sure you want to remove the{' '}
              <strong>{planToDelete.planName}</strong> plan? This action cannot
              be undone.
            </p>

            <div className={styles.deleteModalInfo}>
              <div className={styles.deleteModalInfoItem}>
                <span className={styles.deleteModalInfoLabel}>Price:</span>
                <span className={styles.deleteModalInfoValue}>
                  ${planToDelete.price}/{durationShort(planToDelete.duration)}
                </span>
              </div>
              <div className={styles.deleteModalInfoItem}>
                <span className={styles.deleteModalInfoLabel}>Features:</span>
                <span className={styles.deleteModalInfoValue}>
                  {planToDelete.features.length} items
                </span>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={cancelDelete}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.deleteConfirmBtn}
                onClick={confirmDelete}
                disabled={deleting}
              >
                <Trash2 size={16} style={{ marginRight: '6px' }} />
                {deleting ? 'Deleting…' : 'Delete Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className={styles.toast}>
          <div className={styles.toastIcon}>
            <Check size={16} />
          </div>
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default Plans;