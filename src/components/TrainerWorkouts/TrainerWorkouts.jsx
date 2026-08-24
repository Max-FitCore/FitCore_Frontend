import React from 'react';
import { Plus } from 'lucide-react';
import styles from './TrainerWorkouts.module.css';

const WorkoutPlans = () => {
  // Mock workout plans data
  const workoutPlans = [
    {
      id: 1,
      name: 'Hypertrophy Block A',
      description: 'Build lean muscle · 8 weeks · Mon / Tue / Thu / Sat',
      difficulty: 'Intermediate',
      progress: 62,
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
  ];

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

  return (
    <div className={styles.workoutPlans}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Workout plans</h1>
          <p className={styles.subtitle}>Programs you've built for your clients.</p>
        </div>
        <button className={styles.newPlanBtn}>
          <Plus size={18} />
          New plan
        </button>
      </div>

      {/* Plans List */}
      <div className={styles.plansList}>
        {workoutPlans.map((plan) => (
          <div key={plan.id} className={styles.planCard}>
            {/* Plan Header */}
            <div className={styles.planHeader}>
              <div className={styles.planInfo}>
                <h3 className={styles.planName}>{plan.name}</h3>
                <p className={styles.planMeta}>{plan.description}</p>
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
            </div>

            {/* Days Grid */}
            <div className={styles.daysGrid}>
              {plan.days.map((day, index) => (
                <div key={index} className={styles.dayCard}>
                  <h4 className={styles.dayTitle}>
                    {day.day} — {day.focus}
                  </h4>
                  <div className={styles.exerciseList}>
                    {day.exercises.map((exercise, exIndex) => (
                      <p key={exIndex} className={styles.exerciseItem}>
                        {exercise}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkoutPlans;