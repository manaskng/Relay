import express from "express";
import UserProfile from "../models/UserProfile.js";
import User from "../models/User.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

// GET Profile 
router.get("/", protect, async (req, res) => {
    try {
        let profile = await UserProfile.findOne({ user: req.user._id });
        
        if (!profile) {
            profile = await UserProfile.create({ user: req.user._id });
        }
        
        const responseData = { 
            ...profile._doc, 
            username: req.user.username,
            email: req.user.email 
        };
        
        res.json(responseData);
    } catch (error) {
        console.error("GET PROFILE ERROR:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// UPDATE Profile 
router.put("/", protect, async (req, res) => {
    try {
        
        const { 
            fullName, headline, about, location, email, 
            linkedinProfile, portfolioUrl, githubUsername, leetcodeUsername, codeforcesUsername,
            skills, achievements, projects, resumes,
            profilePic 
        } = req.body;

        
        const profile = await UserProfile.findOneAndUpdate(
            { user: req.user._id }, 
            { 
                $set: { 
                    fullName, headline, about, location, email,
                    linkedinProfile, portfolioUrl, githubUsername, leetcodeUsername, codeforcesUsername,
                    skills, achievements, projects, resumes,
                    // 👇 2. ADD profilePic HERE SO IT GETS SAVED
                    profilePic
                }
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        
        
        res.json({ ...profile._doc, username: req.user.username });
    } catch (error) {
        console.error("UPDATE PROFILE ERROR:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});


router.get("/public/:username", async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }


        const profile = await UserProfile.findOne({ user: user._id });
        
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        res.json({ 
            ...profile._doc, 
            username: user.username, 
            email: user.email 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

export default router;