import React from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../utils/api";
import PostCard from "../components/PostCard";
import Fab from "../components/Fab";
import Modal from "../components/Modal";
import CreatePostForm from "./_parts/CreatePostForm";
import InfiniteSentinel from "../components/InfiniteSentinel";
import { useAuth } from "../state/auth";

export default function CatProfile() {
  const { user, openLogin, isAdmin } = useAuth();
  const { id } = useParams();
  const [cat, setCat] = React.useState(null);

  const [posts, setPosts] = React.useState([]);
  const [cursor, setCursor] = React.useState(null);
  const [hasMore, setHasMore] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);

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

  React.useEffect(() => { loadCat(); }, [id]);
  React.useEffect(() => { setPosts([]); setCursor(null); setHasMore(true); loadMore(true); }, [id]);

  if (!cat) return <div className="card">Loading...</div>;

  return (
    <div>
      <div className="card">
        <div className="row">
          {cat.photoUrl ? <img className="thumb" src={cat.photoUrl} alt="cat" /> : <div className="thumb" />}
          <div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>{cat.name}</div>
            <div className="muted">{cat.bio || ""}</div>
          </div>
        </div>
        {isAdmin && cat.status !== "approved" && (
          <div style={{ marginTop: 8, color: cat.status === "rejected" ? "red" : "#b45309", fontSize: 13 }}>
            Status: <strong>{cat.status}</strong>
            {cat.status === "rejected" && cat.rejectionReason && (
              <span> — {cat.rejectionReason}</span>
            )}
          </div>
        )}
      </div>

      {posts.map(p => (
        <PostCard key={p._id} post={p} onVoted={(score) => {
          setPosts(prev => prev.map(x => x._id === p._id ? { ...x, voteScore: score } : x));
        }} onDelete={(id) => setPosts(prev => prev.filter(x => x._id !== id))} />
      ))}

      {loading ? <div className="card">Loading...</div> : null}
      <InfiniteSentinel disabled={!hasMore || loading} onVisible={() => loadMore(false)} />

      <Fab onClick={() => {
        if (!user) return openLogin();
        setOpen(true);
      }} />

      <Modal open={open} title={`Post about ${cat.name}`} onClose={() => setOpen(false)}>
        <CreatePostForm fixedCatId={id} onCreated={() => {
          setOpen(false);
          setPosts([]);
          setCursor(null);
          setHasMore(true);
          loadMore(true);
        }} />
      </Modal>
    </div>
  );
}