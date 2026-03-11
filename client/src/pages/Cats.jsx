import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import InfiniteSentinel from "../components/InfiniteSentinel";
import CreateCatForm from "./_parts/CreateCatForm";
import Modal from "../components/Modal";
import { useAuth } from "../state/auth";

function ScoreBadge({ score }) {
  if (typeof score !== "number") return null;
  const tier = score >= 12 ? "high" : score >= 8 ? "mid" : "low";
  return (
    <span className={`scoreBadge badge font-[Special_Elite] text-[15px] px-2.5 ${tier}`}>
      Merit: {score.toFixed(1)}
    </span>
  );
}

export default function Cats() {
  const { user, openLogin } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = React.useState("");
  const [items, setItems] = React.useState([]);
  const [cursor, setCursor] = React.useState(null);
  const [hasMore, setHasMore] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  async function loadMore(reset = false) {
    if (loading) return;
    if (!hasMore && !reset) return;
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      qs.set("limit", "20");
      if (q.trim()) qs.set("q", q.trim());
      if (!reset && cursor) qs.set("cursor", cursor);
      const data = await apiFetch(`/cats?${qs.toString()}`);
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
    <div style={{ maxWidth: 760 }}>
      {/* Toolbar */}
      <div className="card bg-base-100 border border-base-300 p-4 mb-4">
        <div className="flex items-center justify-between flex-wrap gap-2.5">
          <div className="font-[Special_Elite] text-lg tracking-wide">
            Registered Felines
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              className="input input-bordered w-[220px]"
              placeholder="Search by name..."
              value={q}
              onChange={(e) => { setCursor(null); setHasMore(true); setQ(e.target.value); }}
            />
            <button className="btn btn-primary" onClick={() => {
              if (!user) return openLogin();
              setOpen(true);
            }}>
              + Register Cat
            </button>
            {user && (
              <button className="btn" onClick={() => navigate("/me/cats")}>My Requests</button>
            )}
          </div>
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
              {typeof c.score === "number" && <ScoreBadge score={c.score} />}
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
                <div className="skeleton h-[11px] rounded w-3/5" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!loading && items.length === 0 ? (
        <div className="card bg-base-100 border border-base-300 p-4 text-center text-base-content/60 text-sm mt-3">
          <div className="font-[Special_Elite] text-lg mb-1.5">No felines on record.</div>
          <div>Submit a registration request to get started.</div>
        </div>
      ) : null}

      <InfiniteSentinel disabled={!hasMore || loading} onVisible={() => loadMore(false)} />
      {!hasMore && items.length > 0 ? (
        <div className="text-center py-3 text-xs text-base-content/60 tracking-widest uppercase">
          — End of Registry —
        </div>
      ) : null}

      <Modal open={open} title="Register a Feline" onClose={() => setOpen(false)}>
        <CreateCatForm onCreated={() => {
          setOpen(false);
          setItems([]);
          setCursor(null);
          setHasMore(true);
          loadMore(true);
        }} />
      </Modal>
    </div>
  );
}
