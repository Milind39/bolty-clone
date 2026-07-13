import { client } from "../lib/gemeni";

/**
 * Helper to log and execute Gemini API calls
 */
export async function callGeminiAndLog(params?: any) {
  const timestamp = new Date().toISOString();

  // Log the payload being sent
  console.log(`[${timestamp}] --- API REQUEST START ---`);
  console.log(`Model: ${params.model}`);
  console.log(`System Instruction: ${params.system_instruction}`);
  console.log(`Input Text Length: ${params.input[0].text.length} characters`);
  // Uncomment the next line if you want to see the full prompt in your terminal:
  console.log("Full Prompt:", params.input[0].text);
  console.log(`[${timestamp}] --- API REQUEST END ---`);

  return await client.interactions.create(params);
}
