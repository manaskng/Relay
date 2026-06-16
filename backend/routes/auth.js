import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { protect } from "../middlewares/auth.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import axios from "axios";

const router = express.Router();

// Generate auth token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// ================= REGISTER =================
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Fill all fields" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ username, email, password });
    const token = generateToken(user.id);

    res.status(201).json({
      id: user._id,
      username: user.username,
      email: user.email,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ================= LOGIN =================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user.id);

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ================= GET ME =================
router.get("/me", protect, async (req, res) => {
  res.json(req.user);
});

// ================= FORGOT PASSWORD =================
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    console.log("---------------- FORGOT PASS DEBUG ----------------");
    console.log("1. Generated Raw Token:", resetToken);
    console.log("2. Generated Hash to Save:", hashedToken);

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; 

    try {
      await user.save({ validateBeforeSave: false }); 
      console.log("3. Database Save Successful!");
      
      const savedUser = await User.findOne({ email });
      console.log("4. Verify DB Token:", savedUser.resetPasswordToken);
      
    } catch (saveError) {
      console.error("❌ DB SAVE FAILED:", saveError.message);
      return res.status(500).json({ message: "Database save failed" });
    }
    console.log("---------------------------------------------------");
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { email: process.env.BREVO_SENDER_EMAIL, name: "Relay" },
        to: [{ email: user.email }],
        subject: "Reset your Relay password",
        htmlContent: `<p>Click here: <a href="${resetUrl}">Reset Password</a></p>`,
      },
      { headers: { "api-key": process.env.BREVO_API_KEY, "Content-Type": "application/json" } }
    );

    res.json({ message: "Reset link sent" });

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});
// ================= RESET PASSWORD =================
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    user.password = password; 
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save(); 

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Password reset failed" });
  }
});
export default router;