import React from "react";
import toast from "react-hot-toast";
import { useAuth } from "../state/auth";
import { apiFetch } from "../utils/api";
import ConfirmModal from "./ConfirmModal";

export default function Comment({ comment, postId, onDelete, onUpdate }) {
  const { user, isAdmin } = useAuth();
  const [isEditing, setIsEditing] = React.useState(false);
  const [editBody, setEditBody] = React.useState(comment.body);
  const [submitting, setSubmitting] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const isAuthor = user && comment.authorId?._id === user.id;
  const canDelete = isAuthor || isAdmin;

  async function handleDelete() {
    setSubmitting(true);
    try {
      await apiFetch(`/posts/${postId}/comments/${comment._id}`, { method: "DELETE" });
      setShowDeleteConfirm(false);
      toast.success("Comment deleted.");
      if (onDelete) onDelete(comment._id);
    } catch (e) {
      toast.error(e.message || "Failed to delete comment.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveEdit() {
    if (!editBody.trim()) {
      toast.error("Comment cannot be empty.");
      return;
    }
    setSubmitting(true);
    try {
      const updated = await apiFetch(`/posts/${postId}/comments/${comment._id}`, {
        method: "PATCH",
        body: JSON.stringify({ body: editBody.trim() }),
      });
      setIsEditing(false);
      toast.success("Comment updated.");
      if (onUpdate) onUpdate(updated);
    } catch (e) {
      toast.error(e.message || "Failed to update comment.");
    } finally {
      setSubmitting(false);
    }
  }

  function formatTime(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    if (days < 365) return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
  }

  return (
    <div className="comment">
      <div className="commentHeader">
        <div className="commentAuthor">
          {comment.authorId?.avatarUrl ? (
            <img src={comment.authorId.avatarUrl} alt="avatar" className="commentAvatar" />
          ) : (
            <div className="commentAvatar" />
          )}
          <div className="commentMeta">
            <div className="commentName">{comment.authorId?.displayName || comment.authorId?.username || "Unknown"}</div>
            <div className="commentTime">{formatTime(comment.createdAt)}</div>
          </div>
        </div>
        {(isAuthor || canDelete) && !isEditing && (
          <div className="commentActions">
            {isAuthor && (
              <button className="commentBtn" onClick={() => setIsEditing(true)} disabled={submitting}>
                Edit
              </button>
            )}
            {canDelete && (
              <button
                className="commentBtn danger"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={submitting}
                title={isAdmin && !isAuthor ? "Delete as admin" : "Delete"}
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="commentEdit">
          <textarea
            className="input"
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            rows={3}
            style={{ background: "var(--bg)", display: "block", marginBottom: 8, width: "100%" }}
          />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              className="btn"
              onClick={() => {
                setIsEditing(false);
                setEditBody(comment.body);
              }}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              className="btn primary"
              onClick={handleSaveEdit}
              disabled={submitting || !editBody.trim() || editBody === comment.body}
            >
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      ) : (
        <div className="commentBody">{comment.body}</div>
      )}
      {comment.updatedAt && new Date(comment.updatedAt) > new Date(comment.createdAt) && (
        <div className="commentEdited">edited {formatTime(comment.updatedAt)}</div>
      )}

      <ConfirmModal
        open={showDeleteConfirm}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
        isLoading={submitting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
