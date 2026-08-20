import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  ChevronDown,
  AlertCircle,
  Dumbbell,
  Clock,
  Users,
  Target,
  Calendar
} from 'lucide-react';
import styles from './CreatePlanModal.module.css';

const CreatePlanModal = ({ isOpen, onClose, onCreatePlan }) => {
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
    exercises: [],
    image: '💪'
  });

  const [exerciseInput, setExerciseInput] = useState({
    name: '',
    sets: 3,
    reps: '8-10',
    weight: 'Bodyweight'
  });
  const [scheduleInput, setScheduleInput] = useState('');
  const [errors, setErrors] = useState({});

  const planTypes = ['Strength', 'Cardio', 'Flexibility', 'Cross Training', 'HIIT', 'Yoga', 'Pilates'];
  const levels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
  const emojis = ['💪', '🔥', '🧘', '⚡', '🏋️', '🚴', '💃', '🥊', '🏃', '🧗'];
  const dayOptions = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddExercise = () => {
    if (!exerciseInput.name.trim()) {
      setErrors(prev => ({ ...prev, exercise: 'Exercise name is required' }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      exercises: [...prev.exercises, { ...exerciseInput, id: Date.now() }]
    }));
    setExerciseInput({
      name: '',
      sets: 3,
      reps: '8-10',
      weight: 'Bodyweight'
    });
    setErrors(prev => ({ ...prev, exercise: '' }));
  };

  const handleRemoveExercise = (id) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.filter(e => e.id !== id)
    }));
  };

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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Plan name is required';
    if (!formData.trainer.trim()) newErrors.trainer = 'Trainer name is required';
    if (!formData.duration.trim()) newErrors.duration = 'Duration is required';
    if (formData.sessions < 1) newErrors.sessions = 'Sessions must be at least 1';
    if (formData.sessionsPerWeek < 1) newErrors.sessionsPerWeek = 'Sessions per week must be at least 1';
    if (formData.exercises.length === 0) newErrors.exercises = 'Add at least one exercise';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const planData = {
        ...formData,
        // Add additional fields for the plan
        status: 'active',
        progress: 0,
        completedSessions: 0,
        nextSession: 'Today',
        members: 0,
        rating: 0
      };
      onCreatePlan(planData);
      onClose();
      // Reset form
      setFormData({
        name: '',
        type: 'Strength',
        level: 'Intermediate',
        trainer: '',
        duration: '8 weeks',
        sessions: 12,
        sessionsPerWeek: 3,
        description: '',
        schedule: [],
        exercises: [],
        image: '💪'
      });
      setExerciseInput({
        name: '',
        sets: 3,
        reps: '8-10',
        weight: 'Bodyweight'
      });
      setScheduleInput('');
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
            <h2 className={styles.modalTitle}>Create Workout Plan</h2>
            <p className={styles.modalSubtitle}>Design a custom workout program</p>
          </div>
          <button 
            className={styles.modalClose}
            onClick={handleClose}
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
                >
                  {planTypes.map(type => (
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
                >
                  {levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                <ChevronDown size={16} className={styles.selectIcon} />
              </div>
            </div>
          </div>

          {/* Trainer */}
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
            {/* Duration */}
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

            {/* Total Sessions */}
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
            {/* Sessions Per Week */}
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
              placeholder="Describe the workout plan, its goals, and what participants can expect..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className={styles.formTextarea}
              rows={3}
            />
          </div>

          {/* Exercises */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Exercises <span className={styles.required}>*</span>
            </label>
            <div className={styles.exerciseInputGroup}>
              <div className={styles.exerciseInputRow}>
                <input
                  type="text"
                  placeholder="Exercise name"
                  value={exerciseInput.name}
                  onChange={(e) => setExerciseInput({ ...exerciseInput, name: e.target.value })}
                  className={`${styles.formInput} ${styles.exerciseNameInput}`}
                />
                <input
                  type="number"
                  placeholder="Sets"
                  value={exerciseInput.sets}
                  onChange={(e) => setExerciseInput({ ...exerciseInput, sets: parseInt(e.target.value) || 0 })}
                  className={`${styles.formInput} ${styles.exerciseSmallInput}`}
                />
                <input
                  type="text"
                  placeholder="Reps"
                  value={exerciseInput.reps}
                  onChange={(e) => setExerciseInput({ ...exerciseInput, reps: e.target.value })}
                  className={`${styles.formInput} ${styles.exerciseSmallInput}`}
                />
                <input
                  type="text"
                  placeholder="Weight"
                  value={exerciseInput.weight}
                  onChange={(e) => setExerciseInput({ ...exerciseInput, weight: e.target.value })}
                  className={`${styles.formInput} ${styles.exerciseSmallInput}`}
                />
                <button
                  type="button"
                  onClick={handleAddExercise}
                  className={styles.addExerciseBtn}
                >
                  <Plus size={18} />
                </button>
              </div>
              {errors.exercise && <span className={styles.errorMessage}>{errors.exercise}</span>}
            </div>
            
            {formData.exercises.length > 0 && (
              <div className={styles.exerciseList}>
                {formData.exercises.map((exercise) => (
                  <div key={exercise.id} className={styles.exerciseItem}>
                    <div className={styles.exerciseInfo}>
                      <span className={styles.exerciseName}>{exercise.name}</span>
                      <span className={styles.exerciseDetails}>
                        {exercise.sets} sets × {exercise.reps} · {exercise.weight}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(exercise.id)}
                      className={styles.removeExercise}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {errors.exercises && <span className={styles.errorMessage}>{errors.exercises}</span>}
              </div>
            )}
          </div>

          {/* Emoji/Icon */}
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

          {/* Form Actions */}
          <div className={styles.modalFooter}>
            <button 
              type="button"
              className={styles.btnSecondary}
              onClick={handleClose}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className={styles.btnPrimary}
            >
              Create Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePlanModal;