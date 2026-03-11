import React from "react";
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
    } catch (e) {
      alert(`Error: ${e.message}`);
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
              placeholder="What's your thought? 💭"
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
          <div style={{ background: "var(--card)", padding: 12, borderRadius: 8, marginBottom: 12, fontSize: 13, textAlign: "center", color: "var(--muted)" }}>
            <a href="/login" style={{ color: "var(--accent)", textDecoration: "underline" }}>Log in</a> to comment
          </div>
        )}

        {/* Comments List */}
        <div className="commentsModalList">
          {loading && <div style={{ padding: 20, textAlign: "center", color: "var(--muted)" }}>Loading comments...</div>}
          
          {error && <div style={{ padding: 12, background: "rgba(220, 38, 38, 0.1)", color: "#dc2626", borderRadius: 8, fontSize: 13 }}>Error: {error}</div>}
          
          {!loading && !error && comments.length === 0 && (
            <div style={{ padding: 20, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
              ✨ No comments yet. Be the first!
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
