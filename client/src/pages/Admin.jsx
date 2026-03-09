import React from "react";
import { Link, Navigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import { useAuth } from "../state/auth";

const TABS = ["pending", "approved", "rejected"];

export default function Admin() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [tab, setTab] = React.useState("pending");
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  // per-cat rejection reason input state
  const [reasons, setReasons] = React.useState({});
  // per-cat inline error state
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
    } catch (err) {
      setErrors(e => ({ ...e, [id]: err.message || "Failed to approve" }));
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
    } catch (err) {
      setErrors(e => ({ ...e, [id]: err.message || "Failed to reject" }));
    }
  }

  if (authLoading) return <div className="card">Loading...</div>;
  if (!isAdmin) return <Navigate to="/newsfeed" replace />;

  return (
    <div>
      <div className="card">
        <div style={{ fontWeight: 900, fontSize: 18 }}>Admin — Cat Moderation</div>
      </div>

      <div className="card">
        <div className="row" style={{ gap: 8 }}>
          {TABS.map(t => (
            <button
              key={t}
              className={`btn${tab === t ? " primary" : ""}`}
              onClick={() => setTab(t)}
              style={{ textTransform: "capitalize" }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="card muted">Loading...</div>}

      {!loading && items.length === 0 && (
        <div className="card muted">No {tab} cats.</div>
      )}

      {items.map(cat => (
        <div key={cat._id} className="card">
          <div className="row" style={{ alignItems: "flex-start", gap: 12 }}>
            {cat.photoUrl
              ? <img className="thumb" src={cat.photoUrl} alt="cat" />
              : <div className="thumb" />}

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 900 }}>
                <Link to={`/cats/${cat._id}`}>{cat.name}</Link>
              </div>
              <div className="muted" style={{ fontSize: 12 }}>{cat.bio || ""}</div>
              {cat.createdBy && (
                <div className="muted" style={{ fontSize: 12 }}>
                  Submitted by {cat.createdBy.displayName || cat.createdBy.username}
                </div>
              )}
              {cat.rejectionReason && (
                <div className="muted" style={{ fontSize: 12 }}>
                  Rejection reason: {cat.rejectionReason}
                </div>
              )}

              {tab === "pending" && (
                <div style={{ marginTop: 8 }}>
                  <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                    <button className="btn primary" onClick={() => approve(cat._id)}>
                      Approve
                    </button>
                    <input
                      className="input"
                      style={{ flex: 1, minWidth: 160 }}
                      placeholder="Rejection reason..."
                      value={reasons[cat._id] || ""}
                      onChange={e => setReasons(r => ({ ...r, [cat._id]: e.target.value }))}
                    />
                    <button className="btn" onClick={() => reject(cat._id)}>
                      Reject
                    </button>
                  </div>
                  {errors[cat._id] && (
                    <div style={{ color: "red", fontSize: 12, marginTop: 4 }}>
                      {errors[cat._id]}
                    </div>
                  )}
                </div>
              )}

              {tab === "approved" && (
                <div style={{ marginTop: 8 }}>
                  <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                    <input
                      className="input"
                      style={{ flex: 1, minWidth: 160 }}
                      placeholder="Rejection reason..."
                      value={reasons[cat._id] || ""}
                      onChange={e => setReasons(r => ({ ...r, [cat._id]: e.target.value }))}
                    />
                    <button className="btn" onClick={() => reject(cat._id)}>
                      Reject
                    </button>
                  </div>
                  {errors[cat._id] && (
                    <div style={{ color: "red", fontSize: 12, marginTop: 4 }}>
                      {errors[cat._id]}
                    </div>
                  )}
                </div>
              )}

              {tab === "rejected" && (
                <div style={{ marginTop: 8 }}>
                  <button className="btn primary" onClick={() => approve(cat._id)}>
                    Re-approve
                  </button>
                  {errors[cat._id] && (
                    <div style={{ color: "red", fontSize: 12, marginTop: 4 }}>
                      {errors[cat._id]}
                    </div>
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
