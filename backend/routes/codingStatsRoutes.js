import express from "express";
import { protect } from "../middlewares/auth.js";
import CodingStats from "../models/CodingStats.js";
import UserProfile from "../models/UserProfile.js";
import { fetchGitHubStats, fetchLeetCodeStats, fetchCodeforcesStats } from "../utils/statsAggregator.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Check if we already have a snapshot for TODAY
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    let todaysStats = await CodingStats.findOne({ user: userId, date: today });

    // If we have today's snapshot, return it immediately to be fast!
    if (todaysStats) {
      return res.json({ stats: todaysStats });
    }

    // If no snapshot today, we must fetch from external APIs
    // First, get the handles from UserProfile
    const profile = await UserProfile.findOne({ user: userId });
    
    if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
    }

    // We fetch them in parallel for speed!
    const [githubData, leetcodeData, codeforcesData] = await Promise.all([
      fetchGitHubStats(profile.githubUsername),
      fetchLeetCodeStats(profile.leetcodeUsername),
      fetchCodeforcesStats(profile.codeforcesUsername || profile.codeforcesHandle) // Check what field they use, defaults to null if absent
    ]);

    // Create the new snapshot
    const newStats = await CodingStats.create({
      user: userId,
      date: today,
      github: githubData || {},
      leetcode: leetcodeData || {},
      codeforces: codeforcesData || {}
    });

    res.json({ stats: newStats, message: "Stats synced with external platforms!" });

  } catch (error) {
    console.error("GET CodingStats ERROR:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

export default router;
