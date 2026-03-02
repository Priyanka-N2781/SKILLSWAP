const express = require("express");
const router = express.Router();
const Session = require("../models/Session");
const Feedback = require("../models/Feedback");
const User = require("../models/User");
const Gamification = require("../models/Gamification");
const auth = require("../middleware/authMiddleware");

// GET MY SESSIONS (as learner or owner)
router.get("/", auth, async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = {
      $or: [
        { learnerId: req.user.userId },
        { ownerId: req.user.userId }
      ]
    };

    if (status) {
      query.status = status;
    }

    const sessions = await Session.find(query)
      .populate("skillId", "name category level image")
      .populate("learnerId", "name email profilePicture")
      .populate("ownerId", "name email profilePicture")
      .sort({ startDate: -1 });

    res.status(200).json({ sessions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET UPCOMING SESSIONS
router.get("/upcoming", auth, async (req, res) => {
  try {
    const now = new Date();
    
    const sessions = await Session.find({
      $or: [
        { learnerId: req.user.userId },
        { ownerId: req.user.userId }
      ],
      status: "scheduled",
      startDate: { $gte: now }
    })
      .populate("skillId", "name category level image")
      .populate("learnerId", "name email profilePicture")
      .populate("ownerId", "name email profilePicture")
      .sort({ startDate: 1 });

    res.status(200).json({ sessions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET SINGLE SESSION
router.get("/:id", auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate("skillId", "name category level image description")
      .populate("learnerId", "name email profilePicture department year points badges")
      .populate("ownerId", "name email profilePicture department year points badges");

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Check authorization
    if (session.learnerId._id.toString() !== req.user.userId && 
        session.ownerId._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Get feedback for this session
    const feedback = await Feedback.find({ sessionId: session._id })
      .populate("reviewerId", "name profilePicture")
      .populate("revieweeId", "name profilePicture");

    res.status(200).json({ session, feedback });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE SESSION (start, end, complete)
router.put("/:id", auth, async (req, res) => {
  try {
    const { status, startDate, endDate, remarks, calendarEventId } = req.body;

    const session = await Session.findOne({
      _id: req.params.id,
      $or: [
        { learnerId: req.user.userId },
        { ownerId: req.user.userId }
      ]
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found or unauthorized" });
    }

    if (status) session.status = status;
    if (startDate) session.startDate = startDate;
    if (endDate) session.endDate = endDate;
    if (remarks) session.remarks = remarks;
    if (calendarEventId) session.calendarEventId = calendarEventId;
    session.updatedAt = new Date();

    await session.save();

    // If session is completed, update gamification
    if (status === "completed") {
      // Award points to both parties
      const pointsToAward = 10;
      
      // Update learner
      await User.findByIdAndUpdate(session.learnerId, {
        $inc: { points: pointsToAward }
      });

      // Update owner
      await User.findByIdAndUpdate(session.ownerId, {
        $inc: { points: pointsToAward }
      });

      // Update gamification records
      await Gamification.findOneAndUpdate(
        { userId: session.learnerId },
        { 
          $inc: { totalSessionsCompleted: 1, points: pointsToAward },
          $set: { lastActiveDate: new Date() }
        }
      );

      await Gamification.findOneAndUpdate(
        { userId: session.ownerId },
        { 
          $inc: { totalSessionsCompleted: 1, points: pointsToAward },
          $set: { lastActiveDate: new Date() }
        }
      );
    }

    res.status(200).json({
      message: "Session updated successfully",
      session
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// START SESSION
router.put("/:id/start", auth, async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      $or: [
        { learnerId: req.user.userId },
        { ownerId: req.user.userId }
      ],
      status: "scheduled"
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found or cannot be started" });
    }

    session.status = "in_progress";
    session.updatedAt = new Date();
    await session.save();

    res.status(200).json({
      message: "Session started",
      session
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// END SESSION
router.put("/:id/end", auth, async (req, res) => {
  try {
    const { remarks } = req.body;

    const session = await Session.findOne({
      _id: req.params.id,
      $or: [
        { learnerId: req.user.userId },
        { ownerId: req.user.userId }
      ],
      status: "in_progress"
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found or cannot be ended" });
    }

    session.status = "completed";
    session.endDate = new Date();
    if (remarks) session.remarks = remarks;
    session.updatedAt = new Date();
    await session.save();

    // Award points
    const pointsToAward = 10;
    await User.findByIdAndUpdate(session.learnerId, { $inc: { points: pointsToAward } });
    await User.findByIdAndUpdate(session.ownerId, { $inc: { points: pointsToAward } });

    // Update gamification
    await Gamification.findOneAndUpdate(
      { userId: session.learnerId },
      { 
        $inc: { totalSessionsCompleted: 1, points: pointsToAward },
        $set: { lastActiveDate: new Date() }
      }
    );

    await Gamification.findOneAndUpdate(
      { userId: session.ownerId },
      { 
        $inc: { totalSessionsCompleted: 1, points: pointsToAward },
        $set: { lastActiveDate: new Date() }
      }
    );

    res.status(200).json({
      message: "Session completed",
      session
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// CANCEL SESSION
router.put("/:id/cancel", auth, async (req, res) => {
  try {
    const { reason } = req.body;

    const session = await Session.findOne({
      _id: req.params.id,
      $or: [
        { learnerId: req.user.userId },
        { ownerId: req.user.userId }
      ],
      status: { $in: ["scheduled", "in_progress"] }
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found or cannot be cancelled" });
    }

    session.status = "cancelled";
    if (reason) session.remarks = reason;
    session.updatedAt = new Date();
    await session.save();

    res.status(200).json({
      message: "Session cancelled",
      session
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ADD FEEDBACK
router.post("/:id/feedback", auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const session = await Session.findOne({
      _id: req.params.id,
      $or: [
        { learnerId: req.user.userId },
        { ownerId: req.user.userId }
      ],
      status: "completed"
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found or not completed" });
    }

    // Determine who is being reviewed
    const revieweeId = session.learnerId.toString() === req.user.userId 
      ? session.ownerId 
      : session.learnerId;

    // Check if feedback already exists
    const existingFeedback = await Feedback.findOne({
      sessionId: session._id,
      reviewerId: req.user.userId
    });

    if (existingFeedback) {
      return res.status(400).json({ message: "You have already given feedback for this session" });
    }

    const feedback = new Feedback({
      sessionId: session._id,
      reviewerId: req.user.userId,
      revieweeId,
      rating,
      comment: comment || ""
    });

    await feedback.save();

    // Calculate average rating for the reviewee
    const allFeedback = await Feedback.find({ revieweeId });
    const avgRating = allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length;

    res.status(201).json({
      message: "Feedback added successfully",
      feedback,
      averageRating: avgRating
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
