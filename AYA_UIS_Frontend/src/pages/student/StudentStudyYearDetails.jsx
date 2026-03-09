import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiChevronRight,
  FiArrowLeft,
  FiDollarSign,
  FiCalendar,
  FiLayers,
} from 'react-icons/fi';
import { semesterService, feeService } from '../../services/otherServices';
import { useAuth } from '../../contexts/AuthContext';
import { LEVEL_LABELS } from '../../constants';
import { toast } from 'react-toastify';

const SEMESTER_LABELS = {
  First_Semester: 'First Semester',
  Second_Semester: 'Second Semester',
  Summer: 'Summer Semester',
};

const FEE_TYPE_LABELS = { Academic: 'Academic', Registration: 'Registration' };

export default function StudentStudyYearDetails() {
  const { studyYearId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('semesters');
  const [semesters, setSemesters] = useState([]);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  const departmentId = user?.departmentId;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Load semesters
        const semRes = await semesterService.getByYear(studyYearId);
        setSemesters(semRes?.data || semRes || []);

        // Load fees for student's department + this study year
        if (departmentId) {
          try {
            const feeRes = await feeService.getByDeptAndYear(
              departmentId,
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
    load();
  }, [studyYearId, departmentId]);

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
    { key: 'fees', label: 'Fees', icon: <FiDollarSign />, count: fees.length },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate('/student/my-study-years')}
          style={{ marginBottom: 12 }}
        >
          <FiArrowLeft /> Back to Study Years
        </button>
        <h1>
          <FiLayers style={{ marginRight: 8 }} />
          Study Year Details
        </h1>
        <p
          style={{
            display: 'flex',
            gap: 16,
            alignItems: 'center',
            flexWrap: 'wrap',
            marginTop: 4,
          }}
        >
          <span>Study Year ID: {studyYearId}</span>
          {user?.departmentName && (
            <span className="badge badge-info">{user.departmentName}</span>
          )}
        </p>
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

      {/* Semesters Tab */}
      {activeTab === 'semesters' && (
        <>
          {semesters.length === 0 ? (
            <div className="card empty-state">
              <h3>No semesters found</h3>
              <p>This study year has no semesters yet.</p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: 20,
              }}
            >
              {semesters.map(sem => (
                <div
                  className="card"
                  key={sem.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() =>
                    navigate(
                      `/student/study-year/${studyYearId}/semester/${sem.id}/courses`
                    )
                  }
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: '1.05rem', marginBottom: 6 }}>
                        {SEMESTER_LABELS[sem.title] || sem.title}
                      </h3>
                      <p
                        style={{
                          color: 'var(--text-light)',
                          fontSize: '0.85rem',
                        }}
                      >
                        {sem.startDate &&
                          new Date(sem.startDate).toLocaleDateString()}{' '}
                        —{' '}
                        {sem.endDate &&
                          new Date(sem.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <FiChevronRight size={20} color="var(--text-light)" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Fees Tab */}
      {activeTab === 'fees' && (
        <>
          {!departmentId ? (
            <div className="card empty-state">
              <h3>No department assigned</h3>
              <p>
                Your account is not linked to a department. Contact your
                administrator.
              </p>
            </div>
          ) : fees.length === 0 ? (
            <div className="card empty-state">
              <h3>No fees found</h3>
              <p>
                No fees are configured for your department in this study year.
              </p>
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
                <h3>Fee Breakdown</h3>
                <span className="badge badge-info">
                  {fees.length} fee{fees.length !== 1 ? 's' : ''}
                </span>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Level</th>
                    <th>Description</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {fees.map(f => (
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
                      <td>{f.description || '—'}</td>
                      <td>
                        <strong>${f.amount?.toLocaleString()}</strong>
                      </td>
                    </tr>
                  ))}
                  <tr style={{ background: '#f7fafc', fontWeight: 700 }}>
                    <td colSpan={3}>
                      <strong>Total</strong>
                    </td>
                    <td>
                      <strong
                        style={{
                          fontSize: '1.1rem',
                          color: 'var(--primary)',
                        }}
                      >
                        $
                        {fees
                          .reduce((s, f) => s + (f.amount || 0), 0)
                          .toLocaleString()}
                      </strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
