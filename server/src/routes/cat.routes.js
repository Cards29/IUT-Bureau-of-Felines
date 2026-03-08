const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const { Cat } = require("../models/Cat");
const { Post } = require("../models/Post");
const { catCreateSchema } = require("../validation/schemas");
const { upload } = require("../utils/upload");
const { setupCloudinary, uploadBufferToCloudinary } = require("../utils/cloudinary");

setupCloudinary();

router.get("/", async (req, res, next) => {
  try {
    const q = (req.query.q || "").trim();
    const limit = Math.min(Math.max(parseInt(req.query.limit || "20", 10), 1), 50);
    const cursor = req.query.cursor || null;

    const filter = q ? { name: { $regex: q, $options: "i" } } : {};
    if (cursor) filter._id = { $lt: cursor };

    const items = await Cat.find(filter).sort({ _id: -1 }).limit(limit + 1).lean();
    const hasMore = items.length > limit;
    const sliced = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore ? sliced[sliced.length - 1]._id : null;

    res.json({ items: sliced, hasMore, nextCursor });
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, upload.single("photo"), async (req, res, next) => {
  try {
    const parsed = catCreateSchema.safeParse({
      name: req.body.name,
      bio: req.body.bio,
    });

    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid cat data" });
    }

    const { name, bio } = parsed.data;

    const exists = await Cat.exists({ name });
    if (exists) return res.status(409).json({ message: "Cat name already exists" });

    let photoUrl = "";
    if (req.file?.buffer) {
      const result = await uploadBufferToCloudinary(req.file.buffer, {
        folder: "catbureau/cats",
        resource_type: "image",
      });
      photoUrl = result.secure_url || "";
    }

    const cat = await Cat.create({
      name,
      bio,
      photoUrl,
      createdBy: req.user._id,
    });

    return res.status(201).json(cat);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const cat = await Cat.findById(req.params.id).lean();
    if (!cat) return res.status(404).json({ message: "Cat not found" });
    res.json(cat);
  } catch (err) {
    next(err);
  }
});

router.get("/:id/posts", async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 50);
    const cursor = req.query.cursor || null;

    const filter = { catId: req.params.id };
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