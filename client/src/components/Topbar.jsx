import React from "react";
import { useAuth } from "../state/auth";
import { useTheme } from "../state/theme";

export default function Topbar() {
  const { user, logout, openLogin } = useAuth();
  const { theme, toggle } = useTheme();

  return (
    <div className="navbar bg-base-100 sticky top-0 z-10 border-b-[3px] border-double border-base-300 px-4">
      <div className="navbar-start">
        <div className="font-[Special_Elite] text-[17px] uppercase tracking-wide">Bureau of Felines</div>
      </div>
      <div className="navbar-end">
        <div className="flex items-center gap-2">
          <button className="btn btn-sm" onClick={toggle} title="Toggle theme">
            {theme === "nord" ? "Dark Mode" : "Light Mode"}
          </button>
          {!user ? (
            <button className="btn btn-primary btn-sm" onClick={openLogin}>Log In</button>
          ) : (
            <>
              <div className="avatar">
                <div className="w-8 rounded-full">
                  {user.avatarUrl
                    ? <img src={user.avatarUrl} alt="avatar" />
                    : <div className="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center text-base-content/50">&#128100;</div>
                  }
                </div>
              </div>
              <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: "0.03em" }}>{user.username}</span>
              <button className="btn btn-sm" onClick={logout}>Log Out</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
