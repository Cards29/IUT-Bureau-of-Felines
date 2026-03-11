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

  if (authLoading) return <div className="card bg-base-100 border border-base-300 p-4">Loading...</div>;
  if (!isAdmin) return <Navigate to="/newsfeed" replace />;

  return (
    <div style={{ maxWidth: 760 }}>
      <div className="card bg-base-100 border border-base-300 p-4 mb-3">
        <div className="font-[Special_Elite] text-xl tracking-wide">
          Administrative Panel — Cat Moderation
        </div>
      </div>

      <div className="card bg-base-100 border border-base-300 p-4 mb-3">
        <div className="flex items-center gap-2">
          {TABS.map(t => (
            <button
              key={t}
              className={`btn btn-sm capitalize tracking-wide${tab === t ? " btn-primary" : ""}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="card bg-base-100 border border-base-300 p-4 mb-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-3 mb-3.5">
              <div className="skeleton w-14 h-14 rounded-[3px] flex-shrink-0" />
              <div className="flex-1">
                <div className="skeleton h-3.5 w-[35%] mb-2 rounded" />
                <div className="skeleton h-[11px] w-[65%] rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="card bg-base-100 border border-base-300 p-4 text-center text-base-content/60 text-sm">
          <div className="font-[Special_Elite] text-base mb-1">No {tab} cats on record.</div>
        </div>
      )}

      {items.map(cat => (
        <div key={cat._id} className="card bg-base-100 border border-base-300 p-4 mb-3">
          <div className="flex items-start gap-3.5">
            {cat.photoUrl
              ? <img className="w-14 h-14 rounded object-cover border border-base-300 flex-shrink-0" src={cat.photoUrl} alt="cat" />
              : <div className="w-14 h-14 rounded flex items-center justify-center text-[28px] text-base-content/40 border border-base-300 flex-shrink-0">&#128049;</div>}

            <div className="flex-1">
              <div className="font-[Special_Elite] text-base">
                <Link to={`/cats/${cat._id}`}>{cat.name}</Link>
              </div>
              {cat.bio && <div className="text-base-content/60 text-[13px] mt-0.5">{cat.bio}</div>}
              {cat.createdBy && (
                <div className="text-base-content/60 text-xs mt-0.5">
                  Submitted by: {cat.createdBy.displayName || cat.createdBy.username}
                </div>
              )}
              {cat.rejectionReason && (
                <div className="text-base-content/60 text-xs mt-0.5">
                  Rejection reason: {cat.rejectionReason}
                </div>
              )}

              {tab === "pending" && (
                <div className="mt-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button className="btn btn-primary btn-sm" onClick={() => approve(cat._id)}>
                      Approve
                    </button>
                    <input
                      className="input input-bordered flex-1 min-w-[160px]"
                      placeholder="Rejection reason (required to reject)..."
                      value={reasons[cat._id] || ""}
                      onChange={e => setReasons(r => ({ ...r, [cat._id]: e.target.value }))}
                    />
                    <button className="btn btn-error btn-sm" onClick={() => reject(cat._id)}>
                      Reject
                    </button>
                  </div>
                  {errors[cat._id] && (
                    <div className="text-error text-xs mt-1">{errors[cat._id]}</div>
                  )}
                </div>
              )}

              {tab === "approved" && (
                <div className="mt-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      className="input input-bordered flex-1 min-w-[160px]"
                      placeholder="Rejection reason (required)..."
                      value={reasons[cat._id] || ""}
                      onChange={e => setReasons(r => ({ ...r, [cat._id]: e.target.value }))}
                    />
                    <button className="btn btn-error btn-sm" onClick={() => reject(cat._id)}>
                      Revoke & Reject
                    </button>
                  </div>
                  {errors[cat._id] && (
                    <div className="text-error text-xs mt-1">{errors[cat._id]}</div>
                  )}
                </div>
              )}

              {tab === "rejected" && (
                <div className="mt-2.5">
                  <button className="btn btn-primary btn-sm" onClick={() => approve(cat._id)}>
                    Re-approve
                  </button>
                  {errors[cat._id] && (
                    <div className="text-error text-xs mt-1">{errors[cat._id]}</div>
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
