"use client";

interface TestResult {
  testCaseId: string;
  testCaseInput: string;
  testCaseOutput: string;
  actualOutput: string;
  passed: boolean;
  errorMessage?: string;
}

interface SubmissionData {
  status: "PASSED" | "FAILED";
  type: "RUN" | "SUBMIT";
  testResults?: TestResult[];
  executionTimeMs?: number;
  memoryUsedMb?: number;
}

interface SubmissionResultsPanelProps {
  submission: SubmissionData;
  submissionType: "RUN" | "SUBMIT";
}

export default function SubmissionResultsPanel({
  submission,
  submissionType,
}: SubmissionResultsPanelProps) {
  if (!submission.testResults || submission.testResults.length === 0) {
    // All tests passed, show summary only
    if (submission.status === "PASSED") {
      return (
        <div className="space-y-4">
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
            <p className="text-sm text-emerald-300">
              All {submissionType === "RUN" ? "sample" : ""} test cases passed!
            </p>
          </div>

          {submission.executionTimeMs !== undefined && (
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-[#0F2235] p-4 border border-[#1E2A3A]">
                <p className="text-xs text-[#64748B] mb-1">
                  Avg Execution Time
                </p>
                <p className="text-lg font-semibold text-white">
                  {submission.executionTimeMs}ms
                </p>
              </div>
              {submission.memoryUsedMb !== undefined && (
                <div className="rounded-lg bg-[#0F2235] p-4 border border-[#1E2A3A]">
                  <p className="text-xs text-[#64748B] mb-1">Memory Used</p>
                  <p className="text-lg font-semibold text-white">
                    {submission.memoryUsedMb.toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
  }

  // Show detailed test results
  const failedTests = submission.testResults?.filter((t) => !t.passed) || [];
  const passedTests = submission.testResults?.filter((t) => t.passed) || [];

  return (
    <div className="space-y-4">
      {/* Metrics */}
      {submission.executionTimeMs !== undefined && (
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-[#0F2235] p-4 border border-[#1E2A3A]">
            <p className="text-xs text-[#64748B] mb-1">Avg Execution Time</p>
            <p className="text-lg font-semibold text-white">
              {submission.executionTimeMs}ms
            </p>
          </div>
          {submission.memoryUsedMb !== undefined && (
            <div className="rounded-lg bg-[#0F2235] p-4 border border-[#1E2A3A]">
              <p className="text-xs text-[#64748B] mb-1">Memory Used</p>
              <p className="text-lg font-semibold text-white">
                {submission.memoryUsedMb.toFixed(2)} MB
              </p>
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      <div className="rounded-lg bg-[#0F2235] p-4 border border-[#1E2A3A]">
        <p className="text-sm text-[#94A3B8]">
          <span className="text-emerald-300 font-semibold">
            {passedTests.length}
          </span>{" "}
          passed,{" "}
          <span className="text-rose-300 font-semibold">
            {failedTests.length}
          </span>{" "}
          failed
        </p>
      </div>

      {/* Test Cases Table */}
      {submission.testResults && submission.testResults.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E2A3A]">
                <th className="text-left px-4 py-3 text-[#64748B] font-semibold">
                  Test Case
                </th>
                <th className="text-left px-4 py-3 text-[#64748B] font-semibold">
                  Input
                </th>
                <th className="text-left px-4 py-3 text-[#64748B] font-semibold">
                  Expected Output
                </th>
                <th className="text-left px-4 py-3 text-[#64748B] font-semibold">
                  Actual Output
                </th>
                <th className="text-left px-4 py-3 text-[#64748B] font-semibold">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {submission.testResults.map((testResult, index) => (
                <tr
                  key={testResult.testCaseId}
                  className={`border-b border-[#1E2A3A] ${
                    testResult.passed ? "bg-emerald-500/5" : "bg-rose-500/5"
                  }`}
                >
                  <td className="px-4 py-3 text-[#94A3B8] font-medium">
                    TC {index + 1}
                  </td>
                  <td className="px-4 py-3 text-[#E2E8F0] font-mono max-w-xs truncate">
                    {testResult.testCaseInput}
                  </td>
                  <td className="px-4 py-3 text-[#E2E8F0] font-mono max-w-xs truncate">
                    {testResult.testCaseOutput}
                  </td>
                  <td className="px-4 py-3 font-mono max-w-xs truncate">
                    {testResult.errorMessage ? (
                      <span className="text-rose-300">
                        {testResult.errorMessage}
                      </span>
                    ) : (
                      <span className="text-[#E2E8F0]">
                        {testResult.actualOutput}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {testResult.passed ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300">
                        ✓ Passed
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300">
                        ✗ Failed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
