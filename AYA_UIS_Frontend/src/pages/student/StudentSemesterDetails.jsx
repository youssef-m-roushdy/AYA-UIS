import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiBook,
  FiCheck,
  FiArrowLeft,
  FiChevronRight,
  FiFileText,
  FiClock,
  FiCalendar,
  FiClipboard,
  FiPlus,
  FiLock,
} from 'react-icons/fi';
import registrationService from '../../services/registrationService';
import { scheduleService } from '../../services/otherServices';
import { GRADE_LABELS } from '../../constants';
import { toast } from 'react-toastify';
import courseService from '../../services/courseService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  Approved: { cls: 'badge-success', label: 'Approved', locked: false },
  Pending: { cls: 'badge-warning', label: 'Pending', locked: true },
  Rejected: { cls: 'badge-danger', label: 'Rejected', locked: true },
  Suspended: { cls: 'badge-neutral', label: 'Suspended', locked: true },
};

const statusBadge = s => {
  const cfg = STATUS_CONFIG[s] || { cls: 'badge-neutral', label: s };
  return <span className={`badge ${cfg.cls}`}>{cfg.label}</span>;
};

const progressBadge = p => {
  const map = {
    Completed: 'badge-success',
    InProgress: 'badge-info',
    NotStarted: 'badge-neutral',
  };
  const labels = {
    Completed: 'Completed',
    InProgress: 'In Progress',
    NotStarted: 'Not Started',
  };
  return (
    <span className={`badge ${map[p] || 'badge-neutral'}`}>
      {labels[p] || p}
    </span>
  );
};

/** Returns human-readable reason why access is blocked */
const lockReason = status => {
  if (status === 'Pending') return 'Your registration is awaiting approval.';
  if (status === 'Rejected') return 'Your registration was rejected.';
  if (status === 'Suspended') return 'Your registration has been suspended.';
  return 'Access restricted.';
};

// ─── Courses Tab ──────────────────────────────────────────────────────────────

function CoursesTab({ courses, navigate }) {
  if (courses.length === 0)
    return (
      <div className="card empty-state">
        <h3>No registered courses</h3>
        <p>You don't have any registered courses in this semester.</p>
      </div>
    );

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
        gap: 20,
      }}
    >
      {courses.map(r => {
        const isApproved = r.status === 'Approved';
        const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG['Pending'];

        return (
          <div
            key={r.id}
            className="card"
            onClick={() => {
              if (!isApproved) {
                toast.warn(`Access blocked: ${lockReason(r.status)}`);
                return;
              }
              navigate(`/student/course/${r.course?.id || r.courseId}/uploads`);
            }}
            style={{
              cursor: isApproved ? 'pointer' : 'not-allowed',
              opacity: isApproved ? 1 : 0.72,
              position: 'relative',
              transition: 'opacity 0.15s, box-shadow 0.15s',
              /* Subtle visual dampening for locked cards */
              ...(isApproved
                ? {}
                : {
                    background: '#f8fafc',
                    borderColor: '#e2e8f0',
                  }),
            }}
          >
            {/* Lock overlay banner */}
            {!isApproved && (
              <div
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  background:
                    cfg.cls === 'badge-danger'
                      ? '#fee2e2'
                      : cfg.cls === 'badge-neutral'
                        ? '#f1f5f9'
                        : '#fef3c7',
                  color:
                    cfg.cls === 'badge-danger'
                      ? '#dc2626'
                      : cfg.cls === 'badge-neutral'
                        ? '#64748b'
                        : '#92400e',
                  padding: '4px 10px',
                  borderRadius: 20,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                <FiLock size={11} />
                {cfg.label}
              </div>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: 12,
              }}
            >
              <div style={{ flex: 1, paddingRight: isApproved ? 0 : 90 }}>
                <h3
                  style={{
                    fontSize: '1rem',
                    marginBottom: 2,
                    color: isApproved ? undefined : '#64748b',
                  }}
                >
                  {r.course?.name || r.courseName}
                </h3>
                <small style={{ color: 'var(--text-light)' }}>
                  {r.course?.code || r.courseCode} ·{' '}
                  {r.course?.credits || r.credits} Credits
                </small>
              </div>
              {isApproved && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {r.isPassed && <FiCheck size={18} color="var(--success)" />}
                  <FiChevronRight size={18} color="var(--text-light)" />
                </div>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
                marginBottom: 8,
              }}
            >
              {statusBadge(r.status)}
              {isApproved && progressBadge(r.progress)}
              {isApproved && r.grade && r.grade !== 'F' && (
                <span className="badge badge-info">
                  {GRADE_LABELS[r.grade] || r.grade}
                </span>
              )}
              {isApproved && r.grade === 'F' && (
                <span className="badge badge-danger">F</span>
              )}
            </div>

            {/* Lock reason hint */}
            {!isApproved && (
              <p
                style={{
                  fontSize: '0.82rem',
                  color: '#94a3b8',
                  margin: '6px 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <FiLock size={12} />
                {lockReason(r.status)}
              </p>
            )}

            {isApproved && r.course?.description && (
              <p
                style={{
                  fontSize: '0.83rem',
                  color: 'var(--text-light)',
                  lineHeight: 1.5,
                }}
              >
                {r.course.description.length > 120
                  ? r.course.description.slice(0, 120) + '...'
                  : r.course.description}
              </p>
            )}

            {isApproved && r.reason && (
              <p
                style={{
                  marginTop: 6,
                  fontSize: '0.83rem',
                  color: 'var(--text-light)',
                }}
              >
                Note: {r.reason}
              </p>
            )}

            {isApproved && (
              <div style={{ marginTop: 8, textAlign: 'right' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--info)' }}>
                  View Uploads →
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Register Tab ─────────────────────────────────────────────────────────────

function RegisterTab({ studyYearId, semesterId, registeredCourses }) {
  const [openCourses, setOpenCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(null);
  const [localRegistered, setLocalRegistered] = useState(new Set());

  const user = JSON.parse(localStorage.getItem('userData') || '{}');
  const departmentId = user?.departmentId;

  // Include ALL statuses as "already registered" — student shouldn't re-register
  // a course that's Pending/Suspended/Rejected either
  const alreadyRegisteredIds = new Set([
    ...registeredCourses.map(r => r.course?.id || r.courseId),
    ...localRegistered,
  ]);

  const studyYearIdRef = useRef(studyYearId);
  const semesterIdRef = useRef(semesterId);

  useEffect(() => {
    if (!departmentId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await courseService.getStudentRegistrationCourses(
          studyYearId,
          semesterId
        );
        console.log('Fetched open courses for registration:', res);
        if (!cancelled) setOpenCourses(res?.data || res || []);
      } catch {
        if (!cancelled) toast.error('Failed to load open courses');
      }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [departmentId]);

  const handleRegister = useCallback(async courseId => {
    setRegistering(courseId);
    try {
      await registrationService.register({
        courseId,
        studyYearId: parseInt(studyYearIdRef.current),
        semesterId: parseInt(semesterIdRef.current),
        reason: '',
      });
      toast.success('Registration request submitted!');
      setLocalRegistered(prev => new Set([...prev, courseId]));
    } catch (e) {
      toast.error(
        e?.ErrorMessage ||
          e?.response?.data?.message ||
          e?.errorMessage ||
          'Failed to submit registration'
      );
    }
    setRegistering(null);
  }, []);

  if (!departmentId)
    return (
      <div className="card empty-state">
        <h3>No department assigned</h3>
        <p>Your account is not linked to a department.</p>
      </div>
    );

  if (loading)
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div className="spinner" />
      </div>
    );

  if (openCourses.length === 0)
    return (
      <div className="card empty-state">
        <FiClipboard size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
        <h3>No open courses</h3>
        <p>
          There are no open courses available for your department right now.
        </p>
      </div>
    );

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: 20,
      }}
    >
      {openCourses.map(course => {
        const alreadyRegistered = alreadyRegisteredIds.has(course.id);
        const isRegistering = registering === course.id;
        // Find existing registration to show its status
        const existingReg = registeredCourses.find(
          r => (r.course?.id || r.courseId) === course.id
        );

        return (
          <div
            className="card"
            key={course.id}
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                gap: 8,
              }}
            >
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1rem', marginBottom: 4 }}>
                  {course.name}
                </h3>
                <small style={{ color: 'var(--text-light)' }}>
                  {course.code}
                  {course.credits != null && ` · ${course.credits} Credits`}
                </small>
                {course.description && (
                  <p
                    style={{
                      marginTop: 6,
                      fontSize: '0.83rem',
                      color: 'var(--text-light)',
                      lineHeight: 1.5,
                    }}
                  >
                    {course.description.length > 100
                      ? course.description.slice(0, 100) + '...'
                      : course.description}
                  </p>
                )}
              </div>
              {alreadyRegistered && existingReg && (
                <div style={{ flexShrink: 0 }}>
                  {statusBadge(existingReg.status)}
                </div>
              )}
            </div>

            {!alreadyRegistered ? (
              <button
                className="btn btn-primary"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '10px',
                }}
                disabled={isRegistering}
                onClick={() => handleRegister(course.id)}
              >
                {isRegistering ? (
                  <>
                    <span
                      className="spinner"
                      style={{ width: 16, height: 16 }}
                    />
                    Registering...
                  </>
                ) : (
                  <>
                    <FiPlus size={16} />
                    Register for this Course
                  </>
                )}
              </button>
            ) : (
              /* Show a status-aware "already registered" state */
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: '0.88rem',
                  fontWeight: 500,
                  background:
                    existingReg?.status === 'Approved'
                      ? '#f0fdf4'
                      : existingReg?.status === 'Rejected'
                        ? '#fef2f2'
                        : existingReg?.status === 'Suspended'
                          ? '#f8fafc'
                          : '#fefce8',
                  color:
                    existingReg?.status === 'Approved'
                      ? '#16a34a'
                      : existingReg?.status === 'Rejected'
                        ? '#dc2626'
                        : existingReg?.status === 'Suspended'
                          ? '#64748b'
                          : '#92400e',
                  border: `1px solid ${
                    existingReg?.status === 'Approved'
                      ? '#bbf7d0'
                      : existingReg?.status === 'Rejected'
                        ? '#fecaca'
                        : existingReg?.status === 'Suspended'
                          ? '#e2e8f0'
                          : '#fde68a'
                  }`,
                }}
              >
                {existingReg?.status === 'Approved' ? (
                  <FiCheck size={15} />
                ) : (
                  <FiLock size={15} />
                )}
                {existingReg?.status === 'Approved'
                  ? 'Enrolled & Approved'
                  : existingReg?.status === 'Rejected'
                    ? 'Registration Rejected'
                    : existingReg?.status === 'Suspended'
                      ? 'Registration Suspended'
                      : 'Pending Approval'}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Schedule Tab ─────────────────────────────────────────────────────────────

function ScheduleTab({ semesterId }) {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);

  const semesterIdRef = useRef(semesterId);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await scheduleService.getBySemester(semesterIdRef.current);
        if (!cancelled) setSchedule(res?.data || res || null);
      } catch {
        if (!cancelled) setSchedule(null);
      }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading)
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div className="spinner" />
      </div>
    );

  const entries = schedule?.scheduleEntries || schedule?.entries || [];

  if (!schedule || entries.length === 0)
    return (
      <div className="card empty-state">
        <FiFileText size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
        <h3>No schedule available</h3>
        <p>No schedule has been published for this semester yet.</p>
      </div>
    );

  const dayOrder = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  const days = [...new Set(entries.map(e => e.day))].sort(
    (a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b)
  );

  const EntryTable = ({ rows, showDay = false }) => (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <table style={{ width: '100%', margin: 0 }}>
        <thead>
          <tr>
            <th>Course</th>
            <th>Instructor</th>
            <th>Room</th>
            {showDay && <th>Day</th>}
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((entry, i) => (
            <tr key={i}>
              <td>
                <strong>{entry.courseName || entry.course?.name || '—'}</strong>
                {(entry.courseCode || entry.course?.code) && (
                  <>
                    <br />
                    <small style={{ color: 'var(--text-light)' }}>
                      {entry.courseCode || entry.course?.code}
                    </small>
                  </>
                )}
              </td>
              <td>{entry.instructorName || entry.instructor?.name || '—'}</td>
              <td>{entry.room || entry.location || '—'}</td>
              {showDay && <td>{entry.day || '—'}</td>}
              <td>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    whiteSpace: 'nowrap',
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
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {schedule.title && (
          <span className="badge badge-neutral">{schedule.title}</span>
        )}
        {schedule.totalCreditHours != null && (
          <span className="badge badge-info">
            {schedule.totalCreditHours} Credit Hours
          </span>
        )}
        <span className="badge badge-success">
          {entries.length} session{entries.length !== 1 ? 's' : ''}
        </span>
      </div>

      {days.length > 0 ? (
        days.map(day => (
          <div key={day}>
            <div
              style={{
                fontWeight: 700,
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--primary)',
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <FiCalendar size={13} />
              {day}
            </div>
            <EntryTable
              rows={entries
                .filter(e => e.day === day)
                .sort((a, b) =>
                  (a.startTime || '').localeCompare(b.startTime || '')
                )}
            />
          </div>
        ))
      ) : (
        <EntryTable rows={entries} showDay />
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StudentSemesterDetails() {
  const { studyYearId, semesterId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('courses');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const studyYearIdRef = useRef(studyYearId);
  const semesterIdRef = useRef(semesterId);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await registrationService.getBySemester(
          studyYearIdRef.current,
          semesterIdRef.current
        );
        if (!cancelled) setCourses(res?.data || res || []);
      } catch {
        if (!cancelled) toast.error('Failed to load courses');
      }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading)
    return (
      <div
        className="page-container"
        style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}
      >
        <div className="spinner" />
      </div>
    );

  // Summary counts for tab badges
  const approvedCount = courses.filter(c => c.status === 'Approved').length;
  const pendingCount = courses.filter(c => c.status === 'Pending').length;

  const tabs = [
    {
      key: 'courses',
      label: 'My Courses',
      icon: <FiBook />,
      count: courses.length,
    },
    { key: 'register', label: 'Register', icon: <FiClipboard />, count: null },
    { key: 'schedule', label: 'Schedule', icon: <FiFileText />, count: null },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() =>
            navigate(`/student/study-year/${studyYearId}/semesters`)
          }
          style={{ marginBottom: 12 }}
        >
          <FiArrowLeft /> Back to Semesters
        </button>
        <h1>
          <FiBook style={{ marginRight: 8 }} />
          Semester Details
        </h1>
        <p>Courses, registration, and schedule for this semester</p>

        {/* Quick status summary */}
        {courses.length > 0 && (
          <div
            style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}
          >
            {approvedCount > 0 && (
              <span className="badge badge-success">
                <FiCheck size={11} style={{ marginRight: 4 }} />
                {approvedCount} Approved
              </span>
            )}
            {pendingCount > 0 && (
              <span className="badge badge-warning">
                <FiClock size={11} style={{ marginRight: 4 }} />
                {pendingCount} Pending
              </span>
            )}
            {courses.filter(c => c.status === 'Rejected').length > 0 && (
              <span className="badge badge-danger">
                {courses.filter(c => c.status === 'Rejected').length} Rejected
              </span>
            )}
          </div>
        )}
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
              borderBottom:
                activeTab === tab.key
                  ? '2px solid var(--primary)'
                  : '2px solid transparent',
              background: 'none',
              color:
                activeTab === tab.key ? 'var(--primary)' : 'var(--text-light)',
              fontWeight: activeTab === tab.key ? 600 : 400,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'var(--transition)',
              marginBottom: -2,
            }}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== null && (
              <span
                style={{
                  background:
                    activeTab === tab.key ? 'var(--primary)' : 'var(--border)',
                  color: activeTab === tab.key ? 'white' : 'var(--text-light)',
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'courses' && (
        <CoursesTab courses={courses} navigate={navigate} />
      )}
      {activeTab === 'register' && (
        <RegisterTab
          studyYearId={studyYearId}
          semesterId={semesterId}
          registeredCourses={courses}
        />
      )}
      {activeTab === 'schedule' && <ScheduleTab semesterId={semesterId} />}
    </div>
  );
}
