import React from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { apiFetch } from "../utils/api";
import PostCard from "../components/PostCard";
import Comment from "../components/Comment";
import { useAuth } from "../state/auth";

export default function PostDetail() {
  const { id } = useParams();
  const { user, openLogin } = useAuth();

  const [post, setPost] = React.useState(null);
  const [comments, setComments] = React.useState([]);
  const [postLoading, setPostLoading] = React.useState(true);
  const [commentsLoading, setCommentsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState(null);
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
    const toastId = toast.loading("Filing remark...");
    try {
      const newC = await apiFetch(`/posts/${id}/comments`, {
        method: "POST",
        body: JSON.stringify({ body }),
      });
      setBody("");
      setComments(prev => [...prev, newC]);
      setPost(prev => ({ ...prev, commentCount: (prev.commentCount || 0) + 1 }));
      toast.success("Remark filed.", { id: toastId });
    } catch (e) {
      toast.error(e.message || "Failed to file remark.", { id: toastId });
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

  if (postLoading) {
    return (
      <div style={{ maxWidth: 700 }}>
        <div className="skeletonCard" style={{ marginBottom: 16 }}>
          <div className="skeletonLine" style={{ width: "30%", height: 10, marginBottom: 10 }} />
          <div className="skeletonLine" style={{ width: "65%", height: 20, marginBottom: 8 }} />
          <div className="skeletonLine" style={{ width: "90%", height: 11, marginBottom: 6 }} />
          <div className="skeletonLine" style={{ width: "75%", height: 11 }} />
        </div>
        <div className="skeletonCard">
          <div className="skeletonLine" style={{ width: "20%", height: 10, marginBottom: 12 }} />
          <div className="skeletonLine" style={{ width: "100%", height: 14, marginBottom: 8 }} />
          <div className="skeletonLine" style={{ width: "85%", height: 14 }} />
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={{ maxWidth: 700 }}>
        <div className="card" style={{ textAlign: "center", padding: "32px 16px", color: "var(--danger)" }}>
          <div style={{ fontFamily: "Special Elite, serif", fontSize: 16, marginBottom: 6 }}>Record Unavailable</div>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>{loadError}</div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ maxWidth: 700 }}>
        <div className="card" style={{ textAlign: "center", padding: "32px 16px", color: "var(--muted)" }}>
          <div style={{ fontFamily: "Special Elite, serif", fontSize: 16 }}>No record found.</div>
        </div>
      </div>
    );
  }

  const commentCountLabel = post.commentCount === 0
    ? "No remarks on file"
    : post.commentCount === 1
    ? "1 Remark on File"
    : `${post.commentCount} Remarks on File`;

  return (
    <div style={{ maxWidth: 700 }}>
      <div className="postFeed" style={{ maxWidth: "100%", marginBottom: 0 }}>
        <PostCard post={post} onVoted={(score) => setPost(prev => ({ ...prev, voteScore: score }))} />
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        {/* Comment count header */}
        <div style={{
          fontFamily: "Special Elite, serif",
          fontSize: 14,
          letterSpacing: "0.04em",
          marginBottom: 14,
          paddingBottom: 10,
          borderBottom: "1px solid var(--border)",
          color: "var(--muted)",
          textTransform: "uppercase",
        }}>
          {commentCountLabel}
        </div>

        {/* Add comment */}
        {user ? (
          <div style={{ marginBottom: 16 }}>
            <div className="muted" style={{ fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
              Your Remark
            </div>
            <textarea
              className="input"
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="State your observations for the record..."
              rows={3}
              style={{ background: "var(--bg)", display: "block", marginBottom: 10, width: "100%", resize: "vertical" }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                className="btn primary"
                disabled={submitting || !body.trim()}
                onClick={addComment}
              >
                {submitting ? "Filing..." : "File Remark"}
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            background: "var(--bg)",
            border: "1px solid var(--border)",
            borderRadius: 3,
            padding: "12px 16px",
            marginBottom: 14,
            fontSize: 13,
            textAlign: "center",
            color: "var(--muted)",
          }}>
            <button
              onClick={openLogin}
              style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontFamily: "inherit", fontSize: "inherit", textDecoration: "underline", padding: 0 }}
            >
              Log in
            </button>
            {" "}to file a remark on this record.
          </div>
        )}

        {/* Comments list */}
        {commentsLoading ? (
          <div>
            {[1, 2].map(i => (
              <div key={i} style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                <div className="skeletonLine" style={{ width: "25%", height: 10, marginBottom: 8 }} />
                <div className="skeletonLine" style={{ width: "80%", height: 13 }} />
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div style={{ padding: "20px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
            No remarks on file. Be the first to comment.
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
