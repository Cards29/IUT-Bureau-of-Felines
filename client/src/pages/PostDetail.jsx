import React from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../utils/api";
import PostCard from "../components/PostCard";
import { useAuth } from "../state/auth";

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();

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
    try {
      const newC = await apiFetch(`/posts/${id}/comments`, {
        method: "POST",
        body: JSON.stringify({ body }),
      });
      setBody("");
      setComments(prev => [...prev, newC]);
      setPost(prev => ({ ...prev, commentCount: (prev.commentCount || 0) + 1 }));
    } catch (e) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (postLoading) return <div className="card">Loading...</div>;
  if (loadError) return <div className="card">{loadError}</div>;
  if (!post) return <div className="card">Post not found</div>;

  return (
    <div>
      <PostCard post={post} onVoted={(score) => setPost(prev => ({ ...prev, voteScore: score }))} />

      <div className="card">
        <div style={{ fontWeight: 900, fontSize: 15, marginBottom: 12 }}>
          {post.commentCount === 1 ? "1 Comment" : `${post.commentCount || 0} Comments`}
        </div>

        {user ? (
          <>
            <textarea
              className="input"
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Write a comment..."
              rows={4}
              style={{ background: "var(--bg)", display: "block", marginBottom: 10 }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                className="btn primary"
                disabled={submitting || !body.trim()}
                onClick={addComment}
              >
                {submitting ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </>
        ) : (
          <div className="muted" style={{ fontSize: 14 }}>
            Log in to leave a comment.
          </div>
        )}
      </div>

      {commentsLoading ? (
        <div className="card">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="card muted" style={{ fontSize: 14 }}>No comments yet. Be the first!</div>
      ) : (
        comments.map(c => (
          <div key={c._id} className="card">
            <div className="row" style={{ marginBottom: 8 }}>
              {c.authorId?.avatarUrl
                ? <img className="avatar" src={c.authorId.avatarUrl} alt="avatar" />
                : <div className="avatar" />
              }
              <div>
                <div style={{ fontWeight: 700 }}>{c.authorId?.username || "unknown"}</div>
                <div className="muted" style={{ fontSize: 12 }}>
                  {new Date(c.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
            <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{c.body}</p>
          </div>
        ))
      )}
    </div>
  );
}
