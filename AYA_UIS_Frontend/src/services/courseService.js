import api from './api';
import { API_ENDPOINTS } from '../constants';

const courseService = {
  getAll: () => api.get(API_ENDPOINTS.COURSES.BASE),
  create: data => api.post(API_ENDPOINTS.COURSES.BASE, data),
  getUploads: id => api.get(API_ENDPOINTS.COURSES.UPLOADS(id)),
  getRegistrations: (id, yearId) =>
    api.get(API_ENDPOINTS.COURSES.REGISTRATIONS(id, yearId)),
  uploadFile: (courseId, formData) =>
    api.postForm(API_ENDPOINTS.COURSES.UPLOAD_FILE(courseId), formData),
  getDeptCourses: deptId => api.get(API_ENDPOINTS.COURSES.DEPT_COURSES(deptId)),
  getPrerequisites: id => api.get(API_ENDPOINTS.COURSES.PREREQUISITES(id)),
  getDependencies: id => api.get(API_ENDPOINTS.COURSES.DEPENDENCIES(id)),
  getDeptOpenCourses: deptId =>
    api.get(API_ENDPOINTS.COURSES.OPEN_BY_DEPT(deptId)),
};

export default courseService;
