import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  AlertCircle,
  Plus,
  Trash2,
  ChevronDown
} from 'lucide-react';
import styles from './CreateClassModal.module.css';

const CreateClassModal = ({ isOpen, onClose, onCreateClass }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Cardio',
    level: 'All Levels',
    instructor: '',
    date: '',
    time: '',
    duration: 45,
    capacity: 20,
    location: '',
    description: '',
    equipment: [],
    image: '🏋️'
  });

  const [equipmentInput, setEquipmentInput] = useState('');
  const [errors, setErrors] = useState({});

  const classTypes = ['Cardio', 'Strength', 'Flexibility', 'Combat', 'Cross Training'];
  const levels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
  const locations = ['Studio A', 'Studio B', 'Weight Room', 'Cycle Studio', 'Boxing Ring', 'Main Floor'];
  const emojis = ['🏋️', '🔥', '🧘', '🥊', '💪', '🚴', '💃', '⚡'];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddEquipment = () => {
    if (equipmentInput.trim() && !formData.equipment.includes(equipmentInput.trim())) {
      setFormData(prev => ({
        ...prev,
        equipment: [...prev.equipment, equipmentInput.trim()]
      }));
      setEquipmentInput('');
    }
  };

  const handleRemoveEquipment = (item) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.filter(e => e !== item)
    }));
  };

  const handleEquipmentKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEquipment();
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Class name is required';
    if (!formData.instructor.trim()) newErrors.instructor = 'Instructor name is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.time) newErrors.time = 'Time is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (formData.capacity < 1) newErrors.capacity = 'Capacity must be at least 1';
    if (formData.duration < 5) newErrors.duration = 'Duration must be at least 5 minutes';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Format the date and time for submission
      const classData = {
        ...formData,
        date: formData.date,
        time: formData.time,
        // Add additional fields for the class
        booked: 0,
        waitlist: 0,
        isBooked: false,
        isWaitlisted: false,
        rating: 0,
        reviews: 0
      };
      onCreateClass(classData);
      onClose();
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
            <h2 className={styles.modalTitle}>Create New Class</h2>
            <p className={styles.modalSubtitle}>Add a new class to the schedule</p>
          </div>
          <button 
            className={styles.modalClose}
            onClick={handleClose}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalBody}>
          {/* Class Name */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Class Name <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Morning HIIT Blast"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`${styles.formInput} ${errors.name ? styles.inputError : ''}`}
            />
            {errors.name && <span className={styles.errorMessage}>{errors.name}</span>}
          </div>

          <div className={styles.formRow}>
            {/* Type */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Class Type</label>
              <div className={styles.selectWrapper}>
                <select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className={styles.formSelect}
                >
                  {classTypes.map(type => (
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

          {/* Instructor */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Instructor <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Sarah Johnson"
              value={formData.instructor}
              onChange={(e) => handleChange('instructor', e.target.value)}
              className={`${styles.formInput} ${errors.instructor ? styles.inputError : ''}`}
            />
            {errors.instructor && <span className={styles.errorMessage}>{errors.instructor}</span>}
          </div>

          <div className={styles.formRow}>
            {/* Date */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Date <span className={styles.required}>*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className={`${styles.formInput} ${errors.date ? styles.inputError : ''}`}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.date && <span className={styles.errorMessage}>{errors.date}</span>}
            </div>

            {/* Time */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Time <span className={styles.required}>*</span>
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => handleChange('time', e.target.value)}
                className={`${styles.formInput} ${errors.time ? styles.inputError : ''}`}
              />
              {errors.time && <span className={styles.errorMessage}>{errors.time}</span>}
            </div>
          </div>

          <div className={styles.formRow}>
            {/* Duration */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Duration (minutes)</label>
              <input
                type="number"
                min="5"
                max="180"
                step="5"
                value={formData.duration}
                onChange={(e) => handleChange('duration', parseInt(e.target.value) || 0)}
                className={`${styles.formInput} ${errors.duration ? styles.inputError : ''}`}
              />
              {errors.duration && <span className={styles.errorMessage}>{errors.duration}</span>}
            </div>

            {/* Capacity */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Capacity</label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.capacity}
                onChange={(e) => handleChange('capacity', parseInt(e.target.value) || 0)}
                className={`${styles.formInput} ${errors.capacity ? styles.inputError : ''}`}
              />
              {errors.capacity && <span className={styles.errorMessage}>{errors.capacity}</span>}
            </div>
          </div>

          {/* Location */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Location <span className={styles.required}>*</span>
            </label>
            <div className={styles.selectWrapper}>
              <select
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className={`${styles.formSelect} ${errors.location ? styles.inputError : ''}`}
              >
                <option value="">Select a location</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
              <ChevronDown size={16} className={styles.selectIcon} />
            </div>
            {errors.location && <span className={styles.errorMessage}>{errors.location}</span>}
          </div>

          {/* Description */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Description</label>
            <textarea
              placeholder="Describe the class, its benefits, and what participants can expect..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className={styles.formTextarea}
              rows={3}
            />
          </div>

          {/* Equipment */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Equipment Needed</label>
            <div className={styles.equipmentInput}>
              <input
                type="text"
                placeholder="e.g., Yoga Mat, Dumbbells"
                value={equipmentInput}
                onChange={(e) => setEquipmentInput(e.target.value)}
                onKeyDown={handleEquipmentKeyDown}
                className={styles.formInput}
              />
              <button
                type="button"
                onClick={handleAddEquipment}
                className={styles.addEquipmentBtn}
              >
                <Plus size={18} />
              </button>
            </div>
            {formData.equipment.length > 0 && (
              <div className={styles.equipmentTags}>
                {formData.equipment.map((item, index) => (
                  <span key={index} className={styles.equipmentTag}>
                    {item}
                    <button
                      type="button"
                      onClick={() => handleRemoveEquipment(item)}
                      className={styles.removeEquipment}
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Emoji/Icon */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Class Icon</label>
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
              Create Class
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClassModal;