const mongoose = require("mongoose");

const CatSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, index: true },
  bio: { type: String, default: "" },
  photoUrl: { type: String, default: "" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  rejectionReason: { type: String, default: "" },
  score: { type: Number, default: 10, index: true },
}, { timestamps: true });

const Cat = mongoose.model("Cat", CatSchema);

module.exports = { Cat };