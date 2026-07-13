"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner"; // 1. Import toast
import { BACKEND_URL } from "@/config";

export default function LandingPage() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error] = useState("");
  const router = useRouter();

  const heroStyle = {
    background:
      "linear-gradient(to bottom, #0a2342 0%, #102a43 35%, #020617 100%)",
    backgroundColor: "#020617",
    position: "relative" as const,
    minHeight: "100vh",
    width: "100vw",
    overflow: "hidden",
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!prompt.trim()) {
      toast.error("Input required", {
        description: "Please enter a project description before continuing.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${BACKEND_URL}/template`, {
        prompt: prompt.trim(),
      });

      // Save to localStorage so Builder can read it
      localStorage.setItem("projectPrompt", prompt.trim());
      localStorage.setItem("projectType", JSON.stringify(response.data));

      // Show success toast
      toast.success("Project template created!", {
        description: "Navigating to the builder...",
      });

      router.push(`/Builder?prompt=${encodeURIComponent(prompt.trim())}`);
    } catch (err) {
      console.error("Error submitting prompt:", err);
      // Show error toast
      toast.error("Something went wrong", {
        description: "Token limit exceeded, Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      className="relative flex flex-col items-center justify-center max-h-screen max-w-screen px-0 py-0 overflow-hidden"
      style={heroStyle}
    >
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
              className="w-full sm:w-2/3 px-6 py-4 rounded-full border border-gray-300 shadow focus:outline-none focus:ring-3 focus:ring-blue-400 text-lg bg-white/55 backdrop-blur-3xl text-gray-900 placeholder:text-gray-900 placeholder:text-xl font-semibold"
              disabled={isLoading}
            />
            <button
              type="submit"
              className={`bg-blue-600/80 text-white font-semibold rounded-full px-8 py-4 text-lg shadow hover:bg-blue-700/90 transition backdrop-blur-3xl ${
                isLoading ? "cursor-not-allowed" : ""
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
    </main>
  );
}
