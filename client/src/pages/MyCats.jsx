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

function ScoreBadge({ score }) {
  if (typeof score !== "number") return null;
  const tier = score >= 12 ? "high" : score >= 8 ? "mid" : "low";
  return (
    <span className={`scoreBadge badge font-[Special_Elite] text-[15px] px-2.5 ${tier}`}>
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
        <div className="skeleton h-32 w-full mb-3" />
      </div>
    );
  }
  if (!user) return <Navigate to="/newsfeed" replace />;

  return (
    <div style={{ maxWidth: 760 }}>
      {/* Header toolbar */}
      <div className="card bg-base-100 border border-base-300 p-4 mb-4">
        <div className="font-[Special_Elite] text-lg tracking-wide mb-3.5">
          My Registration Requests
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {TABS.map(t => (
            <button
              key={t}
              className={"btn btn-sm" + (tab === t ? " btn-primary" : "")}
              onClick={() => setTab(t)}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Cat list */}
      <div className="flex flex-col gap-3">
        {items.map(c => (
          <Link key={c._id} to={`/cats/${c._id}`} className="card card-side bg-base-100 border border-base-300 shadow-sm hover:border-primary transition-colors cursor-pointer min-h-[140px] no-underline">
            {c.photoUrl
              ? <img className="catCardPhoto" src={c.photoUrl} alt={c.name} />
              : <div className="catCardPhotoPlaceholder">&#128049;</div>
            }
            <div className="flex flex-col justify-center p-4 flex-1">
              <div className="font-[Special_Elite] text-xl mb-1">{c.name}</div>
              {c.bio && <div className="text-[13px] text-base-content/60 line-clamp-3">{c.bio}</div>}
              <div className="flex items-center gap-2.5 flex-wrap mt-1">
                <span className={
                  "text-[11px] font-bold tracking-widest uppercase " +
                  (c.status === "approved" ? "text-success" : c.status === "pending" ? "text-warning" : "text-error")
                }>
                  {TAB_LABELS[c.status] || c.status}
                </span>
                {c.status === "approved" && <ScoreBadge score={c.score} />}
              </div>
              {c.status === "rejected" && c.rejectionReason && (
                <div className="alert alert-error text-sm mt-2">
                  <span className="font-bold tracking-wide">Reason: </span>
                  {c.rejectionReason}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Skeleton loaders */}
      {loading ? (
        <div className="flex flex-col gap-3 mt-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="card card-side bg-base-100 border border-base-300 min-h-[140px] pointer-events-none">
              <div className="catCardPhotoPlaceholder skeleton" />
              <div className="flex flex-col justify-center p-4 flex-1 gap-2.5">
                <div className="skeleton h-[18px] rounded w-2/5" />
                <div className="skeleton h-[11px] rounded w-4/5" />
                <div className="skeleton h-[11px] rounded w-[30%]" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!loading && items.length === 0 ? (
        <div className="card bg-base-100 border border-base-300 p-4 text-center text-base-content/60 text-sm mt-3">
          <div className="font-[Special_Elite] text-base mb-1.5">
            No {TAB_LABELS[tab].toLowerCase()} requests.
          </div>
          <div>
            {tab === "pending" && "Submitted registrations awaiting review will appear here."}
            {tab === "approved" && "Your approved felines will appear here."}
            {tab === "rejected" && "Rejected registration requests will appear here."}
          </div>
        </div>
      ) : null}

      <InfiniteSentinel disabled={!hasMore || loading} onVisible={() => loadMore(false)} />
      {!hasMore && items.length > 0 ? (
        <div className="text-center py-3 text-xs text-base-content/60 tracking-widest uppercase">
          — End of Records —
        </div>
      ) : null}
    </div>
  );
}
