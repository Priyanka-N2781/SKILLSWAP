const mongoose = require("mongoose");

const gamificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  points: {
    type: Number,
    default: 0
  },
  badges: [{
    name: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  totalSessionsCompleted: {
    type: Number,
    default: 0
  },
  totalSkillsShared: {
    type: Number,
    default: 0
  },
  totalSkillsLearned: {
    type: Number,
    default: 0
  },
  streak: {
    type: Number,
    default: 0
  },
  lastActiveDate: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for performance
gamificationSchema.index({ userId: 1 });
gamificationSchema.index({ points: -1 });

module.exports = mongoose.model("Gamification", gamificationSchema);
