"use client";

import { formatInputForDisplay } from "../lib/formatInput";

interface TestResult {
  testCaseId: string;
  testCaseNumber?: number;
  testCaseInput?: string;
  testCaseOutput?: string;
  actualOutput?: string;
  passed: boolean;
  errorMessage?: string;
  detailsHidden?: boolean;
}

interface SubmissionData {
  id?: string;
  status: "PASSED" | "FAILED";
  type: "RUN" | "SUBMIT";
  language?: "JAVASCRIPT" | "PYTHON";
  createdAt?: string;
  code?: string;
  user?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
  testResults?: TestResult[];
  passedTestCount?: number;
  totalTestCount?: number;
  failedTestCount?: number;
  executionTimeMs?: number;
  memoryUsedMb?: number;
}

interface SubmissionResultsPanelProps {
  submission: SubmissionData;
  submissionType: "RUN" | "SUBMIT";
}

function formatDateTime(value?: string) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function getDisplayName(user: SubmissionData["user"]) {
  if (!user) return "-";
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || user.id;
}

function getLanguageLabel(language?: SubmissionData["language"]) {
  if (language === "JAVASCRIPT") return "JavaScript";
  if (language === "PYTHON") return "Python";
  return "-";
}

export default function SubmissionResultsPanel({
  submission,
  submissionType,
}: SubmissionResultsPanelProps) {
  const testResults = submission.testResults || [];
  const passedCount =
    submission.passedTestCount ?? testResults.filter((t) => t.passed).length;
  const totalCount = submission.totalTestCount ?? testResults.length;
  const failedCount =
    submission.failedTestCount ?? Math.max(totalCount - passedCount, 0);
  const failedTests = testResults.filter((t) => !t.passed);
  const detailsHidden = submissionType === "SUBMIT";

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-lg bg-[#0F2235] p-4 border border-[#1E2A3A]">
          <p className="text-xs text-[#64748B] mb-1">Tests Passed</p>
          <p className="text-lg font-semibold text-white">
            {passedCount}/{totalCount || 0}
          </p>
        </div>
        <div className="rounded-lg bg-[#0F2235] p-4 border border-[#1E2A3A]">
          <p className="text-xs text-[#64748B] mb-1">Runtime</p>
          <p className="text-lg font-semibold text-white">
            {submission.executionTimeMs !== undefined
              ? submission.executionTimeMs + "ms"
              : "-"}
          </p>
        </div>
        <div className="rounded-lg bg-[#0F2235] p-4 border border-[#1E2A3A]">
          <p className="text-xs text-[#64748B] mb-1">Memory</p>
          <p className="text-lg font-semibold text-white">
            {submission.memoryUsedMb !== undefined
              ? submission.memoryUsedMb.toFixed(2) + " MB"
              : "-"}
          </p>
        </div>
        <div className="rounded-lg bg-[#0F2235] p-4 border border-[#1E2A3A]">
          <p className="text-xs text-[#64748B] mb-1">Language</p>
          <p className="text-lg font-semibold text-white">
            {getLanguageLabel(submission.language)}
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-[#0F2235] p-4 border border-[#1E2A3A]">
        <div className="grid gap-3 md:grid-cols-2 text-sm">
          <div>
            <p className="text-xs text-[#64748B] mb-1">Submission ID</p>
            <p className="font-mono text-[#E2E8F0] break-all">
              {submission.id || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#64748B] mb-1">Submitted By</p>
            <p className="text-[#E2E8F0]">{getDisplayName(submission.user)}</p>
          </div>
          <div>
            <p className="text-xs text-[#64748B] mb-1">Submitted At</p>
            <p className="text-[#E2E8F0]">
              {formatDateTime(submission.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#64748B] mb-1">Submission Type</p>
            <p className="text-[#E2E8F0]">
              {submissionType === "RUN" ? "Sample run" : "Full submit"}
            </p>
          </div>
        </div>
      </div>

      <div
        className={
          "rounded-lg border p-4 " +
          (submission.status === "PASSED"
            ? "border-emerald-500/30 bg-emerald-500/10"
            : "border-rose-500/30 bg-rose-500/10")
        }
      >
        <p
          className={
            "text-sm " +
            (submission.status === "PASSED"
              ? "text-emerald-300"
              : "text-rose-300")
          }
        >
          {submission.status === "PASSED"
            ? "All required test cases passed."
            : failedCount > 0
              ? failedCount +
                " test case" +
                (failedCount === 1 ? "" : "s") +
                " failed."
              : "The submission failed before test execution completed."}
        </p>
        {detailsHidden && failedCount > 0 && (
          <p className="text-xs text-[#94A3B8] mt-2">
            Hidden test inputs and expected outputs are not shown for full
            submissions.
          </p>
        )}
      </div>

      {failedTests.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-[#1E2A3A]">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E2A3A] bg-[#0B1B2D]">
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
                  Your Output
                </th>
                <th className="text-left px-4 py-3 text-[#64748B] font-semibold">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {failedTests.map((testResult, index) => (
                <tr
                  key={testResult.testCaseId}
                  className="border-b border-[#1E2A3A] bg-rose-500/5"
                >
                  <td className="px-4 py-3 text-[#94A3B8] font-medium">
                    TC {testResult.testCaseNumber || index + 1}
                  </td>
                  <td className="px-4 py-3 text-[#E2E8F0] font-mono max-w-xs">
                    {testResult.detailsHidden ? (
                      <span className="text-[#64748B]">Hidden</span>
                    ) : (
                      <pre className="whitespace-pre-wrap break-words">
                        {formatInputForDisplay(testResult.testCaseInput || "")}
                      </pre>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#E2E8F0] font-mono max-w-xs">
                    {testResult.detailsHidden ? (
                      <span className="text-[#64748B]">Hidden</span>
                    ) : (
                      <pre className="whitespace-pre-wrap break-words">
                        {formatInputForDisplay(testResult.testCaseOutput || "")}
                      </pre>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono max-w-xs">
                    {testResult.errorMessage ? (
                      <span className="text-rose-300">
                        {testResult.errorMessage}
                      </span>
                    ) : testResult.detailsHidden ? (
                      <span className="text-[#64748B]">Hidden</span>
                    ) : (
                      <pre className="text-[#E2E8F0] whitespace-pre-wrap break-words">
                        {formatInputForDisplay(testResult.actualOutput || "")}
                      </pre>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300">
                      Failed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {submission.code && (
        <div className="rounded-lg border border-[#1E2A3A] bg-[#0F2235] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1E2A3A] bg-[#0B1B2D]">
            <p className="text-sm font-semibold text-white">Submitted Code</p>
          </div>
          <pre className="max-h-80 overflow-auto p-4 text-xs text-[#E2E8F0] font-mono whitespace-pre-wrap">
            {submission.code}
          </pre>
        </div>
      )}
    </div>
  );
}
