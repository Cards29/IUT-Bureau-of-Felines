import React from "react";
import { useAuth } from "../state/auth";
import { useTheme } from "../state/theme";

export default function Topbar() {
  const { user, logout, openLogin } = useAuth();
  const { theme, toggle } = useTheme();

  return (
    <div className="topbar">
      <div className="topbarInner">
        <div className="title">The Bureau</div>
        <div className="row">
          <button className="btn small" onClick={toggle}>
            {theme === "light" ? "Dark" : "Light"}
          </button>
          {!user ? (
            <button className="btn primary" onClick={openLogin}>Login</button>
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