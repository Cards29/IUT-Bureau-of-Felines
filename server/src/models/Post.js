const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  catId: { type: mongoose.Schema.Types.ObjectId, ref: "Cat", required: true, index: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true },
  body: { type: String, default: "" },
  imageUrl: { type: String, default: "" },
  voteScore: { type: Number, default: 0, index: true },
  commentCount: { type: Number, default: 0 },
}, { timestamps: true });

const Post = mongoose.model("Post", PostSchema);

module.exports = { Post };