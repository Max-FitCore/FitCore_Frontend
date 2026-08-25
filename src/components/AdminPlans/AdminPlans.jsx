import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, AlertTriangle, CheckCircle } from 'lucide-react';
import styles from './AdminPlans.module.css';

const Plans = () => {
  // Initial plans data
  const initialPlans = [
    {
      id: 1,
      name: 'Basic',
      description: 'Everything you need to start moving.',
      price: 29,
      subscribers: 148,
      highlighted: false,
      features: [
        'Full gym floor access',
        '2 group classes / month',
        'Attendance tracking',
        'Mobile app access',
      ],
    },
    {
      id: 2,
      name: 'Premium',
      description: 'Structured training with real coaching.',
      price: 59,
      subscribers: 132,
      highlighted: true,
      features: [
        'Unlimited gym access',
        'Unlimited group classes',
        'Personalised workout plans',
        'Monthly progress review',
        'Nutrition guidance',
      ],
    },
    {
      id: 3,
      name: 'VIP',
      description: 'One-to-one performance programming.',
      price: 119,
      subscribers: 71,
      highlighted: false,
      features: [
        'Everything in Premium',
        '8 personal training sessions',
        'Priority class booking',
        'Body composition scans',
        'Recovery & sauna suite',
      ],
    },
  ];

  const [plans, setPlans] = useState(initialPlans);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    subscribers: '',
    highlighted: false,
    features: [''],
  });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle feature changes
  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData((prev) => ({ ...prev, features: newFeatures }));
  };

  // Add feature
  const addFeature = () => {
    setFormData((prev) => ({ ...prev, features: [...prev.features, ''] }));
  };

  // Remove feature
  const removeFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, features: newFeatures.length ? newFeatures : [''] }));
  };

  // Open modal for adding
  const handleAdd = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      subscribers: '',
      highlighted: false,
      features: [''],
    });
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      price: plan.price.toString(),
      subscribers: plan.subscribers.toString(),
      highlighted: plan.highlighted,
      features: plan.features.length ? [...plan.features] : [''],
    });
    setIsModalOpen(true);
  };

  // Open delete confirmation modal
  const handleDeleteClick = (plan) => {
    setPlanToDelete(plan);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (planToDelete) {
      setPlans((prev) => prev.filter((p) => p.id !== planToDelete.id));
      showToastMessage(`${planToDelete.name} plan has been removed`);
      setPlanToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setPlanToDelete(null);
    setIsDeleteModalOpen(false);
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();

    // Filter out empty features
    const filteredFeatures = formData.features.filter((f) => f.trim() !== '');

    if (editingPlan) {
      // Update existing plan
      const updatedPlan = {
        ...editingPlan,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        subscribers: parseInt(formData.subscribers) || 0,
        highlighted: formData.highlighted,
        features: filteredFeatures,
      };

      // If this plan is highlighted, remove highlight from others
      if (formData.highlighted) {
        setPlans((prev) =>
          prev.map((p) =>
            p.id === editingPlan.id ? updatedPlan : { ...p, highlighted: false }
          )
        );
      } else {
        setPlans((prev) =>
          prev.map((p) => (p.id === editingPlan.id ? updatedPlan : p))
        );
      }

      showToastMessage(`${formData.name} plan has been updated successfully`);
    } else {
      // Add new plan
      const newPlan = {
        id: Math.max(...plans.map((p) => p.id)) + 1,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        subscribers: parseInt(formData.subscribers) || 0,
        highlighted: formData.highlighted,
        features: filteredFeatures,
      };

      // If highlighted, remove highlight from others
      if (formData.highlighted) {
        setPlans((prev) =>
          prev.map((p) => ({ ...p, highlighted: false })).concat(newPlan)
        );
      } else {
        setPlans((prev) => [...prev, newPlan]);
      }

      showToastMessage(`${newPlan.name} plan has been added successfully`);
    }

    setIsModalOpen(false);
  };

  // Show toast notification
  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

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
      <div className={styles.plansGrid}>
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`${styles.planCard} ${
              plan.highlighted ? styles.planCardHighlight : ''
            }`}
          >
            {/* Delete Button */}
            <button
              className={styles.deleteBtn}
              onClick={() => handleDeleteClick(plan)}
              title="Delete plan"
            >
              <Trash2 size={16} />
            </button>

            {/* Plan Header */}
            <div className={styles.planHeader}>
              <h3 className={styles.planName}>{plan.name}</h3>
              <p className={styles.planDescription}>{plan.description}</p>
            </div>

            {/* Pricing */}
            <div className={styles.planPricing}>
              <div className={styles.planPrice}>
                <span className={styles.priceAmount}>${plan.price}</span>
                <span className={styles.pricePeriod}>/mo</span>
              </div>
              <p className={styles.planSubscribers}>
                {plan.subscribers} active subscribers
              </p>
            </div>

            {/* Features */}
            <ul className={styles.featuresList}>
              {plan.features.map((feature, index) => (
                <li key={index} className={styles.featureItem}>
                  <CheckCircle size={16} className={styles.featureIcon} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {/* Edit Button */}
            <button
              className={styles.editBtn}
              onClick={() => handleEdit(plan)}
            >
              Edit plan
            </button>
          </div>
        ))}
      </div>

      {/* Add/Edit Plan Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingPlan ? 'Edit Plan' : 'Add New Plan'}
              </h2>
              <button
                className={styles.closeBtn}
                onClick={() => setIsModalOpen(false)}
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
                    name="name"
                    className={styles.formInput}
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Premium"
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
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Active Subscribers</label>
                <input
                  type="number"
                  name="subscribers"
                  className={styles.formInput}
                  value={formData.subscribers}
                  onChange={handleInputChange}
                  placeholder="132"
                  min="0"
                />
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
                  id="highlighted"
                  name="highlighted"
                  checked={formData.highlighted}
                  onChange={handleInputChange}
                />
                <label htmlFor="highlighted">
                  Highlight this plan (featured with lime border)
                </label>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn}>
                  {editingPlan ? 'Update Plan' : 'Add Plan'}
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
              <strong>{planToDelete.name}</strong> plan? This action cannot be
              undone and may affect {planToDelete.subscribers} active
              subscribers.
            </p>

            <div className={styles.deleteModalInfo}>
              <div className={styles.deleteModalInfoItem}>
                <span className={styles.deleteModalInfoLabel}>Price:</span>
                <span className={styles.deleteModalInfoValue}>
                  ${planToDelete.price}/mo
                </span>
              </div>
              <div className={styles.deleteModalInfoItem}>
                <span className={styles.deleteModalInfoLabel}>
                  Subscribers:
                </span>
                <span className={styles.deleteModalInfoValue}>
                  {planToDelete.subscribers} active
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
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.deleteConfirmBtn}
                onClick={confirmDelete}
              >
                <Trash2 size={16} style={{ marginRight: '6px' }} />
                Delete Plan
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