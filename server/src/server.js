const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");

const { connectDb } = require("./utils/connectDb");
const { setupSession } = require("./utils/session");
const { setupPassport } = require("./utils/passport");

const authRoutes = require("./routes/auth.routes");
const catRoutes = require("./routes/cat.routes");
const postRoutes = require("./routes/post.routes");
const userRoutes = require("./routes/user.routes");

const { notFound, errorHandler } = require("./middleware/errors");

const app = express();

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));

setupSession(app);
setupPassport(app);

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/cats", catRoutes);
app.use("/posts", postRoutes);
app.use("/users", userRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDb();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
})();