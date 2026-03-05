import React, { useState, useEffect, useCallback } from 'react';
import SortMenu from '../../components/common/SortMenu';
import Pagination from '../../components/common/Pagination';
import FilterSelect from '../../components/common/FilterSelect';
import {
  FiArrowUp,
  FiUsers,
  FiFilter,
  FiX,
  FiLoader,
  FiEye,
  FiUser,
  FiGrid,
  FiMail,
  FiHash,
  FiPhone,
  FiBriefcase,
  FiBook,
  FiAward,
  FiTrendingUp,
  FiStar,
  FiUserPlus,
} from 'react-icons/fi';
import userService from '../../services/userService';
import { userStudyYearService } from '../../services/otherServices';
import departmentService from '../../services/departmentService';
import { LEVEL_LABELS, GENDER_OPTIONS } from '../../constants';
import { toast } from 'react-toastify';
import {
  buildQueryString,
  createFilterPageParams,
} from '../../utils/paginationUtils';

export default function PromoteStudents() {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [promotingId, setPromotingId] = useState(null);
  const [promoteAllLoading, setPromoteAllLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12; // Increased for card layout
  const [sortBy, setSortBy] = useState(null);
  const [sortDirection, setSortDirection] = useState('Ascending');
  const [pagination, setPagination] = useState(null);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filterApplied, setFilterApplied] = useState(false);
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
  });

  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
  ];

  // FilterSelect option arrays
  const genderFilterOptions = [
    { value: 'Male', label: 'Male', dotColor: 'info' },
    { value: 'Female', label: 'Female', dotColor: 'pink' },
  ];

  const levelFilterOptions = Object.entries(LEVEL_LABELS)
    .filter(([value]) => value !== 'Graduate')
    .map(([value, label]) => ({
      value,
      label,
      dotColor: 'neutral',
    }));

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    loadUngraduatedStudents();
  }, [currentPage, pageSize, sortBy, sortDirection, filters]);

  const loadDepartments = async () => {
    try {
      const res = await departmentService.getAll();
      setDepartments(res?.data || res || []);
    } catch (error) {
      console.error('Failed to load departments:', error);
    }
  };

  const loadUngraduatedStudents = useCallback(async () => {
    setLoading(true);
    try {
      // Build filter params
      const filterParams = {
        Level_NotEqual: 'Graduate', // Exclude graduates
      };

      if (filters.academicCode)
        filterParams.Academic_Code = filters.academicCode;
      if (filters.gender) filterParams.Gender = filters.gender;
      if (filters.level) filterParams.Level = filters.level;
      if (filters.departmentId)
        filterParams.DepartmentId = parseInt(filters.departmentId);
      if (filters.specialization)
        filterParams.Specialization = filters.specialization;
      if (filters.minGPA) filterParams.MinGPA = parseFloat(filters.minGPA);
      if (filters.maxGPA) filterParams.MaxGPA = parseFloat(filters.maxGPA);
      if (filters.minCredits)
        filterParams.MinCredits = parseInt(filters.minCredits);
      if (filters.maxCredits)
        filterParams.MaxCredits = parseInt(filters.maxCredits);

      const response = await userService.getAllUnGraduateStudentsPaginated(
        filterParams,
        currentPage,
        pageSize,
        sortBy,
        sortDirection
      );

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

      if (studentsData.length === 0 && currentPage === 1) {
        toast.info('No eligible students found for promotion');
      }
    } catch (error) {
      console.error('Failed to load students:', error);
      toast.error(error?.errorMessage || 'Failed to load students');
      setStudents([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, sortBy, sortDirection, filters]);

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

  const handlePromoteStudent = async student => {
    if (
      !window.confirm(
        `Are you sure you want to promote ${student.displayName} (${student.academicCode}) to the next study year?`
      )
    )
      return;

    setPromotingId(student.id);
    try {
      const res = await userStudyYearService.promoteStudent(
        student.academicCode
      );
      toast.success(
        res?.message ||
          res?.data?.message ||
          `${student.displayName} promoted successfully!`
      );
      // Refresh the list
      loadUngraduatedStudents();
    } catch (err) {
      toast.error(
        err?.errorMessage || err?.message || 'Failed to promote student'
      );
    } finally {
      setPromotingId(null);
    }
  };

  const handlePromoteAll = async () => {
    if (
      !window.confirm(
        'Are you sure you want to promote ALL eligible students to the next study year? This action cannot be undone.'
      )
    )
      return;

    setPromoteAllLoading(true);
    try {
      const res = await userStudyYearService.promoteAll();
      toast.success(
        res?.message ||
          res?.data?.message ||
          'All eligible students promoted successfully!'
      );
      // Refresh the list
      setCurrentPage(1);
      await loadUngraduatedStudents();
    } catch (err) {
      toast.error(
        err?.errorMessage || err?.message || 'Failed to promote students'
      );
    } finally {
      setPromoteAllLoading(false);
    }
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

  // Get level display name
  const getLevelDisplay = level => {
    return LEVEL_LABELS[level] || level || 'N/A';
  };

  // Get level badge color
  const getLevelBadgeColor = level => {
    switch (level) {
      case 'Preparatory_Year':
        return 'badge-info';
      case 'First_Year':
        return 'badge-success';
      case 'Second_Year':
        return 'badge-warning';
      case 'Third_Year':
        return 'badge-danger';
      case 'Fourth_Year':
        return 'badge-purple';
      default:
        return 'badge-neutral';
    }
  };

  const getGPAStatus = gpa => {
    if (!gpa) return 'neutral';
    if (gpa >= 3.5) return 'success';
    if (gpa >= 2.5) return 'warning';
    if (gpa >= 2.0) return 'info';
    return 'danger';
  };

  // Check if any filter is applied
  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>
            <FiArrowUp />
            Promote Students
          </h1>
          <p>Promote eligible students to the next study year</p>
        </div>
        <div className="header-actions">
          <button
            className={`btn ${hasActiveFilters ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter />
            Filters
            {hasActiveFilters && <span className="filter-dot"></span>}
          </button>
          <button
            className="btn btn-promote-all"
            onClick={handlePromoteAll}
            disabled={
              promoteAllLoading ||
              (pagination?.totalCount || students.length) === 0
            }
          >
            {promoteAllLoading ? (
              <>
                <FiLoader className="spin" /> Promoting...
              </>
            ) : (
              <>
                <FiArrowUp /> Promote All (
                {pagination?.totalCount || students.length})
              </>
            )}
          </button>
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
            {/* Gender */}
            <FilterSelect
              label="Gender"
              value={filters.gender}
              onChange={val => handleFilterChange('gender', val)}
              options={genderFilterOptions}
              placeholder="All Genders"
              icon={<FiUser size={13} />}
            />

            {/* Level */}
            <FilterSelect
              label="Level"
              value={filters.level}
              onChange={val => handleFilterChange('level', val)}
              options={levelFilterOptions}
              placeholder="All Levels"
              icon={<FiBook size={13} />}
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
                placeholder="0"
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
              {filters.gender && (
                <span className="badge badge-info">Gender: {filters.gender}</span>
              )}
              {filters.level && (
                <span className="badge badge-info">
                  Level: {getLevelDisplay(filters.level)}
                </span>
              )}
              {filters.departmentId && (
                <span className="badge badge-info">
                  Dept: {departments.find(d => d.id === parseInt(filters.departmentId))?.name}
                </span>
              )}
              {filters.academicCode && (
                <span className="badge badge-info">Code: {filters.academicCode}</span>
              )}
              {filters.specialization && (
                <span className="badge badge-info">Spec: {filters.specialization}</span>
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
          {pagination?.totalCount || students.length} eligible student
          {(pagination?.totalCount || students.length) !== 1 ? 's' : ''} found
        </span>

        <div className="results-actions">
          <SortMenu
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
            sortOptions={[
              { value: 'DisplayName', label: 'Name' },
              { value: 'AcademicCode', label: 'Academic Code' },
              { value: 'Level', label: 'Level' },
              { value: 'Gender', label: 'Gender' },
              { value: 'TotalGPA', label: 'GPA' },
              { value: 'TotalCredits', label: 'Credits' },
            ]}
            isLoading={loading}
          />
          {loading && (
            <span className="loading-indicator">
              <FiLoader className="spin" /> Loading...
            </span>
          )}
        </div>
      </div>

      {/* Facebook-style Cards Grid */}
      {students.length === 0 && !loading ? (
        <div className="empty-state-card">
          <FiUsers size={48} />
          <h3>No eligible students found</h3>
          <p>
            {hasActiveFilters
              ? 'Try adjusting your filters to see more students'
              : 'All students have been promoted or are already graduated'}
          </p>
          {hasActiveFilters && (
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
                  <span className={`level-badge ${getLevelBadgeColor(student.level)}`}>
                    {getLevelDisplay(student.level)}
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
                        <span className="info-label">Gender:</span> {student.gender}
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

              {/* Facebook-style action buttons with prominent Promote button */}
              <div className="card-actions">
                <button
                  className="action-btn view-btn"
                  onClick={() => setSelectedStudent(student)}
                  title="View Details"
                >
                  <FiEye size={16} />
                  <span>View</span>
                </button>
                <button
                  className="action-btn promote-btn"
                  onClick={() => handlePromoteStudent(student)}
                  disabled={promotingId === student.id}
                >
                  {promotingId === student.id ? (
                    <>
                      <FiLoader className="spin" size={16} />
                      <span>Promoting...</span>
                    </>
                  ) : (
                    <>
                      <FiArrowUp size={16} />
                      <span>Promote</span>
                    </>
                  )}
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

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div
            className="modal"
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Student Details</h2>
              <button className="modal-close" onClick={() => setSelectedStudent(null)}>
                <FiX size={20} />
              </button>
            </div>

            <div className="modal-content">
              <div className="modal-profile-section">
                {/* Profile Picture */}
                <div
                  className="modal-profile-picture"
                  style={{ backgroundColor: getProfileColor(selectedStudent.gender, selectedStudent.displayName) }}
                >
                  {selectedStudent.profilePicture ? (
                    <img
                      src={selectedStudent.profilePicture}
                      alt={selectedStudent.displayName}
                    />
                  ) : (
                    <span className="modal-initials">
                      {getInitials(selectedStudent.displayName)}
                    </span>
                  )}
                </div>

                {/* Basic Info */}
                <div className="modal-basic-info">
                  <h3>{selectedStudent.displayName}</h3>
                  <p className="modal-username">@{selectedStudent.userName}</p>
                  <div className="modal-roles">
                    {selectedStudent.roles?.map(role => (
                      <span key={role} className="badge badge-info">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-details-grid">
                <div className="detail-item">
                  <label>Academic Code</label>
                  <p><strong>{selectedStudent.academicCode}</strong></p>
                </div>

                <div className="detail-item">
                  <label>Email</label>
                  <p>{selectedStudent.email}</p>
                </div>

                <div className="detail-item">
                  <label>Phone Number</label>
                  <p>{selectedStudent.phoneNumber || 'N/A'}</p>
                </div>

                <div className="detail-item">
                  <label>Department</label>
                  <p>{selectedStudent.department || 'N/A'}</p>
                </div>

                <div className="detail-item">
                  <label>Current Level</label>
                  <p>
                    <span className={`badge ${getLevelBadgeColor(selectedStudent.level)}`}>
                      {getLevelDisplay(selectedStudent.level)}
                    </span>
                  </p>
                </div>

                <div className="detail-item">
                  <label>Gender</label>
                  <p>
                    <span className={`badge ${selectedStudent.gender === 'Male' ? 'badge-info' : 'badge-pink'}`}>
                      {selectedStudent.gender}
                    </span>
                  </p>
                </div>

                <div className="detail-item">
                  <label>Specialization</label>
                  <p>{selectedStudent.specialization || 'N/A'}</p>
                </div>

                <div className="detail-item">
                  <label>Total GPA</label>
                  <p className={getGPAStatus(selectedStudent.totalGPA)}>
                    {selectedStudent.totalGPA?.toFixed(2) || '0.00'}
                  </p>
                </div>

                <div className="detail-item">
                  <label>Total Credits</label>
                  <p>{selectedStudent.totalCredits || '0'}</p>
                </div>

                <div className="detail-item">
                  <label>Allowed Credits</label>
                  <p>{selectedStudent.allowedCredits || '0'}</p>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setSelectedStudent(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-promote"
                onClick={() => {
                  handlePromoteStudent(selectedStudent);
                  setSelectedStudent(null);
                }}
                disabled={promotingId === selectedStudent.id}
              >
                {promotingId === selectedStudent.id ? (
                  <>
                    <FiLoader className="spin" /> Promoting...
                  </>
                ) : (
                  <>
                    <FiArrowUp /> Promote Student
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .page-container {
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
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

        .header-actions {
          display: flex;
          gap: 12px;
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

        .btn-promote-all {
          background: #10b981;
          color: white;
        }

        .btn-promote-all:hover:not(:disabled) {
          background: #059669;
        }

        .btn-promote-all:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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
          flex-wrap: wrap;
          gap: 12px;
        }

        .results-count {
          background: #f1f5f9;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 14px;
          color: #334155;
          font-weight: 500;
        }

        .results-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .loading-indicator {
          color: #64748b;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
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
          grid-template-columns: 1fr 2fr; /* Promote button is wider */
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

        .action-btn:hover:not(:disabled) {
          background: #f8fafc;
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .view-btn {
          color: #64748b;
        }

        .view-btn:hover:not(:disabled) {
          color: #2563eb;
          background: #eff6ff;
        }

        .promote-btn {
          background: #10b981;
          color: white;
        }

        .promote-btn:hover:not(:disabled) {
          background: #059669;
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

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease;
        }

        .modal {
          background: white;
          border-radius: 20px;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #eef2f6;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #1e293b;
        }

        .modal-close {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 4px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .modal-close:hover {
          background: #f1f5f9;
          color: #475569;
        }

        .modal-content {
          padding: 24px;
        }

        .modal-profile-section {
          display: flex;
          gap: 24px;
          margin-bottom: 24px;
        }

        .modal-profile-picture {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 32px;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          flex-shrink: 0;
        }

        .modal-profile-picture img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }

        .modal-initials {
          font-size: 36px;
          font-weight: 600;
        }

        .modal-basic-info {
          flex: 1;
        }

        .modal-basic-info h3 {
          margin: 0 0 4px 0;
          font-size: 24px;
          font-weight: 600;
          color: #1e293b;
        }

        .modal-username {
          margin: 0 0 12px 0;
          color: #64748b;
          font-size: 16px;
        }

        .modal-roles {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .modal-details-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .detail-item label {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #94a3b8;
        }

        .detail-item p {
          margin: 0;
          font-size: 15px;
          color: #1e293b;
        }

        .detail-item p.success {
          color: #10b981;
          font-weight: 600;
        }

        .detail-item p.warning {
          color: #f59e0b;
          font-weight: 600;
        }

        .detail-item p.danger {
          color: #ef4444;
          font-weight: 600;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 20px 24px;
          border-top: 1px solid #eef2f6;
        }

        .btn-promote {
          background: #10b981;
          color: white;
        }

        .btn-promote:hover:not(:disabled) {
          background: #059669;
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

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .spin {
          animation: spin 1s linear infinite;
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