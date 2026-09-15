import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ChevronDown, Loader2 } from 'lucide-react';
import styles from './CreatePlanModal.module.css';

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

const emptyForm = {
  name: '',
  type: 'Strength',
  level: 'Intermediate',
  description: '',
  sessions: 12,
  sessionsPerWeek: 3,
  days: [],
  image: '💪',
};

const CreatePlanModal = ({ isOpen, onClose, onPlanCreated }) => {
  const [formData, setFormData] = useState(emptyForm);
  const [dayInput, setDayInput] = useState({ day: '', focus: '', exercises: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const planTypes = ['Strength', 'Cardio', 'Flexibility', 'Cross Training', 'HIIT', 'Yoga', 'Pilates'];
  const levels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
  const emojis = ['💪', '🔥', '🧘', '⚡', '🏋️', '🚴', '💃', '🥊', '🏃', '🧗'];
  const dayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    if (submitError) setSubmitError('');
  };

  // ---------- Day handlers ----------
  const handleAddDay = () => {
    if (!dayInput.day.trim() || !dayInput.focus.trim()) {
      setErrors((prev) => ({ ...prev, day: 'Day and focus are required' }));
      return;
    }

    const exercises = dayInput.exercises
      .split('\n')
      .map((e) => e.trim())
      .filter(Boolean);

    if (exercises.length === 0) {
      setErrors((prev) => ({ ...prev, day: 'Add at least one exercise' }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      days: [...prev.days, { day: dayInput.day, focus: dayInput.focus, exercises }],
    }));
    setDayInput({ day: '', focus: '', exercises: '' });
    setErrors((prev) => ({ ...prev, day: '', days: '' }));
  };

  const handleRemoveDay = (index) => {
    setFormData((prev) => ({
      ...prev,
      days: prev.days.filter((_, i) => i !== index),
    }));
  };

  // ---------- Validation ----------
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Plan name is required';
    else if (formData.name.trim().length < 3)
      newErrors.name = 'Plan name must be at least 3 characters';

    if (!formData.sessions || formData.sessions < 1)
      newErrors.sessions = 'Sessions must be at least 1';

    if (!formData.sessionsPerWeek || formData.sessionsPerWeek < 1)
      newErrors.sessionsPerWeek = 'Sessions per week must be at least 1';
    else if (formData.sessionsPerWeek > 7)
      newErrors.sessionsPerWeek = 'Sessions per week cannot exceed 7';

    if (formData.days.length === 0)
      newErrors.days = 'Add at least one workout day';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---------- Submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!validateForm()) return;

    const payload = {
      planName: formData.name.trim(),
      planType: formData.type,
      planLevel: formData.level,
      totalSessions: Number(formData.sessions),
      sessionsPerWeek: Number(formData.sessionsPerWeek),
      description: formData.description.trim() || null,
      planIcon: formData.image,
      workoutDays: formData.days.map((d) => ({
        day: d.day,
        focus: d.focus,
        exercises: d.exercises,
      })),
    };

    try {
      setSubmitting(true);
      setSubmitError('');

      const res = await fetch(`${API_BASE}/workout-plans/create`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await parseResponse(res);

      if (!res.ok || !data.success) {
        throw new Error(data.message || `Failed to create plan (${res.status})`);
      }

      if (typeof onPlanCreated === 'function') {
        onPlanCreated(data.data);
      }

      resetForm();
      onClose();
    } catch (err) {
      setSubmitError(err.message || 'Failed to create plan');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setDayInput({ day: '', focus: '', exercises: '' });
    setErrors({});
    setSubmitError('');
  };

  const handleClose = () => {
    if (submitting) return;
    resetForm();
    onClose();
  };

  useEffect(() => {
    if (isOpen) resetForm();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Create Workout Plan</h2>
            <p className={styles.modalSubtitle}>Design a custom workout program</p>
          </div>
          <button
            className={styles.modalClose}
            onClick={handleClose}
            disabled={submitting}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalBody}>
          {/* Plan Name */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Plan Name <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Summer Strength Program"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`${styles.formInput} ${errors.name ? styles.inputError : ''}`}
              disabled={submitting}
              minLength={3}
            />
            {errors.name && <span className={styles.errorMessage}>{errors.name}</span>}
          </div>

          <div className={styles.formRow}>
            {/* Type */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Plan Type</label>
              <div className={styles.selectWrapper}>
                <select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className={styles.formSelect}
                  disabled={submitting}
                >
                  {planTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <ChevronDown size={16} className={styles.selectIcon} />
              </div>
            </div>

            {/* Level */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Level</label>
              <div className={styles.selectWrapper}>
                <select
                  value={formData.level}
                  onChange={(e) => handleChange('level', e.target.value)}
                  className={styles.formSelect}
                  disabled={submitting}
                >
                  {levels.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                <ChevronDown size={16} className={styles.selectIcon} />
              </div>
            </div>
          </div>

          <div className={styles.formRow}>
            {/* Total Sessions */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Total Sessions <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.sessions}
                onChange={(e) =>
                  handleChange('sessions', parseInt(e.target.value) || 0)
                }
                className={`${styles.formInput} ${errors.sessions ? styles.inputError : ''}`}
                disabled={submitting}
              />
              {errors.sessions && <span className={styles.errorMessage}>{errors.sessions}</span>}
            </div>

            {/* Sessions Per Week */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Sessions Per Week <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                min="1"
                max="7"
                value={formData.sessionsPerWeek}
                onChange={(e) =>
                  handleChange('sessionsPerWeek', parseInt(e.target.value) || 0)
                }
                className={`${styles.formInput} ${errors.sessionsPerWeek ? styles.inputError : ''}`}
                disabled={submitting}
              />
              {errors.sessionsPerWeek && (
                <span className={styles.errorMessage}>{errors.sessionsPerWeek}</span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Description</label>
            <textarea
              placeholder="Describe the workout plan, its goals, and what participants can expect…"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className={styles.formTextarea}
              rows={3}
              maxLength={500}
              disabled={submitting}
            />
          </div>

          {/* Add Days */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Workout Days <span className={styles.required}>*</span>
            </label>
            <div className={styles.dayInputGroup}>
              <div className={styles.dayInputRow}>
                <div className={styles.daySelectWrapper}>
                  <select
                    value={dayInput.day}
                    onChange={(e) => setDayInput({ ...dayInput, day: e.target.value })}
                    className={`${styles.formSelect} ${styles.daySelect}`}
                    disabled={submitting}
                  >
                    <option value="">Select Day</option>
                    {dayOptions.map((day) => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className={styles.selectIcon} />
                </div>
                <input
                  type="text"
                  placeholder="Focus (e.g., Chest & Triceps)"
                  value={dayInput.focus}
                  onChange={(e) => setDayInput({ ...dayInput, focus: e.target.value })}
                  className={`${styles.formInput} ${styles.dayFocusInput}`}
                  disabled={submitting}
                />
              </div>
              <textarea
                placeholder={"Exercises (one per line)\ne.g., Barbell Bench Press\nTriceps Pushdown"}
                value={dayInput.exercises}
                onChange={(e) => setDayInput({ ...dayInput, exercises: e.target.value })}
                className={`${styles.formTextarea} ${styles.dayExercisesInput}`}
                rows={3}
                disabled={submitting}
              />
              <button
                type="button"
                onClick={handleAddDay}
                className={styles.addDayBtn}
                disabled={submitting}
              >
                <Plus size={18} />
                Add Day
              </button>
              {errors.day && <span className={styles.errorMessage}>{errors.day}</span>}
            </div>

            {/* Existing Days */}
            {formData.days.length > 0 && (
              <div className={styles.daysList}>
                {formData.days.map((day, index) => (
                  <div key={index} className={styles.dayItem}>
                    <div className={styles.dayItemHeader}>
                      <span className={styles.dayItemTitle}>
                        {day.day} — {day.focus}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDay(index)}
                        className={styles.removeDay}
                        disabled={submitting}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className={styles.dayItemExercises}>
                      {day.exercises.map((exercise, exIndex) => (
                        <span key={exIndex} className={styles.dayItemExercise}>
                          {exercise}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {errors.days && <span className={styles.errorMessage}>{errors.days}</span>}
              </div>
            )}
          </div>

          {/* Emoji/Icon */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Plan Icon</label>
            <div className={styles.emojiGrid}>
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className={`${styles.emojiOption} ${
                    formData.image === emoji ? styles.emojiSelected : ''
                  }`}
                  onClick={() => handleChange('image', emoji)}
                  disabled={submitting}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Submit error banner */}
          {submitError && (
            <div className={styles.submitError}>
              <span>{submitError}</span>
            </div>
          )}

          {/* Form Actions */}
          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={handleClose}
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
                  <Loader2 size={16} className={styles.spinner} />
                  Creating…
                </>
              ) : (
                'Create Plan'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePlanModal;