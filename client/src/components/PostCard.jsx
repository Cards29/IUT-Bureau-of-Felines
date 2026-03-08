import React from "react";
import { Link } from "react-router-dom";
import VoteButtons from "./VoteButtons";
import { useAuth } from "../state/auth";
import { apiFetch } from "../utils/api";

export default function PostCard({ post, onVoted, onDelete }) {
  const { user } = useAuth();
  const [currentImg, setCurrentImg] = React.useState(0);
  const isAuthor = user && post.authorId?._id === user.id;

  async function handleDelete() {
    try {
      await apiFetch(`/posts/${post._id}`, { method: "DELETE" });
      if (onDelete) onDelete(post._id);
    } catch (e) {
      alert(e.message);
    }
  }

  const nextImg = (e) => {
    e.preventDefault();
    setCurrentImg((prev) => (prev + 1) % post.imageUrls.length);
  };

  const prevImg = (e) => {
    e.preventDefault();
    setCurrentImg((prev) => (prev - 1 + post.imageUrls.length) % post.imageUrls.length);
  };

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between", gap: 12 }}>
        <div className="row" style={{ gap: 10 }}>
          {post.authorId?.avatarUrl ? (
            <img className="avatar" src={post.authorId.avatarUrl} alt="avatar" />
          ) : (
            <div className="avatar" />
          )}
          <div>
            <div style={{ fontWeight: 900 }}>
              <Link to={`/posts/${post._id}`}>{post.title}</Link>
            </div>
            <div className="muted" style={{ fontSize: 13 }}>
              <Link to={`/users/${post.authorId?._id}`} style={{ textDecoration: "underline" }}>
                {post.authorId?.username || "unknown"}
              </Link>
              {" • "}
              <Link to={`/cats/${post.catId?._id}`} style={{ textDecoration: "underline" }}>
                {post.catId?.name || "cat"}
              </Link>
              {" • "}
              {new Date(post.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
        <div className="row" style={{ gap: 8, alignItems: "center" }}>
          {isAuthor && onDelete ? (
            <button className="btn" style={{ color: "var(--color-danger, red)", padding: "2px 8px" }} onClick={handleDelete}>
              Delete
            </button>
          ) : null}
          <VoteButtons postId={post._id} voteScore={post.voteScore} onVoted={onVoted} />
        </div>
      </div>

      {post.body ? <p style={{ marginTop: 10, whiteSpace: "pre-wrap" }}>{post.body}</p> : null}
      
      {post.imageUrls && post.imageUrls.length > 0 ? (
        <div className="slideshow">
          <img src={post.imageUrls[currentImg]} alt={`post-${currentImg}`} />
          {post.imageUrls.length > 1 && (
            <>
              <button className="slideshowBtn prev" onClick={prevImg}>‹</button>
              <button className="slideshowBtn next" onClick={nextImg}>›</button>
              <div className="slideshowDots">
                {post.imageUrls.map((_, i) => (
                  <div 
                    key={i} 
                    className={`dot ${i === currentImg ? "active" : ""}`}
                    onClick={() => setCurrentImg(i)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      ) : post.imageUrl ? (
        <img className="postImage" style={{ marginTop: 10 }} src={post.imageUrl} alt="post" />
      ) : null}

      <div className="muted" style={{ marginTop: 10, fontSize: 13 }}>
        {post.commentCount || 0} comments
      </div>
    </div>
  );
}