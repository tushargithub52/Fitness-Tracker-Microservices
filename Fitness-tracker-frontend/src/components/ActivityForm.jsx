import { useState } from 'react';
import { addActivity } from '../services/api';

const ACTIVITY_TYPES = [
  { value: 'RUNNING',         label: 'Running',         icon: '🏃' },
  { value: 'CYCLING',         label: 'Cycling',         icon: '🚴' },
  { value: 'SWIMMING',        label: 'Swimming',        icon: '🏊' },
  { value: 'WALKING',         label: 'Walking',         icon: '🚶' },
  { value: 'YOGA',            label: 'Yoga',            icon: '🧘' },
  { value: 'WEIGHT_TRAINING', label: 'Weights',         icon: '🏋️' },
  { value: 'HIIT',            label: 'HIIT',            icon: '⚡' },
  { value: 'CARDIO',          label: 'Cardio',          icon: '❤️' },
  { value: 'STRETCHING',      label: 'Stretching',      icon: '🤸' },
  { value: 'OTHER',           label: 'Other',           icon: '💪' },
];

// Additional metric fields grouped by activity type
// All go into additionalMetrics map — all optional
const EXTRA_FIELDS = {
  RUNNING: [
    { key: 'distance',      label: 'Distance (km)',        type: 'number', placeholder: 'e.g. 5.2',  icon: '📍' },
    { key: 'avgPace',       label: 'Avg Pace (min/km)',    type: 'text',   placeholder: 'e.g. 5:30', icon: '⏱️' },
    { key: 'avgHeartRate',  label: 'Avg Heart Rate (bpm)', type: 'number', placeholder: 'e.g. 145',  icon: '❤️' },
    { key: 'maxHeartRate',  label: 'Max Heart Rate (bpm)', type: 'number', placeholder: 'e.g. 172',  icon: '💓' },
    { key: 'elevationGain', label: 'Elevation Gain (m)',   type: 'number', placeholder: 'e.g. 120',  icon: '⛰️' },
    { key: 'notes',         label: 'Notes',                type: 'text',   placeholder: 'e.g. felt strong, hilly route', icon: '📝' },
  ],
  CYCLING: [
    { key: 'distance',      label: 'Distance (km)',        type: 'number', placeholder: 'e.g. 25',   icon: '📍' },
    { key: 'avgSpeed',      label: 'Avg Speed (km/h)',     type: 'number', placeholder: 'e.g. 28',   icon: '💨' },
    { key: 'avgHeartRate',  label: 'Avg Heart Rate (bpm)', type: 'number', placeholder: 'e.g. 138',  icon: '❤️' },
    { key: 'elevationGain', label: 'Elevation Gain (m)',   type: 'number', placeholder: 'e.g. 350',  icon: '⛰️' },
    { key: 'notes',         label: 'Notes',                type: 'text',   placeholder: 'e.g. outdoor ride, windy',      icon: '📝' },
  ],
  SWIMMING: [
    { key: 'distance',      label: 'Distance (m)',         type: 'number', placeholder: 'e.g. 1000', icon: '📍' },
    { key: 'laps',          label: 'Laps',                 type: 'number', placeholder: 'e.g. 20',   icon: '🔄' },
    { key: 'strokeType',    label: 'Stroke Type',          type: 'text',   placeholder: 'e.g. freestyle, breaststroke', icon: '🏊' },
    { key: 'avgHeartRate',  label: 'Avg Heart Rate (bpm)', type: 'number', placeholder: 'e.g. 130',  icon: '❤️' },
    { key: 'notes',         label: 'Notes',                type: 'text',   placeholder: 'e.g. open water, pool',         icon: '📝' },
  ],
  WALKING: [
    { key: 'distance',      label: 'Distance (km)',        type: 'number', placeholder: 'e.g. 4.0',  icon: '📍' },
    { key: 'steps',         label: 'Steps',                type: 'number', placeholder: 'e.g. 8000', icon: '👣' },
    { key: 'avgHeartRate',  label: 'Avg Heart Rate (bpm)', type: 'number', placeholder: 'e.g. 95',   icon: '❤️' },
    { key: 'terrain',       label: 'Terrain',              type: 'text',   placeholder: 'e.g. flat, hilly, treadmill',  icon: '🗺️' },
    { key: 'notes',         label: 'Notes',                type: 'text',   placeholder: 'e.g. morning walk, post-meal', icon: '📝' },
  ],
  WEIGHT_TRAINING: [
    { key: 'muscleGroups',  label: 'Muscle Groups',        type: 'text',   placeholder: 'e.g. chest, triceps',          icon: '💪' },
    { key: 'totalSets',     label: 'Total Sets',           type: 'number', placeholder: 'e.g. 15',   icon: '🔢' },
    { key: 'totalReps',     label: 'Total Reps',           type: 'number', placeholder: 'e.g. 120',  icon: '🔁' },
    { key: 'maxWeightKg',   label: 'Max Weight (kg)',      type: 'number', placeholder: 'e.g. 80',   icon: '🏋️' },
    { key: 'avgHeartRate',  label: 'Avg Heart Rate (bpm)', type: 'number', placeholder: 'e.g. 110',  icon: '❤️' },
    { key: 'notes',         label: 'Notes',                type: 'text',   placeholder: 'e.g. push day, felt strong',   icon: '📝' },
  ],
  HIIT: [
    { key: 'rounds',        label: 'Rounds',               type: 'number', placeholder: 'e.g. 5',    icon: '🔄' },
    { key: 'workInterval',  label: 'Work Interval (sec)',  type: 'number', placeholder: 'e.g. 40',   icon: '⏱️' },
    { key: 'restInterval',  label: 'Rest Interval (sec)',  type: 'number', placeholder: 'e.g. 20',   icon: '😮‍💨' },
    { key: 'avgHeartRate',  label: 'Avg Heart Rate (bpm)', type: 'number', placeholder: 'e.g. 160',  icon: '❤️' },
    { key: 'maxHeartRate',  label: 'Max Heart Rate (bpm)', type: 'number', placeholder: 'e.g. 185',  icon: '💓' },
    { key: 'notes',         label: 'Notes',                type: 'text',   placeholder: 'e.g. Tabata, full body',        icon: '📝' },
  ],
  CARDIO: [
    { key: 'avgHeartRate',  label: 'Avg Heart Rate (bpm)', type: 'number', placeholder: 'e.g. 140',  icon: '❤️' },
    { key: 'maxHeartRate',  label: 'Max Heart Rate (bpm)', type: 'number', placeholder: 'e.g. 168',  icon: '💓' },
    { key: 'equipment',     label: 'Equipment',            type: 'text',   placeholder: 'e.g. elliptical, rowing machine', icon: '🏃' },
    { key: 'notes',         label: 'Notes',                type: 'text',   placeholder: 'e.g. steady state, zone 2',    icon: '📝' },
  ],
  YOGA: [
    { key: 'style',         label: 'Yoga Style',           type: 'text',   placeholder: 'e.g. Vinyasa, Hatha, Yin',     icon: '🧘' },
    { key: 'intensityLevel',label: 'Intensity (1–10)',      type: 'number', placeholder: 'e.g. 4',    icon: '📊', min: 1, max: 10 },
    { key: 'focusArea',     label: 'Focus Area',           type: 'text',   placeholder: 'e.g. flexibility, balance',    icon: '🎯' },
    { key: 'notes',         label: 'Notes',                type: 'text',   placeholder: 'e.g. morning flow, restorative', icon: '📝' },
  ],
  STRETCHING: [
    { key: 'focusArea',     label: 'Focus Area',           type: 'text',   placeholder: 'e.g. hamstrings, back',        icon: '🎯' },
    { key: 'intensityLevel',label: 'Intensity (1–10)',      type: 'number', placeholder: 'e.g. 3',    icon: '📊', min: 1, max: 10 },
    { key: 'notes',         label: 'Notes',                type: 'text',   placeholder: 'e.g. post-run, injury recovery', icon: '📝' },
  ],
  OTHER: [
    { key: 'activityName',  label: 'Activity Name',        type: 'text',   placeholder: 'e.g. Rock Climbing',           icon: '🏷️' },
    { key: 'avgHeartRate',  label: 'Avg Heart Rate (bpm)', type: 'number', placeholder: 'e.g. 120',  icon: '❤️' },
    { key: 'intensityLevel',label: 'Intensity (1–10)',      type: 'number', placeholder: 'e.g. 6',    icon: '📊', min: 1, max: 10 },
    { key: 'notes',         label: 'Notes',                type: 'text',   placeholder: 'Describe your activity',       icon: '📝' },
  ],
};

const initialState = { type: '', duration: '', caloriesBurned: '', startTime: '' };

const ActivityForm = ({ onActivityAdded, onClose }) => {
  const [activity, setActivity]   = useState(initialState);
  const [metrics, setMetrics]     = useState({});
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [success, setSuccess]     = useState(false);
  const [showExtra, setShowExtra] = useState(false);

  const extraFields = EXTRA_FIELDS[activity.type] || [];

  const handleTypeSelect = (type) => {
    setActivity({ ...activity, type });
    setMetrics({});          // reset metrics when type changes
    setShowExtra(false);
  };

  const handleMetric = (key, value) => {
    setMetrics((prev) => ({ ...prev, [key]: value }));
  };

  // Build additionalMetrics — only include non-empty values, cast numbers
  const buildMetrics = () => {
    const result = {};
    (EXTRA_FIELDS[activity.type] || []).forEach(({ key, type }) => {
      const val = metrics[key];
      if (val === '' || val === undefined || val === null) return;
      result[key] = type === 'number' ? Number(val) : val;
    });
    return result;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activity.type || !activity.duration || !activity.caloriesBurned) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await addActivity({
        type:            activity.type,
        duration:        Number(activity.duration),
        caloriesBurned:  Number(activity.caloriesBurned),
        startTime:       activity.startTime || undefined,
        additionalMetrics: buildMetrics(),
      });
      setSuccess(true);
      setActivity(initialState);
      setMetrics({});
      setTimeout(() => {
        setSuccess(false);
        if (onActivityAdded) onActivityAdded();
        if (onClose) onClose();
      }, 1400);
    } catch (err) {
      setError('Failed to add activity. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={st.overlay} onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div style={st.modal}>

        {/* Header */}
        <div style={st.header}>
          <div>
            <h2 style={st.title}>Log Activity</h2>
            <p style={st.subtitle}>More details = better AI recommendations</p>
          </div>
          {onClose && (
            <button style={st.closeBtn} onClick={onClose}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>

        {success ? (
          <div style={st.successState}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <h3 style={st.successTitle}>Activity Logged!</h3>
            <p style={st.successText}>Your workout has been saved. AI insights are ready.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={st.form}>

            {/* ── Activity Type ── */}
            <div style={st.field}>
              <label style={st.label}>Activity Type <span style={st.req}>*</span></label>
              <div style={st.typeGrid}>
                {ACTIVITY_TYPES.map((t) => (
                  <button key={t.value} type="button"
                    style={{ ...st.typeBtn, ...(activity.type === t.value ? st.typeBtnActive : {}) }}
                    onClick={() => handleTypeSelect(t.value)}
                  >
                    <span style={{ fontSize: '20px' }}>{t.icon}</span>
                    <span style={st.typeLabel}>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Duration & Calories ── */}
            <div style={st.row}>
              <div style={st.field}>
                <label style={st.label}>Duration (min) <span style={st.req}>*</span></label>
                <div style={st.inputWrap}>
                  <svg style={st.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <input style={st.input} type="number" min="1" placeholder="e.g. 30"
                    value={activity.duration}
                    onChange={(e) => setActivity({ ...activity, duration: e.target.value })} />
                </div>
              </div>
              <div style={st.field}>
                <label style={st.label}>Calories Burned <span style={st.req}>*</span></label>
                <div style={st.inputWrap}>
                  <svg style={st.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                    <path d="M12 2c0 0-5 5-5 10a5 5 0 0 0 10 0c0-5-5-10-5-10z"/>
                  </svg>
                  <input style={st.input} type="number" min="0" placeholder="e.g. 320"
                    value={activity.caloriesBurned}
                    onChange={(e) => setActivity({ ...activity, caloriesBurned: e.target.value })} />
                </div>
              </div>
            </div>

            {/* ── Start Time ── */}
            <div style={st.field}>
              <label style={st.label}>Start Time</label>
              <div style={st.inputWrap}>
                <svg style={st.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <input style={st.input} type="datetime-local"
                  value={activity.startTime}
                  onChange={(e) => setActivity({ ...activity, startTime: e.target.value })} />
              </div>
            </div>

            {/* ── Additional Details (contextual) ── */}
            {extraFields.length > 0 && (
              <div style={st.extraSection}>
                <button type="button" style={st.extraToggle} onClick={() => setShowExtra(!showExtra)}>
                  <div style={st.extraToggleLeft}>
                    <div style={st.extraToggleIcon}>✨</div>
                    <div>
                      <div style={st.extraToggleTitle}>Additional Details</div>
                      <div style={st.extraToggleSub}>Optional — improves AI recommendation accuracy</div>
                    </div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"
                    style={{ transform: showExtra ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', flexShrink: 0 }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>

                {showExtra && (
                  <div style={st.extraFields}>
                    {extraFields.map((f) => (
                      <div key={f.key} style={st.field}>
                        <label style={st.labelSm}>
                          <span style={{ marginRight: '6px' }}>{f.icon}</span>{f.label}
                        </label>
                        <input
                          style={st.inputPlain}
                          type={f.type}
                          placeholder={f.placeholder}
                          min={f.min}
                          max={f.max}
                          value={metrics[f.key] ?? ''}
                          onChange={(e) => handleMetric(f.key, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {error && (
              <div style={st.errorBox}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <button type="submit" style={st.submitBtn} disabled={loading}>
              {loading ? (
                <><div style={st.btnSpinner} /> Saving...</>
              ) : (
                <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg> Log Activity</>
              )}
            </button>

          </form>
        )}
      </div>
    </div>
  );
};

const st = {
  overlay:    { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' },
  modal:      { background: '#161820', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', width: '100%', maxWidth: '580px', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 25px 80px rgba(0,0,0,0.6), 0 0 40px rgba(99,102,241,0.1)' },
  header:     { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '28px 28px 0', marginBottom: '24px' },
  title:      { fontSize: '22px', fontWeight: '700', color: '#f1f5f9', marginBottom: '4px' },
  subtitle:   { fontSize: '13px', color: '#64748b' },
  closeBtn:   { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b', width: '36px', height: '36px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'inherit' },
  form:       { padding: '0 28px 28px', display: 'flex', flexDirection: 'column', gap: '20px' },
  field:      { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 },
  label:      { fontSize: '13px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' },
  labelSm:    { fontSize: '13px', fontWeight: '500', color: '#94a3b8', display: 'flex', alignItems: 'center' },
  req:        { color: '#6366f1' },
  typeGrid:   { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' },
  typeBtn:    { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '10px 6px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s ease', fontFamily: 'inherit' },
  typeBtnActive: { background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.4)', boxShadow: '0 0 12px rgba(99,102,241,0.15)' },
  typeLabel:  { fontSize: '10px', color: '#94a3b8', fontWeight: '500', textAlign: 'center', lineHeight: '1.2' },
  row:        { display: 'flex', gap: '16px' },
  inputWrap:  { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon:  { position: 'absolute', left: '14px', pointerEvents: 'none', flexShrink: 0 },
  input:      { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#f1f5f9', fontSize: '15px', padding: '12px 14px 12px 42px', fontFamily: 'inherit', outline: 'none', colorScheme: 'dark' },
  inputPlain: { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#f1f5f9', fontSize: '14px', padding: '11px 14px', fontFamily: 'inherit', outline: 'none', colorScheme: 'dark' },
  // Extra section
  extraSection: { background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '14px', overflow: 'hidden' },
  extraToggle:  { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', gap: '12px' },
  extraToggleLeft:  { display: 'flex', alignItems: 'center', gap: '12px' },
  extraToggleIcon:  { fontSize: '18px', width: '34px', height: '34px', background: 'rgba(99,102,241,0.12)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  extraToggleTitle: { fontSize: '14px', fontWeight: '600', color: '#f1f5f9', textAlign: 'left', marginBottom: '2px' },
  extraToggleSub:   { fontSize: '12px', color: '#64748b', textAlign: 'left' },
  extraFields: { padding: '4px 16px 16px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' },
  errorBox:   { display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '12px 16px', color: '#f87171', fontSize: '14px' },
  submitBtn:  { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', border: 'none', color: '#fff', fontSize: '15px', fontWeight: '600', padding: '14px', borderRadius: '10px', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 0 24px rgba(99,102,241,0.3)', marginTop: '4px' },
  btnSpinner: { width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  successState: { textAlign: 'center', padding: '40px 28px 48px' },
  successTitle: { fontSize: '20px', fontWeight: '700', color: '#f1f5f9', marginBottom: '8px' },
  successText:  { fontSize: '14px', color: '#64748b' },
};

export default ActivityForm;
