"use client";
import React, { useEffect, useRef } from "react";
import { Terminal as XTerminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { io, Socket } from "socket.io-client";
import "xterm/css/xterm.css";

export function Terminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new XTerminal({
      cursorBlink: true,
      theme: { background: "#090d16" },
    });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(terminalRef.current);
    fitAddon.fit();

    // Connect to your backend container gateway
    const socket = io("http://localhost:4001");
    socketRef.current = socket;

    socket.on("terminal:output", (data) => {
      term.write(data);
    });

    term.onData((data) => {
      socket.emit("terminal:input", data);
    });

    return () => {
      socket.disconnect();
      term.dispose();
    };
  }, []);

  return <div ref={terminalRef} className="h-full w-full p-2 bg-[#090d16]" />;
}
