import { STORAGE_KEYS, API_ENDPOINTS } from '../constants';

class ApiService {
  constructor() {
    this._isRefreshing = false;
    this._failedQueue = [];
  }

  getToken() {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  getRefreshToken() {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  setTokens(accessToken, refreshToken) {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  }

  clearTokens() {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  getHeaders(isFormData = false) {
    const headers = {};
    if (!isFormData) headers['Content-Type'] = 'application/json';
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  // Queue requests that arrive while a refresh is in progress
  _enqueue() {
    return new Promise((resolve, reject) => {
      this._failedQueue.push({ resolve, reject });
    });
  }

  _flushQueue(error, newToken = null) {
    this._failedQueue.forEach(({ resolve, reject }) => {
      if (error) reject(error);
      else resolve(newToken);
    });
    this._failedQueue = [];
  }

  async _tryRefresh() {
    const refreshToken = this.getRefreshToken();
    console.log('🔄 Attempting refresh...');
    console.log('Refresh token exists:', !!refreshToken);
    console.log('Refresh token value:', refreshToken?.substring(0, 20) + '...');

    if (!refreshToken) throw new Error('No refresh token.');

    const res = await fetch(API_ENDPOINTS.AUTH.REFRESH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    console.log('Refresh response status:', res.status);

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      console.error('Refresh failed response:', errBody);
      window.alert('Session refresh failed. Please log in again.'); // Optional: notify user of refresh failure
      throw new Error('Refresh failed.');
    }

    const data = await res.json();
    console.log(
      '✅ Refresh success, new token:',
      data.accessToken?.substring(0, 20) + '...'
    );
    this.setTokens(data.accessToken, data.refreshToken);
    window.alert('Session refreshed successfully.'); // Optional: notify user of successful refresh
    return data.accessToken;
  }

  async request(url, options = {}) {
    // Build and fire the request
    const makeRequest = token => {
      const headers = this.getHeaders(options.isFormData);
      if (token) headers['Authorization'] = `Bearer ${token}`;
      return fetch(url, {
        ...options,
        headers: { ...headers, ...options.headers },
      });
    };

    let res = await makeRequest(this.getToken());

    // ── 401 handling — try refresh then retry ────────────────────────────
    if (res.status === 401) {
      // If a refresh is already running, wait for it then retry
      if (this._isRefreshing) {
        try {
          const newToken = await this._enqueue();
          res = await makeRequest(newToken);
        } catch {
          this.clearTokens();
          window.location.href = '/login';
          throw { status: 401, errorMessage: 'Session expired.' };
        }
      } else {
        // This request triggers the refresh
        this._isRefreshing = true;

        try {
          const newToken = await this._tryRefresh();
          this._flushQueue(null, newToken); // unblock queued requests
          res = await makeRequest(newToken); // retry this request
        } catch (err) {
          this._flushQueue(err);
          this.clearTokens();
          window.location.href = '/login';
          throw {
            status: 401,
            errorMessage: 'Session expired. Please log in again.',
          };
        } finally {
          this._isRefreshing = false;
        }
      }
    }

    // ── Normal response handling ─────────────────────────────────────────
    if (!res.ok) {
      const err = await res
        .json()
        .catch(() => ({ errorMessage: res.statusText }));
      throw { status: res.status, ...(err || {}) };
    }

    if (res.status === 204) return null;
    return res.json();
  }

  get(url) {
    return this.request(url);
  }
  post(url, data) {
    return this.request(url, { method: 'POST', body: JSON.stringify(data) });
  }
  put(url, data) {
    return this.request(url, { method: 'PUT', body: JSON.stringify(data) });
  }
  patch(url, data) {
    return this.request(url, { method: 'PATCH', body: JSON.stringify(data) });
  }
  del(url) {
    return this.request(url, { method: 'DELETE' });
  }

  postForm(url, formData) {
    return this.request(url, {
      method: 'POST',
      body: formData,
      isFormData: true,
      headers: { Authorization: `Bearer ${this.getToken()}` },
    });
  }
  patchForm(url, formData) {
    return this.request(url, {
      method: 'PATCH',
      body: formData,
      isFormData: true,
      headers: { Authorization: `Bearer ${this.getToken()}` },
    });
  }
}

const apiService = new ApiService();
export default apiService;
