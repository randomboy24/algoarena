"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle, XCircle } from "lucide-react";

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

  // Mock function to simulate test results
  const runTests = () => {
    // In real app, this would compare actual output with expected output
    setTestResults(testCases.map(() => Math.random() > 0.3));
  };

  return (
    <div className="h-full bg-[#1E2A3A] border-t border-[#374151] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#374151]">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-white hover:text-[#3B82F6] transition-colors"
        >
          <span className="text-sm font-medium">Test Cases</span>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={runTests}
          className="text-xs px-3 py-1 bg-[#0A1929] text-[#9CA3AF] hover:text-white rounded-lg border border-[#374151] hover:border-[#3B82F6] transition-colors"
        >
          Run Tests
        </button>
      </div>

      {/* Test Cases Content */}
      {isExpanded && (
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Test Case Tabs */}
          <div className="flex gap-1 px-4 py-2 border-b border-[#374151] overflow-x-auto scrollbar-thin scrollbar-thumb-[#374151]">
            {testCases.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveCase(idx)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  activeCase === idx
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

          {/* Test Case Details */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#6B7280]">
                  Input:
                </span>
                {testResults && (
                  <span
                    className={`text-xs font-medium ${testResults[activeCase] ? "text-emerald-500" : "text-rose-500"}`}
                  >
                    {testResults[activeCase] ? "Passed" : "Failed"}
                  </span>
                )}
              </div>
              <code className="block text-sm text-[#A78BFA] bg-[#0A1929] p-3 rounded-lg border border-[#374151] font-mono">
                {testCases[activeCase].input}
              </code>
            </div>
            <div>
              <span className="text-xs font-medium text-[#6B7280] block mb-2">
                Expected Output:
              </span>
              <code className="block text-sm text-[#FCD34D] bg-[#0A1929] p-3 rounded-lg border border-[#374151] font-mono">
                {testCases[activeCase].output}
              </code>
            </div>
            {testResults && (
              <div>
                <span className="text-xs font-medium text-[#6B7280] block mb-2">
                  Your Output:
                </span>
                <code
                  className={`block text-sm p-3 rounded-lg border font-mono ${
                    testResults[activeCase]
                      ? "text-[#10B981] bg-[#10B981]/10 border-emerald-500/20"
                      : "text-[#EF4444] bg-[#EF4444]/10 border-rose-500/20"
                  }`}
                >
                  {testResults[activeCase]
                    ? testCases[activeCase].output
                    : "null"}
                </code>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
