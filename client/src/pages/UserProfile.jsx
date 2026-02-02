import React from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../utils/api";
import PostCard from "../components/PostCard";
import InfiniteSentinel from "../components/InfiniteSentinel";

export default function UserProfile() {
  const { id } = useParams();
  const [user, setUser] = React.useState(null);

  const [posts, setPosts] = React.useState([]);
  const [cursor, setCursor] = React.useState(null);
  const [hasMore, setHasMore] = React.useState(true);
  const [loading, setLoading] = React.useState(false);

  async function loadUser() {
    const data = await apiFetch(`/users/${id}`);
    setUser(data);
  }

  async function loadMore(reset = false) {
    if (loading) return;
    if (!hasMore && !reset) return;
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      qs.set("limit", "10");
      if (!reset && cursor) qs.set("cursor", cursor);
      const data = await apiFetch(`/users/${id}/posts?${qs.toString()}`);
      if (reset) setPosts(data.items || []);
      else setPosts(prev => [...prev, ...(data.items || [])]);
      setHasMore(Boolean(data.hasMore));
      setCursor(data.nextCursor || null);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { loadUser(); }, [id]);
  React.useEffect(() => { setPosts([]); setCursor(null); setHasMore(true); loadMore(true); }, [id]);

  if (!user) return <div className="card">Loading...</div>;

  return (
    <div>
      <div className="card">
        <div className="row">
          {user.avatarUrl ? <img className="avatar" src={user.avatarUrl} alt="avatar" /> : <div className="avatar" />}
          <div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>{user.username}</div>
            <div className="muted">Joined {new Date(user.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      {posts.map(p => (
        <PostCard key={p._id} post={p} onVoted={(score) => {
          setPosts(prev => prev.map(x => x._id === p._id ? { ...x, voteScore: score } : x));
        }} />
      ))}

      {loading ? <div className="card">Loading...</div> : null}
      <InfiniteSentinel disabled={!hasMore || loading} onVisible={() => loadMore(false)} />
    </div>
  );
}