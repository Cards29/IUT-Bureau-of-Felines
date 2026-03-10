import React from "react";
import { Link, Navigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import { useAuth } from "../state/auth";
import InfiniteSentinel from "../components/InfiniteSentinel";

const TABS = ["pending", "approved", "rejected"];

const STATUS_COLORS = {
  pending: "#b45309",
  approved: "green",
  rejected: "red",
};

export default function MyCats() {
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = React.useState("pending");

  const [items, setItems] = React.useState([]);
  const [cursor, setCursor] = React.useState(null);
  const [hasMore, setHasMore] = React.useState(true);
  const [loading, setLoading] = React.useState(false);

  async function loadMore(reset = false) {
    if (!user?.id) return;
    if (loading) return;
    if (!hasMore && !reset) return;
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      qs.set("limit", "20");
      qs.set("status", tab);
      if (!reset && cursor) qs.set("cursor", cursor);
      const data = await apiFetch(`/users/${user.id}/cats?${qs.toString()}`);
      if (reset) setItems(data.items || []);
      else setItems(prev => [...prev, ...(data.items || [])]);
      setHasMore(Boolean(data.hasMore));
      setCursor(data.nextCursor || null);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    if (user?.id) {
      setItems([]);
      setCursor(null);
      setHasMore(true);
      loadMore(true);
    }
  }, [tab, user?.id]);

  if (authLoading) return <div className="card">Loading...</div>;
  if (!user) return <Navigate to="/newsfeed" replace />;

  return (
    <div>
      <div className="card">
        <div style={{ fontWeight: 900 }}>My Cat Requests</div>
        <div className="row" style={{ marginTop: 12, gap: 8 }}>
          {TABS.map(t => (
            <button
              key={t}
              className={"btn" + (tab === t ? " primary" : "")}
              onClick={() => setTab(t)}
              style={{ textTransform: "capitalize" }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        {items.length === 0 && !loading && (
          <div className="muted">No {tab} requests.</div>
        )}
        <div className="row" style={{ flexWrap: "wrap" }}>
          {items.map(c => (
            <Link key={c._id} to={`/cats/${c._id}`} className="card" style={{ width: 230, margin: 0 }}>
              <div className="row">
                {c.photoUrl ? <img className="thumb" src={c.photoUrl} alt="cat" /> : <div className="thumb" />}
                <div>
                  <div style={{ fontWeight: 900 }}>{c.name}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{(c.bio || "").slice(0, 52)}</div>
                  <div style={{ fontSize: 12, marginTop: 4, color: STATUS_COLORS[c.status], fontWeight: 600, textTransform: "capitalize" }}>
                    {c.status}
                    {c.status === "rejected" && c.rejectionReason && (
                      <span style={{ fontWeight: 400 }}> — {c.rejectionReason}</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {loading && <div className="muted" style={{ paddingTop: 10 }}>Loading...</div>}
        <InfiniteSentinel disabled={!hasMore || loading} onVisible={() => loadMore(false)} />
      </div>
    </div>
  );
}
