const express = require("express");
const router = express.Router();
const SkillRequest = require("../models/SkillRequest");
const Skill = require("../models/Skill");
const Session = require("../models/Session");
const auth = require("../middleware/authMiddleware");

// SEND SKILL REQUEST
router.post("/", auth, async (req, res) => {
  try {
    const { skillId, message } = req.body;

    if (!skillId) {
      return res.status(400).json({ message: "Skill ID is required" });
    }

    const skill = await Skill.findById(skillId);
    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    if (skill.userId.toString() === req.user.userId) {
      return res.status(400).json({ message: "You cannot request your own skill" });
    }

    // Check if request already exists
    const existingRequest = await SkillRequest.findOne({
      skillId,
      requesterId: req.user.userId,
      status: { $in: ["pending", "accepted"] }
    });

    if (existingRequest) {
      return res.status(400).json({ message: "You already have a pending or accepted request for this skill" });
    }

    const skillRequest = new SkillRequest({
      skillId,
      requesterId: req.user.userId,
      ownerId: skill.userId,
      message: message || "",
      status: "pending"
    });

    await skillRequest.save();

    res.status(201).json({
      message: "Skill request sent successfully",
      skillRequest
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET MY REQUESTS (as requester)
router.get("/my-requests", auth, async (req, res) => {
  try {
    const requests = await SkillRequest.find({ requesterId: req.user.userId })
      .populate("skillId", "name category level image")
      .populate("ownerId", "name email profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json({ requests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET INCOMING REQUESTS (as owner)
router.get("/incoming", auth, async (req, res) => {
  try {
    const requests = await SkillRequest.find({ ownerId: req.user.userId })
      .populate("skillId", "name category level image")
      .populate("requesterId", "name email profilePicture department year")
      .sort({ createdAt: -1 });

    res.status(200).json({ requests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ACCEPT SKILL REQUEST
router.put("/:id/accept", auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    const skillRequest = await SkillRequest.findOne({
      _id: req.params.id,
      ownerId: req.user.userId,
      status: "pending"
    });

    if (!skillRequest) {
      return res.status(404).json({ message: "Skill request not found or already processed" });
    }

    // Update request status
    skillRequest.status = "accepted";
    skillRequest.updatedAt = new Date();
    await skillRequest.save();

    // Create session if dates are provided
    if (startDate && endDate) {
      const session = new Session({
        skillId: skillRequest.skillId,
        skillRequestId: skillRequest._id,
        learnerId: skillRequest.requesterId,
        ownerId: skillRequest.ownerId,
        startDate,
        endDate,
        status: "scheduled"
      });

      await session.save();

      return res.status(200).json({
        message: "Request accepted and session created",
        skillRequest,
        session
      });
    }

    res.status(200).json({
      message: "Request accepted",
      skillRequest
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// REJECT SKILL REQUEST
router.put("/:id/reject", auth, async (req, res) => {
  try {
    const { reason } = req.body;

    const skillRequest = await SkillRequest.findOne({
      _id: req.params.id,
      ownerId: req.user.userId,
      status: "pending"
    });

    if (!skillRequest) {
      return res.status(404).json({ message: "Skill request not found or already processed" });
    }

    skillRequest.status = "rejected";
    skillRequest.remarks = reason || "";
    skillRequest.updatedAt = new Date();
    await skillRequest.save();

    res.status(200).json({
      message: "Request rejected",
      skillRequest
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// CANCEL SKILL REQUEST
router.put("/:id/cancel", auth, async (req, res) => {
  try {
    const skillRequest = await SkillRequest.findOne({
      _id: req.params.id,
      requesterId: req.user.userId,
      status: "pending"
    });

    if (!skillRequest) {
      return res.status(404).json({ message: "Skill request not found or cannot be cancelled" });
    }

    skillRequest.status = "cancelled";
    skillRequest.updatedAt = new Date();
    await skillRequest.save();

    res.status(200).json({
      message: "Request cancelled",
      skillRequest
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET SINGLE REQUEST
router.get("/:id", auth, async (req, res) => {
  try {
    const skillRequest = await SkillRequest.findById(req.params.id)
      .populate("skillId", "name category level image description")
      .populate("requesterId", "name email profilePicture department year points badges")
      .populate("ownerId", "name email profilePicture department year points badges");

    if (!skillRequest) {
      return res.status(404).json({ message: "Skill request not found" });
    }

    // Check authorization
    if (skillRequest.requesterId._id.toString() !== req.user.userId && 
        skillRequest.ownerId._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.status(200).json({ skillRequest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
