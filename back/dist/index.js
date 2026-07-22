"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const genai = require("@google/genai");
const prompts_1 = require("./prompts");
const react_1 = require("./defaults/react");
const node_1 = require("./defaults/node");
const express_1 = __importDefault(require("express"));
const loghelper_1 = require("./utility/loghelper");
require("dotenv").config();
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
// console.log(process.env.GEMENI_API_KEY);
const ApiKey = process.env.GEMENI_API_KEY || "";
const client = new genai.GoogleGenAI({ apiKey: ApiKey });
const app = (0, express_1.default)();
app.use(express_1.default.json());
const PORT = 5000;
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)("combined")); // This logs every single request automatically
let requestCount = 0; // Global counter
/*******************************template***********************/
app.post("/template", async (req, res) => {
    const prompt = req.body.prompt.toLowerCase();
    /*****************Below we ask whether its react or node to llm ********************/
    //  const response = await callGeminiAndLog({
    //         model: "gemini-3.5-flash",
    //         input: [
    //             { type: "text", text: prompt },
    //         ],
    //         system_instruction: "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra",
    //  });
    // console.log(response);
    // 1. Local Classification (0 cost, instant, no rate limit)
    let answer = "node"; // Default to node
    if (prompt.includes("react") || prompt.includes("frontend") || prompt.includes("ui")) {
        answer = "react";
    }
    console.log("Classified as:", answer);
    // const answer = response.output_text?.trim().toLowerCase();  // either react or node
    if (answer === "react") {
        res.json({
            prompt: [prompts_1.BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${react_1.reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
            uiPrompt: react_1.reactBasePrompt,
        });
    }
    else if (answer === "node") {
        res.json({
            prompt: `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${node_1.nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
            uiPrompt: node_1.nodeBasePrompt
        });
    }
    else {
        return res.status(403).json({ error: "Invalid project type" });
    }
});
/**************************updated template *************************/
// app.post("/template", async(req, res) => {
//     const prompt = req.body.prompt;
//     // ... your LLM classification code ...
//     const answer = response.output_text?.trim().toLowerCase();
//     // Helper to wrap the prompt in XML
//     const wrapInContext = (boilerplate) => `
// [INSTRUCTIONS]
// You are starting a NEW project. Ignore all previous project definitions.
// Use the following boilerplate as the ONLY foundation.
// <project_files>
// ${boilerplate}
// </project_files>
// <user_request>
// ${prompt}
// </user_request>
// `;
//     if (answer === "react") {
//         res.json({
//             prompt: wrapInContext(reactBasePrompt),
//             uiPrompt: reactBasePrompt,
//         });
//     } else if (answer === "node") {
//         res.json({
//             prompt: wrapInContext(nodeBasePrompt), // Fixed: Use nodeBasePrompt here!
//             uiPrompt: nodeBasePrompt
//         });
//     } else {
//         return res.status(403).json({ error: "Invalid project type" });
//     }
// });
/**********************chat***********************/
app.post("/chat", async (req, res) => {
    requestCount++;
    console.log(`[REQUEST #${requestCount}] Received at ${new Date().toISOString()}`);
    const { userTask, boilerplate } = req.body.prompt;
    const finalPrompt = `
[INSTRUCTIONS]
You are an expert developer. You are provided with existing project files 
within <project_files> tags. Your task is defined within <user_request> tags.
- IF the task is simple (like "Create a todo app"), PROVIDE A SIMPLE IMPLEMENTATION.
- DO NOT invent complex features, analytics dashboards, or platforms.
- Focus ONLY on the requested functionality.
- Prioritize <user_request> over any assumptions about the project's purpose.
- Treat each <user_request> as a fresh task. Do not carry over architectural 
  complexity from previous turns unless explicitly asked to modify existing features.

<project_files>
${boilerplate || ""}
</project_files>

<user_request>
${userTask}
</user_request>
`;
    // Set headers to allow streaming chunks
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    try {
        const response = await (0, loghelper_1.callGeminiAndLog)({
            model: "gemini-3.5-flash", // Updated to standard Gemini flash model syntax
            input: [
                { type: "text", text: finalPrompt },
            ],
            system_instruction: typeof prompts_1.getSystemPrompt === "function" ? (0, prompts_1.getSystemPrompt)() : "You are a helpful coding assistant.",
            stream: true,
        });
        console.log("Stream object type:", typeof response);
        // Pipe the stream events directly to the HTTP response
        for await (const event of response) {
            console.log("Processing event type:", event.event_type);
            // Check for API-level errors inside the event stream
            if (event.event_type === "error") {
                console.error("Gemini API stream error:", event.error);
                res.write(JSON.stringify({
                    error: true,
                    message: event.error?.message || "Unknown API Error"
                }));
                break;
            }
            // Extract text chunks from the delta structure
            if (event.event_type === "step.delta" && event.delta?.type === "text") {
                res.write(event.delta.text);
            }
            // Fallback check if your wrapper uses standard text content deltas
            else if (event.text) {
                res.write(event.text);
            }
        }
        console.log("Stream successfully completed and sent.");
    }
    catch (error) {
        console.error("Fatal Stream Exception:", error);
        // If headers haven't gone out yet, send standard JSON error code
        if (!res.headersSent) {
            res.status(500).json({ error: "Internal Server Error", message: error.message });
        }
        else {
            // Headers already sent (mid-stream), communicate failure over the stream payload
            res.write(JSON.stringify({ error: true, message: "Stream interrupted due to server error" }));
        }
    }
    finally {
        res.end(); // Always close the HTTP connection
    }
});
/****************************MOCK RESPONSE******************* */
// app.post("/chat", async (req, res) => {
//     requestCount++;
//     console.log(`[REQUEST #${requestCount}] Received at ${new Date().toISOString()}`);
//     res.setHeader('Content-Type', 'text/plain; charset=utf-8');
//     res.setHeader('Transfer-Encoding', 'chunked');
//     // Your dummy response formatted with the Bolt artifact/action tags or step XML
//     const dummyXmlResponse = `
// <boltArtifact id="project-import" title="Mock Project">
//   <boltAction type="file" filePath="App.tsx">
//     import React from 'react';
//     export default function App() {
//       return <div className="p-4 text-white bg-slate-900">Hello from Mock Stream!</div>;
//     }
//   </boltAction>
//   <boltAction type="file" filePath="package.json">
//     {
//       "name": "mock-app",
//       "version": "1.0.0"
//     }
//   </boltAction>
// </boltArtifact>
//     `.trim();
//     try {
//         // Simulate streaming chunk-by-chunk with a slight delay
//         const chunkSize = 15; // characters per chunk
//         for (let i = 0; i < dummyXmlResponse.length; i += chunkSize) {
//             const chunk = dummyXmlResponse.slice(i, i + chunkSize);
//             res.write(chunk);
//             // Wait 50ms to realistically simulate network token streaming
//             await new Promise((resolve) => setTimeout(resolve, 50));
//         }
//     } catch (error) {
//         console.error("Mock stream error:", error);
//     } finally {
//         res.end();
//     }
// });
/************ACTUAL ORIGINAL RESPONSE*************************/
// FIX: Destructure from req.body, not req.body.prompt
//     const { userTask, boilerplate } = req.body.prompt;
//     const finalPrompt = `
// [INSTRUCTIONS]
// You are an expert developer. You are provided with existing project files 
// within <project_files> tags. Your task is defined within <user_request> tags.
// - IF the task is simple (like "Create a todo app"), PROVIDE A SIMPLE IMPLEMENTATION.
// - DO NOT invent complex features, analytics dashboards, or platforms.
// - Focus ONLY on the requested functionality.
// - Prioritize <user_request> over any assumptions about the project's purpose.
// - Treat each <user_request> as a fresh task. Do not carry over architectural 
//   complexity from previous turns unless explicitly asked to modify existing features.
// <project_files>
// ${boilerplate}
// </project_files>
// <user_request>
// ${userTask}
// </user_request>
// `;
//     // 2. Set headers to allow streaming
//     res.setHeader('Content-Type', 'text/plain; charset=utf-8');
//     res.setHeader('Transfer-Encoding', 'chunked');
//     try {
//         const response = await callGeminiAndLog({
//             model: "gemini-3.5-flash",
//             input: [
//                 { type: "text", text: finalPrompt },
//             ],
//             system_instruction: getSystemPrompt(),
//             stream: true,
//         });
//         console.log("Stream object type:", typeof response);
//         // If this logs 'object' but you can't iterate over it, it might not be a standard AsyncIterable.
//         // 3. Pipe the stream directly to the response
//         for await (const event of (response as any)) {
//             console.log("Processing event type:", event.event_type); // Debugging line
//             console.log("event recieved:", event);
//             // 1. ADD THIS: Check for API-level errors
//             if (event.event_type === "error") {
//                 console.error("Gemini API stream error:", event.error);
//                 // Send the specific error message to the client
//                 // Write a JSON error message to the stream
//                 res.write(JSON.stringify({
//                     error: true,
//                     message: event.error.message || "Unknown API Error"
//                 }));
//                 break; // Stop the loop
//             }
//             if (event.event_type === "step.delta" && event.delta.type === "text") {
//                 res.write(event.delta.text);
//             }
//         }
//         console.log("Stream object received.");
//         console.log(response);
//     }
//     catch (error) {
//         console.error("Fatal Stream Exception:", error);
//         // Only attempt to set the status if headers haven't been sent yet
//         if (!res.headersSent) {
//             res.status(500).json({ error: "Internal Server Error" });
//         } else {
//             // Headers are already sent (we are in the middle of a stream),
//             // so we cannot change the status code to 500.
//             // We send a signal via the stream instead.
//             res.write(JSON.stringify({ error: true, message: "Stream interrupted due to server error" }));
//         }
//     } finally {
//         res.end(); // Always ensure the response is closed
//     }
// });
app.listen(PORT, () => {
    console.log(`Backend is running at http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map