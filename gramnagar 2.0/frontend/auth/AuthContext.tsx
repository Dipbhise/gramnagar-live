import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { User, AuthState } from '../types';
import { STORAGE_KEYS } from '../constants';

interface AuthContextType extends AuthState {
  login: (user: User, token: string, organization: string, organizationName: string) => void;
  logout: () => void;
  hasRole: (role: User['role']) => boolean;
  organization: string | null;  // Current portal organization
  organizationName: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });
  
  const [organization, setOrganization] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState<string | null>(null);

  /* =========================
     Bootstrap auth on reload
  ========================= */
  useEffect(() => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const userJson = localStorage.getItem(STORAGE_KEYS.USER);
      const org = localStorage.getItem(STORAGE_KEYS.ORGANIZATION);
      const orgName = localStorage.getItem(STORAGE_KEYS.ORGANIZATION_NAME);

      if (token && userJson && org) {
        const user: User = JSON.parse(userJson);
        setState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
        setOrganization(org);
        setOrganizationName(orgName);
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch {
      clearAuth();
    }
  }, []);

  /* =========================
     Helpers
  ========================= */
  const clearAuth = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.ORGANIZATION);
    localStorage.removeItem(STORAGE_KEYS.ORGANIZATION_NAME);
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
    setOrganization(null);
    setOrganizationName(null);
  };

  /* =========================
     Public API
  ========================= */
  const login = (user: User, token: string, organization: string, organizationName: string) => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.ORGANIZATION, organization);
    localStorage.setItem(STORAGE_KEYS.ORGANIZATION_NAME, organizationName);

    setState({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
    setOrganization(organization);
    setOrganizationName(organizationName);
  };

  const logout = () => {
    clearAuth();
  };

  const hasRole = (role: User['role']) => {
    return state.user?.role === role;
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        hasRole,
        organization,
        organizationName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* =========================
   Hook
========================= */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
