import api from './api';
import { API_ENDPOINTS, STORAGE_KEYS } from '../constants';

const authService = {
  async login(email, password) {
    const data = await api.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
    if (data?.accessToken && data?.refreshToken && data?.user) {
      api.setTokens(data.accessToken, data.refreshToken); // ← use api helper
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
    }
    return data;
  },

  logout() {
    api.clearTokens(); // ← use api helper (clears all 3 keys)
  },

  async register(userData, role = 'Student') {
    return api.post(`${API_ENDPOINTS.AUTH.REGISTER}?role=${role}`, userData);
  },

  async registerStudent(deptId, studentData) {
    return api.post(API_ENDPOINTS.AUTH.REGISTER_STUDENT(deptId), studentData);
  },

  async resetPassword(data) {
    return api.put(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  getCurrentUser() {
    const u = localStorage.getItem(STORAGE_KEYS.USER);
    return u ? JSON.parse(u) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  // Helper methods for role-based access control
  getUserRole() {
    const user = this.getCurrentUser();
    return user?.role || null;
  },

  hasRole(role) {
    return this.getUserRole() === role;
  },
};

export default authService;
