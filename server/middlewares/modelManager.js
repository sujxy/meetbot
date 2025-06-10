import { ChatGroq } from "@langchain/groq";
import User from "../models/user.js";

export const attachModelInstance = async (req, res, next) => {
  try {
    const { _id, modelPreference } = req.user;

    if (!_id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Get API key from environment variables
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "API key not configured",
      });
    }

    // Create ChatGroq instance with user's preferred model
    const model = new ChatGroq({
      model: modelPreference || "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 0,
      apiKey: GROQ_API_KEY,
    });

    // Attach model instance to request object
    req.model = model;
    next();
  } catch (error) {
    console.error("Error creating model instance:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to initialize AI model",
    });
  }
};
