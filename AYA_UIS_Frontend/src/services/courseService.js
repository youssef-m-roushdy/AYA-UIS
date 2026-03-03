import apiService from './api';
import { API_ENDPOINTS } from '../constants';
import {
  buildQueryString,
  createFilterPageParams,
} from '../utils/paginationUtils';

const courseService = {
  getAll: () => apiService.get(API_ENDPOINTS.COURSES.BASE),
  getAllWithFilters: params => {
    const queryString = buildQueryString(params);
    return apiService.get(
      `${API_ENDPOINTS.COURSES.BASE}${queryString ? `?${queryString}` : ''}`
    );
  },
  getAllWithPagination: (
    filters = {},
    pageNumber = 1,
    pageSize = 10,
    sortBy = null,
    sortDirection = 'Ascending'
  ) => {
    const params = createFilterPageParams(
      filters,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection
    );
    return courseService.getAllWithFilters(params);
  },
  create: data => apiService.post(API_ENDPOINTS.COURSES.BASE, data),
  updateStatus: formData =>
    apiService.patch(API_ENDPOINTS.COURSES.STATUS, formData),
  getUploads: id => apiService.get(API_ENDPOINTS.COURSES.UPLOADS(id)),
  getRegistrations: (id, yearId) =>
    apiService.get(API_ENDPOINTS.COURSES.REGISTRATIONS(id, yearId)),
  uploadFile: (courseId, formData) =>
    apiService.postForm(API_ENDPOINTS.COURSES.UPLOAD_FILE(courseId), formData),
  getDeptCourses: (
    deptId,
    filters = {},
    pageNumber = 1,
    pageSize = 10,
    sortBy = null,
    sortDirection = 'Ascending'
  ) => {
    const url = API_ENDPOINTS.COURSES.DEPT_COURSES(deptId);
    const params = createFilterPageParams(
      filters,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection
    );
    const queryString = buildQueryString(params);
    return apiService.get(`${url}${queryString ? `?${queryString}` : ''}`);
  },
  getPrerequisites: id =>
    apiService.get(API_ENDPOINTS.COURSES.PREREQUISITES(id)),
  getDependencies: id => apiService.get(API_ENDPOINTS.COURSES.DEPENDENCIES(id)),
  getDeptOpenCourses: deptId =>
    apiService.get(API_ENDPOINTS.COURSES.OPEN_BY_DEPT(deptId)),
};

export default courseService;
