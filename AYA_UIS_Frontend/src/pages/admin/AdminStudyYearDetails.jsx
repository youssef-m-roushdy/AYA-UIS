import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiChevronRight,
  FiArrowLeft,
  FiPlus,
  FiEdit,
  FiTrash,
  FiCalendar,
  FiDollarSign,
  FiX,
  FiSave,
} from 'react-icons/fi';
import { semesterService, feeService } from '../../services/otherServices';
import { LEVEL_LABELS } from '../../constants';
import { toast } from 'react-toastify';

const SEMESTER_LABELS = {
  First_Semester: 'First Semester',
  Second_Semester: 'Second Semester',
  Summer: 'Summer Semester',
};

const FEE_TYPE_LABELS = {
  Academic: 'Academic',
  Registration: 'Registration',
  Laboratory: 'Laboratory',
  Activity: 'Activity',
};

const levelOptions = [
  { value: 'Preparatory_Year', label: 'Preparatory Year' },
  { value: 'First_Year', label: '1st Year' },
  { value: 'Second_Year', label: '2nd Year' },
  { value: 'Third_Year', label: '3rd Year' },
  { value: 'Fourth_Year', label: '4th Year' },
  { value: 'Graduate', label: 'Graduate' },
];

export default function AdminStudyYearDetails() {
  const { studyYearId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('semesters');
  const [semesters, setSemesters] = useState([]);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [showFeeForm, setShowFeeForm] = useState(false);

  const [semForm, setSemForm] = useState({
    title: 'First_Semester',
    startDate: '',
    endDate: '',
  });

  const [feeForm, setFeeForm] = useState({
    type: 'Academic',
    level: '',
    amount: '',
    description: '',
    studyYearId,
  });

  const load = async () => {
    setLoading(true);
    try {
      const [semRes, feeRes] = await Promise.all([
        semesterService.getByYear(studyYearId),
        feeService.getByStudyYear(studyYearId),
      ]);
      setSemesters(semRes?.data || semRes || []);
      setFees(feeRes?.data || feeRes || []);
    } catch (e) {
      toast.error('Failed to load study year data');
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [studyYearId]);

  // ── Semester CRUD ──────────────────────────────────────
  const createSemester = async (e) => {
    e.preventDefault();
    if (!semForm.title || !semForm.startDate || !semForm.endDate) {
      toast.error('Fill all required fields');
      return;
    }
    try {
      await semesterService.create(studyYearId, semForm);
      toast.success('Semester created');
      resetSemForm();
      setModal(null);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create semester');
    }
  };

  const updateSemester = async (e) => {
    e.preventDefault();
    if (!editingItem?.id) return;
    try {
      await semesterService.update(editingItem.id, semForm);
      toast.success('Semester updated');
      resetSemForm();
      setEditingItem(null);
      setModal(null);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update semester');
    }
  };

  const deleteSemester = async (id) => {
    if (!window.confirm('Delete this semester?')) return;
    try {
      await semesterService.delete(id);
      toast.success('Semester deleted');
      load();
    } catch (e) {
      toast.error('Failed to delete semester');
    }
  };

  // ── Fee CRUD ───────────────────────────────────────────
  const createFee = async (e) => {
    e.preventDefault();
    if (!feeForm.type || !feeForm.level || !feeForm.amount) {
      toast.error('Fill all required fields');
      return;
    }
    try {
      await feeService.create({
        ...feeForm,
        amount: parseFloat(feeForm.amount),
      });
      toast.success('Fee created');
      resetFeeForm();
      setShowFeeForm(false);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create fee');
    }
  };

  const updateFee = async (e) => {
    e.preventDefault();
    if (!editingItem?.id) return;
    try {
      await feeService.update(editingItem.id, {
        ...feeForm,
        amount: parseFloat(feeForm.amount),
      });
      toast.success('Fee updated');
      resetFeeForm();
      setEditingItem(null);
      setShowFeeForm(false);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update fee');
    }
  };

  const deleteFee = async (id) => {
    if (!window.confirm('Delete this fee?')) return;
    try {
      await feeService.delete(id);
      toast.success('Fee deleted');
      load();
    } catch (e) {
      toast.error('Failed to delete fee');
    }
  };

  // ── Form Helpers ───────────────────────────────────────
  const resetSemForm = () => {
    setSemForm({
      title: 'First_Semester',
      startDate: '',
      endDate: '',
    });
  };

  const resetFeeForm = () => {
    setFeeForm({
      type: 'Academic',
      level: '',
      amount: '',
      description: '',
      studyYearId,
    });
  };

  const openEditSemester = (sem) => {
    setSemForm({
      title: sem.title,
      startDate: sem.startDate?.split('T')[0] || '',
      endDate: sem.endDate?.split('T')[0] || '',
    });
    setEditingItem(sem);
    setModal('semester');
  };

  const openEditFee = (fee) => {
    setFeeForm({
      type: fee.type,
      level: fee.level,
      amount: fee.amount,
      description: fee.description || '',
      studyYearId,
    });
    setEditingItem(fee);
    setShowFeeForm(true);
  };

  if (loading)
    return (
      <div className="page-container">
        <div className="spinner" />
      </div>
    );

  const tabs = [
    {
      key: 'semesters',
      label: 'Semesters',
      icon: <FiCalendar />,
      count: semesters.length,
    },
    {
      key: 'fees',
      label: 'Fees',
      icon: <FiDollarSign />,
      count: fees.length,
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate('/admin/study-years')}
          style={{ marginBottom: 12 }}
        >
          <FiArrowLeft /> Back to Study Years
        </button>
        <h1>
          <FiCalendar style={{ marginRight: 8 }} />
          Study Year Management
        </h1>
        <p>Manage semesters and fees for this academic year</p>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          marginBottom: 24,
          borderBottom: '2px solid var(--border)',
          paddingBottom: 0,
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 20px',
              border: 'none',
              borderBottom:
                activeTab === tab.key
                  ? '2px solid var(--primary)'
                  : '2px solid transparent',
              background: 'none',
              color:
                activeTab === tab.key ? 'var(--primary)' : 'var(--text-light)',
              fontWeight: activeTab === tab.key ? 600 : 400,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'var(--transition)',
              marginBottom: -2,
            }}
          >
            {tab.icon}
            {tab.label}
            <span
              style={{
                background:
                  activeTab === tab.key ? 'var(--primary)' : 'var(--border)',
                color: activeTab === tab.key ? 'white' : 'var(--text-light)',
                padding: '2px 8px',
                borderRadius: 12,
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Semesters Tab ──────────────────────────────────── */}
      {activeTab === 'semesters' && (
        <>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              resetSemForm();
              setEditingItem(null);
              setModal('semester');
            }}
            style={{ marginBottom: 20 }}
          >
            <FiPlus /> New Semester
          </button>

          {semesters.length === 0 ? (
            <div className="card empty-state">
              <h3>No semesters yet</h3>
              <p>Create a semester to get started</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {semesters.map((sem) => (
                <div key={sem.id} className="card">
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: '1.05rem', marginBottom: 4 }}>
                        {SEMESTER_LABELS[sem.title] || sem.title}
                      </h3>
                      <small style={{ color: 'var(--text-light)' }}>
                        {sem.startDate &&
                          new Date(sem.startDate).toLocaleDateString()}{' '}
                        —{' '}
                        {sem.endDate &&
                          new Date(sem.endDate).toLocaleDateString()}
                      </small>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => openEditSemester(sem)}
                        title="Edit"
                      >
                        <FiEdit size={16} />
                      </button>
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => deleteSemester(sem.id)}
                        title="Delete"
                      >
                        <FiTrash size={16} />
                      </button>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() =>
                          navigate(
                            `/admin/study-year/${studyYearId}/semester/${sem.id}/detail`
                          )
                        }
                      >
                        Manage <FiChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Fees Tab ───────────────────────────────────────── */}
      {activeTab === 'fees' && (
        <>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              resetFeeForm();
              setEditingItem(null);
              setShowFeeForm(true);
            }}
            style={{ marginBottom: 20 }}
            disabled={showFeeForm}
          >
            <FiPlus /> New Fee
          </button>

          {showFeeForm && (
            <form
              onSubmit={editingItem ? updateFee : createFee}
              className="card"
              style={{
                marginBottom: 20,
                padding: 20,
                background: '#f8fafc',
              }}
            >
              <h4 style={{ marginBottom: 16 }}>
                {editingItem ? 'Edit Fee' : 'Add New Fee'}
              </h4>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <div className="form-group">
                  <label>Fee Type</label>
                  <select
                    value={feeForm.type}
                    onChange={(e) =>
                      setFeeForm({ ...feeForm, type: e.target.value })
                    }
                  >
                    <option value="Academic">Academic</option>
                    <option value="Registration">Registration</option>
                    <option value="Laboratory">Laboratory</option>
                    <option value="Activity">Activity</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Level</label>
                  <select
                    value={feeForm.level}
                    onChange={(e) =>
                      setFeeForm({ ...feeForm, level: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Level</option>
                    {levelOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Amount</label>
                  <input
                    type="number"
                    value={feeForm.amount}
                    onChange={(e) =>
                      setFeeForm({ ...feeForm, amount: e.target.value })
                    }
                    placeholder="0.00"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    value={feeForm.description}
                    onChange={(e) =>
                      setFeeForm({
                        ...feeForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setShowFeeForm(false);
                    setEditingItem(null);
                    resetFeeForm();
                  }}
                >
                  <FiX /> Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <FiSave /> {editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          )}

          {fees.length === 0 ? (
            <div className="card empty-state">
              <h3>No fees configured</h3>
              <p>Create fee structures for different levels</p>
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
                <h3>Fee Structure</h3>
                <span className="badge badge-info">
                  {fees.length} fee{fees.length !== 1 ? 's' : ''}
                </span>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Level</th>
                    <th>Amount</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fees.map((f) => (
                    <tr key={f.id}>
                      <td>
                        <span
                          className={`badge ${
                            f.type === 'Academic'
                              ? 'badge-info'
                              : 'badge-warning'
                          }`}
                        >
                          {FEE_TYPE_LABELS[f.type] || f.type}
                        </span>
                      </td>
                      <td>{LEVEL_LABELS[f.level] || f.level}</td>
                      <td>
                        <strong>${f.amount?.toLocaleString()}</strong>
                      </td>
                      <td>{f.description || '—'}</td>
                      <td style={{ display: 'flex', gap: 4 }}>
                        <button
                          className="btn btn-xs btn-ghost"
                          onClick={() => openEditFee(f)}
                        >
                          <FiEdit size={14} />
                        </button>
                        <button
                          className="btn btn-xs btn-ghost"
                          onClick={() => deleteFee(f.id)}
                        >
                          <FiTrash size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {fees.length > 0 && (
                    <tr style={{ background: '#f8fafc', fontWeight: 600 }}>
                      <td colSpan={3} style={{ textAlign: 'right' }}>
                        Total:
                      </td>
                      <td colSpan={2} style={{ color: 'var(--primary)' }}>
                        ${fees.reduce((sum, f) => sum + (f.amount || 0), 0).toLocaleString()}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── Semester Modal ───────────────────────────────────── */}
      {modal === 'semester' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingItem ? 'Edit Semester' : 'New Semester'}</h2>
            <form onSubmit={editingItem ? updateSemester : createSemester}>
              <div className="form-group">
                <label>Semester</label>
                <select
                  value={semForm.title}
                  onChange={(e) =>
                    setSemForm({ ...semForm, title: e.target.value })
                  }
                >
                  <option value="First_Semester">First Semester</option>
                  <option value="Second_Semester">Second Semester</option>
                  <option value="Summer">Summer Semester</option>
                </select>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                }}
              >
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={semForm.startDate}
                    onChange={(e) =>
                      setSemForm({ ...semForm, startDate: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={semForm.endDate}
                    onChange={(e) =>
                      setSemForm({ ...semForm, endDate: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setModal(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
