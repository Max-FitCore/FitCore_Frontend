import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Star,
  ArrowRight,
  UserCheck,
  Dumbbell,
  BarChart3,
  CalendarCheck,
  QrCode,
  CreditCard,
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import heroImage from '../../assets/hero-gym.jpg';
import styles from './Home.module.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/* ============================================================
   Static content (not yet backed by an endpoint)
   ============================================================ */
const testimonials = [
  { quote: 'Booking classes used to be a hassle. Now I see live spots and confirm in seconds.', name: 'Priya Nandan', role: 'Premium member, 8 months' },
  { quote: 'My trainer updates my plan every week and I can see exactly what changed.', name: 'Daniel Ostrowski', role: 'VIP member, 1 year' },
  { quote: 'The attendance tracking keeps me honest. I can see my consistency at a glance.', name: 'Aisha Bello', role: 'Basic member, 4 months' },
];

const features = [
  { icon: UserCheck, title: 'Membership Management', description: 'Plans, renewals, expiry alerts and upgrades handled without paperwork.' },
  { icon: Dumbbell, title: 'Personal Training', description: 'Match members with coaches and track every session in one timeline.' },
  { icon: BarChart3, title: 'Workout Programs', description: 'Structured multi-week blocks with sets, reps, rest and completion tracking.' },
  { icon: CalendarCheck, title: 'Class Booking', description: 'Live capacity, waitlists and instant confirmation across every studio.' },
  { icon: QrCode, title: 'Attendance Management', description: 'QR check-in at the door with full visit history per member.' },
  { icon: CreditCard, title: 'Payments & Revenue', description: 'Invoices, payment status and revenue analytics for the whole gym.' },
];

/* ============================================================
   Role-based navigation
   ============================================================ */
const navigationByRole = {
  member: [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Membership', path: '/membership', icon: UserCheck },
    { name: 'Workout Plans', path: '/workout-plans', icon: Dumbbell },
    { name: 'Classes', path: '/classes', icon: Calendar },
    { name: 'Payments', path: '/payments', icon: CreditCard },
    { name: 'Settings', path: '/settings', icon: Settings },
  ],
  trainer: [
    { name: 'Dashboard', path: '/trainer/overview', icon: LayoutDashboard },
    { name: 'Members', path: '/trainer/members', icon: Users },
    { name: 'Workout Plans', path: '/trainer/workout-plans', icon: Dumbbell },
    { name: 'Schedule', path: '/trainer/schedule', icon: Calendar },
    { name: 'Attendance', path: '/trainer/attendance', icon: CalendarCheck },
    { name: 'Profile', path: '/trainer/profile', icon: User },
  ],
  admin: [
    { name: 'Dashboard', path: '/admin/overview', icon: LayoutDashboard },
    { name: 'Members', path: '/admin/members', icon: Users },
    { name: 'Trainers', path: '/admin/trainers', icon: User },
    { name: 'Classes', path: '/admin/classes', icon: Calendar },
    { name: 'Payments', path: '/admin/payments', icon: CreditCard },
    { name: 'Plans', path: '/admin/plans', icon: BarChart3 },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ],
};

const normalizeRole = (rawRole) => {
  if (!rawRole) return 'member';
  const r = String(rawRole).toLowerCase().trim();
  if (r.includes('admin') || r.includes('administrator')) return 'admin';
  if (r.includes('trainer') || r.includes('coach')) return 'trainer';
  if (r.includes('member') || r.includes('user') || r.includes('client')) return 'member';
  return 'member';
};

const getUserFromStorage = () => {
  try {
    const raw = localStorage.getItem('fitcore_user') || localStorage.getItem('user');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const u = parsed?.data ? parsed.data : parsed;
        if (u && (u.role || u.userRole || u.type)) {
          const role = normalizeRole(u.role || u.userRole || u.type);
          return {
            ...u,
            name: u.name || u.fullName || u.username || u.email || 'User',
            role,
          };
        }
      } catch (e) {
        console.error('Failed to parse stored user:', e);
      }
    }
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role = normalizeRole(payload.role || payload.userRole || payload.type);
        return {
          ...payload,
          name: payload.name || payload.fullName || payload.username || payload.email || 'User',
          role,
        };
      } catch (e) {
        console.error('Failed to decode token:', e);
      }
    }
  } catch (e) {
    console.error('Error reading user from storage:', e);
  }
  return null;
};

const initialsOf = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const durationLabel = (d) => {
  switch (d) {
    case 'Monthly':
      return '/mo';
    case 'Quarterly':
      return '/qtr';
    case 'Half-Yearly':
      return '/6mo';
    case 'Yearly':
      return '/yr';
    default:
      return '/mo';
  }
};

/* ============================================================
   Component
   ============================================================ */
export default function HomePage() {
  const [user, setUser] = useState(() => getUserFromStorage());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Public trainers state
  const [trainers, setTrainers] = useState([]);
  const [loadingTrainers, setLoadingTrainers] = useState(true);
  const [trainersError, setTrainersError] = useState('');

  // Public plans state
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [plansError, setPlansError] = useState('');

  const featuresRef = useRef(null);
  const plansRef = useRef(null);
  const trainersRef = useRef(null);
  const testimonialsRef = useRef(null);
  const ctaRef = useRef(null);
  const navigate = useNavigate();

  /* ---------- Fetch public trainers ---------- */
  const fetchTrainers = useCallback(async () => {
    try {
      setLoadingTrainers(true);
      setTrainersError('');
      const res = await fetch(`${API_BASE}/api/public/trainers?limit=6`);

      const contentType = res.headers.get('content-type') || '';
      let data;
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        throw new Error(`Server returned non-JSON (${res.status})`);
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || `Failed to load trainers (${res.status})`);
      }
      setTrainers(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error('Fetch trainers error:', err);
      setTrainersError(err.message || 'Failed to load trainers');
      setTrainers([]);
    } finally {
      setLoadingTrainers(false);
    }
  }, []);

  /* ---------- Fetch public membership plans ---------- */
  const fetchPlans = useCallback(async () => {
    try {
      setLoadingPlans(true);
      setPlansError('');
      const res = await fetch(
        `${API_BASE}/api/public/membership-plans?limit=3&sortBy=price&sortOrder=asc`
      );

      const contentType = res.headers.get('content-type') || '';
      let data;
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        throw new Error(`Server returned non-JSON (${res.status})`);
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || `Failed to load plans (${res.status})`);
      }
      setPlans(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error('Fetch plans error:', err);
      setPlansError(err.message || 'Failed to load plans');
      setPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  }, []);

  useEffect(() => {
    fetchTrainers();
    fetchPlans();
  }, [fetchTrainers, fetchPlans]);

  /* ---------- Sync user across tabs ---------- */
  useEffect(() => {
    const handleStorageChange = () => setUser(getUserFromStorage());
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  /* ---------- Close dropdown on outside click ---------- */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('fitcore_user');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setIsDropdownOpen(false);
    navigate('/');
  };

  const handleNavigation = (path) => {
    setIsDropdownOpen(false);
    navigate(path);
  };

  const getDashboardPath = () => {
    if (!user) return '/dashboard';
    if (user.role === 'trainer') return '/trainer/overview';
    if (user.role === 'admin') return '/admin/overview';
    return '/dashboard';
  };

  const smoothScrollTo = (elementRef) => {
    if (elementRef.current) {
      elementRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  /* ---------- Scroll animations ---------- */
  useEffect(() => {
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add(styles.visible);
      });
    }, observerOptions);

    const sections = document.querySelectorAll(`.${styles.animateOnScroll}`);
    sections.forEach((section) => observer.observe(section));
    return () => sections.forEach((section) => observer.unobserve(section));
  }, [loadingTrainers, loadingPlans]);

  const navigationItems = user ? navigationByRole[user.role] || [] : [];
  const roleLabel = user ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '';

  const trainerSubtitle = (t) => t.speciality || 'Certified trainer';
  const trainerMeta = (t) => {
    if (t.location) return t.location;
    if (t.availability) return t.availability;
    if (t.certifications) return t.certifications;
    return 'Available for sessions';
  };

  /* ============================================================
     Render
     ============================================================ */
  return (
    <div className={styles.page}>
      {/* Navbar */}
      <header className={styles.navbar}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoMark}>
            <Dumbbell size={18} strokeWidth={2.5} />
          </span>
          <span className={styles.logoText}>
            Fit<span className={styles.accent}>Core</span>
          </span>
        </Link>

        <nav className={styles.navLinks}>
          <a href="#features" onClick={(e) => { e.preventDefault(); smoothScrollTo(featuresRef); }}>Features</a>
          <a href="#plans" onClick={(e) => { e.preventDefault(); smoothScrollTo(plansRef); }}>Plans</a>
          <a href="#trainers" onClick={(e) => { e.preventDefault(); smoothScrollTo(trainersRef); }}>Trainers</a>
          <a href="#testimonials" onClick={(e) => { e.preventDefault(); smoothScrollTo(testimonialsRef); }}>Testimonials</a>
        </nav>

        <div className={styles.navActions}>
          {!user ? (
            <>
              <Link to="/sign-in" className={styles.signIn}>Sign in</Link>
              <Link to="/sign-up" className={styles.primaryBtn}>Join now</Link>
            </>
          ) : (
            <div className={styles.userMenu} ref={dropdownRef}>
              <button
                className={styles.userButton}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-haspopup="true"
                aria-expanded={isDropdownOpen}
              >
                <div className={styles.userAvatar}>{initialsOf(user.name)}</div>
                <span className={styles.userName}>{user.name}</span>
                <ChevronDown
                  size={16}
                  className={`${styles.chevron} ${isDropdownOpen ? styles.chevronOpen : ''}`}
                />
              </button>

              {isDropdownOpen && (
                <div className={styles.dropdownMenu}>
                  <div className={styles.dropdownHeader}>
                    <div className={styles.dropdownAvatar}>{initialsOf(user.name)}</div>
                    <div className={styles.dropdownUserInfo}>
                      <span className={styles.dropdownUserName}>{user.name}</span>
                      <span className={styles.dropdownUserRole}>{roleLabel}</span>
                    </div>
                  </div>

                  <div className={styles.dropdownDivider} />

                  {navigationItems.length > 0 && (
                    <>
                      <nav className={styles.dropdownNav}>
                        {navigationItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.path}
                              className={styles.dropdownItem}
                              onClick={() => handleNavigation(item.path)}
                            >
                              <Icon size={16} className={styles.dropdownIcon} />
                              <span>{item.name}</span>
                            </button>
                          );
                        })}
                      </nav>
                      <div className={styles.dropdownDivider} />
                    </>
                  )}

                  <button
                    className={`${styles.dropdownItem} ${styles.logoutItem}`}
                    onClick={handleSignOut}
                  >
                    <LogOut size={16} className={styles.dropdownIcon} />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <span className={styles.badge}>
            <Star size={14} fill="currentColor" />
            Rated 4.9 by 350+ members
          </span>
          <h1 className={styles.heroTitle}>
            Train with intent.
            <br />
            <span className={styles.accent}>Track every rep.</span>
          </h1>
          <p className={styles.heroDescription}>
            FitCore is the complete gym platform — memberships, coaching, class
            booking, attendance and performance analytics for members, trainers
            and administrators.
          </p>
          <div className={styles.heroActions}>
            {!user ? (
              <>
                <Link to="/sign-up" className={styles.primaryBtnLg}>
                  Join now <ArrowRight size={18} />
                </Link>
                <a
                  href="#plans"
                  className={styles.secondaryBtnLg}
                  onClick={(e) => { e.preventDefault(); smoothScrollTo(plansRef); }}
                >
                  Explore plans
                </a>
              </>
            ) : (
              <button className={styles.primaryBtnLg} onClick={() => handleNavigation(getDashboardPath())}>
                Go to Dashboard <ArrowRight size={18} />
              </button>
            )}
          </div>
          <div className={styles.statsRow}>
            <div className={styles.stat}><span className={styles.statNumber}>351</span><span className={styles.statLabel}>Active members</span></div>
            <div className={styles.stat}><span className={styles.statNumber}>18</span><span className={styles.statLabel}>Expert trainers</span></div>
            <div className={styles.stat}><span className={styles.statNumber}>42</span><span className={styles.statLabel}>Weekly programs</span></div>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.heroImage}>
            <img src={heroImage} alt="Member training with a barbell" />
            <div className={styles.checkinCard}>
              <div>
                <p className={styles.checkinTitle}>Today's check-ins</p>
                <p className={styles.checkinSubtitle}>Live from the front desk</p>
              </div>
              <span className={styles.checkinNumber}>184</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" ref={featuresRef} className={`${styles.features} ${styles.animateOnScroll}`}>
        <div className={styles.sectionHeading}>
          <h2>One platform for the whole gym floor</h2>
          <p>Everything a modern gym runs on, designed for members, trainers and administrators alike.</p>
        </div>
        <div className={styles.featuresGrid}>
          {features.map(({ icon: Icon, title, description }, index) => (
            <div
              key={title}
              className={`${styles.featureCard} ${styles.animateCard}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <span className={styles.featureIcon}><Icon size={20} strokeWidth={2} /></span>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Plans */}
      <section id="plans" ref={plansRef} className={`${styles.plans} ${styles.animateOnScroll}`}>
        <div className={styles.sectionHeading}>
          <h2>Membership plans</h2>
          <p>Transparent pricing. Cancel or upgrade any time from your dashboard.</p>
        </div>

        {loadingPlans && (
          <div className={styles.stateMessage}>
            <Loader2 size={18} className={styles.spinner} />
            Loading plans…
          </div>
        )}

        {!loadingPlans && plansError && (
          <div className={styles.stateError}>
            {plansError}
            <button className={styles.retryBtn} onClick={fetchPlans}>
              Retry
            </button>
          </div>
        )}

        {!loadingPlans && !plansError && plans.length === 0 && (
          <div className={styles.stateMessage}>
            No membership plans available yet. Check back soon.
          </div>
        )}

        {!loadingPlans && !plansError && plans.length > 0 && (
          <div className={styles.plansGrid}>
            {plans.map((plan, index) => {
              const featured = !!plan.isPopular;
              const discount = Number(plan.discount) || 0;
              const originalPrice = Number(plan.price) || 0;
              const effectivePrice = discount > 0
                ? originalPrice * (1 - discount / 100)
                : originalPrice;
              const period = durationLabel(plan.duration);

              return (
                <div
                  key={plan._id}
                  className={`${styles.planCard} ${featured ? styles.planCardFeatured : ''} ${styles.animateCard}`}
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  {featured && <span className={styles.popularBadge}>Most popular</span>}

                  <h3 className={styles.planName}>{plan.planName}</h3>
                  {plan.description && (
                    <p className={styles.planDescription}>{plan.description}</p>
                  )}

                  <p className={styles.planPrice}>
                    ${effectivePrice.toFixed(0)}
                    <span className={styles.planPeriod}>{period}</span>
                  </p>

                  {discount > 0 && (
                    <p className={styles.planDiscountNote}>
                      <span className={styles.planOriginalPrice}>
                        ${originalPrice.toFixed(0)}
                      </span>{' '}
                      · save {discount}%
                    </p>
                  )}

                  <ul className={styles.planFeatures}>
                    {(plan.features || []).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    className={featured ? styles.primaryBtn : styles.secondaryBtn}
                    onClick={() => {
                      if (user) handleNavigation('/membership');
                      else navigate('/sign-in');
                    }}
                  >
                    {user ? 'Choose plan' : 'Join now'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Trainers */}
      <section id="trainers" ref={trainersRef} className={`${styles.trainers} ${styles.animateOnScroll}`}>
        <div className={styles.sectionHeading}>
          <h2>Train with people who show up for you</h2>
          <p>Certified coaches across strength, mobility, and conditioning — matched to your goals.</p>
        </div>

        {loadingTrainers && (
          <div className={styles.stateMessage}>
            <Loader2 size={18} className={styles.spinner} />
            Loading trainers…
          </div>
        )}

        {!loadingTrainers && trainersError && (
          <div className={styles.stateError}>
            {trainersError}
            <button className={styles.retryBtn} onClick={fetchTrainers}>
              Retry
            </button>
          </div>
        )}

        {!loadingTrainers && !trainersError && trainers.length === 0 && (
          <div className={styles.stateMessage}>
            No trainers available yet. Check back soon.
          </div>
        )}

        {!loadingTrainers && !trainersError && trainers.length > 0 && (
          <div className={styles.trainersGrid}>
            {trainers.map((trainer, index) => {
              const hasPhoto = !!trainer.profilePicture?.url;
              return (
                <div
                  key={trainer._id}
                  className={`${styles.trainerCard} ${styles.animateCard}`}
                  style={{ animationDelay: `${index * 0.12}s` }}
                >
                  <div className={styles.trainerImage}>
                    {hasPhoto ? (
                      <img src={trainer.profilePicture.url} alt={trainer.fullName} />
                    ) : (
                      <div className={styles.trainerInitials}>
                        {initialsOf(trainer.fullName)}
                      </div>
                    )}
                  </div>
                  <div className={styles.trainerInfo}>
                    <div className={styles.trainerHeader}>
                      <h3>{trainer.fullName || 'Trainer'}</h3>
                    </div>
                    <p className={styles.trainerSpecialty}>{trainerSubtitle(trainer)}</p>
                    <p className={styles.trainerExperience}>{trainerMeta(trainer)}</p>
                    <button
                      type="button"
                      className={styles.secondaryBtn}
                      onClick={() => navigate(user ? '/classes' : '/sign-up')}
                    >
                      {user ? 'Book a session' : 'Join to book'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Testimonials */}
      <section id="testimonials" ref={testimonialsRef} className={`${styles.testimonials} ${styles.animateOnScroll}`}>
        <div className={styles.sectionHeading}>
          <h2>What members are saying</h2>
          <p>Real feedback from people training on FitCore every week.</p>
        </div>
        <div className={styles.testimonialsGrid}>
          {testimonials.map((t, index) => (
            <div
              key={t.name}
              className={`${styles.testimonialCard} ${styles.animateCard}`}
              style={{ animationDelay: `${index * 0.12}s` }}
            >
              <div className={styles.testimonialStars}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>
              <p className={styles.testimonialQuote}>&ldquo;{t.quote}&rdquo;</p>
              <div className={styles.testimonialAuthor}>
                <p className={styles.testimonialName}>{t.name}</p>
                <p className={styles.testimonialRole}>{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section ref={ctaRef} className={`${styles.ctaSection} ${styles.animateOnScroll}`}>
        <div className={styles.ctaCard}>
          <h2>Ready to train with intent?</h2>
          <p>Create your account and get matched with a plan and trainer in minutes.</p>
          <div className={styles.heroActions}>
            {!user ? (
              <>
                <Link to="/sign-up" className={styles.primaryBtnLg}>
                  Join now <ArrowRight size={18} />
                </Link>
                <a
                  href="#plans"
                  className={styles.secondaryBtnLg}
                  onClick={(e) => { e.preventDefault(); smoothScrollTo(plansRef); }}
                >
                  Explore plans
                </a>
              </>
            ) : (
              <button className={styles.primaryBtnLg} onClick={() => handleNavigation(getDashboardPath())}>
                Go to Dashboard <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.logo}>
          <span className={styles.logoMark}>
            <Dumbbell size={16} strokeWidth={2.5} />
          </span>
          <span className={styles.logoText}>
            Fit<span className={styles.accent}>Core</span>
          </span>
        </div>
        <p className={styles.footerText}>© {new Date().getFullYear()} FitCore. All rights reserved.</p>
      </footer>
    </div>
  );
}