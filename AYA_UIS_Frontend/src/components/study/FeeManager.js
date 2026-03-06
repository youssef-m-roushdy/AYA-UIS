import React, { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX } from 'react-icons/fi';
import { LEVEL_LABELS } from '../../constants';

const FEE_TYPE_LABELS = {
  Academic: 'Academic',
  Registration: 'Registration',
  Laboratory: 'Laboratory',
  Activity: 'Activity',
};

export default function FeeManager({
  fees,
  studyYearId,
  departmentId,
  isAdmin,
  onAdd,
  onEdit,
  onDelete,
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [formData, setFormData] = useState({
    type: 'Academic',
    level: '',
    amount: '',
    description: '',
  });

  const levelOptions = [
    { value: 'Preparatory_Year', label: 'Preparatory Year' },
    { value: 'First_Year', label: '1st Year' },
    { value: 'Second_Year', label: '2nd Year' },
    { value: 'Third_Year', label: '3rd Year' },
    { value: 'Fourth_Year', label: '4th Year' },
    { value: 'Graduate', label: 'Graduate' },
  ];

  const handleSubmit = e => {
    e.preventDefault();
    if (editingFee) {
      onEdit(editingFee.id, {
        ...formData,
        amount: parseFloat(formData.amount),
      });
    } else {
      onAdd({
        ...formData,
        amount: parseFloat(formData.amount),
        studyYearId,
        departmentId,
      });
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      type: 'Academic',
      level: '',
      amount: '',
      description: '',
    });
    setEditingFee(null);
    setShowForm(false);
  };

  const startEdit = fee => {
    setEditingFee(fee);
    setFormData({
      type: fee.type,
      level: fee.level || '',
      amount: fee.amount,
      description: fee.description || '',
    });
    setShowForm(true);
  };

  const totalAmount = fees.reduce((sum, fee) => sum + (fee.amount || 0), 0);

  return (
    <div className="fee-manager">
      {isAdmin && (
        <div className="fee-actions">
          {!showForm ? (
            <button className="btn btn-sm btn-primary" onClick={() => setShowForm(true)}>
              <FiPlus /> Add Fee
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="fee-form">
              <div className="form-row">
                <select
                  className="form-control"
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  required
                >
                  <option value="Academic">Academic</option>
                  <option value="Registration">Registration</option>
                  <option value="Laboratory">Laboratory</option>
                  <option value="Activity">Activity</option>
                </select>

                <select
                  className="form-control"
                  value={formData.level}
                  onChange={e => setFormData({ ...formData, level: e.target.value })}
                >
                  <option value="">All Levels</option>
                  {levelOptions.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  className="form-control"
                  placeholder="Amount"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-row">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Description (optional)"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />

                <div className="form-actions">
                  <button type="submit" className="btn-icon save" title={editingFee ? 'Update' : 'Save'}>
                    <FiSave size={16} />
                  </button>
                  <button type="button" className="btn-icon cancel" onClick={resetForm} title="Cancel">
                    <FiX size={16} />
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      {fees.length === 0 ? (
        <div className="fee-empty">
          <p>No fees configured for this study year.</p>
        </div>
      ) : (
        <>
          <table className="fee-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Level</th>
                <th>Description</th>
                <th>Amount</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {fees.map(fee => (
                <tr key={fee.id}>
                  <td>
                    <span className={`fee-type ${fee.type.toLowerCase()}`}>
                      {FEE_TYPE_LABELS[fee.type] || fee.type}
                    </span>
                  </td>
                  <td>{LEVEL_LABELS[fee.level] || 'All Levels'}</td>
                  <td>{fee.description || '—'}</td>
                  <td className="fee-amount">${fee.amount?.toLocaleString()}</td>
                  {isAdmin && (
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon edit"
                          onClick={() => startEdit(fee)}
                          title="Edit Fee"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          className="btn-icon delete"
                          onClick={() => onDelete(fee.id)}
                          title="Delete Fee"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={isAdmin ? 4 : 3} className="total-label">
                  <strong>Total</strong>
                </td>
                <td className="total-amount">
                  <strong>${totalAmount.toLocaleString()}</strong>
                </td>
                {isAdmin && <td></td>}
              </tr>
            </tfoot>
          </table>
        </>
      )}

      <style jsx>{`
        .fee-manager {
          width: 100%;
        }

        .fee-actions {
          margin-bottom: 20px;
        }

        .fee-form {
          background: #f8fafc;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .form-row {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .form-control {
          flex: 1;
          padding: 8px 12px;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
        }

        .form-control:focus {
          border-color: #6366f1;
          outline: none;
        }

        .form-actions {
          display: flex;
          gap: 8px;
        }

        .fee-table {
          width: 100%;
          border-collapse: collapse;
        }

        .fee-table th {
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

        .fee-table td {
          padding: 12px;
          border-bottom: 1px solid #eef2f6;
          color: #334155;
        }

        .fee-table tfoot td {
          background: #f8fafc;
          font-weight: 600;
          border-top: 2px solid #e2e8f0;
        }

        .fee-type {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .fee-type.academic {
          background: #dbeafe;
          color: #1e40af;
        }

        .fee-type.registration {
          background: #fef3c7;
          color: #92400e;
        }

        .fee-type.laboratory {
          background: #fee2e2;
          color: #991b1b;
        }

        .fee-type.activity {
          background: #e0f2fe;
          color: #0369a1;
        }

        .fee-amount {
          font-weight: 600;
          color: #1e293b;
        }

        .total-amount {
          color: #6366f1;
          font-size: 1.1rem;
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

        .btn-icon.save:hover {
          background: #10b981;
          color: white;
        }

        .btn-icon.cancel:hover {
          background: #ef4444;
          color: white;
        }

        .btn-sm {
          padding: 6px 12px;
          font-size: 13px;
        }

        .btn-primary {
          background: #6366f1;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn-primary:hover {
          background: #4f46e5;
        }

        .fee-empty {
          text-align: center;
          padding: 32px;
          color: #94a3b8;
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .form-row {
            flex-direction: column;
          }

          .fee-table {
            font-size: 14px;
          }

          .fee-table th,
          .fee-table td {
            padding: 8px;
          }
        }
      `}</style>
    </div>
  );
}