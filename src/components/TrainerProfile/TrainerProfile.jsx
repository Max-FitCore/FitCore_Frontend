import React, { useState, useRef, useEffect } from 'react';
import { Star, Camera, Check } from 'lucide-react';
import styles from './TrainerProfile.module.css';

const Profile = () => {
  // Initial State
  const [profileData, setProfileData] = useState({
    name: 'Marcus Vale',
    specialty: 'Strength & Powerlifting',
    certifications: 'NSCA CSCS, Precision Nutrition L1',
    availability: 'Mon–Sat · 06:00–14:00',
    bio: 'Eight years coaching barbell athletes from first squat to competition platform. I build simple, progressive programs you can actually stick to.',
    photo: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' // Placeholder image matching the vibe
  });

  const [showToast, setShowToast] = useState(false);
  const fileInputRef = useRef(null);

  // Handle Text Inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  // Handle Image Upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setProfileData(prev => ({ ...prev, photo: objectUrl }));
    }
  };

  // Trigger File Input
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Save Changes
  const handleSave = () => {
    setShowToast(true);
    // In a real app, you would send an API request here
  };

  // Auto-dismiss toast
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  return (
    <div className={styles.profilePage}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Profile</h1>
        <p className={styles.subtitle}>How members see you across FitCore.</p>
      </div>

      <div className={styles.layoutGrid}>
        {/* Left Column: Profile Card */}
        <div className={styles.profileCard}>
          <div className={styles.imageContainer} onClick={triggerFileInput}>
            <img src={profileData.photo} alt="Profile" className={styles.profileImage} />
            <div className={styles.imageOverlay}>
              <Camera size={24} />
              <span>Change photo</span>
            </div>
          </div>
          {/* Hidden File Input */}
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept="image/*" 
            onChange={handleImageChange} 
          />
          
          <div className={styles.profileInfo}>
            <h2 className={styles.profileName}>{profileData.name}</h2>
            <p className={styles.profileSpecialty}>{profileData.specialty}</p>
            <div className={styles.profileStats}>
              <Star size={16} className={styles.starIcon} fill="currentColor" />
              <span>4.9 · 34 members</span>
            </div>
          </div>
        </div>

        {/* Right Column: Coaching Details Form */}
        <div className={styles.detailsCard}>
          <h3 className={styles.sectionTitle}>Coaching details</h3>
          
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Full name</label>
              <input 
                type="text" 
                name="name"
                className={styles.formInput} 
                value={profileData.name}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Specialty</label>
              <input 
                type="text" 
                name="specialty"
                className={styles.formInput} 
                value={profileData.specialty}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Certifications</label>
              <input 
                type="text" 
                name="certifications"
                className={styles.formInput} 
                value={profileData.certifications}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Availability</label>
              <input 
                type="text" 
                name="availability"
                className={styles.formInput} 
                value={profileData.availability}
                onChange={handleInputChange}
              />
            </div>

            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.formLabel}>Bio</label>
              <textarea 
                name="bio"
                className={styles.formTextarea} 
                value={profileData.bio}
                onChange={handleInputChange}
                rows={4}
              />
            </div>
          </div>

          <button className={styles.saveBtn} onClick={handleSave}>
            Save changes
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {showToast && (
        <div className={styles.toast}>
          <div className={styles.toastIcon}>
            <Check size={16} />
          </div>
          Profile updated successfully!
        </div>
      )}
    </div>
  );
};

export default Profile;