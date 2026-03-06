import React from 'react';
import { FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';

const SEMESTER_LABELS = {
  First_Semester: 'First Semester',
  Second_Semester: 'Second Semester',
  Summer: 'Summer Semester',
};

export default function SemesterList({ semesters, studyYearId, isAdmin, onEdit, onDelete }) {
  if (!semesters || semesters.length === 0) {
    return (
      <div className="semester-empty">
        <p>No semesters found for this study year.</p>
      </div>
    );
  }

  return (
    <div className="semester-list">
      <table className="semester-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {semesters.map(sem => (
            <tr key={sem.id}>
              <td>
                <span className="semester-title">
                  {SEMESTER_LABELS[sem.title] || sem.title}
                </span>
              </td>
              <td>{new Date(sem.startDate).toLocaleDateString()}</td>
              <td>{new Date(sem.endDate).toLocaleDateString()}</td>
              <td>
                <div className="action-buttons">
                  {isAdmin ? (
                    <>
                      <button
                        className="btn-icon edit"
                        onClick={() => onEdit(sem)}
                        title="Edit Semester"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        className="btn-icon delete"
                        onClick={() => onDelete(sem.id)}
                        title="Delete Semester"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn-icon view"
                      onClick={() => onEdit(sem)}
                      title="View Courses"
                    >
                      <FiEye size={16} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <style jsx>{`
        .semester-list {
          overflow-x: auto;
        }

        .semester-table {
          width: 100%;
          border-collapse: collapse;
        }

        .semester-table th {
          text-align: left;
          padding: 12px;
          background: #f8fafc;
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #e2e8f0;
        }

        .semester-table td {
          padding: 12px;
          border-bottom: 1px solid #eef2f6;
          color: #334155;
        }

        .semester-title {
          font-weight: 500;
          color: #1e293b;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .btn-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          background: #f1f5f9;
          color: #64748b;
        }

        .btn-icon:hover {
          transform: scale(1.1);
        }

        .btn-icon.edit:hover {
          background: #6366f1;
          color: white;
        }

        .btn-icon.delete:hover {
          background: #ef4444;
          color: white;
        }

        .btn-icon.view:hover {
          background: #0ea5e9;
          color: white;
        }

        .semester-empty {
          text-align: center;
          padding: 32px;
          color: #94a3b8;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}