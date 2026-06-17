import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Generates a 768-dimensional vector embedding for a given string of text
 * using Google's text-embedding-004 model.
 * 
 * @param {string} text - The content to embed (e.g., code snippet, note description)
 * @returns {Promise<number[]>} An array of floats representing the embedding vector
 */
export async function generateEmbedding(text) {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is missing. Skipping embedding generation.");
    return [];
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use the optimized embedding model
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    
    // Make sure text isn't empty to prevent API errors
    const contentToEmbed = text ? text.trim() : "";
    if (!contentToEmbed) return [];

    const result = await model.embedContent(contentToEmbed);
    return result.embedding.values;
  } catch (error) {
    console.error("Failed to generate embedding:", error.message);
    // Return empty array so we don't break the save process if AI API is down
    return [];
  }
}
