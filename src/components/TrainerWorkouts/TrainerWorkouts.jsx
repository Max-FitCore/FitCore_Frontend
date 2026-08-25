import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import styles from './TrainerWorkouts.module.css';
import CreatePlanModal from '../CreatePlanModal/CreatePlanModal';
import ViewPlanModal from '../ViewPlanModal/ViewPlanModal';
import EditPlanModal from '../EditPlanModal/EditPlanModal';
import DeletePlanModal from '../DeletePlanModal/DeletePlanModal';

const WorkoutPlans = () => {
  const [workoutPlans, setWorkoutPlans] = useState([
    {
      id: 1,
      name: 'Hypertrophy Block A',
      description: 'Build lean muscle · 8 weeks · Mon / Tue / Thu / Sat',
      difficulty: 'Intermediate',
      progress: 62,
      type: 'Strength',
      duration: '8 weeks',
      sessions: 16,
      sessionsPerWeek: 4,
      trainer: 'Mike Chen',
      image: '💪',
      days: [
        {
          day: 'Monday',
          focus: 'Chest & Triceps',
          exercises: [
            'Barbell Bench Press · 4 × 8–10',
            'Incline Dumbbell Press · 3 × 10–12',
            'Cable Fly · 3 × 12–15',
            'Overhead Triceps Extension · 3 × 12',
          ],
        },
        {
          day: 'Tuesday',
          focus: 'Back & Biceps',
          exercises: [
            'Deadlift · 4 × 5',
            'Pull-ups · 4 × 8',
            'Seated Row · 3 × 10–12',
            'EZ-Bar Curl · 3 × 12',
          ],
        },
        {
          day: 'Thursday',
          focus: 'Legs & Core',
          exercises: [
            'Back Squat · 5 × 6',
            'Romanian Deadlift · 3 × 10',
            'Walking Lunge · 3 × 20 steps',
            'Hanging Leg Raise · 3 × 15',
          ],
        },
        {
          day: 'Saturday',
          focus: 'Shoulders & Conditioning',
          exercises: [
            'Overhead Press · 4 × 8',
            'Lateral Raise · 4 × 15',
            'Face Pull · 3 × 15',
            'Assault Bike Intervals · 6 × 30s',
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Fat Loss Conditioning',
      description: 'Lose body fat · 6 weeks · Wed / Fri / Sun',
      difficulty: 'Beginner',
      progress: 25,
      type: 'Cardio',
      duration: '6 weeks',
      sessions: 18,
      sessionsPerWeek: 3,
      trainer: 'Sarah Johnson',
      image: '🔥',
      days: [
        {
          day: 'Wednesday',
          focus: 'Full Body Circuit',
          exercises: [
            'Kettlebell Swing · 4 × 20',
            'Goblet Squat · 4 × 15',
            'Push-up · 4 × 15',
            'Row Machine Sprint · 4 × 250m',
          ],
        },
        {
          day: 'Friday',
          focus: 'Lower Body & Cardio',
          exercises: [
            'Bulgarian Split Squat · 3 × 12',
            'Box Step-up · 3 × 15',
            'Treadmill Intervals · 8 × 45s',
          ],
        },
        {
          day: 'Sunday',
          focus: 'Active Recovery',
          exercises: [
            'Yoga Flow · 30 min',
            'Foam Rolling · 15 min',
            'Light Walk · 20 min',
          ],
        },
      ],
    },
  ]);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [expandedPlans, setExpandedPlans] = useState({});

  const getDifficultyClass = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
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

  // Handle creating a new plan
  const handleCreatePlan = (planData) => {
    const newPlan = {
      id: Date.now(),
      ...planData,
      progress: 0,
      days: planData.days || [],
    };
    setWorkoutPlans([...workoutPlans, newPlan]);
  };

  // Handle viewing a plan
  const handleViewPlan = (plan) => {
    setSelectedPlan(plan);
    setIsViewModalOpen(true);
  };

  // Handle editing a plan
  const handleEditPlan = (plan) => {
    setSelectedPlan(plan);
    setIsEditModalOpen(true);
  };

  // Handle deleting a plan
  const handleDeletePlan = (plan) => {
    setSelectedPlan(plan);
    setIsDeleteModalOpen(true);
  };

  // Handle confirming deletion
  const handleConfirmDelete = () => {
    if (selectedPlan) {
      setWorkoutPlans(workoutPlans.filter((plan) => plan.id !== selectedPlan.id));
      setIsDeleteModalOpen(false);
      setSelectedPlan(null);
    }
  };

  // Handle updating a plan
  const handleUpdatePlan = (updatedPlan) => {
    setWorkoutPlans(
      workoutPlans.map((plan) =>
        plan.id === updatedPlan.id ? updatedPlan : plan
      )
    );
    setIsEditModalOpen(false);
    setSelectedPlan(null);
  };

  // Toggle exercise visibility
  const toggleExercises = (planId) => {
    setExpandedPlans(prev => ({
      ...prev,
      [planId]: !prev[planId]
    }));
  };

  // Get all unique exercises from a plan
  const getAllExercises = (plan) => {
    const exercises = [];
    if (plan.days) {
      plan.days.forEach(day => {
        if (day.exercises) {
          exercises.push(...day.exercises);
        }
      });
    }
    return exercises;
  };

  return (
    <div className={styles.workoutPlans}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Workout plans</h1>
          <p className={styles.subtitle}>Programs you've built for your clients.</p>
        </div>
        <button 
          className={styles.newPlanBtn}
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus size={18} />
          New plan
        </button>
      </div>

      {/* Plans List */}
      <div className={styles.plansList}>
        {workoutPlans.map((plan) => {
          const allExercises = getAllExercises(plan);
          const isExpanded = expandedPlans[plan.id];

          return (
            <div key={plan.id} className={styles.planCard}>
              {/* Plan Header */}
              <div className={styles.planHeader}>
                <div className={styles.planInfo}>
                  <div className={styles.planNameRow}>
                    <div className={styles.planNameGroup}>
                      <span className={styles.planIcon}>{plan.image || '💪'}</span>
                      <h3 className={styles.planName}>{plan.name}</h3>
                    </div>
                    <div className={styles.actionButtons}>
                      <button 
                        className={styles.actionBtn}
                        onClick={() => handleViewPlan(plan)}
                        title="View plan"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        className={styles.actionBtn}
                        onClick={() => handleEditPlan(plan)}
                        title="Edit plan"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                        onClick={() => handleDeletePlan(plan)}
                        title="Delete plan"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className={styles.planMeta}>{plan.description}</p>
                  <div className={styles.planTags}>
                    <span className={styles.planTag}>{plan.type || 'Strength'}</span>
                    <span className={styles.planTag}>{plan.duration || '8 weeks'}</span>
                    <span className={styles.planTag}>{plan.sessions || 0} sessions</span>
                    <span className={styles.planTag}>👤 {plan.trainer || 'Trainer'}</span>
                  </div>
                </div>
                <span className={`${styles.difficultyBadge} ${getDifficultyClass(plan.difficulty)}`}>
                  {plan.difficulty}
                </span>
              </div>

              {/* Progress Bar */}
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${plan.progress}%` }}
                />
                <span className={styles.progressLabel}>{plan.progress}% complete</span>
              </div>

              {/* Exercise Preview */}
              <div className={styles.exercisePreview}>
                <button 
                  className={styles.exerciseToggle}
                  onClick={() => toggleExercises(plan.id)}
                >
                  <span>
                    {allExercises.length} exercises 
                    {isExpanded ? ' (hide)' : ' (show)'}
                  </span>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                
                {isExpanded && (
                  <div className={styles.exerciseList}>
                    {allExercises.map((exercise, index) => (
                      <div key={index} className={styles.exercisePreviewItem}>
                        <span className={styles.exerciseNumber}>{index + 1}</span>
                        <span>{exercise}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Days Grid */}
              <div className={styles.daysGrid}>
                {plan.days && plan.days.map((day, index) => (
                  <div key={index} className={styles.dayCard}>
                    <h4 className={styles.dayTitle}>
                      {day.day} — {day.focus}
                    </h4>
                    <div className={styles.dayExerciseList}>
                      {day.exercises.slice(0, 2).map((exercise, exIndex) => (
                        <p key={exIndex} className={styles.exerciseItem}>
                          {exercise}
                        </p>
                      ))}
                      {day.exercises.length > 2 && (
                        <p className={styles.exerciseMore}>
                          +{day.exercises.length - 2} more exercises
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <CreatePlanModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreatePlan={handleCreatePlan}
      />

      <ViewPlanModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedPlan(null);
        }}
        plan={selectedPlan}
        onEdit={() => {
          setIsViewModalOpen(false);
          handleEditPlan(selectedPlan);
        }}
      />

      <EditPlanModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPlan(null);
        }}
        plan={selectedPlan}
        onUpdatePlan={handleUpdatePlan}
      />

      <DeletePlanModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedPlan(null);
        }}
        plan={selectedPlan}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
};

export default WorkoutPlans;