import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../state/auth";

export default function Sidebar() {
  const { isAdmin } = useAuth();
  return (
    <aside className="sidebar">
      <div className="brand">IUT Cat Bureau</div>
      <nav className="nav">
        <NavLink to="/newsfeed">Newsfeed</NavLink>
        <NavLink to="/cats">Cats</NavLink>
        <NavLink to="/users">Users</NavLink>
        <NavLink to="/me">My Profile</NavLink>
        {isAdmin && <NavLink to="/admin">Admin</NavLink>}
      </nav>
    </aside>
  );
}