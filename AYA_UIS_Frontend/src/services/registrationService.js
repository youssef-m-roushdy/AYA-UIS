import api from './api';
import { API_ENDPOINTS } from '../constants';
import {
  buildQueryString,
  createFilterPageParams,
} from '../utils/paginationUtils';

const registrationService = {
  register: data => api.post(API_ENDPOINTS.REGISTRATIONS.BASE, data),
  update: (id, data) => api.put(API_ENDPOINTS.REGISTRATIONS.BY_ID(id), data),
  del: id => api.del(API_ENDPOINTS.REGISTRATIONS.BY_ID(id)),
  getMyCourses: () => api.get(API_ENDPOINTS.REGISTRATIONS.BASE),
  getByYear: yearId => api.get(API_ENDPOINTS.REGISTRATIONS.BY_YEAR(yearId)),
  getBySemester: (yearId, semId) =>
    api.get(API_ENDPOINTS.REGISTRATIONS.BY_SEMESTER(yearId, semId)),
  getPendingRegistrationsPaginated: (
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
    return api.get(
      `${API_ENDPOINTS.REGISTRATIONS.PENDING(filters.studyYearId, filters.semesterId)}${queryString ? `?${queryString}` : ''}`
    );
  },
};

export default registrationService;
