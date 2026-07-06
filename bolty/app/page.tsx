"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { BACKEND_URL } from "@/config";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!prompt.trim()) {
      setError("Please enter a project description");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // First, determine if it's a React or Node.js project
      const response = await axios.post(`${BACKEND_URL}/template`, {
        prompt: prompt.trim(),
      });

      // Store the prompts in localStorage for use in the Builder page
      localStorage.setItem("projectPrompt", prompt.trim());
      localStorage.setItem("projectType", JSON.stringify(response.data));

      // Navigate to the Builder page with the prompt
      router.push(`/Builder?prompt=${encodeURIComponent(prompt.trim())}`);
    } catch (err) {
      console.error("Error submitting prompt:", err);
      setError("Failed to process your request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen max-w-screen px-0 py-0 overflow-hidden">
      {/* Arched white line SVG background */}
      <svg
        className="absolute top-0 left-0 max-w-screen h-[90vh] z-0"
        viewBox="0 0 1600 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ pointerEvents: "none" }}
      >
        <path
          d="M0 545 Q800 0 1600 545"
          stroke="white"
          strokeWidth="12"
          filter="url(#glow)"
        />
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow
              dx="0"
              dy="-7"
              stdDeviation="12"
              floodColor="#2196f3"
              floodOpacity="1"
            />
          </filter>
        </defs>
      </svg>
      <div className="relative z-10 container mx-auto px-4 py-8">
        <section className="w-full max-w-fit text-center justify-center container mb-28 mt-[20px] mx-auto rounded-2xl shadow-xl text-white">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-lg">
            What should we build today?
          </h1>
          <p className="text-xl text-gray-200 mb-8 font-medium">
            Create stunning apps & websites by chatting with AI.
          </p>

          {error && (
            <div className="bg-red-500/50 text-white p-3 mb-4 rounded-lg backdrop-blur">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="w-full flex flex-col sm:flex-row gap-4 justify-center items-center mb-6"
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your project..."
              className="w-full sm:w-2/3 px-6 py-4 rounded-full border border-gray-300 shadow focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg bg-white/30 backdrop-blur-lg text-gray-900 placeholder:text-gray-700"
              disabled={isLoading}
            />
            <button
              type="submit"
              className={`bg-blue-600/80 text-white font-semibold rounded-full px-8 py-4 text-lg shadow hover:bg-blue-700/90 transition backdrop-blur ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create"}
            </button>
          </form>

          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => setPrompt("")}
              className="bg-blue-600/80 text-white font-semibold rounded-full px-8 py-3 text-lg shadow hover:bg-blue-700/90 transition backdrop-blur"
              disabled={isLoading}
            >
              Clear Input
            </button>
            <button
              className="bg-white/30 text-white font-semibold rounded-full px-8 py-3 text-lg shadow hover:bg-gray-200/40 transition backdrop-blur"
              disabled={isLoading}
            >
              Import from Figma
            </button>
            <button
              className="bg-white/30 text-white font-semibold rounded-full px-8 py-3 text-lg shadow hover:bg-gray-200/40 transition backdrop-blur"
              disabled={isLoading}
            >
              Import from Github
            </button>
          </div>
        </section>
      </div>

      <footer className="w-full text-center text-gray-300 text-sm pt-1">
        <hr className="border-gray-600 my-8" />© 2025 StackBlitz - All rights
        reserved.
      </footer>
    </main>
  );
}
