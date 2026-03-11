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

  if (loading) return <div className="card bg-base-100 border border-base-300 p-4">Loading...</div>;
  if (!user) return <Navigate to="/newsfeed" replace />;

  return (
    <div style={{ maxWidth: 700 }}>
      <div className="card bg-base-100 border border-base-300 p-4 mb-4">
        <div className="font-[Special_Elite] text-lg tracking-wide mb-3.5">
          Personnel Record
        </div>
        <div className="text-base-content/60 text-xs tracking-wide uppercase mb-1.5">Username</div>
        <input className="input input-bordered w-full" value={username} onChange={e => setUsername(e.target.value)} />
        {usernameError && <div className="text-error text-xs mt-1">{usernameError}</div>}
        <div className="h-2.5" />
        <div className="flex items-center gap-2">
          <button className="btn btn-primary" disabled={saving || username === user.username} onClick={saveUsername}>
            {saving ? "Saving..." : "Save Username"}
          </button>
          <Link to="/me/cats" className="btn">My Cat Requests</Link>
        </div>
      </div>

      <div className="mb-2.5 font-[Special_Elite] text-[13px] tracking-widest text-base-content/60 uppercase">
        My Filed Reports
      </div>

      <div className="max-w-[700px]">
        {posts.map(p => (
          <PostCard key={p._id} post={p} onVoted={(score) => {
            setPosts(prev => prev.map(x => x._id === p._id ? { ...x, voteScore: score } : x));
          }} onDelete={(id) => setPosts(prev => prev.filter(x => x._id !== id))} />
        ))}

        {loadingPosts ? (
          <div className="skeleton h-32 w-full mb-3" />
        ) : null}

        {!loadingPosts && posts.length === 0 ? (
          <div className="card bg-base-100 border border-base-300 p-4 text-center text-base-content/60 text-sm">
            <div className="font-[Special_Elite] text-base mb-1">No reports filed.</div>
            <div>Your submitted commendations and infractions will appear here.</div>
          </div>
        ) : null}

        <InfiniteSentinel disabled={!hasMore || loadingPosts} onVisible={() => loadMore(false)} />
        {!hasMore && posts.length > 0 ? (
          <div className="text-center py-3 text-xs text-base-content/60 tracking-widest uppercase">
            — End of Records —
          </div>
        ) : null}
      </div>
    </div>
  );
}
