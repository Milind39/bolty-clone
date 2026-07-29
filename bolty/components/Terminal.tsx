"use client";
import React, { useEffect, useRef } from "react";
import { Terminal as XTerminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { io, Socket } from "socket.io-client";
import "xterm/css/xterm.css";

interface TerminalProps {
  onServerReady?: (url: string) => void;
}

export function Terminal({ onServerReady }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Prevent double-initialization in React Strict Mode
    if (!terminalRef.current || isInitialized.current) return;
    isInitialized.current = true;

    const term = new XTerminal({
      cursorBlink: true,
      theme: {
        background: "#090d16",
        foreground: "#f8fafc",
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    // Ensure DOM is fully painted before opening Xterm
    const timer = setTimeout(() => {
      if (terminalRef.current) {
        term.open(terminalRef.current);
        try {
          fitAddon.fit();
        } catch (e) {
          console.error("Fit addon error:", e);
        }
      }
    }, 50);

    // Connect to backend Express / Socket.io server
    const socket = io("http://localhost:5000");
    socketRef.current = socket;

    socket.on("terminal:output", (data: string) => {
      term.write(data);

      // Check if the terminal output contains the Vite local server URL
      if (
        data.includes("http://localhost:3001") ||
        data.includes("http://127.0.0.1:3001")
      ) {
        if (onServerReady) {
          onServerReady("http://localhost:3001");
        }
      }
    }); // <-- Fixed syntax error here (removed rogue semicolon/brace)

    term.onData((data) => {
      socket.emit("terminal:input", data);
    });

    return () => {
      clearTimeout(timer);
      socket.disconnect();
      term.dispose();
      isInitialized.current = false;
    };
  }, [onServerReady]);

  return <div ref={terminalRef} className="h-full w-full p-2 bg-[#090d16]" />;
}
