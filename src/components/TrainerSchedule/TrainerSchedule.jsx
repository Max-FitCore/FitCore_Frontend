import React, { useState } from 'react';
import styles from './TrainerSchedule.module.css';

const Schedule = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Weekly schedule data (now stateful to allow additions)
  const [weeklySchedule, setWeeklySchedule] = useState({
    Mon: [
      { time: '07:00', name: 'Barbell Strength', trainer: 'Marcus Vale', difficulty: 'Intermediate' },
      { time: '18:30', name: 'HIIT Burn', trainer: 'Dario Khan', difficulty: 'Advanced' },
    ],
    Tue: [
      { time: '09:00', name: 'Mobility Flow', trainer: 'Elena Rossi', difficulty: 'Beginner' },
    ],
    Wed: [
      { time: '19:00', name: 'Olympic Lifting', trainer: 'Marcus Vale', difficulty: 'Advanced' },
    ],
    Thu: [
      { time: '17:00', name: 'Core & Stability', trainer: 'Elena Rossi', difficulty: 'Beginner' },
    ],
    Fri: [
      { time: '06:30', name: 'Metcon Circuit', trainer: 'Dario Khan', difficulty: 'Intermediate' },
    ],
  });

  // One-to-one sessions
  const oneToOneSessions = [
    { id: 1, name: 'PT Session — Lower body', meta: 'Marcus Vale · Studio 2', time: 'Today · 18:00' },
    { id: 2, name: 'Mobility Flow', meta: 'Elena Rossi · Studio 1', time: 'Tue · 09:00' },
    { id: 3, name: 'Barbell Strength', meta: 'Marcus Vale · Main floor', time: 'Wed · 07:00' },
  ];

  // Form state
  const [newSession, setNewSession] = useState({
    day: 'Mon',
    time: '',
    name: '',
    trainer: '',
    difficulty: 'Intermediate',
  });

  const handleInputChange = (e) => {
    setNewSession({ ...newSession, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newSession.time || !newSession.name || !newSession.trainer) return;

    setWeeklySchedule((prev) => ({
      ...prev,
      [newSession.day]: [
        ...(prev[newSession.day] || []),
        {
          time: newSession.time,
          name: newSession.name,
          trainer: newSession.trainer,
          difficulty: newSession.difficulty,
        },
      ],
    }));

    // Reset form and close modal
    setNewSession({
      day: 'Mon',
      time: '',
      name: '',
      trainer: '',
      difficulty: 'Intermediate',
    });
    setIsModalOpen(false);
  };

  const getDifficultyClass = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return styles.difficultyBeginner;
      case 'intermediate':
        return styles.difficultyIntermediate;
      case 'advanced':
        return styles.difficultyAdvanced;
      default:
        return styles.difficultyBeginner;
    }
  };

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  return (
    <div className={styles.schedule}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Schedule</h1>
          <p className={styles.subtitle}>Your week on the floor.</p>
        </div>
        <button className={styles.addSessionBtn} onClick={() => setIsModalOpen(true)}>
          Add session
        </button>
      </div>

      {/* Weekly Grid */}
      <div className={styles.weeklyGrid}>
        {days.map((day) => (
          <div key={day} className={styles.dayColumn}>
            <div className={styles.dayHeader}>{day}</div>
            {weeklySchedule[day] && weeklySchedule[day].map((slot, index) => (
              <div key={index} className={styles.timeSlot}>
                <div className={styles.slotTime}>{slot.time}</div>
                <div className={styles.slotName}>{slot.name}</div>
                <div className={styles.slotTrainer}>{slot.trainer}</div>
                <span className={`${styles.difficultyBadge} ${getDifficultyClass(slot.difficulty)}`}>
                  {slot.difficulty}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* One-to-One Sessions */}
      <div className={styles.oneToOneSection}>
        <h3 className={styles.sectionTitle}>One-to-one sessions</h3>
        <div className={styles.sessionList}>
          {oneToOneSessions.map((session) => (
            <div key={session.id} className={styles.sessionItem}>
              <div className={styles.sessionInfo}>
                <p className={styles.sessionName}>{session.name}</p>
                <p className={styles.sessionMeta}>{session.meta}</p>
              </div>
              <span className={styles.sessionTime}>{session.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Add Session Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Add New Session</h2>
            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Day</label>
                <select
                  className={styles.formInput}
                  name="day"
                  value={newSession.day}
                  onChange={handleInputChange}
                >
                  {days.map((day) => (
                    <option key={day} value={day}>
                      {day === 'Mon' ? 'Monday' : day === 'Tue' ? 'Tuesday' : day === 'Wed' ? 'Wednesday' : day === 'Thu' ? 'Thursday' : 'Friday'}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Time</label>
                <input
                  type="time"
                  className={styles.formInput}
                  name="time"
                  value={newSession.time}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Session Name</label>
                <input
                  type="text"
                  className={styles.formInput}
                  name="name"
                  placeholder="e.g. Barbell Strength"
                  value={newSession.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Trainer</label>
                <input
                  type="text"
                  className={styles.formInput}
                  name="trainer"
                  placeholder="e.g. Marcus Vale"
                  value={newSession.trainer}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Difficulty</label>
                <select
                  className={styles.formInput}
                  name="difficulty"
                  value={newSession.difficulty}
                  onChange={handleInputChange}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
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
                  Add session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;