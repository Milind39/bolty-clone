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

        setSteps((s) => [
          ...s,
          ...parseXml(stepsResponse.data.response).map((x) => ({
            ...x,
            status: "pending" as "pending",
          })),
        ]);
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
    if (!webcontainer || files.length === 0) return;

    const createMountStructure = (files: FileItem[]): Record<string, any> => {
      const mountStructure: Record<string, any> = {};
      const processFile = (file: FileItem, isRoot: boolean) => {
        if (file.type === "folder") {
          mountStructure[file.name] = {
            directory: file.children
              ? Object.fromEntries(
                  file.children.map((c) => [c.name, processFile(c, false)]),
                )
              : {},
          };
        } else {
          return { file: { contents: file.content || "" } };
        }
        return mountStructure[file.name];
      };
      files.forEach((f) => processFile(f, true));
      return mountStructure;
    };

    webcontainer.mount(createMountStructure(files));
  }, [files, webcontainer]);

  // 3. User Interaction (Send Button)
  const handleSendMessage = async () => {
    setLoading(true);
    const newMessage = { role: "user" as const, content: userPrompt };

    const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
      messages: [...llmMessages, newMessage],
    });

    setLoading(false);
    setLlmMessages([
      ...llmMessages,
      newMessage,
      { role: "assistant", content: stepsResponse.data.response },
    ]);
    setSteps((s) => [
      ...s,
      ...parseXml(stepsResponse.data.response).map((x) => ({
        ...x,
        status: "pending" as const,
      })),
    ]);
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
