import React from "react";
import PostCard from "../components/PostCard";
import Fab from "../components/Fab";
import Modal from "../components/Modal";
import CreatePostForm from "./_parts/CreatePostForm";
import InfiniteSentinel from "../components/InfiniteSentinel";
import { useInfiniteFeed } from "../hooks/useInfiniteFeed";
import { useAuth } from "../state/auth";

export default function Newsfeed() {
  const { user, openLogin } = useAuth();
  const feed = useInfiniteFeed({ endpoint: "/posts", limit: 10 });
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    feed.loadMore(true);
  }, []);

  return (
    <div className="postFeed">
      {feed.items.map(p => (
        <PostCard key={p._id} post={p} onVoted={(score) => {
          feed.setItems(prev => prev.map(x => x._id === p._id ? { ...x, voteScore: score } : x));
        }} onDelete={(id) => feed.setItems(prev => prev.filter(x => x._id !== id))} />
      ))}

      {feed.loading ? (
        <>
          {[1, 2].map(i => (
            <div key={i} className="skeletonCard">
              <div className="skeletonLine" style={{ width: "40%", height: 10, marginBottom: 10 }} />
              <div className="skeletonLine" style={{ width: "75%", height: 18, marginBottom: 12 }} />
              <div className="skeletonLine" style={{ width: "90%", height: 10, marginBottom: 6 }} />
              <div className="skeletonLine" style={{ width: "60%", height: 10 }} />
            </div>
          ))}
        </>
      ) : null}

      {!feed.loading && feed.items.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "32px 16px", color: "var(--muted)" }}>
          <div style={{ fontFamily: "Special Elite, serif", fontSize: 18, marginBottom: 6 }}>No posts on file.</div>
          <div style={{ fontSize: 13 }}>Be the first to file a commendation or infraction.</div>
        </div>
      ) : null}

      <InfiniteSentinel disabled={!feed.hasMore || feed.loading} onVisible={() => feed.loadMore(false)} />
      {!feed.hasMore && feed.items.length > 0 ? (
        <div className="muted" style={{ textAlign: "center", padding: "12px 0", fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          — End of Records —
        </div>
      ) : null}

      <Fab onClick={() => {
        if (!user) return openLogin();
        setOpen(true);
      }} />

      <Modal open={open} title="File a Report" onClose={() => setOpen(false)}>
        <CreatePostForm onCreated={() => {
          setOpen(false);
          feed.reset();
          feed.loadMore(true);
        }} />
      </Modal>
    </div>
  );
}
