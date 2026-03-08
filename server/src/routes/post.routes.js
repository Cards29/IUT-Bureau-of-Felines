const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const { Post } = require("../models/Post");
const { Comment } = require("../models/Comment");
const { Vote } = require("../models/Vote");
const { postCreateSchema, commentCreateSchema, voteSchema } = require("../validation/schemas");
const { upload } = require("../utils/upload");
const { setupCloudinary, uploadBufferToCloudinary, deleteImageFromCloudinary } = require("../utils/cloudinary");

setupCloudinary();

router.get("/", async (req, res, next) => {
  try {
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
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, upload.array("images", 5), async (req, res, next) => {
  try {
    const parsed = postCreateSchema.safeParse({
      catId: req.body.catId,
      title: req.body.title,
      body: req.body.body,
    });
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid post data" });
    }

    const imageUrls = [];
    const uploadedPublicIds = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        let result;
        try {
          result = await uploadBufferToCloudinary(file.buffer, {
            folder: "catbureau/posts",
            resource_type: "image",
          });
        } catch (uploadErr) {
          // Clean up any images already uploaded in this request
          for (const publicId of uploadedPublicIds) {
            await deleteImageFromCloudinary(publicId).catch(() => {});
          }
          return next(uploadErr);
        }
        if (result.secure_url) imageUrls.push(result.secure_url);
        if (result.public_id) uploadedPublicIds.push(result.public_id);
      }
    }

    const post = await Post.create({
      ...parsed.data,
      authorId: req.user._id,
      imageUrl: imageUrls[0] || "",
      imageUrls,
    });

    const populated = await Post.findById(post._id)
      .populate("authorId", "username displayName avatarUrl")
      .populate("catId", "name photoUrl")
      .lean();

    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("authorId", "username displayName avatarUrl")
      .populate("catId", "name photoUrl")
      .lean();
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    next(err);
  }
});

router.get("/:id/comments", async (req, res, next) => {
  try {
    const comments = await Comment.find({ postId: req.params.id })
      .sort({ createdAt: 1 })
      .populate("authorId", "username displayName avatarUrl")
      .lean();
    res.json({ items: comments });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/comments", requireAuth, async (req, res, next) => {
  try {
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
  } catch (err) {
    next(err);
  }
});

router.post("/:id/vote", requireAuth, async (req, res, next) => {
  try {
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
  } catch (err) {
    next(err);
  }
});

router.get("/:id/my-vote", requireAuth, async (req, res, next) => {
  try {
    const existing = await Vote.findOne({ postId: req.params.id, userId: req.user._id }).lean();
    res.json({ value: existing ? existing.value : 0 });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (!post.authorId.equals(req.user._id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (post.imageUrls && post.imageUrls.length > 0) {
      for (const url of post.imageUrls) {
        const parts = url.split("/upload/");
        if (parts[1]) {
          const publicId = parts[1].replace(/^v\d+\//, "").replace(/\.[^/.]+$/, "");
          await deleteImageFromCloudinary(publicId);
        }
      }
    } else if (post.imageUrl) {
      const parts = post.imageUrl.split("/upload/");
      if (parts[1]) {
        const publicId = parts[1].replace(/^v\d+\//, "").replace(/\.[^/.]+$/, "");
        await deleteImageFromCloudinary(publicId);
      }
    }

    await post.deleteOne();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;