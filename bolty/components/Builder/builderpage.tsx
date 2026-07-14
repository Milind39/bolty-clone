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
import { parseXml } from "@/steps";
import { WebContainer } from "@webcontainer/api";

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

    console.log("DEBUG: savedPrompt:", savedPrompt);
    console.log("DEBUG: templateData:", templateData);

    console.log("DEBUG: Checking guard clause...");
    if (!savedPrompt || !templateData.uiPrompt) {
      console.log("DEBUG: Guard clause triggered! Redirecting...");
      router.push("/");
      return;
    }
    console.log("DEBUG: Guard clause passed.");

    setPrompt(savedPrompt);
    setTemplateSet(true);

    let uiPrompt = "";

    // 2. Only fetch if not in cache
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
        console.log("Template response received:", response.data);
        if (!response.data || !response.data.uiPrompt) {
          console.error("CRITICAL: Backend did not return uiPrompt!");
          return;
        }
        uiPrompt = response.data.uiPrompt;
        localStorage.setItem("cachedTemplate", JSON.stringify(response.data));
        setSteps(
          parseXml(uiPrompt).map((x: Step) => ({ ...x, status: "pending" })),
        );

        // Follow up with chat
        const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
          prompt: {
            userTask: savedPrompt,
            boilerplate: uiPrompt,
          },
        });

        // Defensive check
        if (stepsResponse?.data?.response) {
          setSteps((s) => [
            ...s,
            ...parseXml(stepsResponse.data.response).map((x) => ({
              ...x,
              status: "pending" as const,
            })),
          ]);
        } else {
          console.error("Invalid response from /chat:", stepsResponse);
        }
        setLlmMessages([
          { role: "user", content: savedPrompt },
          { role: "assistant", content: stepsResponse.data.response },
        ]);
      } catch (err: any) {
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
  };

  // 3. User Interaction (Send Button)
  const handleSendMessage = async () => {
    if (!userPrompt.trim()) return;

    setLoading(true);
    const newMessage = { role: "user" as const, content: userPrompt };
    const updatedMessages = [...llmMessages, newMessage];

    // Retrieve the cached uiPrompt to serve as the boilerplate context
    const cachedTemplate = localStorage.getItem("cachedTemplate");
    const boilerplate = cachedTemplate
      ? JSON.parse(cachedTemplate).uiPrompt
      : "";

    setUserPrompt("");

    try {
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: {
            userTask: userPrompt,
            boilerplate: boilerplate,
          },
        }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;
      }

      setLlmMessages([
        ...updatedMessages,
        { role: "assistant", content: fullResponse },
      ]);

      setSteps((s) => [
        ...s,
        ...parseXml(fullResponse).map((x) => ({
          ...x,
          status: "pending" as const,
        })),
      ]);
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-100">Website Builder</h1>
        <p className="text-sm text-gray-400">Prompt: {prompt}</p>
      </header>

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
