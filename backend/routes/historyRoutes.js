const express = require("express");
const router = express.Router();
const Session = require("../models/Session");
const SkillRequest = require("../models/SkillRequest");
const Skill = require("../models/Skill");
const User = require("../models/User");
const Gamification = require("../models/Gamification");
const auth = require("../middleware/authMiddleware");

// GET COMPLETED SESSIONS HISTORY
router.get("/sessions", auth, async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [
        { learnerId: req.user.userId },
        { ownerId: req.user.userId }
      ],
      status: "completed"
    })
      .populate("skillId", "name category level image")
      .populate("learnerId", "name email profilePicture")
      .populate("ownerId", "name email profilePicture")
      .sort({ endDate: -1 });

    res.status(200).json({ sessions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET SKILL REQUESTS HISTORY
router.get("/requests", auth, async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = {
      $or: [
        { requesterId: req.user.userId },
        { ownerId: req.user.userId }
      ]
    };

    if (status) {
      query.status = status;
    }

    const requests = await SkillRequest.find(query)
      .populate("skillId", "name category level image")
      .populate("requesterId", "name email profilePicture")
      .populate("ownerId", "name email profilePicture")
      .sort({ updatedAt: -1 });

    res.status(200).json({ requests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET MY SKILLS HISTORY
router.get("/my-skills", auth, async (req, res) => {
  try {
    const skills = await Skill.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });

    res.status(200).json({ skills });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET GAMIFICATION HISTORY (points and badges)
router.get("/gamification", auth, async (req, res) => {
  try {
    const gamification = await Gamification.findOne({ userId: req.user.userId })
      .populate("userId", "name email profilePicture");

    const user = await User.findById(req.user.userId);

    res.status(200).json({
      points: user.points,
      badges: user.badges,
      gamification
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET FULL HISTORY SUMMARY
router.get("/summary", auth, async (req, res) => {
  try {
    // Get completed sessions
    const completedSessions = await Session.countDocuments({
      $or: [
        { learnerId: req.user.userId },
        { ownerId: req.user.userId }
      ],
      status: "completed"
    });

    // Get total requests
    const totalRequests = await SkillRequest.countDocuments({
      $or: [
        { requesterId: req.user.userId },
        { ownerId: req.user.userId }
      ]
    });

    // Get accepted requests
    const acceptedRequests = await SkillRequest.countDocuments({
      $or: [
        { requesterId: req.user.userId },
        { ownerId: req.user.userId }
      ],
      status: "accepted"
    });

    // Get my skills count
    const mySkillsCount = await Skill.countDocuments({ userId: req.user.userId });

    // Get user and gamification data
    const user = await User.findById(req.user.userId);
    const gamification = await Gamification.findOne({ userId: req.user.userId });

    res.status(200).json({
      completedSessions,
      totalRequests,
      acceptedRequests,
      mySkillsCount,
      points: user.points,
      badges: user.badges,
      totalSkillsLearned: gamification?.totalSkillsLearned || 0,
      totalSkillsShared: gamification?.totalSkillsShared || 0,
      streak: gamification?.streak || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// EXPORT HISTORY TO PDF (returns data for PDF generation)
router.get("/export-pdf", auth, async (req, res) => {
  try {
    // Get all completed sessions
    const sessions = await Session.find({
      $or: [
        { learnerId: req.user.userId },
        { ownerId: req.user.userId }
      ],
      status: "completed"
    })
      .populate("skillId", "name category level")
      .populate("learnerId", "name email")
      .populate("ownerId", "name email")
      .sort({ endDate: -1 });

    // Get all requests
    const requests = await SkillRequest.find({
      $or: [
        { requesterId: req.user.userId },
        { ownerId: req.user.userId }
      ]
    })
      .populate("skillId", "name")
      .sort({ updatedAt: -1 });

    // Get user data
    const user = await User.findById(req.user.userId);
    const gamification = await Gamification.findOne({ userId: req.user.userId });

    // Create PDF-friendly data structure
    const exportData = {
      user: {
        name: user.name,
        email: user.email,
        department: user.department,
        year: user.year
      },
      summary: {
        totalSessions: sessions.length,
        totalRequests: requests.length,
        acceptedRequests: requests.filter(r => r.status === "accepted").length,
        points: user.points,
        badges: user.badges
      },
      sessions: sessions.map(s => ({
        skillName: s.skillId?.name || "Unknown",
        category: s.skillId?.category || "Unknown",
        role: s.learnerId._id.toString() === req.user.userId ? "Learner" : "Teacher",
        startDate: s.startDate,
        endDate: s.endDate,
        status: s.status
      })),
      requests: requests.map(r => ({
        skillName: r.skillId?.name || "Unknown",
        status: r.status,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt
      }))
    };

    res.status(200).json({
      message: "Data ready for PDF export",
      exportData,
      // In a real implementation, you would generate PDF here
      // For now, we return the data that can be used to generate PDF on frontend
      pdfUrl: null // This would be set if you implement PDF generation on backend
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
