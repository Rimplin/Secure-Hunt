const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const createToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 12);

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      email,
      password: hashedPassword,
      role: role,
      verificationToken, //This token is sent to the user's email for verification purposes. Will be useful later.
      isVerified: true, //TEMPORARY since we are not ready to implement email verification yet. When email verification works we can remove this.
    });

    // TODO: send verification email here

    res.status(201).json({ message: "User created. Verify email." });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isVerified)
      return res.status(401).json({ message: "Email not verified" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = createToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true, //This only works if we're using HTTPS
      //secure: false, //TEMPORARY for local testing purposes only since we're using http://localhost:5000
      sameSite: "none", //Works best with HTTPS and might cause issues when testing locally with HTTP so will be disabled temporarily
      //sameSite: "lax", //TEMPORARY for testing when using localhost as the url
      partitioned: true, //Since our cookie is cross-site (foreign) httpOnly cookie there are stricter rules to follow when it comes to these types of cookies. (Without this cookie still exists but it will seem empty in Devtoold -> Application and invokes a warning of being rejected soon)
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ message: "Login successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// LOGOUT
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  res.json({ message: "Logged out" });
});

// GET CURRENT USER
router.get("/me", protect, (req, res) => {
    res.json(req.user);
  });

module.exports = router;