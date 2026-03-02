const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Gamification = require("../models/Gamification");
const auth = require("../middleware/authMiddleware");

// Helper function to generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper function to generate JWT token
const generateToken = (userId, rememberMe = false) => {
  const expiresIn = rememberMe ? "30d" : "24h";
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn });
};

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, department, year, profilePicture } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const emailOtp = generateOTP();
    const emailOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const newUser = new User({
      name,
      email,
      password,
      phone,
      department,
      year,
      profilePicture: profilePicture || "",
      emailOtp,
      emailOtpExpiry,
      emailVerified: false,
      phoneVerified: false,
      points: 0,
      badges: []
    });

    await newUser.save();

    // Create gamification record
    await Gamification.create({ userId: newUser._id });

    // In production, send email with OTP
    console.log(`Email OTP for ${email}: ${emailOtp}`);

    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
      userId: newUser._id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// VERIFY EMAIL OTP
router.post("/verify-email-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    if (user.emailOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date() > user.emailOtpExpiry) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.emailVerified = true;
    user.emailOtp = null;
    user.emailOtpExpiry = null;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// RESEND EMAIL OTP
router.post("/resend-email-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    const emailOtp = generateOTP();
    const emailOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.emailOtp = emailOtp;
    user.emailOtpExpiry = emailOtpExpiry;
    await user.save();

    // In production, send email with OTP
    console.log(`Email OTP for ${email}: ${emailOtp}`);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// SEND PHONE OTP
router.post("/send-phone-otp", auth, async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const phoneOtp = generateOTP();
    const phoneOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.phone = phone;
    user.phoneOtp = phoneOtp;
    user.phoneOtpExpiry = phoneOtpExpiry;
    await user.save();

    // In production, send SMS with OTP
    console.log(`Phone OTP for ${phone}: ${phoneOtp}`);

    res.status(200).json({ message: "OTP sent to phone" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// VERIFY PHONE OTP
router.post("/verify-phone-otp", auth, async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ message: "OTP is required" });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.phoneVerified) {
      return res.status(400).json({ message: "Phone already verified" });
    }

    if (user.phoneOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date() > user.phoneOtpExpiry) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.phoneVerified = true;
    user.phoneOtp = null;
    user.phoneOtpExpiry = null;
    await user.save();

    res.status(200).json({ message: "Phone verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id, rememberMe || false);

    // Generate remember me token if requested
    let rememberMeToken = null;
    if (rememberMe) {
      rememberMeToken = generateToken(user._id, true);
      user.rememberMeToken = rememberMeToken;
      await user.save();
    }

    res.status(200).json({
      message: "Login successful",
      token,
      rememberMeToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        department: user.department,
        year: user.year,
        profilePicture: user.profilePicture,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        points: user.points,
        badges: user.badges
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GOOGLE AUTH
router.post("/google-auth", async (req, res) => {
  try {
    const { googleId, name, email, profilePicture } = req.body;

    if (!googleId || !email) {
      return res.status(400).json({ message: "Google ID and email are required" });
    }

    let user = await User.findOne({ googleId });

    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        user.googleId = googleId;
        user.profilePicture = profilePicture || user.profilePicture;
        user.emailVerified = true;
        await user.save();
      } else {
        user = new User({
          name,
          email,
          googleId,
          profilePicture: profilePicture || "",
          emailVerified: true,
          phoneVerified: false,
          points: 0,
          badges: []
        });
        await user.save();

        await Gamification.create({ userId: user._id });
      }
    }

    const token = generateToken(user._id);

    res.status(200).json({
      message: "Google login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        points: user.points,
        badges: user.badges
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GITHUB AUTH
router.post("/github-auth", async (req, res) => {
  try {
    const { githubId, name, email, profilePicture } = req.body;

    if (!githubId) {
      return res.status(400).json({ message: "GitHub ID is required" });
    }

    let user = await User.findOne({ githubId });

    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        user.githubId = githubId;
        user.profilePicture = profilePicture || user.profilePicture;
        await user.save();
      } else {
        user = new User({
          name: name || "GitHub User",
          email: email || `${githubId}@github.com`,
          githubId,
          profilePicture: profilePicture || "",
          emailVerified: true,
          phoneVerified: false,
          points: 0,
          badges: []
        });
        await user.save();

        await Gamification.create({ userId: user._id });
      }
    }

    const token = generateToken(user._id);

    res.status(200).json({
      message: "GitHub login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        points: user.points,
        badges: user.badges
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetOtp = generateOTP();
    const resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.resetPasswordOtp = resetOtp;
    user.resetPasswordOtpExpiry = resetOtpExpiry;
    await user.save();

    // In production, send email with reset OTP
    console.log(`Password Reset OTP for ${email}: ${resetOtp}`);

    res.status(200).json({ message: "Password reset OTP sent to email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// VERIFY RESET OTP
router.post("/verify-reset-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.resetPasswordOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date() > user.resetPasswordOtpExpiry) {
      return res.status(400).json({ message: "OTP expired" });
    }

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// RESET PASSWORD
router.post("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: "Email and new password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = newPassword;
    user.resetPasswordOtp = null;
    user.resetPasswordOtpExpiry = null;
    user.rememberMeToken = null;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN WITH REMEMBER ME
router.post("/login-with-token", async (req, res) => {
  try {
    const { rememberMeToken } = req.body;

    if (!rememberMeToken) {
      return res.status(400).json({ message: "Remember me token is required" });
    }

    const decoded = jwt.verify(rememberMeToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.rememberMeToken !== rememberMeToken) {
      return res.status(401).json({ message: "Invalid remember me token" });
    }

    const token = generateToken(user._id, true);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        department: user.department,
        year: user.year,
        profilePicture: user.profilePicture,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        points: user.points,
        badges: user.badges
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGOUT
router.post("/logout", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user) {
      user.rememberMeToken = null;
      await user.save();
    }
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET CURRENT USER
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE PROFILE
router.put("/profile", auth, async (req, res) => {
  try {
    const { name, phone, department, year, profilePicture } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (department) user.department = department;
    if (year) user.year = year;
    if (profilePicture) user.profilePicture = profilePicture;
    user.updatedAt = new Date();

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        department: user.department,
        year: user.year,
        profilePicture: user.profilePicture,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        points: user.points,
        badges: user.badges
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// CHANGE PASSWORD
router.put("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    user.rememberMeToken = null;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
