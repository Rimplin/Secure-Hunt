// ============================================================
// AUTH MIDDLEWARE — PLACEHOLDER
// ============================================================
// Currently allows all requests through and assigns a default
// role of "hunter". When real authentication is implemented
// (JWT, sessions, etc.), replace the logic inside authMiddleware
// with real token verification and set req.user accordingly.
// requireRole() already works correctly and needs no changes.
// ============================================================

const authMiddleware = (req, res, next) => {
    // TODO: Replace with real auth (verify JWT, set req.user from token)
    req.user = { role: "hunter" }; // default: treat everyone as a hunter
    next();
};

// Middleware factory — usage: requireRole("hunter") or requireRole("admin")
const requireRole = (...roles) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    if (roles.includes(req.user.role) || req.user.role === "admin") {
        return next();
    }
    return res.status(403).json({ message: "Forbidden: insufficient role" });
};

module.exports = { authMiddleware, requireRole };
