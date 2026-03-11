import React from "react";
import toast from "react-hot-toast";
import Modal from "./Modal";
import { apiFetch } from "../utils/api";

function computeContribution(postType, sliders) {
  if (postType === "commendation") {
    return ((sliders.benefit * 1.5) + (sliders.effort * 1.0) + (sliders.cuteness * 0.5)) / 3;
  }
  return ((sliders.malice * 1.5) + (sliders.destruction * 1.0) - (sliders.cuteness * 0.8)) / 3;
}

export default function VoteModal({ open, onClose, postId, postType, onVoted }) {
  const [loading, setLoading] = React.useState(false);
  const [alreadyVoted, setAlreadyVoted] = React.useState(false);
  const [existingContribution, setExistingContribution] = React.useState(null);
  const [benefit, setBenefit] = React.useState(0);
  const [effort, setEffort] = React.useState(0);
  const [malice, setMalice] = React.useState(0);
  const [destruction, setDestruction] = React.useState(0);
  const [cuteness, setCuteness] = React.useState(0);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    let active = true;
    async function checkVote() {
      setLoading(true);
      setError("");
      try {
        const data = await apiFetch(`/posts/${postId}/my-vote`);
        if (!active) return;
        if (data.voted) {
          setAlreadyVoted(true);
          setExistingContribution(data.contribution);
        } else {
          setAlreadyVoted(false);
          setExistingContribution(null);
          setBenefit(0);
          setEffort(0);
          setMalice(0);
          setDestruction(0);
          setCuteness(0);
        }
      } catch {
        if (active) setError("Failed to load vote status.");
      } finally {
        if (active) setLoading(false);
      }
    }
    checkVote();
    return () => { active = false; };
  }, [open, postId]);

  function handleClose() {
    setAlreadyVoted(false);
    setExistingContribution(null);
    setBenefit(0);
    setEffort(0);
    setMalice(0);
    setDestruction(0);
    setCuteness(0);
    setSubmitting(false);
    setError("");
    onClose();
  }

  const sliders = { benefit, effort, malice, destruction, cuteness };
  const preview = computeContribution(postType, sliders);
  const isCommendation = postType === "commendation";

  async function handleSubmit() {
    setError("");
    setSubmitting(true);
    try {
      const body = isCommendation
        ? { benefit, effort, cuteness }
        : { malice, destruction, cuteness };
      const data = await apiFetch(`/posts/${postId}/vote`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      toast.success(isCommendation ? "Commendation filed." : "Infraction filed.");
      onVoted(data.voteScore);
      handleClose();
    } catch (e) {
      if (e.status === 409) {
        toast.error("You have already voted on this post.");
      } else {
        toast.error(e.message || "Failed to submit vote.");
      }
      setError(e.message || "Failed to submit vote. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const title = isCommendation ? "Commend this post" : "File an infraction";

  return (
    <Modal open={open} title={title} onClose={handleClose}>
      {loading ? (
        <div className="muted">Loading...</div>
      ) : alreadyVoted ? (
        <div>
          <div className="muted" style={{ marginBottom: 12 }}>You have already voted on this post.</div>
          <div style={{ fontWeight: 900, color: isCommendation ? "green" : "red", fontSize: 16 }}>
            {isCommendation ? "+" : "−"}{Math.abs(existingContribution).toFixed(2)}
          </div>
        </div>
      ) : (
        <div>
          {isCommendation ? (
            <>
              <div style={{ marginBottom: 14 }}>
                <div className="muted" style={{ marginBottom: 4 }}>Benefit <strong>{benefit}</strong></div>
                <input type="range" min="0" max="10" step="1" value={benefit} onChange={e => setBenefit(Number(e.target.value))} style={{ width: "100%" }} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <div className="muted" style={{ marginBottom: 4 }}>Effort <strong>{effort}</strong></div>
                <input type="range" min="0" max="10" step="1" value={effort} onChange={e => setEffort(Number(e.target.value))} style={{ width: "100%" }} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <div className="muted" style={{ marginBottom: 4 }}>Cuteness <strong>{cuteness}</strong></div>
                <input type="range" min="0" max="10" step="1" value={cuteness} onChange={e => setCuteness(Number(e.target.value))} style={{ width: "100%" }} />
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: 14 }}>
                <div className="muted" style={{ marginBottom: 4 }}>Malice <strong>{malice}</strong></div>
                <input type="range" min="0" max="10" step="1" value={malice} onChange={e => setMalice(Number(e.target.value))} style={{ width: "100%" }} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <div className="muted" style={{ marginBottom: 4 }}>Destruction <strong>{destruction}</strong></div>
                <input type="range" min="0" max="10" step="1" value={destruction} onChange={e => setDestruction(Number(e.target.value))} style={{ width: "100%" }} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <div className="muted" style={{ marginBottom: 4 }}>Cuteness <strong>{cuteness}</strong></div>
                <input type="range" min="0" max="10" step="1" value={cuteness} onChange={e => setCuteness(Number(e.target.value))} style={{ width: "100%" }} />
              </div>
            </>
          )}

          <div style={{ marginBottom: 14, fontWeight: 900, color: isCommendation ? "green" : "red" }}>
            Contribution: {isCommendation ? "+" : "−"}{Math.abs(preview).toFixed(2)}
          </div>

          <div className="muted" style={{ fontSize: 12, marginBottom: 12 }}>
            Are you sure? You cannot change your vote later.
          </div>

          <button className="btn primary" onClick={handleSubmit} disabled={submitting} style={{ width: "100%" }}>
            {submitting ? "Submitting..." : "Submit Vote"}
          </button>

          {error && <div style={{ color: "red", fontSize: 12, marginTop: 8 }}>{error}</div>}
        </div>
      )}
    </Modal>
  );
}
