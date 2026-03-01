import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  FiBook,
  FiUsers,
  FiGrid,
  FiCalendar,
  FiClipboard,
  FiTrendingUp,
  FiShield,
  FiUserCheck,
} from 'react-icons/fi';
import { LEVEL_LABELS } from '../../constants';
import departmentService from '../../services/departmentService';
import courseService from '../../services/courseService';
import registrationService from '../../services/registrationService';
import { userStudyYearService } from '../../services/otherServices';
import './Dashboard.css';

export default function Dashboard() {
  const { user, roles, primaryRole, hasRole, hasAnyRole } = useAuth();

  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Load data based on user roles
        const promises = [];

        // Admin data
        if (hasRole('Admin')) {
          promises.push(
            departmentService
              .getAll()
              .then(res => ({
                type: 'departments',
                data: res?.data?.length || res?.length || 0,
              }))
              .catch(() => ({ type: 'departments', data: 0 })),
            courseService
              .getAll()
              .then(res => ({
                type: 'courses',
                data: res?.data?.length || res?.length || 0,
              }))
              .catch(() => ({ type: 'courses', data: 0 }))
          );
        }

        // Student data
        if (hasRole('Student')) {
          promises.push(
            registrationService
              .getMyCourses()
              .then(res => {
                const regData = res?.data || res || [];
                return { type: 'studentCourses', data: regData };
              })
              .catch(() => ({ type: 'studentCourses', data: [] })),
            userStudyYearService
              .getMyTimeline()
              .then(res => ({ type: 'timeline', data: res?.data || res }))
              .catch(() => ({ type: 'timeline', data: null }))
          );
        }

        // Instructor data (if you have instructor-specific data)
        if (hasRole('Instructor')) {
          promises.push(
            courseService
              .getInstructorCourses()
              .then(res => ({
                type: 'instructorCourses',
                data: res?.data?.length || res?.length || 0,
              }))
              .catch(() => ({ type: 'instructorCourses', data: 0 }))
          );
        }

        // Wait for all promises to resolve
        const results = await Promise.all(promises);

        // Process results
        const newStats = {};
        results.forEach(result => {
          if (result.type === 'departments') newStats.departments = result.data;
          if (result.type === 'courses') newStats.courses = result.data;
          if (result.type === 'studentCourses') {
            newStats.registeredCourses = result.data.length;
            newStats.passedCourses = result.data.filter(r => r.isPassed).length;
          }
          if (result.type === 'timeline') newStats.timeline = result.data;
          if (result.type === 'instructorCourses')
            newStats.instructorCourses = result.data;
        });

        setStats(newStats);
      } catch (e) {
        // console.error('Error loading dashboard data:', e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [hasRole]); // Re-run when roles change

  // Get role badge color
  const getRoleBadgeColor = role => {
    switch (role) {
      case 'Admin':
        return 'badge-danger';
      case 'Student':
        return 'badge-success';
      case 'Instructor':
        return 'badge-warning';
      default:
        return 'badge-neutral';
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="dashboard-welcome">
        <div>
          <h1>Welcome back, {user?.displayName || 'User'}!</h1>
          <div
            style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}
          >
            {/* Display all user roles */}
            {roles?.map(role => (
              <span key={role} className={`badge ${getRoleBadgeColor(role)}`}>
                <FiShield size={12} style={{ marginRight: 4 }} />
                {role}
              </span>
            ))}
          </div>
          <p style={{ marginTop: 8 }}>
            {hasAnyRole(['Student', 'Instructor']) && (
              <>
                {user?.departmentName && `${user.departmentName} — `}
                {LEVEL_LABELS[user?.level] || ''}
              </>
            )}
            {hasRole('Admin') && 'Administrator Dashboard'}
          </p>
        </div>

        {/* GPA Display - Only for students */}
        {hasRole('Student') && user?.totalGPA != null && (
          <div className="gpa-badge">
            <FiTrendingUp />
            <span>GPA: {user.totalGPA.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Admin Stats */}
      {hasRole('Admin') && (
        <div className="stats-grid">
          <div className="card stat-card">
            <div className="stat-icon blue">
              <FiGrid />
            </div>
            <div className="stat-info">
              <h3>{stats.departments || 0}</h3>
              <p>Departments</p>
            </div>
          </div>
          <div className="card stat-card">
            <div className="stat-icon green">
              <FiBook />
            </div>
            <div className="stat-info">
              <h3>{stats.courses || 0}</h3>
              <p>Courses</p>
            </div>
          </div>
          <div className="card stat-card">
            <div className="stat-icon purple">
              <FiUsers />
            </div>
            <div className="stat-info">
              <h3>{roles?.length || 1}</h3>
              <p>Assigned Roles</p>
            </div>
          </div>
        </div>
      )}

      {/* Student Stats */}
      {hasRole('Student') && (
        <>
          <div className="stats-grid">
            <div className="card stat-card">
              <div className="stat-icon blue">
                <FiBook />
              </div>
              <div className="stat-info">
                <h3>{stats.registeredCourses || 0}</h3>
                <p>Registered Courses</p>
              </div>
            </div>
            <div className="card stat-card">
              <div className="stat-icon green">
                <FiClipboard />
              </div>
              <div className="stat-info">
                <h3>{stats.passedCourses || 0}</h3>
                <p>Passed Courses</p>
              </div>
            </div>
            <div className="card stat-card">
              <div className="stat-icon orange">
                <FiCalendar />
              </div>
              <div className="stat-info">
                <h3>
                  {user?.totalCredits || 0} / {user?.allowedCredits || '-'}
                </h3>
                <p>Credits (Earned / Allowed)</p>
              </div>
            </div>
          </div>

          {/* Academic Timeline */}
          {stats.timeline && (
            <div className="card">
              <h3
                style={{
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <FiTrendingUp />
                Academic Timeline
              </h3>
              <div style={{ display: 'grid', gap: 12 }}>
                <div className="timeline-item">
                  <strong>Current Level:</strong>{' '}
                  <span className="badge badge-info">
                    {LEVEL_LABELS[stats.timeline.currentLevel] ||
                      stats.timeline.currentLevel}
                  </span>
                </div>
                <div className="timeline-item">
                  <strong>Years Completed:</strong>{' '}
                  <span className="badge badge-neutral">
                    {stats.timeline.totalYearsCompleted}
                  </span>
                </div>
                {stats.timeline.isGraduated && (
                  <div className="timeline-item">
                    <span className="badge badge-success">Graduated ✓</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Instructor Stats */}
      {hasRole('Instructor') && !hasRole('Admin') && (
        <div className="stats-grid">
          <div className="card stat-card">
            <div className="stat-icon blue">
              <FiBook />
            </div>
            <div className="stat-info">
              <h3>{stats.instructorCourses || 0}</h3>
              <p>My Courses</p>
            </div>
          </div>
          <div className="card stat-card">
            <div className="stat-icon green">
              <FiUsers />
            </div>
            <div className="stat-info">
              <h3>{stats.totalStudents || 0}</h3>
              <p>Total Students</p>
            </div>
          </div>
          <div className="card stat-card">
            <div className="stat-icon purple">
              <FiUserCheck />
            </div>
            <div className="stat-info">
              <h3>{primaryRole}</h3>
              <p>Primary Role</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions based on roles */}
      <div className="card" style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 16 }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {hasRole('Admin') && (
            <>
              <button className="btn btn-primary btn-sm">
                Manage Departments
              </button>
              <button className="btn btn-primary btn-sm">Add Course</button>
              <button className="btn btn-primary btn-sm">
                Register Student
              </button>
            </>
          )}
          {hasRole('Student') && (
            <>
              <button className="btn btn-primary btn-sm">
                View My Courses
              </button>
              <button className="btn btn-primary btn-sm">Check Schedule</button>
              <button className="btn btn-primary btn-sm">View Grades</button>
            </>
          )}
          {hasRole('Instructor') && (
            <>
              <button className="btn btn-primary btn-sm">
                My Teaching Schedule
              </button>
              <button className="btn btn-primary btn-sm">Grade Students</button>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .badge-danger {
          background-color: #fee2e2;
          color: #991b1b;
        }
        .badge-warning {
          background-color: #fef3c7;
          color: #92400e;
        }
        .badge-success {
          background-color: #d1fae5;
          color: #065f46;
        }
        .badge-neutral {
          background-color: #f3f4f6;
          color: #374151;
        }
        .badge-info {
          background-color: #dbeafe;
          color: #1e40af;
        }
        .stat-icon.purple {
          background-color: #ede9fe;
          color: #6d28d9;
        }
        .timeline-item {
          padding: 8px 0;
          border-bottom: 1px solid var(--border);
        }
        .timeline-item:last-child {
          border-bottom: none;
        }
      `}</style>
    </div>
  );
}
