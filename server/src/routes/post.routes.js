const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const { Post } = require("../models/Post");
const { Comment } = require("../models/Comment");
const { Vote } = require("../models/Vote");
const { Cat } = require("../models/Cat");
const { postCreateSchema, commentCreateSchema, commendationVoteSchema, infractionVoteSchema } = require("../validation/schemas");
const { uploadMedia } = require("../utils/upload");
const { setupCloudinary, uploadBufferToCloudinary, deleteImageFromCloudinary, deleteVideoFromCloudinary } = require("../utils/cloudinary");

const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

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

router.post("/", requireAuth, uploadMedia.fields([{ name: "images", maxCount: 5 }, { name: "video", maxCount: 1 }]), async (req, res, next) => {
  try {
    const parsed = postCreateSchema.safeParse({
      catId: req.body.catId,
      type: req.body.type,
      title: req.body.title,
      body: req.body.body,
    });
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid post data" });
    }

    const hasImages = req.files?.images && req.files.images.length > 0;
    const hasVideo = req.files?.video && req.files.video.length > 0;

    if (hasImages && hasVideo) {
      return res.status(400).json({ message: "Submit either images or a video, not both" });
    }

    const imageUrls = [];
    const uploadedPublicIds = [];
    let videoUrl = "";
    let videoPublicId = "";

    if (hasImages) {
      for (const file of req.files.images) {
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

    if (hasVideo) {
      const file = req.files.video[0];
      if (!ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
        return res.status(400).json({ message: "Invalid video format. Allowed: mp4, webm, mov" });
      }
      let result;
      try {
        result = await uploadBufferToCloudinary(file.buffer, {
          folder: "catbureau/posts",
          resource_type: "video",
        });
      } catch (uploadErr) {
        return next(uploadErr);
      }
      videoUrl = result.secure_url || "";
      videoPublicId = result.public_id || "";
    }

    const post = await Post.create({
      ...parsed.data,
      authorId: req.user._id,
      imageUrl: imageUrls[0] || "",
      imageUrls,
      videoUrl,
      videoPublicId,
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
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const existing = await Vote.findOne({ postId: post._id, userId: req.user._id });
    if (existing) {
      return res.status(409).json({ message: "You have already voted on this post" });
    }

    const schema = post.type === "commendation" ? commendationVoteSchema : infractionVoteSchema;
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message || "Invalid vote data";
      return res.status(400).json({ message });
    }

    let contribution;
    if (post.type === "commendation") {
      const { benefit, effort, cuteness } = parsed.data;
      contribution = ((benefit * 1.5) + (effort * 1.0) + (cuteness * 0.5)) / 3;
    } else {
      const { malice, destruction, cuteness } = parsed.data;
      contribution = ((malice * 1.5) + (destruction * 1.0) - (cuteness * 0.8)) / 3;
    }

    const cat = await Cat.findById(post.catId);
    if (!cat) return res.status(404).json({ message: "Cat not found" });

    await Vote.create({
      postId: post._id,
      userId: req.user._id,
      ...parsed.data,
      contribution,
    });

    if (post.type === "commendation") {
      cat.score += contribution;
    } else {
      cat.score -= contribution;
    }
    await cat.save();

    post.voteScore = contribution;
    await post.save();

    res.json({ ok: true, voteScore: post.voteScore });
  } catch (err) {
    next(err);
  }
});

router.get("/:id/my-vote", requireAuth, async (req, res, next) => {
  try {
    const existing = await Vote.findOne({ postId: req.params.id, userId: req.user._id }).lean();
    if (!existing) return res.json({ voted: false });
    res.json({
      voted: true,
      contribution: existing.contribution,
      benefit: existing.benefit,
      effort: existing.effort,
      malice: existing.malice,
      destruction: existing.destruction,
      cuteness: existing.cuteness,
    });
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

    if (post.videoPublicId) {
      await deleteVideoFromCloudinary(post.videoPublicId).catch(() => {});
    }

    await post.deleteOne();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;