import React from "react";
import { apiFetch } from "../utils/api";
import { useAuth } from "../state/auth";
import VoteModal from "./VoteModal";

export default function VoteButtons({ postId, postType, voteScore, onVoted }) {
  const { user, openLogin } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [myContribution, setMyContribution] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    async function load() {
      if (!user) { setMyContribution(null); return; }
      setLoading(true);
      try {
        const data = await apiFetch(`/posts/${postId}/my-vote`);
        if (!active) return;
        if (data.voted) {
          setMyContribution(data.contribution);
        } else {
          setMyContribution(null);
        }
      } catch {
        if (active) setMyContribution(null);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [postId, user]);

  function handleVoteClick() {
    if (!user) return openLogin();
    setOpen(true);
  }

  function handleVoted(contribution) {
    setMyContribution(contribution);
    onVoted?.(contribution);
  }

  const isCommendation = postType === "commendation";

  if (loading) {
    return <div className="skeleton h-8 w-16 rounded" />;
  }

  if (myContribution !== null) {
    return (
      <span className={`voteContribution ${isCommendation ? "commendation" : "infraction"}`}>
        {isCommendation ? "+" : "−"}{Math.abs(myContribution).toFixed(2)}
      </span>
    );
  }

  return (
    <>
      <button className="btn btn-sm" onClick={handleVoteClick}>
        Vote
      </button>
      <VoteModal
        open={open}
        onClose={() => setOpen(false)}
        postId={postId}
        postType={postType}
        onVoted={handleVoted}
      />
    </>
  );
}
