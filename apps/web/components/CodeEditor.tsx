"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Loader2, Play, RotateCcw } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

interface CodeEditorProps {
  template: string;
  problemId: string;
  contestId?: string;
}

export function CodeEditor({
  template,
  problemId,
  contestId,
}: CodeEditorProps) {
  const [code, setCode] = useState(template);
  const [language, setLanguage] = useState("javascript");
  const [isRunning, setIsRunning] = useState(false);
  const [resultDialog, setResultDialog] = useState<{
    status: "PASSED" | "FAILED";
    message: string;
  } | null>(null);
  const { userId, isLoaded } = useAuth();

  async function submitCode({
    type,
    code,
  }: {
    type: "RUN" | "SUBMIT";
    code: string;
  }) {
    if (!userId || !isLoaded) {
      console.log("user not ready");
      return;
    } else {
      console.log("user ready ", userId);
    }
    setIsRunning(true);
    setResultDialog(null);
    try {
      const response = await fetch("http://localhost:3000/api/v1/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code,
          language: "JAVASCRIPT",
          problemId: problemId,
          submittedBy: userId,
          contestId: contestId,
        }),
      });

      const jsonResponse = await response.json();
      console.log(jsonResponse);
      const submissionId = jsonResponse.submissionId;

      const interval = setInterval(async () => {
        const res = await fetch(
          `http://localhost:3000/api/v1/submissions/${submissionId}`,
          {
            method: "GET",
          },
        );

        const data = await res.json();

        console.log("status: ", data.status);
        console.log(data);

        if (data.status === "PASSED" || data.status === "FAILED") {
          clearInterval(interval);
          setIsRunning(false);
          setResultDialog({
            status: data.status,
            message:
              data.status === "PASSED"
                ? "Your code ran successfully."
                : "Your code failed. Please review and try again.",
          });
          console.log("final result: ", data);
        }
      }, 2000);
    } catch (error) {
      console.error(error);
      setIsRunning(false);
      setResultDialog({
        status: "FAILED",
        message: "Something went wrong while running your code.",
      });
    }
  }

  const handleRun = () => {
    console.log("Running code:", code);
    submitCode({ type: "RUN", code });
    // Implement code execution logic here
  };

  const handleReset = () => {
    setCode(template);
  };

  return (
    <div className="h-full flex flex-col bg-[#1E2A3A]">
      {resultDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-[90%] max-w-md rounded-xl border border-[#374151] bg-[#0A1929] p-6 text-white shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">
                  {resultDialog.status === "PASSED"
                    ? "Execution Successful"
                    : "Execution Failed"}
                </h2>
                <p className="mt-2 text-sm text-[#9CA3AF]">
                  {resultDialog.message}
                </p>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                  resultDialog.status === "PASSED"
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "bg-rose-500/15 text-rose-300"
                }`}
              >
                {resultDialog.status}
              </span>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setResultDialog(null)}
                className="px-4 py-2 text-sm font-medium text-white bg-[#3B82F6] rounded-lg hover:bg-[#2563EB] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
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
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-1.5 bg-[#3B82F6] text-white text-sm font-medium rounded-lg hover:bg-[#2563EB] transition-colors disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Running
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run
              </>
            )}
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
