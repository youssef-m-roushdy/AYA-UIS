import React, { useEffect, useState, useCallback } from 'react';
import { FiBook, FiFilter, FiX, FiList, FiGitBranch } from 'react-icons/fi';
import courseService from '../../services/courseService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

export default function DepartmentCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [detail, setDetail] = useState(null); // For modals

  // Filter state
  const [filters, setFilters] = useState({
    status: '',
  });
  const [filterApplied, setFilterApplied] = useState(false);

  const departmentId = user?.departmentId;

  const loadCourses = useCallback(async () => {
    if (!departmentId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Build query params - only include non-empty values
      const params = {};
      if (filters.status) params.Status = filters.status;

      const res = await courseService.getDeptCourses(departmentId, params);
      setCourses(res?.data || res || []);

      // Check if filter is applied
      setFilterApplied(filters.status !== '');
    } catch (e) {
      toast.error('Failed to load courses');
      setCourses([]);
    }
    setLoading(false);
  }, [departmentId, filters.status]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
    });
  };

  // View prerequisites modal
  const viewPrereqs = async id => {
    try {
      const res = await courseService.getPrerequisites(id);
      setDetail({
        type: 'prereqs',
        data: res?.data || res || [],
        courseId: id,
      });
    } catch (e) {
      toast.error('Failed to load prerequisites');
    }
  };

  // View dependencies modal
  const viewDependencies = async id => {
    try {
      const res = await courseService.getDependencies(id);
      setDetail({
        type: 'dependencies',
        data: res?.data || res || [],
        courseId: id,
      });
    } catch (e) {
      toast.error('Failed to load dependencies');
    }
  };

  // Get status badge class
  const getStatusBadgeClass = status => {
    return status === 'Opened' ? 'badge-success' : 'badge-neutral';
  };

  // Get course name by ID
  const getCourseName = courseId => {
    const course = courses.find(c => c.id === courseId);
    return course?.name || 'Course';
  };

  if (loading && !courses.length)
    return (
      <div className="page-container">
        <div className="spinner" />
      </div>
    );

  return (
    <div className="page-container">
      <div
        className="page-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiBook />
            Department Courses
          </h1>
          <p>
            Courses available in{' '}
            {user?.departmentName ? (
              <span className="badge badge-info" style={{ marginLeft: 4 }}>
                {user.departmentName}
              </span>
            ) : (
              'your department'
            )}
          </p>
        </div>
        <button
          className={`btn ${filterApplied ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <FiFilter />
          Filter by Status
          {filterApplied && (
            <span className="badge badge-primary" style={{ marginLeft: 8 }}>
              •
            </span>
          )}
        </button>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div
          className="card"
          style={{ marginBottom: 24, animation: 'slideDown 0.3s ease' }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
              Filter Courses by Status
            </h3>
            {filterApplied && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={clearFilters}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <FiX size={14} /> Clear Filter
              </button>
            )}
          </div>

          <div style={{ maxWidth: 300 }}>
            <div className="form-group">
              <label
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  marginBottom: 6,
                }}
              >
                Course Status
              </label>
              <select
                className="form-control"
                value={filters.status}
                onChange={e => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Courses</option>
                <option value="Opened">Opened Only</option>
                <option value="Closed">Closed Only</option>
              </select>
            </div>
          </div>

          {/* Active Filter Indicator */}
          {filterApplied && (
            <div
              style={{
                marginTop: 16,
                paddingTop: 16,
                borderTop: '1px solid var(--border)',
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}
              >
                Active filter:
              </span>
              <span className="badge badge-info">Status: {filters.status}</span>
            </div>
          )}
        </div>
      )}

      {/* Results Summary */}
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span className="badge badge-info" style={{ fontSize: '0.875rem' }}>
          {courses.length} course{courses.length !== 1 ? 's' : ''} found
          {filterApplied && ` (filtered by ${filters.status})`}
        </span>
        {loading && (
          <span style={{ color: 'var(--text-light)' }}>Updating...</span>
        )}
      </div>

      {!departmentId ? (
        <div className="card empty-state">
          <h3>No department assigned</h3>
          <p>
            Your account is not linked to a department. Contact your
            administrator.
          </p>
        </div>
      ) : courses.length === 0 ? (
        <div className="card empty-state">
          <h3>No courses found</h3>
          <p>
            {filterApplied
              ? `No ${filters.status.toLowerCase()} courses are available in your department.`
              : 'No courses are available for your department yet.'}
          </p>
          {filterApplied && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={clearFilters}
              style={{ marginTop: 16 }}
            >
              Clear Filter
            </button>
          )}
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
            <h3>All Courses</h3>
            <span className="badge badge-info">
              {courses.length} course{courses.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Credits</th>
                  <th>Status</th>
                  <th style={{ width: 100 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(c => (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.code}</strong>
                    </td>
                    <td>{c.name}</td>
                    <td>{c.credits}</td>
                    <td>
                      <span
                        className={`badge ${getStatusBadgeClass(c.status)}`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => viewPrereqs(c.id)}
                          title="View Prerequisites"
                        >
                          <FiList />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => viewDependencies(c.id)}
                          title="View Dependencies"
                        >
                          <FiGitBranch />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Prerequisites Modal */}
      {detail?.type === 'prereqs' && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Prerequisites</h2>
            <p style={{ marginBottom: 16, color: 'var(--text-light)' }}>
              Courses required before taking {getCourseName(detail.courseId)}
            </p>
            {detail.data?.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {detail.data.map(c => (
                  <li
                    key={c.id}
                    style={{
                      padding: '12px 0',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{c.code}</div>
                      <span
                        className={`badge ${getStatusBadgeClass(c.status)}`}
                      >
                        {c.status}
                      </span>
                    </div>
                    <div style={{ marginTop: 4 }}>{c.name}</div>
                    <div
                      style={{
                        color: 'var(--text-light)',
                        fontSize: '0.875rem',
                        marginTop: 4,
                      }}
                    >
                      {c.credits} credits
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-state">No prerequisites for this course</p>
            )}
            <div className="form-actions">
              <button className="btn btn-ghost" onClick={() => setDetail(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dependencies Modal */}
      {detail?.type === 'dependencies' && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Dependencies</h2>
            <p style={{ marginBottom: 16, color: 'var(--text-light)' }}>
              Courses that require {getCourseName(detail.courseId)} as a
              prerequisite
            </p>
            {detail.data?.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {detail.data.map(c => (
                  <li
                    key={c.id}
                    style={{
                      padding: '12px 0',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{c.code}</div>
                      <span
                        className={`badge ${getStatusBadgeClass(c.status)}`}
                      >
                        {c.status}
                      </span>
                    </div>
                    <div style={{ marginTop: 4 }}>{c.name}</div>
                    <div
                      style={{
                        color: 'var(--text-light)',
                        fontSize: '0.875rem',
                        marginTop: 4,
                      }}
                    >
                      {c.credits} credits
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-state">No courses depend on this course</p>
            )}
            <div className="form-actions">
              <button className="btn btn-ghost" onClick={() => setDetail(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
