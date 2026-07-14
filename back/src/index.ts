import genai = require("@google/genai");
import { BASE_PROMPT, getBaseProjectContext, getSystemPrompt } from "./prompts";
import { reactBasePrompt } from "./defaults/react";
import{ nodeBasePrompt } from "./defaults/node";
import express from "express";
import { callGeminiAndLog } from "./utility/loghelper";
require("dotenv").config();
import morgan from 'morgan';
import cors from 'cors';

// console.log(process.env.GEMENI_API_KEY);
const ApiKey = process.env.GEMENI_API_KEY || "" ;
const client = new genai.GoogleGenAI({apiKey: ApiKey});

const app = express();
app.use(express.json());
const PORT = 5000;
app.use(cors());
app.use(morgan("combined")) // This logs every single request automatically

let requestCount = 0; // Global counter

/*******************************template***********************/

app.post("/template", async(req, res) => {
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
            prompt: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
            uiPrompt: reactBasePrompt,
         });

    }
    else if (answer === "node") {
    
        res.json({
            prompt: `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
            uiPrompt: nodeBasePrompt
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
    try {
        const response = await callGeminiAndLog({
            model: "gemini-3.5-flash",
            input: [
                { type: "text", text: finalPrompt },
            ],
            system_instruction: getSystemPrompt(),
            stream: true,
        });

        console.log("Stream object type:", typeof response);
        // If this logs 'object' but you can't iterate over it, it might not be a standard AsyncIterable.


        // 3. Pipe the stream directly to the response
        for await (const event of (response as any)) {
            console.log("Processing event type:", event.event_type); // Debugging line
            console.log("event recieved:", event);
            // 1. ADD THIS: Check for API-level errors
            if (event.event_type === "error") {
                console.error("Gemini API stream error:", event.error);
                // Send the specific error message to the client
                // Write a JSON error message to the stream
                res.write(JSON.stringify({
                    error: true,
                    message: event.error.message || "Unknown API Error"
                }));
                break; // Stop the loop
            }
            if (event.event_type === "step.delta" && event.delta.type === "text") {
                res.write(event.delta.text);
            }
        }
        console.log("Stream object received.");
        console.log(response);
    }
    catch (error) {
        console.error("Fatal Stream Exception:", error);
    
        // Only attempt to set the status if headers haven't been sent yet
        if (!res.headersSent) {
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            // Headers are already sent (we are in the middle of a stream),
            // so we cannot change the status code to 500.
            // We send a signal via the stream instead.
            res.write(JSON.stringify({ error: true, message: "Stream interrupted due to server error" }));
        }
    } finally {
        res.end(); // Always ensure the response is closed
    }
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



