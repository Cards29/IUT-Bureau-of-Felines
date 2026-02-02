import React from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../utils/api";
import InfiniteSentinel from "../components/InfiniteSentinel";

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
    <div>
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div style={{ fontWeight: 900 }}>Users</div>
          <input className="input" style={{ width: 240 }} placeholder="Search users..." value={q} onChange={(e) => { setCursor(null); setHasMore(true); setQ(e.target.value); }} />
        </div>
      </div>

      <div className="card">
        {items.map(u => (
          <Link key={u._id} to={`/users/${u._id}`} className="row" style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
            {u.avatarUrl ? <img className="avatar" src={u.avatarUrl} alt="avatar" /> : <div className="avatar" />}
            <div>
              <div style={{ fontWeight: 900 }}>{u.username}</div>
              <div className="muted" style={{ fontSize: 12 }}>{new Date(u.createdAt).toLocaleDateString()}</div>
            </div>
          </Link>
        ))}
        {loading ? <div className="muted" style={{ paddingTop: 10 }}>Loading...</div> : null}
        <InfiniteSentinel disabled={!hasMore || loading} onVisible={() => loadMore(false)} />
      </div>
    </div>
  );
}