const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5282';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE}/Authentication/Login`,
    REGISTER: `${API_BASE}/Authentication/Register`,
    REGISTER_STUDENT: deptId =>
      `${API_BASE}/Authentication/register-student/${deptId}/department`,
    REFRESH: `${API_BASE}/Authentication/refresh`, // ← ADD
    REVOKE: `${API_BASE}/Authentication/revoke`,
    FORGOT_PASSWORD: `${API_BASE}/Authentication/forgot-password`, // ← ADD
    RESET_PASSWORD: `${API_BASE}/Authentication/reset-password`, // ← ADD
    CHANGE_PASSWORD: `${API_BASE}/Authentication/change-password`, // ← ADD
  },
  USER: {
    BY_ACADEMIC_CODE: code => `${API_BASE}/User/${code}/academic`,
    UPDATE_PROFILE_PICTURE: `${API_BASE}/User/update-profile-picture`,
    UPDATE_SPECIALIZATION: `${API_BASE}/User/update-student-specialization`,
  },
  USERS: {
    BASE: `${API_BASE}/User`,
    PROFILE: academicCode => `${API_BASE}/User/${academicCode}/academic`,
    UPDATE_PROFILE_PICTURE: `${API_BASE}/User/update-profile-picture`,
    UPDATE_SPECIALIZATION: `${API_BASE}/User/update-student-specialization`,
  },
  ROLES: {
    BASE: `${API_BASE}/Roles`,
    BY_ID: id => `${API_BASE}/Roles/${id}`,
    BY_NAME: name => `${API_BASE}/Roles/by-name/${name}`,
    UPDATE_BY_EMAIL: `${API_BASE}/Roles/update-user-role-by-email`,
    UPDATE_BY_CODE: `${API_BASE}/Roles/update-user-role`,
    USER_ROLE_INFO: code => `${API_BASE}/Roles/user-role-info/${code}`,
  },
  DEPARTMENTS: {
    BASE: `${API_BASE}/Departments`,
    BY_ID: id => `${API_BASE}/Departments/${id}`,
  },
  COURSES: {
    BASE: `${API_BASE}/Course`,
    UPLOADS: id => `${API_BASE}/Course/${id}/uploads`,
    REGISTRATIONS: (id, yearId) =>
      `${API_BASE}/Course/${id}/registrations/${yearId}`,
    UPLOAD_FILE: courseId => `${API_BASE}/Course/${courseId}/upload`,
    DEPT_COURSES: deptId => `${API_BASE}/Course/department/${deptId}`,
    PREREQUISITES: id => `${API_BASE}/Course/prequisites/${id}`,
    DEPENDENCIES: id => `${API_BASE}/Course/dependencies/${id}`,
    OPEN_BY_DEPT: deptId => `${API_BASE}/Course/open/department/${deptId}`,
    STATUS: `${API_BASE}/Course/status`,
  },
  REGISTRATIONS: {
    BASE: `${API_BASE}/Registration`,
    BY_ID: id => `${API_BASE}/Registration/${id}`,
    BY_YEAR: yearId => `${API_BASE}/Registration/${yearId}/year`,
    BY_SEMESTER: (yearId, semId) =>
      `${API_BASE}/Registration/${yearId}/year/${semId}/semester`,
  },
  SEMESTERS: {
    BY_YEAR: yearId => `${API_BASE}/Semester/${yearId}/study-year`,
  },
  STUDY_YEARS: {
    BASE: `${API_BASE}/StudyYear`,
    BY_ID: id => `${API_BASE}/StudyYear/${id}`,
  },
  FEES: {
    BASE: `${API_BASE}/Fee`,
    BY_ID: id => `${API_BASE}/Fee/${id}`,
    BY_STUDY_YEAR: studyYearId => `${API_BASE}/Fee/study-year/${studyYearId}`,
    BY_DEPT_AND_YEAR: (deptId, studyYearId) =>
      `${API_BASE}/Fee/department/${deptId}/study-year/${studyYearId}`,
  },
  USER_STUDY_YEARS: {
    BASE: `${API_BASE}/UserStudyYear`,
    BY_ID: id => `${API_BASE}/UserStudyYear/${id}`,
    MY_STUDY_YEARS: `${API_BASE}/UserStudyYear/my-study-years`,
    MY_TIMELINE: `${API_BASE}/UserStudyYear/my-timeline`,
    MY_CURRENT: `${API_BASE}/UserStudyYear/my-current`,
    BY_USER: userId => `${API_BASE}/UserStudyYear/user/${userId}`,
    USER_TIMELINE: userId =>
      `${API_BASE}/UserStudyYear/user/${userId}/timeline`,
    PROMOTE_ALL: `${API_BASE}/UserStudyYear/promote-all`,
    PROMOTE_STUDENT: code =>
      `${API_BASE}/UserStudyYear/promote-student/${code}`,
  },
  DEPARTMENT_FEES: {
    BASE: `${API_BASE}/DepartmentFees`,
    BY_DEPT_GRADE: (name, grade) =>
      `${API_BASE}/DepartmentFees/${name}/${grade}`,
  },
  SCHEDULES: {
    BASE: `${API_BASE}/AcademicSchedule`,
    BY_ID: id => `${API_BASE}/AcademicSchedule/${id}`,
    CREATE: (yearId, deptId, semId) =>
      `${API_BASE}/AcademicSchedule/study-year/${yearId}/department/${deptId}/semester/${semId}`,
    BY_SEMESTER: semId => `${API_BASE}/AcademicSchedule/semester/${semId}`, // ← ADD
  },
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password', // ← ADD
  RESET_PASSWORD: '/reset-password', // ← ADD
  DASHBOARD: '/dashboard',
  ADMIN: {
    DEPARTMENTS: '/admin/departments',
    COURSES: '/admin/courses',
    STUDENTS: '/admin/students',
    USERS: '/admin/users',
    STUDY_YEARS: '/admin/study-years',
    REGISTRATIONS: '/admin/registrations',
    FEES: '/admin/fees',
    SCHEDULES: '/admin/schedules',
    ROLES: '/admin/roles',
    PROMOTE_STUDENTS: '/admin/promote-students',
  },
  STUDENT: {
    MY_COURSES: '/student/my-courses',
    REGISTER_COURSES: '/student/register',
    MY_TIMELINE: '/student/timeline',
    MY_STUDY_YEARS: '/student/my-study-years',
    DEPARTMENT_COURSES: '/student/courses',
    STUDY_YEAR_SEMESTERS: '/student/study-year/:studyYearId/semesters',
    SEMESTER_COURSES:
      '/student/study-year/:studyYearId/semester/:semesterId/courses',
    COURSE_UPLOADS: '/student/course/:courseId/uploads',
    PROFILE: '/student/profile',
    SCHEDULES: '/student/schedules',
    CHANGE_PASSWORD: '/student/change-password',
  },
};

export const GENDER_OPTIONS = {
  MALE: 'Male',
  FEMALE: 'Female',
};

export const USER_ROLES = {
  ADMIN: 'Admin',
  INSTRUCTOR: 'Instructor',
  STUDENT: 'Student',
};
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'userData',
};
export const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};
export const REGISTRATION_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  SUSPENDED: 'Suspended',
  REJECTED: 'Rejected',
};
export const COURSE_PROGRESS = {
  COMPLETED: 'Completed',
  IN_PROGRESS: 'InProgress',
  NOT_STARTED: 'NotStarted',
};
export const LEVELS = {
  PREPARATORY: 'Preparatory_Year',
  FIRST: 'First_Year',
  SECOND: 'Second_Year',
  THIRD: 'Third_Year',
  FOURTH: 'Fourth_Year',
  GRADUATE: 'Graduate',
};
export const LEVEL_LABELS = {
  Preparatory_Year: 'Preparatory',
  First_Year: '1st Year',
  Second_Year: '2nd Year',
  Third_Year: '3rd Year',
  Fourth_Year: '4th Year',
  Graduate: 'Graduate',
};
export const SEMESTER_TYPES = {
  FIRST: 'First_Semester',
  SECOND: 'Second_Semester',
  SUMMER: 'Summer',
};
export const GRADE_LABELS = {
  A_Plus: 'A+',
  A: 'A',
  A_Minus: 'A-',
  B_Plus: 'B+',
  B: 'B',
  B_Minus: 'B-',
  C_Plus: 'C+',
  C: 'C',
  C_Minus: 'C-',
  D_Plus: 'D+',
  D: 'D',
  D_Minus: 'D-',
  F: 'F',
};
