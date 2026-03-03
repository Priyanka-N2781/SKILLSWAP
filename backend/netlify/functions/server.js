const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("../routes/authRoutes");
const skillRoutes = require("../routes/skillRoutes");
const skillRequestRoutes = require("../routes/skillRequestRoutes");
const sessionRoutes = require("../routes/sessionRoutes");
const feedbackRoutes = require("../routes/feedbackRoutes");
const gamificationRoutes = require("../routes/gamificationRoutes");
const historyRoutes = require("../routes/historyRoutes");

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/skill-requests", skillRequestRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/gamification", gamificationRoutes);
app.use("/api/history", historyRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "SkillSwap API is running" });
});

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
if (MONGO_URI) {
  mongoose.connect(MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log("MongoDB connection error:", err));
} else {
  console.log("Warning: MONGO_URI not set");
}

module.exports = app;
