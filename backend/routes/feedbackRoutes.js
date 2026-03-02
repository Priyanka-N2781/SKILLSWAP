const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");
const auth = require("../middleware/authMiddleware");

// GET MY REVIEWS (as reviewer)
router.get("/given", auth, async (req, res) => {
  try {
    const feedback = await Feedback.find({ reviewerId: req.user.userId })
      .populate("sessionId", "skillId startDate endDate")
      .populate("revieweeId", "name email profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json({ feedback });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET REVIEWS ABOUT ME (as reviewee)
router.get("/received", auth, async (req, res) => {
  try {
    const feedback = await Feedback.find({ revieweeId: req.user.userId })
      .populate("sessionId", "skillId startDate endDate")
      .populate("reviewerId", "name email profilePicture")
      .sort({ createdAt: -1 });

    // Calculate average rating
    const totalRating = feedback.reduce((sum, f) => sum + f.rating, 0);
    const avgRating = feedback.length > 0 ? totalRating / feedback.length : 0;

    res.status(200).json({ 
      feedback,
      averageRating: avgRating.toFixed(1),
      totalReviews: feedback.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET SINGLE FEEDBACK
router.get("/:id", auth, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate("sessionId")
      .populate("reviewerId", "name email profilePicture")
      .populate("revieweeId", "name email profilePicture");

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.status(200).json({ feedback });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE FEEDBACK (admin only - optional)
router.delete("/:id", auth, async (req, res) => {
  try {
    const feedback = await Feedback.findOne({
      _id: req.params.id,
      reviewerId: req.user.userId
    });

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found or unauthorized" });
    }

    await Feedback.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
