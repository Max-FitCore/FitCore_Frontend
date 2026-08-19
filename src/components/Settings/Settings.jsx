import React, { useState } from 'react';
import {
  User,
  Bell,
  Lock,
  Palette,
  Globe,
  Shield,
  Smartphone,
  Mail,
  CreditCard,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  Monitor,
  CheckCircle,
  AlertCircle,
  Edit,
  Save,
  X,
  Camera,
  Eye,
  EyeOff,
  Smartphone as Phone,
  MapPin,
  Calendar,
  Clock,
  Volume2,
  VolumeX,
  MessageSquare,
  Star,
  TrendingUp,
  Users,
  Award,
  HelpCircle,
  FileText,
  ShieldCheck,
  Key,
  Trash2,
  ArrowRight
} from 'lucide-react';
import styles from './Settings.module.css';

const Settings = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Profile data
  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    bio: 'Fitness enthusiast and gym regular. Passionate about strength training and functional fitness.',
    joinDate: 'January 2025',
    membershipType: 'Premium',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=A6F13B&color=05070A&size=128'
  });

  // Preferences
  const [preferences, setPreferences] = useState({
    theme: 'dark',
    language: 'English',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    measurementSystem: 'Imperial'
  });

  // Notifications
  const [notifications, setNotifications] = useState({
    email: {
      classReminders: true,
      paymentReceipts: true,
      workoutReminders: true,
      promotions: false,
      achievementAlerts: true
    },
    push: {
      classReminders: true,
      paymentReceipts: true,
      workoutReminders: true,
      promotions: false,
      achievementAlerts: true
    },
    sms: {
      classReminders: false,
      paymentReceipts: true,
      workoutReminders: false,
      promotions: false,
      achievementAlerts: false
    }
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'members',
    showProgress: true,
    showAchievements: true,
    allowMessages: true,
    shareWorkoutData: false,
    allowCoachRequests: true
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'account', label: 'Account', icon: User }
  ];

  const handleProfileUpdate = () => {
    setIsEditing(false);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handlePasswordChange = () => {
    setShowPasswordModal(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(false);
    // Navigate to logout/delete
  };

  const handleNotificationToggle = (type, key) => {
    setNotifications(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [key]: !prev[type][key]
      }
    }));
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handlePrivacyChange = (key) => {
    setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderProfileSection = () => (
    <div className={styles.sectionContent}>
      <div className={styles.profileHeader}>
        <div className={styles.avatarSection}>
          <div className={styles.avatarWrapper}>
            <img src={profile.avatar} alt="Profile" className={styles.avatar} />
            <button className={styles.avatarUpload}>
              <Camera size={16} />
            </button>
          </div>
          <div>
            <h2 className={styles.profileName}>{profile.firstName} {profile.lastName}</h2>
            <p className={styles.profileMeta}>{profile.membershipType} Member • Joined {profile.joinDate}</p>
          </div>
        </div>
        <button 
          className={isEditing ? styles.btnPrimary : styles.btnSecondary}
          onClick={() => isEditing ? handleProfileUpdate() : setIsEditing(true)}
        >
          {isEditing ? (
            <>
              <Save size={16} />
              Save Changes
            </>
          ) : (
            <>
              <Edit size={16} />
              Edit Profile
            </>
          )}
        </button>
      </div>

      <div className={styles.profileForm}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>First Name</label>
            <input 
              type="text" 
              value={profile.firstName}
              onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
              className={styles.formInput}
              disabled={!isEditing}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Last Name</label>
            <input 
              type="text" 
              value={profile.lastName}
              onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
              className={styles.formInput}
              disabled={!isEditing}
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Email</label>
            <input 
              type="email" 
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className={styles.formInput}
              disabled={!isEditing}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Phone</label>
            <input 
              type="tel" 
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className={styles.formInput}
              disabled={!isEditing}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Location</label>
          <input 
            type="text" 
            value={profile.location}
            onChange={(e) => setProfile({ ...profile, location: e.target.value })}
            className={styles.formInput}
            disabled={!isEditing}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Bio</label>
          <textarea 
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            className={styles.formTextarea}
            rows={3}
            disabled={!isEditing}
          />
        </div>
      </div>
    </div>
  );

  const renderPreferencesSection = () => (
    <div className={styles.sectionContent}>
      <div className={styles.preferencesGrid}>
        <div className={styles.preferenceGroup}>
          <h3 className={styles.preferenceTitle}>Theme</h3>
          <div className={styles.themeOptions}>
            <button 
              className={`${styles.themeOption} ${preferences.theme === 'dark' ? styles.themeActive : ''}`}
              onClick={() => handlePreferenceChange('theme', 'dark')}
            >
              <Moon size={20} />
              <span>Dark</span>
            </button>
            <button 
              className={`${styles.themeOption} ${preferences.theme === 'light' ? styles.themeActive : ''}`}
              onClick={() => handlePreferenceChange('theme', 'light')}
            >
              <Sun size={20} />
              <span>Light</span>
            </button>
            <button 
              className={`${styles.themeOption} ${preferences.theme === 'system' ? styles.themeActive : ''}`}
              onClick={() => handlePreferenceChange('theme', 'system')}
            >
              <Monitor size={20} />
              <span>System</span>
            </button>
          </div>
        </div>

        <div className={styles.preferenceGroup}>
          <h3 className={styles.preferenceTitle}>Language & Region</h3>
          <div className={styles.preferenceItem}>
            <label className={styles.preferenceLabel}>Language</label>
            <select 
              value={preferences.language}
              onChange={(e) => handlePreferenceChange('language', e.target.value)}
              className={styles.preferenceSelect}
            >
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
              <option>Portuguese</option>
            </select>
          </div>
          <div className={styles.preferenceItem}>
            <label className={styles.preferenceLabel}>Timezone</label>
            <select 
              value={preferences.timezone}
              onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
              className={styles.preferenceSelect}
            >
              <option>America/New_York</option>
              <option>America/Los_Angeles</option>
              <option>America/Chicago</option>
              <option>America/Denver</option>
              <option>Europe/London</option>
            </select>
          </div>
        </div>

        <div className={styles.preferenceGroup}>
          <h3 className={styles.preferenceTitle}>Date & Time</h3>
          <div className={styles.preferenceItem}>
            <label className={styles.preferenceLabel}>Date Format</label>
            <select 
              value={preferences.dateFormat}
              onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
              className={styles.preferenceSelect}
            >
              <option>MM/DD/YYYY</option>
              <option>DD/MM/YYYY</option>
              <option>YYYY-MM-DD</option>
            </select>
          </div>
          <div className={styles.preferenceItem}>
            <label className={styles.preferenceLabel}>Time Format</label>
            <select 
              value={preferences.timeFormat}
              onChange={(e) => handlePreferenceChange('timeFormat', e.target.value)}
              className={styles.preferenceSelect}
            >
              <option>12h</option>
              <option>24h</option>
            </select>
          </div>
          <div className={styles.preferenceItem}>
            <label className={styles.preferenceLabel}>Measurement System</label>
            <select 
              value={preferences.measurementSystem}
              onChange={(e) => handlePreferenceChange('measurementSystem', e.target.value)}
              className={styles.preferenceSelect}
            >
              <option>Imperial</option>
              <option>Metric</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className={styles.sectionContent}>
      <div className={styles.notificationChannels}>
        <div className={styles.channelCard}>
          <div className={styles.channelHeader}>
            <Mail size={20} />
            <h3 className={styles.channelTitle}>Email Notifications</h3>
          </div>
          {Object.entries(notifications.email).map(([key, value]) => (
            <div key={key} className={styles.notificationToggle}>
              <label className={styles.toggleLabel}>
                <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                <div 
                  className={`${styles.toggle} ${value ? styles.toggleActive : ''}`}
                  onClick={() => handleNotificationToggle('email', key)}
                >
                  <div className={styles.toggleKnob} />
                </div>
              </label>
            </div>
          ))}
        </div>

        <div className={styles.channelCard}>
          <div className={styles.channelHeader}>
            <Smartphone size={20} />
            <h3 className={styles.channelTitle}>Push Notifications</h3>
          </div>
          {Object.entries(notifications.push).map(([key, value]) => (
            <div key={key} className={styles.notificationToggle}>
              <label className={styles.toggleLabel}>
                <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                <div 
                  className={`${styles.toggle} ${value ? styles.toggleActive : ''}`}
                  onClick={() => handleNotificationToggle('push', key)}
                >
                  <div className={styles.toggleKnob} />
                </div>
              </label>
            </div>
          ))}
        </div>

        <div className={styles.channelCard}>
          <div className={styles.channelHeader}>
            <Phone size={20} />
            <h3 className={styles.channelTitle}>SMS Notifications</h3>
          </div>
          {Object.entries(notifications.sms).map(([key, value]) => (
            <div key={key} className={styles.notificationToggle}>
              <label className={styles.toggleLabel}>
                <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                <div 
                  className={`${styles.toggle} ${value ? styles.toggleActive : ''}`}
                  onClick={() => handleNotificationToggle('sms', key)}
                >
                  <div className={styles.toggleKnob} />
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPrivacySection = () => (
    <div className={styles.sectionContent}>
      <div className={styles.privacyGrid}>
        <div className={styles.privacyGroup}>
          <h3 className={styles.privacyTitle}>Profile Privacy</h3>
          <div className={styles.privacyItem}>
            <label className={styles.privacyLabel}>Profile Visibility</label>
            <select 
              value={privacy.profileVisibility}
              onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value })}
              className={styles.privacySelect}
            >
              <option value="public">Public</option>
              <option value="members">Members Only</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>

        <div className={styles.privacyGroup}>
          <h3 className={styles.privacyTitle}>Data Sharing</h3>
          {Object.entries(privacy).filter(([key]) => key !== 'profileVisibility').map(([key, value]) => (
            <div key={key} className={styles.privacyToggle}>
              <label className={styles.toggleLabel}>
                <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                <div 
                  className={`${styles.toggle} ${value ? styles.toggleActive : ''}`}
                  onClick={() => handlePrivacyChange(key)}
                >
                  <div className={styles.toggleKnob} />
                </div>
              </label>
            </div>
          ))}
        </div>

        <div className={styles.privacyGroup}>
          <h3 className={styles.privacyTitle}>Security</h3>
          <button 
            className={styles.securityAction}
            onClick={() => setShowPasswordModal(true)}
          >
            <Key size={16} />
            <span>Change Password</span>
            <ChevronRight size={16} />
          </button>
          <button className={styles.securityAction}>
            <ShieldCheck size={16} />
            <span>Two-Factor Authentication</span>
            <ChevronRight size={16} />
          </button>
          <button className={styles.securityAction}>
            <Smartphone size={16} />
            <span>Active Sessions</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderAccountSection = () => (
    <div className={styles.sectionContent}>
      <div className={styles.accountGrid}>
        <div className={styles.accountCard}>
          <div className={styles.accountCardHeader}>
            <CreditCard size={20} />
            <h3 className={styles.accountCardTitle}>Billing</h3>
          </div>
          <p className={styles.accountCardDesc}>Manage your payment methods and subscription</p>
          <button className={styles.accountAction}>
            Manage Billing
            <ArrowRight size={16} />
          </button>
        </div>

        <div className={styles.accountCard}>
          <div className={styles.accountCardHeader}>
            <FileText size={20} />
            <h3 className={styles.accountCardTitle}>Data & Privacy</h3>
          </div>
          <p className={styles.accountCardDesc}>Export your data or delete your account</p>
          <div className={styles.accountActions}>
            <button className={styles.accountAction}>
              Export Data
              <ArrowRight size={16} />
            </button>
            <button 
              className={`${styles.accountAction} ${styles.accountActionDanger}`}
              onClick={() => setShowDeleteModal(true)}
            >
              Delete Account
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className={styles.accountCard}>
          <div className={styles.accountCardHeader}>
            <LogOut size={20} />
            <h3 className={styles.accountCardTitle}>Session</h3>
          </div>
          <p className={styles.accountCardDesc}>Sign out of your account on this device</p>
          <button className={`${styles.accountAction} ${styles.accountActionDanger}`}>
            Sign Out
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch(activeSection) {
      case 'profile': return renderProfileSection();
      case 'preferences': return renderPreferencesSection();
      case 'notifications': return renderNotificationsSection();
      case 'privacy': return renderPrivacySection();
      case 'account': return renderAccountSection();
      default: return renderProfileSection();
    }
  };

  return (
    <div className={styles.settings}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Settings</h1>
          <p className={styles.pageSubtitle}>Manage your account preferences and privacy</p>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccessToast && (
        <div className={styles.toast}>
          <CheckCircle size={18} />
          <span>Settings updated successfully!</span>
        </div>
      )}

      <div className={styles.settingsLayout}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <nav className={styles.sidebarNav}>
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  className={`${styles.sidebarItem} ${activeSection === section.id ? styles.sidebarItemActive : ''}`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <Icon size={18} />
                  <span>{section.label}</span>
                  <ChevronRight size={16} />
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className={styles.mainContent}>
          {renderContent()}
        </main>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className={styles.modalOverlay} onClick={() => setShowPasswordModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Change Password</h2>
              <button 
                className={styles.modalClose}
                onClick={() => setShowPasswordModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Current Password</label>
                <input 
                  type="password" 
                  placeholder="Enter current password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>New Password</label>
                <input 
                  type="password" 
                  placeholder="Enter new password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Confirm New Password</label>
                <input 
                  type="password" 
                  placeholder="Confirm new password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className={styles.formInput}
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.btnSecondary}
                onClick={() => setShowPasswordModal(false)}
              >
                Cancel
              </button>
              <button 
                className={styles.btnPrimary}
                onClick={handlePasswordChange}
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Delete Account</h2>
              <button 
                className={styles.modalClose}
                onClick={() => setShowDeleteModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.deleteWarning}>
                <AlertCircle size={40} />
                <p className={styles.deleteText}>
                  Are you sure you want to delete your account? This action cannot be undone.
                  All your data, including workout history, progress, and membership information,
                  will be permanently removed.
                </p>
                <div className={styles.deleteConfirm}>
                  <label className={styles.checkboxLabel}>
                    <input type="checkbox" />
                    <span>I understand this action is permanent</span>
                  </label>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.btnSecondary}
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                className={styles.btnDanger}
                onClick={handleDeleteAccount}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;