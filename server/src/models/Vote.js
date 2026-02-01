const mongoose = require("mongoose");

const VoteSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  value: { type: Number, enum: [1, -1], required: true },
}, { timestamps: true });

VoteSchema.index({ postId: 1, userId: 1 }, { unique: true });

const Vote = mongoose.model("Vote", VoteSchema);

module.exports = { Vote };