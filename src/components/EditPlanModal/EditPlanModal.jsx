import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import styles from './EditPlanModal.module.css';

const EditPlanModal = ({ isOpen, onClose, plan, onUpdatePlan }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Strength',
    level: 'Intermediate',
    trainer: '',
    duration: '8 weeks',
    sessions: 12,
    sessionsPerWeek: 3,
    description: '',
    schedule: [],
    days: [],
    image: '💪',
    difficulty: 'Intermediate',
  });

  const [scheduleInput, setScheduleInput] = useState('');
  const [dayInput, setDayInput] = useState({ day: '', focus: '', exercises: '' });
  const [errors, setErrors] = useState({});

  const planTypes = ['Strength', 'Cardio', 'Flexibility', 'Cross Training', 'HIIT', 'Yoga', 'Pilates'];
  const levels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
  const emojis = ['💪', '🔥', '🧘', '⚡', '🏋️', '🚴', '💃', '🥊', '🏃', '🧗'];
  const dayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Load plan data when modal opens
  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name || '',
        type: plan.type || 'Strength',
        level: plan.level || plan.difficulty || 'Intermediate',
        trainer: plan.trainer || '',
        duration: plan.duration || '8 weeks',
        sessions: plan.sessions || 12,
        sessionsPerWeek: plan.sessionsPerWeek || 3,
        description: plan.description || '',
        schedule: plan.schedule || [],
        days: plan.days || [],
        image: plan.image || '💪',
        difficulty: plan.difficulty || plan.level || 'Intermediate',
      });
    }
  }, [plan]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Schedule handlers
  const handleAddScheduleDay = () => {
    if (!scheduleInput.trim()) return;
    if (!formData.schedule.includes(scheduleInput.trim())) {
      setFormData(prev => ({
        ...prev,
        schedule: [...prev.schedule, scheduleInput.trim()]
      }));
    }
    setScheduleInput('');
  };

  const handleRemoveScheduleDay = (day) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.filter(d => d !== day)
    }));
  };

  const handleScheduleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddScheduleDay();
    }
  };

  // Day handlers
  const handleAddDay = () => {
    if (!dayInput.day.trim() || !dayInput.focus.trim()) {
      setErrors(prev => ({ ...prev, day: 'Day and focus are required' }));
      return;
    }

    const exercises = dayInput.exercises
      .split('\n')
      .filter(e => e.trim())
      .map(e => e.trim());

    if (exercises.length === 0) {
      setErrors(prev => ({ ...prev, day: 'Add at least one exercise' }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      days: [...prev.days, {
        day: dayInput.day,
        focus: dayInput.focus,
        exercises: exercises
      }]
    }));

    setDayInput({ day: '', focus: '', exercises: '' });
    setErrors(prev => ({ ...prev, day: '' }));
  };

  const handleRemoveDay = (index) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Plan name is required';
    if (!formData.trainer.trim()) newErrors.trainer = 'Trainer name is required';
    if (!formData.duration.trim()) newErrors.duration = 'Duration is required';
    if (formData.sessions < 1) newErrors.sessions = 'Sessions must be at least 1';
    if (formData.sessionsPerWeek < 1) newErrors.sessionsPerWeek = 'Sessions per week must be at least 1';
    if (formData.days.length === 0) newErrors.days = 'Add at least one workout day';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const updatedPlan = {
        ...plan,
        ...formData,
        difficulty: formData.level,
        progress: plan?.progress || 0,
      };
      onUpdatePlan(updatedPlan);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Edit Workout Plan</h2>
            <p className={styles.modalSubtitle}>Update your workout program</p>
          </div>
          <button className={styles.modalClose} onClick={handleClose}>
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
            />
            {errors.name && <span className={styles.errorMessage}>{errors.name}</span>}
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Plan Type</label>
              <div className={styles.selectWrapper}>
                <select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className={styles.formSelect}
                >
                  {planTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <ChevronDown size={16} className={styles.selectIcon} />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Level</label>
              <div className={styles.selectWrapper}>
                <select
                  value={formData.level}
                  onChange={(e) => handleChange('level', e.target.value)}
                  className={styles.formSelect}
                >
                  {levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                <ChevronDown size={16} className={styles.selectIcon} />
              </div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Trainer <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Mike Chen"
              value={formData.trainer}
              onChange={(e) => handleChange('trainer', e.target.value)}
              className={`${styles.formInput} ${errors.trainer ? styles.inputError : ''}`}
            />
            {errors.trainer && <span className={styles.errorMessage}>{errors.trainer}</span>}
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Duration <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., 8 weeks"
                value={formData.duration}
                onChange={(e) => handleChange('duration', e.target.value)}
                className={`${styles.formInput} ${errors.duration ? styles.inputError : ''}`}
              />
              {errors.duration && <span className={styles.errorMessage}>{errors.duration}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Total Sessions</label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.sessions}
                onChange={(e) => handleChange('sessions', parseInt(e.target.value) || 0)}
                className={`${styles.formInput} ${errors.sessions ? styles.inputError : ''}`}
              />
              {errors.sessions && <span className={styles.errorMessage}>{errors.sessions}</span>}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Sessions Per Week</label>
              <input
                type="number"
                min="1"
                max="7"
                value={formData.sessionsPerWeek}
                onChange={(e) => handleChange('sessionsPerWeek', parseInt(e.target.value) || 0)}
                className={`${styles.formInput} ${errors.sessionsPerWeek ? styles.inputError : ''}`}
              />
              {errors.sessionsPerWeek && <span className={styles.errorMessage}>{errors.sessionsPerWeek}</span>}
            </div>
          </div>

          {/* Schedule */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Schedule Days</label>
            <div className={styles.scheduleInput}>
              <input
                type="text"
                placeholder="e.g., Mon, Wed, Fri"
                value={scheduleInput}
                onChange={(e) => setScheduleInput(e.target.value)}
                onKeyDown={handleScheduleKeyDown}
                className={styles.formInput}
              />
              <button
                type="button"
                onClick={handleAddScheduleDay}
                className={styles.addScheduleBtn}
              >
                <Plus size={18} />
              </button>
            </div>
            {formData.schedule.length > 0 && (
              <div className={styles.scheduleTags}>
                {formData.schedule.map((day) => (
                  <span key={day} className={styles.scheduleTag}>
                    {day}
                    <button
                      type="button"
                      onClick={() => handleRemoveScheduleDay(day)}
                      className={styles.removeSchedule}
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Description</label>
            <textarea
              placeholder="Describe the workout plan..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className={styles.formTextarea}
              rows={3}
            />
          </div>

          {/* Workout Days */}
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
                  >
                    <option value="">Select Day</option>
                    {dayOptions.map(day => (
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
                />
              </div>
              <textarea
                placeholder="Exercises (one per line)&#10;e.g., Bench Press · 4 × 8-10"
                value={dayInput.exercises}
                onChange={(e) => setDayInput({ ...dayInput, exercises: e.target.value })}
                className={`${styles.formTextarea} ${styles.dayExercisesInput}`}
                rows={3}
              />
              <button
                type="button"
                onClick={handleAddDay}
                className={styles.addDayBtn}
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

          {/* Emoji */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Plan Icon</label>
            <div className={styles.emojiGrid}>
              {emojis.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  className={`${styles.emojiOption} ${formData.image === emoji ? styles.emojiSelected : ''}`}
                  onClick={() => handleChange('image', emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className={styles.modalFooter}>
            <button type="button" className={styles.btnSecondary} onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className={styles.btnPrimary}>
              Update Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPlanModal;