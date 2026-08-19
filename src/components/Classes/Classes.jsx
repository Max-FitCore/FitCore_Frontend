import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  User,
  Search,
  Filter,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  Clock as ClockIcon,
  ChevronRight,
  Download,
  Calendar as CalendarIcon,
  List,
  Grid,
  Star,
  TrendingUp,
  TrendingDown,
  Award,
  Dumbbell,
  Heart,
  Zap,
  Sparkles,
  BookOpen,
  ArrowRight,
  MoreVertical,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import styles from './Classes.module.css';

const Classes = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);
  const [showClassDetails, setShowClassDetails] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Upcoming classes
  const upcomingClasses = [
    {
      id: 1,
      name: 'Morning HIIT Blast',
      instructor: 'Sarah Johnson',
      time: '09:00 AM - 09:45 AM',
      date: '2026-01-20',
      duration: 45,
      capacity: 20,
      booked: 15,
      waitlist: 3,
      location: 'Studio A',
      level: 'Intermediate',
      type: 'Cardio',
      image: '🔥',
      description: 'High-intensity interval training to boost your metabolism and burn fat.',
      equipment: ['Mat', 'Dumbbells', 'Kettlebell'],
      isBooked: false,
      isWaitlisted: false,
      rating: 4.8,
      reviews: 24
    },
    {
      id: 2,
      name: 'Power Yoga Flow',
      instructor: 'Emily Rodriguez',
      time: '11:00 AM - 12:00 PM',
      date: '2026-01-20',
      duration: 60,
      capacity: 15,
      booked: 12,
      waitlist: 0,
      location: 'Studio B',
      level: 'All Levels',
      type: 'Flexibility',
      image: '🧘',
      description: 'Dynamic yoga flow combining strength, flexibility, and mindfulness.',
      equipment: ['Yoga Mat', 'Blocks'],
      isBooked: true,
      isWaitlisted: false,
      rating: 4.9,
      reviews: 31
    },
    {
      id: 3,
      name: 'Strength & Conditioning',
      instructor: 'Mike Chen',
      time: '02:00 PM - 03:15 PM',
      date: '2026-01-20',
      duration: 75,
      capacity: 12,
      booked: 12,
      waitlist: 5,
      location: 'Weight Room',
      level: 'Advanced',
      type: 'Strength',
      image: '💪',
      description: 'Full-body strength training with compound lifts and functional movements.',
      equipment: ['Barbell', 'Dumbbells', 'Pull-up Bar'],
      isBooked: false,
      isWaitlisted: true,
      rating: 4.7,
      reviews: 18
    },
    {
      id: 4,
      name: 'Spin Cycling',
      instructor: 'Jordan Blake',
      time: '06:30 PM - 07:15 PM',
      date: '2026-01-20',
      duration: 45,
      capacity: 25,
      booked: 22,
      waitlist: 8,
      location: 'Cycle Studio',
      level: 'Intermediate',
      type: 'Cardio',
      image: '🚴',
      description: 'High-energy indoor cycling with intervals and hill climbs.',
      equipment: ['Spin Bike', 'Towel'],
      isBooked: false,
      isWaitlisted: false,
      rating: 4.6,
      reviews: 42
    },
    {
      id: 5,
      name: 'Pilates Core',
      instructor: 'Elena Cho',
      time: '10:00 AM - 10:50 AM',
      date: '2026-01-21',
      duration: 50,
      capacity: 10,
      booked: 8,
      waitlist: 2,
      location: 'Studio A',
      level: 'Beginner',
      type: 'Flexibility',
      image: '🧘',
      description: 'Core-focused Pilates class for stability, posture, and strength.',
      equipment: ['Mat', 'Resistance Bands'],
      isBooked: false,
      isWaitlisted: false,
      rating: 4.9,
      reviews: 27
    },
    {
      id: 6,
      name: 'Boxing Fundamentals',
      instructor: 'Marcus Reid',
      time: '07:00 PM - 08:00 PM',
      date: '2026-01-21',
      duration: 60,
      capacity: 16,
      booked: 14,
      waitlist: 4,
      location: 'Boxing Ring',
      level: 'All Levels',
      type: 'Combat',
      image: '🥊',
      description: 'Learn boxing fundamentals with heavy bags, pads, and footwork drills.',
      equipment: ['Boxing Gloves', 'Hand Wraps'],
      isBooked: false,
      isWaitlisted: false,
      rating: 4.8,
      reviews: 19
    },
  ];

  // Available classes for booking
  const availableClasses = [
    {
      id: 7,
      name: 'Functional Fitness',
      instructor: 'Mike Chen',
      time: '08:00 AM - 09:00 AM',
      date: '2026-01-22',
      duration: 60,
      capacity: 18,
      booked: 6,
      waitlist: 0,
      location: 'Main Floor',
      level: 'Intermediate',
      type: 'Strength',
      image: '🏋️',
      description: 'Functional movement patterns for everyday strength and mobility.',
      equipment: ['Kettlebell', 'Medicine Ball', 'Resistance Bands'],
      isBooked: false,
      isWaitlisted: false,
      rating: 4.5,
      reviews: 15
    },
    {
      id: 8,
      name: 'Zumba Dance',
      instructor: 'Sarah Johnson',
      time: '10:30 AM - 11:30 AM',
      date: '2026-01-22',
      duration: 60,
      capacity: 30,
      booked: 28,
      waitlist: 10,
      location: 'Studio B',
      level: 'All Levels',
      type: 'Cardio',
      image: '💃',
      description: 'Latin-inspired dance fitness class that feels like a party.',
      equipment: ['Tennis Shoes'],
      isBooked: false,
      isWaitlisted: false,
      rating: 4.7,
      reviews: 56
    },
    {
      id: 9,
      name: 'Mindful Meditation',
      instructor: 'Emily Rodriguez',
      time: '12:00 PM - 12:30 PM',
      date: '2026-01-22',
      duration: 30,
      capacity: 20,
      booked: 18,
      waitlist: 2,
      location: 'Studio A',
      level: 'Beginner',
      type: 'Flexibility',
      image: '🧘',
      description: 'Guided meditation for stress reduction and mental clarity.',
      equipment: ['Yoga Mat', 'Meditation Pillow'],
      isBooked: false,
      isWaitlisted: false,
      rating: 4.9,
      reviews: 38
    },
  ];

  // Class statistics
  const classStats = {
    totalClasses: 24,
    classesThisMonth: 12,
    attended: 9,
    attendanceRate: 75,
    favoriteClass: 'Morning HIIT Blast',
    streak: 4,
  };

  const getLevelBadge = (level) => {
    const levels = {
      'Beginner': { label: 'Beginner', className: styles.levelBeginner },
      'Intermediate': { label: 'Intermediate', className: styles.levelIntermediate },
      'Advanced': { label: 'Advanced', className: styles.levelAdvanced },
      'All Levels': { label: 'All Levels', className: styles.levelAll },
    };
    return levels[level] || levels['All Levels'];
  };

  const getTypeIcon = (type) => {
    const icons = {
      'Cardio': '🔥',
      'Strength': '💪',
      'Flexibility': '🧘',
      'Combat': '🥊',
    };
    return icons[type] || '🏋️';
  };

  const getStatusBadge = (classItem) => {
    if (classItem.isBooked) {
      return { label: 'Booked', className: styles.statusBooked };
    }
    if (classItem.isWaitlisted) {
      return { label: 'Waitlisted', className: styles.statusWaitlisted };
    }
    if (classItem.booked >= classItem.capacity) {
      return { label: 'Full', className: styles.statusFull };
    }
    return { label: 'Available', className: styles.statusAvailable };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleBookClass = (classItem) => {
    setSelectedClass(classItem);
    setShowBookingModal(true);
  };

  const handleJoinWaitlist = (classItem) => {
    setSelectedClass(classItem);
    setShowWaitlistModal(true);
  };

  const handleViewClass = (classItem) => {
    setSelectedClass(classItem);
    setShowClassDetails(true);
  };

  const confirmBooking = () => {
    console.log(`Booking class: ${selectedClass?.name}`);
    setShowBookingModal(false);
    // Show success toast
  };

  const confirmWaitlist = () => {
    console.log(`Joining waitlist for: ${selectedClass?.name}`);
    setShowWaitlistModal(false);
    // Show success toast
  };

  const filteredClasses = [...upcomingClasses, ...availableClasses].filter(classItem =>
    classItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    classItem.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    classItem.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.classes}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Classes</h1>
          <p className={styles.pageSubtitle}>Book classes, track your schedule, and discover new workouts</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnSecondary}>
            <Download size={18} />
            Export Schedule
          </button>
          <button className={styles.btnPrimary}>
            <Plus size={18} />
            Create Class
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(166, 241, 59, 0.15)', color: '#A6F13B' }}>
            <Calendar size={20} />
          </div>
          <div>
            <div className={styles.statNumber}>{classStats.totalClasses}</div>
            <div className={styles.statLabel}>Total Classes</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6' }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <div className={styles.statNumber}>{classStats.classesThisMonth}</div>
            <div className={styles.statLabel}>This Month</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22C55E' }}>
            <CheckCircle size={20} />
          </div>
          <div>
            <div className={styles.statNumber}>{classStats.attended}</div>
            <div className={styles.statLabel}>Attended</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
            <Award size={20} />
          </div>
          <div>
            <div className={styles.statNumber}>{classStats.attendanceRate}%</div>
            <div className={styles.statLabel}>Attendance Rate</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6' }}>
            <Sparkles size={20} />
          </div>
          <div>
            <div className={styles.statNumber}>{classStats.streak}</div>
            <div className={styles.statLabel}>Week Streak</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'upcoming' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          <CalendarIcon size={16} />
          Upcoming
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'available' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('available')}
        >
          <BookOpen size={16} />
          Available
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'history' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <ClockIcon size={16} />
          History
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'favorites' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('favorites')}
        >
          <Star size={16} />
          Favorites
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {/* Upcoming & Available Classes */}
        {(activeTab === 'upcoming' || activeTab === 'available') && (
          <div className={styles.classesTab}>
            <div className={styles.toolbar}>
              <div className={styles.searchWrapper}>
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Search classes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
              <div className={styles.toolbarActions}>
                <div className={styles.viewToggle}>
                  <button
                    className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.viewActive : ''}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid size={16} />
                  </button>
                  <button
                    className={`${styles.viewBtn} ${viewMode === 'list' ? styles.viewActive : ''}`}
                    onClick={() => setViewMode('list')}
                  >
                    <List size={16} />
                  </button>
                </div>
                <button className={styles.filterBtn}>
                  <Filter size={18} />
                  Filter
                </button>
              </div>
            </div>

            {filteredClasses.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🏫</div>
                <h3 className={styles.emptyTitle}>No classes found</h3>
                <p className={styles.emptyDescription}>
                  Try adjusting your search or filter to find available classes.
                </p>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? styles.classesGrid : styles.classesList}>
                {filteredClasses.map((classItem) => {
                  const status = getStatusBadge(classItem);
                  const level = getLevelBadge(classItem.level);
                  const isFull = classItem.booked >= classItem.capacity;
                  const canBook = !classItem.isBooked && !classItem.isWaitlisted && !isFull;

                  return (
                    <div key={classItem.id} className={viewMode === 'grid' ? styles.classCard : styles.classListItem}>
                      <div className={styles.classCardHeader}>
                        <div className={styles.classCardTop}>
                          <span className={styles.classEmoji}>{classItem.image}</span>
                          <span className={`${styles.levelBadge} ${level.className}`}>
                            {level.label}
                          </span>
                          <span className={styles.classType}>{classItem.type}</span>
                        </div>
                        <span className={`${styles.statusBadge} ${status.className}`}>
                          {status.label}
                        </span>
                      </div>

                      <h3 className={styles.classCardName}>{classItem.name}</h3>
                      <p className={styles.classCardDescription}>{classItem.description}</p>

                      <div className={styles.classCardMeta}>
                        <div className={styles.metaItem}>
                          <Clock size={14} />
                          <span>{classItem.time}</span>
                        </div>
                        <div className={styles.metaItem}>
                          <Calendar size={14} />
                          <span>{formatDate(classItem.date)}</span>
                        </div>
                        <div className={styles.metaItem}>
                          <MapPin size={14} />
                          <span>{classItem.location}</span>
                        </div>
                        <div className={styles.metaItem}>
                          <User size={14} />
                          <span>{classItem.instructor}</span>
                        </div>
                      </div>

                      <div className={styles.classCardStats}>
                        <div className={styles.statItem}>
                          <Users size={14} />
                          <span>{classItem.booked}/{classItem.capacity}</span>
                        </div>
                        <div className={styles.statItem}>
                          <Clock size={14} />
                          <span>{classItem.duration} min</span>
                        </div>
                        {classItem.waitlist > 0 && (
                          <div className={styles.statItem}>
                            <AlertCircle size={14} />
                            <span>{classItem.waitlist} waitlist</span>
                          </div>
                        )}
                        <div className={styles.statItem}>
                          <Star size={14} />
                          <span>{classItem.rating} ({classItem.reviews})</span>
                        </div>
                      </div>

                      <div className={styles.classCardActions}>
                        {classItem.isBooked ? (
                          <button 
                            className={styles.btnBooked}
                            onClick={() => handleViewClass(classItem)}
                          >
                            <CheckCircle size={16} />
                            Booked
                          </button>
                        ) : classItem.isWaitlisted ? (
                          <button 
                            className={styles.btnWaitlisted}
                            onClick={() => handleViewClass(classItem)}
                          >
                            <ClockIcon size={16} />
                            Waitlisted
                          </button>
                        ) : isFull ? (
                          <button 
                            className={styles.btnSecondary}
                            onClick={() => handleJoinWaitlist(classItem)}
                          >
                            Join Waitlist
                          </button>
                        ) : (
                          <button 
                            className={styles.btnPrimary}
                            onClick={() => handleBookClass(classItem)}
                          >
                            Book Now
                            <ArrowRight size={16} />
                          </button>
                        )}
                        <button 
                          className={styles.btnIcon}
                          onClick={() => handleViewClass(classItem)}
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className={styles.historyTab}>
            <div className={styles.historyList}>
              <div className={styles.historyHeader}>
                <span>Class</span>
                <span>Date</span>
                <span>Instructor</span>
                <span>Duration</span>
                <span>Status</span>
              </div>
              {upcomingClasses.slice(0, 3).map((classItem) => (
                <div key={classItem.id} className={styles.historyItem}>
                  <div className={styles.historyClass}>
                    <span className={styles.historyEmoji}>{classItem.image}</span>
                    <div>
                      <div className={styles.historyName}>{classItem.name}</div>
                      <div className={styles.historyType}>{classItem.type}</div>
                    </div>
                  </div>
                  <div className={styles.historyDate}>{formatDate(classItem.date)}</div>
                  <div className={styles.historyInstructor}>{classItem.instructor}</div>
                  <div className={styles.historyDuration}>{classItem.duration} min</div>
                  <div className={styles.historyStatus}>
                    <span className={`${styles.statusBadge} ${classItem.isBooked ? styles.statusBooked : styles.statusAvailable}`}>
                      {classItem.isBooked ? 'Attended' : 'Missed'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <div className={styles.favoritesTab}>
            <div className={styles.favoritesGrid}>
              {upcomingClasses
                .filter(c => c.rating >= 4.8)
                .slice(0, 3)
                .map((classItem) => (
                  <div key={classItem.id} className={styles.favoriteCard}>
                    <div className={styles.favoriteHeader}>
                      <span className={styles.favoriteEmoji}>{classItem.image}</span>
                      <span className={styles.favoriteStar}>⭐</span>
                    </div>
                    <h3 className={styles.favoriteName}>{classItem.name}</h3>
                    <p className={styles.favoriteInstructor}>with {classItem.instructor}</p>
                    <div className={styles.favoriteMeta}>
                      <span>{classItem.type}</span>
                      <span>•</span>
                      <span>{classItem.duration} min</span>
                      <span>•</span>
                      <span>{classItem.rating} ★</span>
                    </div>
                    <button className={styles.btnPrimarySmall}>
                      Book Again
                      <ArrowRight size={14} />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedClass && (
        <div className={styles.modalOverlay} onClick={() => setShowBookingModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>Confirm Booking</h2>
                <div className={styles.modalSubtitle}>{selectedClass.name}</div>
              </div>
              <button 
                className={styles.modalClose}
                onClick={() => setShowBookingModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.bookingSummary}>
                <div className={styles.bookingItem}>
                  <Calendar size={16} />
                  <span>{formatDate(selectedClass.date)}</span>
                </div>
                <div className={styles.bookingItem}>
                  <Clock size={16} />
                  <span>{selectedClass.time}</span>
                </div>
                <div className={styles.bookingItem}>
                  <MapPin size={16} />
                  <span>{selectedClass.location}</span>
                </div>
                <div className={styles.bookingItem}>
                  <User size={16} />
                  <span>{selectedClass.instructor}</span>
                </div>
              </div>
              <div className={styles.bookingNotice}>
                <AlertCircle size={16} />
                <span>Please arrive 10 minutes before class starts.</span>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.btnSecondary}
                onClick={() => setShowBookingModal(false)}
              >
                Cancel
              </button>
              <button 
                className={styles.btnPrimary}
                onClick={confirmBooking}
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Waitlist Modal */}
      {showWaitlistModal && selectedClass && (
        <div className={styles.modalOverlay} onClick={() => setShowWaitlistModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>Join Waitlist</h2>
                <div className={styles.modalSubtitle}>{selectedClass.name}</div>
              </div>
              <button 
                className={styles.modalClose}
                onClick={() => setShowWaitlistModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.waitlistInfo}>
                <div className={styles.waitlistIcon}>
                  <AlertCircle size={32} />
                </div>
                <p className={styles.waitlistDescription}>
                  This class is currently full. Join the waitlist and we'll notify you if a spot becomes available.
                </p>
                <div className={styles.waitlistStats}>
                  <div className={styles.waitlistStat}>
                    <span className={styles.waitlistStatLabel}>Current waitlist</span>
                    <span className={styles.waitlistStatValue}>{selectedClass.waitlist} people</span>
                  </div>
                  <div className={styles.waitlistStat}>
                    <span className={styles.waitlistStatLabel}>Your position</span>
                    <span className={styles.waitlistStatValue}>#{selectedClass.waitlist + 1}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.btnSecondary}
                onClick={() => setShowWaitlistModal(false)}
              >
                Cancel
              </button>
              <button 
                className={styles.btnPrimary}
                onClick={confirmWaitlist}
              >
                Join Waitlist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Class Details Modal */}
      {showClassDetails && selectedClass && (
        <div className={styles.modalOverlay} onClick={() => setShowClassDetails(false)}>
          <div className={styles.modalLarge} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <div className={styles.modalEmoji}>{selectedClass.image}</div>
                <h2 className={styles.modalTitle}>{selectedClass.name}</h2>
                <div className={styles.modalMeta}>
                  <span className={styles.classType}>{selectedClass.type}</span>
                  <span className={`${styles.levelBadge} ${getLevelBadge(selectedClass.level).className}`}>
                    {getLevelBadge(selectedClass.level).label}
                  </span>
                </div>
              </div>
              <button 
                className={styles.modalClose}
                onClick={() => setShowClassDetails(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Instructor</span>
                  <span className={styles.detailValue}>{selectedClass.instructor}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Date</span>
                  <span className={styles.detailValue}>{formatDate(selectedClass.date)}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Time</span>
                  <span className={styles.detailValue}>{selectedClass.time}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Duration</span>
                  <span className={styles.detailValue}>{selectedClass.duration} minutes</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Location</span>
                  <span className={styles.detailValue}>{selectedClass.location}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Capacity</span>
                  <span className={styles.detailValue}>{selectedClass.booked}/{selectedClass.capacity}</span>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h4 className={styles.detailSectionTitle}>Description</h4>
                <p className={styles.detailDescription}>{selectedClass.description}</p>
              </div>

              <div className={styles.detailSection}>
                <h4 className={styles.detailSectionTitle}>Equipment Needed</h4>
                <div className={styles.equipmentList}>
                  {selectedClass.equipment.map((item, index) => (
                    <span key={index} className={styles.equipmentTag}>{item}</span>
                  ))}
                </div>
              </div>

              <div className={styles.detailSection}>
                <h4 className={styles.detailSectionTitle}>Rating</h4>
                <div className={styles.ratingDisplay}>
                  <span className={styles.ratingStars}>⭐</span>
                  <span className={styles.ratingValue}>{selectedClass.rating}</span>
                  <span className={styles.ratingReviews}>({selectedClass.reviews} reviews)</span>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.btnSecondary}
                onClick={() => setShowClassDetails(false)}
              >
                Close
              </button>
              {!selectedClass.isBooked && !selectedClass.isWaitlisted && selectedClass.booked < selectedClass.capacity && (
                <button 
                  className={styles.btnPrimary}
                  onClick={() => {
                    setShowClassDetails(false);
                    handleBookClass(selectedClass);
                  }}
                >
                  Book Now
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classes;