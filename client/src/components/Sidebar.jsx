import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../state/auth";

export default function Sidebar() {
  const { isAdmin } = useAuth();
  return (
    <aside className="sidebar">
      <div className="sidebarHeader">
        <div className="brand">IUT Bureau of Felines</div>
        <div className="brandSub">Official Records Office</div>
      </div>
      <nav className="nav">
        <NavLink to="/newsfeed">&#9632; Newsfeed</NavLink>
        <NavLink to="/cats">&#9632; Cats</NavLink>
        <NavLink to="/users">&#9632; Users</NavLink>
        <NavLink to="/me">&#9632; My Profile</NavLink>
        {isAdmin && <NavLink to="/admin">&#9632; Admin</NavLink>}
      </nav>
    </aside>
  );
}
