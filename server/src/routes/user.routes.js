const router = require("express").Router();
const { User } = require("../models/User");
const { Post } = require("../models/Post");

router.get("/", async (req, res, next) => {
  try {
    const q = (req.query.q || "").trim();
    const limit = Math.min(Math.max(parseInt(req.query.limit || "20", 10), 1), 50);
    const cursor = req.query.cursor || null;

    const filter = q ? { username: { $regex: q, $options: "i" } } : {};
    if (cursor) filter._id = { $lt: cursor };

    const items = await User.find(filter).sort({ _id: -1 }).limit(limit + 1).select("username displayName avatarUrl createdAt").lean();
    const hasMore = items.length > limit;
    const sliced = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore ? sliced[sliced.length - 1]._id : null;

    res.json({ items: sliced, hasMore, nextCursor });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("username displayName avatarUrl createdAt").lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.get("/:id/posts", async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 50);
    const cursor = req.query.cursor || null;

    const filter = { authorId: req.params.id };
    if (cursor) filter._id = { $lt: cursor };

    const items = await Post.find(filter)
      .sort({ _id: -1 })
      .limit(limit + 1)
      .populate("authorId", "username displayName avatarUrl")
      .populate("catId", "name photoUrl")
      .lean();

    const hasMore = items.length > limit;
    const sliced = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore ? sliced[sliced.length - 1]._id : null;

    res.json({ items: sliced, hasMore, nextCursor });
  } catch (err) {
    next(err);
  }
});

module.exports = router;