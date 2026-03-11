import React from "react";
import { Link, Navigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import { useAuth } from "../state/auth";
import InfiniteSentinel from "../components/InfiniteSentinel";

const TABS = ["pending", "approved", "rejected"];

const TAB_LABELS = {
  pending: "Pending Review",
  approved: "Approved",
  rejected: "Rejected",
};

const STATUS_COLORS = {
  pending: "#b45309",
  approved: "#166534",
  rejected: "var(--danger)",
};

function ScoreBadge({ score }) {
  if (typeof score !== "number") return null;
  const tier = score >= 12 ? "high" : score >= 8 ? "mid" : "low";
  return (
    <span className={`scoreBadge ${tier}`}>
      Merit: {score.toFixed(1)}
    </span>
  );
}

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

  if (authLoading) {
    return (
      <div style={{ maxWidth: 760 }}>
        <div className="skeletonCard">
          <div className="skeletonLine" style={{ width: "30%", height: 18, marginBottom: 12 }} />
          <div className="skeletonLine" style={{ width: "50%", height: 12 }} />
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/newsfeed" replace />;

  return (
    <div style={{ maxWidth: 760 }}>
      {/* Header toolbar */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: "Special Elite, serif", fontSize: 18, letterSpacing: "0.04em", marginBottom: 14 }}>
          My Registration Requests
        </div>
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          {TABS.map(t => (
            <button
              key={t}
              className={"btn" + (tab === t ? " primary" : "")}
              onClick={() => setTab(t)}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Cat list */}
      <div className="catFeed">
        {items.map(c => (
          <Link key={c._id} to={`/cats/${c._id}`} className="catCard">
            {c.photoUrl
              ? <img className="catCardPhoto" src={c.photoUrl} alt={c.name} />
              : <div className="catCardPhotoPlaceholder">&#128049;</div>
            }
            <div className="catCardBody">
              <div className="catCardName">{c.name}</div>
              {c.bio && <div className="catCardBio">{c.bio}</div>}
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: STATUS_COLORS[c.status],
                }}>
                  {TAB_LABELS[c.status] || c.status}
                </span>
                {c.status === "approved" && <ScoreBadge score={c.score} />}
              </div>
              {c.status === "rejected" && c.rejectionReason && (
                <div className="rejectionCallout">
                  <span style={{ fontWeight: 700, letterSpacing: "0.04em" }}>Reason: </span>
                  {c.rejectionReason}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Skeleton loaders */}
      {loading ? (
        <div className="catFeed">
          {[1, 2, 3].map(i => (
            <div key={i} className="catCard" style={{ pointerEvents: "none" }}>
              <div className="catCardPhotoPlaceholder" style={{ background: "var(--border)" }} />
              <div className="catCardBody" style={{ gap: 10 }}>
                <div className="skeletonLine" style={{ width: "40%", height: 18 }} />
                <div className="skeletonLine" style={{ width: "80%", height: 11 }} />
                <div className="skeletonLine" style={{ width: "30%", height: 11 }} />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!loading && items.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "32px 16px", color: "var(--muted)" }}>
          <div style={{ fontFamily: "Special Elite, serif", fontSize: 16, marginBottom: 6 }}>
            No {TAB_LABELS[tab].toLowerCase()} requests.
          </div>
          <div style={{ fontSize: 13 }}>
            {tab === "pending" && "Submitted registrations awaiting review will appear here."}
            {tab === "approved" && "Your approved felines will appear here."}
            {tab === "rejected" && "Rejected registration requests will appear here."}
          </div>
        </div>
      ) : null}

      <InfiniteSentinel disabled={!hasMore || loading} onVisible={() => loadMore(false)} />
      {!hasMore && items.length > 0 ? (
        <div className="muted" style={{ textAlign: "center", padding: "12px 0", fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          — End of Records —
        </div>
      ) : null}
    </div>
  );
}
