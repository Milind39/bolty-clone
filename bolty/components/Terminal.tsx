"use client";
import React, { useEffect, useRef } from "react";
import { Terminal as XTerminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { socket } from "@/lib/socket"; // Import the shared singleton socket
import "xterm/css/xterm.css";

interface TerminalProps {
  onServerReady?: (url: string) => void;
}

export function Terminal({ onServerReady }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const termInstanceRef = useRef<XTerminal | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Clear any leftover canvas elements from previous unmounts
    terminalRef.current.innerHTML = "";

    const term = new XTerminal({
      cursorBlink: true,
      theme: {
        background: "#090d16",
        foreground: "#f8fafc",
      },
    });

    termInstanceRef.current = term;
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(terminalRef.current);

    // Slight delay to safely calculate dimensions post-paint
    const timer = setTimeout(() => {
      try {
        fitAddon.fit();
      } catch (e) {
        // Suppress fit race conditions safely
      }
    }, 100);

    // Use the shared global socket connection instead of spawning a new one
    const handleOutput = (data: string) => {
      term.write(data);

      if (
        data.includes("http://localhost:3001") ||
        data.includes("http://127.0.0.1:3001")
      ) {
        if (onServerReady) {
          onServerReady("http://localhost:3001");
        }
      }
    };

    socket.on("terminal:output", handleOutput);

    const handleData = (data: string) => {
      socket.emit("terminal:input", data);
    };

    term.onData(handleData);

    return () => {
      clearTimeout(timer);
      // Clean up event listeners so they don't stack up on re-renders,
      // but do NOT call socket.disconnect() so the connection stays alive globally.
      socket.off("terminal:output", handleOutput);
      term.dispose();
      termInstanceRef.current = null;
    };
  }, [onServerReady]);

  return (
    <div
      ref={terminalRef}
      className="h-full w-full p-2 bg-[#090d16] overflow-hidden"
    />
  );
}
