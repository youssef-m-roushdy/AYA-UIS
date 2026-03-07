import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiCalendar,
  FiUpload,
  FiUsers,
  FiBook,
  FiClock,
  FiAlertCircle,
  FiRefreshCw,
  FiEdit,
  FiTrash,
  FiSave,
  FiX,
  FiFilter,
  FiSearch,
  FiCheckCircle,
  FiMail,
  FiPhone,
  FiHash,
  FiLock,
} from 'react-icons/fi';
import { semesterService, scheduleService } from '../../services/otherServices';
import registrationService from '../../services/registrationService';
import { GRADE_LABELS, API_ENDPOINTS } from '../../constants';
import { toast } from 'react-toastify';
import SortMenu from '../../components/common/SortMenu';
import Pagination from '../../components/common/Pagination';
import FilterSelect from '../../components/common/FilterSelect';

/* ─────────────────────────────────────────────────────────────
   Constants
───────────────────────────────────────────────────────────── */
const SEMESTER_LABELS = {
  First_Semester: 'First Semester',
  Second_Semester: 'Second Semester',
  Summer: 'Summer Semester',
};
const STATUS_OPTIONS = ['Pending', 'Approved', 'Suspended', 'Rejected'];
const PROGRESS_OPTIONS = ['NotStarted', 'InProgress', 'Completed'];
const GRADE_OPTIONS = Object.keys(GRADE_LABELS);
const PROGRESS_LABELS = {
  Completed: 'Completed',
  InProgress: 'In Progress',
  NotStarted: 'Not Started',
};
const STATUS_BADGE = {
  Approved: 'badge-success',
  Pending: 'badge-warning',
  Rejected: 'badge-danger',
  Suspended: 'badge-neutral',
};
const PROGRESS_BADGE = {
  Completed: 'badge-success',
  InProgress: 'badge-info',
  NotStarted: 'badge-neutral',
};
const DEBOUNCE_MS = 500;

/* ── Force FilterSelect to fill its container ── */
const fslFullWidth = { display: 'flex', flexDirection: 'column' };
const FSL_FULL_STYLE = `
  .fsl-full .fsl-wrap    { width: 100%; }
  .fsl-full .fsl-trigger { width: 100%; min-width: unset; box-sizing: border-box; }
  .fsl-full .fsl-panel   { min-width: 100%; z-index: 1100; }
`;

/* ── Select field options for Edit Registration Modal ── */
const statusOptions = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Suspended', label: 'Suspended' },
  { value: 'Rejected', label: 'Rejected' },
];

const gradeOptions = [
  { value: '', label: '— No grade —' },
  ...Object.entries(GRADE_LABELS).map(([key, label]) => ({
    value: key,
    label: `${label} (${key})`,
  })),
];

const isPassedOptions = [
  { value: '', label: '— All —' },
  { value: 'true', label: 'Passed' },
  { value: 'false', label: 'Failed' },
];

const progressOptions = [
  { value: 'NotStarted', label: 'Not Started' },
  { value: 'InProgress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
];

const getGradeOptions = () => [
  { value: '', label: '— No grade —' },
  ...Object.entries(GRADE_LABELS).map(([key, label]) => ({
    value: key,
    label: `${label} (${key})`,
  })),
];

const statusBadge = s => (
  <span className={`badge ${STATUS_BADGE[s] || 'badge-neutral'}`}>{s}</span>
);
const progressBadge = p => (
  <span className={`badge ${PROGRESS_BADGE[p] || 'badge-neutral'}`}>
    {PROGRESS_LABELS[p] || p}
  </span>
);

/* ─────────────────────────────────────────────────────────────
   Async state helpers
───────────────────────────────────────────────────────────── */
const idle = { data: null, loading: false, error: null };
const mkLoad = () => ({ data: null, loading: true, error: null });
const mkOk = d => ({ data: d, loading: false, error: null });
const mkError = m => ({ data: null, loading: false, error: m });

/* ─────────────────────────────────────────────────────────────
   Small shared UI pieces
───────────────────────────────────────────────────────────── */
const TabSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
    <div className="spinner" />
  </div>
);

const TabError = ({ message, onRetry }) => (
  <div className="card" style={{ textAlign: 'center', padding: 40 }}>
    <FiAlertCircle
      size={32}
      style={{ color: 'var(--danger,#ef4444)', marginBottom: 12 }}
    />
    <p style={{ marginBottom: 16, color: 'var(--danger,#ef4444)' }}>
      {message}
    </p>
    <button className="btn btn-sm btn-ghost" onClick={onRetry}>
      <FiRefreshCw size={14} style={{ marginRight: 6 }} /> Retry
    </button>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   Modal shell
───────────────────────────────────────────────────────────── */
const ModalOverlay = ({ onClose, children, maxWidth = 560 }) => (
  <div
    onClick={onClose}
    style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(15,23,42,0.55)',
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
      padding: '24px 16px',
      animation: 'overlayFadeIn 0.18s ease',
    }}
  >
    <style>{`
      @keyframes overlayFadeIn { from{opacity:0} to{opacity:1} }
      @keyframes modalSlideIn  { from{opacity:0;transform:scale(0.96) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
    `}</style>
    <div
      onClick={e => e.stopPropagation()}
      style={{
        width: '100%',
        maxWidth,
        background: 'white',
        borderRadius: 16,
        boxShadow: '0 24px 64px rgba(0,0,0,0.2),0 8px 24px rgba(0,0,0,0.1)',
        border: '1px solid rgba(226,232,240,0.8)',
        animation: 'modalSlideIn 0.22s cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      {children}
    </div>
  </div>
);

const ModalHeader = ({ title, icon, onClose }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 28px',
      borderBottom: '1px solid #eef2f6',
      background: 'linear-gradient(135deg,#f8fafc 0%,#f1f5f9 100%)',
      borderRadius: '16px 16px 0 0',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
        }}
      >
        {icon}
      </div>
      <h2
        style={{
          fontSize: '1.05rem',
          fontWeight: 700,
          margin: 0,
          color: '#0f172a',
        }}
      >
        {title}
      </h2>
    </div>
    <button
      onClick={onClose}
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        background: 'none',
        border: '1px solid #e2e8f0',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#94a3b8',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = '#fee2e2';
        e.currentTarget.style.borderColor = '#fecaca';
        e.currentTarget.style.color = '#ef4444';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'none';
        e.currentTarget.style.borderColor = '#e2e8f0';
        e.currentTarget.style.color = '#94a3b8';
      }}
    >
      <FiX size={15} />
    </button>
  </div>
);

/* ── Styled field label ── */
const FieldLabel = ({ children, locked }) => (
  <label
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      marginBottom: 7,
      fontWeight: 600,
      fontSize: '0.75rem',
      color: locked ? '#94a3b8' : '#475569',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
    }}
  >
    {children}
    {locked && <FiLock size={10} style={{ color: '#cbd5e1' }} />}
  </label>
);

/* ── Polished input styles ── */
const baseInputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 10,
  border: '1.5px solid #e2e8f0',
  fontSize: '0.9rem',
  color: '#1e293b',
  background: '#f8fafc',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
  fontFamily: 'inherit',
};

const lockedInputStyle = {
  ...baseInputStyle,
  background: '#f1f5f9',
  color: '#94a3b8',
  cursor: 'not-allowed',
  borderColor: '#e8edf5',
  userSelect: 'none',
};

const selectStyle = {
  ...baseInputStyle,
  cursor: 'pointer',
  appearance: 'none',
  WebkitAppearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  paddingRight: 36,
};

/* ═══════════════════════════════════════════════════════════════
   Custom hook: useDebounce
═══════════════════════════════════════════════════════════════ */
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/* ═══════════════════════════════════════════════════════════════
   Edit Registration Modal
   — Grade is locked (read-only) when status is not "Pending"
═══════════════════════════════════════════════════════════════ */
function EditRegistrationModal({ reg, onClose, onSaved }) {
  const [form, setForm] = useState({
    status: reg.status || 'Pending',
    reason: reg.reason || '',
    grade: reg.grade || '',
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const gradeIsLocked = form.status !== 'Approved';

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);

    // Debug: log current form state
    console.log('📋 Current form state:', form);
    console.log('Registration object:', reg);

    const payload = {
      status: form.status,
      reason: form.reason.trim() || null,
      grade: form.grade || null,
    };

    console.log('📤 Sending update request:');
    console.log('Registration ID:', reg.id);
    console.log('Payload:', JSON.stringify(payload, null, 2));
    console.log(
      'URL would be:',
      `${API_ENDPOINTS.REGISTRATIONS.BY_ID(reg.id)}`
    );

    try {
      console.log('⏳ Calling registrationService.update...');
      const res = await registrationService.update(reg.id, payload);
      console.log('✅ Response:', res);
      toast.success('Registration updated');
      onSaved();
    } catch (err) {
      console.error('❌ Error caught:', err);
      console.error('Error config:', err?.config);
      console.error('Error status:', err?.response?.status);
      console.error('Error data:', err?.response?.data);
      toast.error(
        err?.response?.data?.message || 'Failed to update registration'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose} maxWidth={520}>
      <ModalHeader
        title="Edit Registration"
        icon={<FiEdit size={16} />}
        onClose={onClose}
      />
      <form onSubmit={handleSubmit}>
        <div
          style={{
            padding: '22px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          {/* Student + Course info chip */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 12,
              background: 'linear-gradient(135deg,#f0f4ff,#f8faff)',
              border: '1px solid #e0e7ff',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '6px 16px',
              fontSize: '0.85rem',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#a5b4fc',
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                }}
              >
                Student
              </span>
              <div style={{ fontWeight: 600, color: '#1e293b', marginTop: 2 }}>
                {reg.user?.displayName || reg.user?.userName || `#${reg.id}`}
              </div>
            </div>
            <div>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#a5b4fc',
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                }}
              >
                Course
              </span>
              <div style={{ fontWeight: 600, color: '#1e293b', marginTop: 2 }}>
                {reg.course?.name || `#${reg.id}`}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="fsl-full" style={fslFullWidth}>
            <FilterSelect
              label="Status"
              value={form.status}
              onChange={v => set('status', v || 'Pending')}
              options={statusOptions}
              placeholder="Select status"
            />
          </div>

          {/* Grade — locked when status ≠ Pending */}
          <div className="fsl-full" style={fslFullWidth}>
            {gradeIsLocked ? (
              <>
                <FieldLabel locked={gradeIsLocked}>
                  Grade
                  {gradeIsLocked && (
                    <span
                      style={{
                        marginLeft: 4,
                        fontSize: '0.72rem',
                        color: '#94a3b8',
                        fontWeight: 400,
                        textTransform: 'none',
                        letterSpacing: 0,
                      }}
                    >
                      — only editable when status is Pending
                    </span>
                  )}
                </FieldLabel>
                <div
                  style={{
                    ...lockedInputStyle,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    height: 42,
                  }}
                >
                  <FiLock
                    size={13}
                    style={{ color: '#cbd5e1', flexShrink: 0 }}
                  />
                  <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                    {form.grade
                      ? GRADE_LABELS[form.grade]
                        ? `${GRADE_LABELS[form.grade]} (${form.grade})`
                        : form.grade
                      : 'No grade assigned'}
                  </span>
                </div>
              </>
            ) : (
              <FilterSelect
                label="Grade"
                value={form.grade}
                onChange={v => set('grade', v || '')}
                options={getGradeOptions()}
                placeholder="Select grade"
              />
            )}
          </div>

          {/* Reason */}
          <div>
            <FieldLabel>
              Reason{' '}
              <span
                style={{
                  color: '#cbd5e1',
                  fontWeight: 400,
                  textTransform: 'none',
                  letterSpacing: 0,
                }}
              >
                (optional)
              </span>
            </FieldLabel>
            <textarea
              style={{
                ...baseInputStyle,
                resize: 'vertical',
                minHeight: 80,
                lineHeight: 1.6,
              }}
              value={form.reason}
              onChange={e => set('reason', e.target.value)}
              placeholder="Enter a reason or note…"
              onFocus={e => {
                e.target.style.borderColor = '#6366f1';
                e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)';
                e.target.style.background = 'white';
              }}
              onBlur={e => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
                e.target.style.background = '#f8fafc';
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            justifyContent: 'flex-end',
            padding: '14px 28px 22px',
            borderTop: '1px solid #f1f5f9',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '9px 20px',
              borderRadius: 9,
              border: '1.5px solid #e2e8f0',
              background: 'white',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            <FiX size={14} /> Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '9px 22px',
              borderRadius: 9,
              border: 'none',
              background: saving
                ? '#93c5fd'
                : 'linear-gradient(135deg,#3b82f6,#6366f1)',
              color: 'white',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: saving ? 'none' : '0 4px 12px rgba(99,102,241,0.35)',
              transition: 'all 0.15s',
            }}
          >
            {saving ? (
              <>
                <span className="spinner" style={{ width: 14, height: 14 }} />
                Saving…
              </>
            ) : (
              <>
                <FiSave size={14} /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Registration Card
   — Removed Approve / Suspend / Reject buttons
   — Kept only Edit + Delete
═══════════════════════════════════════════════════════════════ */
const RegistrationCard = React.memo(function RegistrationCard({
  reg,
  onEdit,
  onDelete,
  deletingId,
}) {
  const user = reg.user || {};
  const course = reg.course || {};

  const initials = (user.displayName || '?')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const avatarColor = user.gender === 'Female' ? '#ec4899' : '#3b82f6';
  const isDeleting = deletingId === reg.id;

  const registeredDate = reg.registeredAt
    ? new Date(reg.registeredAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—';

  return (
    <div
      style={{
        background: 'white',
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid #eef2f6',
        boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.18s, box-shadow 0.18s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.12)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.07)';
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '20px 20px 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: avatarColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: 22,
            flexShrink: 0,
            border: '3px solid white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            overflow: 'hidden',
          }}
        >
          {user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={user.displayName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            initials
          )}
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 6,
          }}
        >
          {statusBadge(reg.status)}
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
            {registeredDate}
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 20px 16px', flex: 1 }}>
        <h3
          style={{
            margin: '0 0 2px',
            fontSize: '1rem',
            fontWeight: 700,
            color: '#1e293b',
          }}
        >
          {user.displayName || '—'}
        </h3>
        <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#64748b' }}>
          @{user.userName || '—'}
        </p>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 7,
            marginBottom: 14,
          }}
        >
          {user.email && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: '13px',
                color: '#475569',
              }}
            >
              <FiMail size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.email}
              </span>
            </div>
          )}
          {user.academicCode && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: '13px',
                color: '#475569',
              }}
            >
              <FiHash size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
              <span>
                <span style={{ color: '#94a3b8', fontWeight: 500 }}>Code:</span>{' '}
                {user.academicCode}
              </span>
            </div>
          )}
          {user.phoneNumber && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: '13px',
                color: '#475569',
              }}
            >
              <FiPhone size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
              <span>{user.phoneNumber}</span>
            </div>
          )}
        </div>

        <div style={{ height: 1, background: '#f1f5f9', margin: '0 0 14px' }} />

        {/* Course chip */}
        <div
          style={{
            padding: '10px 12px',
            borderRadius: 10,
            background: '#f8fafc',
            border: '1px solid #e8edf5',
            marginBottom: 12,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 4,
            }}
          >
            <FiBook size={13} style={{ color: '#6366f1', flexShrink: 0 }} />
            <span
              style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}
            >
              {course.name || '—'}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              paddingLeft: 21,
            }}
          >
            {course.code && (
              <span
                style={{
                  fontSize: '11px',
                  background: '#eef2ff',
                  color: '#4338ca',
                  padding: '2px 8px',
                  borderRadius: 6,
                  fontWeight: 600,
                }}
              >
                {course.code}
              </span>
            )}
            {course.credits != null && (
              <span
                style={{
                  fontSize: '11px',
                  background: '#f0fdf4',
                  color: '#166534',
                  padding: '2px 8px',
                  borderRadius: 6,
                  fontWeight: 600,
                }}
              >
                {course.credits} Credits
              </span>
            )}
            {course.status && (
              <span
                style={{
                  fontSize: '11px',
                  background: '#f1f5f9',
                  color: '#475569',
                  padding: '2px 8px',
                  borderRadius: 6,
                }}
              >
                {course.status}
              </span>
            )}
          </div>
        </div>

        {/* Progress + Grade */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          {reg.progress && progressBadge(reg.progress)}
          {reg.grade && (
            <span
              style={{
                fontWeight: 700,
                fontSize: '13px',
                color:
                  reg.grade === 'F'
                    ? '#ef4444'
                    : reg.isPassed
                      ? '#16a34a'
                      : '#334155',
                background:
                  reg.grade === 'F'
                    ? '#fef2f2'
                    : reg.isPassed
                      ? '#f0fdf4'
                      : '#f8fafc',
                padding: '2px 10px',
                borderRadius: 6,
                border: `1px solid ${reg.grade === 'F' ? '#fecaca' : reg.isPassed ? '#bbf7d0' : '#e2e8f0'}`,
              }}
            >
              {GRADE_LABELS[reg.grade] || reg.grade}
            </span>
          )}
          {reg.isPassed && (
            <span
              style={{
                fontSize: '11px',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                gap: 3,
              }}
            >
              <FiCheckCircle size={11} /> Passed
            </span>
          )}
        </div>

        {reg.reason && (
          <div
            style={{
              marginTop: 10,
              padding: '8px 10px',
              borderRadius: 8,
              background: '#fffbeb',
              border: '1px solid #fde68a',
              fontSize: '12px',
              color: '#92400e',
              lineHeight: 1.5,
            }}
          >
            <strong>Reason:</strong> {reg.reason}
          </div>
        )}
      </div>

      {/* Action buttons — Edit + Delete only */}
      <div
        style={{
          borderTop: '1px solid #f1f5f9',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 1,
          background: '#f1f5f9',
        }}
      >
        <button
          onClick={() => onEdit(reg)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '12px',
            background: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
            color: '#3b82f6',
            transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#eff6ff';
            e.currentTarget.style.color = '#2563eb';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.color = '#3b82f6';
          }}
        >
          <FiEdit size={14} /> Edit
        </button>
        <button
          disabled={isDeleting}
          onClick={() => onDelete(reg)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '12px',
            background: 'white',
            border: 'none',
            cursor: isDeleting ? 'not-allowed' : 'pointer',
            fontSize: '13px',
            fontWeight: 500,
            color: '#ef4444',
            opacity: isDeleting ? 0.5 : 1,
            transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={e => {
            if (!isDeleting) {
              e.currentTarget.style.background = '#fef2f2';
              e.currentTarget.style.color = '#dc2626';
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.color = '#ef4444';
          }}
        >
          {isDeleting ? (
            <span className="spinner" style={{ width: 13, height: 13 }} />
          ) : (
            <FiTrash size={14} />
          )}
          Delete
        </button>
      </div>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════
   Filter bar
═══════════════════════════════════════════════════════════════ */
const EMPTY_FILTERS = {
  StudentUserName: '',
  CourseName: '',
  AcademicCode: '',
  CourseCode: '',
  Status: '',
  Grade: '',
  IsPassed: '',
  Progress: '',
};

const FILTER_LABEL_MAP = {
  StudentUserName: 'Username',
  CourseName: 'Course',
  AcademicCode: 'Academic Code',
  CourseCode: 'Course Code',
  Status: v => v,
  Grade: v => (GRADE_LABELS[v] ? `${GRADE_LABELS[v]} (${v})` : v),
  IsPassed: v => (v === 'true' ? 'Passed' : 'Failed'),
  Progress: v => PROGRESS_LABELS[v] || v,
};

const RegFilterBar = React.memo(function RegFilterBar({
  onCommit,
  onSortChange,
  sortBy,
  sortDirection,
  onRefresh,
}) {
  const [local, setLocal] = useState(EMPTY_FILTERS);
  const debounced = useDebounce(local, DEBOUNCE_MS);
  const committedRef = useRef(EMPTY_FILTERS);

  useEffect(() => {
    if (JSON.stringify(debounced) === JSON.stringify(committedRef.current))
      return;
    committedRef.current = debounced;
    onCommit(debounced);
  }, [debounced, onCommit]);

  const handleChange = (key, val) =>
    setLocal(prev => ({ ...prev, [key]: val }));

  const handleClear = () => {
    setLocal(EMPTY_FILTERS);
    committedRef.current = EMPTY_FILTERS;
    onCommit(EMPTY_FILTERS);
  };

  const hasFilters = Object.values(local).some(Boolean);

  return (
    <div
      style={{
        background: 'white',
        borderRadius: 16,
        padding: '16px 20px',
        marginBottom: 20,
        border: '1px solid #eef2f6',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <span
          style={{
            fontWeight: 600,
            fontSize: '0.95rem',
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <FiFilter size={15} style={{ color: '#6366f1' }} /> Filter Requests
        </span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {hasFilters && (
            <button
              className="btn btn-sm btn-ghost"
              onClick={handleClear}
              style={{ color: '#ef4444', fontSize: '0.82rem' }}
            >
              <FiX size={12} /> Clear filters
            </button>
          )}
          <SortMenu
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSortChange={onSortChange}
            sortOptions={[
              { value: 'StudentUserName', label: 'Student Name' },
              { value: 'CourseName', label: 'Course Name' },
              { value: 'RegisteredAt', label: 'Date Registered' },
            ]}
          />
          <button className="btn btn-sm btn-ghost" onClick={onRefresh}>
            <FiRefreshCw size={13} style={{ marginRight: 4 }} /> Refresh
          </button>
        </div>
      </div>

      {/* Inputs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 14,
        }}
      >
        {[
          {
            key: 'StudentUserName',
            label: 'Username',
            placeholder: 'Filter by username…',
          },
          {
            key: 'CourseName',
            label: 'Course Name',
            placeholder: 'Filter by course name…',
          },
          {
            key: 'AcademicCode',
            label: 'Academic Code',
            placeholder: 'Filter by code…',
          },
          {
            key: 'CourseCode',
            label: 'Course Code',
            placeholder: 'Filter by course code…',
          },
        ].map(({ key, label, placeholder }) => (
          <div
            key={key}
            style={{ display: 'flex', flexDirection: 'column', gap: 5 }}
          >
            <span
              style={{
                fontSize: '10.5px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                color: '#94a3b8',
              }}
            >
              {label}
            </span>
            <div style={{ position: 'relative' }}>
              <FiSearch
                size={12}
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#cbd5e1',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="text"
                placeholder={placeholder}
                value={local[key]}
                onChange={e => handleChange(key, e.target.value)}
                style={{
                  height: 38,
                  paddingLeft: 30,
                  paddingRight: 12,
                  borderRadius: 10,
                  width: '100%',
                  boxSizing: 'border-box',
                  border: `1.5px solid ${local[key] ? '#6366f1' : '#e2e8f0'}`,
                  background: local[key] ? '#eef2ff' : '#f8fafc',
                  color: local[key] ? '#4338ca' : '#334155',
                  fontSize: '13px',
                  outline: 'none',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
              />
            </div>
          </div>
        ))}

        <div className="fsl-full" style={fslFullWidth}>
          <FilterSelect
            label="Status"
            value={local.Status}
            onChange={v => handleChange('Status', v || '')}
            options={statusOptions}
            placeholder="All statuses"
          />
        </div>
        <div className="fsl-full" style={fslFullWidth}>
          <FilterSelect
            label="Grade"
            value={local.Grade}
            onChange={v => handleChange('Grade', v || '')}
            options={getGradeOptions(true)}
            placeholder="All Grades"
          />
        </div>
        <div className="fsl-full" style={fslFullWidth}>
          <FilterSelect
            label="Is Passed"
            value={local.IsPassed}
            onChange={v => handleChange('IsPassed', v || '')}
            options={isPassedOptions}
            placeholder="Select option"
          />
        </div>
        <div className="fsl-full" style={fslFullWidth}>
          <FilterSelect
            label="Course Progress"
            value={local.Progress}
            onChange={v => handleChange('Progress', v || '')}
            options={progressOptions}
            placeholder="Select progress"
          />
        </div>
      </div>

      {/* Active chips */}
      {hasFilters && (
        <div
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
            Active:
          </span>
          {Object.entries(local)
            .filter(([, v]) => v)
            .map(([k, v]) => {
              const labelFn = FILTER_LABEL_MAP[k];
              const displayKey = typeof labelFn === 'string' ? labelFn : k;
              const displayVal = typeof labelFn === 'function' ? labelFn(v) : v;
              return (
                <span
                  key={k}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '3px 10px',
                    borderRadius: 20,
                    background: '#eef2ff',
                    color: '#4338ca',
                    fontSize: '12px',
                    fontWeight: 500,
                  }}
                >
                  {displayKey}: "{displayVal}"
                  <button
                    onClick={() => handleChange(k, '')}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6366f1',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <FiX size={11} />
                  </button>
                </span>
              );
            })}
        </div>
      )}
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════
   Main Component
═══════════════════════════════════════════════════════════════ */
export default function AdminSemesterDetail() {
  const { semesterId, studyYearId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('schedule');
  const [semester, setSemester] = useState(null);
  const [semLoading, setSemLoading] = useState(true);

  const [schedState, setSchedState] = useState(idle);
  const [regState, setRegState] = useState(idle);
  const [courseState, setCourseState] = useState(idle);

  const fetchedOnce = useRef(new Set());
  const [uploading, setUploading] = useState(false);
  const [editingReg, setEditingReg] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  /* Pagination */
  const [regPage, setRegPage] = useState(1);
  const [regTotalCount, setRegTotalCount] = useState(0);
  const [regTotalPages, setRegTotalPages] = useState(1);
  const regPageSize = 12;

  /* Sort */
  const [regSortBy, setRegSortBy] = useState('');
  const [regSortDirection, setRegSortDirection] = useState('Ascending');

  /* Committed filter query */
  const [regQuery, setRegQuery] = useState(EMPTY_FILTERS);

  /* Stable refs */
  const semesterIdRef = useRef(semesterId);
  const studyYearIdRef = useRef(studyYearId);
  const regPageRef = useRef(1);
  const regPageSizeRef = useRef(regPageSize);
  const regQueryRef = useRef(EMPTY_FILTERS);
  const regSortByRef = useRef('');
  const regSortDirectionRef = useRef('Ascending');

  regPageRef.current = regPage;
  regQueryRef.current = regQuery;
  regSortByRef.current = regSortBy;
  regSortDirectionRef.current = regSortDirection;

  /* ── Semester header ── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setSemLoading(true);
      try {
        const res = await semesterService.getByYear(studyYearIdRef.current);
        const list = res?.data ?? res ?? [];
        const found = Array.isArray(list)
          ? list.find(s => String(s.id) === String(semesterIdRef.current))
          : list;
        if (!cancelled) setSemester(found || null);
      } catch {
        if (!cancelled) toast.error('Failed to load semester');
      } finally {
        if (!cancelled) setSemLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ── fetchRegistrations ── */
  const fetchRegistrations = useCallback(
    async (
      page = regPageRef.current,
      query = regQueryRef.current,
      sortBy = regSortByRef.current,
      sortDir = regSortDirectionRef.current
    ) => {
      setRegState(mkLoad());
      try {
        const res = await registrationService.getPendingRegistrationsPaginated(
          {
            studyYearId: studyYearIdRef.current,
            semesterId: semesterIdRef.current,
            StudentUserName: query.StudentUserName || undefined,
            CourseName: query.CourseName || undefined,
            AcademicCode: query.AcademicCode || undefined,
            CourseCode: query.CourseCode || undefined,
            Status: query.Status || undefined,
            Grade: query.Grade || undefined, // ✅ add
            IsPassed: query.IsPassed || undefined, // ✅ add
            Progress: query.Progress || undefined, // ✅ add
          },
          page,
          regPageSizeRef.current,
          sortBy || undefined,
          sortDir || undefined
        );
        const data = res?.data?.data ?? res?.data ?? [];
        const pagination = res?.data?.pagination ?? {};
        setRegState(mkOk(data));
        setRegTotalCount(pagination.totalCount ?? data.length);
        setRegTotalPages(pagination.totalPages ?? 1);
      } catch (e) {
        const msg = e?.response?.data?.message || 'Failed to load requests';
        setRegState(mkError(msg));
        toast.error(msg);
      }
    },
    []
  );

  const fetchSchedule = useCallback(async () => {
    setSchedState(mkLoad());
    try {
      const res = await scheduleService.getBySemester(semesterIdRef.current);
      setSchedState(mkOk(res?.data ?? res ?? null));
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to load schedule';
      setSchedState(mkError(msg));
      toast.error(msg);
    }
  }, []);

  const fetchCourses = useCallback(async () => {
    setCourseState(mkOk([]));
  }, []);

  /* ── Lazy tab loading ── */
  useEffect(() => {
    if (fetchedOnce.current.has(activeTab)) return;
    fetchedOnce.current.add(activeTab);
    if (activeTab === 'schedule') fetchSchedule();
    if (activeTab === 'registrations') fetchRegistrations();
    if (activeTab === 'courses') fetchCourses();
  }, [activeTab, fetchSchedule, fetchRegistrations, fetchCourses]);

  /* ── React to filter changes ── */
  const isFirstFilterRender = useRef(true);
  useEffect(() => {
    if (isFirstFilterRender.current) {
      isFirstFilterRender.current = false;
      return;
    }
    regPageRef.current = 1;
    setRegPage(1);
    fetchRegistrations(
      1,
      regQuery,
      regSortByRef.current,
      regSortDirectionRef.current
    );
  }, [regQuery, fetchRegistrations]);

  /* ── Handlers ── */
  const handleFilterCommit = useCallback(committed => {
    setRegQuery(committed);
  }, []);

  const handleRegSortChange = useCallback(
    (field, dir) => {
      regSortByRef.current = field;
      regSortDirectionRef.current = dir;
      setRegSortBy(field);
      setRegSortDirection(dir);
      regPageRef.current = 1;
      setRegPage(1);
      fetchRegistrations(1, regQueryRef.current, field, dir);
    },
    [fetchRegistrations]
  );

  const handleRegPageChange = useCallback(
    page => {
      regPageRef.current = page;
      setRegPage(page);
      fetchRegistrations(
        page,
        regQueryRef.current,
        regSortByRef.current,
        regSortDirectionRef.current
      );
    },
    [fetchRegistrations]
  );

  const handleRefresh = useCallback(() => {
    fetchRegistrations(
      regPageRef.current,
      regQueryRef.current,
      regSortByRef.current,
      regSortDirectionRef.current
    );
  }, [fetchRegistrations]);

  const handleDelete = useCallback(
    async reg => {
      const name =
        reg.user?.displayName ||
        reg.user?.userName ||
        `registration #${reg.id}`;
      if (
        !window.confirm(
          `Delete registration for "${name}"?\nThis cannot be undone.`
        )
      )
        return;
      setDeletingId(reg.id);
      try {
        await registrationService.del(reg.id);
        toast.success('Registration deleted');
        fetchRegistrations(
          regPageRef.current,
          regQueryRef.current,
          regSortByRef.current,
          regSortDirectionRef.current
        );
      } catch (e) {
        toast.error(
          e?.response?.data?.message || 'Failed to delete registration'
        );
      } finally {
        setDeletingId(null);
      }
    },
    [fetchRegistrations]
  );

  const handleEditSaved = useCallback(() => {
    setEditingReg(null);
    fetchRegistrations(
      regPageRef.current,
      regQueryRef.current,
      regSortByRef.current,
      regSortDirectionRef.current
    );
  }, [fetchRegistrations]);

  const handleScheduleUpload = useCallback(
    async file => {
      if (!file) {
        toast.error('Select a file');
        return;
      }
      setUploading(true);
      try {
        const fd = new FormData();
        fd.append('file', file);
        await scheduleService.create(
          studyYearIdRef.current,
          null,
          semesterIdRef.current,
          fd
        );
        toast.success('Schedule uploaded');
        fetchedOnce.current.delete('schedule');
        fetchSchedule();
      } catch (e) {
        toast.error(e?.response?.data?.message || 'Failed to upload schedule');
      } finally {
        setUploading(false);
      }
    },
    [fetchSchedule]
  );

  /* ── Derived ── */
  const schedule = schedState.data;
  const registrations = regState.data || [];
  const courses = courseState.data || [];

  const tabs = [
    { key: 'schedule', label: 'Schedule', icon: <FiCalendar /> },
    {
      key: 'registrations',
      label: 'Requests',
      icon: <FiUsers />,
      count: regTotalCount || (regState.data ? registrations.length : '…'),
    },
    {
      key: 'courses',
      label: 'Courses',
      icon: <FiBook />,
      count: courseState.data ? courses.length : '…',
    },
  ];

  if (semLoading)
    return (
      <div
        className="page-container"
        style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}
      >
        <div className="spinner" />
      </div>
    );

  return (
    <div className="page-container">
      <style>{FSL_FULL_STYLE}</style>
      {editingReg && (
        <EditRegistrationModal
          reg={editingReg}
          onClose={() => setEditingReg(null)}
          onSaved={handleEditSaved}
        />
      )}

      {/* Page header */}
      <div className="page-header">
        <button
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: 12 }}
          onClick={() => navigate(`/admin/study-year/${studyYearId}/manage`)}
        >
          <FiArrowLeft /> Back to Study Year
        </button>
        <h1>
          <FiCalendar style={{ marginRight: 8 }} />
          {SEMESTER_LABELS[semester?.title] || semester?.title}
        </h1>
        <p>
          {semester?.startDate &&
            new Date(semester.startDate).toLocaleDateString()}
          {' — '}
          {semester?.endDate && new Date(semester.endDate).toLocaleDateString()}
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          marginBottom: 24,
          borderBottom: '2px solid var(--border)',
        }}
      >
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 20px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem',
              marginBottom: -2,
              transition: 'var(--transition)',
              borderBottom:
                activeTab === tab.key
                  ? '2px solid var(--primary)'
                  : '2px solid transparent',
              color:
                activeTab === tab.key ? 'var(--primary)' : 'var(--text-light)',
              fontWeight: activeTab === tab.key ? 600 : 400,
            }}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background:
                    activeTab === tab.key ? 'var(--primary)' : 'var(--border)',
                  color: activeTab === tab.key ? 'white' : 'var(--text-light)',
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ═══════ Schedule Tab ═══════ */}
      {activeTab === 'schedule' && (
        <>
          {schedState.loading && <TabSpinner />}
          {schedState.error && (
            <TabError
              message={schedState.error}
              onRetry={() => {
                setSchedState(idle);
                fetchedOnce.current.delete('schedule');
                fetchSchedule();
              }}
            />
          )}
          {!schedState.loading && !schedState.error && (
            <>
              <div
                className="card"
                style={{
                  marginBottom: 20,
                  padding: 20,
                  background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
                  color: 'white',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <h3 style={{ color: 'white', marginBottom: 4 }}>
                      Upload Schedule
                    </h3>
                    <p style={{ opacity: 0.9, fontSize: '0.9rem', margin: 0 }}>
                      Upload a schedule file (JSON, CSV, or XLSX)
                    </p>
                  </div>
                  <div>
                    <input
                      type="file"
                      accept=".json,.csv,.xlsx"
                      id="schedule-upload"
                      style={{ display: 'none' }}
                      onChange={e => {
                        if (e.target.files?.[0]) {
                          handleScheduleUpload(e.target.files[0]);
                          e.target.value = '';
                        }
                      }}
                    />
                    <button
                      className="btn btn-light"
                      disabled={uploading}
                      style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                      onClick={() =>
                        document.getElementById('schedule-upload').click()
                      }
                    >
                      <FiUpload size={16} />
                      {uploading ? 'Uploading…' : 'Upload File'}
                    </button>
                  </div>
                </div>
              </div>

              {schedule?.scheduleEntries?.length > 0 ? (
                <>
                  <div
                    style={{
                      display: 'flex',
                      gap: 10,
                      flexWrap: 'wrap',
                      marginBottom: 20,
                    }}
                  >
                    {schedule.title && (
                      <span className="badge badge-neutral">
                        {schedule.title}
                      </span>
                    )}
                    {schedule.totalCreditHours != null && (
                      <span className="badge badge-info">
                        {schedule.totalCreditHours} Credit Hours
                      </span>
                    )}
                    <span className="badge badge-success">
                      {schedule.scheduleEntries.length} session
                      {schedule.scheduleEntries.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div
                    className="card"
                    style={{ padding: 0, overflow: 'hidden' }}
                  >
                    <table style={{ width: '100%', margin: 0 }}>
                      <thead>
                        <tr>
                          <th>Course</th>
                          <th>Instructor</th>
                          <th>Room</th>
                          <th>Day</th>
                          <th>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schedule.scheduleEntries.map((entry, i) => (
                          <tr key={i}>
                            <td>
                              <strong>
                                {entry.courseName || entry.course?.name || '—'}
                              </strong>
                              {(entry.courseCode || entry.course?.code) && (
                                <>
                                  <br />
                                  <small style={{ color: 'var(--text-light)' }}>
                                    {entry.courseCode || entry.course?.code}
                                  </small>
                                </>
                              )}
                            </td>
                            <td>
                              {entry.instructorName ||
                                entry.instructor?.name ||
                                '—'}
                            </td>
                            <td>{entry.room || entry.location || '—'}</td>
                            <td>{entry.day || '—'}</td>
                            <td>
                              <span
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4,
                                }}
                              >
                                <FiClock size={13} style={{ opacity: 0.6 }} />
                                {entry.startTime || '—'}
                                {entry.endTime && ` – ${entry.endTime}`}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="card empty-state">
                  <h3>No schedule uploaded</h3>
                  <p>Upload a schedule file to display it to students</p>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ═══════ Requests Tab ═══════ */}
      {activeTab === 'registrations' && (
        <>
          <RegFilterBar
            onCommit={handleFilterCommit}
            onSortChange={handleRegSortChange}
            sortBy={regSortBy}
            sortDirection={regSortDirection}
            onRefresh={handleRefresh}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <span
              style={{
                background: '#f1f5f9',
                padding: '5px 12px',
                borderRadius: 20,
                fontSize: '13px',
                color: '#334155',
                fontWeight: 500,
              }}
            >
              {regTotalCount} pending request{regTotalCount !== 1 ? 's' : ''}{' '}
              found
            </span>
            {regState.loading && (
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                Loading…
              </span>
            )}
          </div>

          {regState.error && (
            <TabError
              message={regState.error}
              onRetry={() => {
                setRegState(idle);
                fetchRegistrations();
              }}
            />
          )}

          {!regState.error && (
            <>
              {regState.loading && registrations.length === 0 && <TabSpinner />}

              {!regState.loading && registrations.length === 0 && (
                <div
                  style={{
                    background: 'white',
                    borderRadius: 16,
                    padding: '60px 20px',
                    textAlign: 'center',
                    border: '1px solid #eef2f6',
                  }}
                >
                  <FiUsers
                    size={42}
                    style={{ marginBottom: 12, opacity: 0.3, color: '#94a3b8' }}
                  />
                  <h3 style={{ margin: '0 0 8px', color: '#334155' }}>
                    No pending requests
                  </h3>
                  <p style={{ margin: 0, color: '#64748b' }}>
                    No pending registration requests match your criteria
                  </p>
                </div>
              )}

              {registrations.length > 0 && (
                <>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fill, minmax(340px, 1fr))',
                      gap: 20,
                      marginBottom: 24,
                      opacity: regState.loading ? 0.6 : 1,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    {registrations.map(reg => (
                      <RegistrationCard
                        key={reg.id}
                        reg={reg}
                        onEdit={setEditingReg}
                        onDelete={handleDelete}
                        deletingId={deletingId}
                      />
                    ))}
                  </div>
                  <Pagination
                    currentPage={regPage}
                    totalPages={regTotalPages}
                    pageSize={regPageSize}
                    totalCount={regTotalCount}
                    onPageChange={handleRegPageChange}
                    isLoading={regState.loading}
                  />
                </>
              )}
            </>
          )}
        </>
      )}

      {/* ═══════ Courses Tab ═══════ */}
      {activeTab === 'courses' && (
        <>
          {courseState.loading && <TabSpinner />}
          {courseState.error && (
            <TabError
              message={courseState.error}
              onRetry={() => {
                setCourseState(idle);
                fetchedOnce.current.delete('courses');
                fetchCourses();
              }}
            />
          )}
          {!courseState.loading &&
            !courseState.error &&
            (courses.length === 0 ? (
              <div className="card empty-state">
                <h3>No courses assigned</h3>
                <p>No courses are assigned to this semester yet</p>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))',
                  gap: 20,
                }}
              >
                {courses.map(course => (
                  <div key={course.id} className="card">
                    <div style={{ marginBottom: 12 }}>
                      <h3 style={{ fontSize: '1.05rem', marginBottom: 4 }}>
                        {course.name}
                      </h3>
                      <small style={{ color: 'var(--text-light)' }}>
                        {course.code} · {course.credits || 0} Credits
                      </small>
                    </div>
                    {course.description && (
                      <p
                        style={{
                          fontSize: '0.85rem',
                          color: 'var(--text-light)',
                          marginBottom: 12,
                          lineHeight: 1.5,
                        }}
                      >
                        {course.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {course.instructor && (
                        <span className="badge badge-info">
                          {course.instructor}
                        </span>
                      )}
                      {course.department && (
                        <span className="badge badge-neutral">
                          {course.department}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
        </>
      )}
    </div>
  );
}
