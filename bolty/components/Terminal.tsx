"use client";
import React, { useEffect, useRef } from "react";
import { Terminal as XtermTerminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

// Declare global type helper so parent components can push logs
declare global {
  interface Window {
    writeToTerminal?: (text: string) => void;
  }
}

export function Terminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<XtermTerminal | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new XtermTerminal({
      cursorBlink: true,
      theme: {
        background: "#030712",
        foreground: "#f3f4f6",
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(terminalRef.current);
    fitAddon.fit();
    termRef.current = term;

    term.writeln(
      "\x1b[32m✔ Terminal initialized. Ready for project commands...\x1b[0m",
    );

    // Expose a global or ref handler to write logs from outside
    window.writeToTerminal = (msg: string) => {
      term.writeln(msg);
    };

    return () => {
      window.writeToTerminal = undefined;
      term.dispose();
    };
  }, []);

  return (
    <div ref={terminalRef} className="h-full w-full p-2 bg-gray-950 rounded" />
  );
}
