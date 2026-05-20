import { useState } from 'react';
import ActivityList from '../components/ActivityList';
import ActivityForm from '../components/ActivityForm';

const ActivitiesPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleActivityAdded = () => {
    setRefreshKey((k) => k + 1);
    setShowForm(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Page Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>My Activities</h1>
            <p style={styles.subtitle}>Track your workouts and get AI-powered insights</p>
          </div>
          <button style={styles.addBtn} onClick={() => setShowForm(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Log Activity
          </button>
        </div>

        {/* Activity List */}
        <ActivityList refreshKey={refreshKey} />
      </div>

      {/* Modal Form */}
      {showForm && (
        <ActivityForm
          onActivityAdded={handleActivityAdded}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0a0b0f',
    padding: '40px 0 80px',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '36px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#f1f5f9',
    letterSpacing: '-0.5px',
    marginBottom: '6px',
  },
  subtitle: {
    fontSize: '15px',
    color: '#64748b',
  },
  addBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
    border: 'none',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '600',
    padding: '12px 22px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 0 24px rgba(99,102,241,0.3)',
    transition: 'opacity 0.2s ease',
    flexShrink: 0,
  },
};

export default ActivitiesPage;
