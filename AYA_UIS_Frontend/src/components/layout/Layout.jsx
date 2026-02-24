import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../constants';
import {
  FiHome,
  FiBook,
  FiUsers,
  FiCalendar,
  FiDollarSign,
  FiGrid,
  FiFileText,
  FiLogOut,
  FiMenu,
  FiX,
  FiUser,
  FiShield,
  FiClipboard,
  FiLayers,
  FiChevronDown,
  FiArrowUp,
} from 'react-icons/fi';
import logo from '../../assets/images/logo.svg';
import './Layout.css';

export default function Layout() {
  const { user, logout, isAdmin, isStudent } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const adminNav = [
    { to: ROUTES.DASHBOARD, icon: <FiHome />, label: 'Dashboard' },
    { to: ROUTES.ADMIN.DEPARTMENTS, icon: <FiGrid />, label: 'Departments' },
    { to: ROUTES.ADMIN.COURSES, icon: <FiBook />, label: 'Courses' },
    { to: ROUTES.ADMIN.STUDENTS, icon: <FiUsers />, label: 'Students' },
    {
      to: ROUTES.ADMIN.STUDY_YEARS,
      icon: <FiCalendar />,
      label: 'Study Years',
    },
    {
      to: ROUTES.ADMIN.REGISTRATIONS,
      icon: <FiClipboard />,
      label: 'Registrations',
    },
    { to: ROUTES.ADMIN.FEES, icon: <FiDollarSign />, label: 'Fees' },
    { to: ROUTES.ADMIN.SCHEDULES, icon: <FiFileText />, label: 'Schedules' },
    { to: ROUTES.ADMIN.ROLES, icon: <FiShield />, label: 'Roles' },
    {
      to: ROUTES.ADMIN.PROMOTE_STUDENTS,
      icon: <FiArrowUp />,
      label: 'Promote',
    },
  ];

  const studentNav = [
    { to: ROUTES.DASHBOARD, icon: <FiHome />, label: 'Dashboard' },
    { to: ROUTES.STUDENT.MY_COURSES, icon: <FiBook />, label: 'My Courses' },
    { to: ROUTES.STUDENT.MY_TIMELINE, icon: <FiLayers />, label: 'Timeline' },
    {
      to: ROUTES.STUDENT.MY_STUDY_YEARS,
      icon: <FiCalendar />,
      label: 'Study Years',
    },
    {
      to: ROUTES.STUDENT.DEPARTMENT_COURSES,
      icon: <FiGrid />,
      label: 'Courses',
    },
    // Schedules removed — accessible per-semester inside Study Years
    { to: ROUTES.STUDENT.PROFILE, icon: <FiUser />, label: 'Profile' },
  ];

  const navItems = isAdmin ? adminNav : studentNav;

  return (
    <div className={`app-layout ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Link to={ROUTES.DASHBOARD} className="logo-link">
            <img src={logo} alt="AYA Academy" className="logo-img" />
            {sidebarOpen && <span className="logo-text">AYA Academy</span>}
          </Link>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <span className="nav-icon">
              <FiLogOut />
            </span>
            {sidebarOpen && <span className="nav-label">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-wrapper">
        <header className="top-header">
          <button
            className="toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
          <div className="header-right">
            <div
              className="profile-dropdown"
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <div className="avatar">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="" />
                ) : (
                  <span>{user?.displayName?.charAt(0) || 'U'}</span>
                )}
              </div>
              {
                <div className="profile-info">
                  <span className="profile-name">{user?.displayName}</span>
                  <span className="profile-role">{user?.role}</span>
                </div>
              }
              <FiChevronDown />
              {profileOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <strong>{user?.displayName}</strong>
                    <small>{user?.email}</small>
                  </div>
                  <div className="dropdown-divider" />
                  {isStudent && (
                    <Link
                      to={ROUTES.STUDENT.PROFILE}
                      className="dropdown-item"
                      onClick={() => setProfileOpen(false)}
                    >
                      <FiUser /> Profile
                    </Link>
                  )}
                  <button className="dropdown-item" onClick={handleLogout}>
                    <FiLogOut /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
