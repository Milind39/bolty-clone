"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callGeminiAndLog = callGeminiAndLog;
const gemeni_1 = require("../lib/gemeni");
/**
 * Helper to log and execute Gemini API calls
 */
async function callGeminiAndLog(params) {
    const timestamp = new Date().toISOString();
    // Log the payload being sent
    console.log(`[${timestamp}] --- API REQUEST START ---`);
    console.log(`Model: ${params.model}`);
    console.log(`System Instruction: ${params.system_instruction}`);
    console.log(`Input Text Length: ${params.input[0].text.length} characters`);
    // Uncomment the next line if you want to see the full prompt in your terminal:
    console.log("Full Prompt:", params.input[0].text);
    console.log(`[${timestamp}] --- API REQUEST END ---`);
    return await gemeni_1.client.interactions.create(params);
}
//# sourceMappingURL=loghelper.js.map