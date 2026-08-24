import React, { useState } from 'react';
import { Search } from 'lucide-react';
import styles from './TrainerMember.module.css';

const Members = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock member data
  const members = [
    { id: 1, name: 'Sara Nabil', initials: 'SA', goal: 'Build lean muscle', status: 'Active', plan: 'Premium plan', lastVisit: '2026-08-17', progress: 75 },
    { id: 2, name: 'Omar Haddad', initials: 'OM', goal: 'Powerlifting total', status: 'Active', plan: 'VIP plan', lastVisit: '2026-08-18', progress: 60 },
    { id: 3, name: 'Lina Farouk', initials: 'LI', goal: 'Lose body fat', status: 'Expiring', plan: 'Basic plan', lastVisit: '2026-08-15', progress: 45 },
    { id: 4, name: 'Youssef Adel', initials: 'YO', goal: 'General fitness', status: 'Active', plan: 'Premium plan', lastVisit: '2026-08-16', progress: 40 },
    { id: 5, name: 'Nour Salem', initials: 'NO', goal: 'Mobility & posture', status: 'Expired', plan: 'Basic plan', lastVisit: '2026-06-29', progress: 20 },
    { id: 6, name: 'Karim Zaki', initials: 'KA', goal: 'Athletic conditioning', status: 'Active', plan: 'VIP plan', lastVisit: '2026-08-18', progress: 90 },
  ];

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.goal.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusClass = (status) => {
    switch(status) {
      case 'Active': return styles.statusActive;
      case 'Expiring': return styles.statusExpiring;
      case 'Expired': return styles.statusExpired;
      default: return '';
    }
  };

  return (
    <div className={styles.membersPage}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>My members</h1>
        <p className={styles.subtitle}>Assigned clients and their training progress.</p>
      </div>

      {/* Search Bar */}
      <div className={styles.searchContainer}>
        <Search size={16} className={styles.searchIcon} />
        <input 
          type="text" 
          placeholder="Search members..." 
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Members Grid */}
      <div className={styles.grid}>
        {filteredMembers.map(member => (
          <div key={member.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.memberInfo}>
                <div className={styles.avatar}>{member.initials}</div>
                <div className={styles.nameGroup}>
                  <p className={styles.memberName}>{member.name}</p>
                  <p className={styles.memberGoal}>{member.goal}</p>
                </div>
              </div>
              <span className={`${styles.statusBadge} ${getStatusClass(member.status)}`}>
                {member.status}
              </span>
            </div>

            {/* Progress Bar */}
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${member.progress}%` }} />
            </div>
            
            <p className={styles.metaInfo}>
              {member.plan} · last visit {member.lastVisit}
            </p>

            {/* Action Buttons */}
            <div className={styles.actions}>
              <button className={`${styles.btn} ${styles.btnPrimary}`}>Assign plan</button>
              <button className={`${styles.btn} ${styles.btnSecondary}`}>Message</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Members;