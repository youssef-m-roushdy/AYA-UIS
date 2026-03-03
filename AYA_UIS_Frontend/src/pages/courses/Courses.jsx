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
  FiHash,
  FiTag,
  FiGrid,
  FiActivity,
} from 'react-icons/fi';
import courseService from '../../services/courseService';
import departmentService from '../../services/departmentService';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES } from '../../constants';
import { toast } from 'react-toastify';
import Pagination from '../../components/common/Pagination';
import SortMenu from '../../components/common/SortMenu';
import FilterSelect from '../../components/common/FilterSelect';

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

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [sortBy, setSortBy] = useState(null);
  const [sortDirection, setSortDirection] = useState('Ascending');
  const [pagination, setPagination] = useState(null);

  const sortOptions = [
    { value: 'Code', label: 'Course Code' },
    { value: 'Name', label: 'Course Name' },
    { value: 'Credits', label: 'Credits' },
    { value: 'Status', label: 'Status' },
  ];

  // FilterSelect option arrays
  const statusOptions = [
    { value: 'Opened', label: 'Opened', dotColor: 'success' },
    { value: 'Closed', label: 'Closed', dotColor: 'danger' },
  ];

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
      const filterParams = {};
      if (filters.status) filterParams.Status = filters.status;
      if (filters.code) filterParams.Code = filters.code;
      if (filters.name) filterParams.Name = filters.name;
      if (filters.departmentId)
        filterParams.DepartmentId = parseInt(filters.departmentId);

      const response = await courseService.getAllWithPagination(
        filterParams,
        currentPage,
        pageSize,
        sortBy,
        sortDirection
      );

      let coursesData = [];
      let paginationData = null;

      if (response?.data) {
        coursesData = response.data;
        paginationData = response.pagination;
      } else if (Array.isArray(response)) {
        coursesData = response;
      } else {
        coursesData = response || [];
      }

      setCourses(coursesData);
      if (paginationData) setPagination(paginationData);
      setFilterApplied(Object.values(filters).some(v => v !== ''));
    } catch (e) {
      toast.error(e?.errorMessage || 'Failed to load courses');
      setCourses([]);
    }
    setLoading(false);
  }, [filters, currentPage, pageSize, sortBy, sortDirection]);

  useEffect(() => {
    loadDepartments();
  }, []);
  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ status: '', code: '', name: '', departmentId: '' });
    setCurrentPage(1);
  };

  const handlePageChange = newPage => setCurrentPage(newPage);

  const handleSortChange = (field, direction) => {
    setSortBy(field);
    setSortDirection(direction);
    setCurrentPage(1);
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

  const getDepartmentName = departmentId => {
    const dept = departments.find(d => d.id === departmentId);
    return dept?.name || 'N/A';
  };

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

  const getCourseName = courseId => {
    const course = courses.find(c => c.id === courseId);
    return course?.name || 'Course';
  };

  // Department options for FilterSelect
  const departmentOptions = departments.map(d => ({
    value: String(d.id),
    label: d.name,
    dotColor: 'neutral',
  }));

  const activeFilterCount = Object.values(filters).filter(v => v !== '').length;

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
            {activeFilterCount > 0 && (
              <span
                style={{
                  marginLeft: 6,
                  background: '#6366f1',
                  color: '#fff',
                  borderRadius: '999px',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '1px 7px',
                  lineHeight: '18px',
                }}
              >
                {activeFilterCount}
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

      {/* ── Filters Panel ─────────────────────────────────────── */}
      {showFilters && (
        <div
          className="card"
          style={{ marginBottom: 24, animation: 'slideDown 0.25s ease' }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 18,
            }}
          >
            <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600 }}>
              Filter Courses
            </h3>
            {filterApplied && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={clearFilters}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <FiX size={13} /> Clear All
              </button>
            )}
          </div>

          {/* FilterSelect row — all dropdowns inline */}
          <div
            style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              alignItems: 'flex-end',
            }}
          >
            {/* Status */}
            <FilterSelect
              label="Status"
              value={filters.status}
              onChange={val => handleFilterChange('status', val)}
              options={statusOptions}
              placeholder="All Statuses"
              icon={<FiActivity size={13} />}
            />

            {/* Department */}
            <FilterSelect
              label="Department"
              value={filters.departmentId}
              onChange={val => handleFilterChange('departmentId', val)}
              options={departmentOptions}
              placeholder="All Departments"
              icon={<FiGrid size={13} />}
            />

            {/* Code — plain text input kept but styled to match */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  color: '#94a3b8',
                }}
              >
                Code
              </span>
              <div style={{ position: 'relative' }}>
                <FiHash
                  size={13}
                  style={{
                    position: 'absolute',
                    left: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type="text"
                  value={filters.code}
                  onChange={e => handleFilterChange('code', e.target.value)}
                  placeholder="e.g. CS101"
                  style={{
                    paddingLeft: 28,
                    paddingRight: filters.code ? 28 : 12,
                    paddingTop: 8,
                    paddingBottom: 8,
                    borderRadius: 9,
                    border: `1.5px solid ${filters.code ? '#6366f1' : '#e2e8f0'}`,
                    background: filters.code ? '#eef2ff' : '#fff',
                    color: filters.code ? '#4338ca' : '#475569',
                    fontSize: 13.5,
                    fontFamily: 'inherit',
                    outline: 'none',
                    width: 148,
                    boxShadow: filters.code
                      ? '0 0 0 3px rgba(99,102,241,0.08)'
                      : '0 1px 2px rgba(0,0,0,0.04)',
                    transition: 'all 0.15s',
                  }}
                />
                {filters.code && (
                  <button
                    onClick={() => handleFilterChange('code', '')}
                    style={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(99,102,241,0.15)',
                      border: 'none',
                      borderRadius: '50%',
                      width: 16,
                      height: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#6366f1',
                      padding: 0,
                    }}
                  >
                    <FiX size={9} />
                  </button>
                )}
              </div>
            </div>

            {/* Name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  color: '#94a3b8',
                }}
              >
                Name
              </span>
              <div style={{ position: 'relative' }}>
                <FiTag
                  size={13}
                  style={{
                    position: 'absolute',
                    left: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type="text"
                  value={filters.name}
                  onChange={e => handleFilterChange('name', e.target.value)}
                  placeholder="Search name..."
                  style={{
                    paddingLeft: 28,
                    paddingRight: filters.name ? 28 : 12,
                    paddingTop: 8,
                    paddingBottom: 8,
                    borderRadius: 9,
                    border: `1.5px solid ${filters.name ? '#6366f1' : '#e2e8f0'}`,
                    background: filters.name ? '#eef2ff' : '#fff',
                    color: filters.name ? '#4338ca' : '#475569',
                    fontSize: 13.5,
                    fontFamily: 'inherit',
                    outline: 'none',
                    width: 180,
                    boxShadow: filters.name
                      ? '0 0 0 3px rgba(99,102,241,0.08)'
                      : '0 1px 2px rgba(0,0,0,0.04)',
                    transition: 'all 0.15s',
                  }}
                />
                {filters.name && (
                  <button
                    onClick={() => handleFilterChange('name', '')}
                    style={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(99,102,241,0.15)',
                      border: 'none',
                      borderRadius: '50%',
                      width: 16,
                      height: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#6366f1',
                      padding: 0,
                    }}
                  >
                    <FiX size={9} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Active filter chips */}
          {filterApplied && (
            <div
              style={{
                marginTop: 16,
                paddingTop: 14,
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                gap: 6,
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontSize: '0.8125rem',
                  color: '#94a3b8',
                  fontWeight: 500,
                }}
              >
                Active:
              </span>
              {filters.status && (
                <span
                  className="badge badge-info"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    cursor: 'pointer',
                  }}
                  onClick={() => handleFilterChange('status', '')}
                >
                  Status: {filters.status} <FiX size={10} />
                </span>
              )}
              {filters.code && (
                <span
                  className="badge badge-info"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    cursor: 'pointer',
                  }}
                  onClick={() => handleFilterChange('code', '')}
                >
                  Code: {filters.code} <FiX size={10} />
                </span>
              )}
              {filters.name && (
                <span
                  className="badge badge-info"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    cursor: 'pointer',
                  }}
                  onClick={() => handleFilterChange('name', '')}
                >
                  Name: {filters.name} <FiX size={10} />
                </span>
              )}
              {filters.departmentId && (
                <span
                  className="badge badge-info"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    cursor: 'pointer',
                  }}
                  onClick={() => handleFilterChange('departmentId', '')}
                >
                  Dept: {getDepartmentName(parseInt(filters.departmentId))}{' '}
                  <FiX size={10} />
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Results Summary ────────────────────────────────────── */}
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <span className="badge badge-info" style={{ fontSize: '0.875rem' }}>
          {pagination?.totalCount || courses.length} course
          {(pagination?.totalCount || courses.length) !== 1 ? 's' : ''} found
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SortMenu
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
            sortOptions={sortOptions}
            isLoading={loading}
          />
          {loading && (
            <span style={{ fontSize: 13, color: 'var(--text-light)' }}>
              Updating…
            </span>
          )}
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────── */}
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

        {courses.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Pagination
              currentPage={pagination?.currentPage || currentPage}
              totalPages={pagination?.totalPages || 1}
              pageSize={pageSize}
              totalCount={pagination?.totalCount || courses.length}
              onPageChange={handlePageChange}
              isLoading={loading}
            />
          </div>
        )}
      </div>

      {/* ── Create Modal ───────────────────────────────────────── */}
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

      {/* ── Prerequisites Modal ────────────────────────────────── */}
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

      {/* ── Dependencies Modal ─────────────────────────────────── */}
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
