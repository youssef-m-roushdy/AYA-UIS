import React, { useEffect, useState, useCallback } from 'react';
import {
  FiUsers,
  FiFilter,
  FiX,
  FiMail,
  FiUser,
  FiSearch,
  FiGrid,
  FiBriefcase,
  FiHash,
  FiUserPlus,
  FiUserCheck,
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

  // Filter states - Updated to match API query parameters
  const [filters, setFilters] = useState({
    Academic_Code: '',
    Gender: '',
    Level: '',
    DepartmentId: '',
    Role: '',
    Name: '', // Changed from searchTerm to Name to match API
  });
  const [filterApplied, setFilterApplied] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12; // Increased for card layout
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

      // Add all filters - matching API query parameters exactly
      if (filters.Role) filterParams.Role = filters.Role;
      if (filters.Level) filterParams.Level = filters.Level;
      if (filters.DepartmentId)
        filterParams.DepartmentId = parseInt(filters.DepartmentId);
      if (filters.Academic_Code)
        filterParams.Academic_Code = filters.Academic_Code;
      if (filters.Gender) filterParams.Gender = filters.Gender;
      if (filters.Name) filterParams.Name = filters.Name; // Using Name for search

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
      Academic_Code: '',
      Gender: '',
      Level: '',
      DepartmentId: '',
      Role: '',
      Name: '',
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

  const getGenderIcon = gender => {
    return gender === 'Male' ? '♂️' : '♀️';
  };

  const getInitials = name => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getProfileColor = (gender, name) => {
    if (gender === 'Male') return '#3b82f6'; // Blue for male
    if (gender === 'Female') return '#ec4899'; // Pink for female
    // Generate consistent color based on name
    const hue = name ? (name.length * 50) % 360 : 200;
    return `hsl(${hue}, 70%, 60%)`;
  };

  if (!hasRole('Admin')) {
    return (
      <div className="page-container">
        <div className="empty-state-card">
          <FiUsers size={48} />
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
          <h1>
            <FiUsers />
            System Users
          </h1>
          <p>Manage all users in the system</p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="actions-bar">
        <div className="actions-left">
          <button
            className={`btn ${filterApplied ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter />
            Filters
            {filterApplied && <span className="filter-dot"></span>}
          </button>
        </div>

        <div className="actions-right">
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
        <div className="filters-card">
          <div className="filters-header">
            <h3>Filter Users</h3>
            {filterApplied && (
              <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
                <FiX size={13} /> Clear All
              </button>
            )}
          </div>

          <div className="filters-grid">
            {/* Role */}
            <FilterSelect
              label="Role"
              value={filters.Role}
              onChange={val => handleFilterChange('Role', val)}
              options={roleFilterOptions}
              placeholder="All Roles"
              icon={<FiUser size={13} />}
            />

            {/* Gender */}
            <FilterSelect
              label="Gender"
              value={filters.Gender}
              onChange={val => handleFilterChange('Gender', val)}
              options={genderFilterOptions}
              placeholder="All Genders"
              icon={<FiUser size={13} />}
            />

            {/* Level */}
            <FilterSelect
              label="Level"
              value={filters.Level}
              onChange={val => handleFilterChange('Level', val)}
              options={levelFilterOptions}
              placeholder="All Levels"
              icon={<FiGrid size={13} />}
            />

            {/* Department */}
            <FilterSelect
              label="Department"
              value={filters.DepartmentId}
              onChange={val => handleFilterChange('DepartmentId', val)}
              options={departments.map(d => ({
                value: String(d.id),
                label: d.name,
                dotColor: 'neutral',
              }))}
              placeholder="All Departments"
              icon={<FiBriefcase size={13} />}
            />

            {/* Academic Code */}
            <div className="filter-input-group">
              <span className="filter-label">Academic Code</span>
              <input
                type="text"
                placeholder="Enter code..."
                value={filters.Academic_Code}
                onChange={e =>
                  handleFilterChange('Academic_Code', e.target.value)
                }
                className="filter-input"
              />
            </div>

            {/* Name Search */}
            <div className="filter-input-group">
              <span className="filter-label">Search by Name</span>
              <div className="search-input-wrapper">
                <FiSearch className="search-icon" size={13} />
                <input
                  type="text"
                  placeholder="Enter name..."
                  value={filters.Name}
                  onChange={e => handleFilterChange('Name', e.target.value)}
                  className="filter-input with-icon"
                />
              </div>
            </div>
          </div>

          {/* Active filter chips */}
          {filterApplied && (
            <div className="active-filters">
              <span className="active-filters-label">Active:</span>
              {filters.Role && (
                <span className="badge badge-info">Role: {filters.Role}</span>
              )}
              {filters.Gender && (
                <span className="badge badge-info">
                  Gender: {filters.Gender}
                </span>
              )}
              {filters.Level && (
                <span className="badge badge-info">
                  Level:{' '}
                  {levelOptions.find(l => l.value === filters.Level)?.label}
                </span>
              )}
              {filters.DepartmentId && (
                <span className="badge badge-info">
                  Dept:{' '}
                  {
                    departments.find(
                      d => d.id === parseInt(filters.DepartmentId)
                    )?.name
                  }
                </span>
              )}
              {filters.Academic_Code && (
                <span className="badge badge-info">
                  Code: {filters.Academic_Code}
                </span>
              )}
              {filters.Name && (
                <span className="badge badge-info">Name: {filters.Name}</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Results Summary */}
      <div className="results-summary">
        <span className="results-count">
          {pagination?.totalCount || users.length} user
          {(pagination?.totalCount || users.length) !== 1 ? 's' : ''} found
        </span>
        {loading && <span className="loading-indicator">Updating...</span>}
      </div>

      {/* Facebook-style Cards Grid */}
      {users.length === 0 && !loading ? (
        <div className="empty-state-card">
          <FiUsers size={48} />
          <h3>No users found</h3>
          <p>
            {filterApplied
              ? 'Try adjusting your filters'
              : 'No users available'}
          </p>
          {filterApplied && (
            <button className="btn btn-ghost" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="users-grid">
          {users.map(user => (
            <div key={user.id} className="user-card">
              <div className="card-header">
                <div
                  className="profile-picture"
                  style={{
                    backgroundColor: getProfileColor(
                      user.gender,
                      user.displayName
                    ),
                  }}
                >
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt={user.displayName} />
                  ) : (
                    <span className="initials">
                      {getInitials(user.displayName)}
                    </span>
                  )}
                </div>

                {/* Role Badge */}
                {user.roles && user.roles.length > 0 && (
                  <span className={`role-badge ${getRoleColor(user.roles)}`}>
                    {user.roles[0]}
                  </span>
                )}
              </div>

              <div className="card-body">
                <h3 className="user-name">{user.displayName || 'N/A'}</h3>

                <div className="user-info">
                  <div className="info-item">
                    <FiMail className="info-icon" />
                    <span className="info-text">{user.email || 'N/A'}</span>
                  </div>

                  <div className="info-item">
                    <FiHash className="info-icon" />
                    <span className="info-text">
                      <span className="info-label">Code:</span>{' '}
                      {user.academicCode || 'N/A'}
                    </span>
                  </div>

                  <div className="info-item">
                    <FiBriefcase className="info-icon" />
                    <span className="info-text">
                      <span className="info-label">Dept:</span>{' '}
                      {user.department || 'N/A'}
                    </span>
                  </div>

                  {user.gender && (
                    <div className="info-item">
                      <FiUser className="info-icon" />
                      <span className="info-text">
                        <span className="info-label">Gender:</span>{' '}
                        {user.gender} {getGenderIcon(user.gender)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Facebook-style action buttons */}
              <div className="card-actions">
                <button className="action-btn primary">
                  <FiUserPlus />
                  <span>View Profile</span>
                </button>
                <button className="action-btn secondary">
                  <FiMail />
                  <span>Message</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {users.length > 0 && (
        <div className="pagination-container">
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

      <style jsx>{`
        .page-container {
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 24px;
        }

        .page-header h1 {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 28px;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 8px 0;
        }

        .page-header p {
          color: #64748b;
          margin: 0;
          font-size: 15px;
        }

        .actions-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 24px;
        }

        .actions-left {
          display: flex;
          gap: 8px;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          background: transparent;
        }

        .btn-ghost {
          background: #f1f5f9;
          color: #334155;
        }

        .btn-ghost:hover {
          background: #e2e8f0;
        }

        .btn-primary {
          background: #2563eb;
          color: white;
        }

        .btn-primary:hover {
          background: #1d4ed8;
        }

        .btn-sm {
          padding: 6px 12px;
          font-size: 13px;
        }

        .filter-dot {
          width: 6px;
          height: 6px;
          background: #2563eb;
          border-radius: 50%;
          margin-left: 4px;
        }

        .filters-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid #eef2f6;
          animation: slideDown 0.3s ease;
        }

        .filters-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .filters-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }

        .filter-input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .filter-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: #94a3b8;
        }

        .filter-input {
          height: 40px;
          padding: 0 12px;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: all 0.15s;
          width: 100%;
        }

        .filter-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .filter-input.with-icon {
          padding-left: 32px;
        }

        .search-input-wrapper {
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
        }

        .active-filters {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid #eef2f6;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
        }

        .active-filters-label {
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
        }

        .results-summary {
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .results-count {
          background: #f1f5f9;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 14px;
          color: #334155;
          font-weight: 500;
        }

        .loading-indicator {
          color: #64748b;
          font-size: 14px;
        }

        .users-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }

        .user-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid #eef2f6;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
        }

        .user-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
          border-color: #d1d9e6;
        }

        .card-header {
          position: relative;
          padding: 20px 20px 0 20px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .profile-picture {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 24px;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .profile-picture img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }

        .initials {
          font-size: 28px;
          font-weight: 600;
        }

        .role-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .badge-danger {
          background: #fee2e2;
          color: #991b1b;
        }

        .badge-warning {
          background: #fef3c7;
          color: #92400e;
        }

        .badge-success {
          background: #d1fae5;
          color: #065f46;
        }

        .badge-info {
          background: #dbeafe;
          color: #1e40af;
        }

        .badge-neutral {
          background: #f1f5f9;
          color: #475569;
        }

        .card-body {
          padding: 16px 20px;
          flex: 1;
        }

        .user-name {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: #475569;
        }

        .info-icon {
          color: #94a3b8;
          flex-shrink: 0;
        }

        .info-text {
          word-break: break-word;
          line-height: 1.4;
        }

        .info-label {
          color: #94a3b8;
          font-weight: 500;
          margin-right: 4px;
        }

        .card-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          background: #eef2f6;
          border-top: 1px solid #eef2f6;
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          background: white;
          border: none;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          color: #475569;
        }

        .action-btn:hover {
          background: #f8fafc;
        }

        .action-btn.primary {
          color: #2563eb;
        }

        .action-btn.primary:hover {
          background: #eff6ff;
        }

        .action-btn.secondary:hover {
          background: #f1f5f9;
        }

        .empty-state-card {
          background: white;
          border-radius: 16px;
          padding: 60px 20px;
          text-align: center;
          border: 1px solid #eef2f6;
          color: #94a3b8;
        }

        .empty-state-card h3 {
          margin: 16px 0 8px 0;
          font-size: 18px;
          font-weight: 600;
          color: #334155;
        }

        .empty-state-card p {
          margin: 0 0 20px 0;
          color: #64748b;
        }

        .pagination-container {
          margin-top: 24px;
        }

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

        /* Badge color variations */
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
      `}</style>
    </div>
  );
}
