import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';

// Pages
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Departments from './pages/departments/Departments';
import Courses from './pages/courses/Courses';
import StudyYears from './pages/admin/StudyYears';
import Students from './pages/admin/Students';
import Roles from './pages/admin/Roles';
import PromoteStudents from './pages/admin/PromoteStudents';
import StudyYearFees from './pages/admin/StudyYearFees';
import Users from './pages/admin/Users';
import MyCourses from './pages/student/MyCourses';
import Timeline from './pages/student/Timeline';
import Profile from './pages/student/Profile';
import MyStudyYears from './pages/student/MyStudyYears';
import StudyYearSemesters from './pages/student/StudyYearSemesters';
import SemesterCourses from './pages/student/SemesterCourses';
import CourseUploads from './pages/student/CourseUploads';
import DepartmentCourses from './pages/student/DepartmentCourses';

import './styles/globals.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected – inside Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard - accessible by all authenticated users */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Admin routes - only users with Admin role */}
            <Route
              path="admin/departments"
              element={
                <ProtectedRoute roles={['Admin']}>
                  <Departments />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/courses"
              element={
                <ProtectedRoute roles={['Admin']}>
                  <Courses />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/study-years"
              element={
                <ProtectedRoute roles={['Admin']}>
                  <StudyYears />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/study-years/:studyYearId/fees"
              element={
                <ProtectedRoute roles={['Admin']}>
                  <StudyYearFees />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/students"
              element={
                <ProtectedRoute roles={['Admin']}>
                  <Students />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/roles"
              element={
                <ProtectedRoute roles={['Admin']}>
                  <Roles />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/users"
              element={
                <ProtectedRoute roles={['Admin']}>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/promote-students"
              element={
                <ProtectedRoute roles={['Admin']}>
                  <PromoteStudents />
                </ProtectedRoute>
              }
            />

            {/* Student routes - only users with Student role */}
            <Route
              path="student/my-courses"
              element={
                <ProtectedRoute roles={['Student']}>
                  <MyCourses />
                </ProtectedRoute>
              }
            />
            <Route
              path="student/timeline"
              element={
                <ProtectedRoute roles={['Student']}>
                  <Timeline />
                </ProtectedRoute>
              }
            />
            <Route
              path="student/my-study-years"
              element={
                <ProtectedRoute roles={['Student']}>
                  <MyStudyYears />
                </ProtectedRoute>
              }
            />
            <Route
              path="student/courses"
              element={
                <ProtectedRoute roles={['Student']}>
                  <DepartmentCourses />
                </ProtectedRoute>
              }
            />
            <Route
              path="student/study-year/:studyYearId/semesters"
              element={
                <ProtectedRoute roles={['Student']}>
                  <StudyYearSemesters />
                </ProtectedRoute>
              }
            />
            <Route
              path="student/study-year/:studyYearId/semester/:semesterId/courses"
              element={
                <ProtectedRoute roles={['Student']}>
                  <SemesterCourses />
                </ProtectedRoute>
              }
            />
            <Route
              path="student/course/:courseId/uploads"
              element={
                <ProtectedRoute roles={['Student']}>
                  <CourseUploads />
                </ProtectedRoute>
              }
            />
            <Route
              path="student/profile"
              element={
                <ProtectedRoute roles={['Student']}>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
