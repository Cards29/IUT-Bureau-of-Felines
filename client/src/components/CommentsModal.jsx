import React from "react";
import toast from "react-hot-toast";
import Modal from "./Modal";
import Comment from "./Comment";
import { useAuth } from "../state/auth";
import { apiFetch } from "../utils/api";

export default function CommentsModal({ open, postId, onClose }) {
  const { user } = useAuth();
  const [comments, setComments] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [body, setBody] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [post, setPost] = React.useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [c, p] = await Promise.all([
        apiFetch(`/posts/${postId}/comments`),
        apiFetch(`/posts/${postId}`),
      ]);
      setComments(c.items || []);
      setPost(p);
    } catch (e) {
      setError(e.message || "Failed to load comments");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    if (open) load();
  }, [open, postId]);

  async function addComment() {
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      const newC = await apiFetch(`/posts/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify({ body }),
      });
      setBody("");
      setComments(prev => [...prev, newC]);
      setPost(prev => ({ ...prev, commentCount: (prev.commentCount || 0) + 1 }));
      toast.success("Comment posted.");
    } catch (e) {
      toast.error(e.message || "Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCommentDelete(commentId) {
    setComments(prev => prev.filter(c => c._id !== commentId));
    setPost(prev => ({ ...prev, commentCount: Math.max(0, (prev.commentCount || 1) - 1) }));
  }

  function handleCommentUpdate(updatedComment) {
    setComments(prev => prev.map(c => c._id === updatedComment._id ? updatedComment : c));
  }

  return (
    <Modal open={open} title={`Comments (${post?.commentCount || 0})`} onClose={onClose}>
      <div className="commentsModalContent">
        {/* Add Comment Form */}
        {user && (
          <div className="commentsModalForm">
            <textarea
              className="input"
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Write your remarks here..."
              rows={3}
              style={{ background: "var(--bg)", display: "block", width: "100%", resize: "vertical", marginBottom: 8 }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button
                className="btn"
                onClick={() => setBody("")}
                disabled={submitting || !body.trim()}
              >
                Clear
              </button>
              <button
                className="btn primary"
                disabled={submitting || !body.trim()}
                onClick={addComment}
              >
                {submitting ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </div>
        )}

        {!user && (
          <div style={{ background: "var(--bg-alt)", padding: 12, borderRadius: 3, marginBottom: 12, fontSize: 13, textAlign: "center", color: "var(--muted)", border: "1px solid var(--border)" }}>
            Log in to leave a remark on the record.
          </div>
        )}

        {/* Comments List */}
        <div className="commentsModalList">
          {loading && <div style={{ padding: 20, textAlign: "center", color: "var(--muted)" }}>Loading remarks...</div>}

          {error && <div style={{ padding: 12, background: "var(--infraction-bg)", color: "var(--infraction)", borderRadius: 3, fontSize: 13, border: "1px solid var(--infraction-border)" }}>Error: {error}</div>}

          {!loading && !error && comments.length === 0 && (
            <div style={{ padding: 20, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
              No remarks on file. Be the first to comment.
            </div>
          )}

          {!loading && comments.length > 0 && (
            comments.map(c => (
              <Comment
                key={c._id}
                comment={c}
                postId={postId}
                onDelete={handleCommentDelete}
                onUpdate={handleCommentUpdate}
              />
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
