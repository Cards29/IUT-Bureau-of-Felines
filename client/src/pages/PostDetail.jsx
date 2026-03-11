import React from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { apiFetch } from "../utils/api";
import PostCard from "../components/PostCard";
import Comment from "../components/Comment";
import { useAuth } from "../state/auth";

export default function PostDetail() {
  const { id } = useParams();
  const { user, openLogin } = useAuth();

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
    const toastId = toast.loading("Filing remark...");
    try {
      const newC = await apiFetch(`/posts/${id}/comments`, {
        method: "POST",
        body: JSON.stringify({ body }),
      });
      setBody("");
      setComments(prev => [...prev, newC]);
      setPost(prev => ({ ...prev, commentCount: (prev.commentCount || 0) + 1 }));
      toast.success("Remark filed.", { id: toastId });
    } catch (e) {
      toast.error(e.message || "Failed to file remark.", { id: toastId });
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

  if (postLoading) {
    return (
      <div className="max-w-[700px] mx-auto">
        <div className="skeleton h-32 w-full mb-4 rounded-[3px]" />
        <div className="skeleton h-32 w-full rounded-[3px]" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-[700px] mx-auto">
        <div className="card bg-base-100 border border-base-300 p-4 text-center">
          <div className="font-[Special_Elite] text-base text-error mb-1.5">Record Unavailable</div>
          <div className="text-sm text-base-content/60">{loadError}</div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-[700px] mx-auto">
        <div className="card bg-base-100 border border-base-300 p-4 text-center text-base-content/60">
          <div className="font-[Special_Elite] text-base">No record found.</div>
        </div>
      </div>
    );
  }

  const commentCountLabel = post.commentCount === 0
    ? "No remarks on file"
    : post.commentCount === 1
    ? "1 Remark on File"
    : `${post.commentCount} Remarks on File`;

  return (
    <div className="max-w-[700px] mx-auto">
      <div className="max-w-[700px] mb-0">
        <PostCard post={post} onVoted={(score) => setPost(prev => ({ ...prev, voteScore: score }))} />
      </div>

      <div className="card bg-base-100 border border-base-300 p-4 mt-4">
        {/* Comment count header */}
        <div className="font-[Special_Elite] text-[13px] tracking-widest mb-3.5 pb-2.5 border-b border-base-300 text-base-content/60 uppercase">
          {commentCountLabel}
        </div>

        {/* Add comment */}
        {user ? (
          <div className="mb-4">
            <div className="text-base-content/60 text-[11px] tracking-widest uppercase mb-1.5">
              Your Remark
            </div>
            <textarea
              className="textarea textarea-bordered w-full resize-y mb-2.5"
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="State your observations for the record..."
              rows={3}
            />
            <div className="flex justify-end">
              <button
                className="btn btn-primary"
                disabled={submitting || !body.trim()}
                onClick={addComment}
              >
                {submitting ? "Filing..." : "File Remark"}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-base-200 border border-base-300 rounded-[3px] px-4 py-3 mb-3.5 text-sm text-center text-base-content/60">
            <button
              onClick={openLogin}
              className="btn btn-link text-primary p-0"
            >
              Log in
            </button>
            {" "}to file a remark on this record.
          </div>
        )}

        {/* Comments list */}
        {commentsLoading ? (
          <div>
            {[1, 2].map(i => (
              <div key={i} className="py-3 border-b border-base-300">
                <div className="skeleton h-2.5 w-[25%] mb-2 rounded" />
                <div className="skeleton h-3.5 w-4/5 rounded" />
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="py-5 text-center text-base-content/60 text-sm">
            No remarks on file. Be the first to comment.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {comments.map(c => (
              <Comment
                key={c._id}
                comment={c}
                postId={id}
                onDelete={handleCommentDelete}
                onUpdate={handleCommentUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
