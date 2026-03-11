import React from "react";
import toast from "react-hot-toast";
import { apiFetch } from "../utils/api";
import { useAuth } from "../state/auth";
import PostCard from "../components/PostCard";
import InfiniteSentinel from "../components/InfiniteSentinel";
import { Navigate, Link } from "react-router-dom";

export default function MyProfile() {
  const { user, loading, refresh } = useAuth();
  const [username, setUsername] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [usernameError, setUsernameError] = React.useState(null);

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
    setUsernameError(null);
    setSaving(true);
    try {
      await apiFetch("/auth/me/username", {
        method: "PATCH",
        body: JSON.stringify({ username }),
      });
      await refresh();
      toast.success("Username updated.");
    } catch (e) {
      setUsernameError(e.message);
      toast.error(e.message || "Failed to update username.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="card">Loading...</div>;
  if (!user) return <Navigate to="/newsfeed" replace />;

  return (
    <div style={{ maxWidth: 700 }}>
      <div className="card">
        <div style={{ fontFamily: "Special Elite, serif", fontSize: 18, marginBottom: 14, letterSpacing: "0.04em" }}>
          Personnel Record
        </div>
        <div className="muted" style={{ fontSize: 12, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6 }}>Username</div>
        <input className="input" value={username} onChange={e => setUsername(e.target.value)} />
        {usernameError && <div style={{ color: "var(--danger)", fontSize: 13, marginTop: 6 }}>{usernameError}</div>}
        <div style={{ height: 10 }} />
        <div className="row" style={{ gap: 8 }}>
          <button className="btn primary" disabled={saving || username === user.username} onClick={saveUsername}>
            {saving ? "Saving..." : "Save Username"}
          </button>
          <Link to="/me/cats" className="btn">My Cat Requests</Link>
        </div>
      </div>

      <div style={{ marginBottom: 10, fontFamily: "Special Elite, serif", fontSize: 14, letterSpacing: "0.04em", color: "var(--muted)", textTransform: "uppercase" }}>
        My Filed Reports
      </div>

      <div className="postFeed" style={{ maxWidth: "100%" }}>
        {posts.map(p => (
          <PostCard key={p._id} post={p} onVoted={(score) => {
            setPosts(prev => prev.map(x => x._id === p._id ? { ...x, voteScore: score } : x));
          }} onDelete={(id) => setPosts(prev => prev.filter(x => x._id !== id))} />
        ))}

        {loadingPosts ? (
          <div className="skeletonCard">
            <div className="skeletonLine" style={{ width: "40%", height: 10, marginBottom: 10 }} />
            <div className="skeletonLine" style={{ width: "70%", height: 18 }} />
          </div>
        ) : null}

        {!loadingPosts && posts.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "24px 16px", color: "var(--muted)" }}>
            <div style={{ fontFamily: "Special Elite, serif", fontSize: 16, marginBottom: 4 }}>No reports filed.</div>
            <div style={{ fontSize: 13 }}>Your submitted commendations and infractions will appear here.</div>
          </div>
        ) : null}

        <InfiniteSentinel disabled={!hasMore || loadingPosts} onVisible={() => loadMore(false)} />
        {!hasMore && posts.length > 0 ? (
          <div className="muted" style={{ textAlign: "center", padding: "12px 0", fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            — End of Records —
          </div>
        ) : null}
      </div>
    </div>
  );
}
