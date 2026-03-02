const express = require("express");
const router = express.Router();
const Gamification = require("../models/Gamification");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

// GET MY GAMIFICATION DATA
router.get("/me", auth, async (req, res) => {
  try {
    let gamification = await Gamification.findOne({ userId: req.user.userId })
      .populate("userId", "name email profilePicture points badges");

    if (!gamification) {
      // Create if not exists
      gamification = await Gamification.create({ userId: req.user.userId });
      gamification = await Gamification.findById(gamification._id)
        .populate("userId", "name email profilePicture points badges");
    }

    res.status(200).json({ gamification });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET LEADERBOARD
router.get("/leaderboard", async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const leaderboard = await Gamification.find()
      .populate("userId", "name email profilePicture badges")
      .sort({ points: -1 })
      .limit(parseInt(limit));

    // Add rank to each entry
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      user: entry.userId,
      points: entry.points,
      badges: entry.badges,
      totalSessionsCompleted: entry.totalSessionsCompleted
    }));

    res.status(200).json({ leaderboard: rankedLeaderboard });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET ALL BADGES
router.get("/badges", (req, res) => {
  const badges = [
    {
      id: "first_skill",
      name: "First Skill",
      description: "Share your first skill",
      icon: "🎯",
      pointsRequired: 0,
      type: "skill"
    },
    {
      id: "skill_master",
      name: "Skill Master",
      description: "Share 5 skills",
      icon: "⭐",
      pointsRequired: 0,
      type: "skill"
    },
    {
      id: "first_session",
      name: "First Session",
      description: "Complete your first session",
      icon: "🎉",
      pointsRequired: 0,
      type: "session"
    },
    {
      id: "dedicated_learner",
      name: "Dedicated Learner",
      description: "Complete 10 sessions",
      icon: "📚",
      pointsRequired: 0,
      type: "session"
    },
    {
      id: "point_collector",
      name: "Point Collector",
      description: "Earn 100 points",
      icon: "💎",
      pointsRequired: 100,
      type: "points"
    },
    {
      id: "point_master",
      name: "Point Master",
      description: "Earn 500 points",
      icon: "🏆",
      pointsRequired: 500,
      type: "points"
    },
    {
      id: "social_star",
      name: "Social Star",
      description: "Complete 5 sessions with different people",
      icon: "🌟",
      pointsRequired: 0,
      type: "social"
    },
    {
      id: "week_warrior",
      name: "Week Warrior",
      description: "Maintain a 7-day streak",
      icon: "🔥",
      pointsRequired: 0,
      type: "streak"
    }
  ];

  res.status(200).json({ badges });
});

// CHECK AND AWARD BADGES
const checkAndAwardBadges = async (userId) => {
  const gamification = await Gamification.findOne({ userId });
  if (!gamification) return [];

  const user = await User.findById(userId);
  if (!user) return [];

  const newBadges = [];
  const existingBadgeNames = gamification.badges.map(b => b.name);

  // Check for first skill badge
  if (gamification.totalSkillsShared >= 1 && !existingBadgeNames.includes("First Skill")) {
    newBadges.push({ name: "First Skill", description: "Share your first skill" });
    user.badges.push("First Skill");
  }

  // Check for skill master badge
  if (gamification.totalSkillsShared >= 5 && !existingBadgeNames.includes("Skill Master")) {
    newBadges.push({ name: "Skill Master", description: "Share 5 skills" });
    user.badges.push("Skill Master");
  }

  // Check for first session badge
  if (gamification.totalSessionsCompleted >= 1 && !existingBadgeNames.includes("First Session")) {
    newBadges.push({ name: "First Session", description: "Complete your first session" });
    user.badges.push("First Session");
  }

  // Check for dedicated learner badge
  if (gamification.totalSessionsCompleted >= 10 && !existingBadgeNames.includes("Dedicated Learner")) {
    newBadges.push({ name: "Dedicated Learner", description: "Complete 10 sessions" });
    user.badges.push("Dedicated Learner");
  }

  // Check for point collector badge
  if (gamification.points >= 100 && !existingBadgeNames.includes("Point Collector")) {
    newBadges.push({ name: "Point Collector", description: "Earn 100 points" });
    user.badges.push("Point Collector");
  }

  // Check for point master badge
  if (gamification.points >= 500 && !existingBadgeNames.includes("Point Master")) {
    newBadges.push({ name: "Point Master", description: "Earn 500 points" });
    user.badges.push("Point Master");
  }

  if (newBadges.length > 0) {
    gamification.badges.push(...newBadges);
    await gamification.save();
    await user.save();
  }

  return newBadges;
};

// UPDATE GAMIFICATION (called internally by other modules)
router.put("/update", auth, async (req, res) => {
  try {
    const { type, value } = req.body;

    let gamification = await Gamification.findOne({ userId: req.user.userId });

    if (!gamification) {
      gamification = await Gamification.create({ userId: req.user.userId });
    }

    if (type === "skill_shared") {
      gamification.totalSkillsShared += value || 1;
    } else if (type === "skill_learned") {
      gamification.totalSkillsLearned += value || 1;
    } else if (type === "session_completed") {
      gamification.totalSessionsCompleted += value || 1;
    } else if (type === "points") {
      gamification.points += value || 0;
    }

    gamification.updatedAt = new Date();
    await gamification.save();

    // Check for new badges
    const newBadges = await checkAndAwardBadges(req.user.userId);

    res.status(200).json({
      message: "Gamification updated",
      gamification,
      newBadges: newBadges.length > 0 ? newBadges : null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
