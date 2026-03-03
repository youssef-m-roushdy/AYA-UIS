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
  const pageSize = 10; // Fixed page size
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

  // Check if any filter is applied
  const hasActiveFilters = Object.values(filters).some(value => value !== '');

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

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiArrowUp />
            Promote Students
          </h1>
          <p>Promote eligible students to the next study year</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={`btn ${hasActiveFilters ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter />
            Filters
            {hasActiveFilters && (
              <span className="badge badge-primary" style={{ marginLeft: 8 }}>
                •
              </span>
            )}
          </button>
          <button
            className="btn btn-primary"
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
              Filter Students
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

            {/* Specialization — plain text input */}
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
                Specialization
              </span>
              <input
                type="text"
                placeholder="Enter specialization..."
                value={filters.specialization}
                onChange={e =>
                  handleFilterChange('specialization', e.target.value)
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

          {/* Additional numeric filters below */}
          <div
            style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              alignItems: 'flex-end',
              marginTop: 16,
            }}
          >
            {/* Min GPA */}
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
                Min GPA
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                max="4"
                placeholder="0.0"
                value={filters.minGPA}
                onChange={e => handleFilterChange('minGPA', e.target.value)}
                style={{
                  padding: '0 12px',
                  height: '38px',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '13.5px',
                  fontFamily: "'DM Sans', sans-serif",
                  outline: 'none',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                  minWidth: '120px',
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

            {/* Max GPA */}
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
                Max GPA
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                max="4"
                placeholder="4.0"
                value={filters.maxGPA}
                onChange={e => handleFilterChange('maxGPA', e.target.value)}
                style={{
                  padding: '0 12px',
                  height: '38px',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '13.5px',
                  fontFamily: "'DM Sans', sans-serif",
                  outline: 'none',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                  minWidth: '120px',
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

            {/* Min Credits */}
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
                Min Credits
              </span>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={filters.minCredits}
                onChange={e => handleFilterChange('minCredits', e.target.value)}
                style={{
                  padding: '0 12px',
                  height: '38px',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '13.5px',
                  fontFamily: "'DM Sans', sans-serif",
                  outline: 'none',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                  minWidth: '120px',
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

            {/* Max Credits */}
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
                Max Credits
              </span>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={filters.maxCredits}
                onChange={e => handleFilterChange('maxCredits', e.target.value)}
                style={{
                  padding: '0 12px',
                  height: '38px',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '13.5px',
                  fontFamily: "'DM Sans', sans-serif",
                  outline: 'none',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                  minWidth: '120px',
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
          {pagination?.totalCount || students.length} eligible student
          {(pagination?.totalCount || students.length) !== 1 ? 's' : ''} found
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SortMenu
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
            sortOptions={[
              { value: 'DisplayName', label: 'Name' },
              { value: 'AcademicCode', label: 'Academic Code' },
              { value: 'Level', label: 'Level' },
              { value: 'Gender', label: 'Gender' },
            ]}
            isLoading={loading}
          />
          {loading && (
            <span style={{ color: 'var(--text-light)' }}>
              <FiLoader className="spin" /> Loading...
            </span>
          )}
        </div>
      </div>

      {/* Students Table */}
      <div className="card">
        {students.length === 0 && !loading ? (
          <div
            className="empty-state"
            style={{ padding: '40px 20px', textAlign: 'center' }}
          >
            <FiUsers size={40} style={{ opacity: 0.3, marginBottom: 16 }} />
            <h3>No eligible students found</h3>
            <p style={{ color: 'var(--text-light)' }}>
              {hasActiveFilters
                ? 'Try adjusting your filters to see more students'
                : 'All students have been promoted or are already graduated'}
            </p>
            {hasActiveFilters && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={clearFilters}
                style={{ marginTop: 8 }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Profile</th>

                    <th>Name</th>
                    <th>Academic Code</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Department</th>
                    <th>Current Level</th>
                    <th>Gender</th>
                    <th>Roles</th>
                    <th style={{ width: 160 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student.id}>
                      <td>
                        <div className="student-avatar">
                          {student.profilePicture ? (
                            <img
                              src={student.profilePicture}
                              alt={student.displayName}
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                objectFit: 'cover',
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                backgroundColor: '#e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1rem',
                                fontWeight: 600,
                                color: '#4a5568',
                              }}
                            >
                              {student.displayName?.charAt(0) || 'U'}
                            </div>
                          )}
                        </div>
                      </td>

                      <td>
                        <span style={{ whiteSpace: 'nowrap' }}>
                          <strong>{student.displayName}</strong>
                        </span>
                      </td>
                      <td>
                        <strong>{student.academicCode}</strong>
                      </td>
                      <td>{student.userName}</td>
                      <td>{student.email}</td>
                      <td>{student.phoneNumber}</td>
                      <td>
                        <span className="badge badge-neutral">
                          {student.department || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${getLevelBadgeColor(student.level)}`}
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          {getLevelDisplay(student.level)}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${student.gender === 'Male' ? 'badge-info' : 'badge-pink'}`}
                        >
                          {student.gender || '—'}
                        </span>
                      </td>
                      <td>
                        <div
                          style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}
                        >
                          {student.roles?.map(role => (
                            <span
                              key={role}
                              className={`badge ${getRoleBadgeColor(role)}`}
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setSelectedStudent(student)}
                            title="View Details"
                          >
                            <FiEye size={14} />
                          </button>
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handlePromoteStudent(student)}
                            disabled={promotingId === student.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              minWidth: 80,
                            }}
                          >
                            {promotingId === student.id ? (
                              <>
                                <FiLoader className="spin" size={14} />
                                <span>...</span>
                              </>
                            ) : (
                              <>
                                <FiArrowUp size={14} />
                                Promote
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Component */}
            {students.length > 0 && (
              <div style={{ marginTop: 16 }}>
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
          </>
        )}
      </div>

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div
            className="modal"
            style={{ maxWidth: 600 }}
            onClick={e => e.stopPropagation()}
          >
            <h2>Student Details</h2>

            <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
              {/* Profile Picture */}
              <div>
                {selectedStudent.profilePicture ? (
                  <img
                    src={selectedStudent.profilePicture}
                    alt={selectedStudent.displayName}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      backgroundColor: '#e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2.5rem',
                      fontWeight: 600,
                      color: '#4a5568',
                    }}
                  >
                    {selectedStudent.displayName?.charAt(0) || 'U'}
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div style={{ flex: 1 }}>
                <h3 style={{ marginBottom: 8 }}>
                  {selectedStudent.displayName}
                </h3>
                <p style={{ color: 'var(--text-light)', marginBottom: 4 }}>
                  @{selectedStudent.userName}
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {selectedStudent.roles?.map(role => (
                    <span
                      key={role}
                      className={`badge ${getRoleBadgeColor(role)}`}
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 16,
              }}
            >
              <div>
                <label
                  style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}
                >
                  Academic Code
                </label>
                <p>
                  <strong>{selectedStudent.academicCode}</strong>
                </p>
              </div>

              <div>
                <label
                  style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}
                >
                  Email
                </label>
                <p>{selectedStudent.email}</p>
              </div>

              <div>
                <label
                  style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}
                >
                  Phone Number
                </label>
                <p>{selectedStudent.phoneNumber}</p>
              </div>

              <div>
                <label
                  style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}
                >
                  Department
                </label>
                <p>{selectedStudent.department || 'N/A'}</p>
              </div>

              <div>
                <label
                  style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}
                >
                  Level
                </label>
                <p>
                  <span
                    className={`badge ${getLevelBadgeColor(selectedStudent.level)}`}
                  >
                    {getLevelDisplay(selectedStudent.level)}
                  </span>
                </p>
              </div>

              <div>
                <label
                  style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}
                >
                  Gender
                </label>
                <p>
                  <span
                    className={`badge ${selectedStudent.gender === 'Male' ? 'badge-info' : 'badge-pink'}`}
                  >
                    {selectedStudent.gender}
                  </span>
                </p>
              </div>
            </div>

            <div className="form-actions" style={{ marginTop: 24 }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setSelectedStudent(null)}
              >
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

        .btn-success {
          background-color: #10b981;
          color: white;
        }

        .btn-success:hover:not(:disabled) {
          background-color: #059669;
        }

        .btn-success:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .student-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}
