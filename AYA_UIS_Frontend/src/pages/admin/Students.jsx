import React, { useEffect, useState, useCallback } from 'react';
import {
  FiUsers,
  FiFilter,
  FiX,
  FiMail,
  FiUser,
  FiSearch,
  FiBook,
  FiAward,
  FiDollarSign,
  FiGrid,
  FiBriefcase,
  FiHash,
  FiPhone,
  FiUserPlus,
  FiMail as FiMailIcon,
  FiStar,
  FiTrendingUp,
} from 'react-icons/fi';
import userService from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import Pagination from '../../components/common/Pagination';
import SortMenu from '../../components/common/SortMenu';
import FilterSelect from '../../components/common/FilterSelect';

export default function Students() {
  const { hasRole } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [departments, setDepartments] = useState([]);

  // Filter states
  const [filters, setFilters] = useState({
    academicCode: '',
    gender: '',
    level: '',
    departmentId: '',
    specialization: '',
    minGPA: '',
    maxGPA: '',
    minCredits: '',
    maxCredits: '',
    name: '',
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
    { value: 'Level', label: 'Level' },
    { value: 'TotalGPA', label: 'GPA' },
    { value: 'TotalCredits', label: 'Total Credits' },
  ];

  const levelOptions = [
    { value: 'Preparatory_Year', label: 'Preparatory Year' },
    { value: 'First_Year', label: '1st Year' },
    { value: 'Second_Year', label: '2nd Year' },
    { value: 'Third_Year', label: '3rd Year' },
    { value: 'Fourth_Year', label: '4th Year' },
    { value: 'Graduate', label: 'Graduate' },
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

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const filterParams = {};

      // Add all filters
      if (filters.level) filterParams.Level = filters.level;
      if (filters.departmentId)
        filterParams.DepartmentId = parseInt(filters.departmentId);
      if (filters.academicCode)
        filterParams.Academic_Code = filters.academicCode;
      if (filters.gender) filterParams.Gender = filters.gender;
      if (filters.specialization)
        filterParams.Specialization = filters.specialization;
      if (filters.minGPA) filterParams.MinGPA = parseFloat(filters.minGPA);
      if (filters.maxGPA) filterParams.MaxGPA = parseFloat(filters.maxGPA);
      if (filters.minCredits)
        filterParams.MinCredits = parseInt(filters.minCredits);
      if (filters.maxCredits)
        filterParams.MaxCredits = parseInt(filters.maxCredits);
      if (filters.name) filterParams.Name = filters.name;

      const response = await userService.getAllStudents(
        filterParams,
        currentPage,
        pageSize,
        sortBy,
        sortDirection
      );

      console.log('API Response:', response);

      let studentsData = [];
      let paginationData = null;

      if (response?.data) {
        studentsData = response.data;
        paginationData = response.pagination;
      } else if (Array.isArray(response)) {
        studentsData = response;
      } else {
        studentsData = response || [];
      }

      setStudents(studentsData);
      if (paginationData) {
        setPagination(paginationData);
      }

      setFilterApplied(Object.values(filters).some(v => v !== ''));
    } catch (e) {
      toast.error(e?.errorMessage || 'Failed to load students');
      setStudents([]);
    }
    setLoading(false);
  }, [filters, currentPage, pageSize, sortBy, sortDirection]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

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
      specialization: '',
      minGPA: '',
      maxGPA: '',
      minCredits: '',
      maxCredits: '',
      name: '',
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

  const getLevelColor = level => {
    switch (level) {
      case 'Preparatory_Year':
        return 'badge-info';
      case 'First_Year':
        return 'badge-primary';
      case 'Second_Year':
        return 'badge-warning';
      case 'Third_Year':
        return 'badge-success';
      case 'Fourth_Year':
        return 'badge-purple';
      case 'Graduate':
        return 'badge-neutral';
      default:
        return 'badge-neutral';
    }
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
    const hue = name ? name.length * 50 % 360 : 200;
    return `hsl(${hue}, 70%, 60%)`;
  };

  const formatLevel = level => {
    const found = levelOptions.find(opt => opt.value === level);
    return found ? found.label : level;
  };

  const getGPAStatus = gpa => {
    if (!gpa) return 'neutral';
    if (gpa >= 3.5) return 'success';
    if (gpa >= 2.5) return 'warning';
    if (gpa >= 2.0) return 'info';
    return 'danger';
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
            Students Directory
          </h1>
          <p>Manage and view all students in the system</p>
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
            <h3>Filter Students</h3>
            {filterApplied && (
              <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
                <FiX size={13} /> Clear All
              </button>
            )}
          </div>

          <div className="filters-grid">
            {/* Level */}
            <FilterSelect
              label="Level"
              value={filters.level}
              onChange={val => handleFilterChange('level', val)}
              options={levelFilterOptions}
              placeholder="All Levels"
              icon={<FiBook size={13} />}
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

            {/* Academic Code */}
            <div className="filter-input-group">
              <span className="filter-label">Academic Code</span>
              <input
                type="text"
                placeholder="Enter code..."
                value={filters.academicCode}
                onChange={e => handleFilterChange('academicCode', e.target.value)}
                className="filter-input"
              />
            </div>

            {/* Specialization */}
            <div className="filter-input-group">
              <span className="filter-label">Specialization</span>
              <input
                type="text"
                placeholder="Enter specialization..."
                value={filters.specialization}
                onChange={e => handleFilterChange('specialization', e.target.value)}
                className="filter-input"
              />
            </div>

            {/* Name Search */}
            <div className="filter-input-group">
              <span className="filter-label">Name</span>
              <div className="search-input-wrapper">
                <FiSearch className="search-icon" size={13} />
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={filters.name}
                  onChange={e => handleFilterChange('name', e.target.value)}
                  className="filter-input with-icon"
                />
              </div>
            </div>

            {/* Min GPA */}
            <div className="filter-input-group">
              <span className="filter-label">Min GPA</span>
              <input
                type="number"
                step="0.01"
                min="0"
                max="4"
                placeholder="0.0"
                value={filters.minGPA}
                onChange={e => handleFilterChange('minGPA', e.target.value)}
                className="filter-input"
              />
            </div>

            {/* Max GPA */}
            <div className="filter-input-group">
              <span className="filter-label">Max GPA</span>
              <input
                type="number"
                step="0.01"
                min="0"
                max="4"
                placeholder="4.0"
                value={filters.maxGPA}
                onChange={e => handleFilterChange('maxGPA', e.target.value)}
                className="filter-input"
              />
            </div>

            {/* Min Credits */}
            <div className="filter-input-group">
              <span className="filter-label">Min Credits</span>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={filters.minCredits}
                onChange={e => handleFilterChange('minCredits', e.target.value)}
                className="filter-input"
              />
            </div>

            {/* Max Credits */}
            <div className="filter-input-group">
              <span className="filter-label">Max Credits</span>
              <input
                type="number"
                min="0"
                placeholder="30"
                value={filters.maxCredits}
                onChange={e => handleFilterChange('maxCredits', e.target.value)}
                className="filter-input"
              />
            </div>
          </div>

          {/* Active filter chips */}
          {filterApplied && (
            <div className="active-filters">
              <span className="active-filters-label">Active:</span>
              {filters.name && (
                <span className="badge badge-info">Name: "{filters.name}"</span>
              )}
              {filters.level && (
                <span className="badge badge-info">
                  Level: {formatLevel(filters.level)}
                </span>
              )}
              {filters.gender && (
                <span className="badge badge-info">
                  Gender: {filters.gender}
                </span>
              )}
              {filters.departmentId && (
                <span className="badge badge-info">
                  Dept: {departments.find(d => d.id === parseInt(filters.departmentId))?.name}
                </span>
              )}
              {filters.academicCode && (
                <span className="badge badge-info">
                  Code: {filters.academicCode}
                </span>
              )}
              {filters.specialization && (
                <span className="badge badge-info">
                  Spec: {filters.specialization}
                </span>
              )}
              {(filters.minGPA || filters.maxGPA) && (
                <span className="badge badge-info">
                  GPA: {filters.minGPA || '0'} - {filters.maxGPA || '4'}
                </span>
              )}
              {(filters.minCredits || filters.maxCredits) && (
                <span className="badge badge-info">
                  Credits: {filters.minCredits || '0'} - {filters.maxCredits || '∞'}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Results Summary */}
      <div className="results-summary">
        <span className="results-count">
          {pagination?.totalCount || students.length} student
          {(pagination?.totalCount || students.length) !== 1 ? 's' : ''} found
        </span>
        {loading && <span className="loading-indicator">Updating...</span>}
      </div>

      {/* Facebook-style Cards Grid */}
      {students.length === 0 && !loading ? (
        <div className="empty-state-card">
          <FiUsers size={48} />
          <h3>No students found</h3>
          <p>
            {filterApplied
              ? 'Try adjusting your filters'
              : 'No students available'}
          </p>
          {filterApplied && (
            <button className="btn btn-ghost" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="students-grid">
          {students.map(student => (
            <div key={student.id} className="student-card">
              <div className="card-header">
                <div 
                  className="profile-picture"
                  style={{ backgroundColor: getProfileColor(student.gender, student.displayName) }}
                >
                  {student.profilePicture ? (
                    <img src={student.profilePicture} alt={student.displayName} />
                  ) : (
                    <span className="initials">{getInitials(student.displayName)}</span>
                  )}
                </div>
                
                {/* Level Badge */}
                {student.level && (
                  <span className={`level-badge ${getLevelColor(student.level)}`}>
                    {formatLevel(student.level)}
                  </span>
                )}
              </div>

              <div className="card-body">
                <h3 className="student-name">{student.displayName || 'N/A'}</h3>
                <p className="student-username">@{student.userName || 'username'}</p>
                
                <div className="student-info">
                  <div className="info-item">
                    <FiMail className="info-icon" />
                    <span className="info-text">{student.email || 'N/A'}</span>
                  </div>
                  
                  {student.phoneNumber && (
                    <div className="info-item">
                      <FiPhone className="info-icon" />
                      <span className="info-text">{student.phoneNumber}</span>
                    </div>
                  )}
                  
                  <div className="info-item">
                    <FiHash className="info-icon" />
                    <span className="info-text">
                      <span className="info-label">Code:</span> {student.academicCode || 'N/A'}
                    </span>
                  </div>
                  
                  <div className="info-item">
                    <FiBriefcase className="info-icon" />
                    <span className="info-text">
                      <span className="info-label">Dept:</span> {student.department || 'N/A'}
                    </span>
                  </div>
                  
                  {student.specialization && (
                    <div className="info-item">
                      <FiBook className="info-icon" />
                      <span className="info-text">
                        <span className="info-label">Spec:</span> {student.specialization}
                      </span>
                    </div>
                  )}
                  
                  {student.gender && (
                    <div className="info-item">
                      <FiUser className="info-icon" />
                      <span className="info-text">
                        <span className="info-label">Gender:</span> {student.gender} {getGenderIcon(student.gender)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Academic Stats Cards */}
                <div className="stats-grid">
                  <div className="stat-item">
                    <FiAward className={`stat-icon ${getGPAStatus(student.totalGPA)}`} />
                    <div className="stat-content">
                      <span className="stat-label">GPA</span>
                      <span className={`stat-value ${getGPAStatus(student.totalGPA)}`}>
                        {student.totalGPA?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="stat-item">
                    <FiTrendingUp className="stat-icon info" />
                    <div className="stat-content">
                      <span className="stat-label">Credits</span>
                      <span className="stat-value">
                        {student.totalCredits || '0'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="stat-item">
                    <FiStar className="stat-icon warning" />
                    <div className="stat-content">
                      <span className="stat-label">Allowed</span>
                      <span className="stat-value">
                        {student.allowedCredits || '0'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Facebook-style action buttons */}
              <div className="card-actions">
                <button className="action-btn primary">
                  <FiUserPlus />
                  <span>View Profile</span>
                </button>
                <button className="action-btn secondary">
                  <FiMailIcon />
                  <span>Message</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {students.length > 0 && (
        <div className="pagination-container">
          <Pagination
            currentPage={pagination?.currentPage || currentPage}
            totalPages={pagination?.totalPages || 1}
            pageSize={pageSize}
            totalCount={pagination?.totalCount || students.length}
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
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
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
          box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
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

        .students-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }

        .student-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          border: 1px solid #eef2f6;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
        }

        .student-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
          border-color: #d1d9e6;
        }

        .card-header {
          position: relative;
          padding: 24px 20px 0 20px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .profile-picture {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 28px;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .profile-picture img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }

        .initials {
          font-size: 32px;
          font-weight: 600;
        }

        .level-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .card-body {
          padding: 16px 20px;
          flex: 1;
        }

        .student-name {
          margin: 0 0 4px 0;
          font-size: 20px;
          font-weight: 600;
          color: #1e293b;
        }

        .student-username {
          margin: 0 0 16px 0;
          font-size: 14px;
          color: #64748b;
        }

        .student-info {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 16px;
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
          width: 16px;
        }

        .info-text {
          word-break: break-word;
          line-height: 1.4;
          font-size: 13px;
        }

        .info-label {
          color: #94a3b8;
          font-weight: 500;
          margin-right: 4px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #eef2f6;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          background: #f8fafc;
          border-radius: 12px;
        }

        .stat-icon {
          width: 20px;
          height: 20px;
        }

        .stat-icon.success {
          color: #10b981;
        }

        .stat-icon.warning {
          color: #f59e0b;
        }

        .stat-icon.danger {
          color: #ef4444;
        }

        .stat-icon.info {
          color: #3b82f6;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
        }

        .stat-label {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          color: #94a3b8;
          letter-spacing: 0.05em;
        }

        .stat-value {
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
        }

        .stat-value.success {
          color: #10b981;
        }

        .stat-value.warning {
          color: #f59e0b;
        }

        .stat-value.danger {
          color: #ef4444;
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
          padding: 14px;
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