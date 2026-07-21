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
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);

  // Helper function to safely detect and throw API errors from stream text
  const checkForApiError = (text: string) => {
    try {
      // Check if text contains JSON or partial JSON with api_error
      if (text.includes("api_error") || text.includes("error")) {
        // Attempt to extract JSON substring if embedded in logs/stream
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

      // Fallback text check
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
      setSteps(
        parseXml(uiPrompt).map((x: Step) => ({ ...x, status: "completed" })),
      );
    } else {
      setLoading(true);
      try {
        const response = await axios.post(`${BACKEND_URL}/template`, {
          prompt: savedPrompt,
        });
        uiPrompt = response.data.uiPrompt;
        localStorage.setItem("cachedTemplate", JSON.stringify(response.data));
        setSteps(
          parseXml(uiPrompt).map((x: Step) => ({ ...x, status: "pending" })),
        );

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

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullResponse += chunk;
          checkForApiError(fullResponse);
        }

        checkForApiError(fullResponse);

        const newSteps = parseXml(fullResponse);
        setSteps((s) => [
          ...s,
          ...newSteps.map((x) => ({ ...x, status: "pending" as const })),
        ]);

        const newFiles: FileItem[] = newSteps
          .filter((step) => step.type === StepType.CreateFile)
          .map((step) => ({
            name: step.path?.split("/").pop() || "file",
            path: step.path || "",
            type: "file" as const,
            content: step.code || "",
          }));

        setFiles(newFiles);
        if (newFiles.length > 0) setSelectedFile(newFiles[0]);

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

        // Check for api error on every chunk stream arrival
        checkForApiError(fullResponse);

        const { files: parsedFiles } = parseBoltArtifacts(accumulatedText);

        if (parsedFiles.length > 0) {
          const mappedFiles: FileItem[] = parsedFiles.map((pf) => ({
            name: pf.path.split("/").pop() || "file",
            path: pf.path,
            type: "file",
            content: pf.content,
          }));
          setFiles(mappedFiles);
        }
      }

      checkForApiError(fullResponse);

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

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="flex-1 overflow-hidden grid grid-cols-4 gap-6 p-6">
        <div className="col-span-1 space-y-6 overflow-auto">
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
        </div>
        <div className="col-span-1 bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
          <FileExplorer files={files} onFileSelect={setSelectedFile} />
        </div>
        <div className="col-span-2 bg-gray-900 p-4 h-[calc(100vh-8rem)] rounded-lg border border-gray-800 flex flex-col">
          <TabView activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="flex-1 overflow-hidden mt-2">
            {activeTab === "code" ? (
              <CodeEditor file={selectedFile} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Preview disabled (WebContainer removed)
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
