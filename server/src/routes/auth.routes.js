const router = require("express").Router();
const passport = require("passport");
const { requireAuth } = require("../middleware/auth");
const { usernameUpdateSchema } = require("../validation/schemas");
const { User } = require("../models/User");

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/login-failed" }),
  (req, res) => {
    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
    res.redirect(`${clientUrl}/newsfeed`);
  }
);

router.get("/login-failed", (req, res) => {
  res.status(401).json({ message: "Google login failed" });
});

router.get("/me", (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    const u = req.user;
    return res.json({
      isAuthenticated: true,
      user: {
        id: u._id,
        username: u.username,
        displayName: u.displayName,
        avatarUrl: u.avatarUrl,
        email: u.email,
        createdAt: u.createdAt,
      }
    });
  }
  return res.json({ isAuthenticated: false, user: null });
});

router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session?.destroy(() => {
      res.clearCookie("catbureau.sid");
      res.json({ ok: true });
    });
  });
});

router.patch("/me/username", requireAuth, async (req, res) => {
  const parsed = usernameUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid username" });
  }
  const { username } = parsed.data;

  const exists = await User.exists({ username, _id: { $ne: req.user._id } });
  if (exists) return res.status(409).json({ message: "Username already taken" });

  req.user.username = username;
  await req.user.save();

  res.json({ ok: true, user: { id: req.user._id, username: req.user.username } });
});

module.exports = router;