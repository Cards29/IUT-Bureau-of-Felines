function requireAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.status(401).json({ message: "Unauthorized" });
}

function requireAdmin(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated() && req.user?.role === "admin") return next();
  return res.status(403).json({ message: "Forbidden" });
}

module.exports = { requireAuth, requireAdmin };