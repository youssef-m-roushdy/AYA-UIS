import React, { useEffect, useState, useCallback } from 'react';
import {
  FiUsers,
  FiFilter,
  FiX,
  FiMail,
  FiUser,
  FiSearch,
  FiGrid,
} from 'react-icons/fi';
import userService from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import Pagination from '../../components/common/Pagination';
import SortMenu from '../../components/common/SortMenu';
import FilterSelect from '../../components/common/FilterSelect';

export default function Users() {
  const { hasRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [departments, setDepartments] = useState([]);

  // Filter states
  const [filters, setFilters] = useState({
    academicCode: '',
    gender: '',
    level: '',
    departmentId: '',
    role: '',
    searchTerm: '',
  });
  const [filterApplied, setFilterApplied] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // Fixed page size
  const [sortBy, setSortBy] = useState(null);
  const [sortDirection, setSortDirection] = useState('Ascending');
  const [pagination, setPagination] = useState(null);

  const sortOptions = [
    { value: 'DisplayName', label: 'Name' },
    { value: 'Email', label: 'Email' },
    { value: 'AcademicCode', label: 'Academic Code' },
  ];

  const levelOptions = [
    { value: 'Preparatory_Year', label: 'Preparatory Year' },
    { value: 'First_Year', label: '1st Year' },
    { value: 'Second_Year', label: '2nd Year' },
    { value: 'Third_Year', label: '3rd Year' },
    { value: 'Fourth_Year', label: '4th Year' },
    { value: 'Graduate', label: 'Graduate' },
  ];

  const roleOptions = [
    { value: 'Admin', label: 'Admin' },
    { value: 'Instructor', label: 'Instructor' },
    { value: 'Student', label: 'Student' },
  ];

  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
  ];

  // FilterSelect option arrays
  const levelFilterOptions = [
    { value: 'Preparatory_Year', label: 'Preparatory Year', dotColor: 'info' },
    { value: 'First_Year', label: '1st Year', dotColor: 'success' },
    { value: 'Second_Year', label: '2nd Year', dotColor: 'warning' },
    { value: 'Third_Year', label: '3rd Year', dotColor: 'danger' },
    { value: 'Fourth_Year', label: '4th Year', dotColor: 'purple' },
    { value: 'Graduate', label: 'Graduate', dotColor: 'neutral' },
  ];

  const genderFilterOptions = [
    { value: 'Male', label: 'Male', dotColor: 'info' },
    { value: 'Female', label: 'Female', dotColor: 'pink' },
  ];

  const roleFilterOptions = [
    { value: 'Admin', label: 'Admin', dotColor: 'danger' },
    { value: 'Instructor', label: 'Instructor', dotColor: 'warning' },
    { value: 'Student', label: 'Student', dotColor: 'success' },
  ];

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const departmentService =
        await import('../../services/departmentService');
      const res = await departmentService.default.getAll();
      setDepartments(res?.data || res || []);
    } catch (error) {
      console.error('Failed to load departments:', error);
    }
  };

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const filterParams = {};

      // Add all filters
      if (filters.role) filterParams.Role = filters.role;
      if (filters.level) filterParams.Level = filters.level;
      if (filters.departmentId)
        filterParams.DepartmentId = parseInt(filters.departmentId);
      if (filters.academicCode)
        filterParams.Academic_Code = filters.academicCode;
      if (filters.gender) filterParams.Gender = filters.gender;
      if (filters.searchTerm) filterParams.SearchTerm = filters.searchTerm;

      const response = await userService.getAllPaginated(
        filterParams,
        currentPage,
        pageSize,
        sortBy,
        sortDirection
      );

      let usersData = [];
      let paginationData = null;

      if (response?.data) {
        usersData = response.data;
        paginationData = response.pagination;
      } else if (Array.isArray(response)) {
        usersData = response;
      } else {
        usersData = response || [];
      }
      console.log('Loaded users:', usersData);
      setUsers(usersData);
      if (paginationData) {
        setPagination(paginationData);
      }

      setFilterApplied(Object.values(filters).some(v => v !== ''));
    } catch (e) {
      toast.error(e?.errorMessage || 'Failed to load users');
      setUsers([]);
    }
    setLoading(false);
  }, [filters, currentPage, pageSize, sortBy, sortDirection]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      academicCode: '',
      gender: '',
      level: '',
      departmentId: '',
      role: '',
      searchTerm: '',
    });
    setCurrentPage(1);
  };

  const handlePageChange = newPage => {
    setCurrentPage(newPage);
  };

  const handleSortChange = (field, direction) => {
    setSortBy(field);
    setSortDirection(direction);
    setCurrentPage(1);
  };

  const getRoleColor = roles => {
    if (!roles || roles.length === 0) return 'badge-neutral';
    if (roles.includes('Admin')) return 'badge-danger';
    if (roles.includes('Instructor')) return 'badge-warning';
    if (roles.includes('Student')) return 'badge-success';
    return 'badge-neutral';
  };

  const getGenderColor = gender => {
    return gender === 'Male' ? 'badge-info' : 'badge-pink';
  };

  if (!hasRole('Admin')) {
    return (
      <div className="page-container">
        <div className="card empty-state">
          <h3>Access Denied</h3>
          <p>You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiUsers />
            System Users
          </h1>
          <p>Manage all users in the system</p>
        </div>
      </div>

      {/* Actions Bar - Same as Students component */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={`btn ${filterApplied ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter />
            Filters
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <SortMenu
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
            sortOptions={sortOptions}
            isLoading={loading}
          />
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
              marginBottom: 18,
            }}
          >
            <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600 }}>
              Filter Users
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

          {/* FilterSelect row */}
          <div
            style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              alignItems: 'flex-end',
            }}
          >
            {/* Role */}
            <FilterSelect
              label="Role"
              value={filters.role}
              onChange={val => handleFilterChange('role', val)}
              options={roleFilterOptions}
              placeholder="All Roles"
              icon={<FiUser size={13} />}
            />

            {/* Gender */}
            <FilterSelect
              label="Gender"
              value={filters.gender}
              onChange={val => handleFilterChange('gender', val)}
              options={genderFilterOptions}
              placeholder="All Genders"
              icon={<FiUser size={13} />}
            />

            {/* Department */}
            <FilterSelect
              label="Department"
              value={filters.departmentId}
              onChange={val => handleFilterChange('departmentId', val)}
              options={departments.map(d => ({
                value: String(d.id),
                label: d.name,
                dotColor: 'neutral',
              }))}
              placeholder="All Departments"
              icon={<FiGrid size={13} />}
            />

            {/* Academic Code — plain text input */}
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
                Academic Code
              </span>
              <input
                type="text"
                placeholder="Enter code..."
                value={filters.academicCode}
                onChange={e =>
                  handleFilterChange('academicCode', e.target.value)
                }
                style={{
                  padding: '0 12px',
                  height: '38px',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '13.5px',
                  fontFamily: "'DM Sans', sans-serif",
                  outline: 'none',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                  minWidth: '160px',
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#6366f1';
                  e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Search Term */}
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
                Search
              </span>
              <div style={{ position: 'relative' }}>
                <FiSearch
                  style={{
                    position: 'absolute',
                    left: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#cbd5e1',
                    pointerEvents: 'none',
                  }}
                  size={13}
                />
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={filters.searchTerm}
                  onChange={e =>
                    handleFilterChange('searchTerm', e.target.value)
                  }
                  style={{
                    padding: '0 12px 0 32px',
                    height: '38px',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '13.5px',
                    fontFamily: "'DM Sans', sans-serif",
                    outline: 'none',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                    minWidth: '160px',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = '#6366f1';
                    e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
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
                {filters.role && (
                  <span className="badge badge-info">Role: {filters.role}</span>
                )}
                {filters.gender && (
                  <span className="badge badge-info">
                    Gender: {filters.gender}
                  </span>
                )}
                {filters.departmentId && (
                  <span className="badge badge-info">
                    Department:{' '}
                    {
                      departments.find(
                        d => d.id === parseInt(filters.departmentId)
                      )?.name
                    }
                  </span>
                )}
                {filters.academicCode && (
                  <span className="badge badge-info">
                    Code: {filters.academicCode}
                  </span>
                )}
              </div>
            )}
          </div>
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
          {pagination?.totalCount || users.length} user
          {(pagination?.totalCount || users.length) !== 1 ? 's' : ''} found
        </span>
        {loading && (
          <span style={{ color: 'var(--text-light)' }}>Updating...</span>
        )}
      </div>

      {/* Users Table - Same as Students component */}
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Academic Code</th>
                <th>Roles</th>
                <th>Department</th>
                <th>Gender</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && !loading ? (
                <tr>
                  <td colSpan={9} className="empty-state">
                    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                      <FiUsers
                        size={40}
                        style={{ opacity: 0.3, marginBottom: 16 }}
                      />
                      <h3>No users found</h3>
                      <p style={{ color: 'var(--text-light)' }}>
                        {filterApplied
                          ? 'Try adjusting your filters'
                          : 'No users available'}
                      </p>
                      {filterApplied && (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={clearFilters}
                          style={{ marginTop: 8 }}
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            backgroundColor: '#e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            color: '#4a5568',
                          }}
                        >
                          {user.displayName?.charAt(0).toUpperCase() || (
                            <FiUser size={14} />
                          )}
                        </div>
                        <strong>{user.displayName}</strong>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.875rem' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <FiMail
                          size={14}
                          style={{ color: 'var(--text-light)' }}
                        />
                        {user.email}
                      </div>
                    </td>
                    <td>
                      <code style={{ fontSize: '0.875rem' }}>
                        {user.academicCode || '—'}
                      </code>
                    </td>
                    <td>
                      {user.roles && user.roles.length > 0 ? (
                        <span className={`badge ${getRoleColor(user.roles)}`}>
                          {user.roles[0]}
                        </span>
                      ) : (
                        <span className="badge badge-neutral">No Role</span>
                      )}
                    </td>
                    <td>
                      {user.department ? (
                        <span className="badge badge-info">
                          {user.department}
                        </span>
                      ) : (
                        <span className="badge badge-neutral">—</span>
                      )}
                    </td>
                    <td>
                      {user.gender ? (
                        <span
                          className={`badge ${getGenderColor(user.gender)}`}
                        >
                          {user.gender}
                        </span>
                      ) : (
                        <span className="badge badge-neutral">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {users.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Pagination
              currentPage={pagination?.currentPage || currentPage}
              totalPages={pagination?.totalPages || 1}
              pageSize={pageSize}
              totalCount={pagination?.totalCount || users.length}
              onPageChange={handlePageChange}
              isLoading={loading}
            />
          </div>
        )}
      </div>

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

        .badge-pink {
          background-color: #fce7f3;
          color: #9d174d;
        }

        .badge-purple {
          background-color: #ede9fe;
          color: #6d28d9;
        }

        .badge-primary {
          background-color: #dbeafe;
          color: #1e40af;
        }

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

        .badge-info {
          background-color: #dbeafe;
          color: #1e40af;
        }

        .badge-neutral {
          background-color: #f1f5f9;
          color: #475569;
        }
      `}</style>
    </div>
  );
}
