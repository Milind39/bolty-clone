"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Step, FileItem, StepType } from "@/types";
import axios from "axios";
import { BACKEND_URL } from "@/config";
import { StepsList } from "@/components/StepsList";
import { FileExplorer } from "@/components/FileExplorer";
import { TabView } from "@/components/TabView";
import { CodeEditor } from "@/components/CodeEditor";
import { parseXml } from "@/utils/steps";
import { toast } from "sonner";
import { parseBoltArtifacts } from "@/utils/parseBoltStream";
import { Terminal } from "@/components/Terminal";
import { buildFileTree } from "@/utils/buildFileTree";

export function Builder() {
  const router = useRouter();
  const isInitialized = useRef(false);
  const [prompt, setPrompt] = useState("");
  const [userPrompt, setUserPrompt] = useState("");
  const [llmMessages, setLlmMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [templateSet, setTemplateSet] = useState(false);
  const [files, setFiles] = useState<FileItem[]>([]);

  const [currentStep, setCurrentStep] = useState(1);
  // const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);

  const [activeTab, setActiveTab] = useState<"code" | "preview" | "terminal">(
    "code",
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Helper function to safely detect and throw API errors from stream text
  const checkForApiError = (text: string) => {
    try {
      if (text.includes("api_error") || text.includes("error")) {
        const firstBrace = text.indexOf("{");
        const lastBrace = text.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          const jsonStr = text.substring(firstBrace, lastBrace + 1);
          const parsed = JSON.parse(jsonStr);
          if (parsed.error?.code === "api_error" || parsed.error?.message) {
            throw new Error(parsed.error.message);
          }
        }
      }

      if (
        text.includes("gemini-3.5-flash is currently experiencing high demand")
      ) {
        throw Error(
          "gemini-3.5-flash is currently experiencing high demand, spikes in demand are usually temporary. Please try again later.",
        );
      }
    } catch (e: any) {
      if (
        e.message &&
        e.message !== "Unexpected token..." &&
        !e.message.includes("JSON")
      ) {
        throw e;
      }
    }
  };

  async function init() {
    const savedPrompt = localStorage.getItem("projectPrompt");
    const cachedTemplate = localStorage.getItem("cachedTemplate");
    const templateData = JSON.parse(
      localStorage.getItem("templateData") || "{}",
    );

    if (!savedPrompt || !templateData.uiPrompt) {
      router.push("/");
      return;
    }

    setPrompt(savedPrompt);
    setTemplateSet(true);

    let uiPrompt = "";

    if (cachedTemplate) {
      const data = JSON.parse(cachedTemplate);
      uiPrompt = data.uiPrompt;
      const parsedSteps = parseXml(uiPrompt);
      setSteps(parsedSteps.map((x: Step) => ({ ...x, status: "completed" })));

      // Populate file tree from cached template steps
      const flatCachedFiles = parsedSteps
        .filter((step) => step.type === StepType.CreateFile)
        .map((step) => ({
          path: step.path || "",
          content: step.code || "",
        }));

      if (flatCachedFiles.length > 0) {
        const treeFiles = buildFileTree(flatCachedFiles);
        setFiles(treeFiles);
        // ADD THIS LINE HERE:
        await syncFilesToBackend(flatCachedFiles);
      }
    } else {
      setLoading(true);
      try {
        const response = await axios.post(`${BACKEND_URL}/template`, {
          prompt: savedPrompt,
        });
        uiPrompt = response.data.uiPrompt;
        localStorage.setItem("cachedTemplate", JSON.stringify(response.data));
        const templateSteps = parseXml(uiPrompt);
        setSteps(templateSteps.map((x: Step) => ({ ...x, status: "pending" })));

        // --- ADD THIS BLOCK TO RENDER TEMPLATE FILES IMMEDIATELY ---
        const flatTemplateFiles = templateSteps
          .filter((step) => step.type === StepType.CreateFile)
          .map((step) => ({
            path: step.path || "",
            content: step.code || "",
          }));

        if (flatTemplateFiles.length > 0) {
          setFiles(buildFileTree(flatTemplateFiles));
        }

        const chatResponse = await fetch(`${BACKEND_URL}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: { userTask: savedPrompt, boilerplate: uiPrompt },
          }),
        });

        if (!chatResponse.ok) {
          throw new Error("Failed to communicate with chat server.");
        }

        if (!chatResponse.body) throw new Error("No response body");

        const reader = chatResponse.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = "";
        let accumulatedText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullResponse += chunk;
          accumulatedText += chunk;
          checkForApiError(fullResponse);
          // 2. Safely merge streamed chat files with existing root template files instead of overwriting them
          const { files: parsedFiles } = parseBoltArtifacts(accumulatedText);
          if (parsedFiles.length > 0) {
            setFiles((prevFiles) => {
              const existingFlat = flattenFiles(prevFiles);
              const fileMap = new Map(
                existingFlat.map((f) => [f.path, f.content]),
              );

              parsedFiles.forEach((pf) => {
                fileMap.set(pf.path, pf.content);
              });

              const mergedFlat = Array.from(fileMap.entries()).map(
                ([path, content]) => ({
                  path,
                  content,
                }),
              );
              return buildFileTree(mergedFlat);
            });
          }
        }

        checkForApiError(fullResponse);

        const newSteps = parseXml(fullResponse);
        setSteps((s) => [
          ...s,
          ...newSteps.map((x) => ({ ...x, status: "pending" as const })),
        ]);

        const flatFiles = newSteps
          .filter((step) => step.type === StepType.CreateFile)
          .map((step) => ({
            path: step.path || "",
            content: step.code || "",
          }));

        const treeFiles = buildFileTree(flatFiles);
        setFiles(treeFiles);

        await syncFilesToBackend(flatFiles);

        console.log(
          "Files are now synced inside the Docker container terminal workspace!",
        );

        setLlmMessages([
          { role: "user", content: savedPrompt },
          { role: "assistant", content: fullResponse },
        ]);
      } catch (err: any) {
        console.error("Initialization error:", err);
        toast.error(err.message || "An error occurred during initialization.");
      } finally {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    if (!isInitialized.current) {
      init();
      isInitialized.current = true;
    }
  }, []);

  const handleSendMessage = async () => {
    if (!userPrompt.trim()) return;

    setLoading(true);
    const userMsg = { role: "user" as const, content: userPrompt };
    setLlmMessages((prev) => [...prev, userMsg]);
    setUserPrompt("");

    try {
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: {
            userTask: userPrompt,
            boilerplate: localStorage.getItem("cachedTemplate")
              ? JSON.parse(localStorage.getItem("cachedTemplate")!).uiPrompt
              : "",
          },
        }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;
        accumulatedText += chunk;

        checkForApiError(fullResponse);

        const { files: parsedFiles } = parseBoltArtifacts(accumulatedText);

        if (parsedFiles.length > 0) {
          setFiles((prevFiles) => {
            // 1. Flatten current state to keep existing template/root files
            const existingFlat = flattenFiles(prevFiles);
            const fileMap = new Map(
              existingFlat.map((f) => [f.path, f.content]),
            );

            // 2. Insert or update newly streamed files
            parsedFiles.forEach((pf) => {
              fileMap.set(pf.path, pf.content);
            });

            // 3. Rebuild complete file tree map back
            const mergedFlat = Array.from(fileMap.entries()).map(
              ([path, content]) => ({
                path,
                content,
              }),
            );

            // ADD THIS SYNC CALL RIGHT HERE INSIDE THE STATE SETTER OR RIGHT AFTER:
            syncFilesToBackend(mergedFlat);
            return buildFileTree(mergedFlat);
          });
        }
      }

      checkForApiError(fullResponse);

      // if (typeof window.writeToTerminal === "function") {
      //   setTimeout(() => {
      //     window.writeToTerminal?.("\x1b[36m$ npm install\x1b[0m");
      //     window.writeToTerminal?.("packages installed successfully.");
      //   }, 500);

      //   setTimeout(() => {
      //     window.writeToTerminal?.("\x1b[36m$ npm run dev\x1b[0m");
      //     window.writeToTerminal?.(
      //       "> local dev server running on port 3000 🚀",
      //     );
      //   }, 1200);
      // }

      const newSteps = parseXml(fullResponse);
      setSteps((s) => [
        ...s,
        ...newSteps.map((x) => ({ ...x, status: "pending" as const })),
      ]);
    } catch (err: any) {
      console.error("Chat error:", err);
      toast.error(err.message || "An error occurred while generating changes.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to flatten the hierarchical tree back for ZIP downloads & flattening needs
  const flattenFiles = (
    nodeList: FileItem[],
  ): Array<{ path: string; content: string }> => {
    let acc: Array<{ path: string; content: string }> = [];
    nodeList.forEach((node) => {
      if (node.type === "file") {
        acc.push({ path: node.path, content: node.content || "" });
      }
      if (node.children && node.children.length > 0) {
        acc = acc.concat(flattenFiles(node.children));
      }
    });
    return acc;
  };

  // function that pushes your flat files to your backend whenever files change:

  async function syncFilesToBackend(
    flatFiles: Array<{ path: string; content: string }>,
  ) {
    try {
      await fetch("http://localhost:5000/api/save-files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: flatFiles }),
      });
    } catch (err) {
      console.error(
        "Failed to sync files to backend container workspace:",
        err,
      );
    }
  }

  // This function is triggered automatically when Vite outputs the local url
  const handleServerReady = (url: string) => {
    setPreviewUrl(url);
    // Optional: Automatically switch to the preview tab
    setActiveTab("preview");
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="flex-1 overflow-hidden grid grid-cols-4 gap-4 p-4">
        {/* <div className="col-span-1 space-y-6 overflow-auto">
          <StepsList
            steps={steps}
            currentStep={currentStep}
            onStepClick={setCurrentStep}
          />
          {!(loading || !templateSet) && (
            <div className="flex gap-2">
              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                placeholder="Ask changes..."
              />
              <button
                type="button"
                onClick={handleSendMessage}
                className="bg-purple-600 px-4 text-white rounded hover:bg-purple-500"
              >
                Send
              </button>
            </div>
          )}
        </div> */}
        <div className="col-span-1 bg-gray-900 rounded-lg overflow-hidden border h-[calc(100vh-6rem)] border-gray-800">
          <FileExplorer
            files={files}
            flatFiles={flattenFiles(files)}
            onFileSelect={setSelectedFile}
          />
        </div>
        <div className="col-span-3 bg-gray-900 p-4 h-[calc(100vh-6rem)] rounded-lg border border-gray-800 flex flex-col">
          <TabView activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="flex-1 overflow-hidden mt-2 flex flex-col gap-2">
            {activeTab === "code" ? (
              <>
                <div className="h-[100%] w-full overflow-hidden rounded border border-gray-800">
                  <CodeEditor file={selectedFile} />
                </div>
                <div className="h-[35%] w-full overflow-hidden rounded border border-gray-800">
                  {/* Pass the server ready handler here */}
                  <Terminal onServerReady={handleServerReady} />
                </div>
              </>
            ) : activeTab === "preview" ? (
              <iframe
                src={
                  previewUrl ||
                  `${window.location.protocol}//${window.location.hostname}:5173`
                }
                className="w-full h-full border-0 bg-white rounded"
                title="Live Preview"
              />
            ) : (
              <div className="h-full w-full">
                {/* Pass the server ready handler here too */}
                <Terminal onServerReady={handleServerReady} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
