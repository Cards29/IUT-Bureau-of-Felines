import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../state/auth";

export default function Sidebar({ open }) {
  const { isAdmin } = useAuth();

  if (!open) return null;

  const activeClass =
    "font-bold border-l-4 border-primary pl-2 max-[960px]:border-l-0 max-[960px]:border-b-4 max-[960px]:border-t-0 max-[960px]:pl-0";

  return (
    <aside className="bg-base-200 border-r-2 border-base-300 sticky top-0 h-screen w-[250px] flex flex-col overflow-y-auto max-[960px]:w-full max-[960px]:h-auto max-[960px]:flex-row max-[960px]:border-r-0 max-[960px]:border-b-2">
      <div className="p-4 border-b-2 border-base-300 bg-base-100 max-[960px]:border-b-0 max-[960px]:border-r-2">
        <div className="font-[Special_Elite] text-[16px] font-bold uppercase tracking-wide text-primary">
          IUT Bureau of Felines
        </div>
        <div className="text-[10px] uppercase tracking-widest text-base-content/50 mt-0.5">Official Records Office</div>
      </div>
      <nav className="menu menu-vertical flex-1 p-2 text-[17px] max-[960px]:menu-horizontal max-[960px]:flex-wrap">
        <NavLink
          to="/newsfeed"
          className={({ isActive }) => isActive ? activeClass : "font-medium"}
        >
          &#9632; Newsfeed
        </NavLink>
        <NavLink
          to="/cats"
          className={({ isActive }) => isActive ? activeClass : "font-medium"}
        >
          &#9632; Cats
        </NavLink>
        <NavLink
          to="/users"
          className={({ isActive }) => isActive ? activeClass : "font-medium"}
        >
          &#9632; Users
        </NavLink>
        <NavLink
          to="/me"
          className={({ isActive }) => isActive ? activeClass : "font-medium"}
        >
          &#9632; My Profile
        </NavLink>
        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) => isActive ? activeClass : "font-medium"}
          >
            &#9632; Admin
          </NavLink>
        )}
      </nav>
    </aside>
  );
}
