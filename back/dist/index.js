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
require("dotenv").config();
// console.log(process.env.GEMENI_API_KEY);
const ApiKey = process.env.GEMENI_API_KEY || "";
const client = new genai.GoogleGenAI({ apiKey: ApiKey });
const app = (0, express_1.default)();
app.use(express_1.default.json());
const PORT = 5000;
const cors = require('cors');
app.use(cors());
/*******************************template***********************/
app.post("/template", async (req, res) => {
    const prompt = req.body.prompt;
    /*****************Below we ask whether its react or node to llm ********************/
    const response = await client.interactions.create({
        model: "gemini-3.5-flash",
        input: [
            { type: "text", text: prompt },
        ],
        system_instruction: "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra",
    });
    console.log(response);
    const answer = response.output_text?.trim().toLowerCase(); // either react or node
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
    // FIX: Destructure from req.body, not req.body.prompt
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
${boilerplate}
</project_files>

<user_request>
${userTask}
</user_request>
`;
    // 2. Set headers to allow streaming
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    const response = await client.interactions.create({
        model: "gemini-3.5-flash",
        input: [
            { type: "text", text: finalPrompt },
        ],
        system_instruction: (0, prompts_1.getSystemPrompt)(),
        stream: true,
    });
    // 3. Pipe the stream directly to the response
    for await (const event of response) {
        if (event.event_type === "step.delta" && event.delta.type === "text") {
            res.write(event.delta.text);
        }
    }
    console.log("Stream object received.");
    console.log(response);
    res.json({});
    res.end(); // IMPORTANT: Close the response after streaming finishes
});
app.listen(PORT, () => {
    console.log(`Backend is running at http://localhost:${PORT}`);
});
// async function main() {
/**************NON STREAMED OUTPUT**************/
// console.log("Stream initialized, waiting for response...");
// const response = await client.interactions.create({
//     model: "gemini-3.5-flash",
//     input: "Write a code for a todo application",
// });
// console.log(response.output_text);
/**************STREAMED OUTPUT**************/
//     try {
//         console.log("Stream initialized, waiting for response...");
//         const stream = await client.interactions.create({
//             model: "gemini-3.5-flash",
//             input: [
//                 { type: "text", text: "" },
//                 { type: "text", text: `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n` },
//                 { type: "text", text: "<running_commands>\n</running_commands>\n\n<bolt_file_modifications>\n<file path=\". gitignore\" type=\"removed\"></file>\n<file path=\"eslint.config.js\" type=\"removed\"></file>\n<file path=\"index.html\" type=\"removed\"></file>\n<file path=\"package-lock.json\" type=\"removed\"></file>\n<file path=\"package.json\" type=\"removed\"></file>\n<file path=\"postcss.config.js\" type=\"removed\"></file>\n<file path=\"tailwind.config.js\" type=\"removed\"></file>\n<file path=\"tsconfig.app.json\" type=\"removed\"></file>\n<file path=\"tsconfig.json\" type=\"removed\"></file>\n<file path=\"tsconfig.node.json\" type=\"removed\"></file>\n<file path=\"vite.config.ts\" type=\"removed\"></file>\n<file path=\". bolt/prompt\" type=\"removed\"></file>\n<file path=\"src/App.tsx\" type=\"removed\"></file>\n<file path=\"src/index.css\" type=\"removed\"></file>\n<file path=\"src/main.tsx\" type=\"removed\"></file>\n<file path=\"src/vite-env.d.ts\" type=\"removed\"></file>\n</bolt_file_modifications>\n\nCreate a todo app" },
//             ],
//             system_instruction: getSystemPrompt(),
//             stream: true,
//         });
// for await (const event of stream) {
//     if (event.event_type === "step.delta") {
//         if (event.delta.type === "text") {
//             process.stdout.write(event.delta.text);
//         }
//     }
// }
// console.log("Stream object received.");
//     }
//     catch (error) {
//     console.error("Error during interaction:", error);
// }
// }
// main();
//# sourceMappingURL=index.js.map