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
} from 'react-icons/fi';
import { semesterService, scheduleService } from '../../services/otherServices';
import { toast } from 'react-toastify';

const SEMESTER_LABELS = {
  First_Semester: 'First Semester',
  Second_Semester: 'Second Semester',
  Summer: 'Summer Semester',
};

const statusBadge = s => {
  const map = {
    Approved: 'badge-success',
    Pending: 'badge-warning',
    Rejected: 'badge-danger',
    Suspended: 'badge-neutral',
  };
  return <span className={`badge ${map[s] || 'badge-neutral'}`}>{s}</span>;
};

/* ── Async state helpers ── */
const idle = { data: null, loading: false, error: null };
const mkLoad = () => ({ data: null, loading: true, error: null });
const mkOk = d => ({ data: d, loading: false, error: null });
const mkError = msg => ({ data: null, loading: false, error: msg });

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

export default function AdminSemesterDetail() {
  const { semesterId, studyYearId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('schedule');
  const [semester, setSemester] = useState(null);
  const [semLoading, setSemLoading] = useState(true);

  /* Per-tab lazy state */
  const [schedState, setSchedState] = useState(idle);
  const [regState, setRegState] = useState(idle);
  const [courseState, setCourseState] = useState(idle);

  const fetchedOnce = useRef(new Set());
  const [uploading, setUploading] = useState(false);

  /* ── Always fetch the semester header on mount ──
     Uses a ref so the effect never re-fires due to changing deps */
  const semesterIdRef = useRef(semesterId);
  const studyYearIdRef = useRef(studyYearId);

  useEffect(() => {
    let cancelled = false;
    const loadSemester = async () => {
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
    };
    loadSemester();
    return () => {
      cancelled = true;
    };
  }, []); // empty — intentional, refs hold stable values

  /* ── Per-tab fetchers: all stable (no changing deps) ── */
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
  }, []); // stable — reads from ref

  const fetchRegistrations = useCallback(async () => {
    /* registrationService not yet in otherServices — graceful placeholder */
    setRegState(mkOk([]));
    /*
    setRegState(mkLoad());
    try {
      const res = await registrationService.getBySemester(studyYearIdRef.current, semesterIdRef.current);
      setRegState(mkOk(res?.data ?? res ?? []));
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to load registrations';
      setRegState(mkError(msg));
      toast.error(msg);
    }
    */
  }, []);

  const fetchCourses = useCallback(async () => {
    /* courseService not yet in otherServices — graceful placeholder */
    setCourseState(mkOk([]));
    /*
    setCourseState(mkLoad());
    try {
      const res = await courseService.getBySemester(semesterIdRef.current);
      setCourseState(mkOk(res?.data ?? res ?? []));
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to load courses';
      setCourseState(mkError(msg));
      toast.error(msg);
    }
    */
  }, []);

  /* ── Lazy load: fetch only on FIRST visit to each tab ── */
  useEffect(() => {
    if (fetchedOnce.current.has(activeTab)) return;
    fetchedOnce.current.add(activeTab);
    if (activeTab === 'schedule') fetchSchedule();
    if (activeTab === 'registrations') fetchRegistrations();
    if (activeTab === 'courses') fetchCourses();
  }, [activeTab, fetchSchedule, fetchRegistrations, fetchCourses]);

  /* ── Schedule upload ── */
  const handleScheduleUpload = useCallback(
    async file => {
      if (!file) {
        toast.error('Select a file');
        return;
      }
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        await scheduleService.create(
          studyYearIdRef.current,
          null,
          semesterIdRef.current,
          formData
        );
        toast.success('Schedule uploaded');
        // Force a fresh fetch of the schedule tab
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
      label: 'Registrations',
      icon: <FiUsers />,
      count: regState.data ? registrations.length : '…',
    },
    {
      key: 'courses',
      label: 'Courses',
      icon: <FiBook />,
      count: courseState.data ? courses.length : '…',
    },
  ];

  if (semLoading) {
    return (
      <div
        className="page-container"
        style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}
      >
        <div className="spinner" />
      </div>
    );
  }

  /* ════════════════════════════════════════════════════ */
  return (
    <div className="page-container">
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

      {/* ── Tabs ── */}
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

      {/* ══════════════════════════════════
          Schedule Tab
      ══════════════════════════════════ */}
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
              {/* Upload card */}
              <div
                className="card"
                style={{
                  marginBottom: 20,
                  padding: 20,
                  background:
                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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

      {/* ══════════════════════════════════
          Registrations Tab
      ══════════════════════════════════ */}
      {activeTab === 'registrations' && (
        <>
          {regState.loading && <TabSpinner />}
          {regState.error && (
            <TabError
              message={regState.error}
              onRetry={() => {
                setRegState(idle);
                fetchedOnce.current.delete('registrations');
                fetchRegistrations();
              }}
            />
          )}
          {!regState.loading &&
            !regState.error &&
            (registrations.length === 0 ? (
              <div className="card empty-state">
                <h3>No registrations</h3>
                <p>No student registrations yet for this semester</p>
              </div>
            ) : (
              <div className="card">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 16,
                  }}
                >
                  <h3>Student Registrations</h3>
                  <span className="badge badge-info">
                    {registrations.length} registration
                    {registrations.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Course</th>
                      <th>Status</th>
                      <th>Grade</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map(reg => (
                      <tr key={reg.id}>
                        <td>{reg.studentName || reg.student?.name || '—'}</td>
                        <td>{reg.courseName || reg.course?.name || '—'}</td>
                        <td>{statusBadge(reg.status)}</td>
                        <td>
                          {reg.grade ? (
                            <span
                              style={{
                                fontWeight: 600,
                                color:
                                  reg.grade === 'F'
                                    ? 'var(--danger)'
                                    : 'var(--success)',
                              }}
                            >
                              {reg.grade}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-ghost"
                            onClick={() =>
                              navigate(`/admin/registration/${reg.id}`)
                            }
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
        </>
      )}

      {/* ══════════════════════════════════
          Courses Tab
      ══════════════════════════════════ */}
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
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
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
