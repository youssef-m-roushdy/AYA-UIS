import React, { useEffect, useState } from 'react';
import {
  FiPlus,
  FiUsers,
  FiSearch,
  FiFilter,
  FiX,
  FiEye,
} from 'react-icons/fi';
import { userService } from '../../services/otherServices';
import authService from '../../services/authService';
import departmentService from '../../services/departmentService';
import { LEVEL_LABELS, GENDER_OPTIONS } from '../../constants';
import { toast } from 'react-toastify';

export default function Students() {
  const [departments, setDepartments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

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
  });

  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({
    email: '',
    password: '',
    userName: '',
    phoneNumber: '',
    displayName: '',
    academic_Code: '',
    gender: 'Male',
    departmentId: '',
  });

  useEffect(() => {
    loadDepartments();
    searchStudents(); // Load initial students
  }, []);

  const loadDepartments = async () => {
    try {
      const res = await departmentService.getAll();
      setDepartments(res?.data || res || []);
    } catch (error) {
      console.error('Failed to load departments:', error);
    }
  };

  const searchStudents = async () => {
    setLoading(true);
    try {
      // Build query params - only include non-empty values
      const params = {};

      if (filters.academicCode) params.Academic_Code = filters.academicCode;
      if (filters.gender) params.Gender = filters.gender;
      if (filters.level) params.Level = filters.level;
      if (filters.departmentId)
        params.DepartmentId = parseInt(filters.departmentId);
      if (filters.specialization)
        params.Specialization = filters.specialization;
      if (filters.minGPA) params.TotalGPA = parseFloat(filters.minGPA);
      if (filters.maxGPA) params.TotalGPA = parseFloat(filters.maxGPA);
      if (filters.minCredits)
        params.TotalCredits = parseInt(filters.minCredits);
      if (filters.maxCredits)
        params.AllowedCredits = parseInt(filters.maxCredits);

      const response = await userService.getAllStudents(params);

      // Handle different response structures
      let studentsData = [];
      if (response?.data) {
        studentsData = response.data;
      } else if (Array.isArray(response)) {
        studentsData = response;
      } else {
        studentsData = response || [];
      }

      setStudents(studentsData);

      if (studentsData.length === 0) {
        toast.info('No students found matching the criteria');
      }
    } catch (error) {
      console.error('Failed to search students:', error);
      toast.error(error?.errorMessage || 'Failed to search students');
      setStudents([]);
    } finally {
      setLoading(false);
    }
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

  const register = async e => {
    e.preventDefault();
    try {
      const deptId = parseInt(form.departmentId);
      const { departmentId, ...body } = form;
      await authService.registerStudent(deptId, body);
      toast.success('Student registered successfully');
      setModal(null);
      searchStudents(); // Refresh the list

      // Reset form
      setForm({
        email: '',
        password: '',
        userName: '',
        phoneNumber: '',
        displayName: '',
        academic_Code: '',
        gender: 'Male',
        departmentId: '',
      });
    } catch (err) {
      toast.error(
        err?.errorMessage || err?.errors?.join(', ') || 'Registration failed'
      );
    }
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
      case 'Graduate':
        return 'badge-neutral';
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

  // Check if any filter is applied
  const hasActiveFilters = Object.values(filters).some(value => value !== '');

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
            <FiUsers />
            Students
          </h1>
          <p>Search and manage students</p>
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
            onClick={() => setModal('register')}
          >
            <FiPlus /> Register Student
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
              Search Filters
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
                placeholder="Enter academic code..."
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
                {Object.entries(LEVEL_LABELS).map(([value, label]) => (
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
            <button
              className="btn btn-primary"
              onClick={searchStudents}
              disabled={loading}
            >
              <FiSearch /> {loading ? 'Searching...' : 'Apply Filters'}
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
          {students.length} student{students.length !== 1 ? 's' : ''} found
        </span>
        {loading && (
          <span style={{ color: 'var(--text-light)' }}>Loading...</span>
        )}
      </div>

      {/* Students List */}
      <div className="card">
        {students.length === 0 && !loading ? (
          <div
            className="empty-state"
            style={{ padding: '40px 20px', textAlign: 'center' }}
          >
            <FiUsers size={40} style={{ opacity: 0.3, marginBottom: 16 }} />
            <h3>No students found</h3>
            <p style={{ color: 'var(--text-light)' }}>
              {hasActiveFilters
                ? 'Try adjusting your filters or clear them to see all students'
                : 'Get started by registering a new student'}
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
                  <th>Level</th>
                  <th>Gender</th>
                  <th>Roles</th>
                  <th>Actions</th>
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
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setSelectedStudent(student)}
                        title="View Details"
                      >
                        <FiEye /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                  <strong>{selectedStudent.academic_Code}</strong>
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

      {/* Register Modal (keep existing) */}
      {modal === 'register' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div
            className="modal"
            style={{ maxWidth: 600 }}
            onClick={e => e.stopPropagation()}
          >
            <h2>Register New Student</h2>
            <form onSubmit={register}>
              <div className="form-row">
                <div className="form-group">
                  <label>Display Name *</label>
                  <input
                    className="form-control"
                    value={form.displayName}
                    onChange={e =>
                      setForm({ ...form, displayName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Username *</label>
                  <input
                    className="form-control"
                    value={form.userName}
                    onChange={e =>
                      setForm({ ...form, userName: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    className="form-control"
                    value={form.password}
                    onChange={e =>
                      setForm({ ...form, password: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Academic Code *</label>
                  <input
                    className="form-control"
                    value={form.academic_Code}
                    onChange={e =>
                      setForm({ ...form, academic_Code: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    className="form-control"
                    value={form.phoneNumber}
                    onChange={e =>
                      setForm({ ...form, phoneNumber: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="form-row">
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
                    <option value="">Select Department</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select
                    className="form-control"
                    value={form.gender}
                    onChange={e => setForm({ ...form, gender: e.target.value })}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Register Student
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

        .student-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}
