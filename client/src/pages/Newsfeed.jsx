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
    <div className="max-w-[700px]">
      {/* Narrow-viewport fallback — hidden on large screens where the FAB appears */}
      <div className="flex justify-end mb-3 lg:hidden">
        <button
          className="btn btn-primary btn-sm font-[Special_Elite]"
          onClick={() => {
            if (!user) return openLogin();
            setOpen(true);
          }}
        >
          + New Report
        </button>
      </div>

      {feed.items.map(p => (
        <PostCard key={p._id} post={p} onVoted={(score) => {
          feed.setItems(prev => prev.map(x => x._id === p._id ? { ...x, voteScore: score } : x));
        }} onDelete={(id) => feed.setItems(prev => prev.filter(x => x._id !== id))} />
      ))}

      {feed.loading ? (
        <>
          {[1, 2].map(i => (
            <div key={i} className="skeleton h-32 w-full mb-3 rounded-[3px]" />
          ))}
        </>
      ) : null}

      {!feed.loading && feed.items.length === 0 ? (
        <div className="card bg-base-100 border border-base-300 p-4 text-base-content/60 text-sm text-center">
          <div className="font-[Special_Elite] text-lg mb-1.5">No posts on file.</div>
          <div>Be the first to file a commendation or infraction.</div>
        </div>
      ) : null}

      <InfiniteSentinel disabled={!feed.hasMore || feed.loading} onVisible={() => feed.loadMore(false)} />
      {!feed.hasMore && feed.items.length > 0 ? (
        <div className="text-center py-3 text-xs text-base-content/60 tracking-widest uppercase">
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
