import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  Calendar, 
  Dumbbell, 
  CheckCircle, 
  Circle,
  ChevronRight,
  Play,
  BarChart3,
  Users,
  Target,
  Flame,
  ArrowRight,
  X,
  Edit,
  Trash2,
  MoreVertical,
  AlertCircle
} from 'lucide-react';
import styles from './WorkoutPlans.module.css';

const WorkoutPlans = () => {
  const [activeTab, setActiveTab] = useState('my-plans');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPlanDetails, setShowPlanDetails] = useState(false);

  // Current user's workout plans
  const myPlans = [
    {
      id: 1,
      name: 'Strength Training - Phase 1',
      type: 'Strength',
      level: 'Intermediate',
      trainer: 'Mike Chen',
      sessions: 12,
      completedSessions: 8,
      duration: '8 weeks',
      schedule: 'Mon, Wed, Fri',
      status: 'active',
      progress: 67,
      nextSession: 'Today, 14:30',
      image: '💪',
      exercises: [
        { name: 'Barbell Squat', sets: 4, reps: '8-10', weight: '135 lbs', completed: true },
        { name: 'Bench Press', sets: 4, reps: '8-10', weight: '95 lbs', completed: true },
        { name: 'Deadlift', sets: 3, reps: '6-8', weight: '185 lbs', completed: false },
        { name: 'Pull-ups', sets: 3, reps: '8-12', weight: 'Bodyweight', completed: false },
        { name: 'Plank', sets: 3, reps: '45 sec', weight: 'Bodyweight', completed: false },
      ]
    },
    {
      id: 2,
      name: 'HIIT Cardio Blast',
      type: 'Cardio',
      level: 'Advanced',
      trainer: 'Sarah Johnson',
      sessions: 8,
      completedSessions: 6,
      duration: '4 weeks',
      schedule: 'Tue, Thu, Sat',
      status: 'active',
      progress: 75,
      nextSession: 'Tomorrow, 09:00',
      image: '🔥',
      exercises: [
        { name: 'Burpees', sets: 4, reps: '15', weight: 'Bodyweight', completed: true },
        { name: 'Mountain Climbers', sets: 4, reps: '30 sec', weight: 'Bodyweight', completed: true },
        { name: 'Kettlebell Swings', sets: 3, reps: '20', weight: '35 lbs', completed: false },
        { name: 'Box Jumps', sets: 3, reps: '12', weight: '24" box', completed: false },
      ]
    },
    {
      id: 3,
      name: 'Yoga Flow - Foundation',
      type: 'Flexibility',
      level: 'Beginner',
      trainer: 'Emily Rodriguez',
      sessions: 10,
      completedSessions: 10,
      duration: '6 weeks',
      schedule: 'Mon, Wed, Fri',
      status: 'completed',
      progress: 100,
      nextSession: null,
      image: '🧘',
      exercises: [
        { name: 'Sun Salutation', sets: 5, reps: '5 rounds', weight: 'Bodyweight', completed: true },
        { name: 'Warrior II', sets: 3, reps: '60 sec', weight: 'Bodyweight', completed: true },
        { name: 'Tree Pose', sets: 3, reps: '45 sec', weight: 'Bodyweight', completed: true },
      ]
    },
  ];

  // Available workout plans from trainers
  const availablePlans = [
    {
      id: 101,
      name: 'Powerlifting Program',
      type: 'Strength',
      level: 'Advanced',
      trainer: 'Marcus Reid',
      duration: '12 weeks',
      sessionsPerWeek: 4,
      members: 47,
      rating: 4.9,
      image: '🏋️',
      description: 'Build maximum strength with compound lifts and progressive overload.'
    },
    {
      id: 102,
      name: 'Fat Loss Accelerator',
      type: 'Cardio',
      level: 'Intermediate',
      trainer: 'Jordan Blake',
      duration: '8 weeks',
      sessionsPerWeek: 5,
      members: 89,
      rating: 4.8,
      image: '🔥',
      description: 'High-intensity workouts designed to maximize calorie burn and fat loss.'
    },
    {
      id: 103,
      name: 'Mobility & Recovery',
      type: 'Flexibility',
      level: 'All Levels',
      trainer: 'Elena Cho',
      duration: '6 weeks',
      sessionsPerWeek: 3,
      members: 34,
      rating: 4.7,
      image: '🧘',
      description: 'Improve flexibility, reduce injury risk, and enhance recovery.'
    },
    {
      id: 104,
      name: 'Hybrid Athlete',
      type: 'Cross Training',
      level: 'Advanced',
      trainer: 'Mike Chen',
      duration: '10 weeks',
      sessionsPerWeek: 6,
      members: 56,
      rating: 4.9,
      image: '⚡',
      description: 'Combine strength, endurance, and agility for complete athletic performance.'
    },
  ];

  const workoutStats = {
    totalWorkouts: 24,
    totalMinutes: 1860,
    caloriesBurned: 12450,
    streakDays: 15,
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { label: 'Active', className: styles.statusActive },
      completed: { label: 'Completed', className: styles.statusCompleted },
      pending: { label: 'Pending', className: styles.statusPending },
      paused: { label: 'Paused', className: styles.statusPaused },
    };
    return badges[status] || badges.active;
  };

  const getTypeIcon = (type) => {
    const icons = {
      'Strength': '💪',
      'Cardio': '🔥',
      'Flexibility': '🧘',
      'Cross Training': '⚡',
    };
    return icons[type] || '🏋️';
  };

  const handleStartWorkout = (planId) => {
    console.log(`Starting workout ${planId}`);
    // Navigate to workout session
  };

  const handleViewPlan = (plan) => {
    setSelectedPlan(plan);
    setShowPlanDetails(true);
  };

  const handleJoinPlan = (planId) => {
    console.log(`Joining plan ${planId}`);
    // API call to join plan
  };

  const filteredPlans = availablePlans.filter(plan =>
    plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.trainer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.workoutPlans}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Workout Plans</h1>
          <p className={styles.pageSubtitle}>Track your progress, follow programs, and achieve your fitness goals</p>
        </div>
        <button 
          className={styles.btnPrimary}
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={18} />
          Create Plan
        </button>
      </div>

      {/* Stats Overview */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Dumbbell size={20} />
          </div>
          <div>
            <div className={styles.statNumber}>{workoutStats.totalWorkouts}</div>
            <div className={styles.statLabel}>Total Workouts</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Clock size={20} />
          </div>
          <div>
            <div className={styles.statNumber}>{workoutStats.totalMinutes}</div>
            <div className={styles.statLabel}>Minutes Active</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Flame size={20} />
          </div>
          <div>
            <div className={styles.statNumber}>{workoutStats.caloriesBurned.toLocaleString()}</div>
            <div className={styles.statLabel}>Calories Burned</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Target size={20} />
          </div>
          <div>
            <div className={styles.statNumber}>{workoutStats.streakDays}</div>
            <div className={styles.statLabel}>Day Streak</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'my-plans' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('my-plans')}
        >
          My Plans
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'available' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('available')}
        >
          Available Plans
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'progress' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('progress')}
        >
          Progress
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {/* My Plans Tab */}
        {activeTab === 'my-plans' && (
          <div className={styles.myPlansTab}>
            {myPlans.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🏋️</div>
                <h3 className={styles.emptyTitle}>No workout plans yet</h3>
                <p className={styles.emptyDescription}>
                  Get started by joining a plan from our trainers or create your own custom plan.
                </p>
                <button 
                  className={styles.btnPrimary}
                  onClick={() => setActiveTab('available')}
                >
                  Browse Plans
                </button>
              </div>
            ) : (
              <div className={styles.plansList}>
                {myPlans.map((plan) => (
                  <div key={plan.id} className={styles.planCard}>
                    <div className={styles.planCardHeader}>
                      <div className={styles.planCardInfo}>
                        <span className={styles.planEmoji}>{plan.image}</span>
                        <div>
                          <h3 className={styles.planCardName}>{plan.name}</h3>
                          <div className={styles.planCardMeta}>
                            <span className={styles.planType}>{plan.type}</span>
                            <span className={styles.planLevel}>{plan.level}</span>
                            <span className={styles.planTrainer}>
                              <Users size={14} />
                              {plan.trainer}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className={`${styles.statusBadge} ${getStatusBadge(plan.status).className}`}>
                        {getStatusBadge(plan.status).label}
                      </span>
                    </div>

                    <div className={styles.planCardBody}>
                      <div className={styles.planStats}>
                        <div className={styles.planStat}>
                          <Calendar size={16} />
                          <span>{plan.duration}</span>
                        </div>
                        <div className={styles.planStat}>
                          <Dumbbell size={16} />
                          <span>{plan.sessions} sessions</span>
                        </div>
                        <div className={styles.planStat}>
                          <Clock size={16} />
                          <span>{plan.schedule}</span>
                        </div>
                        {plan.nextSession && (
                          <div className={styles.planStat}>
                            <Clock size={16} />
                            <span className={styles.nextSession}>Next: {plan.nextSession}</span>
                          </div>
                        )}
                      </div>

                      <div className={styles.progressSection}>
                        <div className={styles.progressHeader}>
                          <span className={styles.progressLabel}>Progress</span>
                          <span className={styles.progressPercentage}>{plan.progress}%</span>
                        </div>
                        <div className={styles.progressBar}>
                          <div 
                            className={styles.progressFill} 
                            style={{ width: `${plan.progress}%` }}
                          />
                        </div>
                        <span className={styles.progressDetail}>
                          {plan.completedSessions} / {plan.sessions} sessions completed
                        </span>
                      </div>
                    </div>

                    <div className={styles.planCardActions}>
                      {plan.status === 'active' && (
                        <button 
                          className={styles.btnPrimarySmall}
                          onClick={() => handleStartWorkout(plan.id)}
                        >
                          <Play size={16} />
                          Start Workout
                        </button>
                      )}
                      <button 
                        className={styles.btnSecondarySmall}
                        onClick={() => handleViewPlan(plan)}
                      >
                        View Details
                        <ChevronRight size={16} />
                      </button>
                      {plan.status === 'active' && (
                        <button className={styles.btnIcon}>
                          <MoreVertical size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Available Plans Tab */}
        {activeTab === 'available' && (
          <div className={styles.availableTab}>
            <div className={styles.searchSection}>
              <div className={styles.searchWrapper}>
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Search plans by name, trainer, or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
              <button className={styles.filterBtn}>
                <Filter size={18} />
                Filter
              </button>
            </div>

            <div className={styles.availableGrid}>
              {filteredPlans.map((plan) => (
                <div key={plan.id} className={styles.availableCard}>
                  <div className={styles.availableCardHeader}>
                    <span className={styles.planEmojiLarge}>{plan.image}</span>
                    <div className={styles.availableCardTop}>
                      <span className={styles.planType}>{plan.type}</span>
                      <span className={styles.planLevel}>{plan.level}</span>
                    </div>
                  </div>
                  
                  <h3 className={styles.availableCardName}>{plan.name}</h3>
                  <p className={styles.availableCardDescription}>{plan.description}</p>
                  
                  <div className={styles.availableCardMeta}>
                    <div className={styles.availableMetaItem}>
                      <Users size={14} />
                      <span>{plan.members} members</span>
                    </div>
                    <div className={styles.availableMetaItem}>
                      <span>⭐</span>
                      <span>{plan.rating}</span>
                    </div>
                    <div className={styles.availableMetaItem}>
                      <Clock size={14} />
                      <span>{plan.duration}</span>
                    </div>
                  </div>

                  <div className={styles.availableCardFooter}>
                    <span className={styles.trainerName}>By {plan.trainer}</span>
                    <button 
                      className={styles.btnPrimarySmall}
                      onClick={() => handleJoinPlan(plan.id)}
                    >
                      Join Plan
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div className={styles.progressTab}>
            <div className={styles.progressOverview}>
              <div className={styles.progressCard}>
                <h3 className={styles.progressCardTitle}>Weekly Activity</h3>
                <div className={styles.weeklyBars}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                    <div key={day} className={styles.barWrapper}>
                      <div className={styles.barContainer}>
                        <div 
                          className={styles.barFill} 
                          style={{ 
                            height: `${[60, 40, 80, 30, 70, 50, 20][index]}%`,
                            opacity: [60, 40, 80, 30, 70, 50, 20][index] > 0 ? 1 : 0.3
                          }}
                        />
                      </div>
                      <span className={styles.barLabel}>{day}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.progressCard}>
                <h3 className={styles.progressCardTitle}>Plan Distribution</h3>
                <div className={styles.distributionItems}>
                  <div className={styles.distributionItem}>
                    <div className={styles.distributionLabel}>
                      <span className={styles.distributionDot} style={{ background: '#A6F13B' }} />
                      <span>Strength</span>
                    </div>
                    <span className={styles.distributionValue}>45%</span>
                  </div>
                  <div className={styles.distributionItem}>
                    <div className={styles.distributionLabel}>
                      <span className={styles.distributionDot} style={{ background: '#F59E0B' }} />
                      <span>Cardio</span>
                    </div>
                    <span className={styles.distributionValue}>30%</span>
                  </div>
                  <div className={styles.distributionItem}>
                    <div className={styles.distributionLabel}>
                      <span className={styles.distributionDot} style={{ background: '#3B82F6' }} />
                      <span>Flexibility</span>
                    </div>
                    <span className={styles.distributionValue}>25%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.achievementsSection}>
              <h3 className={styles.achievementsTitle}>Recent Achievements</h3>
              <div className={styles.achievementsGrid}>
                <div className={styles.achievementCard}>
                  <div className={styles.achievementIcon}>🏆</div>
                  <div>
                    <div className={styles.achievementName}>10 Workouts Completed</div>
                    <div className={styles.achievementDate}>Earned Jan 20, 2026</div>
                  </div>
                </div>
                <div className={styles.achievementCard}>
                  <div className={styles.achievementIcon}>🔥</div>
                  <div>
                    <div className={styles.achievementName}>7 Day Streak</div>
                    <div className={styles.achievementDate}>Earned Jan 18, 2026</div>
                  </div>
                </div>
                <div className={styles.achievementCard}>
                  <div className={styles.achievementIcon}>💪</div>
                  <div>
                    <div className={styles.achievementName}>PR: Squat 225 lbs</div>
                    <div className={styles.achievementDate}>Earned Jan 15, 2026</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Plan Modal */}
      {showCreateModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Create Workout Plan</h2>
              <button 
                className={styles.modalClose}
                onClick={() => setShowCreateModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Plan Name</label>
                <input 
                  type="text" 
                  placeholder="e.g., Summer Strength Program"
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Type</label>
                  <select className={styles.formSelect}>
                    <option>Strength</option>
                    <option>Cardio</option>
                    <option>Flexibility</option>
                    <option>Cross Training</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Level</label>
                  <select className={styles.formSelect}>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Duration</label>
                <input 
                  type="text" 
                  placeholder="e.g., 8 weeks"
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Description</label>
                <textarea 
                  placeholder="Describe your workout plan..."
                  className={styles.formTextarea}
                  rows={3}
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.btnSecondary}
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button className={styles.btnPrimary}>
                Create Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Details Modal */}
      {showPlanDetails && selectedPlan && (
        <div className={styles.modalOverlay} onClick={() => setShowPlanDetails(false)}>
          <div className={styles.modalLarge} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.planEmojiLarge}>{selectedPlan.image}</span>
                <h2 className={styles.modalTitle}>{selectedPlan.name}</h2>
                <div className={styles.modalMeta}>
                  <span className={styles.planType}>{selectedPlan.type}</span>
                  <span className={styles.planLevel}>{selectedPlan.level}</span>
                  <span className={styles.planTrainer}>
                    <Users size={14} />
                    {selectedPlan.trainer}
                  </span>
                </div>
              </div>
              <button 
                className={styles.modalClose}
                onClick={() => setShowPlanDetails(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.detailStats}>
                <div className={styles.detailStat}>
                  <span className={styles.detailStatLabel}>Duration</span>
                  <span className={styles.detailStatValue}>{selectedPlan.duration}</span>
                </div>
                <div className={styles.detailStat}>
                  <span className={styles.detailStatLabel}>Total Sessions</span>
                  <span className={styles.detailStatValue}>{selectedPlan.sessions}</span>
                </div>
                <div className={styles.detailStat}>
                  <span className={styles.detailStatLabel}>Schedule</span>
                  <span className={styles.detailStatValue}>{selectedPlan.schedule}</span>
                </div>
                <div className={styles.detailStat}>
                  <span className={styles.detailStatLabel}>Progress</span>
                  <span className={styles.detailStatValue}>{selectedPlan.progress}%</span>
                </div>
              </div>

              <div className={styles.exerciseList}>
                <h4 className={styles.exerciseTitle}>Exercises</h4>
                {selectedPlan.exercises.map((exercise, index) => (
                  <div key={index} className={styles.exerciseItem}>
                    <div className={styles.exerciseLeft}>
                      {exercise.completed ? (
                        <CheckCircle size={18} className={styles.exerciseCompleted} />
                      ) : (
                        <Circle size={18} className={styles.exercisePending} />
                      )}
                      <div>
                        <div className={styles.exerciseName}>{exercise.name}</div>
                        <div className={styles.exerciseDetails}>
                          {exercise.sets} sets × {exercise.reps} · {exercise.weight}
                        </div>
                      </div>
                    </div>
                    <button className={styles.btnSecondarySmall}>
                      Log Set
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button 
                className={styles.btnSecondary}
                onClick={() => setShowPlanDetails(false)}
              >
                Close
              </button>
              {selectedPlan.status === 'active' && (
                <button className={styles.btnPrimary}>
                  <Play size={16} />
                  Start Workout
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutPlans;