import { useContext } from 'react';
import { AuthContext } from 'react-oauth2-code-pkce';
import { useNavigate } from 'react-router';

const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="url(#f1)" />
        <defs><linearGradient id="f1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6366f1"/><stop offset="100%" stopColor="#a855f7"/></linearGradient></defs>
      </svg>
    ),
    title: 'AI-Powered Insights',
    desc: 'Get personalized recommendations from our AI engine after every workout. Optimize your training based on real data.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="url(#f2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <defs><linearGradient id="f2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#10b981"/><stop offset="100%" stopColor="#06b6d4"/></linearGradient></defs>
      </svg>
    ),
    title: 'Activity Tracking',
    desc: 'Log runs, cycling, swimming, HIIT, yoga and more. Track duration, calories, and custom metrics for every session.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="url(#f3)" strokeWidth="2"/>
        <polyline points="12 6 12 12 16 14" stroke="url(#f3b)" strokeWidth="2" strokeLinecap="round"/>
        <defs>
          <linearGradient id="f3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#f59e0b"/><stop offset="100%" stopColor="#ef4444"/></linearGradient>
          <linearGradient id="f3b" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#f59e0b"/><stop offset="100%" stopColor="#ef4444"/></linearGradient>
        </defs>
      </svg>
    ),
    title: 'Progress History',
    desc: 'Review your complete workout history. See how far you\'ve come and identify patterns in your fitness journey.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="url(#f4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <defs><linearGradient id="f4" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#a855f7"/><stop offset="100%" stopColor="#6366f1"/></linearGradient></defs>
      </svg>
    ),
    title: 'Secure & Private',
    desc: 'Your fitness data is protected with enterprise-grade security via Keycloak authentication. Your data stays yours.',
  },
];

const activityTypes = [
  { label: 'Running', icon: '🏃', color: '#6366f1' },
  { label: 'Cycling', icon: '🚴', color: '#10b981' },
  { label: 'Swimming', icon: '🏊', color: '#06b6d4' },
  { label: 'HIIT', icon: '⚡', color: '#f59e0b' },
  { label: 'Yoga', icon: '🧘', color: '#a855f7' },
  { label: 'Weight Training', icon: '🏋️', color: '#ef4444' },
];

const stats = [
  { value: '10+', label: 'Activity Types' },
  { value: 'AI', label: 'Smart Recommendations' },
  { value: '100%', label: 'Secure & Private' },
  { value: '24/7', label: 'Always Available' },
];

const HomePage = () => {
  const { token, logIn } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleCTA = () => {
    if (token) {
      navigate('/activities');
    } else {
      logIn();
    }
  };

  return (
    <div style={styles.page}>
      {/* Background orbs — full-width positioned so they never cause overflow */}
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      <div style={styles.orb3} />

      {/* Hero Section */}
      <section style={styles.hero}>

        <div style={styles.heroContent}>
          <div style={styles.badge}>
            <span style={styles.badgeDot} />
            AI-Powered Fitness Intelligence
          </div>

          <h1 style={styles.heroTitle}>
            Train Smarter,<br />
            <span style={styles.gradientText}>Not Just Harder</span>
          </h1>

          <p style={styles.heroSubtitle}>
            FitTrack AI analyzes your workouts and delivers personalized recommendations
            powered by artificial intelligence. Every rep, every mile — optimized for you.
          </p>

          <div style={styles.heroCTAs}>
            <button style={styles.primaryBtn} onClick={handleCTA}>
              {token ? 'Go to Dashboard' : 'Start for Free'}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
            {!token && (
              <button style={styles.secondaryBtn} onClick={() => logIn()}>
                Sign In
              </button>
            )}
          </div>

          {/* Activity type pills */}
          <div style={styles.activityPills}>
            {activityTypes.map((a) => (
              <div key={a.label} style={{ ...styles.pill, borderColor: `${a.color}40`, background: `${a.color}10` }}>
                <span>{a.icon}</span>
                <span style={{ color: a.color, fontSize: '13px', fontWeight: '500' }}>{a.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hero visual card */}
        <div style={styles.heroVisual}>
          <div style={styles.mockCard}>
            <div style={styles.mockCardHeader}>
              <div style={styles.mockDot} />
              <div style={{ ...styles.mockDot, background: '#f59e0b' }} />
              <div style={{ ...styles.mockDot, background: '#10b981' }} />
              <span style={styles.mockTitle}>Today's Activity</span>
            </div>
            <div style={styles.mockActivity}>
              <div style={styles.mockActivityIcon}>🏃</div>
              <div>
                <div style={styles.mockActivityName}>Morning Run</div>
                <div style={styles.mockActivitySub}>5.2 km · 28 min</div>
              </div>
              <div style={styles.mockBadge}>+320 kcal</div>
            </div>
            <div style={styles.mockDivider} />
            <div style={styles.mockAI}>
              <div style={styles.mockAIHeader}>
                <span style={styles.mockAIIcon}>✨</span>
                <span style={styles.mockAILabel}>AI Recommendation</span>
              </div>
              <p style={styles.mockAIText}>
                Great pace! Consider adding interval training tomorrow to improve your VO2 max. Rest for 6–8 hours tonight.
              </p>
            </div>
            <div style={styles.mockStats}>
              {[{ label: 'Pace', val: '5:23/km' }, { label: 'Calories', val: '320' }, { label: 'Streak', val: '7 days' }].map(s => (
                <div key={s.label} style={styles.mockStat}>
                  <div style={styles.mockStatVal}>{s.val}</div>
                  <div style={styles.mockStatLabel}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section style={styles.statsBar}>
        <div style={styles.statsContainer}>
          {stats.map((s, i) => (
            <div key={i} style={styles.statItem}>
              <div style={styles.statValue}>{s.value}</div>
              <div style={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.section}>
        <div style={styles.sectionContainer}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionBadge}>Features</div>
            <h2 style={styles.sectionTitle}>Everything you need to reach your goals</h2>
            <p style={styles.sectionSubtitle}>
              A complete fitness tracking platform with AI at its core, built for athletes who want results.
            </p>
          </div>

          <div style={styles.featuresGrid}>
            {features.map((f, i) => (
              <div key={i} style={styles.featureCard}>
                <div style={styles.featureIcon}>{f.icon}</div>
                <h3 style={styles.featureTitle}>{f.title}</h3>
                <p style={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ ...styles.section, background: 'rgba(99,102,241,0.03)' }}>
        <div style={styles.sectionContainer}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionBadge}>How It Works</div>
            <h2 style={styles.sectionTitle}>Three steps to smarter fitness</h2>
          </div>
          <div style={styles.stepsGrid}>
            {[
              { step: '01', title: 'Log Your Activity', desc: 'Record any workout — running, cycling, swimming, HIIT, yoga, and more with detailed metrics.' },
              { step: '02', title: 'AI Analyzes Your Data', desc: 'Our AI engine processes your performance data and compares it against optimal training patterns.' },
              { step: '03', title: 'Get Personalized Tips', desc: 'Receive actionable recommendations tailored to your fitness level, goals, and recovery status.' },
            ].map((s, i) => (
              <div key={i} style={styles.stepCard}>
                <div style={styles.stepNumber}>{s.step}</div>
                <h3 style={styles.stepTitle}>{s.title}</h3>
                <p style={styles.stepDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaOrb1} />
        <div style={styles.ctaOrb2} />
        <div style={styles.ctaContent}>
          <h2 style={styles.ctaTitle}>Ready to transform your training?</h2>
          <p style={styles.ctaSubtitle}>
            Join FitTrack AI and start getting intelligent insights from every workout.
          </p>
          <button style={styles.primaryBtn} onClick={handleCTA}>
            {token ? 'Go to Dashboard' : 'Get Started Free'}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerLogo}>
            <span style={{ color: '#f1f5f9', fontWeight: '700' }}>FitTrack</span>
            <span style={styles.gradientText}> AI</span>
          </div>
          <p style={styles.footerText}>© 2025 FitTrack AI. Built for athletes who demand more.</p>
        </div>
      </footer>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0a0b0f',
    overflowX: 'hidden',
    position: 'relative',
  },
  // Hero
  hero: {
    position: 'relative',
    minHeight: '90vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '48px',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '80px 24px 60px',
  },
  orb1: {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '500px',
    height: '500px',
    background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
    borderRadius: '50%',
    pointerEvents: 'none',
    transform: 'translate(-30%, -20%)',
    zIndex: 0,
  },
  orb2: {
    position: 'absolute',
    top: '20%',
    right: '0',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)',
    borderRadius: '50%',
    pointerEvents: 'none',
    transform: 'translateX(30%)',
    zIndex: 0,
  },
  orb3: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '300px',
    height: '300px',
    background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)',
    borderRadius: '50%',
    pointerEvents: 'none',
    transform: 'translate(-50%, -50%)',
    zIndex: 0,
  },
  heroContent: {
    flex: '1',
    maxWidth: '580px',
    position: 'relative',
    zIndex: 1,
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(99,102,241,0.1)',
    border: '1px solid rgba(99,102,241,0.25)',
    color: '#818cf8',
    fontSize: '13px',
    fontWeight: '500',
    padding: '6px 14px',
    borderRadius: '100px',
    marginBottom: '24px',
  },
  badgeDot: {
    width: '6px',
    height: '6px',
    background: '#6366f1',
    borderRadius: '50%',
    boxShadow: '0 0 8px #6366f1',
    animation: 'pulse 2s infinite',
  },
  heroTitle: {
    fontSize: 'clamp(36px, 5vw, 60px)',
    fontWeight: '800',
    lineHeight: '1.1',
    letterSpacing: '-1.5px',
    color: '#f1f5f9',
    marginBottom: '20px',
  },
  gradientText: {
    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  heroSubtitle: {
    fontSize: '17px',
    color: '#94a3b8',
    lineHeight: '1.7',
    marginBottom: '36px',
    maxWidth: '480px',
  },
  heroCTAs: {
    display: 'flex',
    gap: '14px',
    flexWrap: 'wrap',
    marginBottom: '40px',
  },
  primaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
    border: 'none',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '600',
    padding: '13px 26px',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    boxShadow: '0 0 30px rgba(99,102,241,0.35)',
  },
  secondaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#f1f5f9',
    fontSize: '15px',
    fontWeight: '500',
    padding: '13px 26px',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
  },
  activityPills: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '5px 12px',
    borderRadius: '100px',
    border: '1px solid',
    fontSize: '13px',
  },
  // Hero Visual
  heroVisual: {
    flex: '0 0 auto',
    width: '380px',
    position: 'relative',
    zIndex: 1,
    '@media (maxWidth: 900px)': { display: 'none' },
  },
  mockCard: {
    background: 'linear-gradient(145deg, #161820, #1c1f2a)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '20px',
    padding: '24px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(99,102,241,0.1)',
  },
  mockCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '20px',
  },
  mockDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: '#ef4444',
  },
  mockTitle: {
    marginLeft: 'auto',
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '500',
  },
  mockActivity: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '20px',
  },
  mockActivityIcon: {
    fontSize: '32px',
    width: '52px',
    height: '52px',
    background: 'rgba(99,102,241,0.1)',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockActivityName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: '4px',
  },
  mockActivitySub: {
    fontSize: '13px',
    color: '#64748b',
  },
  mockBadge: {
    marginLeft: 'auto',
    background: 'rgba(16,185,129,0.1)',
    border: '1px solid rgba(16,185,129,0.2)',
    color: '#10b981',
    fontSize: '12px',
    fontWeight: '600',
    padding: '4px 10px',
    borderRadius: '100px',
  },
  mockDivider: {
    height: '1px',
    background: 'rgba(255,255,255,0.06)',
    marginBottom: '20px',
  },
  mockAI: {
    background: 'rgba(99,102,241,0.06)',
    border: '1px solid rgba(99,102,241,0.15)',
    borderRadius: '12px',
    padding: '14px',
    marginBottom: '20px',
  },
  mockAIHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '8px',
  },
  mockAIIcon: { fontSize: '14px' },
  mockAILabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#818cf8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  mockAIText: {
    fontSize: '13px',
    color: '#94a3b8',
    lineHeight: '1.6',
  },
  mockStats: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  mockStat: { textAlign: 'center' },
  mockStatVal: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: '2px',
  },
  mockStatLabel: {
    fontSize: '11px',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  // Stats Bar
  statsBar: {
    borderTop: '1px solid rgba(255,255,255,0.06)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(255,255,255,0.02)',
    padding: '32px 24px',
  },
  statsContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: '24px',
  },
  statItem: { textAlign: 'center' },
  statValue: {
    fontSize: '32px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '500',
  },
  // Sections
  section: {
    padding: '80px 24px',
  },
  sectionContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '56px',
  },
  sectionBadge: {
    display: 'inline-block',
    background: 'rgba(99,102,241,0.1)',
    border: '1px solid rgba(99,102,241,0.25)',
    color: '#818cf8',
    fontSize: '12px',
    fontWeight: '600',
    padding: '4px 14px',
    borderRadius: '100px',
    marginBottom: '16px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  sectionTitle: {
    fontSize: 'clamp(24px, 3vw, 36px)',
    fontWeight: '700',
    color: '#f1f5f9',
    letterSpacing: '-0.5px',
    marginBottom: '14px',
  },
  sectionSubtitle: {
    fontSize: '16px',
    color: '#64748b',
    maxWidth: '500px',
    margin: '0 auto',
    lineHeight: '1.7',
  },
  // Features
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '20px',
  },
  featureCard: {
    background: 'linear-gradient(145deg, #161820, #1c1f2a)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px',
    padding: '28px',
    transition: 'all 0.2s ease',
  },
  featureIcon: {
    width: '48px',
    height: '48px',
    background: 'rgba(99,102,241,0.1)',
    border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '18px',
  },
  featureTitle: {
    fontSize: '17px',
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: '10px',
  },
  featureDesc: {
    fontSize: '14px',
    color: '#64748b',
    lineHeight: '1.7',
  },
  // Steps
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '24px',
  },
  stepCard: {
    padding: '32px 28px',
    background: 'linear-gradient(145deg, #161820, #1c1f2a)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px',
    position: 'relative',
  },
  stepNumber: {
    fontSize: '48px',
    fontWeight: '900',
    background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(168,85,247,0.3))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    lineHeight: '1',
    marginBottom: '16px',
  },
  stepTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: '10px',
  },
  stepDesc: {
    fontSize: '14px',
    color: '#64748b',
    lineHeight: '1.7',
  },
  // CTA
  ctaSection: {
    position: 'relative',
    padding: '100px 24px',
    textAlign: 'center',
    overflow: 'hidden',
    background: 'rgba(99,102,241,0.03)',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
  ctaOrb1: {
    position: 'absolute',
    top: '-100px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '600px',
    height: '300px',
    background: 'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  ctaOrb2: {
    position: 'absolute',
    bottom: '-50px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '400px',
    height: '200px',
    background: 'radial-gradient(ellipse, rgba(168,85,247,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  ctaContent: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '600px',
    margin: '0 auto',
  },
  ctaTitle: {
    fontSize: 'clamp(28px, 4vw, 44px)',
    fontWeight: '800',
    color: '#f1f5f9',
    letterSpacing: '-1px',
    marginBottom: '16px',
  },
  ctaSubtitle: {
    fontSize: '17px',
    color: '#64748b',
    marginBottom: '36px',
    lineHeight: '1.7',
  },
  // Footer
  footer: {
    borderTop: '1px solid rgba(255,255,255,0.06)',
    padding: '32px 24px',
  },
  footerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
  },
  footerLogo: {
    fontSize: '16px',
    fontWeight: '700',
  },
  footerText: {
    fontSize: '13px',
    color: '#475569',
  },
};

export default HomePage;
