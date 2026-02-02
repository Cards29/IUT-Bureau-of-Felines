import React from "react";
import { apiFetch } from "../utils/api";
import { useAuth } from "../state/auth";

export default function VoteButtons({ postId, voteScore, onVoted }) {
  const { user } = useAuth();
  const [myVote, setMyVote] = React.useState(0);
  const [score, setScore] = React.useState(voteScore || 0);

  React.useEffect(() => {
    setScore(voteScore || 0);
  }, [voteScore]);

  React.useEffect(() => {
    let active = true;
    async function load() {
      if (!user) { setMyVote(0); return; }
      try {
        const data = await apiFetch(`/posts/${postId}/my-vote`);
        if (active) setMyVote(data.value || 0);
      } catch {}
    }
    load();
    return () => { active = false; };
  }, [postId, user]);

  async function cast(value) {
    if (!user) return alert("Login to vote");
    const data = await apiFetch(`/posts/${postId}/vote`, {
      method: "POST",
      body: JSON.stringify({ value }),
    });
    setScore(data.voteScore);
    const mv = await apiFetch(`/posts/${postId}/my-vote`);
    setMyVote(mv.value || 0);
    onVoted?.(data.voteScore);
  }

  return (
    <div className="row" style={{ gap: 6 }}>
      <button className="btn small" onClick={() => cast(myVote === 1 ? 0 : 1)} title="Upvote">
        {myVote === 1 ? "▲" : "△"}
      </button>
      <div style={{ width: 36, textAlign: "center", fontWeight: 900 }}>{score}</div>
      <button className="btn small" onClick={() => cast(myVote === -1 ? 0 : -1)} title="Downvote">
        {myVote === -1 ? "▼" : "▽"}
      </button>
    </div>
  );
}