import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { getActivityDetails, getActivityAiRecommendations } from '../services/api';

const activityIcons = {
  RUNNING: '🏃', CYCLING: '🚴', SWIMMING: '🏊', WALKING: '🚶',
  YOGA: '🧘', WEIGHT_TRAINING: '🏋️', HIIT: '⚡', CARDIO: '❤️',
  STRETCHING: '🤸', OTHER: '💪',
};

const activityColors = {
  RUNNING: '#6366f1', CYCLING: '#10b981', SWIMMING: '#06b6d4', WALKING: '#f59e0b',
  YOGA: '#a855f7', WEIGHT_TRAINING: '#ef4444', HIIT: '#f97316', CARDIO: '#ec4899',
  STRETCHING: '#14b8a6', OTHER: '#64748b',
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

// Parse the AI recommendation — the backend returns a flat object directly:
// { recommendations: string, improvements: string[], suggestions: string[], safety: string[], ...metadata }
// We just need to pick the 4 content fields and ignore all IDs/metadata.
const parseAiRecommendation = (raw) => {
  if (!raw) return null;
  return {
    recommendations: raw.recommendations ?? null,   // plain string
    improvements:    raw.improvements    ?? [],      // string[]
    suggestions:     raw.suggestions     ?? [],      // string[]
    safety:          raw.safety          ?? [],      // string[]
  };
};

// ── Sub-components for each AI section ──────────────────────

// recommendations is a multi-paragraph plain string — split on \n\n and render each paragraph
const RecommendationsSection = ({ recommendations }) => {
  const paragraphs = recommendations.split(/\n\n+/).filter(Boolean);
  return (
    <div style={s.section}>
      <div style={s.sectionHeader}>
        <span style={s.sectionIcon}>🔍</span>
        <span style={s.sectionTitle}>Performance Analysis</span>
      </div>
      <div style={s.analysisGrid}>
        {paragraphs.map((para, i) => {
          // Each paragraph starts with a label like "Overall:", "Pace:", etc.
          const colonIdx = para.indexOf(':');
          const hasLabel = colonIdx > 0 && colonIdx < 20;
          const label = hasLabel ? para.slice(0, colonIdx).trim() : null;
          const text  = hasLabel ? para.slice(colonIdx + 1).trim() : para;
          const icons = { Overall: '📊', Pace: '⏱️', 'Heart Rate': '❤️', Calories: '🔥' };
          return (
            <div key={i} style={s.analysisCard}>
              {label && (
                <div style={s.analysisCardLabel}>
                  <span>{icons[label] || '📌'}</span>
                  <span>{label}</span>
                </div>
              )}
              <p style={s.analysisCardText}>{text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// improvements is string[] — each string is a full sentence starting with "Area: detail"
const ImprovementsSection = ({ improvements }) => (
  <div style={s.section}>
    <div style={s.sectionHeader}>
      <span style={s.sectionIcon}>📈</span>
      <span style={s.sectionTitle}>Areas to Improve</span>
    </div>
    <div style={s.listStack}>
      {improvements.map((item, i) => {
        const colonIdx = item.indexOf(':');
        const hasLabel = colonIdx > 0 && colonIdx < 40;
        const area = hasLabel ? item.slice(0, colonIdx).trim() : `Tip ${i + 1}`;
        const text = hasLabel ? item.slice(colonIdx + 1).trim() : item;
        return (
          <div key={i} style={s.improvementItem}>
            <div style={s.improvementBullet}>{i + 1}</div>
            <div style={s.improvementBody}>
              <div style={s.improvementArea}>{area}</div>
              <p style={s.improvementText}>{text}</p>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

// suggestions is string[] — each string starts with "Workout Name: description"
const SuggestionsSection = ({ suggestions }) => (
  <div style={s.section}>
    <div style={s.sectionHeader}>
      <span style={s.sectionIcon}>⚡</span>
      <span style={s.sectionTitle}>Next Workout Suggestions</span>
    </div>
    <div style={s.suggestionsGrid}>
      {suggestions.map((item, i) => {
        const colonIdx = item.indexOf(':');
        const hasLabel = colonIdx > 0 && colonIdx < 50;
        const workout = hasLabel ? item.slice(0, colonIdx).trim() : `Suggestion ${i + 1}`;
        const desc    = hasLabel ? item.slice(colonIdx + 1).trim() : item;
        return (
          <div key={i} style={s.suggestionCard}>
            <div style={s.suggestionWorkout}>{workout}</div>
            <p style={s.suggestionDesc}>{desc}</p>
          </div>
        );
      })}
    </div>
  </div>
);

const SafetySection = ({ safety }) => (
  <div style={{ ...s.section, borderBottom: 'none' }}>
    <div style={s.sectionHeader}>
      <span style={s.sectionIcon}>🛡️</span>
      <span style={s.sectionTitle}>Safety Guidelines</span>
    </div>
    <div style={s.safetyList}>
      {safety.map((point, i) => (
        <div key={i} style={s.safetyItem}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: '3px' }}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span style={s.safetyText}>{point}</span>
        </div>
      ))}
    </div>
  </div>
);

// ── Main component ───────────────────────────────────────────

const ActivityDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activity, setActivity]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [aiRec, setAiRec]         = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError]     = useState(null);
  const [aiRequested, setAiRequested] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await getActivityDetails(id);
        setActivity(res.data);
      } catch (err) {
        setError('Failed to load activity details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const fetchAiRecommendations = async () => {
    setAiRequested(true);
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await getActivityAiRecommendations(id);
      setAiRec(parseAiRecommendation(res.data));
    } catch (err) {
      setAiError('Could not fetch AI recommendations. Please try again.');
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return (
    <div style={styles.page}>
      <div style={styles.centered}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading activity details...</p>
      </div>
    </div>
  );

  if (error || !activity) return (
    <div style={styles.page}>
      <div style={styles.centered}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚠️</div>
        <p style={styles.errorText}>{error || 'Activity not found.'}</p>
        <button style={styles.backBtn} onClick={() => navigate('/activities')}>← Back to Activities</button>
      </div>
    </div>
  );

  const color = activityColors[activity.type] || '#64748b';
  const icon  = activityIcons[activity.type]  || '💪';

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Back */}
        <button style={styles.backBtn} onClick={() => navigate('/activities')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Activities
        </button>

        {/* Hero Card */}
        <div style={{ ...styles.heroCard, borderColor: `${color}25` }}>
          <div style={{ ...styles.heroAccent, background: `linear-gradient(90deg, ${color}, transparent)` }} />
          <div style={styles.heroBody}>
            <div style={{ ...styles.heroIcon, background: `${color}15`, border: `1px solid ${color}30` }}>
              <span style={{ fontSize: '40px' }}>{icon}</span>
            </div>
            <div style={styles.heroInfo}>
              <div style={{ ...styles.typeBadge, background: `${color}15`, color, border: `1px solid ${color}30` }}>
                {activity.type?.replace(/_/g, ' ')}
              </div>
              <h1 style={styles.heroTitle}>{activity.type?.replace(/_/g, ' ')} Session</h1>
              <p style={styles.heroDate}>{formatDate(activity.startTime)}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" style={{ marginBottom: '12px' }}>
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <div style={styles.statValue}>{activity.duration}</div>
            <div style={styles.statUnit}>minutes</div>
            <div style={styles.statLabel}>Duration</div>
          </div>
          <div style={styles.statCard}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" style={{ marginBottom: '12px' }}>
              <path d="M12 2c0 0-5 5-5 10a5 5 0 0 0 10 0c0-5-5-10-5-10z"/>
            </svg>
            <div style={styles.statValue}>{activity.caloriesBurned}</div>
            <div style={styles.statUnit}>kcal</div>
            <div style={styles.statLabel}>Calories Burned</div>
          </div>
          {activity.additionalMetrics && Object.entries(activity.additionalMetrics).map(([k, v]) => (
            <div key={k} style={styles.statCard}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" style={{ marginBottom: '12px' }}>
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
              <div style={styles.statValue}>{String(v)}</div>
              <div style={styles.statUnit}>&nbsp;</div>
              <div style={styles.statLabel}>{k.replace(/([A-Z])/g, ' $1').trim()}</div>
            </div>
          ))}
        </div>

        {/* AI Section */}
        <div style={styles.aiSection}>
          <div style={styles.aiHeader}>
            <div style={styles.aiHeaderLeft}>
              <div style={styles.aiIconWrapper}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" fill="url(#ai1)"/>
                  <path d="M2 17l10 5 10-5" stroke="url(#ai2)" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M2 12l10 5 10-5" stroke="url(#ai3)" strokeWidth="2" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="ai1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6366f1"/><stop offset="100%" stopColor="#a855f7"/></linearGradient>
                    <linearGradient id="ai2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6366f1"/><stop offset="100%" stopColor="#a855f7"/></linearGradient>
                    <linearGradient id="ai3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6366f1"/><stop offset="100%" stopColor="#a855f7"/></linearGradient>
                  </defs>
                </svg>
              </div>
              <div>
                <h2 style={styles.aiTitle}>AI Recommendations</h2>
                <p style={styles.aiSubtitle}>Personalized insights powered by artificial intelligence</p>
              </div>
            </div>
            {!aiRequested && (
              <button style={styles.aiBtn} onClick={fetchAiRecommendations}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white"/>
                </svg>
                Get AI Insights
              </button>
            )}
          </div>

          {!aiRequested && (
            <div style={styles.aiPlaceholder}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>✨</div>
              <p style={styles.aiPlaceholderText}>Click "Get AI Insights" to receive personalized recommendations based on this workout.</p>
            </div>
          )}

          {aiLoading && (
            <div style={styles.aiLoading}>
              <div style={styles.aiSpinner} />
              <div>
                <p style={styles.aiLoadingTitle}>Analyzing your workout...</p>
                <p style={styles.aiLoadingSubtitle}>Our AI is processing your performance data</p>
              </div>
            </div>
          )}

          {aiError && (
            <div style={styles.aiError}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {aiError}
              <button style={styles.retryBtn} onClick={fetchAiRecommendations}>Retry</button>
            </div>
          )}

          {aiRec && !aiLoading && (
            <div style={styles.aiContent}>
              {aiRec._raw ? (
                <div style={s.rawBlock}><p style={s.rawText}>{aiRec._raw}</p></div>
              ) : (
                <>
                  {aiRec.recommendations && <RecommendationsSection recommendations={aiRec.recommendations} />}
                  {aiRec.improvements?.length > 0 && <ImprovementsSection improvements={aiRec.improvements} />}
                  {aiRec.suggestions?.length  > 0 && <SuggestionsSection  suggestions={aiRec.suggestions} />}
                  {aiRec.safety?.length       > 0 && <SafetySection       safety={aiRec.safety} />}
                </>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

// ── Styles ───────────────────────────────────────────────────

const styles = {
  page:      { minHeight: '100vh', background: '#0a0b0f', padding: '32px 0 80px' },
  container: { maxWidth: '800px', margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '24px' },
  centered:  { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' },
  spinner:   { width: '40px', height: '40px', border: '3px solid rgba(99,102,241,0.2)', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  loadingText: { color: '#64748b', fontSize: '15px' },
  errorText:   { color: '#f87171', fontSize: '15px', textAlign: 'center' },
  backBtn: { display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', fontSize: '14px', fontWeight: '500', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', alignSelf: 'flex-start' },
  heroCard:   { background: 'linear-gradient(145deg, #161820, #1c1f2a)', border: '1px solid', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' },
  heroAccent: { height: '4px', opacity: 0.7 },
  heroBody:   { display: 'flex', alignItems: 'center', gap: '24px', padding: '28px', flexWrap: 'wrap' },
  heroIcon:   { width: '80px', height: '80px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  heroInfo:   { flex: 1 },
  typeBadge:  { display: 'inline-block', fontSize: '12px', fontWeight: '600', padding: '3px 12px', borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' },
  heroTitle:  { fontSize: '28px', fontWeight: '800', color: '#f1f5f9', letterSpacing: '-0.5px', marginBottom: '6px' },
  heroDate:   { fontSize: '14px', color: '#64748b' },
  statsGrid:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' },
  statCard:   { background: 'linear-gradient(145deg, #161820, #1c1f2a)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '24px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  statValue:  { fontSize: '32px', fontWeight: '800', color: '#f1f5f9', lineHeight: '1', marginBottom: '4px' },
  statUnit:   { fontSize: '13px', color: '#6366f1', fontWeight: '600', marginBottom: '6px' },
  statLabel:  { fontSize: '12px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '500' },
  aiSection:  { background: 'linear-gradient(145deg, #161820, #1c1f2a)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '20px', overflow: 'hidden' },
  aiHeader:   { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 28px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', gap: '16px' },
  aiHeaderLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  aiIconWrapper: { width: '44px', height: '44px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  aiTitle:    { fontSize: '18px', fontWeight: '700', color: '#f1f5f9', marginBottom: '2px' },
  aiSubtitle: { fontSize: '13px', color: '#64748b' },
  aiBtn:      { display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', border: 'none', color: '#fff', fontSize: '14px', fontWeight: '600', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 0 20px rgba(99,102,241,0.3)', flexShrink: 0 },
  aiPlaceholder: { textAlign: 'center', padding: '48px 28px' },
  aiPlaceholderText: { fontSize: '14px', color: '#475569', maxWidth: '360px', margin: '0 auto', lineHeight: '1.7' },
  aiLoading:  { display: 'flex', alignItems: 'center', gap: '20px', padding: '32px 28px' },
  aiSpinner:  { width: '36px', height: '36px', border: '3px solid rgba(99,102,241,0.2)', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 },
  aiLoadingTitle:    { fontSize: '15px', fontWeight: '600', color: '#f1f5f9', marginBottom: '4px' },
  aiLoadingSubtitle: { fontSize: '13px', color: '#64748b' },
  aiError:    { display: 'flex', alignItems: 'center', gap: '10px', margin: '20px 28px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '14px 16px', color: '#f87171', fontSize: '14px' },
  retryBtn:   { marginLeft: 'auto', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '13px', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit' },
  aiContent:  { padding: '8px 28px 28px', display: 'flex', flexDirection: 'column', gap: '4px' },
};

// Styles for AI sub-sections (prefixed `s` to keep separate)
const s = {
  section: { padding: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' },
  sectionIcon:   { fontSize: '18px' },
  sectionTitle:  { fontSize: '14px', fontWeight: '700', color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.8px' },
  // Analysis
  analysisGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' },
  analysisCard: { background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: '12px', padding: '16px' },
  analysisCardLabel: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' },
  analysisCardText:  { fontSize: '14px', color: '#94a3b8', lineHeight: '1.7' },
  // Improvements
  listStack: { display: 'flex', flexDirection: 'column', gap: '12px' },
  improvementItem: { display: 'flex', gap: '14px', alignItems: 'flex-start' },
  improvementBullet: { width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' },
  improvementBody: { flex: 1 },
  improvementArea: { fontSize: '14px', fontWeight: '600', color: '#f1f5f9', marginBottom: '4px' },
  improvementText: { fontSize: '14px', color: '#94a3b8', lineHeight: '1.7' },
  // Suggestions
  suggestionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' },
  suggestionCard:  { background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)', borderRadius: '12px', padding: '16px' },
  suggestionWorkout: { fontSize: '14px', fontWeight: '600', color: '#c084fc', marginBottom: '8px' },
  suggestionDesc:    { fontSize: '14px', color: '#94a3b8', lineHeight: '1.7' },
  // Safety
  safetyList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  safetyItem: { display: 'flex', alignItems: 'flex-start', gap: '10px' },
  safetyText: { fontSize: '14px', color: '#94a3b8', lineHeight: '1.7' },
  // Raw fallback
  rawBlock: { background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '12px', padding: '20px' },
  rawText:  { fontSize: '14px', color: '#94a3b8', lineHeight: '1.8', whiteSpace: 'pre-wrap' },
};

export default ActivityDetails;
