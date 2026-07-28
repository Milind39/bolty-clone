"use client";
import React, { useEffect, useRef } from "react";
import { Terminal as XTerminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { io, Socket } from "socket.io-client";
import "xterm/css/xterm.css";

export function Terminal() {
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
    });

    term.onData((data) => {
      socket.emit("terminal:input", data);
    });

    return () => {
      clearTimeout(timer);
      socket.disconnect();
      term.dispose();
      isInitialized.current = false;
    };
  }, []);

  return <div ref={terminalRef} className="h-full w-full p-2 bg-[#090d16]" />;
}
