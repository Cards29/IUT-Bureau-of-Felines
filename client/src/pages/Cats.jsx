import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import InfiniteSentinel from "../components/InfiniteSentinel";
import CreateCatForm from "./_parts/CreateCatForm";
import Modal from "../components/Modal";
import { useAuth } from "../state/auth";

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
    <div>
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div style={{ fontWeight: 900 }}>Cats</div>
          <div className="row">
            <input className="input" style={{ width: 240 }} placeholder="Search cats..." value={q} onChange={(e) => { setCursor(null); setHasMore(true); setQ(e.target.value); }} />
            <button className="btn primary" onClick={() => {
              if (!user) return openLogin();
              setOpen(true);
            }}>Request</button>
            {user && (
              <button className="btn" onClick={() => navigate("/me/cats")}>My Requests</button>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="row" style={{ flexWrap: "wrap" }}>
          {items.map(c => (
            <Link key={c._id} to={`/cats/${c._id}`} className="card" style={{ width: 230, margin: 0 }}>
              <div className="row">
                {c.photoUrl ? <img className="thumb" src={c.photoUrl} alt="cat" /> : <div className="thumb" />}
                <div>
                  <div style={{ fontWeight: 900 }}>{c.name}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{(c.bio || "").slice(0, 52)}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {loading ? <div className="muted" style={{ paddingTop: 10 }}>Loading...</div> : null}
        <InfiniteSentinel disabled={!hasMore || loading} onVisible={() => loadMore(false)} />
      </div>

      <Modal open={open} title="Request a Cat" onClose={() => setOpen(false)}>
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