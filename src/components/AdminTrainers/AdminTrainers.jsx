import React, { useState, useRef } from 'react';
import { Plus, Edit2, Calendar, Trash2, Star, Users, Check, X, AlertTriangle, Upload, Image as ImageIcon } from 'lucide-react';
import styles from './AdminTrainers.module.css';

const Trainers = () => {
  // Initial trainers data
  const initialTrainers = [
    {
      id: 1,
      name: 'Marcus Vale',
      specialty: 'Strength & Powerlifting',
      experience: '8 years experience',
      rating: 4.9,
      members: 34,
      photo: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 2,
      name: 'Elena Rossi',
      specialty: 'Mobility & Conditioning',
      experience: '6 years experience',
      rating: 4.8,
      members: 28,
      photo: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 3,
      name: 'Dario Khan',
      specialty: 'HIIT & Fat Loss',
      experience: '10 years experience',
      rating: 5.0,
      members: 41,
      photo: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    },
  ];

  const [trainers, setTrainers] = useState(initialTrainers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState(null);
  const [trainerToDelete, setTrainerToDelete] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    experience: '',
    rating: 4.5,
    members: 0,
    photo: null,
  });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle photo file upload
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showToastMessage('Please upload an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToastMessage('Image size should be less than 5MB');
        return;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
      setFormData((prev) => ({ ...prev, photo: file }));
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Remove photo
  const removePhoto = () => {
    setPhotoPreview(null);
    setFormData((prev) => ({ ...prev, photo: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Open modal for adding
  const handleAdd = () => {
    setEditingTrainer(null);
    setFormData({
      name: '',
      specialty: '',
      experience: '',
      rating: 4.5,
      members: 0,
      photo: null,
    });
    setPhotoPreview(null);
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleEdit = (trainer) => {
    setEditingTrainer(trainer);
    setFormData({ 
      name: trainer.name,
      specialty: trainer.specialty,
      experience: trainer.experience,
      rating: trainer.rating,
      members: trainer.members,
      photo: null,
    });
    setPhotoPreview(trainer.photo);
    setIsModalOpen(true);
  };

  // Open delete confirmation modal
  const handleDeleteClick = (trainer) => {
    setTrainerToDelete(trainer);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (trainerToDelete) {
      setTrainers((prev) => prev.filter((t) => t.id !== trainerToDelete.id));
      showToastMessage(`${trainerToDelete.name} has been removed`);
      setTrainerToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setTrainerToDelete(null);
    setIsDeleteModalOpen(false);
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingTrainer) {
      // Update existing trainer
      const updatedTrainer = {
        ...formData,
        id: editingTrainer.id,
        rating: parseFloat(formData.rating),
        members: parseInt(formData.members) || 0,
        photo: photoPreview || editingTrainer.photo,
      };
      
      setTrainers((prev) =>
        prev.map((t) => (t.id === editingTrainer.id ? updatedTrainer : t))
      );
      showToastMessage(`${formData.name} has been updated successfully`);
    } else {
      // Add new trainer
      const newTrainer = {
        ...formData,
        id: Math.max(...trainers.map((t) => t.id)) + 1,
        rating: parseFloat(formData.rating),
        members: parseInt(formData.members) || 0,
        photo: photoPreview || 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      };
      
      setTrainers((prev) => [...prev, newTrainer]);
      showToastMessage(`${newTrainer.name} has been invited successfully`);
    }
    
    // Clean up preview URL
    if (photoPreview && photoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(photoPreview);
    }
    
    setIsModalOpen(false);
  };

  // Show toast notification
  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Handle schedule click (placeholder)
  const handleSchedule = (trainer) => {
    showToastMessage(`Viewing schedule for ${trainer.name}`);
  };

  return (
    <div className={styles.trainersPage}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Trainers</h1>
          <p className={styles.subtitle}>Coaching staff and their current workload.</p>
        </div>
        <button className={styles.inviteBtn} onClick={handleAdd}>
          <Plus size={18} />
          Invite trainer
        </button>
      </div>

      {/* Trainers Grid */}
      <div className={styles.trainersGrid}>
        {trainers.map((trainer) => (
          <div key={trainer.id} className={styles.trainerCard}>
            {/* Delete Button */}
            <button
              className={styles.deleteBtn}
              onClick={() => handleDeleteClick(trainer)}
              title="Delete trainer"
            >
              <Trash2 size={16} />
            </button>

            {/* Image */}
            <div className={styles.imageContainer}>
              <img
                src={trainer.photo}
                alt={trainer.name}
                className={styles.trainerImage}
              />
            </div>

            {/* Info */}
            <div className={styles.trainerInfo}>
              <h3 className={styles.trainerName}>{trainer.name}</h3>
              <p className={styles.trainerSpecialty}>{trainer.specialty}</p>
              <p className={styles.trainerExperience}>{trainer.experience}</p>

              <div className={styles.trainerStats}>
                <div className={styles.rating}>
                  <Star size={16} className={styles.starIcon} fill="currentColor" />
                  <span>{trainer.rating}</span>
                </div>
                <div className={styles.membersCount}>
                  <Users size={16} className={styles.userIcon} />
                  <span>{trainer.members} members</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={styles.actionButtons}>
                <button
                  className={`${styles.actionBtn} ${styles.editBtn}`}
                  onClick={() => handleEdit(trainer)}
                >
                  <Edit2 size={14} style={{ marginRight: '4px' }} />
                  Edit
                </button>
                <button
                  className={`${styles.actionBtn} ${styles.scheduleBtn}`}
                  onClick={() => handleSchedule(trainer)}
                >
                  <Calendar size={14} style={{ marginRight: '4px' }} />
                  Schedule
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Trainer Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingTrainer ? 'Edit Trainer' : 'Invite New Trainer'}
              </h2>
              <button 
                className={styles.closeBtn} 
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.formSection}>
                <h3 className={styles.formSectionTitle}>Personal Information</h3>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    className={styles.formInput}
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. John Smith"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Specialty *</label>
                  <input
                    type="text"
                    name="specialty"
                    className={styles.formInput}
                    value={formData.specialty}
                    onChange={handleInputChange}
                    placeholder="e.g. Strength & Powerlifting"
                    required
                  />
                </div>
              </div>

              <div className={styles.formSection}>
                <h3 className={styles.formSectionTitle}>Professional Details</h3>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Experience *</label>
                    <input
                      type="text"
                      name="experience"
                      className={styles.formInput}
                      value={formData.experience}
                      onChange={handleInputChange}
                      placeholder="e.g. 5 years"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Rating</label>
                    <select
                      name="rating"
                      className={styles.formSelect}
                      value={formData.rating}
                      onChange={handleInputChange}
                    >
                      <option value="5.0">5.0 - Excellent</option>
                      <option value="4.9">4.9</option>
                      <option value="4.8">4.8</option>
                      <option value="4.7">4.7</option>
                      <option value="4.6">4.6</option>
                      <option value="4.5">4.5 - Good</option>
                      <option value="4.0">4.0</option>
                      <option value="3.5">3.5</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Current Members</label>
                  <input
                    type="number"
                    name="members"
                    className={styles.formInput}
                    value={formData.members}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className={styles.formSection}>
                <h3 className={styles.formSectionTitle}>Profile Photo</h3>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Upload Photo</label>
                  
                  {/* Photo Upload Area */}
                  <div className={styles.photoUploadContainer}>
                    {photoPreview ? (
                      <div className={styles.photoPreviewWrapper}>
                        <img 
                          src={photoPreview} 
                          alt="Preview" 
                          className={styles.photoPreview}
                        />
                        <button
                          type="button"
                          className={styles.removePhotoBtn}
                          onClick={removePhoto}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div 
                        className={styles.photoUploadBox}
                        onClick={triggerFileInput}
                      >
                        <ImageIcon size={40} className={styles.uploadIcon} />
                        <p className={styles.uploadText}>Click to upload photo</p>
                        <p className={styles.uploadHint}>PNG, JPG up to 5MB</p>
                      </div>
                    )}
                    
                    {/* Hidden File Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className={styles.hiddenFileInput}
                    />
                  </div>
                </div>
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
                  {editingTrainer ? 'Update Trainer' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && trainerToDelete && (
        <div className={styles.modalOverlay} onClick={cancelDelete}>
          <div className={styles.deleteModalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.deleteModalIcon}>
              <AlertTriangle size={48} />
            </div>
            
            <h2 className={styles.deleteModalTitle}>Delete Trainer</h2>
            
            <p className={styles.deleteModalText}>
              Are you sure you want to remove <strong>{trainerToDelete.name}</strong>? 
              This action cannot be undone and will remove all associated data.
            </p>

            <div className={styles.deleteModalWarning}>
              <p>⚠️ This will affect {trainerToDelete.members} assigned members</p>
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
                Delete Trainer
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

export default Trainers;