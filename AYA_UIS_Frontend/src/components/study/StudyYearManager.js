import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiPlus,
  FiCalendar,
  FiDollarSign,
  FiChevronRight,
  FiEdit2,
  FiTrash2,
  FiSave,
  FiX,
  FiLayers,
  FiArrowLeft,
} from 'react-icons/fi';
import { studyYearService, semesterService, feeService } from '../../services/otherServices';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import SemesterList from './SemesterList';
import FeeManager from './FeeManager';

const SEMESTER_LABELS = {
  First_Semester: 'First Semester',
  Second_Semester: 'Second Semester',
  Summer: 'Summer Semester',
};

export default function StudyYearManager({ mode = 'admin', studyYearId = null }) {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const isAdmin = hasRole('Admin');
  const isStudent = !isAdmin;

  const [studyYears, setStudyYears] = useState([]);
  const [currentStudyYear, setCurrentStudyYear] = useState(null);
  const [semesters, setSemesters] = useState({});
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [expandedYear, setExpandedYear] = useState(null);

  // Forms
  const [yearForm, setYearForm] = useState({
    startYear: new Date().getFullYear(),
    endYear: new Date().getFullYear() + 1,
    isCurrent: false,
  });

  const [semForm, setSemForm] = useState({
    title: 'First_Semester',
    startDate: '',
    endDate: '',
    studyYearId: null,
  });

  // Load data based on mode
  useEffect(() => {
    if (mode === 'admin') {
      loadAllStudyYears();
    } else if (mode === 'student' && studyYearId) {
      loadStudentStudyYearData();
    }
  }, [mode, studyYearId]);

  const loadAllStudyYears = async () => {
    setLoading(true);
    try {
      const res = await studyYearService.getAll();
      setStudyYears(res?.data || res || []);
    } catch (e) {
      toast.error('Failed to load study years');
    }
    setLoading(false);
  };

  const loadStudentStudyYearData = async () => {
    setLoading(true);
    try {
      // Load study year details
      const yearRes = await studyYearService.getById(studyYearId);
      setCurrentStudyYear(yearRes?.data || yearRes);

      // Load semesters
      const semRes = await semesterService.getByYear(studyYearId);
      setSemesters({ [studyYearId]: semRes?.data || semRes || [] });

      // Load fees for student's department
      if (user?.departmentId) {
        try {
          const feeRes = await feeService.getByDeptAndYear(
            user.departmentId,
            studyYearId
          );
          setFees(feeRes?.data || feeRes || []);
        } catch {
          setFees([]);
        }
      }
    } catch (e) {
      toast.error('Failed to load study year details');
    }
    setLoading(false);
  };

  const loadSemesters = async yearId => {
    try {
      const res = await semesterService.getByYear(yearId);
      setSemesters(prev => ({ ...prev, [yearId]: res?.data || res || [] }));
    } catch (e) {
      toast.error('Failed to load semesters');
    }
  };

  const toggleExpand = yearId => {
    if (expandedYear === yearId) {
      setExpandedYear(null);
    } else {
      setExpandedYear(yearId);
      if (!semesters[yearId]) loadSemesters(yearId);
    }
  };

  // Study Year CRUD
  const createYear = async e => {
    e.preventDefault();
    try {
      await studyYearService.create({
        startYear: parseInt(yearForm.startYear),
        endYear: parseInt(yearForm.endYear),
        isCurrent: yearForm.isCurrent,
      });
      toast.success('Study year created successfully');
      setModal(null);
      resetYearForm();
      loadAllStudyYears();
    } catch (err) {
      toast.error(err?.errorMessage || 'Failed to create study year');
    }
  };

  const updateYear = async e => {
    e.preventDefault();
    try {
      await studyYearService.update(editingItem.id, {
        startYear: parseInt(yearForm.startYear),
        endYear: parseInt(yearForm.endYear),
        isCurrent: yearForm.isCurrent,
      });
      toast.success('Study year updated successfully');
      setModal(null);
      setEditingItem(null);
      resetYearForm();
      loadAllStudyYears();
    } catch (err) {
      toast.error(err?.errorMessage || 'Failed to update study year');
    }
  };

  const deleteYear = async id => {
    if (!window.confirm('Are you sure you want to delete this study year? This will also delete all associated semesters and fees.'))
      return;
    
    try {
      await studyYearService.delete(id);
      toast.success('Study year deleted successfully');
      loadAllStudyYears();
    } catch (err) {
      toast.error(err?.errorMessage || 'Failed to delete study year');
    }
  };

  // Semester CRUD
  const createSemester = async e => {
    e.preventDefault();
    try {
      await semesterService.create(semForm.studyYearId, {
        title: semForm.title,
        startDate: semForm.startDate,
        endDate: semForm.endDate,
      });
      toast.success('Semester created successfully');
      setModal(null);
      resetSemForm();
      loadSemesters(semForm.studyYearId);
      if (mode === 'student' && studyYearId) {
        loadStudentStudyYearData();
      }
    } catch (err) {
      toast.error(err?.errorMessage || 'Failed to create semester');
    }
  };

  const updateSemester = async e => {
    e.preventDefault();
    try {
      await semesterService.update(editingItem.id, {
        title: semForm.title,
        startDate: semForm.startDate,
        endDate: semForm.endDate,
      });
      toast.success('Semester updated successfully');
      setModal(null);
      setEditingItem(null);
      resetSemForm();
      loadSemesters(semForm.studyYearId);
      if (mode === 'student' && studyYearId) {
        loadStudentStudyYearData();
      }
    } catch (err) {
      toast.error(err?.errorMessage || 'Failed to update semester');
    }
  };

  const deleteSemester = async (id, yearId) => {
    if (!window.confirm('Are you sure you want to delete this semester?'))
      return;
    
    try {
      await semesterService.delete(id);
      toast.success('Semester deleted successfully');
      loadSemesters(yearId);
      if (mode === 'student' && studyYearId) {
        loadStudentStudyYearData();
      }
    } catch (err) {
      toast.error(err?.errorMessage || 'Failed to delete semester');
    }
  };

  // Fee CRUD
  const createFee = async feeData => {
    try {
      await feeService.create({
        ...feeData,
        studyYearId: mode === 'admin' ? feeData.studyYearId : studyYearId,
        departmentId: feeData.departmentId || user?.departmentId,
      });
      toast.success('Fee created successfully');
      if (mode === 'admin') {
        loadAllStudyYears();
      } else {
        loadStudentStudyYearData();
      }
    } catch (err) {
      toast.error(err?.errorMessage || 'Failed to create fee');
    }
  };

  const updateFee = async (id, feeData) => {
    try {
      await feeService.update(id, feeData);
      toast.success('Fee updated successfully');
      if (mode === 'admin') {
        loadAllStudyYears();
      } else {
        loadStudentStudyYearData();
      }
    } catch (err) {
      toast.error(err?.errorMessage || 'Failed to update fee');
    }
  };

  const deleteFee = async id => {
    if (!window.confirm('Are you sure you want to delete this fee?'))
      return;
    
    try {
      await feeService.delete(id);
      toast.success('Fee deleted successfully');
      if (mode === 'admin') {
        loadAllStudyYears();
      } else {
        loadStudentStudyYearData();
      }
    } catch (err) {
      toast.error(err?.errorMessage || 'Failed to delete fee');
    }
  };

  // Form helpers
  const resetYearForm = () => {
    setYearForm({
      startYear: new Date().getFullYear(),
      endYear: new Date().getFullYear() + 1,
      isCurrent: false,
    });
  };

  const resetSemForm = () => {
    setSemForm({
      title: 'First_Semester',
      startDate: '',
      endDate: '',
      studyYearId: null,
    });
  };

  const openEditYear = (year) => {
    setEditingItem(year);
    setYearForm({
      startYear: year.startYear,
      endYear: year.endYear,
      isCurrent: year.isCurrent || false,
    });
    setModal('year');
  };

  const openEditSemester = (semester, yearId) => {
    setEditingItem(semester);
    setSemForm({
      title: semester.title,
      startDate: semester.startDate?.split('T')[0] || '',
      endDate: semester.endDate?.split('T')[0] || '',
      studyYearId: yearId,
    });
    setModal('semester');
  };

  if (loading) {
    return (
      <div className="study-container">
        <div className="spinner" />
      </div>
    );
  }

  // Student Mode View
  if (mode === 'student' && studyYearId) {
    return (
      <div className="study-container">
        <div className="page-header">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate('/student/my-study-years')}
            style={{ marginBottom: 12 }}
          >
            <FiArrowLeft /> Back to Study Years
          </button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>
              <FiLayers style={{ marginRight: 8 }} />
              Study Year Details
            </h1>
          </div>
          <p style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginTop: 4 }}>
            <span>
              {currentStudyYear?.startYear} — {currentStudyYear?.endYear}
            </span>
            {currentStudyYear?.isCurrent && (
              <span className="badge badge-success">Current Year</span>
            )}
            {user?.departmentName && (
              <span className="badge badge-info">{user.departmentName}</span>
            )}
          </p>
        </div>

        <div className="study-tabs">
          {/* Semesters Section */}
          <div className="study-section">
            <div className="section-header">
              <h2>
                <FiCalendar /> Semesters
              </h2>
              <span className="badge badge-info">
                {semesters[studyYearId]?.length || 0} semesters
              </span>
            </div>
            <SemesterList
              semesters={semesters[studyYearId] || []}
              studyYearId={studyYearId}
              isAdmin={false}
              onEdit={(sem) => navigate(`/student/study-year/${studyYearId}/semester/${sem.id}/courses`)}
            />
          </div>

          {/* Fees Section */}
          <div className="study-section">
            <div className="section-header">
              <h2>
                <FiDollarSign /> Fees
              </h2>
              <span className="badge badge-info">{fees.length} fees</span>
            </div>
            <FeeManager
              fees={fees}
              studyYearId={studyYearId}
              departmentId={user?.departmentId}
              isAdmin={false}
              onEdit={() => {}} // Students can't edit fees
            />
          </div>
        </div>
      </div>
    );
  }

  // Admin Mode View
  return (
    <div className="study-container">
      <div className="page-header">
        <div>
          <h1>
            <FiCalendar style={{ marginRight: 8 }} />
            Study Years & Semesters
          </h1>
          <p>Manage academic years, semesters, and configure fees</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-primary" onClick={() => { resetYearForm(); setModal('year'); }}>
            <FiPlus /> New Study Year
          </button>
        </div>
      </div>

      {studyYears.length === 0 ? (
        <div className="card empty-state">
          <h3>No study years found</h3>
          <p>Create a new study year to get started.</p>
        </div>
      ) : (
        <div className="study-years-list">
          {studyYears.map(sy => (
            <div className="study-year-card" key={sy.id}>
              {/* Study year header */}
              <div className="year-header" onClick={() => toggleExpand(sy.id)}>
                <div className="year-info">
                  <div className="year-icon">
                    <FiCalendar />
                  </div>
                  <div>
                    <h3>
                      {sy.startYear} — {sy.endYear}
                    </h3>
                    <div className="year-meta">
                      <span>ID: {sy.id}</span>
                      {sy.isCurrent && (
                        <span className="badge badge-success">Current</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="year-actions">
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={e => {
                      e.stopPropagation();
                      openEditYear(sy);
                    }}
                    title="Edit Study Year"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={e => {
                      e.stopPropagation();
                      deleteYear(sy.id);
                    }}
                    title="Delete Study Year"
                  >
                    <FiTrash2 />
                  </button>
                  <button
                    className="btn btn-sm btn-accent"
                    onClick={e => {
                      e.stopPropagation();
                      setSemForm({ ...semForm, studyYearId: sy.id });
                      setModal('semester');
                    }}
                  >
                    <FiPlus /> Semester
                  </button>
                  <FiChevronRight
                    className={`chevron ${expandedYear === sy.id ? 'expanded' : ''}`}
                  />
                </div>
              </div>

              {/* Expanded content */}
              {expandedYear === sy.id && (
                <div className="year-expanded">
                  {/* Semesters */}
                  <div className="expanded-section">
                    <div className="section-header">
                      <h4>
                        <FiCalendar /> Semesters
                      </h4>
                      <span className="badge badge-info">
                        {semesters[sy.id]?.length || 0} semesters
                      </span>
                    </div>
                    <SemesterList
                      semesters={semesters[sy.id] || []}
                      studyYearId={sy.id}
                      isAdmin={true}
                      onEdit={(sem) => openEditSemester(sem, sy.id)}
                      onDelete={(id) => deleteSemester(id, sy.id)}
                    />
                  </div>

                  {/* Fees */}
                  <div className="expanded-section">
                    <div className="section-header">
                      <h4>
                        <FiDollarSign /> Fees
                      </h4>
                    </div>
                    <FeeManager
                      fees={fees.filter(f => f.studyYearId === sy.id)}
                      studyYearId={sy.id}
                      isAdmin={true}
                      onAdd={createFee}
                      onEdit={updateFee}
                      onDelete={deleteFee}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Study Year Modal */}
      {modal === 'year' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editingItem ? 'Edit Study Year' : 'Create Study Year'}</h2>
            <form onSubmit={editingItem ? updateYear : createYear}>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Year</label>
                  <input
                    type="number"
                    className="form-control"
                    value={yearForm.startYear}
                    onChange={e =>
                      setYearForm({ ...yearForm, startYear: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Year</label>
                  <input
                    type="number"
                    className="form-control"
                    value={yearForm.endYear}
                    onChange={e =>
                      setYearForm({ ...yearForm, endYear: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={yearForm.isCurrent}
                    onChange={e =>
                      setYearForm({ ...yearForm, isCurrent: e.target.checked })
                    }
                  />
                  Set as Current Study Year
                </label>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  <FiSave /> {editingItem ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setModal(null);
                    setEditingItem(null);
                    resetYearForm();
                  }}
                >
                  <FiX /> Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Semester Modal */}
      {modal === 'semester' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editingItem ? 'Edit Semester' : 'Create Semester'}</h2>
            <form onSubmit={editingItem ? updateSemester : createSemester}>
              <div className="form-group">
                <label>Study Year</label>
                <select
                  className="form-control"
                  value={semForm.studyYearId || ''}
                  onChange={e =>
                    setSemForm({
                      ...semForm,
                      studyYearId: parseInt(e.target.value),
                    })
                  }
                  required
                  disabled={!!editingItem}
                >
                  <option value="">Select study year</option>
                  {studyYears.map(sy => (
                    <option key={sy.id} value={sy.id}>
                      {sy.startYear} — {sy.endYear}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Title</label>
                <select
                  className="form-control"
                  value={semForm.title}
                  onChange={e =>
                    setSemForm({ ...semForm, title: e.target.value })
                  }
                >
                  <option value="First_Semester">First Semester</option>
                  <option value="Second_Semester">Second Semester</option>
                  <option value="Summer">Summer</option>
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={semForm.startDate}
                    onChange={e =>
                      setSemForm({ ...semForm, startDate: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={semForm.endDate}
                    onChange={e =>
                      setSemForm({ ...semForm, endDate: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  <FiSave /> {editingItem ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setModal(null);
                    setEditingItem(null);
                    resetSemForm();
                  }}
                >
                  <FiX /> Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .study-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
        }

        .page-header {
          margin-bottom: 32px;
        }

        .page-header h1 {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 28px;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 8px 0;
        }

        .page-header p {
          color: #64748b;
          margin: 0;
          font-size: 15px;
        }

        .study-years-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .study-year-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid #eef2f6;
          transition: all 0.2s;
        }

        .study-year-card:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .year-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .year-header:hover {
          background: #f8fafc;
        }

        .year-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .year-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: #e0f2fe;
          color: #0284c7;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .year-info h3 {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 4px 0;
          color: #1e293b;
        }

        .year-meta {
          display: flex;
          gap: 12px;
          align-items: center;
          color: #64748b;
          font-size: 0.85rem;
        }

        .year-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .chevron {
          transition: transform 0.2s;
          color: #94a3b8;
        }

        .chevron.expanded {
          transform: rotate(90deg);
        }

        .year-expanded {
          border-top: 1px solid #eef2f6;
          background: #f8fafc;
          padding: 24px;
        }

        .expanded-section {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          border: 1px solid #eef2f6;
        }

        .expanded-section:last-child {
          margin-bottom: 0;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .section-header h2,
        .section-header h4 {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0;
          color: #334155;
        }

        .section-header h2 {
          font-size: 1.25rem;
        }

        .section-header h4 {
          font-size: 1rem;
        }

        .study-tabs {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .study-section {
          background: white;
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #eef2f6;
        }

        /* Button Styles */
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
        }

        .btn-sm {
          padding: 6px 12px;
          font-size: 13px;
        }

        .btn-primary {
          background: #6366f1;
          color: white;
        }

        .btn-primary:hover {
          background: #4f46e5;
        }

        .btn-danger {
          background: #ef4444;
          color: white;
        }

        .btn-danger:hover {
          background: #dc2626;
        }

        .btn-ghost {
          background: #f1f5f9;
          color: #475569;
        }

        .btn-ghost:hover {
          background: #e2e8f0;
        }

        .btn-accent {
          background: #0ea5e9;
          color: white;
        }

        .btn-accent:hover {
          background: #0284c7;
        }

        /* Badge Styles */
        .badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .badge-success {
          background: #d1fae5;
          color: #065f46;
        }

        .badge-info {
          background: #dbeafe;
          color: #1e40af;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }

        .modal {
          background: white;
          border-radius: 20px;
          padding: 24px;
          max-width: 500px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal h2 {
          margin: 0 0 20px 0;
          font-size: 20px;
          font-weight: 600;
          color: #1e293b;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-size: 13px;
          font-weight: 500;
          color: #475569;
        }

        .form-control {
          width: 100%;
          padding: 10px 12px;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 14px;
          transition: all 0.2s;
        }

        .form-control:focus {
          border-color: #6366f1;
          outline: none;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 48px;
          background: white;
          border-radius: 16px;
          border: 1px solid #eef2f6;
        }

        .empty-state h3 {
          margin: 16px 0 8px 0;
          color: #334155;
        }

        .empty-state p {
          color: #64748b;
          margin: 0;
        }

        /* Spinner */
        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 40px auto;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .year-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .year-actions {
            width: 100%;
            justify-content: flex-end;
          }

          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}