import api from './api';
import { API_ENDPOINTS } from '../constants';

export const studyYearService = {
  getAll: () => api.get(API_ENDPOINTS.STUDY_YEARS.BASE),
  create: data => api.post(API_ENDPOINTS.STUDY_YEARS.BASE, data),
};

export const semesterService = {
  getByYear: yearId => api.get(API_ENDPOINTS.SEMESTERS.BY_YEAR(yearId)),
  create: (yearId, data) =>
    api.post(API_ENDPOINTS.SEMESTERS.BY_YEAR(yearId), data),
};

export const userStudyYearService = {
  create: data => api.post(API_ENDPOINTS.USER_STUDY_YEARS.BASE, data),
  update: (id, data) => api.put(API_ENDPOINTS.USER_STUDY_YEARS.BY_ID(id), data),
  getMyStudyYears: () => api.get(API_ENDPOINTS.USER_STUDY_YEARS.MY_STUDY_YEARS),
  getMyTimeline: () => api.get(API_ENDPOINTS.USER_STUDY_YEARS.MY_TIMELINE),
  getMyCurrent: () => api.get(API_ENDPOINTS.USER_STUDY_YEARS.MY_CURRENT),
  getByUser: userId => api.get(API_ENDPOINTS.USER_STUDY_YEARS.BY_USER(userId)),
  getUserTimeline: userId =>
    api.get(API_ENDPOINTS.USER_STUDY_YEARS.USER_TIMELINE(userId)),
  promoteAll: () => api.post(API_ENDPOINTS.USER_STUDY_YEARS.PROMOTE_ALL),
  promoteStudent: code =>
    api.post(API_ENDPOINTS.USER_STUDY_YEARS.PROMOTE_STUDENT(code)),
};

export const feeService = {
  create: data => api.post(API_ENDPOINTS.FEES.BASE, data),
  getByStudyYear: studyYearId =>
    api.get(API_ENDPOINTS.FEES.BY_STUDY_YEAR(studyYearId)),
  getByDeptAndYear: (deptId, studyYearId) =>
    api.get(API_ENDPOINTS.FEES.BY_DEPT_AND_YEAR(deptId, studyYearId)),
  update: (id, data) => api.put(API_ENDPOINTS.FEES.BY_ID(id), data),
  del: id => api.del(API_ENDPOINTS.FEES.BY_ID(id)),
};

export const scheduleService = {
  getAll: () => api.get(API_ENDPOINTS.SCHEDULES.BASE),
  getById: id => api.get(API_ENDPOINTS.SCHEDULES.BY_ID(id)),
  create: (yearId, deptId, semId, formData) =>
    api.postForm(
      API_ENDPOINTS.SCHEDULES.CREATE(yearId, deptId, semId),
      formData
    ),
  update: (id, data) => api.put(API_ENDPOINTS.SCHEDULES.BY_ID(id), data),
  del: id => api.del(API_ENDPOINTS.SCHEDULES.BY_ID(id)),
  getBySemester: semId => api.get(API_ENDPOINTS.SCHEDULES.BY_SEMESTER(semId)), // ← ADD
};

export const roleService = {
  getAll: () => api.get(API_ENDPOINTS.ROLES.BASE),
  getById: id => api.get(API_ENDPOINTS.ROLES.BY_ID(id)),
  create: data => api.post(API_ENDPOINTS.ROLES.BASE, data),
  update: (id, data) => api.put(API_ENDPOINTS.ROLES.BY_ID(id), data),
  del: id => api.del(API_ENDPOINTS.ROLES.BY_ID(id)),
  updateUserRoleByEmail: data =>
    api.put(API_ENDPOINTS.ROLES.UPDATE_BY_EMAIL, data),
  getUserRoleInfo: code => api.get(API_ENDPOINTS.ROLES.USER_ROLE_INFO(code)),
};

export const userService = {
  getByAcademicCode: code => api.get(API_ENDPOINTS.USER.BY_ACADEMIC_CODE(code)),
  updateProfilePicture: formData =>
    api.patchForm(API_ENDPOINTS.USER.UPDATE_PROFILE_PICTURE, formData),
  updateSpecialization: data =>
    api.patch(API_ENDPOINTS.USER.UPDATE_SPECIALIZATION, data),

  // New method for getting all students with filters
  getAllStudents: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `/api/User/students${queryString ? `?${queryString}` : ''}`;
    return api.get(url);
  },

  // Get ungraduated students (excluding Graduate level)
  getUngraduatedStudents: (params = {}) => {
    // Explicitly exclude Graduate level by not including it in params
    // The API will return all students, we filter in the component
    const queryString = new URLSearchParams(params).toString();
    const url = `/api/User/ungraduate-students${queryString ? `?${queryString}` : ''}`;
    return api.get(url);
  },
};
