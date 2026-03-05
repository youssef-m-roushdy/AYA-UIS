import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
} from 'react';
import authService from '../services/authService';
import { STATUS, USER_ROLES } from '../constants';

const AuthContext = createContext(null);

const initialState = {
  user: authService.getCurrentUser(),
  isAuthenticated: authService.isAuthenticated(),
  status: STATUS.IDLE,
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOADING':
      return { ...state, status: STATUS.LOADING, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        status: STATUS.SUCCESS,
        error: null,
      };
    case 'UPDATE_USER':
      // Merge only the changed fields into the existing user object
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        status: STATUS.IDLE,
        error: null,
      };
    case 'ERROR':
      return { ...state, status: STATUS.ERROR, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null, status: STATUS.IDLE };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = useCallback(async (email, password) => {
    dispatch({ type: 'LOADING' });
    try {
      const data = await authService.login(email, password);
      console.log('Login successful:', data);
      dispatch({ type: 'LOGIN_SUCCESS', payload: data.user });
      return data;
    } catch (err) {
      dispatch({
        type: 'ERROR',
        payload: err?.errorMessage || err?.ErrorMessage || 'Login failed',
      });
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
  }, []);

  const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), []);

  /**
   * updateUser — patch specific fields into the user state immediately.
   * Usage: updateUser({ profilePicture: newUrl })
   * This avoids a full re-fetch; the component passes only what changed.
   */
  const updateUser = useCallback((fields) => {
    dispatch({ type: 'UPDATE_USER', payload: fields });
  }, []);

  // Helper functions to check user roles
  const hasRole = useCallback(
    role => Array.isArray(state.user?.roles) && state.user.roles.includes(role),
    [state.user]
  );

  const hasAnyRole = useCallback(
    roles =>
      Array.isArray(state.user?.roles) &&
      roles.some(role => state.user.roles.includes(role)),
    [state.user]
  );

  const hasAllRoles = useCallback(
    roles =>
      Array.isArray(state.user?.roles) &&
      roles.every(role => state.user.roles.includes(role)),
    [state.user]
  );

  // Computed properties for common role checks
  const roleChecks = useMemo(
    () => ({
      isAdmin:      hasRole(USER_ROLES.ADMIN),
      isStudent:    hasRole(USER_ROLES.STUDENT),
      isInstructor: hasRole(USER_ROLES.INSTRUCTOR),
      isSuperAdmin: hasRole(USER_ROLES.SUPER_ADMIN),
    }),
    [hasRole]
  );

  const roles = useMemo(() => state.user?.roles || [], [state.user]);

  const can = useCallback(
    permission => {
      const permissions = {
        'create-course':  [USER_ROLES.ADMIN, USER_ROLES.INSTRUCTOR],
        'delete-course':  [USER_ROLES.ADMIN],
        'enroll-course':  [USER_ROLES.STUDENT],
        'grade-students': [USER_ROLES.INSTRUCTOR, USER_ROLES.ADMIN],
        'view-reports':   [USER_ROLES.ADMIN, USER_ROLES.INSTRUCTOR],
      };
      const requiredRoles = permissions[permission];
      return requiredRoles ? hasAnyRole(requiredRoles) : false;
    },
    [hasAnyRole]
  );

  return (
    <AuthContext.Provider
      value={{
        ...state,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        status: state.status,
        error: state.error,
        login,
        logout,
        clearError,
        updateUser,
        // Role checking functions
        hasRole,
        hasAnyRole,
        hasAllRoles,
        can,
        // Common role checks
        ...roleChecks,
        // All roles
        roles,
        primaryRole: roles[0],
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}