import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../state/auth";
import { useTheme } from "../state/theme";

function usePageTitle() {
  const { pathname } = useLocation();
  if (pathname === "/newsfeed") return "Daily Incident Reports";
  if (pathname === "/cats") return "Feline Registry";
  if (/^\/cats\/[^/]+$/.test(pathname)) return "Subject File";
  if (pathname === "/users") return "Personnel Directory";
  if (/^\/users\/[^/]+$/.test(pathname)) return "Personnel Record";
  if (pathname === "/me/cats") return "My Submissions";
  if (pathname === "/me") return "My Personnel Record";
  if (/^\/posts\/[^/]+$/.test(pathname)) return "Report Detail";
  if (pathname === "/admin") return "Administrative Office";
  return "IUT Bureau of Felines";
}

export default function Topbar({ onToggleSidebar }) {
  const { user, logout, openLogin } = useAuth();
  const { theme, toggle } = useTheme();
  const title = usePageTitle();

  return (
    <div className="navbar bg-base-100 sticky top-0 z-10 border-b-[3px] border-double border-base-300 px-4">
      <div className="navbar-start gap-2">
        <button
          className="btn btn-ghost btn-sm px-2"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
        >
          &#9776;
        </button>
        <div className="font-[Special_Elite] text-[17px] uppercase tracking-wide">{title}</div>
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
              <span className="font-bold text-[13px] tracking-[0.03em]">{user.username}</span>
              <button className="btn btn-sm" onClick={logout}>Log Out</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
