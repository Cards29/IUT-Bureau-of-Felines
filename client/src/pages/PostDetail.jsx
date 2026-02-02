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
  const [body, setBody] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  async function load() {
    setLoading(true);
    const p = await apiFetch(`/posts/${id}`);
    const c = await apiFetch(`/posts/${id}/comments`);
    setPost(p);
    setComments(c.items || []);
    setLoading(false);
  }

  React.useEffect(() => { load(); }, [id]);

  async function addComment() {
    if (!user) return alert("Login to comment");
    if (!body.trim()) return;

    const newC = await apiFetch(`/posts/${id}/comments`, {
      method: "POST",
      body: JSON.stringify({ body }),
    });
    setBody("");
    setComments(prev => [...prev, newC]);
    setPost(prev => ({ ...prev, commentCount: (prev.commentCount || 0) + 1 }));
  }

  if (loading) return <div className="card">Loading...</div>;
  if (!post) return <div className="card">Post not found</div>;

  return (
    <div>
      <PostCard post={post} onVoted={(score) => setPost(prev => ({ ...prev, voteScore: score }))} />

      <div className="card">
        <div style={{ fontWeight: 900 }}>Comments</div>
        <div style={{ height: 8 }} />
        <textarea className="input" value={body} onChange={e => setBody(e.target.value)} placeholder="Write a comment..." />
        <div style={{ height: 8 }} />
        <button className="btn primary" onClick={addComment}>Post</button>
      </div>

      {comments.map(c => (
        <div key={c._id} className="card">
          <div className="row">
            {c.authorId?.avatarUrl ? <img className="avatar" src={c.authorId.avatarUrl} alt="avatar" /> : <div className="avatar" />}
            <div>
              <div style={{ fontWeight: 900 }}>{c.authorId?.username || "unknown"}</div>
              <div className="muted" style={{ fontSize: 12 }}>{new Date(c.createdAt).toLocaleString()}</div>
            </div>
          </div>
          <p style={{ whiteSpace: "pre-wrap" }}>{c.body}</p>
        </div>
      ))}
    </div>
  );
}