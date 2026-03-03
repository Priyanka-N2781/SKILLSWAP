const express = require("express");
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

// In-memory demo database (works without MongoDB)
const demoDB = {
  users: [],
  skills: [],
  skillRequests: [],
  sessions: [],
  feedback: [],
  gamification: []
};

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Helper to generate JWT (simple demo version)
const generateToken = (userId) => {
  return "demo-token-" + userId + "-" + Date.now();
};

// ==================== AUTH ROUTES ====================

// Register
app.post("/api/auth/register", (req, res) => {
  const { name, email, password, phone, department, year } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please fill all required fields" });
  }
  
  const existingUser = demoDB.users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }
  
  const newUser = {
    id: generateId(),
    name,
    email,
    password,
    phone: phone || "",
    department: department || "",
    year: year || 1,
    profilePicture: "",
    emailVerified: true,
    phoneVerified: false,
    points: 0,
    badges: [],
    createdAt: new Date()
  };
  
  demoDB.users.push(newUser);
  
  // Create gamification record
  demoDB.gamification.push({
    id: generateId(),
    userId: newUser.id,
    points: 0,
    badges: []
  });
  
  console.log("User registered:", email);
  res.status(201).json({ message: "User registered successfully", userId: newUser.id });
});

// Login
app.post("/api/auth/login", (req, res) => {
  const { email, password, rememberMe } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  
  const user = demoDB.users.find(u => u.email === email);
  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
  
  if (user.password !== password) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
  
  const token = generateToken(user.id);
  
  res.status(200).json({
    message: "Login successful",
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      department: user.department,
      year: user.year,
      profilePicture: user.profilePicture,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      points: user.points,
      badges: user.badges
    }
  });
});

// Google Auth
app.post("/api/auth/google-auth", (req, res) => {
  const { googleId, name, email, profilePicture } = req.body;
  
  let user = demoDB.users.find(u => u.googleId === googleId || u.email === email);
  
  if (!user) {
    user = {
      id: generateId(),
      name,
      email,
      googleId,
      profilePicture: profilePicture || "",
      emailVerified: true,
      phoneVerified: false,
      points: 0,
      badges: []
    };
    demoDB.users.push(user);
  }
  
  const token = generateToken(user.id);
  
  res.status(200).json({
    message: "Google login successful",
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      points: user.points,
      badges: user.badges
    }
  });
});

// Get current user
app.get("/api/auth/me", (req, res) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ message: "Access denied" });
  }
  
  const token = authHeader.replace("Bearer ", "");
  const userId = token.split("-")[1];
  
  const user = demoDB.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  
  res.status(200).json({ user });
});

// Update profile
app.put("/api/auth/profile", (req, res) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ message: "Access denied" });
  }
  
  const token = authHeader.replace("Bearer ", "");
  const userId = token.split("-")[1];
  
  const userIndex = demoDB.users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ message: "User not found" });
  }
  
  const { name, phone, department, year, profilePicture } = req.body;
  
  if (name) demoDB.users[userIndex].name = name;
  if (phone) demoDB.users[userIndex].phone = phone;
  if (department) demoDB.users[userIndex].department = department;
  if (year) demoDB.users[userIndex].year = year;
  if (profilePicture) demoDB.users[userIndex].profilePicture = profilePicture;
  
  res.status(200).json({
    message: "Profile updated successfully",
    user: demoDB.users[userIndex]
  });
});

// ==================== SKILLS ROUTES ====================

// Get all skills
app.get("/api/skills", (req, res) => {
  const { category, level, search } = req.query;
  
  let skills = [...demoDB.skills];
  
  if (category) {
    skills = skills.filter(s => s.category === category);
  }
  if (level) {
    skills = skills.filter(s => s.level === level);
  }
  if (search) {
    const searchLower = search.toLowerCase();
    skills = skills.filter(s => 
      s.name.toLowerCase().includes(searchLower) || 
      s.description.toLowerCase().includes(searchLower)
    );
  }
  
  // Populate user info
  skills = skills.map(skill => {
    const user = demoDB.users.find(u => u.id === skill.userId);
    return {
      ...skill,
      userName: user ? user.name : "Unknown",
      userDepartment: user ? user.department : ""
    };
  });
  
  res.status(200).json(skills);
});

// Add skill
app.post("/api/skills", (req, res) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ message: "Access denied" });
  }
  
  const token = authHeader.replace("Bearer ", "");
  const userId = token.split("-")[1];
  
  const { name, description, category, level, image, tags } = req.body;
  
  if (!name || !description || !category || !level) {
    return res.status(400).json({ message: "Please fill all required fields" });
  }
  
  const newSkill = {
    id: generateId(),
    name,
    description,
    category,
    level,
    image: image || "",
    tags: tags || [],
    userId,
    isActive: true,
    createdAt: new Date()
  };
  
  demoDB.skills.push(newSkill);
  
  res.status(201).json({ message: "Skill added successfully", skill: newSkill });
});

// Get skill by ID
app.get("/api/skills/:id", (req, res) => {
  const skill = demoDB.skills.find(s => s.id === req.params.id);
  
  if (!skill) {
    return res.status(404).json({ message: "Skill not found" });
  }
  
  const user = demoDB.users.find(u => u.id === skill.userId);
  
  res.status(200).json({
    ...skill,
    userName: user ? user.name : "Unknown",
    userDepartment: user ? user.department : ""
  });
});

// Delete skill
app.delete("/api/skills/:id", (req, res) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ message: "Access denied" });
  }
  
  const skillIndex = demoDB.skills.findIndex(s => s.id === req.params.id);
  
  if (skillIndex === -1) {
    return res.status(404).json({ message: "Skill not found" });
  }
  
  demoDB.skills.splice(skillIndex, 1);
  
  res.status(200).json({ message: "Skill deleted successfully" });
});

// ==================== SKILL REQUESTS ROUTES ====================

// Get skill requests
app.get("/api/skill-requests", (req, res) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ message: "Access denied" });
  }
  
  const token = authHeader.replace("Bearer ", "");
  const userId = token.split("-")[1];
  
  const requests = demoDB.skillRequests.filter(
    r => r.requesterId === userId || r.ownerId === userId
  );
  
  // Populate skill and user info
  const populatedRequests = requests.map(req => {
    const skill = demoDB.skills.find(s => s.id === req.skillId);
    const requester = demoDB.users.find(u => u.id === req.requesterId);
    const owner = demoDB.users.find(u => u.id === req.ownerId);
    
    return {
      ...req,
      skillName: skill ? skill.name : "Unknown",
      requesterName: requester ? requester.name : "Unknown",
      ownerName: owner ? owner.name : "Unknown"
    };
  });
  
  res.status(200).json(populatedRequests);
});

// Send skill request
app.post("/api/skill-requests", (req, res) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ message: "Access denied" });
  }
  
  const token = authHeader.replace("Bearer ", "");
  const userId = token.split("-")[1];
  
  const { skillId, message } = req.body;
  
  const skill = demoDB.skills.find(s => s.id === skillId);
  if (!skill) {
    return res.status(404).json({ message: "Skill not found" });
  }
  
  const newRequest = {
    id: generateId(),
    skillId,
    requesterId: userId,
    ownerId: skill.userId,
    status: "pending",
    message: message || "",
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  demoDB.skillRequests.push(newRequest);
  
  res.status(201).json({ message: "Request sent successfully", request: newRequest });
});

// Update request status
app.put("/api/skill-requests/:id", (req, res) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ message: "Access denied" });
  }
  
  const { status } = req.body;
  const requestIndex = demoDB.skillRequests.findIndex(r => r.id === req.params.id);
  
  if (requestIndex === -1) {
    return res.status(404).json({ message: "Request not found" });
  }
  
  demoDB.skillRequests[requestIndex].status = status;
  demoDB.skillRequests[requestIndex].updatedAt = new Date();
  
  res.status(200).json({ message: "Request updated successfully" });
});

// ==================== SESSIONS ROUTES ====================

// Get sessions
app.get("/api/sessions", (req, res) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ message: "Access denied" });
  }
  
  const token = authHeader.replace("Bearer ", "");
  const userId = token.split("-")[1];
  
  const sessions = demoDB.sessions.filter(
    s => s.learnerId === userId || s.ownerId === userId
  );
  
  // Populate info
  const populatedSessions = sessions.map(session => {
    const skill = demoDB.skills.find(s => s.id === session.skillId);
    const learner = demoDB.users.find(u => u.id === session.learnerId);
    const owner = demoDB.users.find(u => u.id === session.ownerId);
    
    return {
      ...session,
      skillName: skill ? skill.name : "Unknown",
      learnerName: learner ? learner.name : "Unknown",
      ownerName: owner ? owner.name : "Unknown"
    };
  });
  
  res.status(200).json(populatedSessions);
});

// Create session
app.post("/api/sessions", (req, res) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ message: "Access denied" });
  }
  
  const token = authHeader.replace("Bearer ", "");
  const userId = token.split("-")[1];
  
  const { skillId, startDate, endDate } = req.body;
  
  const skill = demoDB.skills.find(s => s.id === skillId);
  if (!skill) {
    return res.status(404).json({ message: "Skill not found" });
  }
  
  const newSession = {
    id: generateId(),
    skillId,
    skillRequestId: "",
    learnerId: userId,
    ownerId: skill.userId,
    startDate,
    endDate,
    status: "scheduled",
    remarks: "",
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  demoDB.sessions.push(newSession);
  
  res.status(201).json({ message: "Session created successfully", session: newSession });
});

// Update session
app.put("/api/sessions/:id", (req, res) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ message: "Access denied" });
  }
  
  const sessionIndex = demoDB.sessions.findIndex(s => s.id === req.params.id);
  
  if (sessionIndex === -1) {
    return res.status(404).json({ message: "Session not found" });
  }
  
  const { status, remarks } = req.body;
  
  if (status) demoDB.sessions[sessionIndex].status = status;
  if (remarks) demoDB.sessions[sessionIndex].remarks = remarks;
  demoDB.sessions[sessionIndex].updatedAt = new Date();
  
  res.status(200).json({ message: "Session updated successfully" });
});

// ==================== FEEDBACK ROUTES ====================

// Get feedback
app.get("/api/feedback/:sessionId", (req, res) => {
  const feedback = demoDB.feedback.filter(f => f.sessionId === req.params.sessionId);
  res.status(200).json(feedback);
});

// Add feedback
app.post("/api/feedback", (req, res) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ message: "Access denied" });
  }
  
  const token = authHeader.replace("Bearer ", "");
  const userId = token.split("-")[1];
  
  const { sessionId, rating, comment } = req.body;
  
  const newFeedback = {
    id: generateId(),
    sessionId,
    reviewerId: userId,
    rating,
    comment: comment || "",
    createdAt: new Date()
  };
  
  demoDB.feedback.push(newFeedback);
  
  // Add points for giving feedback
  const userIndex = demoDB.users.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    demoDB.users[userIndex].points += 10;
  }
  
  res.status(201).json({ message: "Feedback submitted successfully", feedback: newFeedback });
});

// ==================== GAMIFICATION ROUTES ====================

// Get gamification data
app.get("/api/gamification", (req, res) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ message: "Access denied" });
  }
  
  const token = authHeader.replace("Bearer ", "");
  const userId = token.split("-")[1];
  
  const gamification = demoDB.gamification.find(g => g.userId === userId);
  
  if (!gamification) {
    return res.status(404).json({ message: "Gamification data not found" });
  }
  
  res.status(200).json(gamification);
});

// Get leaderboard
app.get("/api/gamification/leaderboard", (req, res) => {
  const leaderboard = demoDB.users
    .map(u => ({ id: u.id, name: u.name, points: u.points, badges: u.badges }))
    .sort((a, b) => b.points - a.points)
    .slice(0, 10);
  
  res.status(200).json(leaderboard);
});

// ==================== HISTORY ROUTES ====================

// Get history
app.get("/api/history", (req, res) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ message: "Access denied" });
  }
  
  const token = authHeader.replace("Bearer ", "");
  const userId = token.split("-")[1];
  
  const history = [];
  
  // Completed sessions
  const sessions = demoDB.sessions.filter(
    s => (s.learnerId === userId || s.ownerId === userId) && s.status === "completed"
  );
  
  sessions.forEach(session => {
    const skill = demoDB.skills.find(s => s.id === session.skillId);
    history.push({
      type: "session",
      date: session.updatedAt,
      title: skill ? skill.name : "Unknown Skill",
      description: `Session completed`
    });
  });
  
  // Skill requests
  const requests = demoDB.skillRequests.filter(
    r => r.requesterId === userId
  );
  
  requests.forEach(request => {
    const skill = demoDB.skills.find(s => s.id === request.skillId);
    history.push({
      type: "request",
      date: request.updatedAt,
      title: skill ? skill.name : "Unknown Skill",
      description: `Request ${request.status}`
    });
  });
  
  // Sort by date
  history.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  res.status(200).json(history);
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "SkillSwap API is running (Demo Mode)" });
});

// Serve frontend index.html at root
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log("Running in DEMO MODE (no MongoDB required)");
});
