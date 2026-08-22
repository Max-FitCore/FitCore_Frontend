import React, { useState, useEffect } from 'react';
import { 
  ArrowRight,
  Calendar,
  Clock,
  Dumbbell,
  Flame,
  Target,
  Trophy,
  Users,
  TrendingUp,
  TrendingDown,
  Award,
  Play,
  Plus,
  BarChart3,
  ChevronRight
} from 'lucide-react';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  // Real-time greeting and time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hour = now.getHours();
      let greet = '';
      if (hour < 12) greet = 'Good Morning';
      else if (hour < 17) greet = 'Good Afternoon';
      else greet = 'Good Evening';
      setGreeting(greet);
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Mock user data
  const user = {
    name: 'John Doe',
    membership: 'Premium',
    streak: 15,
    level: 42
  };

  // Stats data
  const stats = [
    { 
      id: 1, 
      icon: Dumbbell, 
      value: '24', 
      label: 'Workouts This Month', 
      change: '+12%', 
      trend: 'up',
      color: '#A6F13B'
    },
    { 
      id: 2, 
      icon: Flame, 
      value: '1,847', 
      label: 'Calories Burned', 
      change: '+8%', 
      trend: 'up',
      color: '#F59E0B'
    },
    { 
      id: 3, 
      icon: Calendar, 
      value: '12', 
      label: 'Days Active', 
      change: '+3%', 
      trend: 'up',
      color: '#3B82F6'
    },
    { 
      id: 4, 
      icon: Trophy, 
      value: '8', 
      label: 'Achievements', 
      change: '2 new', 
      trend: 'up',
      color: '#8B5CF6'
    },
  ];

  // Weekly progress data
  const weeklyData = [
    { day: 'Mon', value: 65, label: '65%' },
    { day: 'Tue', value: 45, label: '45%' },
    { day: 'Wed', value: 80, label: '80%' },
    { day: 'Thu', value: 55, label: '55%' },
    { day: 'Fri', value: 90, label: '90%' },
    { day: 'Sat', value: 70, label: '70%' },
    { day: 'Sun', value: 30, label: '30%' },
  ];

  // Upcoming sessions
  const sessions = [
    {
      id: 1,
      time: '09:00',
      period: 'AM',
      name: 'Morning HIIT',
      trainer: 'Sarah Johnson',
      duration: '45 min',
      type: 'Cardio',
      status: 'today',
      intensity: 'High',
      location: 'Studio A'
    },
    {
      id: 2,
      time: '14:30',
      period: 'PM',
      name: 'Strength Training',
      trainer: 'Mike Chen',
      duration: '60 min',
      type: 'Strength',
      status: 'today',
      intensity: 'Medium',
      location: 'Weight Room'
    },
    {
      id: 3,
      time: '18:00',
      period: 'PM',
      name: 'Yoga Flow',
      trainer: 'Emily Rodriguez',
      duration: '50 min',
      type: 'Flexibility',
      status: 'tomorrow',
      intensity: 'Low',
      location: 'Studio B'
    },
    {
      id: 4,
      time: '07:30',
      period: 'AM',
      name: 'Spin Cycling',
      trainer: 'Jordan Blake',
      duration: '45 min',
      type: 'Cardio',
      status: 'tomorrow',
      intensity: 'High',
      location: 'Cycle Studio'
    },
  ];

  // Recent achievements
  const achievements = [
    { id: 1, icon: '🏆', name: '10 Workouts Completed', date: '2 days ago', color: '#F59E0B' },
    { id: 2, icon: '🔥', name: '7 Day Streak', date: '4 days ago', color: '#EF4444' },
    { id: 3, icon: '💪', name: 'PR: Squat 225 lbs', date: '5 days ago', color: '#A6F13B' },
    { id: 4, icon: '⭐', name: 'Perfect Attendance Week', date: '1 week ago', color: '#8B5CF6' },
  ];

  // Quick actions
  const quickActions = [
    { id: 1, icon: Dumbbell, label: 'Start Workout', color: '#A6F13B', action: 'start' },
    { id: 2, icon: Plus, label: 'Create Plan', color: '#3B82F6', action: 'create' },
    { id: 3, icon: Users, label: 'Book Class', color: '#8B5CF6', action: 'book' },
    { id: 4, icon: BarChart3, label: 'View Progress', color: '#F59E0B', action: 'progress' },
  ];

  const getStatusClass = (status) => {
    if (status === 'today') return styles.statusToday;
    return styles.statusTomorrow;
  };

  const getIntensityBadge = (intensity) => {
    const classes = {
      'High': styles.intensityHigh,
      'Medium': styles.intensityMedium,
      'Low': styles.intensityLow,
    };
    return classes[intensity] || styles.intensityMedium;
  };

  const getGreetingEmoji = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅';
    if (hour < 17) return '☀️';
    return '🌙';
  };

  return (
    <div className={styles.dashboard}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div className={styles.greetingSection}>
          <div className={styles.greetingIcon}>{getGreetingEmoji()}</div>
          <div>
            <h2 className={styles.greeting}>{greeting}, {user.name} 👋</h2>
            <p className={styles.greetingSub}>Let's crush your fitness goals today!</p>
          </div>
        </div>
        <div className={styles.topBarActions}>
          <div className={styles.timeDisplay}>
            <Clock size={16} />
            <span>{currentTime}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.id} className={styles.statCard}>
              <div className={styles.statIconWrapper} style={{ background: `${stat.color}15` }}>
                <Icon size={20} style={{ color: stat.color }} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{stat.value}</div>
                <div className={styles.statLabel}>{stat.label}</div>
                <div className={styles.statChange}>
                  {stat.trend === 'up' ? (
                    <TrendingUp size={12} className={styles.changeUp} />
                  ) : (
                    <TrendingDown size={12} className={styles.changeDown} />
                  )}
                  <span className={stat.trend === 'up' ? styles.changeUp : styles.changeDown}>
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className={styles.contentGrid}>
        {/* Left Column */}
        <div className={styles.leftColumn}>
          {/* Weekly Progress */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Weekly Progress</h3>
              <button className={styles.cardAction}>View All →</button>
            </div>
            <div className={styles.weeklyChart}>
              {weeklyData.map((day, index) => (
                <div key={index} className={styles.barWrapper}>
                  <div className={styles.barContainer}>
                    <div 
                      className={styles.barFill} 
                      style={{ 
                        height: `${day.value}%`,
                        animationDelay: `${index * 0.1}s`
                      }}
                    />
                    <span className={styles.barValue}>{day.label}</span>
                  </div>
                  <span className={styles.barDay}>{day.day}</span>
                </div>
              ))}
            </div>
            <div className={styles.cardFooter}>
              <div className={styles.footerStat}>
                <span className={styles.footerLabel}>Average</span>
                <span className={styles.footerValue}>75%</span>
              </div>
              <div className={styles.footerStat}>
                <span className={styles.footerLabel}>Best Day</span>
                <span className={styles.footerValue}>Fri (90%)</span>
              </div>
              <div className={styles.footerStat}>
                <span className={styles.footerLabel}>Progress</span>
                <span className={styles.footerValue}>↑ 12%</span>
              </div>
            </div>
          </div>

          {/* Recent Achievements */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Recent Achievements</h3>
              <button className={styles.cardAction}>View All →</button>
            </div>
            <div className={styles.achievementList}>
              {achievements.map((achievement) => (
                <div key={achievement.id} className={styles.achievementItem}>
                  <div className={styles.achievementIcon} style={{ background: `${achievement.color}20` }}>
                    {achievement.icon}
                  </div>
                  <div className={styles.achievementInfo}>
                    <span className={styles.achievementName}>{achievement.name}</span>
                    <span className={styles.achievementDate}>{achievement.date}</span>
                  </div>
                  <Award size={16} className={styles.achievementBadge} style={{ color: achievement.color }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className={styles.rightColumn}>
          {/* User Stats Card */}
          <div className={styles.userCard}>
            <div className={styles.userCardBg} />
            <div className={styles.userCardContent}>
              <div className={styles.userCardTop}>
                <div className={styles.userCardAvatar}>
                  <img 
                    src="https://ui-avatars.com/api/?name=John+Doe&background=A6F13B&color=05070A&size=128" 
                    alt="User" 
                  />
                  <span className={styles.userCardLevel}>Lv.{user.level}</span>
                </div>
                <div className={styles.userCardInfo}>
                  <h4>{user.name}</h4>
                  <span className={styles.userCardMembership}>{user.membership}</span>
                </div>
              </div>
              <div className={styles.userCardStats}>
                <div className={styles.userCardStat}>
                  <span className={styles.userCardStatValue}>{user.streak}</span>
                  <span className={styles.userCardStatLabel}>Day Streak</span>
                </div>
                <div className={styles.userCardDivider} />
                <div className={styles.userCardStat}>
                  <span className={styles.userCardStatValue}>{user.level}</span>
                  <span className={styles.userCardStatLabel}>Level</span>
                </div>
                <div className={styles.userCardDivider} />
                <div className={styles.userCardStat}>
                  <span className={styles.userCardStatValue}>89%</span>
                  <span className={styles.userCardStatLabel}>Completion</span>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Sessions */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Upcoming Sessions</h3>
              <button className={styles.cardAction}>View All →</button>
            </div>
            <div className={styles.sessionList}>
              {sessions.map((session) => (
                <div key={session.id} className={styles.sessionItem}>
                  <div className={styles.sessionTime}>
                    <span className={styles.sessionTimeHour}>{session.time}</span>
                    <span className={styles.sessionTimeAm}>{session.period}</span>
                  </div>
                  <div className={styles.sessionInfo}>
                    <div className={styles.sessionTop}>
                      <h4 className={styles.sessionName}>{session.name}</h4>
                      <span className={`${styles.sessionStatus} ${getStatusClass(session.status)}`}>
                        {session.status === 'today' ? 'Today' : 'Tomorrow'}
                      </span>
                    </div>
                    <p className={styles.sessionDetails}>
                      {session.trainer} • {session.duration} • {session.location}
                    </p>
                    <div className={styles.sessionTags}>
                      <span className={styles.sessionType}>{session.type}</span>
                      <span className={`${styles.intensityBadge} ${getIntensityBadge(session.intensity)}`}>
                        {session.intensity}
                      </span>
                    </div>
                  </div>
                  <button className={styles.sessionAction}>
                    <Play size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className={styles.quickActions}>
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button key={action.id} className={styles.quickAction}>
                  <div className={styles.quickActionIcon} style={{ background: `${action.color}20`, color: action.color }}>
                    <Icon size={20} />
                  </div>
                  <span className={styles.quickActionLabel}>{action.label}</span>
                  <ChevronRight size={16} className={styles.quickActionArrow} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;