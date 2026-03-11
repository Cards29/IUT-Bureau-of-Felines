import React from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../utils/api";
import InfiniteSentinel from "../components/InfiniteSentinel";

function joinedLabel(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long" });
}

export default function Users() {
  const [q, setQ] = React.useState("");
  const [items, setItems] = React.useState([]);
  const [cursor, setCursor] = React.useState(null);
  const [hasMore, setHasMore] = React.useState(true);
  const [loading, setLoading] = React.useState(false);

  async function loadMore(reset = false) {
    if (loading) return;
    if (!hasMore && !reset) return;
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      qs.set("limit", "20");
      if (q.trim()) qs.set("q", q.trim());
      if (!reset && cursor) qs.set("cursor", cursor);
      const data = await apiFetch(`/users?${qs.toString()}`);
      if (reset) setItems(data.items || []);
      else setItems(prev => [...prev, ...(data.items || [])]);
      setHasMore(Boolean(data.hasMore));
      setCursor(data.nextCursor || null);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { loadMore(true); }, [q]);

  return (
    <div style={{ maxWidth: 700 }}>
      {/* Toolbar */}
      <div className="card bg-base-100 border border-base-300 p-4 mb-4">
        <div className="flex items-center justify-between flex-wrap gap-2.5">
          <div className="font-[Special_Elite] text-lg tracking-wide">
            Personnel Directory
          </div>
          <input
            className="input input-bordered w-[220px]"
            placeholder="Search personnel..."
            value={q}
            onChange={(e) => { setCursor(null); setHasMore(true); setQ(e.target.value); }}
          />
        </div>
      </div>

      {/* User list */}
      <div className="card bg-base-100 border border-base-300 overflow-hidden">
        {items.map(u => (
          <Link
            key={u._id}
            to={`/users/${u._id}`}
            className="flex items-center gap-3 py-3 px-4 border-b border-base-300 no-underline text-base-content hover:bg-base-200 transition-colors last:border-b-0"
          >
            {u.avatarUrl ? (
              <img
                src={u.avatarUrl}
                alt={u.username}
                className="w-10 h-10 rounded-full bg-base-300 object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-base-300 flex-shrink-0 flex items-center justify-center text-lg text-base-content/40">
                &#128101;
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm truncate">{u.username}</div>
              <div className="text-xs text-base-content/60 tracking-widest uppercase">
                Enrolled {joinedLabel(u.createdAt)}
              </div>
            </div>
            <div className="text-lg text-base-content/40 flex-shrink-0">&#8250;</div>
          </Link>
        ))}
      </div>

      {/* Skeleton loaders */}
      {loading ? (
        <div className="card bg-base-100 border border-base-300 overflow-hidden mt-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-3 py-3 px-4 border-b border-base-300 last:border-b-0">
              <div className="skeleton w-10 h-10 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <div className="skeleton h-3.5 w-[35%] mb-1.5 rounded" />
                <div className="skeleton h-2.5 w-[22%] rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!loading && items.length === 0 ? (
        <div className="card bg-base-100 border border-base-300 p-4 text-center text-base-content/60 text-sm mt-3">
          <div className="font-[Special_Elite] text-base mb-1.5">No personnel on record.</div>
          <div>No users match your search.</div>
        </div>
      ) : null}

      <InfiniteSentinel disabled={!hasMore || loading} onVisible={() => loadMore(false)} />
      {!hasMore && items.length > 0 ? (
        <div className="text-center py-3 text-xs text-base-content/60 tracking-widest uppercase">
          — End of Directory —
        </div>
      ) : null}
    </div>
  );
}
