import apiService from './api';
import { API_ENDPOINTS } from '../constants';

const courseService = {
  getAll: () => apiService.get(API_ENDPOINTS.COURSES.BASE),
  getAllWithFilters: params => {
    // Convert params object to query string
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    const queryString = queryParams.toString();
    return apiService.get(
      `${API_ENDPOINTS.COURSES.BASE}${queryString ? `?${queryString}` : ''}`
    );
  },
  create: data => apiService.post(API_ENDPOINTS.COURSES.BASE, data),
  updateStatus: (courseId, status) => {
    const command = {
      CourseId: courseId,
      Status: status,
    };
    return apiService.patch(API_ENDPOINTS.COURSES.STATUS, command);
  },
  getUploads: id => apiService.get(API_ENDPOINTS.COURSES.UPLOADS(id)),
  getRegistrations: (id, yearId) =>
    apiService.get(API_ENDPOINTS.COURSES.REGISTRATIONS(id, yearId)),
  uploadFile: (courseId, formData) =>
    apiService.postForm(API_ENDPOINTS.COURSES.UPLOAD_FILE(courseId), formData),
  getDeptCourses: (deptId, params = {}) => {
    // Build URL with query parameters
    const url = API_ENDPOINTS.COURSES.DEPT_COURSES(deptId);
    const queryParams = new URLSearchParams();

    // Add status filter if provided
    if (params.Status) {
      queryParams.append('Status', params.Status);
    }

    const queryString = queryParams.toString();
    return apiService.get(`${url}${queryString ? `?${queryString}` : ''}`);
  },
  getPrerequisites: id =>
    apiService.get(API_ENDPOINTS.COURSES.PREREQUISITES(id)),
  getDependencies: id => apiService.get(API_ENDPOINTS.COURSES.DEPENDENCIES(id)),
  getDeptOpenCourses: deptId =>
    apiService.get(API_ENDPOINTS.COURSES.OPEN_BY_DEPT(deptId)),
};

export default courseService;
