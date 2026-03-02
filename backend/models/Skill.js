const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      "Programming",
      "Design",
      "Music",
      "Language",
      "Sports",
      "Cooking",
      "Art",
      "Business",
      "Science",
      "Other"
    ]
  },
  level: {
    type: String,
    required: true,
    enum: ["Beginner", "Intermediate", "Advanced", "Expert"]
  },
  image: {
    type: String,
    default: ""
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
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

// Index for efficient searching and filtering
skillSchema.index({ name: "text", description: "text", tags: "text" });
skillSchema.index({ category: 1 });
skillSchema.index({ level: 1 });
skillSchema.index({ userId: 1 });

module.exports = mongoose.model("Skill", skillSchema);
