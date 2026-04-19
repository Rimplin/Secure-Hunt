require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const forumRoutes = require('./routes/forumRoutes')

// connect database
connectDB();

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
app.use('/api/forum', forumRoutes)
app.use("/api/users", require("./routes/userRoutes"));
