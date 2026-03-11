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
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div style={{ fontFamily: "Special Elite, serif", fontSize: 18, letterSpacing: "0.04em" }}>
            Personnel Directory
          </div>
          <input
            className="input"
            style={{ width: 220 }}
            placeholder="Search personnel..."
            value={q}
            onChange={(e) => { setCursor(null); setHasMore(true); setQ(e.target.value); }}
          />
        </div>
      </div>

      {/* User list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {items.map((u, i) => (
          <Link
            key={u._id}
            to={`/users/${u._id}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 18px",
              background: "var(--card)",
              borderBottom: "1px solid var(--border)",
              borderLeft: i === 0 ? "none" : "none",
              textDecoration: "none",
              color: "inherit",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--bg)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--card)"}
          >
            {u.avatarUrl ? (
              <img
                src={u.avatarUrl}
                alt={u.username}
                style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border)", flexShrink: 0 }}
              />
            ) : (
              <div style={{ width: 42, height: 42, borderRadius: "50%", background: "var(--border)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "var(--muted)" }}>
                &#128101;
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: "0.01em", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {u.username}
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Enrolled {joinedLabel(u.createdAt)}
              </div>
            </div>
            <div style={{ fontSize: 18, color: "var(--muted)", flexShrink: 0 }}>&#8250;</div>
          </Link>
        ))}
      </div>

      {/* Skeleton loaders */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", background: "var(--card)", borderBottom: "1px solid var(--border)" }}>
              <div style={{ width: 42, height: 42, borderRadius: "50%", background: "var(--border)", flexShrink: 0 }} className="skeleton" />
              <div style={{ flex: 1 }}>
                <div className="skeletonLine" style={{ width: "35%", height: 14, marginBottom: 7 }} />
                <div className="skeletonLine" style={{ width: "22%", height: 10 }} />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!loading && items.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "32px 16px", color: "var(--muted)" }}>
          <div style={{ fontFamily: "Special Elite, serif", fontSize: 16, marginBottom: 6 }}>No personnel on record.</div>
          <div style={{ fontSize: 13 }}>No users match your search.</div>
        </div>
      ) : null}

      <InfiniteSentinel disabled={!hasMore || loading} onVisible={() => loadMore(false)} />
      {!hasMore && items.length > 0 ? (
        <div className="muted" style={{ textAlign: "center", padding: "12px 0", fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          — End of Directory —
        </div>
      ) : null}
    </div>
  );
}
