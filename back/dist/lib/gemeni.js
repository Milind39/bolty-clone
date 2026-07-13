"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
// src/lib/gemini.ts
const genai = require("@google/genai");
require("dotenv").config();
const ApiKey = process.env.GEMENI_API_KEY || "";
exports.client = new genai.GoogleGenAI({ apiKey: ApiKey });
//# sourceMappingURL=gemeni.js.map