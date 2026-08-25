import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import styles from './AdminSettings.module.css';

const Settings = () => {
  // Gym profile state
  const [gymProfile, setGymProfile] = useState({
    name: 'FitCore Downtown',
    address: '12 Nile Corniche, Cairo',
    openingHours: 'Mon–Sun · 05:00–23:00',
    about: 'Premium strength and conditioning facility.',
  });

  // Booking rules state
  const [bookingRules, setBookingRules] = useState({
    bookingWindow: 7,
    cancellationCutoff: 4,
    allowWaitlists: true,
    autoCharge: true,
    emailOnFailure: true,
    weeklySummary: true,
  });

  const [showToast, setShowToast] = useState(false);

  // Handle gym profile changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setGymProfile((prev) => ({ ...prev, [name]: value }));
  };

  // Handle booking rules changes
  const handleRulesChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBookingRules((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle toggle changes
  const handleToggleChange = (name) => {
    setBookingRules((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  // Save settings
  const handleSave = () => {
    setShowToast(true);
    // In a real app, you would send an API request here
    console.log('Saving settings:', { gymProfile, bookingRules });
  };

  // Auto-dismiss toast
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  return (
    <div className={styles.settingsPage}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Gym profile, rules and notifications.</p>
      </div>

      {/* Settings Grid */}
      <div className={styles.settingsGrid}>
        {/* Gym Profile Card */}
        <div className={styles.settingsCard}>
          <h3 className={styles.cardTitle}>Gym profile</h3>
          <div className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Gym name</label>
              <input
                type="text"
                name="name"
                className={styles.formInput}
                value={gymProfile.name}
                onChange={handleProfileChange}
                placeholder="Enter gym name"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Address</label>
              <input
                type="text"
                name="address"
                className={styles.formInput}
                value={gymProfile.address}
                onChange={handleProfileChange}
                placeholder="Enter address"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Opening hours</label>
              <input
                type="text"
                name="openingHours"
                className={styles.formInput}
                value={gymProfile.openingHours}
                onChange={handleProfileChange}
                placeholder="e.g. Mon–Sun · 05:00–23:00"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>About</label>
              <textarea
                name="about"
                className={styles.formTextarea}
                value={gymProfile.about}
                onChange={handleProfileChange}
                placeholder="Describe your gym..."
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Booking Rules Card */}
        <div className={styles.settingsCard}>
          <h3 className={styles.cardTitle}>Booking rules</h3>
          <div className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Booking window (days ahead)</label>
              <input
                type="number"
                name="bookingWindow"
                className={styles.formInput}
                value={bookingRules.bookingWindow}
                onChange={handleRulesChange}
                min="1"
                max="30"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Cancellation cutoff (hours)</label>
              <input
                type="number"
                name="cancellationCutoff"
                className={styles.formInput}
                value={bookingRules.cancellationCutoff}
                onChange={handleRulesChange}
                min="1"
                max="48"
              />
            </div>

            {/* Toggle Switches */}
            <div className={styles.toggleList}>
              <div className={styles.toggleItem}>
                <span className={styles.toggleLabel}>Allow waitlists on full classes</span>
                <label className={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    checked={bookingRules.allowWaitlists}
                    onChange={() => handleToggleChange('allowWaitlists')}
                  />
                  <span className={styles.toggleSlider}></span>
                </label>
              </div>

              <div className={styles.toggleItem}>
                <span className={styles.toggleLabel}>Auto-charge on renewal date</span>
                <label className={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    checked={bookingRules.autoCharge}
                    onChange={() => handleToggleChange('autoCharge')}
                  />
                  <span className={styles.toggleSlider}></span>
                </label>
              </div>

              <div className={styles.toggleItem}>
                <span className={styles.toggleLabel}>Email members on payment failure</span>
                <label className={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    checked={bookingRules.emailOnFailure}
                    onChange={() => handleToggleChange('emailOnFailure')}
                  />
                  <span className={styles.toggleSlider}></span>
                </label>
              </div>

              <div className={styles.toggleItem}>
                <span className={styles.toggleLabel}>Send weekly attendance summary</span>
                <label className={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    checked={bookingRules.weeklySummary}
                    onChange={() => handleToggleChange('weeklySummary')}
                  />
                  <span className={styles.toggleSlider}></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button className={styles.saveBtn} onClick={handleSave}>
        Save settings
      </button>

      {/* Toast Notification */}
      {showToast && (
        <div className={styles.toast}>
          <div className={styles.toastIcon}>
            <Check size={16} />
          </div>
          Settings saved successfully!
        </div>
      )}
    </div>
  );
};

export default Settings;