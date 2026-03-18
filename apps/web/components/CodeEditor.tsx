"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Play, RotateCcw } from "lucide-react";

interface CodeEditorProps {
  template: string;
}

export function CodeEditor({ template }: CodeEditorProps) {
  const [code, setCode] = useState(template);
  const [language, setLanguage] = useState("javascript");

  const handleRun = () => {
    console.log("Running code:", code);
    // Implement code execution logic here
  };

  const handleReset = () => {
    setCode(template);
  };

  return (
    <div className="h-full flex flex-col bg-[#1E2A3A]">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#374151]">
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-[#0A1929] text-white text-sm rounded-lg px-3 py-1.5 border border-[#374151] focus:outline-none focus:border-[#3B82F6] transition-colors"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="p-1.5 text-[#6B7280] hover:text-[#9CA3AF] hover:bg-[#374151] rounded-lg transition-colors"
            title="Reset code"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleRun}
            className="flex items-center gap-2 px-4 py-1.5 bg-[#3B82F6] text-white text-sm font-medium rounded-lg hover:bg-[#2563EB] transition-colors"
          >
            <Play className="w-4 h-4" />
            Run
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={(value) => setCode(value || "")}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
            fontFamily: "'Fira Code', monospace",
            fontLigatures: true,
          }}
        />
      </div>
    </div>
  );
}
