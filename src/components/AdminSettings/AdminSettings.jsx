import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import styles from './AdminSettings.module.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Settings = () => {
  // Gym profile state (maps to admin fields in the backend)
  const [gymProfile, setGymProfile] = useState({
    gymName: '',
    address: '',
    openingHours: '',
    about: '',
  });

  // Admin personal info (required by update endpoint)
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    phone: '',
    location: '',
    bio: '',
  });

  // Booking rules state (local only — no backend fields yet)
  const [bookingRules, setBookingRules] = useState({
    bookingWindow: 7,
    cancellationCutoff: 4,
    allowWaitlists: true,
    autoCharge: true,
    emailOnFailure: true,
    weeklySummary: true,
  });

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Settings saved successfully!');
  const [toastType, setToastType] = useState('success');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Get token from localStorage
  const getToken = () => localStorage.getItem('token');

  /* ============================================================
     FETCH PROFILE ON MOUNT — GET /api/profile/me
     (NO credentials: 'include' — Bearer token only)
     ============================================================ */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = getToken();

        const res = await fetch(`${API_BASE}/api/profile/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          // ❌ NO credentials: 'include' here
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to load profile');
        }

        const user = data.data || {};

        setPersonalInfo({
          fullName: user.fullName || '',
          phone: user.phone || '',
          location: user.location || '',
          bio: user.bio || '',
        });

        setGymProfile({
          gymName: user.gymName || '',
          address: user.address || '',
          openingHours: user.openingHours || '',
          about: user.about || '',
        });
      } catch (err) {
        console.error('Fetch profile error:', err);
        setToastMessage(err.message || 'Failed to load profile');
        setToastType('error');
        setShowToast(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  /* ============================================================
     HANDLERS
     ============================================================ */
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setGymProfile((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleRulesChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBookingRules((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleToggleChange = (name) => {
    setBookingRules((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  /* ============================================================
     CLIENT-SIDE VALIDATION
     ============================================================ */
  const validate = () => {
    const newErrors = {};

    if (!personalInfo.fullName || !personalInfo.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (personalInfo.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    } else if (personalInfo.fullName.trim().length > 50) {
      newErrors.fullName = 'Full name cannot exceed 50 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(personalInfo.fullName.trim())) {
      newErrors.fullName = 'Full name can only contain letters and spaces';
    }

    if (personalInfo.phone && personalInfo.phone.trim()) {
      if (!/^[\d\s+\-()]{10,15}$/.test(personalInfo.phone.trim())) {
        newErrors.phone = 'Please provide a valid phone number';
      }
    }

    if (personalInfo.bio && personalInfo.bio.trim().length > 500) {
      newErrors.bio = 'Bio cannot exceed 500 characters';
    }

    if (gymProfile.gymName && gymProfile.gymName.trim().length > 100) {
      newErrors.gymName = 'Gym name cannot exceed 100 characters';
    }

    if (gymProfile.address && gymProfile.address.trim().length > 200) {
      newErrors.address = 'Address cannot exceed 200 characters';
    }

    if (gymProfile.openingHours && gymProfile.openingHours.trim().length > 200) {
      newErrors.openingHours = 'Opening hours cannot exceed 200 characters';
    }

    if (gymProfile.about && gymProfile.about.trim().length > 1000) {
      newErrors.about = 'About cannot exceed 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ============================================================
     SAVE — PUT /api/profile/update
     (NO credentials: 'include' — Bearer token only)
     ============================================================ */
  const handleSave = async () => {
    if (!validate()) {
      setToastMessage('Please fix the highlighted errors');
      setToastType('error');
      setShowToast(true);
      return;
    }

    try {
      setSaving(true);
      const token = getToken();

      const payload = {
        fullName: personalInfo.fullName.trim(),
        phone: personalInfo.phone?.trim() || null,
        location: personalInfo.location?.trim() || null,
        bio: personalInfo.bio?.trim() || null,
        gymName: gymProfile.gymName?.trim() || null,
        address: gymProfile.address?.trim() || null,
        openingHours: gymProfile.openingHours?.trim() || null,
        about: gymProfile.about?.trim() || null,
      };

      const res = await fetch(`${API_BASE}/api/profile/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        // ❌ NO credentials: 'include' here
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save settings');
      }

      const user = data.data || {};
      setPersonalInfo({
        fullName: user.fullName || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
      });
      setGymProfile({
        gymName: user.gymName || '',
        address: user.address || '',
        openingHours: user.openingHours || '',
        about: user.about || '',
      });

      console.log('Booking rules (not persisted yet):', bookingRules);

      setToastMessage(data.message || 'Settings saved successfully!');
      setToastType('success');
      setShowToast(true);
    } catch (err) {
      console.error('Save settings error:', err);
      setToastMessage(err.message || 'Failed to save settings');
      setToastType('error');
      setShowToast(true);
    } finally {
      setSaving(false);
    }
  };

  /* ============================================================
     TOAST AUTO-DISMISS
     ============================================================ */
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  /* ============================================================
     RENDER
     ============================================================ */
  if (loading) {
    return (
      <div className={styles.settingsPage}>
        <div className={styles.header}>
          <h1 className={styles.title}>Settings</h1>
          <p className={styles.subtitle}>Loading your gym profile…</p>
        </div>
      </div>
    );
  }

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
              <label className={styles.formLabel}>Full name (owner)</label>
              <input
                type="text"
                name="fullName"
                className={styles.formInput}
                value={personalInfo.fullName}
                onChange={handlePersonalChange}
                placeholder="Enter your full name"
              />
              {errors.fullName && (
                <span style={{ color: '#f87171', fontSize: '0.75rem' }}>
                  {errors.fullName}
                </span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Gym name</label>
              <input
                type="text"
                name="gymName"
                className={styles.formInput}
                value={gymProfile.gymName}
                onChange={handleProfileChange}
                placeholder="Enter gym name"
              />
              {errors.gymName && (
                <span style={{ color: '#f87171', fontSize: '0.75rem' }}>
                  {errors.gymName}
                </span>
              )}
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
              {errors.address && (
                <span style={{ color: '#f87171', fontSize: '0.75rem' }}>
                  {errors.address}
                </span>
              )}
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
              {errors.openingHours && (
                <span style={{ color: '#f87171', fontSize: '0.75rem' }}>
                  {errors.openingHours}
                </span>
              )}
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
              {errors.about && (
                <span style={{ color: '#f87171', fontSize: '0.75rem' }}>
                  {errors.about}
                </span>
              )}
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
      <button
        className={styles.saveBtn}
        onClick={handleSave}
        disabled={saving}
        style={saving ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
      >
        {saving ? 'Saving…' : 'Save settings'}
      </button>

      {/* Toast Notification */}
      {showToast && (
        <div
          className={styles.toast}
          style={
            toastType === 'error'
              ? { borderColor: 'rgba(248, 113, 113, 0.5)' }
              : undefined
          }
        >
          <div
            className={styles.toastIcon}
            style={
              toastType === 'error'
                ? { background: 'rgba(248,113,113,0.15)', color: '#f87171' }
                : undefined
            }
          >
            <Check size={16} />
          </div>
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default Settings;