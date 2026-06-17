import CodeSnippet from "../models/CodeSnippet.js";
import Note from "../models/Note.js";
import { generateEmbedding } from "./geminiEmbed.js";
import mongoose from "mongoose";

/**
 * Performs a vector search across the user's CodeSnippets and Notes.
 * 
 * @param {string} query - The user's search query or chat message
 * @param {string} userId - The user's ObjectId to filter results securely
 * @returns {Promise<Object>} An object containing the top snippets and notes
 */
export async function performVectorSearch(query, userId) {
  try {
    // 1. Convert the user's query into a vector embedding
    const queryVector = await generateEmbedding(query);
    if (!queryVector || queryVector.length === 0) {
      throw new Error("Failed to generate embedding for query.");
    }

    // 2. Search CodeSnippets
    const snippetResults = await CodeSnippet.aggregate([
      {
        $vectorSearch: {
          index: "vector_index", // Name of the Atlas Vector Search Index
          path: "embedding",
          queryVector: queryVector,
          numCandidates: 50,
          limit: 3,
          filter: { user: new mongoose.Types.ObjectId(userId) }
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          language: 1,
          code: 1,
          score: { $meta: "vectorSearchScore" }
        }
      }
    ]);

    // 3. Search Notes
    const noteResults = await Note.aggregate([
      {
        $vectorSearch: {
          index: "vector_index", // Name of the Atlas Vector Search Index
          path: "embedding",
          queryVector: queryVector,
          numCandidates: 50,
          limit: 3,
          filter: { createdBy: new mongoose.Types.ObjectId(userId) }
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          score: { $meta: "vectorSearchScore" }
        }
      }
    ]);

    return {
      snippets: snippetResults,
      notes: noteResults
    };
  } catch (error) {
    console.error("Vector Search Error:", error);
    return { snippets: [], notes: [] };
  }
}
