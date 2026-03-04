// Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES, STATUS } from '../../constants';
import logo from '../../assets/images/logo.svg';
import './Login.css';

// React Icons
import { 
  MdEmail, 
  MdLock, 
  MdVisibility, 
  MdVisibilityOff,
  MdErrorOutline,
  MdSchool,
  MdTimeline,
  MdSchedule,
  MdArrowForward
} from 'react-icons/md';
import { FaUserGraduate } from 'react-icons/fa';
import { RiDashboardLine } from 'react-icons/ri';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login, status, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    clearError();
    try {
      await login(email, password);
      navigate(ROUTES.DASHBOARD);
    } catch (_) {}
  };

  const isLoading = status === STATUS.LOADING;

  return (
    <div className="login-container">
      {/* Left Panel - Branding & Features */}
      <div className="login-brand-panel">
        <div className="brand-content">
          <div className="brand-header">
            <img src={logo} alt="AYA Academy" className="brand-logo" />
            <h1 className="brand-title">AYA Academy</h1>
            <p className="brand-subtitle">University Information System</p>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <MdSchool className="feature-icon" />
              </div>
              <div className="feature-text">
                <h3>Course Registration</h3>
                <p>Easy enrollment and course management</p>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <MdTimeline className="feature-icon" />
              </div>
              <div className="feature-text">
                <h3>Academic Progress</h3>
                <p>Track your grades and achievements</p>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <MdSchedule className="feature-icon" />
              </div>
              <div className="feature-text">
                <h3>Schedule Management</h3>
                <p>Organize classes and departments</p>
              </div>
            </div>
          </div>

          <div className="testimonial-badge">
            <div className="testimonial-avatars">
              <span className="avatar">JD</span>
              <span className="avatar">MK</span>
              <span className="avatar">AS</span>
            </div>
            <p className="testimonial-text">Trusted by 5000+ students</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="login-form-panel">
        <div className="form-wrapper">
          <div className="form-header">
            <h2>Welcome Back</h2>
            <p className="welcome-text">
              Sign in to access your academic dashboard
            </p>
          </div>

          {error && (
            <div className="error-alert">
              <MdErrorOutline className="error-icon" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            {/* Email Field */}
            <div className="input-group">
              <label htmlFor="email" className="input-label">
                Email Address
              </label>
              <div className="input-field-wrapper">
                <MdEmail className="field-icon left-icon" />
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={e => {
                    clearError();
                    setEmail(e.target.value);
                  }}
                  placeholder="your.email@university.edu"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="input-group">
              <div className="password-header">
                <label htmlFor="password" className="input-label">
                  Password
                </label>
                <button type="button" className="forgot-link">
                  Forgot password?
                </button>
              </div>
              <div className="input-field-wrapper">
                <MdLock className="field-icon left-icon" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  value={password}
                  onChange={e => {
                    clearError();
                    setPassword(e.target.value);
                  }}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <MdVisibilityOff className='pass-icon' /> : <MdVisibility className='pass-icon' />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="checkbox-input"
                />
                <span className="checkbox-custom"></span>
                <span className="checkbox-text">Remember me</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
  type="submit"
  className="submit-button"
  disabled={isLoading}
>
  {isLoading ? (
    <span className="button-content">
      <span className="spinner"></span>
      Signing in...
    </span>
  ) : (
    <span className="button-content">
      Sign In
      <MdArrowForward className="button-icon" />
    </span>
  )}
</button>

            {/* Demo Credentials */}
            <div className="demo-credentials">
              <p className="demo-title">Demo Credentials:</p>
              <div className="credential-items">
                <span className="credential-item">
                  <FaUserGraduate /> user@akhbaracademy.edu
                </span>
                <span className="credential-item">
                  <MdLock /> ••••••••
                </span>
              </div>
            </div>
          </form>

          {/* Sign Up Link */}
          <p className="signup-prompt">
            Don't have an account?{' '}
            <button type="button" className="signup-link">
              Contact Administrator
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}