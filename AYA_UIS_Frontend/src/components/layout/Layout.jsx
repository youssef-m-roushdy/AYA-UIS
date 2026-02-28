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
  const {
    user,
    logout,
    isAdmin,
    isStudent,
    isInstructor,
    roles,
    primaryRole,
    hasAnyRole,
    hasRole,
  } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  // Admin navigation
  const adminNav = [
    {
      to: ROUTES.DASHBOARD,
      icon: <FiHome />,
      label: 'Dashboard',
      roles: ['Admin'],
    },
    {
      to: ROUTES.ADMIN.DEPARTMENTS,
      icon: <FiGrid />,
      label: 'Departments',
      roles: ['Admin'],
    },
    {
      to: ROUTES.ADMIN.COURSES,
      icon: <FiBook />,
      label: 'Courses',
      roles: ['Admin'],
    },
    {
      to: ROUTES.ADMIN.STUDENTS,
      icon: <FiUsers />,
      label: 'Students',
      roles: ['Admin'],
    },
    {
      to: ROUTES.ADMIN.STUDY_YEARS,
      icon: <FiCalendar />,
      label: 'Study Years',
      roles: ['Admin'],
    },
    {
      to: ROUTES.ADMIN.REGISTRATIONS,
      icon: <FiClipboard />,
      label: 'Registrations',
      roles: ['Admin'],
    },
    {
      to: ROUTES.ADMIN.FEES,
      icon: <FiDollarSign />,
      label: 'Fees',
      roles: ['Admin'],
    },
    {
      to: ROUTES.ADMIN.SCHEDULES,
      icon: <FiFileText />,
      label: 'Schedules',
      roles: ['Admin', 'Instructor'],
    },
    {
      to: ROUTES.ADMIN.ROLES,
      icon: <FiShield />,
      label: 'Roles',
      roles: ['Admin'],
    },
    {
      to: ROUTES.ADMIN.PROMOTE_STUDENTS,
      icon: <FiArrowUp />,
      label: 'Promote',
      roles: ['Admin'],
    },
  ];

  // Student navigation
  const studentNav = [
    {
      to: ROUTES.DASHBOARD,
      icon: <FiHome />,
      label: 'Dashboard',
      roles: ['Student'],
    },
    {
      to: ROUTES.STUDENT.MY_COURSES,
      icon: <FiBook />,
      label: 'My Courses',
      roles: ['Student'],
    },
    {
      to: ROUTES.STUDENT.MY_TIMELINE,
      icon: <FiLayers />,
      label: 'Timeline',
      roles: ['Student'],
    },
    {
      to: ROUTES.STUDENT.MY_STUDY_YEARS,
      icon: <FiCalendar />,
      label: 'Study Years',
      roles: ['Student'],
    },
    {
      to: ROUTES.STUDENT.DEPARTMENT_COURSES,
      icon: <FiGrid />,
      label: 'Courses',
      roles: ['Student'],
    },
    {
      to: ROUTES.STUDENT.PROFILE,
      icon: <FiUser />,
      label: 'Profile',
      roles: ['Student'],
    },
  ];

  // Combine and filter navigation items based on user roles
  const allNavItems = [...adminNav, ...studentNav];
  const navItems = allNavItems.filter(item => hasAnyRole(item.roles));

  // Get user's display roles
  const displayRoles = roles?.join(', ') || 'No Role';
  const primaryUserRole = primaryRole || 'User';

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
              {sidebarOpen && (
                <div className="profile-info">
                  <span className="profile-name">{user?.displayName}</span>
                  <span className="profile-role">{primaryUserRole}</span>
                  {roles && roles.length > 1 && (
                    <span className="profile-more-roles">
                      +{roles.length - 1} more
                    </span>
                  )}
                </div>
              )}
              <FiChevronDown />
              {profileOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <strong>{user?.displayName}</strong>
                    <small>{user?.email}</small>
                    <div className="user-roles">
                      {roles?.map(role => (
                        <span key={role} className="role-badge">
                          {role}
                        </span>
                      ))}
                    </div>
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
