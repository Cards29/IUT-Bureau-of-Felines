const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { User } = require("../models/User");

function setupPassport(app) {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL = process.env.GOOGLE_CALLBACK_URL;

  if (!clientID || !clientSecret || !callbackURL) {
    console.error("Missing Google OAuth env vars.");
    process.exit(1);
  }

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
        });
      } else {
        user.displayName = user.displayName || profile.displayName;
        user.avatarUrl = user.avatarUrl || profile.photos?.[0]?.value || null;
        if (!user.email && email) user.email = email;
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