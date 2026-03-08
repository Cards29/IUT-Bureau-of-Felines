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

export default function App() {
  return (
    <div className="appShell">
      <Sidebar />
      <main className="main">
        <Topbar />
        <Routes>
          <Route path="/" element={<Navigate to="/newsfeed" replace />} />
          <Route path="/newsfeed" element={<Newsfeed />} />
          <Route path="/cats" element={<Cats />} />
          <Route path="/cats/:id" element={<CatProfile />} />
          <Route path="/users" element={<Users />} />
          <Route path="/users/:id" element={<UserProfile />} />
          <Route path="/me" element={<MyProfile />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="*" element={<div className="card">Not found</div>} />
        </Routes>
      </main>
      <AuthModal />
    </div>
  );
}