const mongoose = require("mongoose");

const VoteSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  benefit:      { type: Number, min: 0, max: 10, default: 0 },
  effort:       { type: Number, min: 0, max: 10, default: 0 },
  malice:       { type: Number, min: 0, max: 10, default: 0 },
  destruction:  { type: Number, min: 0, max: 10, default: 0 },
  cuteness:     { type: Number, min: 0, max: 10, default: 0 },
  contribution: { type: Number, required: true },
}, { timestamps: true });

VoteSchema.index({ postId: 1, userId: 1 }, { unique: true });

const Vote = mongoose.model("Vote", VoteSchema);

module.exports = { Vote };