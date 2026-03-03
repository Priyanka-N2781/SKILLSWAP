const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load env vars
dotenv.config();

const app = express(); 

app.use(cors());
app.use(express.json());

// Determine paths - go up one level from backend to find frontend
const rootDir = path.resolve(__dirname, "..");
const frontendPath = path.join(rootDir, "frontend");

console.log("Root dir:", rootDir);
console.log("Frontend path:", frontendPath);

// Serve static frontend files
app.use(express.static(frontendPath));

// Routes
const authRoutes = require("./routes/authRoutes");
const skillRoutes = require("./routes/skillRoutes");
const skillRequestRoutes = require("./routes/skillRequestRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const gamificationRoutes = require("./routes/gamificationRoutes");
const historyRoutes = require("./routes/historyRoutes");

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/skill-requests", skillRequestRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/gamification", gamificationRoutes);
app.use("/api/history", historyRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "SkillSwap API is running" });
});

// Serve frontend index.html at root
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB with error handling
const connectDB = async () => {
  try {
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("MongoDB Connected");
    } else {
      console.log("Warning: MONGO_URI not set");
    }
  } catch (err) {
    console.log("MongoDB connection error:", err.message);
  }
};

connectDB();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
