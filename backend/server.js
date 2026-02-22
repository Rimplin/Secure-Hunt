require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// middleware
app.use(cors({
  origin: [
    "https://securehunt.vercel.app", // production
    "http://localhost:5173",          // local dev
  ]
}));
app.use(express.json());

// connect database
connectDB();

// routes
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));

app.get("/", (req, res) => {
  res.send("API running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
// Trigger restart
