import React from "react";
import { Link } from "react-router-dom";
import VoteButtons from "./VoteButtons";

export default function PostCard({ post, onVoted }) {
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
        <VoteButtons postId={post._id} voteScore={post.voteScore} onVoted={onVoted} />
      </div>

      {post.body ? <p style={{ marginTop: 10, whiteSpace: "pre-wrap" }}>{post.body}</p> : null}
      {post.imageUrl ? <img className="postImage" src={post.imageUrl} alt="post" /> : null}
      <div className="muted" style={{ marginTop: 10, fontSize: 13 }}>
        {post.commentCount || 0} comments
      </div>
    </div>
  );
}