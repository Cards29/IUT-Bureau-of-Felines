const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const { Post } = require("../models/Post");
const { Comment } = require("../models/Comment");
const { Vote } = require("../models/Vote");
const { postCreateSchema, commentCreateSchema, voteSchema } = require("../validation/schemas");
const { upload } = require("../utils/upload");
const { setupCloudinary, uploadBufferToCloudinary } = require("../utils/cloudinary");

setupCloudinary();

router.get("/", async (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 50);
  const cursor = req.query.cursor || null;

  const filter = {};
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
});

router.post("/", requireAuth, upload.single("image"), async (req, res) => {
  const parsed = postCreateSchema.safeParse({
    catId: req.body.catId,
    title: req.body.title,
    body: req.body.body,
  });
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid post data" });
  }

  let imageUrl = "";
  if (req.file?.buffer) {
    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder: "catbureau/posts",
      resource_type: "image",
    });
    imageUrl = result.secure_url || "";
  }

  const post = await Post.create({
    ...parsed.data,
    authorId: req.user._id,
    imageUrl,
  });

  const populated = await Post.findById(post._id)
    .populate("authorId", "username displayName avatarUrl")
    .populate("catId", "name photoUrl")
    .lean();

  res.status(201).json(populated);
});

router.get("/:id", async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate("authorId", "username displayName avatarUrl")
    .populate("catId", "name photoUrl")
    .lean();
  if (!post) return res.status(404).json({ message: "Post not found" });
  res.json(post);
});

router.get("/:id/comments", async (req, res) => {
  const comments = await Comment.find({ postId: req.params.id })
    .sort({ createdAt: 1 })
    .populate("authorId", "username displayName avatarUrl")
    .lean();
  res.json({ items: comments });
});

router.post("/:id/comments", requireAuth, async (req, res) => {
  const parsed = commentCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid comment" });
  }

  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });

  const comment = await Comment.create({
    postId: post._id,
    authorId: req.user._id,
    body: parsed.data.body,
  });

  post.commentCount += 1;
  await post.save();

  const populated = await Comment.findById(comment._id)
    .populate("authorId", "username displayName avatarUrl")
    .lean();

  res.status(201).json(populated);
});

router.post("/:id/vote", requireAuth, async (req, res) => {
  const parsed = voteSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid vote" });
  }
  const { value } = parsed.data;

  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });

  const existing = await Vote.findOne({ postId: post._id, userId: req.user._id });

  let delta = 0;

  if (!existing && value !== 0) {
    await Vote.create({ postId: post._id, userId: req.user._id, value });
    delta = value;
  } else if (existing && value === 0) {
    delta = -existing.value;
    await existing.deleteOne();
  } else if (existing && existing.value !== value) {
    delta = value - existing.value;
    existing.value = value;
    await existing.save();
  }

  if (delta !== 0) {
    post.voteScore += delta;
    await post.save();
  }

  res.json({ ok: true, voteScore: post.voteScore });
});

router.get("/:id/my-vote", requireAuth, async (req, res) => {
  const existing = await Vote.findOne({ postId: req.params.id, userId: req.user._id }).lean();
  res.json({ value: existing ? existing.value : 0 });
});

module.exports = router;