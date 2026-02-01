import React from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">IUT Cat Bureau</div>
      <nav className="nav">
        <NavLink to="/newsfeed">Newsfeed</NavLink>
        <NavLink to="/cats">Cats</NavLink>
        <NavLink to="/users">Users</NavLink>
        <NavLink to="/me">My Profile</NavLink>
      </nav>
    </aside>
  );
}