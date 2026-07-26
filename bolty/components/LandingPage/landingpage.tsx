"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { BACKEND_URL } from "@/config";
import { Builder } from "../Builder/builderpage";
import Footer from "../Footer/footer";
import Pricing from "../Prising/Pricing";

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

      localStorage.setItem("projectPrompt", prompt.trim());
      localStorage.setItem("templateData", JSON.stringify(response.data));

      toast.success("Project template created!", {
        description: "Navigating to the builder...",
      });

      router.push(`/builder`);
    } catch (err) {
      console.error("Error submitting prompt:", err);
      toast.error("Something went wrong", {
        description: "Token limit exceeded, Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen w-full overflow-x-hidden text-white"
      style={heroStyle}
    >
      {/* Arched white line SVG background */}
      <svg
        className="absolute top-0 left-0 w-full h-[90vh] z-0 pointer-events-none"
        viewBox="0 0 1600 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
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

      {/* Hero Content Section */}
      <div className="relative z-10 min-h-screen container mx-auto px-auto pt-auto pb-auto flex flex-col items-center justify-center">
        <section className="w-full max-w-4xl text-center mb-auto mx-auto my-auto rounded-2xl p-6 container shadow-xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-14 tracking-tight drop-shadow-lg">
            What should we build today?
          </h1>
          <p className="text-lg sm:text-xl text-gray-200 mb-8 font-medium">
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
              className="w-full sm:w-2/3 px-6 py-4 rounded-full border border-gray-300 shadow focus:outline-none focus:ring-3 focus:ring-blue-400 text-lg bg-white/55 backdrop-blur-3xl text-gray-900 placeholder:text-gray-700 placeholder:text-lg font-semibold"
              disabled={isLoading}
            />
            <button
              type="submit"
              className={`bg-blue-600/80 text-white font-semibold rounded-full px-8 py-4 text-lg shadow hover:bg-blue-700/90 transition backdrop-blur-3xl whitespace-nowrap ${
                isLoading ? "cursor-not-allowed opacity-50" : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create"}
            </button>
          </form>

          <div className="flex flex-wrap gap-4 justify-center">
            <button
              type="button"
              onClick={() => setPrompt("")}
              className="bg-blue-600/80 text-white font-semibold rounded-full px-6 py-3 text-base shadow hover:bg-blue-700/90 transition backdrop-blur"
              disabled={isLoading}
            >
              Clear Input
            </button>
            <button
              type="button"
              className="bg-white/30 text-white font-semibold rounded-full px-6 py-3 text-base shadow hover:bg-white/40 transition backdrop-blur"
              disabled={isLoading}
            >
              Import from Figma
            </button>
            <button
              type="button"
              className="bg-white/30 text-white font-semibold rounded-full px-6 py-3 text-base shadow hover:bg-white/40 transition backdrop-blur"
              disabled={isLoading}
            >
              Import from Github
            </button>
          </div>
        </section>
      </div>

      {/* Pricing Section */}
      <section className="py-16 px-6 bg-indigo-50 text-black w-full">
        <h2 className="text-3xl font-bold text-center mb-12">
          Choose Your Plan
        </h2>
        <div className="max-w-4xl mx-auto rounded-xl">
          <Pricing />
        </div>
      </section>

      <Footer />
    </main>
  );
}
