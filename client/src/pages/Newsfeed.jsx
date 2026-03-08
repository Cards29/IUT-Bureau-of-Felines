import React from "react";
import PostCard from "../components/PostCard";
import Fab from "../components/Fab";
import Modal from "../components/Modal";
import CreatePostForm from "./_parts/CreatePostForm";
import InfiniteSentinel from "../components/InfiniteSentinel";
import { useInfiniteFeed } from "../hooks/useInfiniteFeed";
import { useAuth } from "../state/auth";

export default function Newsfeed() {
  const { user } = useAuth();
  const feed = useInfiniteFeed({ endpoint: "/posts", limit: 10 });
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    feed.loadMore(true);
  }, []);

  return (
    <div>
      {feed.items.map(p => (
        <PostCard key={p._id} post={p} onVoted={(score) => {
          feed.setItems(prev => prev.map(x => x._id === p._id ? { ...x, voteScore: score } : x));
        }} onDelete={(id) => feed.setItems(prev => prev.filter(x => x._id !== id))} />
      ))}

      {feed.loading ? <div className="card">Loading...</div> : null}
      <InfiniteSentinel disabled={!feed.hasMore || feed.loading} onVisible={() => feed.loadMore(false)} />
      {!feed.hasMore && feed.items.length > 0 ? <div className="muted" style={{ textAlign: "center", padding: 12 }}>End</div> : null}

      <Fab onClick={() => {
        if (!user) return alert("Login to post");
        setOpen(true);
      }} />

      <Modal open={open} title="Create Post" onClose={() => setOpen(false)}>
        <CreatePostForm onCreated={() => {
          setOpen(false);
          feed.reset();
          feed.loadMore(true);
        }} />
      </Modal>
    </div>
  );
}