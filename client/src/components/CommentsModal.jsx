import React from "react";
import toast from "react-hot-toast";
import Modal from "./Modal";
import Comment from "./Comment";
import { useAuth } from "../state/auth";
import { apiFetch } from "../utils/api";

export default function CommentsModal({ open, postId, onClose }) {
  const { user } = useAuth();
  const [comments, setComments] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [body, setBody] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [post, setPost] = React.useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [c, p] = await Promise.all([
        apiFetch(`/posts/${postId}/comments`),
        apiFetch(`/posts/${postId}`),
      ]);
      setComments(c.items || []);
      setPost(p);
    } catch (e) {
      setError(e.message || "Failed to load comments");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    if (open) load();
  }, [open, postId]);

  async function addComment() {
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      const newC = await apiFetch(`/posts/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify({ body }),
      });
      setBody("");
      setComments(prev => [...prev, newC]);
      setPost(prev => ({ ...prev, commentCount: (prev.commentCount || 0) + 1 }));
      toast.success("Comment posted.");
    } catch (e) {
      toast.error(e.message || "Failed to post comment.");
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

  return (
    <Modal open={open} title={`Comments (${post?.commentCount || 0})`} onClose={onClose}>
      <div className="flex flex-col max-h-[60vh] gap-3">
        {/* Add Comment Form */}
        {user && (
          <div className="bg-base-200 rounded-[3px] p-3 border-b border-base-300 flex-shrink-0">
            <textarea
              className="textarea textarea-bordered w-full resize-y mb-2"
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Write your remarks here..."
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <button
                className="btn btn-sm"
                onClick={() => setBody("")}
                disabled={submitting || !body.trim()}
              >
                Clear
              </button>
              <button
                className="btn btn-primary btn-sm"
                disabled={submitting || !body.trim()}
                onClick={addComment}
              >
                {submitting ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </div>
        )}

        {!user && (
          <div className="bg-base-200 border border-base-300 rounded-[3px] p-3 text-sm text-center text-base-content/60 flex-shrink-0">
            Log in to leave a remark on the record.
          </div>
        )}

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-2">
          {loading && (
            <div className="py-5 text-center text-base-content/60 text-sm">Loading remarks...</div>
          )}

          {error && (
            <div className="alert alert-error text-sm">{error}</div>
          )}

          {!loading && !error && comments.length === 0 && (
            <div className="py-5 text-center text-base-content/60 text-sm">
              No remarks on file. Be the first to comment.
            </div>
          )}

          {!loading && comments.length > 0 && (
            comments.map(c => (
              <Comment
                key={c._id}
                comment={c}
                postId={postId}
                onDelete={handleCommentDelete}
                onUpdate={handleCommentUpdate}
              />
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
