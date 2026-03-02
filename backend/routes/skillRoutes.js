const express = require("express");
const router = express.Router();
const Skill = require("../models/Skill");
const auth = require("../middleware/authMiddleware");

// ADD SKILL
router.post("/", auth, async (req, res) => {
  try {
    const { name, description, category, level, image, tags } = req.body;

    if (!name || !description || !category || !level) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const skill = new Skill({
      name,
      description,
      category,
      level,
      image: image || "",
      tags: tags || [],
      userId: req.user.userId
    });

    await skill.save();

    res.status(201).json({
      message: "Skill added successfully",
      skill
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET ALL SKILLS (with filtering, searching, sorting)
router.get("/", async (req, res) => {
  try {
    const {
      category,
      level,
      search,
      sortBy,
      order,
      page = 1,
      limit = 20
    } = req.query;

    let query = { isActive: true };

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by level
    if (level) {
      query.level = level;
    }

    // Search by name, description, or tags
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } }
      ];
    }

    // Sorting
    let sort = { createdAt: -1 }; // Default: newest first
    if (sortBy) {
      sort = { [sortBy]: order === "asc" ? 1 : -1 };
    }

    const skip = (page - 1) * limit;

    const skills = await Skill.find(query)
      .populate("userId", "name email profilePicture department year")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Skill.countDocuments(query);

    res.status(200).json({
      skills,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET MY SKILLS
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

// GET SINGLE SKILL
router.get("/:id", async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id)
      .populate("userId", "name email profilePicture department year points badges");

    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    res.status(200).json({ skill });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE SKILL
router.put("/:id", auth, async (req, res) => {
  try {
    const { name, description, category, level, image, tags, isActive } = req.body;

    const skill = await Skill.findOne({ _id: req.params.id, userId: req.user.userId });

    if (!skill) {
      return res.status(404).json({ message: "Skill not found or unauthorized" });
    }

    if (name) skill.name = name;
    if (description) skill.description = description;
    if (category) skill.category = category;
    if (level) skill.level = level;
    if (image) skill.image = image;
    if (tags) skill.tags = tags;
    if (isActive !== undefined) skill.isActive = isActive;
    skill.updatedAt = new Date();

    await skill.save();

    res.status(200).json({
      message: "Skill updated successfully",
      skill
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE SKILL
router.delete("/:id", auth, async (req, res) => {
  try {
    const skill = await Skill.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });

    if (!skill) {
      return res.status(404).json({ message: "Skill not found or unauthorized" });
    }

    res.status(200).json({ message: "Skill deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET SKILL CATEGORIES
router.get("/meta/categories", (req, res) => {
  const categories = [
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
  ];

  const levels = ["Beginner", "Intermediate", "Advanced", "Expert"];

  res.status(200).json({ categories, levels });
});

module.exports = router;
