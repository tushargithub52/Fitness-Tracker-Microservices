import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { getActivities } from '../services/api';

const activityIcons = {
  RUNNING: '🏃',
  CYCLING: '🚴',
  SWIMMING: '🏊',
  WALKING: '🚶',
  YOGA: '🧘',
  WEIGHT_TRAINING: '🏋️',
  HIIT: '⚡',
  CARDIO: '❤️',
  STRETCHING: '🤸',
  OTHER: '💪',
};

const activityColors = {
  RUNNING: '#6366f1',
  CYCLING: '#10b981',
  SWIMMING: '#06b6d4',
  WALKING: '#f59e0b',
  YOGA: '#a855f7',
  WEIGHT_TRAINING: '#ef4444',
  HIIT: '#f97316',
  CARDIO: '#ec4899',
  STRETCHING: '#14b8a6',
  OTHER: '#64748b',
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const ActivityList = ({ refreshKey }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getActivities();
      setActivities(response.data);
    } catch (err) {
      setError('Failed to load activities. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [refreshKey]);

  if (loading) {
    return (
      <div style={styles.centered}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading your activities...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.centered}>
        <div style={styles.errorIcon}>⚠️</div>
        <p style={styles.errorText}>{error}</p>
        <button style={styles.retryBtn} onClick={fetchActivities}>Try Again</button>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>🏋️</div>
        <h3 style={styles.emptyTitle}>No activities yet</h3>
        <p style={styles.emptySubtitle}>Log your first workout to get started and receive AI-powered insights.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={styles.listHeader}>
        <h2 style={styles.listTitle}>Your Activities</h2>
        <span style={styles.countBadge}>{activities.length} total</span>
      </div>
      <div style={styles.grid}>
        {activities.map((activity) => {
          const color = activityColors[activity.type] || '#64748b';
          const icon = activityIcons[activity.type] || '💪';
          return (
            <div
              key={activity.id || activity._id}
              style={{ ...styles.card, '--card-color': color }}
              onClick={() => navigate(`/activities/${activity.id || activity._id}`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = `${color}40`;
                e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.4), 0 0 20px ${color}15`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.3)';
              }}
            >
              {/* Top accent line */}
              <div style={{ ...styles.cardAccent, background: color }} />

              <div style={styles.cardHeader}>
                <div style={{ ...styles.cardIcon, background: `${color}15`, border: `1px solid ${color}30` }}>
                  <span style={{ fontSize: '24px' }}>{icon}</span>
                </div>
                <div style={styles.cardMeta}>
                  <h3 style={styles.cardType}>{activity.type?.replace('_', ' ')}</h3>
                  <span style={styles.cardDate}>{formatDate(activity.startTime)}</span>
                </div>
                <div style={styles.cardArrow}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>

              <div style={styles.cardStats}>
                <div style={styles.cardStat}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span style={styles.cardStatValue}>{activity.duration} min</span>
                </div>
                <div style={styles.cardStatDivider} />
                <div style={styles.cardStat}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                  <span style={styles.cardStatValue}>{activity.caloriesBurned} kcal</span>
                </div>
              </div>

              <div style={styles.cardFooter}>
                <span style={{ ...styles.viewDetails, color }}>View Details & AI Tips →</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  centered: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 24px',
    gap: '16px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(99,102,241,0.2)',
    borderTop: '3px solid #6366f1',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    color: '#64748b',
    fontSize: '15px',
  },
  errorIcon: { fontSize: '32px' },
  errorText: {
    color: '#f87171',
    fontSize: '15px',
    textAlign: 'center',
  },
  retryBtn: {
    background: 'rgba(99,102,241,0.1)',
    border: '1px solid rgba(99,102,241,0.3)',
    color: '#818cf8',
    padding: '8px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: 'inherit',
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 24px',
    background: 'linear-gradient(145deg, #161820, #1c1f2a)',
    border: '1px dashed rgba(255,255,255,0.1)',
    borderRadius: '20px',
  },
  emptyIcon: { fontSize: '48px', marginBottom: '16px' },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: '8px',
  },
  emptySubtitle: {
    fontSize: '14px',
    color: '#64748b',
    maxWidth: '360px',
    margin: '0 auto',
    lineHeight: '1.7',
  },
  listHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
  },
  listTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#f1f5f9',
  },
  countBadge: {
    background: 'rgba(99,102,241,0.1)',
    border: '1px solid rgba(99,102,241,0.2)',
    color: '#818cf8',
    fontSize: '12px',
    fontWeight: '600',
    padding: '2px 10px',
    borderRadius: '100px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  },
  card: {
    background: 'linear-gradient(145deg, #161820, #1c1f2a)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px',
    padding: '0',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
    overflow: 'hidden',
    position: 'relative',
  },
  cardAccent: {
    height: '3px',
    width: '100%',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '20px 20px 16px',
  },
  cardIcon: {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardMeta: { flex: 1 },
  cardType: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: '3px',
    textTransform: 'capitalize',
  },
  cardDate: {
    fontSize: '12px',
    color: '#475569',
  },
  cardArrow: {
    flexShrink: 0,
  },
  cardStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '0 20px 16px',
  },
  cardStat: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  cardStatValue: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#94a3b8',
  },
  cardStatDivider: {
    width: '1px',
    height: '16px',
    background: 'rgba(255,255,255,0.08)',
  },
  cardFooter: {
    borderTop: '1px solid rgba(255,255,255,0.05)',
    padding: '12px 20px',
  },
  viewDetails: {
    fontSize: '13px',
    fontWeight: '500',
  },
};

export default ActivityList;
