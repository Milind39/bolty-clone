"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";

import { useWebContainer } from "@/hooks/useWebContainers";
import { FileItem, Step, StepType } from "@/types";
import { BACKEND_URL } from "@/config";
import { StepsList } from "@/components/StepsList";
import { Loader } from "@/components/Loader";
import { FileExplorer } from "@/components/FileExplorer";
import { TabView } from "@/components/TabView";
import { CodeEditor } from "@/components/CodeEditor";
import { PreviewFrame } from "@/components/PreviewFrame";

// Helper function to parse XML steps
function parseXml(xmlContent: string): Step[] {
  // Implement this function based on your XML structure
  // This is a placeholder that should be replaced with your actual parsing logic
  try {
    // Basic regex-based parsing (you may need more sophisticated parsing)
    const stepMatches = xmlContent.match(/<step[^>]*>[\s\S]*?<\/step>/g) || [];

    return stepMatches.map((stepStr, index) => {
      const typeMatch = stepStr.match(/type="([^"]+)"/);
      const pathMatch = stepStr.match(/path="([^"]+)"/);
      const codeMatch = stepStr.match(/<code>([\s\S]*?)<\/code>/);

      return {
        id: index,
        type: (typeMatch?.[1] as StepType) || StepType.CreateFile,
        path: pathMatch?.[1] || "",
        code: codeMatch?.[1] || "",
        status: "pending" as "pending" | "completed",
      };
    });
  } catch (error) {
    console.error("Error parsing XML steps:", error);
    return [];
  }
}

export default function Builder() {
  const searchParams = useSearchParams();
  const prompt = searchParams.get("prompt") || "";

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

  useEffect(() => {
    let originalFiles = [...files];
    let updateHappened = false;
    steps
      .filter(({ status }) => status === "pending")
      .map((step) => {
        updateHappened = true;
        if (step?.type === StepType.CreateFile) {
          let parsedPath = step.path?.split("/") ?? []; // ["src", "components", "App.tsx"]
          let currentFileStructure = [...originalFiles]; // {}
          let finalAnswerRef = currentFileStructure;

          let currentFolder = "";
          while (parsedPath.length) {
            currentFolder = `${currentFolder}/${parsedPath[0]}`;
            let currentFolderName = parsedPath[0];
            parsedPath = parsedPath.slice(1);

            if (!parsedPath.length) {
              // final file
              let file = currentFileStructure.find(
                (x) => x.path === currentFolder
              );
              if (!file) {
                currentFileStructure.push({
                  name: currentFolderName,
                  type: "file",
                  path: currentFolder,
                  content: step.code,
                });
              } else {
                file.content = step.code;
              }
            } else {
              /// in a folder
              let folder = currentFileStructure.find(
                (x) => x.path === currentFolder
              );
              if (!folder) {
                // create the folder
                currentFileStructure.push({
                  name: currentFolderName,
                  type: "folder",
                  path: currentFolder,
                  children: [],
                });
              }

              currentFileStructure = currentFileStructure.find(
                (x) => x.path === currentFolder
              )!.children!;
            }
          }
          originalFiles = finalAnswerRef;
        }
      });

    if (updateHappened) {
      setFiles(originalFiles);
      setSteps((steps) =>
        steps.map((s: Step) => {
          return {
            ...s,
            status: "completed",
          };
        })
      );
    }
    console.log(files);
  }, [steps, files]);

  useEffect(() => {
    const createMountStructure = (files: FileItem[]): Record<string, any> => {
      const mountStructure: Record<string, any> = {};

      const processFile = (file: FileItem, isRootFolder: boolean) => {
        if (file.type === "folder") {
          // For folders, create a directory entry
          mountStructure[file.name] = {
            directory: file.children
              ? Object.fromEntries(
                  file.children.map((child) => [
                    child.name,
                    processFile(child, false),
                  ])
                )
              : {},
          };
        } else if (file.type === "file") {
          if (isRootFolder) {
            mountStructure[file.name] = {
              file: {
                contents: file.content || "",
              },
            };
          } else {
            // For files, create a file entry with contents
            return {
              file: {
                contents: file.content || "",
              },
            };
          }
        }

        return mountStructure[file.name];
      };

      // Process each top-level file/folder
      files.forEach((file) => processFile(file, true));

      return mountStructure;
    };

    const mountStructure = createMountStructure(files);

    // Mount the structure if WebContainer is available
    console.log(mountStructure);
    webcontainer?.mount(mountStructure);
  }, [files, webcontainer]);

  async function init() {
    if (!prompt) return;

    setLoading(true);

    try {
      // 1️⃣ Call /template first
      const templateRes = await axios.post(`${BACKEND_URL}/template`, {
        prompt: prompt.trim(),
      });
      const { prompts, uiPrompts } = templateRes.data;

      setTemplateSet(true);

      setSteps(
        parseXml(uiPrompts[0]).map((x: Step) => ({
          ...x,
          status: "pending",
        }))
      );

      // 2️⃣ Stream /chat response
      const resp = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [...prompts, prompt].map((content) => ({
            role: "user",
            parts: [{ text: content }],
          })),
        }),
      });

      const reader = resp.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;

        // Optional: update UI live with streamed chunks
        setSteps((s) => [
          ...s,
          ...parseXml(chunk).map((x: Step) => ({
            ...x,
            status: "pending" as const,
          })),
        ]);
      }

      // Final assistant message
      setLlmMessages((msgs) => [
        ...msgs,
        { role: "assistant", content: fullText },
      ]);
    } catch (err) {
      console.error("init error:", err);
      setError("Something went wrong while streaming.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    init();
  }, [prompt]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-100">Website Builder</h1>
        <p className="text-sm text-gray-400 mt-1">Prompt: {prompt}</p>
      </header>

      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-4 gap-6 p-6">
          <div className="col-span-1 space-y-6 overflow-auto">
            <div>
              <div className="max-h-[75vh] overflow-scroll">
                <StepsList
                  steps={steps}
                  currentStep={currentStep}
                  onStepClick={setCurrentStep}
                />
              </div>
              <div>
                <div className="flex">
                  <br />
                  {(loading || !templateSet) && <Loader />}
                  {!(loading || !templateSet) && (
                    <div className="flex">
                      <textarea
                        value={userPrompt}
                        onChange={(e) => {
                          setUserPrompt(e.target.value);
                        }}
                        className="p-2 w-full"
                      ></textarea>
                      <button
                        onClick={async () => {
                          const newMessage = {
                            role: "user" as "user",
                            content: userPrompt,
                          };

                          setLoading(true);
                          const stepsResponse = await axios.post(
                            `${BACKEND_URL}/chat`,
                            {
                              messages: [...llmMessages, newMessage],
                            }
                          );
                          setLoading(false);

                          setLlmMessages((x) => [...x, newMessage]);
                          setLlmMessages((x) => [
                            ...x,
                            {
                              role: "assistant",
                              content: stepsResponse.data.response,
                            },
                          ]);

                          setSteps((s) => [
                            ...s,
                            ...parseXml(stepsResponse.data.response).map(
                              (x: Step) => ({
                                ...x,
                                status: "pending" as "pending",
                              })
                            ),
                          ]);

                          // Clear the prompt after sending
                          setUserPrompt("");
                        }}
                        className="bg-purple-400 px-4"
                      >
                        Send
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-1">
            <FileExplorer files={files} onFileSelect={setSelectedFile} />
          </div>
          <div className="col-span-2 bg-gray-900 rounded-lg shadow-lg p-4 h-[calc(100vh-8rem)]">
            <TabView activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="h-[calc(100%-4rem)]">
              {activeTab === "code" ? (
                <CodeEditor file={selectedFile} />
              ) : (
                <PreviewFrame webContainer={webcontainer} files={files} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
