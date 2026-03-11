import React from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import VoteButtons from "./VoteButtons";
import CommentsModal from "./CommentsModal";
import ConfirmModal from "./ConfirmModal";
import { useAuth } from "../state/auth";
import { apiFetch } from "../utils/api";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export default function PostCard({ post, onVoted, onDelete }) {
  const { user, isAdmin } = useAuth();
  const [currentImg, setCurrentImg] = React.useState(0);
  const [commentsOpen, setCommentsOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const isAuthor = user && post.authorId?._id === user.id;
  const canDelete = isAuthor || isAdmin;

  async function handleDelete() {
    setDeleting(true);
    try {
      await apiFetch(`/posts/${post._id}`, { method: "DELETE" });
      setDeleteOpen(false);
      toast.success("Post deleted.");
      if (onDelete) onDelete(post._id);
    } catch (e) {
      setDeleteOpen(false);
      toast.error(e.message || "Failed to delete post.");
    } finally {
      setDeleting(false);
    }
  }

  const nextImg = (e) => {
    e.preventDefault();
    setCurrentImg((prev) => (prev + 1) % post.imageUrls.length);
  };

  const prevImg = (e) => {
    e.preventDefault();
    setCurrentImg((prev) => (prev - 1 + post.imageUrls.length) % post.imageUrls.length);
  };

  const isCommendation = post.type === "commendation";
  const cardClass = `card bg-base-100 border border-base-300 shadow-sm overflow-hidden mb-3${isCommendation ? " border-l-4 border-l-success" : " border-l-4 border-l-error"}`;

  return (
    <>
      <div className={cardClass}>
        {/* Header: meta + delete */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <div className="flex flex-wrap gap-1 text-xs text-base-content/60">
            {post.authorId?.avatarUrl ? (
              <div className="avatar">
                <div className="w-[26px] rounded-full">
                  <img src={post.authorId.avatarUrl} alt="avatar" />
                </div>
              </div>
            ) : (
              <div className="w-[26px] h-[26px] rounded-full bg-base-300" />
            )}
            <Link to={`/users/${post.authorId?._id}`}>
              {post.authorId?.username || "unknown"}
            </Link>
            <span>&#9642;</span>
            <Link to={`/cats/${post.catId?._id}`}>
              {post.catId?.name || "cat"}
            </Link>
            <span>&#9642;</span>
            <span title={new Date(post.createdAt).toLocaleString()}>{timeAgo(post.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`postTypeBadge ${post.type || ""} badge badge-sm badge-outline`}>
              {isCommendation ? "Commendation" : "Infraction"}
            </span>
            {canDelete && onDelete ? (
              <button
                className="btn btn-sm"
                style={{ color: "var(--color-error)", borderColor: "var(--color-error)", padding: "2px 8px", fontSize: 11 }}
                onClick={() => setDeleteOpen(true)}
              >
                Delete
              </button>
            ) : null}
          </div>
        </div>

        {/* Title */}
        <div className="font-[Special_Elite] text-[18px] px-4 pb-1.5">
          <Link to={`/posts/${post._id}`}>{post.title}</Link>
        </div>

        {/* Body */}
        {post.body ? (
          <div className="text-sm px-4 pb-2.5 whitespace-pre-wrap">{post.body}</div>
        ) : null}

        {/* Media */}
        {post.videoUrl ? (
          <video
            className="postVideo"
            src={post.videoUrl}
            controls
          />
        ) : post.imageUrls && post.imageUrls.length > 0 ? (
          <div className="slideshow">
            <img src={post.imageUrls[currentImg]} alt={`post-${currentImg}`} />
            {post.imageUrls.length > 1 && (
              <>
                <button className="slideshowBtn prev" onClick={prevImg}>&#8249;</button>
                <button className="slideshowBtn next" onClick={nextImg}>&#8250;</button>
                <div className="slideshowDots">
                  {post.imageUrls.map((_, i) => (
                    <div
                      key={i}
                      className={`dot ${i === currentImg ? "active" : ""}`}
                      onClick={() => setCurrentImg(i)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : post.imageUrl ? (
          <img className="postImage" src={post.imageUrl} alt="post" />
        ) : null}

        {/* Action bar */}
        <div className="flex items-center justify-between border-t border-base-300 px-4 pt-2 pb-3">
          <div className="flex items-center gap-2">
            <button
              className="btn btn-ghost btn-sm gap-1"
              onClick={() => setCommentsOpen(true)}
            >
              &#128172; {post.commentCount || 0} {post.commentCount === 1 ? "comment" : "comments"}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <VoteButtons postId={post._id} postType={post.type} voteScore={post.voteScore} onVoted={onVoted} />
          </div>
        </div>
      </div>

      <CommentsModal
        open={commentsOpen}
        postId={post._id}
        onClose={() => setCommentsOpen(false)}
      />

      <ConfirmModal
        open={deleteOpen}
        title="Delete Post"
        message="Are you sure you want to delete this post? This cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </>
  );
}
