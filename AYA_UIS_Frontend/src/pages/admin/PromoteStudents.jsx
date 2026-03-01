import React, { useState, useEffect } from 'react';
import {
  FiArrowUp,
  FiUsers,
  FiFilter,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiLoader,
  FiEye,
} from 'react-icons/fi';
import { userService } from '../../services/otherServices';
import { userStudyYearService } from '../../services/otherServices';
import departmentService from '../../services/departmentService';
import { LEVEL_LABELS, GENDER_OPTIONS } from '../../constants';
import { toast } from 'react-toastify';

export default function PromoteStudents() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [promotingId, setPromotingId] = useState(null);
  const [promoteAllLoading, setPromoteAllLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(10);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
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

  useEffect(() => {
    loadDepartments();
    loadUngraduatedStudents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [students, filters]);

  const loadDepartments = async () => {
    try {
      const res = await departmentService.getAll();
      setDepartments(res?.data || res || []);
    } catch (error) {
      console.error('Failed to load departments:', error);
    }
  };

  const loadUngraduatedStudents = async () => {
    setLoading(true);
    try {
      const response = await userService.getUngraduatedStudents();

      // Handle different response structures
      let studentsData = [];
      if (response?.data) {
        studentsData = response.data;
      } else if (Array.isArray(response)) {
        studentsData = response;
      } else {
        studentsData = response || [];
      }

      // Filter out any graduate students manually if API doesn't exclude them
      studentsData = studentsData.filter(s => s.level !== 'Graduate');

      setStudents(studentsData);
      setFilteredStudents(studentsData);

      if (studentsData.length === 0) {
        toast.info('No eligible students found for promotion');
      }
    } catch (error) {
      console.error('Failed to load students:', error);
      toast.error(error?.errorMessage || 'Failed to load students');
      setStudents([]);
      setFilteredStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...students];

    // Apply text filters
    if (filters.academicCode) {
      filtered = filtered.filter(s =>
        s.academicCode
          ?.toLowerCase()
          .includes(filters.academicCode.toLowerCase())
      );
    }

    if (filters.gender) {
      filtered = filtered.filter(s => s.gender === filters.gender);
    }

    if (filters.level) {
      filtered = filtered.filter(s => s.level === filters.level);
    }

    if (filters.departmentId) {
      filtered = filtered.filter(s => {
        // Handle both department object and departmentId
        const deptId = s.departmentId || s.department?.id;
        return deptId === parseInt(filters.departmentId);
      });
    }

    if (filters.specialization) {
      filtered = filtered.filter(s =>
        s.specialization
          ?.toLowerCase()
          .includes(filters.specialization.toLowerCase())
      );
    }

    // Apply numeric filters (if your API returns these fields)
    if (filters.minGPA) {
      filtered = filtered.filter(
        s => (s.totalGPA || 0) >= parseFloat(filters.minGPA)
      );
    }

    if (filters.maxGPA) {
      filtered = filtered.filter(
        s => (s.totalGPA || 0) <= parseFloat(filters.maxGPA)
      );
    }

    if (filters.minCredits) {
      filtered = filtered.filter(
        s => (s.totalCredits || 0) >= parseInt(filters.minCredits)
      );
    }

    if (filters.maxCredits) {
      filtered = filtered.filter(
        s => (s.totalCredits || 0) <= parseInt(filters.maxCredits)
      );
    }

    setFilteredStudents(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
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
      loadUngraduatedStudents();
    } catch (err) {
      toast.error(
        err?.errorMessage || err?.message || 'Failed to promote students'
      );
    }
    setPromoteAllLoading(false);
  };

  // Pagination logic
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const paginate = pageNumber => setCurrentPage(pageNumber);

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
            disabled={promoteAllLoading || filteredStudents.length === 0}
          >
            {promoteAllLoading ? (
              <>
                <FiLoader className="spin" /> Promoting...
              </>
            ) : (
              <>
                <FiArrowUp /> Promote All ({filteredStudents.length})
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
              marginBottom: 20,
            }}
          >
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
              Filter Students
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
              <label>Academic Code</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter code..."
                value={filters.academicCode}
                onChange={e =>
                  handleFilterChange('academicCode', e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Gender</label>
              <select
                className="form-control"
                value={filters.gender}
                onChange={e => handleFilterChange('gender', e.target.value)}
              >
                <option value="">All Genders</option>
                {GENDER_OPTIONS?.map(g => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Level</label>
              <select
                className="form-control"
                value={filters.level}
                onChange={e => handleFilterChange('level', e.target.value)}
              >
                <option value="">All Levels</option>
                {Object.entries(LEVEL_LABELS)
                  .filter(([value]) => value !== 'Graduate')
                  .map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
              </select>
            </div>

            <div className="form-group">
              <label>Department</label>
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

            <div className="form-group">
              <label>Specialization</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter specialization..."
                value={filters.specialization}
                onChange={e =>
                  handleFilterChange('specialization', e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Min GPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="4"
                className="form-control"
                placeholder="0.0"
                value={filters.minGPA}
                onChange={e => handleFilterChange('minGPA', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Max GPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="4"
                className="form-control"
                placeholder="4.0"
                value={filters.maxGPA}
                onChange={e => handleFilterChange('maxGPA', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Min Credits</label>
              <input
                type="number"
                min="0"
                className="form-control"
                placeholder="0"
                value={filters.minCredits}
                onChange={e => handleFilterChange('minCredits', e.target.value)}
              />
            </div>
          </div>

          <div
            style={{
              marginTop: 20,
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <button className="btn btn-primary" onClick={applyFilters}>
              Apply Filters
            </button>
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
          {filteredStudents.length} eligible student
          {filteredStudents.length !== 1 ? 's' : ''} found
        </span>
        {loading && (
          <span style={{ color: 'var(--text-light)' }}>
            <FiLoader className="spin" /> Loading...
          </span>
        )}
      </div>

      {/* Students Table */}
      <div className="card">
        {filteredStudents.length === 0 && !loading ? (
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
                    <th>Academic Code</th>
                    <th>Name</th>
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
                  {currentStudents.map(student => (
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
                        <strong>{student.academicCode}</strong>
                      </td>
                      <td>{student.displayName}</td>
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 8,
                  marginTop: 20,
                  padding: '16px 0',
                }}
              >
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <FiChevronLeft />
                </button>

                <span style={{ fontSize: '0.875rem' }}>
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <FiChevronRight />
                </button>
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
