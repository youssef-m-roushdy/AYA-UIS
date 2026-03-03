import apiService from './api';
import { API_ENDPOINTS } from '../constants';
import {
  buildQueryString,
  createFilterPageParams,
} from '../utils/paginationUtils';

const userService = {
  // Get user profile by academic code
  getProfileByAcademicCode: academicCode =>
    apiService.get(API_ENDPOINTS.USERS.PROFILE(academicCode)),

  // Update profile picture
  updateProfilePicture: formData =>
    apiService.patchForm(API_ENDPOINTS.USERS.UPDATE_PROFILE_PICTURE, formData),

  // Update student specialization
  updateSpecialization: (academicCode, data) =>
    apiService.patch(API_ENDPOINTS.USERS.UPDATE_SPECIALIZATION, data),

  // Get all users (non-paginated)
  getAll: (filters = {}) => {
    const queryString = buildQueryString(filters);
    return apiService.get(
      `${API_ENDPOINTS.USERS.BASE}${queryString ? `?${queryString}` : ''}`
    );
  },

  // Get all users with pagination
  getAllPaginated: (
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
    const queryString = buildQueryString(params);
    return apiService.get(
      `${API_ENDPOINTS.USERS.BASE}/paginated${queryString ? `?${queryString}` : ''}`
    );
  },

  // Get all students (non-paginated)
  getAllStudents: (filters = {}) => {
    const queryString = buildQueryString(filters);
    return apiService.get(
      `${API_ENDPOINTS.USERS.BASE}/students${queryString ? `?${queryString}` : ''}`
    );
  },

  // Get all students with pagination
  getAllStudentsPaginated: (
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
    const queryString = buildQueryString(params);
    return apiService.get(
      `${API_ENDPOINTS.USERS.BASE}/students/paginated${queryString ? `?${queryString}` : ''}`
    );
  },

  // Get all ungraduate students (non-paginated)
  getAllUnGraduateStudents: (filters = {}) => {
    const queryString = buildQueryString(filters);
    return apiService.get(
      `${API_ENDPOINTS.USERS.BASE}/ungraduate-students${queryString ? `?${queryString}` : ''}`
    );
  },

  // Get all ungraduate students with pagination
  getAllUnGraduateStudentsPaginated: (
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
    const queryString = buildQueryString(params);
    return apiService.get(
      `${API_ENDPOINTS.USERS.BASE}/ungraduate-students/paginated${queryString ? `?${queryString}` : ''}`
    );
  },
};

export default userService;
