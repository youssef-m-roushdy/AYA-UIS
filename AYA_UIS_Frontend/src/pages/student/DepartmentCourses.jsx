import React, { useEffect, useState, useCallback } from 'react';
import { FiBook, FiFilter, FiX, FiList, FiGitBranch, FiActivity } from 'react-icons/fi';
import courseService from '../../services/courseService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import Pagination from '../../components/common/Pagination';
import SortMenu from '../../components/common/SortMenu';
import FilterSelect from '../../components/common/FilterSelect';

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

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // Fixed page size
  const [sortBy, setSortBy] = useState(null);
  const [sortDirection, setSortDirection] = useState('Ascending');
  const [pagination, setPagination] = useState(null);

  const sortOptions = [
    { value: 'Code', label: 'Course Code' },
    { value: 'Name', label: 'Course Name' },
    { value: 'Credits', label: 'Credits' },
  ];

  // FilterSelect option arrays
  const statusOptions = [
    { value: 'Opened', label: 'Opened', dotColor: 'success' },
    { value: 'Closed', label: 'Closed', dotColor: 'danger' },
  ];

  const departmentId = user?.departmentId;

  const loadCourses = useCallback(async () => {
    if (!departmentId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Build filter params
      const filterParams = {};
      if (filters.status) filterParams.Status = filters.status;

      const res = await courseService.getDeptCourses(
        departmentId,
        filterParams,
        currentPage,
        pageSize,
        sortBy,
        sortDirection
      );

      let coursesData = [];
      let paginationData = null;

      if (res?.data) {
        coursesData = res.data;
        paginationData = res.pagination;
      } else if (Array.isArray(res)) {
        coursesData = res;
      } else {
        coursesData = res || [];
      }

      setCourses(coursesData);
      if (paginationData) {
        setPagination(paginationData);
      }

      // Check if filter is applied
      setFilterApplied(filters.status !== '');
    } catch (e) {
      toast.error('Failed to load courses');
      setCourses([]);
    }
    setLoading(false);
  }, [
    departmentId,
    filters.status,
    currentPage,
    pageSize,
    sortBy,
    sortDirection,
  ]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const clearFilters = () => {
    setFilters({
      status: '',
    });
    setCurrentPage(1); // Reset pagination
  };

  const handlePageChange = newPage => {
    setCurrentPage(newPage);
  };

  const handleSortChange = (field, direction) => {
    setSortBy(field);
    setSortDirection(direction);
    setCurrentPage(1); // Reset to first page when sorting changes
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
                <FiX size={13} /> Clear Filter
              </button>
            )}
          </div>

          {/* FilterSelect row */}
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
              placeholder="All Courses"
              icon={<FiActivity size={13} />}
            />
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
                <span className="badge badge-info">
                  Status: {filters.status}
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
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <span className="badge badge-info" style={{ fontSize: '0.875rem' }}>
          {pagination?.totalCount || courses.length} course
          {(pagination?.totalCount || courses.length) !== 1 ? 's' : ''} found
          {filterApplied && ` (filtered by ${filters.status})`}
        </span>
        <SortMenu
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
          sortOptions={sortOptions}
          isLoading={loading}
        />
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

          {/* Pagination Component */}
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
