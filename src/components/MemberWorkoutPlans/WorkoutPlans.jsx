import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Clock, 
  Calendar, 
  Dumbbell, 
  CheckCircle, 
  Circle,
  ChevronRight,
  Play,
  Users,
  Target,
  Flame,
  ArrowRight,
  X,
  MoreVertical,
  Pause,
  Square,
  Timer,
  AlertTriangle
} from 'lucide-react';
import styles from './WorkoutPlans.module.css';

const WorkoutPlans = () => {
  const [activeTab, setActiveTab] = useState('my-plans');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPlanDetails, setShowPlanDetails] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Workout timer state
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [workoutCompleted, setWorkoutCompleted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Current user's workout plans
  const [myPlans, setMyPlans] = useState([
    {
      id: 1,
      name: 'Strength Training - Phase 1',
      type: 'Strength',
      level: 'Intermediate',
      trainer: 'Mike Chen',
      sessions: 12,
      completedSessions: 8,
      duration: '8 weeks',
      schedule: ['Mon', 'Wed', 'Fri'],
      status: 'active',
      progress: 67,
      nextSession: 'Today, 14:30',
      image: '💪',
      exercises: [
        { id: 1, name: 'Barbell Squat', sets: 4, reps: '8-10', weight: '135 lbs', completed: false },
        { id: 2, name: 'Bench Press', sets: 4, reps: '8-10', weight: '95 lbs', completed: false },
        { id: 3, name: 'Deadlift', sets: 3, reps: '6-8', weight: '185 lbs', completed: false },
        { id: 4, name: 'Pull-ups', sets: 3, reps: '8-12', weight: 'Bodyweight', completed: false },
        { id: 5, name: 'Plank', sets: 3, reps: '45 sec', weight: 'Bodyweight', completed: false },
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
      schedule: ['Tue', 'Thu', 'Sat'],
      status: 'active',
      progress: 75,
      nextSession: 'Tomorrow, 09:00',
      image: '🔥',
      exercises: [
        { id: 6, name: 'Burpees', sets: 4, reps: '15', weight: 'Bodyweight', completed: false },
        { id: 7, name: 'Mountain Climbers', sets: 4, reps: '30 sec', weight: 'Bodyweight', completed: false },
        { id: 8, name: 'Kettlebell Swings', sets: 3, reps: '20', weight: '35 lbs', completed: false },
        { id: 9, name: 'Box Jumps', sets: 3, reps: '12', weight: '24" box', completed: false },
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
      schedule: ['Mon', 'Wed', 'Fri'],
      status: 'completed',
      progress: 100,
      nextSession: null,
      image: '🧘',
      exercises: [
        { id: 10, name: 'Sun Salutation', sets: 5, reps: '5 rounds', weight: 'Bodyweight', completed: true },
        { id: 11, name: 'Warrior II', sets: 3, reps: '60 sec', weight: 'Bodyweight', completed: true },
        { id: 12, name: 'Tree Pose', sets: 3, reps: '45 sec', weight: 'Bodyweight', completed: true },
      ]
    },
  ]);

  // Available workout plans from trainers
  const [availablePlans, setAvailablePlans] = useState([
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
  ]);

  const workoutStats = {
    totalWorkouts: myPlans.reduce((acc, plan) => acc + plan.completedSessions, 0),
    totalMinutes: 1860,
    caloriesBurned: 12450,
    streakDays: 15,
  };

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && !isPaused && !workoutCompleted) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isPaused, workoutCompleted]);

  // Check if all exercises are completed - but don't auto-complete anymore
  // We'll let the user manually end the workout

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
      'HIIT': '🔥',
      'Yoga': '🧘',
      'Pilates': '🧘',
    };
    return icons[type] || '🏋️';
  };

  const handleStartWorkout = (planId) => {
    const plan = myPlans.find(p => p.id === planId);
    if (plan) {
      const resetExercises = plan.exercises.map(ex => ({
        ...ex,
        completed: false
      }));
      
      const workoutPlan = {
        ...plan,
        exercises: resetExercises
      };
      
      setActiveWorkout(workoutPlan);
      setTimerSeconds(0);
      setIsTimerRunning(true);
      setIsPaused(false);
      setWorkoutCompleted(false);
      showToast(`Starting "${plan.name}"...`);
    }
  };

  const handlePauseResume = () => {
    if (!workoutCompleted) {
      setIsPaused(!isPaused);
    }
  };

  const handleCompleteWorkout = () => {
    if (!activeWorkout) return;
    
    setIsTimerRunning(false);
    setIsPaused(false);
    setWorkoutCompleted(true);
    
    // Update the plan in myPlans
    const updatedPlans = myPlans.map(plan => {
      if (plan.id === activeWorkout.id) {
        const newCompletedSessions = plan.completedSessions + 1;
        const newProgress = Math.round((newCompletedSessions / plan.sessions) * 100);
        const newStatus = newProgress >= 100 ? 'completed' : 'active';
        
        // Mark all exercises as completed
        const updatedExercises = plan.exercises.map(ex => ({
          ...ex,
          completed: true
        }));
        
        return {
          ...plan,
          exercises: updatedExercises,
          completedSessions: newCompletedSessions,
          progress: newProgress,
          status: newStatus,
        };
      }
      return plan;
    });
    setMyPlans(updatedPlans);
    
    const minutes = Math.floor(timerSeconds / 60);
    showToast(`🎉 Workout complete! ${formatTime(timerSeconds)} elapsed.`);
    
    // Close the timer after a delay
    setTimeout(() => {
      setActiveWorkout(null);
      setTimerSeconds(0);
      setWorkoutCompleted(false);
    }, 2000);
  };

  const handleCloseTimer = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmClose = () => {
    setShowConfirmModal(false);
    setIsTimerRunning(false);
    setIsPaused(false);
    setActiveWorkout(null);
    setTimerSeconds(0);
    setWorkoutCompleted(false);
    showToast('Workout closed. Progress not saved.');
  };

  const handleCancelClose = () => {
    setShowConfirmModal(false);
  };

  const handleEndWorkout = () => {
    if (activeWorkout) {
      // Check if all exercises are completed
      const allCompleted = activeWorkout.exercises.every(ex => ex.completed);
      if (allCompleted) {
        // All exercises done - complete the workout
        handleCompleteWorkout();
      } else {
        // Show confirmation modal
        setShowConfirmModal(true);
      }
    }
  };

  const handleViewPlan = (plan) => {
    setSelectedPlan(plan);
    setShowPlanDetails(true);
  };

  const handleJoinPlan = (planId) => {
    console.log(`Joining plan ${planId}`);
    const planToJoin = availablePlans.find(p => p.id === planId);
    if (planToJoin) {
      const newPlan = {
        ...planToJoin,
        id: Date.now(),
        sessions: planToJoin.sessionsPerWeek * 4,
        completedSessions: 0,
        schedule: ['Mon', 'Wed', 'Fri'],
        status: 'active',
        progress: 0,
        nextSession: 'Today',
        exercises: [
          { id: Date.now() + 1, name: 'Sample Exercise 1', sets: 3, reps: '10-12', weight: 'Bodyweight', completed: false },
          { id: Date.now() + 2, name: 'Sample Exercise 2', sets: 3, reps: '8-10', weight: 'Bodyweight', completed: false },
        ]
      };
      setMyPlans(prev => [newPlan, ...prev]);
      setAvailablePlans(prev => prev.filter(p => p.id !== planId));
      showToast(`Joined "${planToJoin.name}" successfully!`);
    }
  };

  const showToast = (message) => {
    setToastMessage(message);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const filteredPlans = availablePlans.filter(plan =>
    plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.trainer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleExerciseComplete = (exerciseId) => {
    if (activeWorkout && !workoutCompleted) {
      const updatedExercises = activeWorkout.exercises.map(ex =>
        ex.id === exerciseId ? { ...ex, completed: !ex.completed } : ex
      );
      setActiveWorkout({
        ...activeWorkout,
        exercises: updatedExercises
      });
    }
  };

  // Count completed exercises
  const completedCount = activeWorkout?.exercises?.filter(ex => ex.completed).length || 0;
  const totalCount = activeWorkout?.exercises?.length || 0;
  const allExercisesCompleted = totalCount > 0 && completedCount === totalCount;

  return (
    <div className={styles.workoutPlans}>
      {/* Success Toast */}
      {showSuccessToast && (
        <div className={styles.toast}>
          <CheckCircle size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className={styles.modalOverlay} onClick={handleCancelClose}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmModalIcon}>
              <AlertTriangle size={32} />
            </div>
            <h3 className={styles.confirmModalTitle}>End Workout?</h3>
            <p className={styles.confirmModalDescription}>
              You haven't completed all exercises. Are you sure you want to end this workout?
            </p>
            <div className={styles.confirmModalActions}>
              <button 
                className={styles.btnSecondary}
                onClick={handleCancelClose}
              >
                Cancel
              </button>
              <button 
                className={styles.btnDanger}
                onClick={handleConfirmClose}
              >
                End Workout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Workout Timer Overlay */}
      {activeWorkout && (
        <div className={styles.timerOverlay}>
          <div className={styles.timerCard}>
            <div className={styles.timerHeader}>
              <span className={styles.timerEmoji}>{activeWorkout.image}</span>
              <div>
                <h3 className={styles.timerTitle}>{activeWorkout.name}</h3>
                <span className={styles.timerPlanType}>{activeWorkout.type}</span>
              </div>
              <button 
                className={styles.timerClose}
                onClick={handleCloseTimer}
                disabled={workoutCompleted}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.timerDisplay}>
              <Timer size={32} />
              <span className={styles.timerTime}>{formatTime(timerSeconds)}</span>
            </div>

            {/* Progress indicator */}
            <div className={styles.timerProgress}>
              <div className={styles.timerProgressBar}>
                <div 
                  className={styles.timerProgressFill} 
                  style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                />
              </div>
              <span className={styles.timerProgressText}>
                {completedCount} / {totalCount} exercises complete
              </span>
            </div>

            <div className={styles.timerExercises}>
              <h4 className={styles.timerExercisesTitle}>Exercises</h4>
              {activeWorkout.exercises.map((exercise) => (
                <div 
                  key={exercise.id} 
                  className={`${styles.timerExerciseItem} ${exercise.completed ? styles.timerExerciseCompleted : ''}`}
                  onClick={() => toggleExerciseComplete(exercise.id)}
                >
                  <div className={styles.timerExerciseLeft}>
                    {exercise.completed ? (
                      <CheckCircle size={18} className={styles.exerciseCompleted} />
                    ) : (
                      <Circle size={18} className={styles.exercisePending} />
                    )}
                    <div>
                      <div className={styles.timerExerciseName}>{exercise.name}</div>
                      <div className={styles.timerExerciseDetails}>
                        {exercise.sets} sets × {exercise.reps} · {exercise.weight}
                      </div>
                    </div>
                  </div>
                  {exercise.completed && (
                    <span className={styles.timerExerciseBadge}>Done</span>
                  )}
                </div>
              ))}
            </div>

            {workoutCompleted ? (
              <div className={styles.timerCompleteMessage}>
                <CheckCircle size={24} />
                <span>Workout Complete! 🎉</span>
              </div>
            ) : (
              <div className={styles.timerActions}>
                <button 
                  className={styles.timerPauseBtn}
                  onClick={handlePauseResume}
                >
                  {isPaused ? <Play size={18} /> : <Pause size={18} />}
                  {isPaused ? 'Resume' : 'Pause'}
                </button>
                <button 
                  className={styles.timerEndBtn}
                  onClick={handleEndWorkout}
                >
                  <Square size={18} />
                  End Workout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Workout Plans</h1>
          <p className={styles.pageSubtitle}>Track your progress, follow programs, and achieve your fitness goals</p>
        </div>
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
                  Get started by joining a plan from our trainers.
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
                          <span>{Array.isArray(plan.schedule) ? plan.schedule.join(', ') : plan.schedule}</span>
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
                          disabled={activeWorkout !== null}
                        >
                          <Play size={16} />
                          {activeWorkout ? 'Workout in progress...' : 'Start Workout'}
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
                      disabled={activeWorkout !== null}
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
                  <span className={styles.detailStatValue}>
                    {Array.isArray(selectedPlan.schedule) ? selectedPlan.schedule.join(', ') : selectedPlan.schedule}
                  </span>
                </div>
                <div className={styles.detailStat}>
                  <span className={styles.detailStatLabel}>Progress</span>
                  <span className={styles.detailStatValue}>{selectedPlan.progress}%</span>
                </div>
              </div>

              <div className={styles.exerciseList}>
                <h4 className={styles.exerciseTitle}>Exercises</h4>
                {selectedPlan.exercises && selectedPlan.exercises.map((exercise) => (
                  <div key={exercise.id} className={styles.exerciseItem}>
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
                <button 
                  className={styles.btnPrimary}
                  onClick={() => {
                    setShowPlanDetails(false);
                    handleStartWorkout(selectedPlan.id);
                  }}
                  disabled={activeWorkout !== null}
                >
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