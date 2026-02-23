import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiChevronRight } from 'react-icons/fi';
import { userStudyYearService } from '../../services/otherServices';
import { LEVEL_LABELS } from '../../constants';
import { toast } from 'react-toastify';

export default function MyStudyYears() {
  const [studyYears, setStudyYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await userStudyYearService.getMyStudyYears();
        setStudyYears(res?.data || res || []);
      } catch (e) {
        toast.error('Failed to load study years');
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

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>
          <FiCalendar style={{ marginRight: 8 }} />
          My Study Years
        </h1>
        <p>View your assigned study years and explore semesters</p>
      </div>

      {studyYears.length === 0 ? (
        <div className="card empty-state">
          <h3>No study years assigned</h3>
          <p>You haven't been assigned to any study years yet.</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: 20,
          }}
        >
          {studyYears.map(sy => (
            <div
              className="card"
              key={sy.id || sy.studyYearId}
              style={{ cursor: 'pointer', position: 'relative' }}
              onClick={() =>
                navigate(
                  `/student/study-year/${sy.studyYearId || sy.id}/semesters`
                )
              }
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: 4 }}>
                    {sy.startYear || sy.studyYear?.startYear} —{' '}
                    {sy.endYear || sy.studyYear?.endYear}
                  </h3>
                  <p
                    style={{
                      color: 'var(--text-light)',
                      fontSize: '0.85rem',
                      marginBottom: 8,
                    }}
                  >
                    {LEVEL_LABELS[sy.level || sy.levelName] ||
                      sy.levelName ||
                      sy.level ||
                      '—'}
                  </p>
                  {sy.departmentName && (
                    <p
                      style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}
                    >
                      {sy.departmentName}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {sy.isCurrent && (
                    <span className="badge badge-info">Current</span>
                  )}
                  <FiChevronRight size={20} color="var(--text-light)" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
