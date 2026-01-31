const session = require("express-session");
const MongoStore = require("connect-mongo");

function setupSession(app) {
  const mongoUri = process.env.MONGO_URI;
  const secret = process.env.SESSION_SECRET;
  if (!mongoUri) {
    console.error("Missing MONGO_URI in .env");
    process.exit(1);
  }
  if (!secret) {
    console.error("Missing SESSION_SECRET in .env");
    process.exit(1);
  }

  app.use(session({
    name: "catbureau.sid",
    secret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: mongoUri,
      collectionName: "sessions",
      ttl: 7 * 24 * 60 * 60,
    }),
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }));
}

module.exports = { setupSession };