import React, { useState, useRef, useEffect } from 'react';
import { Camera, Check, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import styles from './TrainerProfile.module.css';

const API_BASE = 'http://localhost:5000';

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

const Profile = () => {
  const [profileData, setProfileData] = useState({
    fullName: '',
    speciality: '',
    certifications: '',
    availability: '',
    bio: '',
    phone: '',
    location: '',
    photo: '',
    photoPublicId: '',
    role: '',
    email: '',
  });

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showToast, setShowToast] = useState(false);

  // Photo-specific state
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState('');

  const fileInputRef = useRef(null);

  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  // For FormData requests — do NOT set Content-Type
  const authHeadersMultipart = () => {
    const token = localStorage.getItem('token');
    return {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  /* ---------- Load profile on mount ---------- */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setLoadError('');
        const res = await fetch(`${API_BASE}/api/profile/me`, {
          headers: authHeaders(),
        });
        const data = await parseResponse(res);
        if (!res.ok || !data.success) {
          throw new Error(data.message || `Failed to load profile (${res.status})`);
        }
        const u = data.data || {};
        setProfileData({
          fullName: u.fullName || '',
          speciality: u.speciality || '',
          certifications: u.certifications || '',
          availability: u.availability || '',
          bio: u.bio || '',
          phone: u.phone || '',
          location: u.location || '',
          photo: u.profilePicture?.url || '',
          photoPublicId: u.profilePicture?.publicId || '',
          role: u.role || '',
          email: u.email || '',
        });
      } catch (err) {
        setLoadError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---------- Input handlers ---------- */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (saveError) setSaveError('');
  };

  const triggerFileInput = () => {
    if (uploadingPhoto || deletingPhoto) return;
    fileInputRef.current?.click();
  };

  /* ---------- Upload photo to Cloudinary via backend ---------- */
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so selecting the same file again re-triggers change
    e.target.value = '';

    // Basic client-side guards
    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Image must be smaller than 5 MB.');
      return;
    }

    setPhotoError('');
    setUploadingPhoto(true);

    // Optimistic local preview
    const localPreview = URL.createObjectURL(file);
    const previousPhoto = profileData.photo;
    setProfileData((prev) => ({ ...prev, photo: localPreview }));

    try {
      const formData = new FormData();
      // 👇 CHANGE THIS IF YOUR BACKEND EXPECTS A DIFFERENT FIELD NAME
      //    (must match `upload.single('...')` in your route file)
      formData.append('profilePicture', file);

      const res = await fetch(`${API_BASE}/api/profile/upload-picture`, {
        method: 'POST',
        headers: authHeadersMultipart(),
        body: formData,
      });
      const data = await parseResponse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.message || `Upload failed (${res.status})`);
      }

      // Backend returns { data: { profilePicture: { url, publicId }, user } }
      const pic = data.data?.profilePicture || {};
      setProfileData((prev) => ({
        ...prev,
        photo: pic.url || prev.photo,
        photoPublicId: pic.publicId || '',
      }));

      // Sync localStorage user
      syncLocalStorage(data.data?.user);

      setShowToast(true);
    } catch (err) {
      setPhotoError(err.message || 'Failed to upload photo');
      // Revert optimistic preview
      setProfileData((prev) => ({ ...prev, photo: previousPhoto }));
    } finally {
      URL.revokeObjectURL(localPreview);
      setUploadingPhoto(false);
    }
  };

  /* ---------- Delete photo ---------- */
  const handleDeletePhoto = async () => {
    if (uploadingPhoto || deletingPhoto) return;
    if (!profileData.photoPublicId) return;

    setPhotoError('');
    setDeletingPhoto(true);

    const previousPhoto = profileData.photo;
    const previousPublicId = profileData.photoPublicId;
    // Optimistic clear
    setProfileData((prev) => ({ ...prev, photo: '', photoPublicId: '' }));

    try {
      const res = await fetch(`${API_BASE}/api/profile/delete-picture`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      const data = await parseResponse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.message || `Delete failed (${res.status})`);
      }

      // Update localStorage
      try {
        const raw = localStorage.getItem('user');
        if (raw) {
          const cached = JSON.parse(raw);
          localStorage.setItem(
            'user',
            JSON.stringify({ ...cached, profilePicture: { url: null, publicId: null } })
          );
        }
      } catch {
        /* ignore */
      }

      setShowToast(true);
    } catch (err) {
      setPhotoError(err.message || 'Failed to delete photo');
      // Revert
      setProfileData((prev) => ({
        ...prev,
        photo: previousPhoto,
        photoPublicId: previousPublicId,
      }));
    } finally {
      setDeletingPhoto(false);
    }
  };

  /* ---------- localStorage sync helper ---------- */
  const syncLocalStorage = (serverUser) => {
    if (!serverUser) return;
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const cached = JSON.parse(raw);
        localStorage.setItem('user', JSON.stringify({ ...cached, ...serverUser }));
      }
    } catch {
      /* ignore storage errors */
    }
  };

  /* ---------- Client-side validation (mirrors backend rules) ---------- */
  const validate = () => {
    const errs = {};
    const name = profileData.fullName.trim();

    if (!name) errs.fullName = 'Full name is required';
    else if (name.length < 2) errs.fullName = 'Must be at least 2 characters';
    else if (name.length > 50) errs.fullName = 'Cannot exceed 50 characters';
    else if (!/^[a-zA-Z\s]+$/.test(name))
      errs.fullName = 'Only letters and spaces are allowed';

    if (profileData.phone.trim() && !/^[\d\s+\-()]{10,15}$/.test(profileData.phone.trim()))
      errs.phone = 'Enter a valid phone number';

    if (profileData.bio.length > 500) errs.bio = 'Bio cannot exceed 500 characters';
    if (profileData.speciality.length > 200)
      errs.speciality = 'Speciality cannot exceed 200 characters';
    if (profileData.certifications.length > 500)
      errs.certifications = 'Certifications cannot exceed 500 characters';
    if (profileData.availability.length > 500)
      errs.availability = 'Availability cannot exceed 500 characters';

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ---------- Save ---------- */
  const handleSave = async () => {
    if (saving) return;
    if (!validate()) return;

    const payload = {
      fullName: profileData.fullName.trim(),
      phone: profileData.phone.trim(),
      location: profileData.location.trim(),
      bio: profileData.bio.trim(),
      speciality: profileData.speciality.trim(),
      certifications: profileData.certifications.trim(),
      availability: profileData.availability.trim(),
    };

    try {
      setSaving(true);
      setSaveError('');

      const res = await fetch(`${API_BASE}/api/profile/update`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await parseResponse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.message || `Failed to update profile (${res.status})`);
      }

      const u = data.data || {};
      setProfileData((prev) => ({
        ...prev,
        fullName: u.fullName ?? prev.fullName,
        speciality: u.speciality ?? prev.speciality,
        certifications: u.certifications ?? prev.certifications,
        availability: u.availability ?? prev.availability,
        bio: u.bio ?? prev.bio,
        phone: u.phone ?? prev.phone,
        location: u.location ?? prev.location,
        role: u.role ?? prev.role,
        email: u.email ?? prev.email,
      }));

      syncLocalStorage(u);
      setShowToast(true);
    } catch (err) {
      setSaveError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  /* ---------- Toast auto-dismiss ---------- */
  useEffect(() => {
    if (showToast) {
      const t = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(t);
    }
  }, [showToast]);

  /* ---------- Render ---------- */
  if (loading) {
    return (
      <div className={styles.profilePage}>
        <div className={styles.header}>
          <h1 className={styles.title}>Profile</h1>
          <p className={styles.subtitle}>Loading your profile…</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={styles.profilePage}>
        <div className={styles.header}>
          <h1 className={styles.title}>Profile</h1>
        </div>
        <div className={styles.stateError}>{loadError}</div>
      </div>
    );
  }

  const photoBusy = uploadingPhoto || deletingPhoto;

  return (
    <div className={styles.profilePage}>
      <div className={styles.header}>
        <h1 className={styles.title}>Profile</h1>
        <p className={styles.subtitle}>How members see you across FitCore.</p>
      </div>

      <div className={styles.layoutGrid}>
        {/* Left: Photo + identity card */}
        <div className={styles.profileCard}>
          <div className={styles.imageContainer} onClick={triggerFileInput}>
            {profileData.photo ? (
              <img
                src={profileData.photo}
                alt="Profile"
                className={styles.profileImage}
              />
            ) : (
              <div className={styles.profileImagePlaceholder}>
                {(profileData.fullName || '?').charAt(0).toUpperCase()}
              </div>
            )}

            {/* Busy overlay */}
            {photoBusy && (
              <div className={styles.imageBusyOverlay}>
                <Loader2 size={28} className={styles.spinner} />
                <span>{uploadingPhoto ? 'Uploading…' : 'Removing…'}</span>
              </div>
            )}

            {/* Hover overlay (hidden while busy) */}
            {!photoBusy && (
              <div className={styles.imageOverlay}>
                <Camera size={24} />
                <span>Change photo</span>
              </div>
            )}
          </div>

          {/* Delete button — only when there's a stored photo */}
          {profileData.photoPublicId && !photoBusy && (
            <button
              type="button"
              className={styles.deletePhotoBtn}
              onClick={handleDeletePhoto}
              disabled={deletingPhoto}
            >
              <Trash2 size={14} />
              Remove photo
            </button>
          )}

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleImageChange}
          />

          <div className={styles.profileInfo}>
            <h2 className={styles.profileName}>
              {profileData.fullName || 'Unnamed trainer'}
            </h2>
            <p className={styles.profileSpecialty}>
              {profileData.speciality || 'Add your speciality'}
            </p>
            {profileData.email && (
              <p className={styles.profileEmail}>{profileData.email}</p>
            )}

            {photoError && (
              <div className={styles.photoError}>
                <AlertCircle size={13} />
                <span>{photoError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: form */}
        <div className={styles.detailsCard}>
          <h3 className={styles.sectionTitle}>Coaching details</h3>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Full name *</label>
              <input
                type="text"
                name="fullName"
                className={`${styles.formInput} ${
                  fieldErrors.fullName ? styles.inputError : ''
                }`}
                value={profileData.fullName}
                onChange={handleInputChange}
                placeholder="e.g. Marcus Vale"
                disabled={saving}
              />
              {fieldErrors.fullName && (
                <span className={styles.errorMessage}>{fieldErrors.fullName}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Speciality</label>
              <input
                type="text"
                name="speciality"
                className={`${styles.formInput} ${
                  fieldErrors.speciality ? styles.inputError : ''
                }`}
                value={profileData.speciality}
                onChange={handleInputChange}
                placeholder="e.g. Strength & Powerlifting"
                disabled={saving}
              />
              {fieldErrors.speciality && (
                <span className={styles.errorMessage}>{fieldErrors.speciality}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Phone</label>
              <input
                type="tel"
                name="phone"
                className={`${styles.formInput} ${
                  fieldErrors.phone ? styles.inputError : ''
                }`}
                value={profileData.phone}
                onChange={handleInputChange}
                placeholder="+20 100 000 0000"
                disabled={saving}
              />
              {fieldErrors.phone && (
                <span className={styles.errorMessage}>{fieldErrors.phone}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Location</label>
              <input
                type="text"
                name="location"
                className={styles.formInput}
                value={profileData.location}
                onChange={handleInputChange}
                placeholder="e.g. Cairo, Egypt"
                disabled={saving}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Certifications</label>
              <input
                type="text"
                name="certifications"
                className={`${styles.formInput} ${
                  fieldErrors.certifications ? styles.inputError : ''
                }`}
                value={profileData.certifications}
                onChange={handleInputChange}
                placeholder="e.g. NSCA CSCS, Precision Nutrition L1"
                disabled={saving}
              />
              {fieldErrors.certifications && (
                <span className={styles.errorMessage}>{fieldErrors.certifications}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Availability</label>
              <input
                type="text"
                name="availability"
                className={`${styles.formInput} ${
                  fieldErrors.availability ? styles.inputError : ''
                }`}
                value={profileData.availability}
                onChange={handleInputChange}
                placeholder="e.g. Mon–Sat · 06:00–14:00"
                disabled={saving}
              />
              {fieldErrors.availability && (
                <span className={styles.errorMessage}>{fieldErrors.availability}</span>
              )}
            </div>

            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.formLabel}>
                Bio ({profileData.bio.length}/500)
              </label>
              <textarea
                name="bio"
                className={`${styles.formTextarea} ${
                  fieldErrors.bio ? styles.inputError : ''
                }`}
                value={profileData.bio}
                onChange={handleInputChange}
                rows={4}
                maxLength={500}
                placeholder="Tell members about your coaching style and background…"
                disabled={saving}
              />
              {fieldErrors.bio && (
                <span className={styles.errorMessage}>{fieldErrors.bio}</span>
              )}
            </div>
          </div>

          {saveError && <div className={styles.saveError}>{saveError}</div>}

          <button
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 size={16} className={styles.spinner} /> Saving…
              </>
            ) : (
              'Save changes'
            )}
          </button>
        </div>
      </div>

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