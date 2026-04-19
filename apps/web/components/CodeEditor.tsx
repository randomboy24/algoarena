"use client";

import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Loader2, Play, RotateCcw, Send } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import SubmissionResultsPanel from "./SubmissionResultsPanel";

interface CodeEditorProps {
  template: string;
  problemId: string;
  starterCodeJS?: string;
  starterCodePython?: string;
  contestId?: string;
}

interface SubmissionResult {
  status: "PASSED" | "FAILED";
  type: "RUN" | "SUBMIT";
  testResults?: Array<{
    testCaseId: string;
    testCaseInput: string;
    testCaseOutput: string;
    actualOutput: string;
    passed: boolean;
    errorMessage?: string;
  }>;
  executionTimeMs?: number;
  memoryUsedMb?: number;
}

export function CodeEditor({
  template,
  problemId,
  starterCodeJS = "",
  starterCodePython = "",
  contestId,
}: CodeEditorProps) {
  const [language, setLanguage] = useState<"javascript" | "python">(
    "javascript",
  );
  const [code, setCode] = useState(() => starterCodeJS || template);
  const [isRunning, setIsRunning] = useState(false);
  const [submissionResult, setSubmissionResult] =
    useState<SubmissionResult | null>(null);
  const [submissionType, setSubmissionType] = useState<"RUN" | "SUBMIT">("RUN");
  const { userId, isLoaded } = useAuth();

  // Update code when language changes - auto-swap to starter code
  const handleLanguageChange = (newLanguage: "javascript" | "python") => {
    setLanguage(newLanguage);
    if (newLanguage === "javascript") {
      setCode(starterCodeJS || template);
    } else {
      setCode(starterCodePython || template);
    }
  };

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
    }

    setIsRunning(true);
    setSubmissionResult(null);
    setSubmissionType(type);

    try {
      // Convert language to uppercase for API
      const languageEnum = language === "javascript" ? "JAVASCRIPT" : "PYTHON";

      const response = await fetch("http://localhost:3000/api/v1/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code,
          language: languageEnum,
          problemId: problemId,
          submittedBy: userId,
          contestId: contestId,
          type: type,
        }),
      });

      const jsonResponse = await response.json();
      console.log(jsonResponse);
      const submissionId = jsonResponse.submissionId;

      // Poll for results
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
          setSubmissionResult({
            status: data.status,
            type: data.type || type,
            testResults: data.testResults,
            executionTimeMs: data.executionTimeMs,
            memoryUsedMb: data.memoryUsedMb,
          });
          console.log("final result: ", data);
        }
      }, 2000);
    } catch (error) {
      console.error(error);
      setIsRunning(false);
      setSubmissionResult({
        status: "FAILED",
        type: type,
      });
    }
  }

  const handleRun = () => {
    console.log("Running code:", code);
    submitCode({ type: "RUN", code });
  };

  const handleSubmit = () => {
    console.log("Submitting code:", code);
    submitCode({ type: "SUBMIT", code });
  };

  const handleReset = () => {
    if (language === "javascript") {
      setCode(starterCodeJS || template);
    } else {
      setCode(starterCodePython || template);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#1E2A3A]">
      {submissionResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-[90%] max-w-2xl max-h-[80vh] rounded-xl border border-[#374151] bg-[#0A1929] p-6 text-white shadow-xl overflow-auto">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-semibold">
                  {submissionResult.status === "PASSED"
                    ? "Execution Successful"
                    : "Execution Failed"}
                </h2>
                <p className="text-xs text-[#64748B] mt-1">
                  {submissionResult.type === "RUN"
                    ? "Sample Test Results"
                    : "Full Test Results"}
                </p>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                  submissionResult.status === "PASSED"
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "bg-rose-500/15 text-rose-300"
                }`}
              >
                {submissionResult.status}
              </span>
            </div>

            <SubmissionResultsPanel
              submission={submissionResult}
              submissionType={submissionResult.type}
            />

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSubmissionResult(null)}
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
            onChange={(e) =>
              handleLanguageChange(e.target.value as "javascript" | "python")
            }
            className="bg-[#0A1929] text-white text-sm rounded-lg px-3 py-1.5 border border-[#374151] focus:outline-none focus:border-[#3B82F6] transition-colors"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
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
            className="flex items-center gap-2 px-4 py-1.5 bg-[#10B981] text-white text-sm font-medium rounded-lg hover:bg-[#059669] transition-colors disabled:cursor-not-allowed disabled:opacity-70"
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
          <button
            onClick={handleSubmit}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-1.5 bg-[#3B82F6] text-white text-sm font-medium rounded-lg hover:bg-[#2563EB] transition-colors disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit
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
