const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  skillId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Skill",
    required: true
  },
  skillRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SkillRequest",
    required: true
  },
  learnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ["scheduled", "in_progress", "completed", "cancelled"],
    default: "scheduled"
  },
  remarks: {
    type: String,
    default: ""
  },
  calendarEventId: {
    type: String,
    default: ""
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

// Indexes for performance
sessionSchema.index({ skillId: 1 });
sessionSchema.index({ learnerId: 1 });
sessionSchema.index({ ownerId: 1 });
sessionSchema.index({ status: 1 });
sessionSchema.index({ startDate: 1 });

module.exports = mongoose.model("Session", sessionSchema);
