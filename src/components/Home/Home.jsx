import React, { useEffect, useRef } from 'react';
import { Star, ArrowRight, UserCheck, Dumbbell, BarChart3, CalendarCheck, QrCode, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImage from '../../assets/hero-gym.jpg';
import styles from './Home.module.css';

const trainers = [
  {
    name: 'Marcus Reid',
    specialty: 'Strength & Conditioning',
    experience: '9 yrs experience',
    rating: '4.9',
    image: '/images/trainer-marcus.jpg',
  },
  {
    name: 'Elena Cho',
    specialty: 'Mobility & Recovery',
    experience: '6 yrs experience',
    rating: '4.8',
    image: '/images/trainer-elena.jpg',
  },
  {
    name: 'Jordan Blake',
    specialty: 'HIIT & Fat Loss',
    experience: '7 yrs experience',
    rating: '5.0',
    image: '/images/trainer-jordan.jpg',
  },
];

const testimonials = [
  {
    quote: 'Booking classes used to be a hassle. Now I see live spots and confirm in seconds.',
    name: 'Priya Nandan',
    role: 'Premium member, 8 months',
  },
  {
    quote: 'My trainer updates my plan every week and I can see exactly what changed.',
    name: 'Daniel Ostrowski',
    role: 'VIP member, 1 year',
  },
  {
    quote: 'The attendance tracking keeps me honest. I can see my consistency at a glance.',
    name: 'Aisha Bello',
    role: 'Basic member, 4 months',
  },
];

const features = [
  {
    icon: UserCheck,
    title: 'Membership Management',
    description: 'Plans, renewals, expiry alerts and upgrades handled without paperwork.',
  },
  {
    icon: Dumbbell,
    title: 'Personal Training',
    description: 'Match members with coaches and track every session in one timeline.',
  },
  {
    icon: BarChart3,
    title: 'Workout Programs',
    description: 'Structured multi-week blocks with sets, reps, rest and completion tracking.',
  },
  {
    icon: CalendarCheck,
    title: 'Class Booking',
    description: 'Live capacity, waitlists and instant confirmation across every studio.',
  },
  {
    icon: QrCode,
    title: 'Attendance Management',
    description: 'QR check-in at the door with full visit history per member.',
  },
  {
    icon: CreditCard,
    title: 'Payments & Revenue',
    description: 'Invoices, payment status and revenue analytics for the whole gym.',
  },
];

const plans = [
  {
    name: 'Basic',
    description: 'Everything you need to start moving.',
    price: '29',
    features: ['Full gym floor access', '2 group classes / month', 'Attendance tracking', 'Mobile app access'],
    featured: false,
  },
  {
    name: 'Premium',
    description: 'Structured training with real coaching.',
    price: '59',
    features: [
      'Unlimited gym access',
      'Unlimited group classes',
      'Personalised workout plans',
      'Monthly progress review',
      'Nutrition guidance',
    ],
    featured: true,
  },
  {
    name: 'VIP',
    description: 'One-to-one performance programming.',
    price: '119',
    features: [
      'Everything in Premium',
      '8 personal training sessions',
      'Priority class booking',
      'Body composition scans',
      'Recovery & sauna suite',
    ],
    featured: false,
  },
];

export default function HomePage() {
  // Refs for scroll animations
  const featuresRef = useRef(null);
  const plansRef = useRef(null);
  const trainersRef = useRef(null);
  const testimonialsRef = useRef(null);
  const ctaRef = useRef(null);

  // Smooth scroll function
  const smoothScrollTo = (elementRef) => {
    if (elementRef.current) {
      elementRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  // Intersection Observer for fade-in animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.visible);
        }
      });
    }, observerOptions);

    // Observe all sections
    const sections = document.querySelectorAll(`.${styles.animateOnScroll}`);
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

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
          <a 
            href="#features" 
            onClick={(e) => { e.preventDefault(); smoothScrollTo(featuresRef); }}
          >
            Features
          </a>
          <a 
            href="#plans" 
            onClick={(e) => { e.preventDefault(); smoothScrollTo(plansRef); }}
          >
            Plans
          </a>
          <a 
            href="#trainers" 
            onClick={(e) => { e.preventDefault(); smoothScrollTo(trainersRef); }}
          >
            Trainers
          </a>
          <a 
            href="#testimonials" 
            onClick={(e) => { e.preventDefault(); smoothScrollTo(testimonialsRef); }}
          >
            Testimonials
          </a>
        </nav>

        <div className={styles.navActions}>
          <Link to="/sign-in" className={styles.signIn}>Sign in</Link>
          <Link to="/sign-up" className={styles.primaryBtn}>Join now</Link>
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
          </div>

          <div className={styles.statsRow}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>351</span>
              <span className={styles.statLabel}>Active members</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>18</span>
              <span className={styles.statLabel}>Expert trainers</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>42</span>
              <span className={styles.statLabel}>Weekly programs</span>
            </div>
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
      <section 
        id="features" 
        ref={featuresRef}
        className={`${styles.features} ${styles.animateOnScroll}`}
      >
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
              <span className={styles.featureIcon}>
                <Icon size={20} strokeWidth={2} />
              </span>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Membership Plans */}
      <section 
        id="plans" 
        ref={plansRef}
        className={`${styles.plans} ${styles.animateOnScroll}`}
      >
        <div className={styles.sectionHeading}>
          <h2>Membership plans</h2>
          <p>Transparent pricing. Cancel or upgrade any time from your dashboard.</p>
        </div>

        <div className={styles.plansGrid}>
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`${styles.planCard} ${plan.featured ? styles.planCardFeatured : ''} ${styles.animateCard}`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {plan.featured && <span className={styles.popularBadge}>Most popular</span>}

              <h3 className={styles.planName}>{plan.name}</h3>
              <p className={styles.planDescription}>{plan.description}</p>

              <p className={styles.planPrice}>
                ${plan.price}
                <span className={styles.planPeriod}>/mo</span>
              </p>

              <ul className={styles.planFeatures}>
                {plan.features.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <button
                type="button"
                className={plan.featured ? styles.primaryBtn : styles.secondaryBtn}
              >
                Choose plan
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Trainers */}
      <section 
        id="trainers" 
        ref={trainersRef}
        className={`${styles.trainers} ${styles.animateOnScroll}`}
      >
        <div className={styles.sectionHeading}>
          <h2>Train with people who show up for you</h2>
          <p>Certified coaches across strength, mobility, and conditioning — matched to your goals.</p>
        </div>

        <div className={styles.trainersGrid}>
          {trainers.map((trainer, index) => (
            <div 
              key={trainer.name} 
              className={`${styles.trainerCard} ${styles.animateCard}`}
              style={{ animationDelay: `${index * 0.12}s` }}
            >
              <div className={styles.trainerImage}>
                <img src={trainer.image} alt={trainer.name} />
              </div>
              <div className={styles.trainerInfo}>
                <div className={styles.trainerHeader}>
                  <h3>{trainer.name}</h3>
                  <span className={styles.trainerRating}>
                    <Star size={13} fill="currentColor" />
                    {trainer.rating}
                  </span>
                </div>
                <p className={styles.trainerSpecialty}>{trainer.specialty}</p>
                <p className={styles.trainerExperience}>{trainer.experience}</p>
                <button type="button" className={styles.secondaryBtn}>
                  View profile
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section 
        id="testimonials" 
        ref={testimonialsRef}
        className={`${styles.testimonials} ${styles.animateOnScroll}`}
      >
        <div className={styles.sectionHeading}>
          <h2>What members are saying</h2>
          <p>Real feedback from people training on FitCore every week.</p>
        </div>

        <div className={styles.testimonialsGrid}>
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.name} 
              className={`${styles.testimonialCard} ${styles.animateCard}`}
              style={{ animationDelay: `${index * 0.12}s` }}
            >
              <div className={styles.testimonialStars}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>
              <p className={styles.testimonialQuote}>&ldquo;{testimonial.quote}&rdquo;</p>
              <div className={styles.testimonialAuthor}>
                <p className={styles.testimonialName}>{testimonial.name}</p>
                <p className={styles.testimonialRole}>{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section 
        ref={ctaRef}
        className={`${styles.ctaSection} ${styles.animateOnScroll}`}
      >
        <div className={styles.ctaCard}>
          <h2>Ready to train with intent?</h2>
          <p>Create your account and get matched with a plan and trainer in minutes.</p>
          <div className={styles.heroActions}>
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