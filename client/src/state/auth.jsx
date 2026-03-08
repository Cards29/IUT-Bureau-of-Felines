import React from "react";
import { apiFetch } from "../utils/api";

const AuthContext = React.createContext(null);

export function AuthProvider({ children }) {
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState(null);
  const [loginOpen, setLoginOpen] = React.useState(false);

  function openLogin()  { setLoginOpen(true);  }
  function closeLogin() { setLoginOpen(false); }

  async function refresh() {
    setLoading(true);
    try {
      const data = await apiFetch("/auth/me");
      setUser(data.isAuthenticated ? data.user : null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { refresh(); }, []);

  async function logout() {
    await apiFetch("/auth/logout", { method: "POST" });
    await refresh();
  }

  return (
    <AuthContext.Provider value={{ loading, user, refresh, logout, loginOpen, openLogin, closeLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}