const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const { User } = require("../models/User");

function setupPassport(app) {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL = process.env.GOOGLE_CALLBACK_URL;

  if (!clientID || !clientSecret || !callbackURL) {
    console.error("Missing Google OAuth env vars.");
    process.exit(1);
  }

  passport.use(new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return done(null, false, { message: "No account found with that email" });
      }
      if (!user.authProviders.includes("local")) {
        return done(null, false, { message: "This account uses Google login" });
      }
      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) {
        return done(null, false, { message: "Incorrect password" });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  passport.use(new GoogleStrategy({
    clientID,
    clientSecret,
    callbackURL,
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value || null;
      const googleId = profile.id;

      let user = await User.findOne({ googleId });
      if (!user) {
        // Check if a local account exists with the same email — link them
        if (email) {
          user = await User.findOne({ email });
        }
        if (user) {
          // Link Google to the existing local account
          if (!user.authProviders.includes("google")) {
            user.authProviders.push("google");
          }
          user.googleId = googleId;
          user.displayName = user.displayName || profile.displayName;
          user.avatarUrl = user.avatarUrl || profile.photos?.[0]?.value || null;
          await user.save();
        } else {
          // Brand new user — create via Google
          const base = (profile.displayName || "user").toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 16) || "user";
          let candidate = base;
          let i = 0;
          while (await User.exists({ username: candidate })) {
            i += 1;
            candidate = `${base}${i}`;
            if (candidate.length > 20) candidate = `${base.slice(0, 16)}${i}`;
          }

          user = await User.create({
            googleId,
            email,
            username: candidate,
            displayName: profile.displayName || candidate,
            avatarUrl: profile.photos?.[0]?.value || null,
            authProviders: ["google"],
          });
        }
      } else {
        // Existing Google user — backfill missing fields
        user.displayName = user.displayName || profile.displayName;
        user.avatarUrl = user.avatarUrl || profile.photos?.[0]?.value || null;
        if (!user.email && email) user.email = email;
        if (!user.authProviders.includes("google")) user.authProviders.push("google");
        await user.save();
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  passport.serializeUser((user, done) => {
    done(null, user._id.toString());
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user || null);
    } catch (err) {
      done(err);
    }
  });

  app.use(passport.initialize());
  app.use(passport.session());
}

module.exports = { setupPassport };