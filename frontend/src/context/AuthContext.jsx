import { useCallback, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext_helper";
// export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadCurrentUser = useCallback(async ({ showLoading = false } = {}) => {
    if (showLoading) {
      setLoading(true);
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/auth/me`,
        {
          credentials: "include",
        }
      );

      if (!res.ok) {
        setUser(null);
        return null;
      }

      const data = await res.json();
      setUser(data);
      return data;
    } catch (err) {
      console.error(err);
      setUser(null);
      return null;
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadCurrentUser({ showLoading: true });
  }, [loadCurrentUser]);

  const refreshUser = async () => {
    await loadCurrentUser();
  };

  const logout = async () => {
    await fetch(
      `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/auth/logout`,
      {
        method: "POST",
        credentials: "include",
      }
    );
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};