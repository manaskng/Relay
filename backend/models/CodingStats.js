import mongoose from "mongoose";

const CodingStatsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date, // We will zero out the time so it represents the exact day
    required: true,
  },
  leetcode: {
    easy: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    hard: { type: Number, default: 0 },
    totalSolved: { type: Number, default: 0 },
  },
  codeforces: {
    rating: { type: Number, default: 0 },
    maxRating: { type: Number, default: 0 },
    rank: { type: String, default: "" },
  },
  github: {
    followers: { type: Number, default: 0 },
    publicRepos: { type: Number, default: 0 },
  }
}, { timestamps: true });

// Ensure a user only has one statistics snapshot per day
CodingStatsSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model("CodingStats", CodingStatsSchema);
