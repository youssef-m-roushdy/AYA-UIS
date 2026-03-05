import React, { useEffect, useState } from 'react';
import { FiLayers, FiCheck, FiClock, FiBook } from 'react-icons/fi';
import { userStudyYearService } from '../../services/otherServices';
import { LEVEL_LABELS } from '../../constants';
import { toast } from 'react-toastify';

// level comes as "First_Year" string from backend
const formatLevel = level =>
  LEVEL_LABELS[level] || level?.replace(/_/g, ' ') || '—';

export default function Timeline() {
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await userStudyYearService.getMyTimeline();
        setTimeline(res?.data || res);
      } catch (e) {
        toast.error('Failed to load timeline');
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading)
    return (
      <div className="page-container">
        <div className="spinner" />
      </div>
    );
  if (!timeline)
    return (
      <div className="page-container">
        <div className="card empty-state">
          <h3>No academic timeline found</h3>
        </div>
      </div>
    );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>
          <FiLayers style={{ marginRight: 8 }} />
          Academic Timeline
        </h1>
        <p>Your academic journey overview</p>
      </div>

      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon blue">
            <FiLayers />
          </div>
          <div className="stat-info">
            <h3>{formatLevel(timeline.currentLevel)}</h3>
            <p>Current Level</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon purple">
            <FiBook />
          </div>
          <div className="stat-info">
            <h3 style={{ whiteSpace: 'nowrap' }}>
              {timeline.department || '—'}
            </h3>
            <p>Department</p>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon green">
            <FiCheck />
          </div>
          <div className="stat-info">
            <h3>{timeline.totalYearsCompleted}</h3>
            <p>Years Completed</p>
          </div>
        </div>
        <div className="card stat-card">
          <div
            className={`stat-icon ${timeline.isGraduated ? 'green' : 'orange'}`}
          >
            {timeline.isGraduated ? <FiCheck /> : <FiClock />}
          </div>
          <div className="stat-info">
            <h3>{timeline.isGraduated ? 'Graduated' : 'In Progress'}</h3>
            <p>Status</p>
          </div>
        </div>
      </div>

      {timeline.studyYears?.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Study Years</h3>
          <div style={{ position: 'relative', paddingLeft: 24 }}>
            <div
              style={{
                position: 'absolute',
                left: 8,
                top: 0,
                bottom: 0,
                width: 2,
                background: 'var(--border)',
              }}
            />
            {timeline.studyYears.map(sy => (
              <div
                key={sy.userStudyYearId}
                style={{
                  position: 'relative',
                  paddingBottom: 24,
                  paddingLeft: 24,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: -17,
                    top: 4,
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: sy.isCurrent
                      ? 'var(--primary)'
                      : 'var(--success)',
                    border: '2px solid white',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                />
                <div
                  style={{
                    background: sy.isCurrent ? '#ebf4ff' : '#f7fafc',
                    padding: 16,
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <strong>
                        {sy.startYear} — {sy.endYear}
                      </strong>
                      <p
                        style={{
                          fontSize: '0.85rem',
                          color: 'var(--text-light)',
                          marginTop: 4,
                        }}
                      >
                        {formatLevel(sy.level)} · Enrolled{' '}
                        {new Date(sy.enrolledAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {sy.isCurrent && (
                        <span className="badge badge-info">Current</span>
                      )}
                      {sy.isActive && (
                        <span className="badge badge-success">Active</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
