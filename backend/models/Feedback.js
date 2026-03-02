const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Session",
    required: true
  },
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  revieweeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for performance
feedbackSchema.index({ sessionId: 1 });
feedbackSchema.index({ reviewerId: 1 });
feedbackSchema.index({ revieweeId: 1 });

module.exports = mongoose.model("Feedback", feedbackSchema);
