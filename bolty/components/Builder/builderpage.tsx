"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation"; // Standardizing on Next.js Router
import { Step, FileItem, StepType } from "@/types";
import axios from "axios";
import { BACKEND_URL } from "@/config";
import { StepsList } from "@/components/StepsList";
import { Loader } from "@/components/Loader";
import { FileExplorer } from "@/components/FileExplorer";
import { TabView } from "@/components/TabView";
import { CodeEditor } from "@/components/CodeEditor";
import { PreviewFrame } from "@/components/PreviewFrame";
import { useWebContainer } from "@/hooks/useWebContainers";

import { WebContainer } from "@webcontainer/api";
import { parseXml } from "@/utils/steps";
import { toast } from "sonner";

export function Builder() {
  const router = useRouter();
  const isInitialized = useRef(false); // Prevents double-firing in Strict Mode
  const [prompt, setPrompt] = useState("");
  const [userPrompt, setUserPrompt] = useState("");
  const [llmMessages, setLlmMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [templateSet, setTemplateSet] = useState(false);

  const webcontainer = useWebContainer();
  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);

  // 1. Data Initialization
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
        // 1. Fetch Template
        const response = await axios.post(`${BACKEND_URL}/template`, {
          prompt: savedPrompt,
        });
        uiPrompt = response.data.uiPrompt;
        localStorage.setItem("cachedTemplate", JSON.stringify(response.data));
        setSteps(
          parseXml(uiPrompt).map((x: Step) => ({ ...x, status: "pending" })),
        );

        // 2. Fetch Chat via Stream
        const chatResponse = await fetch(`${BACKEND_URL}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: { userTask: savedPrompt, boilerplate: uiPrompt },
          }),
        });

        if (!chatResponse.body) throw new Error("No response body");

        const reader = chatResponse.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullResponse += decoder.decode(value, { stream: true });
        }

        // 3. Process the full XML response
        const newSteps = parseXml(fullResponse);
        setSteps((s) => [
          ...s,
          ...newSteps.map((x) => ({ ...x, status: "pending" as const })),
        ]);

        setLlmMessages([
          { role: "user", content: savedPrompt },
          { role: "assistant", content: fullResponse },
        ]);
      } catch (err: any) {
        console.error("Initialization error:", err);
        if (err.response?.status === 429) {
          alert("Rate limit exceeded. Please wait 1 minute before refreshing.");
        }
      } finally {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    console.log(
      "DEBUG: useEffect triggered. isInitialized:",
      isInitialized.current,
    );
    if (!isInitialized.current) {
      init();
      isInitialized.current = true;
    }
  }, []);
  // 2. File System Syncing (WebContainer Mount)
  useEffect(() => {
    if (!WebContainer || files.length === 0) return;

    const createMountStructure = (files: FileItem[]): any => {
      const mountStructure: any = {};

      files.forEach((file) => {
        if (file.type === "folder") {
          mountStructure[file.name] = {
            directory: file.children ? createMountStructure(file.children) : {},
          };
        } else {
          mountStructure[file.name] = {
            file: {
              contents: file.content || "",
            },
          };
        }
      });

      return mountStructure;
    };
    const webcontainer = useWebContainer();
    // Now 'webcontainer' refers to the actual instance returned by the hook
    if (!webcontainer || files.length === 0) return;

    webcontainer.mount(createMountStructure(files));
  }, [files, webcontainer]);

  // Simple helper for logging
  const trackRequest = () => {
    const count = parseInt(localStorage.getItem("req_count") || "0") + 1;
    localStorage.setItem("req_count", count.toString());
    console.log(`Total frontend requests: ${count}`);

    // Warn the user when they are getting close to the limit
    if (count >= 18) {
      console.warn("You are approaching your free tier limit!");
    }
  };

  // 3. User Interaction (Send Button)
  const handleSendMessage = async () => {
    trackRequest();
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

      if (!response.ok) {
        const errorData = await response.json();
        // TRIGGER THE TOAST HERE
        if (errorData.code === "too_many_requests") {
          toast.warning("Rate limit reached", {
            description:
              "You've hit the free tier limit. Please wait about a minute before trying again.",
          });
        }
        return;
      }
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;

        // IF STREAMING ERROR:
        // When you detect the error chunk in your while loop:
        if (fullResponse.includes("high demand")) {
          toast.error("Capacity Limit Reached", {
            description:
              "Gemini is experiencing high demand. Please try again in a moment.",
          });
          return;
        }
        // Check if backend sent an error signal
        if (chunk.includes("error")) {
          console.error("Stream reported error:", chunk);
          throw new Error("AI Service is currently busy. Please try again.");
        }
      }

      // Process final response
      const newSteps = parseXml(fullResponse);
      setSteps((s) => [
        ...s,
        ...newSteps.map((x) => ({ ...x, status: "pending" as const })),
      ]);
      setLlmMessages((prev) => [
        ...prev,
        { role: "assistant", content: fullResponse },
      ]);

      // Update Files
      const newFiles = newSteps
        .filter((step) => step.type === StepType.CreateFile)
        .map((step) => ({
          name: step.path?.split("/").pop() || "file",
          path: step.path || "",
          type: "file" as const,
          content: step.code || "",
        }));

      setFiles((prev) => {
        const map = new Map(prev.map((f) => [f.path, f]));
        newFiles.forEach((f) => map.set(f.path, f));
        return Array.from(map.values());
      });
    } catch (err: any) {
      console.error("Chat error:", err);
      alert(err.message || "An error occurred while processing your request.");
    } finally {
      setLoading(false);
    }
  };

  const heroStyle = {
    background:
      "linear-gradient(to bottom, #0a2342 0%, #102a43 35%, #020617 100%)",
    backgroundColor: "#020617",
    position: "relative" as const,
    minHeight: "100vh",
    width: "100vw",
    overflow: "hidden",
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col" style={heroStyle}>
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
                className="w-full p-2"
              />
              <button
                onClick={handleSendMessage}
                className="bg-purple-600 px-4 text-white"
              >
                Send
              </button>
            </div>
          )}
        </div>
        <div className="col-span-1">
          <FileExplorer files={files} onFileSelect={setSelectedFile} />
        </div>
        <div className="col-span-2 bg-gray-900 p-4 h-[calc(100vh-8rem)]">
          <TabView activeTab={activeTab} onTabChange={setActiveTab} />
          {activeTab === "code" ? (
            <CodeEditor file={selectedFile} />
          ) : (
            <PreviewFrame webContainer={webcontainer!} files={files} />
          )}
        </div>
      </div>
    </div>
  );
}
