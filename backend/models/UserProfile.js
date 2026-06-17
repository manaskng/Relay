import mongoose from "mongoose";


const ProjectSchema = new mongoose.Schema({
  title: { type: String, default: "" },
  description: { type: String, default: "" },
  techStack: { type: [String], default: [] },
  githubLink: { type: String, default: "" },
  liveLink: { type: String, default: "" },
  

  image: { type: String, default: "" } 
}, { _id: false }); 

const ResumeSchema = new mongoose.Schema({
  label: { type: String, default: "" },
  link: { type: String, default: "" }
}, { _id: false });


const UserProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true 
  },
  // --- IDENTITY ---
  fullName: { type: String, default: "" },
  headline: { type: String, default: "" }, 
  about: { type: String, default: "" }, 
  location: { type: String, default: "" },
  email: { type: String, default: "" },
  linkedinProfile: { type: String, default: "" }, 
  portfolioUrl: { type: String, default: "" },    
  profilePic: { type: String, default: "" }, 
  githubUsername: { type: String, default: "" },
  leetcodeUsername: { type: String, default: "" },
  codeforcesUsername: { type: String, default: "" },

  skills: { type: [String], default: [] }, 
  achievements: { type: [String], default: [] }, 
  
  projects: [ProjectSchema],
  resumes: [ResumeSchema]

}, { timestamps: true });

const UserProfile = mongoose.model("UserProfile", UserProfileSchema);
export default UserProfile;