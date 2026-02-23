import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiFile,
  FiDownload,
  FiArrowLeft,
  FiClock,
  FiUser,
} from 'react-icons/fi';
import courseService from '../../services/courseService';
import { toast } from 'react-toastify';

const TYPE_COLORS = {
  sheet: { bg: '#ebf4ff', color: '#3182ce' },
  'sheet answer': { bg: '#f0fff4', color: '#38a169' },
  material: { bg: '#fffaf0', color: '#d69e2e' },
  lecture: { bg: '#faf5ff', color: '#805ad5' },
  exam: { bg: '#fff5f5', color: '#e53e3e' },
};

export default function CourseUploads() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await courseService.getUploads(courseId);
        setCourseData(res?.data || res);
      } catch (e) {
        toast.error('Failed to load course uploads');
      }
      setLoading(false);
    };
    load();
  }, [courseId]);

  if (loading)
    return (
      <div className="page-container">
        <div className="spinner" />
      </div>
    );

  const uploads = courseData?.uploads || [];

  return (
    <div className="page-container">
      <div className="page-header">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigate(-1)}
          style={{ marginBottom: 12 }}
        >
          <FiArrowLeft /> Back
        </button>
        <h1>
          <FiFile style={{ marginRight: 8 }} />
          {courseData?.name || 'Course'} — Uploads
        </h1>
        {courseData?.code && (
          <p>
            {courseData.code} · {courseData.credits} Credits
          </p>
        )}
      </div>

      {/* Course Info Card */}
      {courseData && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 16,
            }}
          >
            {courseData.name && (
              <div>
                <small style={{ color: 'var(--text-light)' }}>
                  Course Name
                </small>
                <p>
                  <strong>{courseData.name}</strong>
                </p>
              </div>
            )}
            {courseData.code && (
              <div>
                <small style={{ color: 'var(--text-light)' }}>Code</small>
                <p>{courseData.code}</p>
              </div>
            )}
            {courseData.credits !== undefined && (
              <div>
                <small style={{ color: 'var(--text-light)' }}>Credits</small>
                <p>{courseData.credits}</p>
              </div>
            )}
            {courseData.description && (
              <div style={{ gridColumn: '1 / -1' }}>
                <small style={{ color: 'var(--text-light)' }}>
                  Description
                </small>
                <p style={{ fontSize: '0.9rem' }}>{courseData.description}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Uploads */}
      <h3 style={{ marginBottom: 16, color: 'var(--primary)' }}>
        Uploads ({uploads.length})
      </h3>

      {uploads.length === 0 ? (
        <div className="card empty-state">
          <h3>No uploads yet</h3>
          <p>No files have been uploaded for this course.</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: 16,
          }}
        >
          {uploads.map(upload => {
            const typeStyle = TYPE_COLORS[upload.type?.toLowerCase()] || {
              bg: '#f7fafc',
              color: 'var(--text-light)',
            };
            return (
              <div
                className="card"
                key={upload.id}
                style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '0.95rem', marginBottom: 4 }}>
                      {upload.title}
                    </h4>
                    {upload.description && (
                      <p
                        style={{
                          fontSize: '0.83rem',
                          color: 'var(--text-light)',
                          lineHeight: 1.5,
                        }}
                      >
                        {upload.description}
                      </p>
                    )}
                  </div>
                  <span
                    className="badge"
                    style={{
                      background: typeStyle.bg,
                      color: typeStyle.color,
                      textTransform: 'capitalize',
                    }}
                  >
                    {upload.type}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: 16,
                    fontSize: '0.8rem',
                    color: 'var(--text-light)',
                  }}
                >
                  <span
                    style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <FiUser size={13} /> {upload.uploadedBy || 'Unknown'}
                  </span>
                  <span
                    style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <FiClock size={13} />{' '}
                    {new Date(upload.uploadedAt).toLocaleDateString()}
                  </span>
                </div>

                {upload.url && (
                  <a
                    href={upload.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm"
                    style={{ alignSelf: 'flex-start', marginTop: 'auto' }}
                  >
                    <FiDownload /> Download / View
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
