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
    <span className={`scoreBadge ${tier}`} style={{ fontSize: 17 }}>
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
        <div className="catProfileCard">
          <div className="catProfilePhotoWrap" style={{ background: "var(--border)" }} />
          <div className="catProfileBody">
            <div className="skeletonLine" style={{ width: "35%", height: 24, marginBottom: 10 }} />
            <div className="skeletonLine" style={{ width: "70%", height: 13, marginBottom: 6 }} />
            <div className="skeletonLine" style={{ width: "50%", height: 13 }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700 }}>
      {/* Cat profile header card */}
      <div className="catProfileCard">
        {cat.photoUrl ? (
          <div className="catProfilePhotoWrap">
            <img className="catProfilePhoto" src={cat.photoUrl} alt={cat.name} />
          </div>
        ) : (
          <div className="catProfilePhotoWrap" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, color: "var(--muted)" }}>
            &#128049;
          </div>
        )}
        <div className="catProfileBody">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div className="catProfileName">{cat.name}</div>
              {isAdmin && cat.status !== "approved" && (
                <span className={`statusBadge ${cat.status}`} style={{ marginBottom: 8, display: "inline-block" }}>
                  {cat.status}
                </span>
              )}
            </div>
            {isAdmin && (
              <button
                className="btn danger small"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deleting}
              >
                Delete Record
              </button>
            )}
          </div>

          {cat.bio && <div className="catProfileBio">{cat.bio}</div>}

          {cat.status === "approved" && typeof cat.score === "number" && (
            <ScoreBadge score={cat.score} />
          )}

          {isAdmin && cat.status === "rejected" && cat.rejectionReason && (
            <div className="rejectionCallout" style={{ marginTop: 10 }}>
              <strong>Rejection reason:</strong> {cat.rejectionReason}
            </div>
          )}
        </div>
      </div>

      {/* Post feed for this cat */}
      <div style={{ marginTop: 4, marginBottom: 8, fontFamily: "Special Elite, serif", fontSize: 14, letterSpacing: "0.04em", color: "var(--muted)", textTransform: "uppercase" }}>
        Filed Reports
      </div>

      <div className="postFeed" style={{ maxWidth: "100%" }}>
        {posts.map(p => (
          <PostCard key={p._id} post={p} onVoted={(score) => {
            setPosts(prev => prev.map(x => x._id === p._id ? { ...x, voteScore: score } : x));
          }} onDelete={(id) => setPosts(prev => prev.filter(x => x._id !== id))} />
        ))}

        {loading ? (
          <div className="skeletonCard">
            <div className="skeletonLine" style={{ width: "40%", height: 10, marginBottom: 10 }} />
            <div className="skeletonLine" style={{ width: "70%", height: 18, marginBottom: 12 }} />
            <div className="skeletonLine" style={{ width: "90%", height: 10 }} />
          </div>
        ) : null}

        {!loading && posts.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "24px 16px", color: "var(--muted)" }}>
            <div style={{ fontFamily: "Special Elite, serif", fontSize: 16, marginBottom: 4 }}>No reports on file.</div>
            <div style={{ fontSize: 13 }}>File the first commendation or infraction for {cat.name}.</div>
          </div>
        ) : null}

        <InfiniteSentinel disabled={!hasMore || loading} onVisible={() => loadMore(false)} />
        {!hasMore && posts.length > 0 ? (
          <div className="muted" style={{ textAlign: "center", padding: "12px 0", fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase" }}>
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
