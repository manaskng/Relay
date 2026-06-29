import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import fs from "fs"; 
import os from "os"; 
import { createServer } from "http"; 
import { Server } from "socket.io";
import { setupSocket } from "./socket/socketHandler.js";

import { connect } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import notesRoutes from "./routes/notes.js";
import taskRoutes from "./routes/taskRoutes.js";
import userProfileRoutes from "./routes/userProfileRoutes.js"; 
import codeSnippetRoutes from "./routes/codeSnippetRoutes.js";
import profileLinkRoutes from "./routes/profileLinkRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import compilerRoutes from "./routes/compilerRoutes.js";
import contestRoutes from "./routes/contestRoutes.js";
import codingStatsRoutes from "./routes/codingStatsRoutes.js";
import { rateLimiter } from "./middlewares/rateLimiter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
//  Wrap Express with HTTP Server
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.json());

//  Configure CORS 
const corsOptions = {
  origin: [
    "http://localhost:5173",               
    "https://my-nano-notesf.vercel.app" ,
    "https://devnexus-app.vercel.app",
    "https://relay-workspace-llm.vercel.app"
  ],
  credentials: true
};

app.use(cors(corsOptions));

//  Initialize Socket.IO
const io = new Server(httpServer, {
  cors: corsOptions
});

//  Connect Socket Logic
setupSocket(io);

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const upload = multer({ 
  dest: os.tmpdir(), 
  limits: { fileSize: 5 * 1024 * 1024 } 
});

connect();

// Routes
app.use("/api/users", authRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/tasks", taskRoutes); 
app.use("/api/snippets", codeSnippetRoutes); 
app.use("/api/profiles", profileLinkRoutes);
app.use("/api/user-profile", userProfileRoutes); 
app.use("/api/search", searchRoutes);
app.use("/api/ai", rateLimiter({ maxRequests: 10, windowMs: 60000, prefix: "rl:ai" }), aiRoutes);
app.use("/api/compiler", rateLimiter({ maxRequests: 15, windowMs: 60000, prefix: "rl:compiler" }), compilerRoutes);
app.use("/api/contests", contestRoutes);
app.use("/api/coding-stats", codingStatsRoutes);

//cloudinary upload endpoint
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file provided" });

    console.log("File received:", req.file.path);
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "devdocs",
      resource_type: "image"
    });
    
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Failed to delete temp file:", err);
    });

    res.json({ url: result.secure_url });
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    res.status(500).json({ message: "Image upload failed", error: error.message });
  }
});

app.get("/ping", (req, res) => {
  res.status(200).send("Server Ok");
});


httpServer.listen(PORT, () => {
  console.log(`Server + Socket running at port: ${PORT}`);
});