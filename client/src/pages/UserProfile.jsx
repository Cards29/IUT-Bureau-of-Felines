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
        <div className="card bg-base-100 border border-base-300 p-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="skeleton w-16 h-16 rounded-full flex-shrink-0" />
            <div className="flex-1">
              <div className="skeleton h-[18px] w-[40%] mb-2.5 rounded" />
              <div className="skeleton h-[11px] w-[25%] rounded" />
            </div>
          </div>
        </div>
        <div className="skeleton h-32 w-full mb-3" />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ maxWidth: 700 }}>
        <div className="card bg-base-100 border border-base-300 p-4 text-center text-base-content/60 text-sm">
          <div className="font-[Special_Elite] text-base">Personnel record not found.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700 }}>
      {/* User header */}
      <div className="card bg-base-100 border border-base-300 p-4 mb-4">
        <div className="flex items-center gap-4">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="w-16 h-16 rounded-full border border-base-300 object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-base-300 flex-shrink-0 flex items-center justify-center text-[28px] text-base-content/40">
              &#128101;
            </div>
          )}
          <div>
            <div className="font-[Special_Elite] text-2xl">
              {user.username}
            </div>
            <div className="text-sm text-base-content/60 tracking-widest uppercase mt-0.5">
              Enrolled {joinedLabel(user.createdAt)}
            </div>
          </div>
        </div>
      </div>

      {/* Section label */}
      <div className="mb-2.5 font-[Special_Elite] text-[13px] tracking-widest text-base-content/60 uppercase">
        Filed Reports
      </div>

      {/* Posts feed */}
      <div className="max-w-[700px]">
        {posts.map(p => (
          <PostCard key={p._id} post={p} onVoted={(score) => {
            setPosts(prev => prev.map(x => x._id === p._id ? { ...x, voteScore: score } : x));
          }} />
        ))}

        {loading ? (
          <div className="skeleton h-32 w-full mb-3" />
        ) : null}

        {!loading && posts.length === 0 ? (
          <div className="card bg-base-100 border border-base-300 p-4 text-center text-base-content/60 text-sm">
            <div className="font-[Special_Elite] text-base mb-1">No reports on file.</div>
            <div>This user has not filed any reports yet.</div>
          </div>
        ) : null}

        <InfiniteSentinel disabled={!hasMore || loading} onVisible={() => loadMore(false)} />
        {!hasMore && posts.length > 0 ? (
          <div className="text-center py-3 text-xs text-base-content/60 tracking-widest uppercase">
            — End of Records —
          </div>
        ) : null}
      </div>
    </div>
  );
}
