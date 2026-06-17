import mongoose from "mongoose";
import { generateEmbedding } from "../utils/geminiEmbed.js";

const CodeSnippetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
  },
  language: {
    type: String, 
    default: "cpp", 
  },
  tags: {
    type: [String], 
    default: [],
  },
  
  // Optional Fields
  timeComplexity: { type: String, default: "" },
  spaceComplexity: { type: String, default: "" },
  problemLink: { type: String, default: "" },
  isFavorite: { type: Boolean, default: false },
  embedding: {
    type: [Number], // Array of floats (768 dimensions for Gemini)
    default: [],
  },
}, { timestamps: true });

// Generate vector embedding before saving if content changed
CodeSnippetSchema.pre("save", async function (next) {
  if (this.isModified("title") || this.isModified("code") || this.isModified("tags")) {
    const textToEmbed = `Title: ${this.title}\nLanguage: ${this.language}\nTags: ${this.tags.join(", ")}\nCode:\n${this.code}`;
    const embeddingValues = await generateEmbedding(textToEmbed);
    if (embeddingValues && embeddingValues.length > 0) {
      this.embedding = embeddingValues;
    }
  }
  next();
});

// 2. CRITICAL DATABASE FIX
// We MUST tell MongoDB: "Do not use the 'language' field for text search logic."
// We point it to a non-existent field "dummy" so it ignores our coding language field.
CodeSnippetSchema.index({ title: 'text', tags: 'text' }, { language_override: "dummy" }); 

const CodeSnippet = mongoose.model("CodeSnippet", CodeSnippetSchema);
export default CodeSnippet;