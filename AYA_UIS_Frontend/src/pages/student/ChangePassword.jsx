// pages/student/ChangePassword.jsx
import React, { useState } from 'react';
import { MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../constants';

// Move PasswordField component OUTSIDE the main component
const PasswordField = ({
  label,
  fieldKey,
  showKey,
  show,
  value,
  onUpdate,
  onToggle,
  placeholder,
  autoComplete,
}) => (
  <div className="cp-field">
    <label>{label}</label>
    <div className="cp-input-wrapper">
      <MdLock className="cp-icon-left" />
      <input
        type={show[showKey] ? 'text' : 'password'}
        value={value}
        onChange={e => onUpdate(fieldKey, e.target.value)}
        placeholder={placeholder}
        required
        autoComplete={autoComplete}
      />
      <button
        type="button"
        className="cp-toggle"
        onClick={() => onToggle(showKey)}
        aria-label="Toggle password visibility"
        tabIndex="-1" // This removes the button from tab order
      >
        {show[showKey] ? <MdVisibilityOff /> : <MdVisibility />}
      </button>
    </div>
  </div>
);

export default function ChangePassword() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [show, setShow] = useState({
    current: false,
    newP: false,
    conf: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (key, val) => {
    setError('');
    setForm(f => ({ ...f, [key]: val }));
  };
  const toggle = key => setShow(s => ({ ...s, [key]: !s[key] }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (form.newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (form.currentPassword === form.newPassword) {
      setError('New password must differ from current password.');
      return;
    }

    setLoading(true);
    try {
      await api.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });
      toast.success('Password changed successfully!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err?.errorMessage || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MdLock /> Change Password
          </h1>
          <p>Update your account password</p>
        </div>
      </div>

      {/* Two-column layout: form left, tips right */}
      <div className="cp-layout">
        {/* ── Form card ── */}
        <div className="card cp-form-card">
          <h3 className="cp-section-title">New Password</h3>

          {error && (
            <div className="cp-error">
              <span>⚠ {error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <PasswordField
              label="Current Password"
              fieldKey="currentPassword"
              showKey="current"
              show={show}
              value={form.currentPassword}
              onUpdate={update}
              onToggle={toggle}
              placeholder="Enter your current password"
              autoComplete="current-password"
            />
            <PasswordField
              label="New Password"
              fieldKey="newPassword"
              showKey="newP"
              show={show}
              value={form.newPassword}
              onUpdate={update}
              onToggle={toggle}
              placeholder="Enter new password"
              autoComplete="new-password"
            />
            <PasswordField
              label="Confirm New Password"
              fieldKey="confirmPassword"
              showKey="conf"
              show={show}
              value={form.confirmPassword}
              onUpdate={update}
              onToggle={toggle}
              placeholder="Confirm new password"
              autoComplete="new-password"
            />

            {/* Password strength rules */}
            {form.newPassword && (
              <div className="cp-rules">
                {[
                  {
                    label: 'At least 8 characters',
                    pass: form.newPassword.length >= 8,
                  },
                  {
                    label: 'One uppercase letter',
                    pass: /[A-Z]/.test(form.newPassword),
                  },
                  { label: 'One number', pass: /[0-9]/.test(form.newPassword) },
                  {
                    label: 'One special character',
                    pass: /[^A-Za-z0-9]/.test(form.newPassword),
                  },
                ].map(({ label, pass }) => (
                  <span
                    key={label}
                    className={pass ? 'cp-rule-pass' : 'cp-rule-fail'}
                  >
                    {pass ? '✓' : '✗'} {label}
                  </span>
                ))}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary cp-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="cp-spinner" /> Updating...
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        </div>

        {/* ── Tips card ── */}
        <div className="card cp-tips-card">
          <h3 className="cp-section-title">Password Tips</h3>
          <ul className="cp-tips-list">
            <li>Use at least 8 characters</li>
            <li>Mix uppercase and lowercase letters</li>
            <li>Include numbers and symbols</li>
            <li>Avoid using your name or email</li>
            <li>Don't reuse old passwords</li>
            <li>Use a unique password for this account</li>
          </ul>

          <div className="cp-security-note">
            <span>🔒</span>
            <p>
              After changing your password, you'll remain logged in. Other
              sessions will be invalidated.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .cp-layout {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 24px;
          align-items: start;
        }

        @media (max-width: 768px) {
          .cp-layout { grid-template-columns: 1fr; }
        }

        .cp-form-card, .cp-tips-card { padding: 28px; }

        .cp-section-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 24px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border);
        }

        .cp-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 10px;
          padding: 12px 16px;
          color: #991b1b;
          font-size: 0.875rem;
          margin-bottom: 20px;
        }

        .cp-field {
          margin-bottom: 20px;
        }

        .cp-field label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 8px;
        }

        .cp-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .cp-icon-left {
          position: absolute;
          left: 13px;
          color: #94a3b8;
          font-size: 1.05rem;
          pointer-events: none;
          transition: color 0.2s;
        }

        .cp-input-wrapper:focus-within .cp-icon-left {
          color: var(--primary);
        }

        .cp-input-wrapper input {
          width: 100%;
          padding: 12px 42px 12px 40px;
          border: 2px solid var(--border);
          border-radius: 10px;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          background: white;
        }

        .cp-input-wrapper input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(42, 82, 152, 0.1);
        }

        .cp-toggle {
          position: absolute;
          right: 13px;
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
          font-size: 1.05rem;
          padding: 0;
          transition: color 0.2s;
        }

        .cp-toggle:hover { color: var(--primary); }

        /* Visual feedback for keyboard users when they're on the input */
        .cp-input-wrapper:focus-within .cp-toggle {
          color: var(--primary);
        }

        .cp-rules {
          display: flex;
          flex-direction: column;
          gap: 5px;
          padding: 12px 16px;
          background: #f8fafc;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .cp-rules span { font-size: 0.8rem; }
        .cp-rule-pass { color: #10b981; }
        .cp-rule-fail { color: #94a3b8; }

        .cp-submit {
          width: 100%;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 8px;
        }

        .cp-spinner {
          width: 16px;
          height: 16px;
          min-width: 16px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .cp-tips-list {
          list-style: none;
          padding: 0;
          margin: 0 0 24px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .cp-tips-list li {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.875rem;
          color: var(--text-light);
        }

        .cp-tips-list li::before {
          content: '•';
          color: var(--primary);
          font-weight: 700;
          flex-shrink: 0;
        }

        .cp-security-note {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 10px;
          padding: 14px;
        }

        .cp-security-note p {
          font-size: 0.82rem;
          color: #0369a1;
          margin: 0;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}
