import express, { Application, Request, Response } from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import Docker from "dockerode";
import cors from "cors";
import path from "path";
import fs from "fs";
import morgan from "morgan";
import { BASE_PROMPT, getSystemPrompt } from "./prompts";
import { reactBasePrompt } from "./defaults/react";
import { nodeBasePrompt } from "./defaults/node";
import { callGeminiAndLog } from "./utility/loghelper";

const app: Application = express();
app.use(cors());
app.use(express.json());
app.use(cors());
app.use(morgan("combined")) // This logs every single request automatically
let requestCount = 0; // Global counter



const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});
const ApiKey = process.env.GEMENI_API_KEY || "" ;


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



/**********************chat***********************/


// app.post("/chat", async (req, res) => {
//     requestCount++;
//     console.log(`[REQUEST #${requestCount}] Received at ${new Date().toISOString()}`);

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
// ${boilerplate || ""}
// </project_files>

// <user_request>
// ${userTask}
// </user_request>
// `;
    
//     // Set headers to allow streaming chunks
//     res.setHeader('Content-Type', 'text/plain; charset=utf-8');
//     res.setHeader('Transfer-Encoding', 'chunked');

//     try {
//         const response = await callGeminiAndLog({
//             model: "gemini-3.5-flash", // Updated to standard Gemini flash model syntax
//             input: [
//                 { type: "text", text: finalPrompt },
//             ],
//             system_instruction: typeof getSystemPrompt === "function" ? getSystemPrompt() : "You are a helpful coding assistant.",
//             stream: true,
//         });

//         console.log("Stream object type:", typeof response);

//         // Pipe the stream events directly to the HTTP response
//         for await (const event of (response as any)) {
//             console.log("Processing event type:", event.event_type);

//             // Check for API-level errors inside the event stream
//             if (event.event_type === "error") {
//                 console.error("Gemini API stream error:", event.error);
//                 res.write(JSON.stringify({
//                     error: true,
//                     message: event.error?.message || "Unknown API Error"
//                 }));
//                 break;
//             }

//             // Extract text chunks from the delta structure
//             if (event.event_type === "step.delta" && event.delta?.type === "text") {
//                 res.write(event.delta.text);
//             }
//             // Fallback check if your wrapper uses standard text content deltas
//             else if (event.text) {
//                 res.write(event.text);
//             }
//         }
//         console.log("Stream successfully completed and sent.");
//     }
//     catch (error: any) {
//         console.error("Fatal Stream Exception:", error);
    
//         // If headers haven't gone out yet, send standard JSON error code
//         if (!res.headersSent) {
//             res.status(500).json({ error: "Internal Server Error", message: error.message });
//         } else {
//             // Headers already sent (mid-stream), communicate failure over the stream payload
//             res.write(JSON.stringify({ error: true, message: "Stream interrupted due to server error" }));
//         }
//     }
//     finally {
//         res.end(); // Always close the HTTP connection
//     }
// });


/****************************MOCK RESPONSE******************* */

app.post("/chat", async (req, res) => {
    requestCount++;
    console.log(`[REQUEST #${requestCount}] Received at ${new Date().toISOString()}`);


    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Your dummy response formatted with the Bolt artifact/action tags or step XML
const dummyXmlResponse = `
<boltArtifact id="project-import" title="Mock Project Setup">
  <boltAction type="file" filePath="package.json">
{
  "name": "mock-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.3.4"
  }
}
  </boltAction>
  <boltAction type="file" filePath="vite.config.ts">
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3001
  }
});
  </boltAction>
  <boltAction type="file" filePath="index.html">
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Mock App Preview</title>
  </head>
  <body class="bg-slate-950 text-white">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
  </boltAction>
  <boltAction type="file" filePath="src/main.tsx">
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
  </boltAction>
  <boltAction type="file" filePath="src/App.tsx">
import React from 'react';

export default function App() {
  return (
    <div className="flex items-center justify-center h-screen bg-slate-900">
      <div className="p-8 rounded-xl bg-slate-800 border border-slate-700 shadow-2xl text-center">
        <h1 className="text-3xl font-bold text-emerald-400 mb-2">🚀 Preview Works!</h1>
        <p className="text-slate-300">Your mock Vite + React app is successfully running inside Docker.</p>
      </div>
    </div>
  );
}
  </boltAction>
</boltArtifact>
`.trim();

    try {
        // Simulate streaming chunk-by-chunk with a slight delay
        const chunkSize = 15; // characters per chunk
        for (let i = 0; i < dummyXmlResponse.length; i += chunkSize) {
            const chunk = dummyXmlResponse.slice(i, i + chunkSize);
            res.write(chunk);
            // Wait 50ms to realistically simulate network token streaming
            await new Promise((resolve) => setTimeout(resolve, 50));
        }
    } catch (error) {
        console.error("Mock stream error:", error);
    } finally {
        res.end();
    }
});


/*********************Docker***********************/


const docker = new Docker(); // Automatically connects to your running Docker Desktop
const WORKSPACE_DIR = path.resolve("./workspace");

// Ensure workspace directory exists
if (!fs.existsSync(WORKSPACE_DIR)) {
  fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
}

// 1. Endpoint to receive and write code files generated by your frontend/LLM
app.post("/api/save-files", (req: Request, res: Response) => {
  try {
    const { files } = req.body; // Expects an array: [{ path: "src/App.tsx", content: "..." }]
    if (!Array.isArray(files)) {
      return res.status(400).json({ error: "Invalid files format" });
    }

    files.forEach((file) => {
      const fullPath = path.join(WORKSPACE_DIR, file.path);
      const dirName = path.dirname(fullPath);
      
      if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName, { recursive: true });
      }
      fs.writeFileSync(fullPath, file.content, "utf-8");
    });

    res.json({ success: true, message: "Files written to Docker workspace" });
  } catch (err: any) {
    console.error("Error writing files:", err);
    res.status(500).json({ error: err.message });
  }
});

// Track active containers per socket or globally for this clone demo
let globalContainer: Docker.Container | null = null;


// 2. WebSocket handler to spawn and stream a Docker container terminal
io.on("connection", async (socket: Socket) => {
  console.log(`Client connected: ${socket.id}`);

  if (!globalContainer)
    try {
      // Pull or use node:18-alpine, create container, map workspace folder, and expose port 3000
      globalContainer = await docker.createContainer({
        Image: "node:18-alpine",
        Cmd: ["sh"],
        Tty: true,
        OpenStdin: true,
        StdinOnce: false,
        WorkingDir: "/app",
        HostConfig: {
          Binds: [`${WORKSPACE_DIR}:/app`],
          PortBindings: {
            "3000/tcp": [{ HostPort: "3001" }]
          }
        },
        ExposedPorts: {
          "3000/tcp": {}
        }
      });

      await globalContainer.start();
      console.log(`Docker container started: ${globalContainer.id.substring(0, 12)}`);

      // Use docker exec stream for reliable interactive shell input/output piping
      const exec = await globalContainer.exec({
        Cmd: ["sh"],
        AttachStdin: true,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
      });

      const execStream = await exec.start({
        hijack: true,
        stdin: true,
      });
      // Stream container shell output to frontend Xterm terminal
      execStream.on("data", (chunk: Buffer) => {
        socket.emit("terminal:output", chunk.toString());
      });

      // Receive keystrokes/commands from frontend terminal and pass to container
      socket.on("terminal:input", (input: string) => {
        execStream.write(input);
      });

      // // Destroy container when user closes session or disconnects
      // socket.on("disconnect", async () => {
      //   if (globalContainer) {
      //     try {
      //       await globalContainer.stop();
      //       await globalContainer.remove();
      //       console.log("Container stopped and cleaned up.");
      //     } catch (e) {
      //       console.error("Cleanup error:", e);
      //     }
      //   }
      // });
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id} (Container persistent)`);
    });

  } catch (err: any) {
    console.error("Docker container error:", err);
    socket.emit("terminal:output", "\r\n[Error]: Failed to start Docker container. Ensure Docker Desktop is running.\r\n");
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Docker Terminal backend running on http://localhost:${PORT}`);
});