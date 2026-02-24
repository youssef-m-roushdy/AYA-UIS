import React, { useEffect, useState } from 'react';
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
} from 'react-icons/fi';
import registrationService from '../../services/registrationService';
import { scheduleService } from '../../services/otherServices';
import { GRADE_LABELS } from '../../constants';
import { toast } from 'react-toastify';
import api from '../../services/api'; // adjust to your axios instance path
import courseService from '../../services/courseService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusBadge = s => {
  const map = {
    Approved: 'badge-success',
    Pending: 'badge-warning',
    Rejected: 'badge-danger',
    Suspended: 'badge-neutral',
  };
  return <span className={`badge ${map[s] || 'badge-neutral'}`}>{s}</span>;
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

// ─── Courses Tab ──────────────────────────────────────────────────────────────

function CoursesTab({ courses, studyYearId, navigate }) {
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
      {courses.map(r => (
        <div
          className="card"
          key={r.id}
          style={{ cursor: 'pointer' }}
          onClick={() =>
            navigate(`/student/course/${r.course?.id || r.courseId}/uploads`)
          }
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'start',
              marginBottom: 12,
            }}
          >
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1rem', marginBottom: 2 }}>
                {r.course?.name || r.courseName}
              </h3>
              <small style={{ color: 'var(--text-light)' }}>
                {r.course?.code || r.courseCode} ·{' '}
                {r.course?.credits || r.credits} Credits
              </small>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {r.isPassed && <FiCheck size={18} color="var(--success)" />}
              <FiChevronRight size={18} color="var(--text-light)" />
            </div>
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
            {progressBadge(r.progress)}
            {r.grade && r.grade !== 'F' && (
              <span className="badge badge-info">
                {GRADE_LABELS[r.grade] || r.grade}
              </span>
            )}
            {r.grade === 'F' && <span className="badge badge-danger">F</span>}
          </div>

          {r.course?.description && (
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

          {r.reason && (
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

          <div style={{ marginTop: 8, textAlign: 'right' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--info)' }}>
              View Uploads →
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Register Tab ─────────────────────────────────────────────────────────────

function RegisterTab({ studyYearId, semesterId, registeredCourses }) {
  const [openCourses, setOpenCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(null); // courseId in-flight
  // local set so the UI flips immediately after success without refetch delay
  const [localRegistered, setLocalRegistered] = useState(new Set());

  const user = JSON.parse(localStorage.getItem('userData') || '{}');
  const departmentId = user?.departmentId;

  const alreadyRegisteredIds = new Set([
    ...registeredCourses.map(r => r.course?.id || r.courseId),
    ...localRegistered,
  ]);

  useEffect(() => {
    if (!departmentId) {
      setLoading(false);
      return;
    }
    const load = async () => {
      setLoading(true);
      try {
        console.log(departmentId);
        const res = await courseService.getDeptOpenCourses(departmentId);
        console.log(res?.data || 'no data');
        setOpenCourses(res?.data || res || []);
      } catch (e) {
        console.log(e);
        toast.error('Failed to load open courses');
      }
      setLoading(false);
    };
    load();
  }, [departmentId]);

  const handleRegister = async courseId => {
    setRegistering(courseId);
    try {
      // Prepare registration data
      const registrationData = {
        courseId: courseId,
        studyYearId: parseInt(studyYearId),
        semesterId: parseInt(semesterId),
        reason: '', // Empty reason as default
      };

      await registrationService.register(registrationData);

      toast.success('Registration request submitted successfully!');
      setLocalRegistered(prev => new Set([...prev, courseId]));
    } catch (e) {
      console.log(e?.ErrorMessage);
      toast.error(
        e?.ErrorMessage ||
          e?.response?.data?.message ||
          e?.errorMessage ||
          'Failed to submit registration'
      );
    }
    setRegistering(null);
  };

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

        return (
          <div
            className="card"
            key={course.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            {/* Course info */}
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
              {alreadyRegistered && (
                <span
                  className="badge badge-success"
                  style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                  <FiCheck size={12} style={{ marginRight: 4 }} />
                  Registered
                </span>
              )}
            </div>

            {/* Register button */}
            {!alreadyRegistered && (
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

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await scheduleService.getBySemester(semesterId);
        setSchedule(res?.data || res || null);
      } catch {
        setSchedule(null);
      }
      setLoading(false);
    };
    load();
  }, [semesterId]);

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
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', margin: 0 }}>
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Instructor</th>
                    <th>Room</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {entries
                    .filter(e => e.day === day)
                    .sort((a, b) =>
                      (a.startTime || '').localeCompare(b.startTime || '')
                    )
                    .map((entry, i) => (
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
          </div>
        ))
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
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
              {entries.map((entry, i) => (
                <tr key={i}>
                  <td>
                    <strong>
                      {entry.courseName || entry.course?.name || '—'}
                    </strong>
                  </td>
                  <td>
                    {entry.instructorName || entry.instructor?.name || '—'}
                  </td>
                  <td>{entry.room || entry.location || '—'}</td>
                  <td>{entry.day || '—'}</td>
                  <td>
                    <span
                      style={{ display: 'flex', alignItems: 'center', gap: 4 }}
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
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SemesterCourses() {
  const { studyYearId, semesterId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('courses');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await registrationService.getBySemester(
          studyYearId,
          semesterId
        );
        setCourses(res?.data || res || []);
      } catch {
        toast.error('Failed to load courses');
      }
      setLoading(false);
    };
    load();
  }, [studyYearId, semesterId]);

  if (loading)
    return (
      <div className="page-container">
        <div className="spinner" />
      </div>
    );

  const tabs = [
    {
      key: 'courses',
      label: 'Courses',
      icon: <FiBook />,
      count: courses.length,
    },
    {
      key: 'register',
      label: 'Register',
      icon: <FiClipboard />,
      count: null,
    },
    {
      key: 'schedule',
      label: 'Schedule',
      icon: <FiFileText />,
      count: null,
    },
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

      {/* Tab Content */}
      {activeTab === 'courses' && (
        <CoursesTab
          courses={courses}
          studyYearId={studyYearId}
          navigate={navigate}
        />
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
