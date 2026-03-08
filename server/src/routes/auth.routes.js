const router = require("express").Router();
const passport = require("passport");
const bcrypt = require("bcrypt");
const { requireAuth } = require("../middleware/auth");
const { usernameUpdateSchema, registerSchema, loginSchema } = require("../validation/schemas");
const { User } = require("../models/User");

// Wraps passport.authenticate("local") so it can be used with async/await
function authenticateLocal(req, res) {
  return new Promise((resolve, reject) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return reject(err);
      resolve({ user, info });
    })(req, res);
  });
}

// Wraps req.login() so it can be used with async/await
function sessionLogin(req, user) {
  return new Promise((resolve, reject) =>
    req.login(user, err => (err ? reject(err) : resolve()))
  );
}

function serializeUser(u) {
  return {
    id: u._id,
    username: u.username,
    displayName: u.displayName,
    avatarUrl: u.avatarUrl,
    email: u.email,
    createdAt: u.createdAt,
  };
}

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

router.post("/register", async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message || "Invalid registration data";
      return res.status(400).json({ message });
    }
    const { username, email, password } = parsed.data;

    if (await User.exists({ email })) {
      return res.status(409).json({ message: "Email already registered" });
    }
    if (await User.exists({ username })) {
      return res.status(409).json({ message: "Username already taken" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      username,
      email,
      passwordHash,
      displayName: username,
      authProviders: ["local"],
    });

    await sessionLogin(req, user);
    res.status(201).json({ isAuthenticated: true, user: serializeUser(user) });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message || "Invalid login data";
      return res.status(400).json({ message });
    }

    const { user, info } = await authenticateLocal(req, res);
    if (!user) {
      return res.status(401).json({ message: info?.message || "Login failed" });
    }

    await sessionLogin(req, user);
    res.json({ isAuthenticated: true, user: serializeUser(user) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;