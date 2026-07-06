import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";
import { BASE_PROMPT, getSystemPrompt } from "./prompt.js";
import { basePrompt as reactBasePrompt } from "./defaults/react.js";
import { basePrompt as nodeBasePrompt } from "./defaults/react.js";
dotenv.config();
const apiKey = process.env.GEMENI_API_KEY;
if (!apiKey) {
    throw new Error("GEMENI_API_KEY is missing in .env file");
}
// Initialize the client
const genAI = new GoogleGenerativeAI(apiKey);
// const prompts = [`Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n{${reactBasePrompt}}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`]
const ai = new GoogleGenAI({ apiKey });
const app = express();
app.use(cors());
app.use(express.json());
app.post("/template", async (req, res) => {
    try {
        const prompt = req.body.prompt;
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        // Start streaming generation
        const response = await model.generateContent({
            contents: [
                {
                    role: "user",
                    parts: [{ text: `${prompt}` }]
                }
            ],
            systemInstruction: "Return Either node or react based on what do you think this project should be. Only return a single word either `node` or `react`. Do not return anything extra.",
        });
        const answer = response.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ""; // react or node
        if (answer == "react") {
            return res.json({
                prompts: [
                    `${BASE_PROMPT}`,
                    `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files:\n  - .gitignore\n  - package-lock.json\n`,
                ],
                uiPrompts: [reactBasePrompt],
            });
        }
        if (answer === "node") {
            return res.json({
                prompts: [`Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
                uiPrompts: [nodeBasePrompt]
            });
        }
        return res.status(403).json({ message: "Could not determine project type" });
    }
    catch (err) {
        console.error("Error in /template:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});
app.post("/chat", async (req, res) => {
    try {
        const contents = req.body.contents;
        if (!Array.isArray(contents)) {
            return res.status(400).json({ error: "contents must be an array" });
        }
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const response = await model.generateContentStream({
            contents,
            systemInstruction: getSystemPrompt(),
        });
        // Set headers for streaming response
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.setHeader("Transfer-Encoding", "chunked");
        for await (const chunk of response.stream) {
            const text = chunk?.candidates?.[0]?.content?.parts?.[0]?.text || "";
            if (text) {
                res.write(text); // flush chunks directly
            }
        }
        res.end();
    }
    catch (err) {
        console.error("Error in /chat:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});
app.listen(5000, () => {
    console.log("Server is running on port 5000");
});
// async function run() {
//   //how do i use system prompt
//   const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
//   const system = getSystemPrompt();
//   // Start streaming generation
//   const stream = await model.generateContentStream({
//     contents: [
//       {
//         role: "user",
//         parts: [{ text: `${BASE_PROMPT}` }]
//       }
//       ,{
//         role: "user",
//         parts: [{ text: `${prompts}` }]
//       },
//       {
//         role: "user",
//         parts: [{ text: "Create a Todo App" }]
//       }
//     ]
//   });
//   // Each chunk is an event with partial text
//   for await (const chunk of stream.stream) {
//     const text = chunk?.candidates?.[0]?.content?.parts?.[0]?.text;
//     if (text) {
//       process.stdout.write(text); // prints continuously
//     }
//   }
//   console.log("\n--- Done ---");
// }
// run();
// // Read prompt from prompt.txt
// const prompt = fs.readFileSync("./src/prompt.txt", "utf-8").trim();
// // Define types for request bodies
// interface TemplateRequestBody {
//   prompt: string;
// }
// interface ChatMessage {
//   role: string;
//   content: string;
// }
// interface ChatRequestBody {
//   messages: ChatMessage[];
// }
// app.post("/template", async (req: Request<{}, {}, TemplateRequestBody>, res: Response) => {
//   console.log("Request headers (/template):", req.headers);
//   console.log("Request body:", req.body);
//   const prompt = req.body.prompt;
//   const request = {
//     model: "gemini-2.5-flash",
//     maxTokens: 200,
//     temperature: 0,
//     contents: [
//       {
//         role: "user",
//         parts: [{ text: prompt }]
//       }
//     ],
//   };
//   try {
//     const response = await ai.models.generateContentStream(request);
//     console.log("Template response received");
//     const answer = response;
//     console.log("Model answer:", answer);
//     // Add specific instruction to help guide the model
//     if (answer?.includes("react")) {
//       console.log("Detected as React project");
//       res.json({
//         prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
//         uiPrompts: [reactBasePrompt]
//       });
//       return;
//     }
//     if (answer?.includes("node")) {
//       console.log("Detected as Node.js project");
//       res.json({
//         prompts: [`Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
//         uiPrompts: [nodeBasePrompt]
//       });
//       return;
//     }
//     console.log("No project type detected in answer:", answer);
//     res.status(403).json({ 
//       message: "Could not determine project type",
//       modelResponse: answer
//     });
//   } catch (err) {
//     const errorMessage = err instanceof Error ? err.message : String(err);
//     console.error("Error in /template:", errorMessage);
//     res.status(500).json({ error: errorMessage });
//   }
// });
// app.listen(3000, () => {
//   console.log("Server is running on port 3000");
// });
// app.post("/chat", async (req: Request<{}, {}, ChatRequestBody>, res: Response) => {
//   console.log("Request headers (/chat):", req.headers);
//   const messages = req.body.messages;
//   // Convert messages to Gemini format
//   const contents = messages.map((msg: ChatMessage) => ({
//     role: msg.role,
//     parts: [{ text: msg.content }]
//   }));
//   const request = {
//     model: "gemini-2.5-flash",
//     maxTokens: 8000,
//     temperature: 0,
//     contents,
//   };
//   try {
//     const response = await ai.models.generateContent(request);
//     console.log("Chat response:", response);
//     res.json({
//       response: response.candidates?.[0]?.content?.parts?.[0]?.text
//     });
//   } catch (err) {
//     const errorMessage = err instanceof Error ? err.message : String(err);
//     res.status(500).json({ error: errorMessage });
//   }
// });
// app.listen(3000, () => {
//   console.log("Server is running on port 3000");
// });
//# sourceMappingURL=index.js.map