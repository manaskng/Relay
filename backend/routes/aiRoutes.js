import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { protect } from "../middlewares/auth.js"; 
import { performVectorSearch } from "../utils/vectorSearch.js";

const router = express.Router();


const PRIMARY_MODEL = "gemini-2.5-flash"; 
const BACKUP_MODEL = "gemini-2.0-flash";

router.post("/process", protect, async (req, res) => {
  const { code, action, targetLanguage } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ message: "AI Service initialization failed." });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    let prompt = "";
    switch (action) {
      case "explain":
        prompt = `You are a Senior Principal Engineer. Explain this code technically:\n\n${code}`;
        break;
      case "refactor":
        prompt = `You are a Clean Code Architect. Refactor this code for enterprise scalability:\n\n${code}`;
        break;
      case "convert":
        prompt = `Convert this code to ${targetLanguage || "Python"}:\n\n${code}`;
        break;
      case "rag":
        console.log("🔍 Performing Vector Search for RAG...");
        // In RAG mode, 'code' acts as the user's query/chat message
        const context = await performVectorSearch(code, req.user._id);
        
        let snippetsText = context.snippets.map((s, i) => `--- Snippet ${i+1}: ${s.title} (${s.language}) ---\n${s.code}`).join("\n\n");
        let notesText = context.notes.map((n, i) => `--- Note ${i+1}: ${n.title} ---\n${n.description ? n.description.replace(/<[^>]*>?/gm, '') : ''}`).join("\n\n");
        
        let injectedContext = "No personal context found.";
        if (snippetsText || notesText) {
          injectedContext = `${snippetsText}\n\n${notesText}`;
        }

        prompt = `You are Relay's intelligent workspace assistant. The user has asked a question. 
Here is context retrieved from their personal Code Vault and DevDocs using Vector Search:

<workspace_context>
${injectedContext}
</workspace_context>

User Question: "${code}"

Answer the question. If the workspace context contains the answer, use it and cite the Snippet or Note title. If the context is irrelevant to the question, answer normally.`;
        break;
      default:
        return res.status(400).json({ message: "Unknown directive." });
    }

    let text = "";
    
    try {
      console.log(` Attempting AI with ${PRIMARY_MODEL}...`);
      const model = genAI.getGenerativeModel({ model: PRIMARY_MODEL });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      text = response.text();
      
    } catch (primaryError) {
      console.warn(`⚠️ ${PRIMARY_MODEL} failed. Switching to ${BACKUP_MODEL}...`);
      console.warn(`Error: ${primaryError.message}`);

      try {
        const fallbackModel = genAI.getGenerativeModel({ model: BACKUP_MODEL });
        const result = await fallbackModel.generateContent(prompt);
        const response = await result.response;
        text = response.text();
      } catch (backupError) {
        throw new Error(`All models failed. Primary: ${primaryError.message}`);
      }
    }

    res.json({ result: text });

  } catch (error) {
    console.error("--- GEMINI AI CRITICAL FAILURE ---");
    console.error(error); 
    res.status(500).json({ message: "AI processing failed to process request." });
  }
});

export default router;