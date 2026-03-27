import { useCallback, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext_helper";
// export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const BASE = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;

  const loadCurrentUser = useCallback(async ({ showLoading = false } = {}) => {
    if (showLoading) {
      setLoading(true);
    }

    try {
      const res = await fetch(
        `${BASE}/api/auth/me`,
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
  }, [BASE]);

  useEffect(() => {
    loadCurrentUser({ showLoading: true });
  }, [loadCurrentUser]);

  const refreshUser = async () => {
    await loadCurrentUser();
  };

  const logout = async () => {
    await fetch(
      `${BASE}/api/auth/logout`,
      {
        method: "POST",
        credentials: "include",
      }
    );
    setUser(null);
  };

  const markNotificationsAsRead = async () => {
    const res = await fetch(`${BASE}/api/auth/notifications/read-all`, {
      method: "PUT",
      credentials: "include",
    });

    if (res.ok) {
      await loadCurrentUser();
      return true;
    }

    return false;
  };

  const clearNotifications = async () => {
    const res = await fetch(`${BASE}/api/auth/notifications`, {
      method: "DELETE",
      credentials: "include",
    });

    if (res.ok) {
      await loadCurrentUser();
      return true;
    }

    return false;
  };

  const removeNotification = async (notificationId) => {
    if (!notificationId) {
      return false;
    }

    const encodedNotificationId = encodeURIComponent(String(notificationId));

    const res = await fetch(`${BASE}/api/auth/notifications/${encodedNotificationId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (res.ok) {
      await loadCurrentUser();
      return true;
    }

    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        logout,
        refreshUser,
        markNotificationsAsRead,
        clearNotifications,
        removeNotification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};