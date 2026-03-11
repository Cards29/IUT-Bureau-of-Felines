import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { apiFetch } from "../utils/api";
import PostCard from "../components/PostCard";
import Fab from "../components/Fab";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";
import CreatePostForm from "./_parts/CreatePostForm";
import InfiniteSentinel from "../components/InfiniteSentinel";
import { useAuth } from "../state/auth";

function ScoreBadge({ score }) {
  if (typeof score !== "number") return null;
  const tier = score >= 12 ? "high" : score >= 8 ? "mid" : "low";
  return (
    <span className={`scoreBadge badge font-[Special_Elite] text-[15px] px-2.5 ${tier}`}>
      Merit Score: {score.toFixed(1)}
    </span>
  );
}

export default function CatProfile() {
  const { user, openLogin, isAdmin } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [cat, setCat] = React.useState(null);

  const [posts, setPosts] = React.useState([]);
  const [cursor, setCursor] = React.useState(null);
  const [hasMore, setHasMore] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  async function loadCat() {
    const data = await apiFetch(`/cats/${id}`);
    setCat(data);
  }

  async function loadMore(reset = false) {
    if (loading) return;
    if (!hasMore && !reset) return;
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      qs.set("limit", "10");
      if (!reset && cursor) qs.set("cursor", cursor);
      const data = await apiFetch(`/cats/${id}/posts?${qs.toString()}`);
      if (reset) setPosts(data.items || []);
      else setPosts(prev => [...prev, ...(data.items || [])]);
      setHasMore(Boolean(data.hasMore));
      setCursor(data.nextCursor || null);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteCat() {
    setDeleting(true);
    try {
      await apiFetch(`/cats/${id}`, { method: "DELETE" });
      setShowDeleteConfirm(false);
      toast.success("Cat record deleted.");
      navigate("/cats");
    } catch (e) {
      setShowDeleteConfirm(false);
      toast.error(e.message || "Failed to delete cat record.");
    } finally {
      setDeleting(false);
    }
  }

  React.useEffect(() => { loadCat(); }, [id]);
  React.useEffect(() => { setPosts([]); setCursor(null); setHasMore(true); loadMore(true); }, [id]);

  if (!cat) {
    return (
      <div style={{ maxWidth: 700 }}>
        <div className="card bg-base-100 border border-base-300 overflow-hidden">
          <div className="w-full h-[280px] skeleton" />
          <div className="p-5">
            <div className="skeleton h-4 rounded w-[35%] mb-2.5" />
            <div className="skeleton h-3 rounded w-[70%] mb-1.5" />
            <div className="skeleton h-3 rounded w-[50%]" />
          </div>
        </div>
      </div>
    );
  }

  const statusBadgeClass = cat.status === "approved"
    ? "badge badge-sm badge-outline badge-success"
    : cat.status === "pending"
    ? "badge badge-sm badge-outline badge-warning"
    : "badge badge-sm badge-outline badge-error";

  return (
    <div style={{ maxWidth: 700 }}>
      {/* Cat profile header card */}
      <div className="card bg-base-100 border border-base-300 overflow-hidden">
        {cat.photoUrl ? (
          <div className="w-full h-[280px] overflow-hidden">
            <img className="w-full h-full object-cover" src={cat.photoUrl} alt={cat.name} />
          </div>
        ) : (
          <div className="w-full h-[280px] flex items-center justify-center text-[64px] text-base-content/40">
            &#128049;
          </div>
        )}
        <div className="p-5">
          <div className="flex justify-between items-start gap-3 flex-wrap">
            <div>
              <div className="font-[Special_Elite] text-2xl mb-1">{cat.name}</div>
              {isAdmin && cat.status !== "approved" && (
                <span className={`${statusBadgeClass} mb-2 inline-block`}>
                  {cat.status}
                </span>
              )}
            </div>
            {isAdmin && (
              <div className="flex items-center gap-2">
                <button
                  className="btn btn-primary btn-sm font-[Special_Elite] lg:hidden"
                  onClick={() => {
                    if (!user) return openLogin();
                    setOpen(true);
                  }}
                >
                  + File Report
                </button>
                <button
                  className="btn btn-error btn-sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={deleting}
                >
                  Delete Record
                </button>
              </div>
            )}
            {!isAdmin && (
              <button
                className="btn btn-primary btn-sm font-[Special_Elite] lg:hidden"
                onClick={() => {
                  if (!user) return openLogin();
                  setOpen(true);
                }}
              >
                + File Report
              </button>
            )}
          </div>

          {cat.bio && <div className="text-sm text-base-content/60 leading-relaxed">{cat.bio}</div>}

          {cat.status === "approved" && typeof cat.score === "number" && (
            <div className="mt-2">
              <ScoreBadge score={cat.score} />
            </div>
          )}

          {isAdmin && cat.status === "rejected" && cat.rejectionReason && (
            <div className="alert alert-error text-sm mt-3">
              <strong>Rejection reason:</strong> {cat.rejectionReason}
            </div>
          )}
        </div>
      </div>

      {/* Post feed for this cat */}
      <div className="mt-1 mb-2 font-[Special_Elite] text-[13px] tracking-widest text-base-content/60 uppercase">
        Filed Reports
      </div>

      <div className="max-w-[700px]">
        {posts.map(p => (
          <PostCard key={p._id} post={p} onVoted={(score) => {
            setPosts(prev => prev.map(x => x._id === p._id ? { ...x, voteScore: score } : x));
          }} onDelete={(postId) => setPosts(prev => prev.filter(x => x._id !== postId))} />
        ))}

        {loading ? (
          <div className="skeleton h-32 w-full mb-3" />
        ) : null}

        {!loading && posts.length === 0 ? (
          <div className="card bg-base-100 border border-base-300 p-4 text-center text-base-content/60 text-sm">
            <div className="font-[Special_Elite] text-base mb-1">No reports on file.</div>
            <div>File the first commendation or infraction for {cat.name}.</div>
          </div>
        ) : null}

        <InfiniteSentinel disabled={!hasMore || loading} onVisible={() => loadMore(false)} />
        {!hasMore && posts.length > 0 ? (
          <div className="text-center py-3 text-xs text-base-content/60 tracking-widest uppercase">
            — End of Records —
          </div>
        ) : null}
      </div>

      <Fab onClick={() => {
        if (!user) return openLogin();
        setOpen(true);
      }} label="File Report" />

      <Modal open={open} title={`File Report — ${cat.name}`} onClose={() => setOpen(false)}>
        <CreatePostForm fixedCatId={id} onCreated={() => {
          setOpen(false);
          setPosts([]);
          setCursor(null);
          setHasMore(true);
          loadMore(true);
        }} />
      </Modal>

      <ConfirmModal
        open={showDeleteConfirm}
        title="Delete Cat Record"
        message={`Are you sure you want to permanently delete the record for "${cat.name}"? This cannot be undone.`}
        confirmText="Delete Record"
        cancelText="Cancel"
        isDanger={true}
        isLoading={deleting}
        onConfirm={handleDeleteCat}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
