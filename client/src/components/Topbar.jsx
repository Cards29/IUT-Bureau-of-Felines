import React from "react";
import { useAuth } from "../state/auth";
import { useTheme } from "../state/theme";

export default function Topbar() {
  const { user, logout, openLogin } = useAuth();
  const { theme, toggle } = useTheme();

  return (
    <div className="topbar">
      <div className="topbarInner">
        <div className="title">Bureau of Felines</div>
        <div className="row">
          <button className="btn small" onClick={toggle} title="Toggle theme">
            {theme === "light" ? "Dark Mode" : "Light Mode"}
          </button>
          {!user ? (
            <button className="btn primary small" onClick={openLogin}>Log In</button>
          ) : (
            <>
              {user.avatarUrl
                ? <img className="avatar" src={user.avatarUrl} alt="avatar" />
                : <div className="avatar" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "var(--muted)" }}>&#128100;</div>
              }
              <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: "0.03em" }}>{user.username}</span>
              <button className="btn small" onClick={logout}>Log Out</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
