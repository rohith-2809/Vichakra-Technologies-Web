import axios from 'axios';
import { createContext, useCallback, useEffect, useState } from 'react';
import api, { setAccessToken, clearAccessToken } from '../api/axios';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // true while restoring session

  // Restore session on app mount via silent refresh.
  // Uses plain axios (NOT the intercepted api instance) so a 401 here
  // never triggers the interceptor's own refresh → avoids infinite loop.
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.post(
          '/api/auth/refresh',
          {},
          { withCredentials: true }
        );
        setAccessToken(data.accessToken);
        const me = await api.get('/auth/me');
        setUser(me.data.user);
      } catch {
        // No valid session — stay logged out, clear any stale token
        clearAccessToken();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Proceed with client-side logout even if server call fails
    }
    clearAccessToken();
    setUser(null);
  }, []);

  const updateUser = useCallback((patch) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : null));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
