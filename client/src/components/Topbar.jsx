import React from "react";
import { useAuth } from "../state/auth";
import { useTheme } from "../state/theme";
import { getApiBase } from "../utils/api";

export default function Topbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const apiBase = getApiBase();

  return (
    <div className="topbar">
      <div className="topbarInner">
        <div className="title">The Bureau</div>
        <div className="row">
          <button className="btn small" onClick={toggle}>
            {theme === "light" ? "Dark" : "Light"}
          </button>
          {!user ? (
            <a className="btn primary" href={`${apiBase}/auth/google`}>Login</a>
          ) : (
            <>
              {user.avatarUrl ? <img className="avatar" src={user.avatarUrl} alt="avatar" /> : <div className="avatar" />}
              <div style={{ fontWeight: 800 }}>{user.username}</div>
              <button className="btn" onClick={logout}>Logout</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}