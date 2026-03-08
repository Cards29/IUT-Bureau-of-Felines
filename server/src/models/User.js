const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true, sparse: true },
  username: { type: String, required: true, unique: true, index: true },
  displayName: { type: String },
  avatarUrl: { type: String },
  passwordHash: { type: String },
  authProviders: { type: [String], default: [] },
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);

module.exports = { User };