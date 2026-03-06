import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiCalendar,
  FiUpload,
  FiUsers,
  FiBook,
  FiClock,
} from 'react-icons/fi';
import {
  semesterService,
  registrationService,
  scheduleService,
  courseService,
} from '../../services/otherServices';
import { LEVEL_LABELS } from '../../constants';
import { toast } from 'react-toastify';

const SEMESTER_LABELS = {
  First_Semester: 'First Semester',
  Second_Semester: 'Second Semester',
  Summer: 'Summer Semester',
};

const statusBadge = (s) => {
  const map = {
    Approved: 'badge-success',
    Pending: 'badge-warning',
    Rejected: 'badge-danger',
    Suspended: 'badge-neutral',
  };
  return <span className={`badge ${map[s] || 'badge-neutral'}`}>{s}</span>;
};

export default function AdminSemesterDetail() {
  const { semesterId, studyYearId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('schedule');
  const [semester, setSemester] = useState(null);
  const [courses, setCourses] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [semRes, courseRes, regRes, schedRes] = await Promise.all([
        semesterService.getById(semesterId),
        courseService.getBySemester(semesterId),
        registrationService.getBySemester(studyYearId, semesterId),
        scheduleService.getBySemester(semesterId),
      ]);

      setSemester(semRes?.data || semRes);
      setCourses(courseRes?.data || courseRes || []);
      setRegistrations(regRes?.data || regRes || []);
      setSchedule(schedRes?.data || schedRes || null);
    } catch (e) {
      toast.error('Failed to load semester details');
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [semesterId, studyYearId]);

  const handleScheduleUpload = async (file) => {
    if (!file) {
      toast.error('Select a file');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(
        `/api/semesters/${semesterId}/schedule/upload`,
        {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!res.ok) throw new Error('Upload failed');
      toast.success('Schedule uploaded successfully');
      load();
    } catch (e) {
      toast.error('Failed to upload schedule');
    }
    setUploading(false);
  };

  if (loading)
    return (
      <div className="page-container">
        <div className="spinner" />
      </div>
    );

  const tabs = [
    {
      key: 'schedule',
      label: 'Schedule',
      icon: <FiCalendar />,
    },
    {
      key: 'registrations',
      label: 'Registrations',
      icon: <FiUsers />,
      count: registrations.length,
    },
    {
      key: 'courses',
      label: 'Courses',
      icon: <FiBook />,
      count: courses.length,
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate(`/admin/study-year/${studyYearId}/manage`)}
          style={{ marginBottom: 12 }}
        >
          <FiArrowLeft /> Back to Study Year
        </button>
        <h1>
          <FiCalendar style={{ marginRight: 8 }} />
          {SEMESTER_LABELS[semester?.title] || semester?.title}
        </h1>
        <p>
          {semester?.startDate &&
            new Date(semester.startDate).toLocaleDateString()}{' '}
          —{' '}
          {semester?.endDate &&
            new Date(semester.endDate).toLocaleDateString()}
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          marginBottom: 24,
          borderBottom: '2px solid var(--border)',
          paddingBottom: 0,
        }}
      >
        {tabs.map((tab) => (
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
            {tab.count !== undefined && (
              <span
                style={{
                  background:
                    activeTab === tab.key ? 'var(--primary)' : 'var(--border)',
                  color:
                    activeTab === tab.key ? 'white' : 'var(--text-light)',
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

      {/* ── Schedule Tab ────────────────────────────────────────────────────── */}
      {activeTab === 'schedule' && (
        <>
          <div
            className="card"
            style={{
              marginBottom: 20,
              padding: 20,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                  Upload a schedule file (JSON, CSV, or XLSX) to make it
                  available to students
                </p>
              </div>
              <div>
                <input
                  type="file"
                  accept=".json,.csv,.xlsx"
                  id="schedule-upload"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleScheduleUpload(e.target.files[0]);
                    }
                  }}
                />
                <button
                  className="btn btn-light"
                  onClick={() =>
                    document.getElementById('schedule-upload').click()
                  }
                  disabled={uploading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <FiUpload size={16} />
                  {uploading ? 'Uploading...' : 'Upload File'}
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
                  <span className="badge badge-neutral">{schedule.title}</span>
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

      {/* ── Registrations Tab ───────────────────────────────────────────────── */}
      {activeTab === 'registrations' && (
        <>
          {registrations.length === 0 ? (
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
                    <th>Student Name</th>
                    <th>Course</th>
                    <th>Status</th>
                    <th>Grade</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg) => (
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
                            navigate(
                              `/admin/registration/${reg.id}`
                            )
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
          )}
        </>
      )}

      {/* ── Courses Tab ─────────────────────────────────────────────────────── */}
      {activeTab === 'courses' && (
        <>
          {courses.length === 0 ? (
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
              {courses.map((course) => (
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
                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      flexWrap: 'wrap',
                    }}
                  >
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
          )}
        </>
      )}
    </div>
  );
}
