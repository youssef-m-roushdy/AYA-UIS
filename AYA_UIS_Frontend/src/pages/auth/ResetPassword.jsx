import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdArrowBack,
  MdErrorOutline,
  MdCheckCircleOutline,
} from 'react-icons/md';
import api from '../../services/api';
import { API_ENDPOINTS, ROUTES } from '../../constants';
import logo from '../../assets/images/logo.svg';
import './Auth.css';

// Create a reusable PasswordField component OUTSIDE the main component
const PasswordField = ({
  label,
  value,
  onChange,
  showPassword,
  onToggleShow,
  placeholder,
  autoComplete,
  icon: Icon = MdLock,
}) => (
  <div className="auth-input-group">
    <label>{label}</label>
    <div className="auth-input-wrapper">
      <Icon className="auth-field-icon" />
      <input
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        autoComplete={autoComplete}
      />
      <button
        type="button"
        className="auth-toggle-pass"
        onClick={onToggleShow}
        aria-label={`Toggle ${label} visibility`}
        tabIndex="-1" // Remove from tab order
      >
        {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
      </button>
    </div>
  </div>
);

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNew] = useState('');
  const [confirmPassword, setConf] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';

  useEffect(() => {
    if (!email || !token) {
      setError('Invalid or expired reset link. Please request a new one.');
    }
  }, [email, token]);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        email,
        token,
        newPassword,
        confirmPassword,
      });
      setSuccess(true);
      setTimeout(() => navigate(ROUTES.LOGIN), 3000);
    } catch (err) {
      setError(err?.errorMessage || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  // Handlers with error clearing
  const handleNewPasswordChange = e => {
    setError('');
    setNew(e.target.value);
  };

  const handleConfirmPasswordChange = e => {
    setError('');
    setConf(e.target.value);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo-wrapper">
          <img src={logo} alt="AYA Academy" className="auth-logo" />
        </div>

        {success ? (
          <div className="auth-success">
            <div className="auth-success-icon auth-success-icon--green">
              <MdCheckCircleOutline />
            </div>
            <h2>Password Reset!</h2>
            <p>Your password has been successfully updated.</p>
            <p className="auth-hint">Redirecting to sign in...</p>
            <Link to={ROUTES.LOGIN} className="auth-back-link">
              <MdArrowBack /> Go to Sign In
            </Link>
          </div>
        ) : (
          <>
            <div className="auth-header">
              <h2>Set New Password</h2>
              <p>Choose a strong password for your account.</p>
            </div>

            {error && (
              <div className="auth-error">
                <MdErrorOutline />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* New Password Field */}
              <PasswordField
                label="New Password"
                value={newPassword}
                onChange={handleNewPasswordChange}
                showPassword={showNew}
                onToggleShow={() => setShowNew(v => !v)}
                placeholder="Enter new password"
                autoComplete="new-password"
                icon={MdLock}
              />

              {/* Confirm Password Field */}
              <PasswordField
                label="Confirm Password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                showPassword={showConf}
                onToggleShow={() => setShowConf(v => !v)}
                placeholder="Confirm new password"
                autoComplete="new-password"
                icon={MdLock}
              />

              {/* Password strength hint */}
              {newPassword && (
                <div className="auth-password-rules">
                  <span
                    className={
                      newPassword.length >= 8 ? 'rule-pass' : 'rule-fail'
                    }
                  >
                    {newPassword.length >= 8 ? '✓' : '✗'} At least 8 characters
                  </span>
                  <span
                    className={
                      /[A-Z]/.test(newPassword) ? 'rule-pass' : 'rule-fail'
                    }
                  >
                    {/[A-Z]/.test(newPassword) ? '✓' : '✗'} One uppercase letter
                  </span>
                  <span
                    className={
                      /[0-9]/.test(newPassword) ? 'rule-pass' : 'rule-fail'
                    }
                  >
                    {/[0-9]/.test(newPassword) ? '✓' : '✗'} One number
                  </span>
                </div>
              )}

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading || !email || !token}
              >
                <span className="button-content">
                  {loading ? (
                    <>
                      <span className="spinner" /> Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </span>
              </button>
            </form>

            <Link to={ROUTES.LOGIN} className="auth-back-link">
              <MdArrowBack /> Back to Sign In
            </Link>
          </>
        )}
      </div>

      {/* Add some CSS improvements for better UX */}
      <style>{`
        /* Improve focus visibility for better accessibility */
        .auth-input-wrapper:focus-within .auth-toggle-pass {
          color: var(--primary, #2a5298);
        }
        
        /* Ensure the toggle button doesn't steal focus but remains visible */
        .auth-toggle-pass {
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
          z-index: 1;
        }
        
        .auth-toggle-pass:hover {
          color: var(--primary, #2a5298);
        }
        
        /* Make sure the input has proper right padding for the button */
        .auth-input-wrapper input {
          padding-right: 45px !important;
        }
      `}</style>
    </div>
  );
}
