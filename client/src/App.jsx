import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import AuthModal from "./components/AuthModal";
import Newsfeed from "./pages/Newsfeed";
import Cats from "./pages/Cats";
import CatProfile from "./pages/CatProfile";
import Users from "./pages/Users";
import UserProfile from "./pages/UserProfile";
import MyProfile from "./pages/MyProfile";
import PostDetail from "./pages/PostDetail";
import Admin from "./pages/Admin";

import MyCats from "./pages/MyCats";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  return (
    <div className={`grid min-h-screen max-[960px]:grid-cols-1 ${sidebarOpen ? "grid-cols-[250px_1fr]" : "grid-cols-1"}`}>
      <Sidebar open={sidebarOpen} />
      <main className="flex-1 px-5 pb-5 min-w-0">
        <Topbar onToggleSidebar={() => setSidebarOpen((o) => !o)} />
        <Routes>
          <Route path="/" element={<Navigate to="/newsfeed" replace />} />
          <Route path="/newsfeed" element={<Newsfeed />} />
          <Route path="/cats" element={<Cats />} />
          <Route path="/cats/:id" element={<CatProfile />} />
          <Route path="/users" element={<Users />} />
          <Route path="/users/:id" element={<UserProfile />} />
          <Route path="/me" element={<MyProfile />} />
          <Route path="/me/cats" element={<MyCats />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<div className="card bg-base-100 shadow-sm border border-base-300">Not found</div>} />
        </Routes>
      </main>
      <AuthModal />
    </div>
  );
}