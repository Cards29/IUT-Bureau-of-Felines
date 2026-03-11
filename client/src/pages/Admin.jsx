import React from "react";
import { Link, Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import { apiFetch } from "../utils/api";
import { useAuth } from "../state/auth";

const TABS = ["pending", "approved", "rejected"];

export default function Admin() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [tab, setTab] = React.useState("pending");
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const [reasons, setReasons] = React.useState({});
  const [errors, setErrors] = React.useState({});

  async function load() {
    setLoading(true);
    try {
      const data = await apiFetch(`/cats?status=${tab}&limit=100`);
      setItems(data.items || []);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    if (isAdmin) load();
  }, [tab, isAdmin]);

  async function approve(id) {
    setErrors(e => ({ ...e, [id]: null }));
    try {
      await apiFetch(`/cats/${id}/approve`, { method: "PATCH" });
      setItems(prev => prev.filter(c => c._id !== id));
      toast.success("Cat approved.");
    } catch (err) {
      setErrors(e => ({ ...e, [id]: err.message || "Failed to approve" }));
      toast.error(err.message || "Failed to approve.");
    }
  }

  async function reject(id) {
    const reason = (reasons[id] || "").trim();
    if (!reason) {
      setErrors(e => ({ ...e, [id]: "Rejection reason is required" }));
      return;
    }
    setErrors(e => ({ ...e, [id]: null }));
    try {
      await apiFetch(`/cats/${id}/reject`, { method: "PATCH", body: JSON.stringify({ reason }) });
      setItems(prev => prev.filter(c => c._id !== id));
      toast.success("Cat rejected.");
    } catch (err) {
      setErrors(e => ({ ...e, [id]: err.message || "Failed to reject" }));
      toast.error(err.message || "Failed to reject.");
    }
  }

  if (authLoading) return <div className="card">Loading...</div>;
  if (!isAdmin) return <Navigate to="/newsfeed" replace />;

  return (
    <div style={{ maxWidth: 760 }}>
      <div className="card">
        <div style={{ fontFamily: "Special Elite, serif", fontSize: 20, letterSpacing: "0.04em" }}>
          Administrative Panel — Cat Moderation
        </div>
      </div>

      <div className="card">
        <div className="row" style={{ gap: 8 }}>
          {TABS.map(t => (
            <button
              key={t}
              className={`btn${tab === t ? " primary" : ""}`}
              onClick={() => setTab(t)}
              style={{ textTransform: "capitalize", letterSpacing: "0.03em" }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="skeletonCard">
          {[1, 2, 3].map(i => (
            <div key={i} style={{ display: "flex", gap: 12, marginBottom: 14 }}>
              <div className="skeleton" style={{ width: 56, height: 56, borderRadius: 3, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeletonLine" style={{ width: "35%", height: 14, marginBottom: 8 }} />
                <div className="skeletonLine" style={{ width: "65%", height: 11 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: "24px 16px", color: "var(--muted)" }}>
          <div style={{ fontFamily: "Special Elite, serif", fontSize: 16, marginBottom: 4 }}>No {tab} cats on record.</div>
        </div>
      )}

      {items.map(cat => (
        <div key={cat._id} className="card">
          <div className="row" style={{ alignItems: "flex-start", gap: 14 }}>
            {cat.photoUrl
              ? <img className="thumb" src={cat.photoUrl} alt="cat" style={{ width: 64, height: 64 }} />
              : <div className="thumb" style={{ width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: "var(--muted)" }}>&#128049;</div>}

            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "Special Elite, serif", fontSize: 16 }}>
                <Link to={`/cats/${cat._id}`}>{cat.name}</Link>
              </div>
              {cat.bio && <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>{cat.bio}</div>}
              {cat.createdBy && (
                <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                  Submitted by: {cat.createdBy.displayName || cat.createdBy.username}
                </div>
              )}
              {cat.rejectionReason && (
                <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                  Rejection reason: {cat.rejectionReason}
                </div>
              )}

              {tab === "pending" && (
                <div style={{ marginTop: 10 }}>
                  <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                    <button className="btn primary small" onClick={() => approve(cat._id)}>
                      Approve
                    </button>
                    <input
                      className="input"
                      style={{ flex: 1, minWidth: 160 }}
                      placeholder="Rejection reason (required to reject)..."
                      value={reasons[cat._id] || ""}
                      onChange={e => setReasons(r => ({ ...r, [cat._id]: e.target.value }))}
                    />
                    <button className="btn danger small" onClick={() => reject(cat._id)}>
                      Reject
                    </button>
                  </div>
                  {errors[cat._id] && (
                    <div style={{ color: "var(--danger)", fontSize: 12, marginTop: 4 }}>{errors[cat._id]}</div>
                  )}
                </div>
              )}

              {tab === "approved" && (
                <div style={{ marginTop: 10 }}>
                  <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                    <input
                      className="input"
                      style={{ flex: 1, minWidth: 160 }}
                      placeholder="Rejection reason (required)..."
                      value={reasons[cat._id] || ""}
                      onChange={e => setReasons(r => ({ ...r, [cat._id]: e.target.value }))}
                    />
                    <button className="btn danger small" onClick={() => reject(cat._id)}>
                      Revoke & Reject
                    </button>
                  </div>
                  {errors[cat._id] && (
                    <div style={{ color: "var(--danger)", fontSize: 12, marginTop: 4 }}>{errors[cat._id]}</div>
                  )}
                </div>
              )}

              {tab === "rejected" && (
                <div style={{ marginTop: 10 }}>
                  <button className="btn primary small" onClick={() => approve(cat._id)}>
                    Re-approve
                  </button>
                  {errors[cat._id] && (
                    <div style={{ color: "var(--danger)", fontSize: 12, marginTop: 4 }}>{errors[cat._id]}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
