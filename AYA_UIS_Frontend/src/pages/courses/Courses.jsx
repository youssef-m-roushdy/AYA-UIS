import React, { useEffect, useState, useCallback } from 'react';
import {
  FiPlus,
  FiBook,
  FiList,
  FiFilter,
  FiX,
  FiToggleLeft,
  FiGitBranch,
  FiToggleRight,
  FiLock,
} from 'react-icons/fi';
import courseService from '../../services/courseService';
import departmentService from '../../services/departmentService';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES } from '../../constants';
import { toast } from 'react-toastify';

export default function Courses() {
  const { hasRole, isAdmin } = useAuth();
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({
    code: '',
    name: '',
    credits: 1,
    departmentId: '',
  });
  const [detail, setDetail] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    status: '',
    code: '',
    name: '',
    departmentId: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filterApplied, setFilterApplied] = useState(false);

  const loadDepartments = async () => {
    try {
      const dRes = await departmentService.getAll();
      setDepartments(dRes?.data || dRes || []);
    } catch (e) {
      toast.error('Failed to load departments');
    }
  };

  const loadCourses = useCallback(async () => {
    setLoading(true);
    try {
      // Build query params - only include non-empty values
      const params = {};
      if (filters.status) params.Status = filters.status;
      if (filters.code) params.Code = filters.code;
      if (filters.name) params.Name = filters.name;
      if (filters.departmentId)
        params.DepartmentId = parseInt(filters.departmentId);

      const response = await courseService.getAllWithFilters(params);

      // Handle different response structures
      let coursesData = [];
      if (response?.data) {
        coursesData = response.data;
      } else if (Array.isArray(response)) {
        coursesData = response;
      } else {
        coursesData = response || [];
      }

      setCourses(coursesData);

      // Check if any filter is applied
      setFilterApplied(Object.values(filters).some(v => v !== ''));
    } catch (e) {
      toast.error(e?.errorMessage || 'Failed to load courses');
      setCourses([]);
    }
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      code: '',
      name: '',
      departmentId: '',
    });
  };

  const handleCreate = async e => {
    e.preventDefault();
    try {
      await courseService.create({
        ...form,
        credits: parseInt(form.credits),
        departmentId: parseInt(form.departmentId),
      });
      toast.success('Course created successfully');
      setModal(null);
      loadCourses();
    } catch (err) {
      toast.error(err?.errorMessage || 'Failed to create course');
    }
  };

  const handleStatusToggle = async course => {
    if (!hasRole(USER_ROLES.ADMIN)) {
      toast.error('Only administrators can change course status');
      return;
    }

    try {
      setUpdatingStatus(course.id);
      const newStatus = course.status === 'Opened' ? 'Closed' : 'Opened';

      await courseService.updateStatus({
        courseId: course.id,
        status: newStatus,
      });

      toast.success(`Course status updated to ${newStatus}`);
      loadCourses();
    } catch (err) {
      toast.error(err?.errorMessage || 'Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

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

  // Get department name by ID
  const getDepartmentName = departmentId => {
    const dept = departments.find(d => d.id === departmentId);
    return dept?.name || 'N/A';
  };

  // Get status badge class
  const getStatusBadgeClass = status => {
    switch (status) {
      case 'Opened':
        return 'badge-success';
      case 'Closed':
        return 'badge-danger';
      default:
        return 'badge-neutral';
    }
  };

  // Get course name by ID for modal title
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
            Courses
          </h1>
          <p>Manage all courses</p>
          {!isAdmin && (
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--text-light)',
                marginTop: 4,
              }}
            >
              <FiLock size={12} style={{ marginRight: 4 }} />
              View-only mode
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={`btn ${filterApplied ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter />
            Filters
            {filterApplied && (
              <span className="badge badge-primary" style={{ marginLeft: 8 }}>
                •
              </span>
            )}
          </button>
          {isAdmin && (
            <button
              className="btn btn-primary"
              onClick={() => {
                setForm({
                  code: '',
                  name: '',
                  credits: 1,
                  departmentId: departments[0]?.id || '',
                });
                setModal('create');
              }}
            >
              <FiPlus /> Add Course
            </button>
          )}
        </div>
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
              marginBottom: 20,
            }}
          >
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
              Filter Courses
            </h3>
            <button
              className="btn btn-ghost btn-sm"
              onClick={clearFilters}
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <FiX size={14} /> Clear All
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
            }}
          >
            <div className="form-group">
              <label
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  marginBottom: 6,
                }}
              >
                Status
              </label>
              <select
                className="form-control"
                value={filters.status}
                onChange={e => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Status</option>
                <option value="Opened">Opened</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div className="form-group">
              <label
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  marginBottom: 6,
                }}
              >
                Code
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Filter by code..."
                value={filters.code}
                onChange={e => handleFilterChange('code', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  marginBottom: 6,
                }}
              >
                Name
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Filter by name..."
                value={filters.name}
                onChange={e => handleFilterChange('name', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  marginBottom: 6,
                }}
              >
                Department
              </label>
              <select
                className="form-control"
                value={filters.departmentId}
                onChange={e =>
                  handleFilterChange('departmentId', e.target.value)
                }
              >
                <option value="">All Departments</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters */}
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
                Active filters:
              </span>
              {filters.status && (
                <span className="badge badge-info">
                  Status: {filters.status}
                </span>
              )}
              {filters.code && (
                <span className="badge badge-info">Code: {filters.code}</span>
              )}
              {filters.name && (
                <span className="badge badge-info">Name: {filters.name}</span>
              )}
              {filters.departmentId && (
                <span className="badge badge-info">
                  Department:{' '}
                  {getDepartmentName(parseInt(filters.departmentId))}
                </span>
              )}
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
        </span>
        {loading && (
          <span style={{ color: 'var(--text-light)' }}>Updating...</span>
        )}
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Credits</th>
                <th>Department</th>
                <th>Status</th>
                <th style={{ width: isAdmin ? 160 : 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="empty-state">
                    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                      <FiBook
                        size={40}
                        style={{ opacity: 0.3, marginBottom: 16 }}
                      />
                      <h3>No courses found</h3>
                      <p style={{ color: 'var(--text-light)' }}>
                        {filterApplied
                          ? 'Try adjusting your filters'
                          : 'Get started by creating a new course'}
                      </p>
                      {filterApplied && (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={clearFilters}
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
              {courses.map(c => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.code}</strong>
                  </td>
                  <td>{c.name}</td>
                  <td>{c.credits}</td>
                  <td>
                    <span className="badge badge-neutral">
                      {c.department || getDepartmentName(c.departmentId)}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(c.status)}`}>
                      {c.status || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <div
                      style={{ display: 'flex', gap: 6, alignItems: 'center' }}
                    >
                      {isAdmin ? (
                        <button
                          className={`btn btn-sm ${c.status === 'Opened' ? 'btn-warning' : 'btn-success'}`}
                          onClick={() => handleStatusToggle(c)}
                          disabled={updatingStatus === c.id}
                          title={
                            c.status === 'Opened'
                              ? 'Close Course'
                              : 'Open Course'
                          }
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            minWidth: 80,
                          }}
                        >
                          {updatingStatus === c.id ? (
                            <span className="spinner-small" />
                          ) : (
                            <>
                              {c.status === 'Opened' ? (
                                <FiToggleRight size={16} />
                              ) : (
                                <FiToggleLeft size={16} />
                              )}
                              {c.status === 'Opened' ? 'Close' : 'Open'}
                            </>
                          )}
                        </button>
                      ) : (
                        <span
                          className="badge badge-neutral"
                          style={{ fontSize: '0.75rem' }}
                        >
                          View Only
                        </span>
                      )}

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

      {/* Create Course Modal - Only for Admin */}
      {isAdmin && modal === 'create' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Add New Course</h2>
            <form onSubmit={handleCreate}>
              <div className="form-row">
                <div className="form-group">
                  <label>Code *</label>
                  <input
                    className="form-control"
                    value={form.code}
                    onChange={e => setForm({ ...form, code: e.target.value })}
                    placeholder="e.g., CS101"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    className="form-control"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Course name"
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Credits *</label>
                  <input
                    type="number"
                    className="form-control"
                    min={1}
                    max={6}
                    value={form.credits}
                    onChange={e =>
                      setForm({ ...form, credits: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Department *</label>
                  <select
                    className="form-control"
                    value={form.departmentId}
                    onChange={e =>
                      setForm({ ...form, departmentId: e.target.value })
                    }
                    required
                  >
                    <option value="">Select department...</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Create Course
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setModal(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
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

        .spinner-small {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: #fff;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .badge-danger {
          background-color: #fee2e2;
          color: #991b1b;
        }

        .btn-warning {
          background-color: #f59e0b;
          color: white;
        }

        .btn-warning:hover:not(:disabled) {
          background-color: #d97706;
        }

        .btn-success {
          background-color: #10b981;
          color: white;
        }

        .btn-success:hover:not(:disabled) {
          background-color: #059669;
        }
      `}</style>
    </div>
  );
}
