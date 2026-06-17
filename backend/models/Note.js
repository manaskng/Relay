import mongoose from "mongoose";
import { generateEmbedding } from "../utils/geminiEmbed.js";

const NoteSchema = new mongoose.Schema({
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    isPinned: { // KEPT
      type: Boolean,
      required: true,
      default: false,
    },
    embedding: {
      type: [Number], // Array of floats (768 dimensions for Gemini)
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Generate vector embedding before saving if content changed
NoteSchema.pre("save", async function (next) {
  if (this.isModified("title") || this.isModified("description")) {
    // Strip HTML from description (since tip-tap saves raw HTML) for cleaner embeddings
    const strippedDesc = this.description ? this.description.replace(/<[^>]*>?/gm, '') : "";
    const textToEmbed = `Title: ${this.title}\nContent:\n${strippedDesc}`;
    
    const embeddingValues = await generateEmbedding(textToEmbed);
    if (embeddingValues && embeddingValues.length > 0) {
      this.embedding = embeddingValues;
    }
  }
  next();
});

const Note = mongoose.model("Note", NoteSchema);
export default Note;