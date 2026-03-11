import React from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../utils/api";
import PostCard from "../components/PostCard";
import InfiniteSentinel from "../components/InfiniteSentinel";

function joinedLabel(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long" });
}

export default function UserProfile() {
  const { id } = useParams();
  const [user, setUser] = React.useState(null);
  const [userLoading, setUserLoading] = React.useState(true);

  const [posts, setPosts] = React.useState([]);
  const [cursor, setCursor] = React.useState(null);
  const [hasMore, setHasMore] = React.useState(true);
  const [loading, setLoading] = React.useState(false);

  async function loadUser() {
    setUserLoading(true);
    try {
      const data = await apiFetch(`/users/${id}`);
      setUser(data);
    } finally {
      setUserLoading(false);
    }
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

  if (userLoading) {
    return (
      <div style={{ maxWidth: 700 }}>
        <div className="skeletonCard" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div className="skeleton" style={{ width: 64, height: 64, borderRadius: "50%", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skeletonLine" style={{ width: "40%", height: 18, marginBottom: 10 }} />
              <div className="skeletonLine" style={{ width: "25%", height: 11 }} />
            </div>
          </div>
        </div>
        <div className="skeletonCard">
          <div className="skeletonLine" style={{ width: "30%", height: 10, marginBottom: 10 }} />
          <div className="skeletonLine" style={{ width: "70%", height: 18 }} />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ maxWidth: 700 }}>
        <div className="card" style={{ textAlign: "center", padding: "32px 16px", color: "var(--muted)" }}>
          <div style={{ fontFamily: "Special Elite, serif", fontSize: 16 }}>Personnel record not found.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700 }}>
      {/* User header */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.username}
              style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border)", flexShrink: 0 }}
            />
          ) : (
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--border)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: "var(--muted)" }}>
              &#128101;
            </div>
          )}
          <div>
            <div style={{ fontFamily: "Special Elite, serif", fontSize: 20, letterSpacing: "0.02em", marginBottom: 4 }}>
              {user.username}
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Enrolled {joinedLabel(user.createdAt)}
            </div>
          </div>
        </div>
      </div>

      {/* Section label */}
      <div style={{ marginBottom: 10, fontFamily: "Special Elite, serif", fontSize: 14, letterSpacing: "0.04em", color: "var(--muted)", textTransform: "uppercase" }}>
        Filed Reports
      </div>

      {/* Posts feed */}
      <div className="postFeed" style={{ maxWidth: "100%" }}>
        {posts.map(p => (
          <PostCard key={p._id} post={p} onVoted={(score) => {
            setPosts(prev => prev.map(x => x._id === p._id ? { ...x, voteScore: score } : x));
          }} />
        ))}

        {loading ? (
          <div className="skeletonCard">
            <div className="skeletonLine" style={{ width: "40%", height: 10, marginBottom: 10 }} />
            <div className="skeletonLine" style={{ width: "70%", height: 18 }} />
          </div>
        ) : null}

        {!loading && posts.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "24px 16px", color: "var(--muted)" }}>
            <div style={{ fontFamily: "Special Elite, serif", fontSize: 16, marginBottom: 4 }}>No reports on file.</div>
            <div style={{ fontSize: 13 }}>This user has not filed any reports yet.</div>
          </div>
        ) : null}

        <InfiniteSentinel disabled={!hasMore || loading} onVisible={() => loadMore(false)} />
        {!hasMore && posts.length > 0 ? (
          <div className="muted" style={{ textAlign: "center", padding: "12px 0", fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            — End of Records —
          </div>
        ) : null}
      </div>
    </div>
  );
}
