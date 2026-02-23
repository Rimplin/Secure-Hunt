require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");

const app = express();

// middleware
app.use(cors({
  origin: "https://securehunt.vercel.app", //For local testing use: "http://localhost:5173"
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// connect database
connectDB();

// routes
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));

app.get("/", (req, res) => {
  res.send("API running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
