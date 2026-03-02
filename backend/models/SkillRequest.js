const mongoose = require("mongoose");

const skillRequestSchema = new mongoose.Schema({
  skillId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Skill",
    required: true
  },
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ["pending", "accepted", "rejected", "cancelled"],
    default: "pending"
  },
  message: {
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
skillRequestSchema.index({ skillId: 1 });
skillRequestSchema.index({ requesterId: 1 });
skillRequestSchema.index({ ownerId: 1 });
skillRequestSchema.index({ status: 1 });

module.exports = mongoose.model("SkillRequest", skillRequestSchema);
