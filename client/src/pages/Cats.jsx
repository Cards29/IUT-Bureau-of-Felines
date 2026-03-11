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
    <span className={`scoreBadge ${tier}`}>
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
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div style={{ fontFamily: "Special Elite, serif", fontSize: 18, letterSpacing: "0.04em" }}>
            Registered Felines
          </div>
          <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
            <input
              className="input"
              style={{ width: 220 }}
              placeholder="Search by name..."
              value={q}
              onChange={(e) => { setCursor(null); setHasMore(true); setQ(e.target.value); }}
            />
            <button className="btn primary" onClick={() => {
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
              {typeof c.score === "number" && <ScoreBadge score={c.score} />}
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
                <div className="skeletonLine" style={{ width: "60%", height: 11 }} />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!loading && items.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "32px 16px", color: "var(--muted)" }}>
          <div style={{ fontFamily: "Special Elite, serif", fontSize: 18, marginBottom: 6 }}>No felines on record.</div>
          <div style={{ fontSize: 13 }}>Submit a registration request to get started.</div>
        </div>
      ) : null}

      <InfiniteSentinel disabled={!hasMore || loading} onVisible={() => loadMore(false)} />
      {!hasMore && items.length > 0 ? (
        <div className="muted" style={{ textAlign: "center", padding: "12px 0", fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase" }}>
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
