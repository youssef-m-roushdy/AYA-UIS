/**
 * Utility functions for handling pagination and filtering in API requests
 */

/**
 * Build query parameters from a filter object
 * Filters out empty, null, and undefined values
 * @param {Object} params - Key-value pairs to add to query string
 * @returns {string} Query string without leading ?
 */
export const buildQueryString = (params = {}) => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value);
    }
  });

  return queryParams.toString();
};

/**
 * Create pagination parameters object
 * @param {number} pageNumber - Current page (1-based)
 * @param {number} pageSize - Items per page
 * @param {string} sortBy - Field to sort by
 * @param {string} sortDirection - 'Ascending' or 'Descending'
 * @returns {Object} Pagination parameters
 */
export const createPaginationParams = (
  pageNumber = 1,
  pageSize = 10,
  sortBy = null,
  sortDirection = 'Ascending'
) => {
  const params = {
    PageNumber: Math.max(1, pageNumber),
    PageSize: Math.max(1, Math.min(pageSize, 50)), // Cap at 50
  };

  if (sortBy) {
    params.SortBy = sortBy;
    params.SortDirection = sortDirection;
  }

  return params;
};

/**
 * Create a combined filter and pagination object
 * @param {Object} filters - Filter criteria
 * @param {number} pageNumber - Current page
 * @param {number} pageSize - Items per page
 * @param {string} sortBy - Field to sort by
 * @param {string} sortDirection - Sort direction
 * @returns {Object} Combined filter and pagination parameters
 */
export const createFilterPageParams = (
  filters = {},
  pageNumber = 1,
  pageSize = 10,
  sortBy = null,
  sortDirection = 'Ascending'
) => {
  return {
    ...filters,
    ...createPaginationParams(pageNumber, pageSize, sortBy, sortDirection),
  };
};

/**
 * Extract pagination metadata from API response
 * @param {Object} response - API response object
 * @returns {Object} Pagination metadata or null if not found
 */
export const extractPaginationMetadata = (response = {}) => {
  return response?.pagination || null;
};

/**
 * Check if there's a next page
 * @param {Object} pagination - Pagination metadata
 * @returns {boolean}
 */
export const hasNextPage = pagination => {
  return pagination?.hasNextPage || false;
};

/**
 * Check if there's a previous page
 * @param {Object} pagination - Pagination metadata
 * @returns {boolean}
 */
export const hasPreviousPage = pagination => {
  return pagination?.hasPreviousPage || false;
};

/**
 * Get total number of pages
 * @param {Object} pagination - Pagination metadata
 * @returns {number}
 */
export const getTotalPages = pagination => {
  return pagination?.totalPages || 1;
};

/**
 * Get total count of items
 * @param {Object} pagination - Pagination metadata
 * @returns {number}
 */
export const getTotalCount = pagination => {
  return pagination?.totalCount || 0;
};
