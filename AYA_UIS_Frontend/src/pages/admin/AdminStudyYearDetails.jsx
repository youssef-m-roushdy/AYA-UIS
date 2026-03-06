import React, { useEffect, useState, useCallback, useRef } from 'react';
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
  FiAlertCircle,
  FiRefreshCw,
} from 'react-icons/fi';
import { semesterService, feeService } from '../../services/otherServices';
import departmentService from '../../services/departmentService';
import FilterSelect from '../../components/common/FilterSelect';
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
const feeTypeOptions = [
  { value: 'Academic', label: 'Academic', dotColor: 'info' },
  { value: 'Registration', label: 'Registration', dotColor: 'warning' },
];

const semesterTitleOptions = [
  { value: 'First_Semester', label: 'First Semester' },
  { value: 'Second_Semester', label: 'Second Semester' },
  { value: 'Summer', label: 'Summer Semester' },
];

const DEPTS_WITH_PREP = ['engineering'];

const levelOptionsAll = [
  { value: 'Preparatory_Year', label: 'Preparatory Year' },
  { value: 'First_Year', label: '1st Year' },
  { value: 'Second_Year', label: '2nd Year' },
  { value: 'Third_Year', label: '3rd Year' },
  { value: 'Fourth_Year', label: '4th Year' },
];

const levelOptionsNoPrep = levelOptionsAll.filter(
  l => l.value !== 'Preparatory_Year'
);

const getLevelsForDept = dept => {
  if (!dept) return levelOptionsAll;
  const name = (dept.name || '').toLowerCase();
  const hasPrep = DEPTS_WITH_PREP.some(kw => name.includes(kw));
  return hasPrep ? levelOptionsAll : levelOptionsNoPrep;
};

/* ── Force FilterSelect to fill its container ── */
const fslFullWidth = { display: 'flex', flexDirection: 'column' };
const FSL_FULL_STYLE = `
  .fsl-full .fsl-wrap    { width: 100%; }
  .fsl-full .fsl-trigger { width: 100%; min-width: unset; box-sizing: border-box; }
  .fsl-full .fsl-panel   { min-width: 100%; z-index: 1100; }
`;

const idle = { data: null, loading: false, error: null };
const mkLoad = () => ({ data: null, loading: true, error: null });
const mkOk = data => ({ data, loading: false, error: null });
const mkError = msg => ({ data: null, loading: false, error: msg });

/* ── Reusable tab UI helpers ── */
const TabSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
    <div className="spinner" />
  </div>
);
const TabError = ({ message, onRetry }) => (
  <div className="card" style={{ textAlign: 'center', padding: 40 }}>
    <FiAlertCircle
      size={32}
      style={{ color: 'var(--danger,#ef4444)', marginBottom: 12 }}
    />
    <p style={{ marginBottom: 16, color: 'var(--danger,#ef4444)' }}>
      {message}
    </p>
    <button className="btn btn-sm btn-ghost" onClick={onRetry}>
      <FiRefreshCw size={14} style={{ marginRight: 6 }} /> Retry
    </button>
  </div>
);

/* ── Shared Modal Overlay ── */
const ModalOverlay = ({ onClose, children, maxWidth = 560 }) => (
  <div
    onClick={onClose}
    style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(15, 23, 42, 0.55)',
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
      padding: '24px 16px',
      animation: 'overlayFadeIn 0.18s ease',
    }}
  >
    <style>{`
      @keyframes overlayFadeIn  { from { opacity: 0; } to { opacity: 1; } }
      @keyframes modalSlideIn   { from { opacity: 0; transform: scale(0.96) translateY(12px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    `}</style>
    <div
      onClick={e => e.stopPropagation()}
      style={{
        width: '100%',
        maxWidth,
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.1)',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        animation: 'modalSlideIn 0.22s cubic-bezier(0.34,1.56,0.64,1)',
        overflow: 'visible',
      }}
    >
      {children}
    </div>
  </div>
);

/* ── Shared Modal Header ── */
const ModalHeader = ({ title, icon, onClose }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 28px',
      borderBottom: '1px solid var(--border, #e2e8f0)',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      borderRadius: '16px 16px 0 0',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: 'var(--primary, #3b82f6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '1rem',
        }}
      >
        {icon}
      </div>
      <h2
        style={{
          fontSize: '1.15rem',
          fontWeight: 700,
          margin: 0,
          color: '#1e293b',
        }}
      >
        {title}
      </h2>
    </div>
    <button
      onClick={onClose}
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        background: 'none',
        border: '1px solid var(--border, #e2e8f0)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#64748b',
        transition: 'background 0.15s, color 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = '#fee2e2';
        e.currentTarget.style.color = '#ef4444';
        e.currentTarget.style.borderColor = '#fca5a5';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'none';
        e.currentTarget.style.color = '#64748b';
        e.currentTarget.style.borderColor = 'var(--border, #e2e8f0)';
      }}
    >
      <FiX size={15} />
    </button>
  </div>
);

/* ── Shared Form Field ── */
const FieldLabel = ({ children, required }) => (
  <label
    style={{
      display: 'block',
      marginBottom: 6,
      fontWeight: 600,
      fontSize: '0.82rem',
      color: '#475569',
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
    }}
  >
    {children}
    {required && (
      <span style={{ color: 'var(--danger, #ef4444)', marginLeft: 3 }}>*</span>
    )}
  </label>
);

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1.5px solid #e2e8f0',
  fontSize: '0.95rem',
  color: '#1e293b',
  background: '#f8fafc',
  outline: 'none',
  transition: 'border-color 0.15s, background 0.15s',
  boxSizing: 'border-box',
};

export default function AdminStudyYearDetails() {
  const { studyYearId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('semesters');
  const [semState, setSemState] = useState(idle);
  const [feeState, setFeeState] = useState(idle);
  const [deptState, setDeptState] = useState(idle);

  // ── Use a ref to track dept loading so fetchDepartments is stable ──
  const deptStateRef = useRef(idle);
  const setDeptStateSafe = useCallback(val => {
    deptStateRef.current =
      typeof val === 'function' ? val(deptStateRef.current) : val;
    setDeptState(deptStateRef.current);
  }, []);

  const fetchedOnce = useRef(new Set());

  const [modal, setModal] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [showFeeForm, setShowFeeForm] = useState(false);

  const defaultSemForm = () => ({
    title: 'First_Semester',
    startDate: '',
    endDate: '',
  });
  const defaultFeeForm = () => ({
    type: 'Academic',
    level: '',
    amount: '',
    description: '',
    studyYearId,
    departmentId: '',
  });

  const [semForm, setSemForm] = useState(defaultSemForm);
  const [feeForm, setFeeForm] = useState(defaultFeeForm);

  /* ── Fetchers: all stable (no changing deps) ── */
  const fetchSemesters = useCallback(async () => {
    setSemState(mkLoad());
    try {
      const res = await semesterService.getByYear(studyYearId);
      setSemState(mkOk(res?.data ?? res ?? []));
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to load semesters';
      setSemState(mkError(msg));
      toast.error(msg);
    }
  }, [studyYearId]);

  const fetchFees = useCallback(async () => {
    setFeeState(mkLoad());
    try {
      const res = await feeService.getByStudyYear(studyYearId);
      setFeeState(mkOk(res?.data ?? res ?? []));
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to load fees';
      setFeeState(mkError(msg));
      toast.error(msg);
    }
  }, [studyYearId]);

  // ── KEY FIX: read from ref instead of state so this callback never changes ──
  const fetchDepartments = useCallback(async () => {
    if (deptStateRef.current.data || deptStateRef.current.loading) return; // already loaded or in flight
    setDeptStateSafe(mkLoad());
    try {
      const res = await departmentService.getAll();
      setDeptStateSafe(mkOk(res?.data ?? res ?? []));
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to load departments';
      setDeptStateSafe(mkError(msg));
      toast.error(msg);
    }
  }, [setDeptStateSafe]); // stable — never recreated

  useEffect(() => {
    if (fetchedOnce.current.has(activeTab)) return;
    fetchedOnce.current.add(activeTab);
    if (activeTab === 'semesters') fetchSemesters();
    if (activeTab === 'fees') {
      fetchFees();
      fetchDepartments();
    }
  }, [activeTab, fetchSemesters, fetchFees, fetchDepartments]);

  const refetchSemesters = () => fetchSemesters();
  const refetchFees = () => fetchFees();

  /* ── Semester CRUD ── */
  const createSemester = async e => {
    e.preventDefault();
    try {
      await semesterService.create(studyYearId, semForm);
      toast.success('Semester created');
      setModal(null);
      setSemForm(defaultSemForm());
      setEditingItem(null);
      refetchSemesters();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to create semester');
    }
  };

  /* ── Fee CRUD ── */
  const createFee = async e => {
    e.preventDefault();
    if (!feeForm.level || !feeForm.amount) {
      toast.error('Fill all required fields');
      return;
    }
    try {
      await feeService.create({
        ...feeForm,
        amount: parseFloat(feeForm.amount),
        departmentId: feeForm.departmentId
          ? Number(feeForm.departmentId)
          : undefined,
      });
      toast.success('Fee created');
      setShowFeeForm(false);
      setFeeForm(defaultFeeForm());
      setEditingItem(null);
      refetchFees();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to create fee');
    }
  };

  const updateFee = async e => {
    e.preventDefault();
    if (!editingItem?.id) return;
    try {
      await feeService.update(editingItem.id, {
        ...feeForm,
        amount: parseFloat(feeForm.amount),
        departmentId: feeForm.departmentId
          ? Number(feeForm.departmentId)
          : undefined,
      });
      toast.success('Fee updated');
      setShowFeeForm(false);
      setFeeForm(defaultFeeForm());
      setEditingItem(null);
      refetchFees();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to update fee');
    }
  };

  const deleteFee = async id => {
    if (!window.confirm('Delete this fee?')) return;
    try {
      await feeService.del(id);
      toast.success('Fee deleted');
      refetchFees();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to delete fee');
    }
  };

  const openEditFee = fee => {
    setFeeForm({
      type: fee.type,
      level: fee.level,
      amount: fee.amount,
      description: fee.description || '',
      studyYearId,
      departmentId: fee.departmentId ?? '',
    });
    setEditingItem(fee);
    setShowFeeForm(true);
    fetchDepartments();
  };

  const closeFeeModal = () => {
    setShowFeeForm(false);
    setEditingItem(null);
    setFeeForm(defaultFeeForm());
  };

  const semesters = semState.data || [];
  const fees = feeState.data || [];

  const tabs = [
    {
      key: 'semesters',
      label: 'Semesters',
      icon: <FiCalendar />,
      count: semState.data ? semesters.length : '…',
    },
    {
      key: 'fees',
      label: 'Fees',
      icon: <FiDollarSign />,
      count: feeState.data ? fees.length : '…',
    },
  ];

  /* ════════════════════════════════════════════════════ */
  return (
    <div className="page-container">
      <style>{FSL_FULL_STYLE}</style>

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
        }}
      >
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 20px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem',
              marginBottom: -2,
              transition: 'var(--transition)',
              borderBottom:
                activeTab === tab.key
                  ? '2px solid var(--primary)'
                  : '2px solid transparent',
              color:
                activeTab === tab.key ? 'var(--primary)' : 'var(--text-light)',
              fontWeight: activeTab === tab.key ? 600 : 400,
            }}
          >
            {tab.icon}
            {tab.label}
            <span
              style={{
                padding: '2px 8px',
                borderRadius: 12,
                fontSize: '0.75rem',
                fontWeight: 600,
                background:
                  activeTab === tab.key ? 'var(--primary)' : 'var(--border)',
                color: activeTab === tab.key ? 'white' : 'var(--text-light)',
              }}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Semesters Tab ── */}
      {activeTab === 'semesters' && (
        <>
          {semState.loading && <TabSpinner />}
          {semState.error && (
            <TabError
              message={semState.error}
              onRetry={() => {
                setSemState(idle);
                fetchedOnce.current.delete('semesters');
                fetchSemesters();
              }}
            />
          )}
          {!semState.loading && !semState.error && (
            <>
              <button
                className="btn btn-primary btn-sm"
                style={{ marginBottom: 20 }}
                onClick={() => {
                  setSemForm(defaultSemForm());
                  setEditingItem(null);
                  setModal('semester');
                }}
              >
                <FiPlus /> New Semester
              </button>
              {semesters.length === 0 ? (
                <div className="card empty-state">
                  <h3>No semesters yet</h3>
                  <p>Create a semester to get started</p>
                </div>
              ) : (
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
                >
                  {semesters.map(sem => (
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
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ── Fees Tab ── */}
      {activeTab === 'fees' && (
        <>
          {feeState.loading && <TabSpinner />}
          {feeState.error && (
            <TabError
              message={feeState.error}
              onRetry={() => {
                setFeeState(idle);
                fetchedOnce.current.delete('fees');
                fetchFees();
              }}
            />
          )}
          {!feeState.loading && !feeState.error && (
            <>
              <button
                className="btn btn-primary btn-sm"
                style={{ marginBottom: 20 }}
                disabled={showFeeForm}
                onClick={() => {
                  setFeeForm(defaultFeeForm());
                  setEditingItem(null);
                  setShowFeeForm(true);
                  fetchDepartments();
                }}
              >
                <FiPlus /> New Fee
              </button>

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
                  <div style={{ overflowX: 'auto' }}>
                    <table
                      style={{ width: '100%', borderCollapse: 'collapse' }}
                    >
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--border)' }}>
                          <th
                            style={{ textAlign: 'left', padding: '12px 8px' }}
                          >
                            Type
                          </th>
                          <th
                            style={{ textAlign: 'left', padding: '12px 8px' }}
                          >
                            Level
                          </th>
                          <th
                            style={{ textAlign: 'left', padding: '12px 8px' }}
                          >
                            Department
                          </th>
                          <th
                            style={{ textAlign: 'left', padding: '12px 8px' }}
                          >
                            Amount
                          </th>
                          <th
                            style={{ textAlign: 'left', padding: '12px 8px' }}
                          >
                            Description
                          </th>
                          <th
                            style={{ textAlign: 'left', padding: '12px 8px' }}
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {fees.map(f => (
                          <tr
                            key={f.id}
                            style={{ borderBottom: '1px solid var(--border)' }}
                          >
                            <td style={{ padding: '12px 8px' }}>
                              <span
                                style={{
                                  display: 'inline-block',
                                  padding: '4px 10px',
                                  borderRadius: 20,
                                  fontSize: '0.85rem',
                                  fontWeight: 500,
                                  background:
                                    f.type === 'Academic'
                                      ? '#e3f2fd'
                                      : '#fff3e0',
                                  color:
                                    f.type === 'Academic'
                                      ? '#1976d2'
                                      : '#f57c00',
                                }}
                              >
                                {FEE_TYPE_LABELS[f.type] || f.type}
                              </span>
                            </td>
                            <td style={{ padding: '12px 8px' }}>
                              <span
                                style={{
                                  display: 'inline-block',
                                  padding: '4px 10px',
                                  borderRadius: 20,
                                  fontSize: '0.85rem',
                                  background: '#f5f5f5',
                                  color: '#666',
                                }}
                              >
                                {LEVEL_LABELS[f.level] || f.level}
                              </span>
                            </td>
                            <td style={{ padding: '12px 8px' }}>
                              {f.departmentId ? (
                                <span
                                  style={{
                                    display: 'inline-block',
                                    padding: '4px 10px',
                                    borderRadius: 20,
                                    fontSize: '0.85rem',
                                    background: '#f0fdf4',
                                    color: '#16a34a',
                                    fontWeight: 500,
                                  }}
                                >
                                  {(deptState.data || []).find(
                                    d => d.id === f.departmentId
                                  )?.name || `Dept #${f.departmentId}`}
                                </span>
                              ) : (
                                <span
                                  style={{
                                    color: '#94a3b8',
                                    fontSize: '0.85rem',
                                  }}
                                >
                                  All Depts
                                </span>
                              )}
                            </td>
                            <td
                              style={{ padding: '12px 8px', fontWeight: 600 }}
                            >
                              ${Number(f.amount)?.toLocaleString()}
                            </td>
                            <td
                              style={{
                                padding: '12px 8px',
                                color: 'var(--text-light)',
                              }}
                            >
                              {f.description || '—'}
                            </td>
                            <td style={{ padding: '12px 8px' }}>
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button
                                  style={{
                                    padding: 6,
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--primary)',
                                    borderRadius: 4,
                                  }}
                                  onClick={() => openEditFee(f)}
                                >
                                  <FiEdit size={16} />
                                </button>
                                <button
                                  style={{
                                    padding: 6,
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--danger)',
                                    borderRadius: 4,
                                  }}
                                  onClick={() => deleteFee(f.id)}
                                >
                                  <FiTrash size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ background: '#f8fafc', fontWeight: 600 }}>
                          <td
                            colSpan={3}
                            style={{ padding: '16px 8px', textAlign: 'right' }}
                          >
                            Total:
                          </td>
                          <td
                            colSpan={3}
                            style={{
                              padding: '16px 8px',
                              color: 'var(--primary)',
                            }}
                          >
                            $
                            {fees
                              .reduce((s, f) => s + (f.amount || 0), 0)
                              .toLocaleString()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════
          Fee Modal
      ══════════════════════════════════════════ */}
      {showFeeForm && (
        <ModalOverlay onClose={closeFeeModal} maxWidth={600}>
          <ModalHeader
            title={editingItem ? 'Edit Fee' : 'Add New Fee'}
            icon={<FiDollarSign size={17} />}
            onClose={closeFeeModal}
          />

          <form onSubmit={editingItem ? updateFee : createFee}>
            <div style={{ padding: '24px 28px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 16,
                }}
              >
                {/* ── Department (full width, first) ── */}
                <div style={{ gridColumn: '1 / -1' }}>
                  {deptState.loading ? (
                    <>
                      <FieldLabel>Department</FieldLabel>
                      <div
                        style={{
                          ...inputStyle,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          color: '#94a3b8',
                          height: 38,
                        }}
                      >
                        <div
                          className="spinner"
                          style={{ width: 14, height: 14 }}
                        />{' '}
                        Loading departments…
                      </div>
                    </>
                  ) : deptState.error ? (
                    <>
                      <FieldLabel>Department</FieldLabel>
                      <div
                        style={{
                          display: 'flex',
                          gap: 8,
                          alignItems: 'center',
                        }}
                      >
                        <div
                          style={{
                            ...inputStyle,
                            flex: 1,
                            color: '#ef4444',
                            height: 38,
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          Failed to load departments
                        </div>
                        <button
                          type="button"
                          onClick={fetchDepartments}
                          style={{
                            padding: '10px 12px',
                            borderRadius: 8,
                            border: '1.5px solid #e2e8f0',
                            background: 'white',
                            cursor: 'pointer',
                            color: '#ef4444',
                          }}
                        >
                          <FiRefreshCw size={14} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="fsl-full" style={fslFullWidth}>
                      <FilterSelect
                        label="Department"
                        value={
                          feeForm.departmentId
                            ? String(feeForm.departmentId)
                            : ''
                        }
                        onChange={v => {
                          const selectedDept =
                            (deptState.data || []).find(
                              d => String(d.id) === v
                            ) || null;
                          const newLevels = getLevelsForDept(selectedDept).map(
                            l => l.value
                          );
                          setFeeForm(prev => ({
                            ...prev,
                            departmentId: v,
                            level: newLevels.includes(prev.level)
                              ? prev.level
                              : '',
                          }));
                        }}
                        options={(deptState.data || []).map(d => ({
                          value: String(d.id),
                          label: d.name,
                        }))}
                        placeholder="All Departments (General)"
                        searchable
                      />
                    </div>
                  )}
                  <p
                    style={{
                      margin: '5px 0 0',
                      fontSize: '0.78rem',
                      color: '#94a3b8',
                    }}
                  >
                    Leave blank to apply this fee to all departments
                  </p>
                </div>

                {/* ── Fee Type ── */}
                <div className="fsl-full" style={fslFullWidth}>
                  <FilterSelect
                    label="Fee Type"
                    value={feeForm.type}
                    onChange={v =>
                      setFeeForm(prev => ({ ...prev, type: v || 'Academic' }))
                    }
                    options={feeTypeOptions}
                    placeholder="Select type"
                  />
                </div>

                {/* ── Level (locked until dept chosen) ── */}
                <div className="fsl-full" style={fslFullWidth}>
                  {(() => {
                    const selectedDept =
                      (deptState.data || []).find(
                        d => String(d.id) === String(feeForm.departmentId)
                      ) || null;
                    const filteredLevels = getLevelsForDept(selectedDept);
                    const isLocked = !feeForm.departmentId;
                    return (
                      <>
                        <span
                          style={{
                            fontSize: '10.5px',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            color: isLocked ? '#cbd5e1' : '#94a3b8',
                            paddingLeft: 2,
                            marginBottom: 5,
                            userSelect: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                          }}
                        >
                          Level{' '}
                          <span style={{ color: 'var(--danger, #ef4444)' }}>
                            *
                          </span>
                          {isLocked && (
                            <span
                              style={{
                                fontSize: '10px',
                                background: '#fef3c7',
                                color: '#92400e',
                                padding: '1px 6px',
                                borderRadius: 4,
                                fontWeight: 500,
                                textTransform: 'none',
                                letterSpacing: 0,
                              }}
                            >
                              Select department first
                            </span>
                          )}
                        </span>

                        {isLocked ? (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              padding: '0 12px',
                              height: 38,
                              borderRadius: 10,
                              border: '1.5px dashed #e2e8f0',
                              background: '#f8fafc',
                              color: '#cbd5e1',
                              fontSize: '13.5px',
                              cursor: 'not-allowed',
                              userSelect: 'none',
                            }}
                          >
                            <span style={{ fontSize: 15 }}>🔒</span> Choose a
                            department first
                          </div>
                        ) : (
                          <div className="fsl-full" style={fslFullWidth}>
                            <FilterSelect
                              value={feeForm.level}
                              onChange={v =>
                                setFeeForm(prev => ({ ...prev, level: v }))
                              }
                              options={filteredLevels}
                              placeholder="Select level"
                            />
                          </div>
                        )}

                        {!isLocked && selectedDept && (
                          <p
                            style={{
                              margin: '4px 0 0',
                              fontSize: '0.76rem',
                              color: '#10b981',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            ✓ {filteredLevels.length} level
                            {filteredLevels.length !== 1 ? 's' : ''} available
                            for <strong>{selectedDept.name}</strong>
                          </p>
                        )}
                      </>
                    );
                  })()}
                </div>

                {/* ── Amount ── */}
                <div>
                  <FieldLabel required>Amount</FieldLabel>
                  <div style={{ position: 'relative' }}>
                    <span
                      style={{
                        position: 'absolute',
                        left: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94a3b8',
                        fontWeight: 600,
                        pointerEvents: 'none',
                      }}
                    >
                      $
                    </span>
                    <input
                      type="number"
                      value={feeForm.amount}
                      onChange={e =>
                        setFeeForm(prev => ({
                          ...prev,
                          amount: e.target.value,
                        }))
                      }
                      placeholder="0.00"
                      required
                      min="0"
                      step="0.01"
                      style={{ ...inputStyle, paddingLeft: 26 }}
                    />
                  </div>
                </div>

                {/* ── Description ── */}
                <div>
                  <FieldLabel>Description</FieldLabel>
                  <input
                    type="text"
                    value={feeForm.description}
                    onChange={e =>
                      setFeeForm(prev => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Optional note"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                display: 'flex',
                gap: 12,
                justifyContent: 'flex-end',
                padding: '16px 28px 24px',
                borderTop: '1px solid #f1f5f9',
              }}
            >
              <button
                type="button"
                onClick={closeFeeModal}
                style={{
                  padding: '10px 20px',
                  borderRadius: 9,
                  border: '1.5px solid #e2e8f0',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <FiX size={14} /> Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '10px 24px',
                  borderRadius: 9,
                  border: 'none',
                  background: 'var(--primary, #3b82f6)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 2px 8px rgba(59,130,246,0.35)',
                }}
              >
                <FiSave size={14} /> {editingItem ? 'Update Fee' : 'Create Fee'}
              </button>
            </div>
          </form>
        </ModalOverlay>
      )}

      {/* ══════════════════════════════════════════
          Semester Modal
      ══════════════════════════════════════════ */}
      {modal === 'semester' && (
        <ModalOverlay onClose={() => setModal(null)} maxWidth={500}>
          <ModalHeader
            title={editingItem ? 'Edit Semester' : 'Create New Semester'}
            icon={<FiCalendar size={17} />}
            onClose={() => setModal(null)}
          />

          <form onSubmit={createSemester}>
            <div style={{ padding: '24px 28px' }}>
              <div
                className="fsl-full"
                style={{ ...fslFullWidth, marginBottom: 16 }}
              >
                <FilterSelect
                  label="Semester *"
                  value={semForm.title}
                  onChange={v =>
                    setSemForm(prev => ({
                      ...prev,
                      title: v || 'First_Semester',
                    }))
                  }
                  options={semesterTitleOptions}
                  placeholder="Select semester"
                />
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 16,
                }}
              >
                <div>
                  <FieldLabel required>Start Date</FieldLabel>
                  <input
                    type="date"
                    value={semForm.startDate}
                    onChange={e =>
                      setSemForm(prev => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    required
                    style={inputStyle}
                  />
                </div>
                <div>
                  <FieldLabel required>End Date</FieldLabel>
                  <input
                    type="date"
                    value={semForm.endDate}
                    onChange={e =>
                      setSemForm(prev => ({ ...prev, endDate: e.target.value }))
                    }
                    required
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 12,
                justifyContent: 'flex-end',
                padding: '16px 28px 24px',
                borderTop: '1px solid #f1f5f9',
              }}
            >
              <button
                type="button"
                onClick={() => setModal(null)}
                style={{
                  padding: '10px 20px',
                  borderRadius: 9,
                  border: '1.5px solid #e2e8f0',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: '#475569',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '10px 24px',
                  borderRadius: 9,
                  border: 'none',
                  background: 'var(--primary, #3b82f6)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 2px 8px rgba(59,130,246,0.35)',
                }}
              >
                <FiSave size={14} />{' '}
                {editingItem ? 'Update Semester' : 'Create Semester'}
              </button>
            </div>
          </form>
        </ModalOverlay>
      )}
    </div>
  );
}
