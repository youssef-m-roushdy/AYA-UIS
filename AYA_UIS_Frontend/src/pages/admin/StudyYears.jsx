import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiPlus,
  FiCalendar,
  FiEdit2,
  FiTrash2,
  FiArrowRight,
} from 'react-icons/fi';
import { studyYearService } from '../../services/otherServices';
import { toast } from 'react-toastify';


const SEMESTER_LABELS = {
  First_Semester: 'First Semester',
  Second_Semester: 'Second Semester',
  Summer: 'Summer Semester',
};

export default function StudyYears() {
  const [studyYears, setStudyYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const navigate = useNavigate();

  const [yearForm, setYearForm] = useState({
    startYear: new Date().getFullYear(),
    endYear: new Date().getFullYear() + 1,
    isCurrent: false,
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await studyYearService.getAll();
      setStudyYears(res?.data || res || []);
    } catch (e) {
      toast.error('Failed to load study years');
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // Study Year CRUD
  const createYear = async (e) => {
    e.preventDefault();
    if (!yearForm.startYear || !yearForm.endYear) {
      toast.error('Fill all required fields');
      return;
    }
    try {
      await studyYearService.create(yearForm);
      toast.success('Study year created');
      resetYearForm();
      setModal(null);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create study year');
    }
  };

  const updateYear = async (e) => {
    e.preventDefault();
    if (!editingItem?.id) return;
    try {
      await studyYearService.update(editingItem.id, yearForm);
      toast.success('Study year updated');
      resetYearForm();
      setEditingItem(null);
      setModal(null);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update study year');
    }
  };

  const deleteYear = async (id) => {
    if (!window.confirm('Delete this study year and all associated data?'))
      return;
    try {
      await studyYearService.delete(id);
      toast.success('Study year deleted');
      load();
    } catch (e) {
      toast.error('Failed to delete study year');
    }
  };

  const resetYearForm = () => {
    setYearForm({
      startYear: new Date().getFullYear(),
      endYear: new Date().getFullYear() + 1,
      isCurrent: false,
    });
  };

  const openEditYear = (year) => {
    setYearForm({
      startYear: year.startYear,
      endYear: year.endYear,
      isCurrent: year.isCurrent || false,
    });
    setEditingItem(year);
    setModal('year');
  };

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
          Study Years
        </h1>
        <p>Create and manage academic study years</p>
      </div>

      <button
        className="btn btn-primary btn-sm"
        onClick={() => {
          resetYearForm();
          setEditingItem(null);
          setModal('year');
        }}
        style={{ marginBottom: 20 }}
      >
        <FiPlus /> New Study Year
      </button>

      {studyYears.length === 0 ? (
        <div className="card empty-state">
          <h3>No study years yet</h3>
          <p>Create your first study year to get started</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: 20,
          }}
        >
          {studyYears.map((year) => (
            <div key={year.id} className="card">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  marginBottom: 12,
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: 4 }}>
                    {year.startYear} — {year.endYear}
                  </h3>
                  {year.isCurrent && (
                    <span className="badge badge-success">Current Year</span>
                  )}
                </div>
              </div>

              <p
                style={{
                  color: 'var(--text-light)',
                  fontSize: '0.9rem',
                  marginBottom: 16,
                }}
              >
                Manage semesters, schedules, registrations, and fees for this
                study year
              </p>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => openEditYear(year)}
                    title="Edit"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => deleteYear(year.id)}
                    title="Delete"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() =>
                    navigate(`/admin/study-year/${year.id}/manage`)
                  }
                >
                  Manage <FiArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Year Modal ─────────────────────────────────────────── */}
      {modal === 'year' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingItem ? 'Edit Study Year' : 'New Study Year'}</h2>
            <form onSubmit={editingItem ? updateYear : createYear}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                }}
              >
                <div className="form-group">
                  <label>Start Year</label>
                  <input
                    type="number"
                    value={yearForm.startYear}
                    onChange={(e) =>
                      setYearForm({
                        ...yearForm,
                        startYear: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Year</label>
                  <input
                    type="number"
                    value={yearForm.endYear}
                    onChange={(e) =>
                      setYearForm({
                        ...yearForm,
                        endYear: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={yearForm.isCurrent}
                    onChange={(e) =>
                      setYearForm({
                        ...yearForm,
                        isCurrent: e.target.checked,
                      })
                    }
                  />
                  <span style={{ marginLeft: 8 }}>Mark as current year</span>
                </label>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  justifyContent: 'flex-end',
                  marginTop: 20,
                }}
              >
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