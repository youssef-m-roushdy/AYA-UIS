// pages/auth/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MdEmail,
  MdArrowBack,
  MdErrorOutline,
  MdCheckCircleOutline,
} from 'react-icons/md';
import api from '../../services/api';
import { API_ENDPOINTS, ROUTES } from '../../constants';
import logo from '../../assets/images/logo.svg';
import './Auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
      setSuccess(true);
    } catch (err) {
      setError(err?.errorMessage || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo-wrapper">
          <img src={logo} alt="AYA Academy" className="auth-logo" />
        </div>

        {success ? (
          /* ── Success state ── */
          <div className="auth-success">
            <div className="auth-success-icon">
              <MdCheckCircleOutline />
            </div>
            <h2>Check your email</h2>
            <p>
              If <strong>{email}</strong> is registered, we've sent a password
              reset link. Check your inbox and follow the instructions.
            </p>
            <p className="auth-hint">
              Didn't receive it? Check your spam folder.
            </p>
            <Link to={ROUTES.LOGIN} className="auth-back-link">
              <MdArrowBack /> Back to Sign In
            </Link>
          </div>
        ) : (
          /* ── Form state ── */
          <>
            <div className="auth-header">
              <h2>Forgot Password?</h2>
              <p>Enter your email and we'll send you a reset link.</p>
            </div>

            {error && (
              <div className="auth-error">
                <MdErrorOutline />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="auth-input-group">
                <label htmlFor="email">Email Address</label>
                <div className="auth-input-wrapper">
                  <MdEmail className="auth-field-icon" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => {
                      setError('');
                      setEmail(e.target.value);
                    }}
                    placeholder="your.email@university.edu"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
              >
                <span className="button-content">
                  {loading ? (
                    <>
                      <span className="spinner" /> Sending...
                    </>
                  ) : (
                    'Send Reset Link'
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
    </div>
  );
}
