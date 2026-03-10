const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  catId: { type: mongoose.Schema.Types.ObjectId, ref: "Cat", required: true, index: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  type: { type: String, enum: ["commendation", "infraction"], required: true },
  title: { type: String, required: true },
  body: { type: String, default: "" },
  imageUrl: { type: String, default: "" },
  imageUrls: { type: [String], default: [] },
  videoUrl: { type: String, default: "" },
  videoPublicId: { type: String, default: "" },
  voteScore: { type: Number, default: 0, index: true },
  commentCount: { type: Number, default: 0 },
}, { timestamps: true });

const Post = mongoose.model("Post", PostSchema);

module.exports = { Post };