require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");

const app = express();

// middleware
const allowedOrigins = [
  "https://securehunt.vercel.app", // production
  "http://localhost:5173", // local dev
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
// app.options("*", cors(corsOptions));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// connect database
connectDB();

// routes
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/cves", require("./routes/cveRoutes"));
app.use("/api/developers", require("./routes/developerRoutes"));
app.use("/api/security", require("./routes/securityRoutes"));

app.get("/", (req, res) => {
  res.send("API running...");
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
