import React from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../utils/api";
import PostCard from "../components/PostCard";
import Comment from "../components/Comment";
import { useAuth } from "../state/auth";

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [post, setPost] = React.useState(null);
  const [comments, setComments] = React.useState([]);
  const [postLoading, setPostLoading] = React.useState(true);
  const [commentsLoading, setCommentsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState(null);
  const [commentError, setCommentError] = React.useState(null);
  const [body, setBody] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  async function load() {
    setPostLoading(true);
    setCommentsLoading(true);
    setLoadError(null);
    try {
      const [p, c] = await Promise.all([
        apiFetch(`/posts/${id}`),
        apiFetch(`/posts/${id}/comments`),
      ]);
      setPost(p);
      setComments(c.items || []);
    } catch (e) {
      setLoadError(e.message || "Failed to load post");
    } finally {
      setPostLoading(false);
      setCommentsLoading(false);
    }
  }

  React.useEffect(() => { load(); }, [id]);

  async function addComment() {
    if (!body.trim()) return;
    setSubmitting(true);
    setCommentError(null);
    try {
      const newC = await apiFetch(`/posts/${id}/comments`, {
        method: "POST",
        body: JSON.stringify({ body }),
      });
      setBody("");
      setComments(prev => [...prev, newC]);
      setPost(prev => ({ ...prev, commentCount: (prev.commentCount || 0) + 1 }));
    } catch (e) {
      setCommentError(e.message || "Failed to post comment");
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

  if (postLoading) return <div className="card">Loading post...</div>;
  if (loadError) return <div className="card" style={{ color: "#dc2626" }}>❌ {loadError}</div>;
  if (!post) return <div className="card">Post not found</div>;

  return (
    <div className="card">
      <PostCard post={post} onVoted={(score) => setPost(prev => ({ ...prev, voteScore: score }))} />

      <div className="commentsSection">
        {/* Comment Count Header */}
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid var(--border)" }}>
          {post.commentCount === 0
            ? "No comments yet"
            : post.commentCount === 1
            ? "1 Comment"
            : `${post.commentCount} Comments`}
        </div>

        {/* Add Comment Section */}
        {user ? (
          <div className="commentInputSection">
            <textarea
              className="input"
              value={body}
              onChange={e => {
                setBody(e.target.value);
                setCommentError(null);
              }}
              placeholder="What's your thought? 💭"
              rows={3}
              style={{ background: "var(--bg)", display: "block", marginBottom: 10, width: "100%", resize: "vertical" }}
            />
            {commentError && (
              <div style={{ color: "#dc2626", fontSize: 12, marginBottom: 8 }}>
                ⚠️ {commentError}
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                className="btn primary"
                disabled={submitting || !body.trim()}
                onClick={addComment}
              >
                {submitting ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ background: "var(--card)", padding: 12, borderRadius: 8, marginBottom: 12, fontSize: 13, textAlign: "center", color: "var(--muted)" }}>
            <a href="/login" style={{ color: "var(--accent)", textDecoration: "underline" }}>Log in</a> to comment
          </div>
        )}

        {/* Comments List */}
        {commentsLoading ? (
          <div style={{ padding: 20, textAlign: "center", color: "var(--muted)" }}>Loading comments...</div>
        ) : comments.length === 0 ? (
          <div style={{ padding: 20, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
            ✨ Be the first to share your thoughts!
          </div>
        ) : (
          <div className="commentsList">
            {comments.map(c => (
              <Comment
                key={c._id}
                comment={c}
                postId={id}
                onDelete={handleCommentDelete}
                onUpdate={handleCommentUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
