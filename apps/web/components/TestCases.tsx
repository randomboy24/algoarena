"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";

interface TestCase {
  input: string;
  output: string;
}

interface TestCasesProps {
  testCases: TestCase[];
}

export function TestCases({ testCases }: TestCasesProps) {
  const [activeCase, setActiveCase] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);
  const [testResults, setTestResults] = useState<boolean[] | null>(null);
  const [showExpectedOutput, setShowExpectedOutput] = useState(true);

  useEffect(() => {
    if (activeCase >= testCases.length) {
      setActiveCase(0);
    }
  }, [activeCase, testCases.length]);

  const hasTestCases = testCases.length > 0;
  const safeActiveCase = hasTestCases ? activeCase : 0;

  return (
    <div className="h-full bg-[#1E2A3A] border-t border-[#374151] flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#374151]">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-white hover:text-[#3B82F6] transition-colors"
        >
          <span className="text-sm font-medium">Sample Tests</span>
          <span className="text-xs text-[#6B7280] bg-[#0A1929] px-2 py-0.5 rounded-full">
            {testCases.length}
          </span>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExpectedOutput(!showExpectedOutput)}
            className="p-1.5 text-[#6B7280] hover:text-[#9CA3AF] hover:bg-[#374151] rounded-lg transition-colors"
            title={showExpectedOutput ? "Hide expected output" : "Show expected output"}
          >
            {showExpectedOutput ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="flex-1 overflow-hidden flex flex-col">
          {!hasTestCases ? (
            <div className="flex-1 flex items-center justify-center px-4 text-center">
              <p className="text-sm text-[#94A3B8]">
                No sample test cases are available for this problem.
              </p>
            </div>
          ) : (
            <>
              <div className="flex gap-1 px-4 py-2 border-b border-[#374151] overflow-x-auto scrollbar-thin scrollbar-thumb-[#374151]">
                {testCases.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveCase(idx)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                      safeActiveCase === idx
                        ? "bg-[#3B82F6] text-white"
                        : "text-[#9CA3AF] hover:text-white hover:bg-[#374151]"
                    }`}
                  >
                    Case {idx + 1}
                    {testResults &&
                      (testResults[idx] ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-500" />
                      ))}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-[#6B7280]">
                      Input:
                    </span>
                    {testResults && (
                      <span
                        className={`text-xs font-medium ${testResults[safeActiveCase] ? "text-emerald-500" : "text-rose-500"}`}
                      >
                        {testResults[safeActiveCase] ? "Passed" : "Failed"}
                      </span>
                    )}
                  </div>
                  <code className="block text-sm text-[#A78BFA] bg-[#0A1929] p-3 rounded-lg border border-[#374151] font-mono">
                    {testCases[safeActiveCase].input}
                  </code>
                </div>
                {showExpectedOutput && (
                  <div>
                    <span className="text-xs font-medium text-[#6B7280] block mb-2">
                      Expected Output:
                    </span>
                    <code className="block text-sm text-[#FCD34D] bg-[#0A1929] p-3 rounded-lg border border-[#374151] font-mono">
                      {testCases[safeActiveCase].output}
                    </code>
                  </div>
                )}
                {testResults && (
                  <div>
                    <span className="text-xs font-medium text-[#6B7280] block mb-2">
                      Your Output:
                    </span>
                    <code
                      className={`block text-sm p-3 rounded-lg border font-mono ${
                        testResults[safeActiveCase]
                          ? "text-[#10B981] bg-[#10B981]/10 border-emerald-500/20"
                          : "text-[#EF4444] bg-[#EF4444]/10 border-rose-500/20"
                      }`}
                    >
                      {testResults[safeActiveCase]
                        ? testCases[safeActiveCase].output
                        : "null"}
                    </code>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
