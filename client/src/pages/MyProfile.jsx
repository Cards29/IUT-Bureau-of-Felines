import React from "react";
import { apiFetch } from "../utils/api";
import { useAuth } from "../state/auth";
import PostCard from "../components/PostCard";
import InfiniteSentinel from "../components/InfiniteSentinel";
import { Navigate, Link } from "react-router-dom";

export default function MyProfile() {
  const { user, loading, refresh } = useAuth();
  const [username, setUsername] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const [posts, setPosts] = React.useState([]);
  const [cursor, setCursor] = React.useState(null);
  const [hasMore, setHasMore] = React.useState(true);
  const [loadingPosts, setLoadingPosts] = React.useState(false);

  React.useEffect(() => {
    if (user?.username) setUsername(user.username);
  }, [user]);

  async function loadMore(reset = false) {
    if (!user?.id) return;
    if (loadingPosts) return;
    if (!hasMore && !reset) return;
    setLoadingPosts(true);
    try {
      const qs = new URLSearchParams();
      qs.set("limit", "10");
      if (!reset && cursor) qs.set("cursor", cursor);
      const data = await apiFetch(`/users/${user.id}/posts?${qs.toString()}`);
      if (reset) setPosts(data.items || []);
      else setPosts(prev => [...prev, ...(data.items || [])]);
      setHasMore(Boolean(data.hasMore));
      setCursor(data.nextCursor || null);
    } finally {
      setLoadingPosts(false);
    }
  }

  React.useEffect(() => {
    if (user?.id) {
      setPosts([]);
      setCursor(null);
      setHasMore(true);
      loadMore(true);
    }
  }, [user?.id]);

  async function saveUsername() {
    setSaving(true);
    try {
      await apiFetch("/auth/me/username", {
        method: "PATCH",
        body: JSON.stringify({ username }),
      });
      await refresh();
      alert("Username updated");
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="card">Loading...</div>;
  if (!user) return <Navigate to="/newsfeed" replace />;

  return (
    <div>
      <div className="card">
        <div style={{ fontWeight: 900 }}>My Profile</div>
        <div style={{ height: 10 }} />
        <input className="input" value={username} onChange={e => setUsername(e.target.value)} />
        <div style={{ height: 10 }} />
        <button className="btn primary" disabled={saving} onClick={saveUsername}>
          {saving ? "Saving..." : "Save"}
        </button>
        <div style={{ height: 10 }} />
        <Link to="/me/cats" className="btn">My Cat Requests</Link>
      </div>

      {posts.map(p => (
        <PostCard key={p._id} post={p} onVoted={(score) => {
          setPosts(prev => prev.map(x => x._id === p._id ? { ...x, voteScore: score } : x));
        }} onDelete={(id) => setPosts(prev => prev.filter(x => x._id !== id))} />
      ))}

      {loadingPosts ? <div className="card">Loading...</div> : null}
      <InfiniteSentinel disabled={!hasMore || loadingPosts} onVisible={() => loadMore(false)} />
    </div>
  );
}