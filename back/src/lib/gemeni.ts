// src/lib/gemini.ts
import genai = require("@google/genai");
require("dotenv").config();

const ApiKey = process.env.GEMENI_API_KEY || "";
export const client = new genai.GoogleGenAI({ apiKey: ApiKey });