import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext_helper";
// export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/auth/me`,
        {
          credentials: "include",
        }
      );

      if (!res.ok) {
        setUser(null);
        setLoading(false);
        return;
      }

      const data = await res.json();
      setUser(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setUser(null);
      setLoading(false);
    }
  };

  fetchUser();
}, []);

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
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};