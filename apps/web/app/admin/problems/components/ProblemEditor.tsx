"use client";

import { useMemo, useState, useTransition } from "react";

type ConstraintItem = { id?: string; description: string };
type ExampleItem = {
  id?: string;
  input: string;
  output: string;
  explanation?: string | null;
};
type TestCaseItem = {
  id?: string;
  input: string;
  output: string;
  isSample: boolean;
};

type ProblemPayload = {
  id: string;
  title: string;
  description: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  constraints: ConstraintItem[];
  examples: ExampleItem[];
  testCases: TestCaseItem[];
};

type ProblemEditorProps = {
  problem: ProblemPayload;
  mode?: "create" | "edit";
  onSuccess?: (problemId: string) => void;
};

const emptyConstraint = (): ConstraintItem => ({ description: "" });
const emptyExample = (): ExampleItem => ({
  input: "",
  output: "",
  explanation: "",
});
const emptyTestCase = (): TestCaseItem => ({
  input: "",
  output: "",
  isSample: false,
});

export const ProblemEditor = ({
  problem,
  mode = "edit",
  onSuccess,
}: ProblemEditorProps) => {
  const [formState, setFormState] = useState<ProblemPayload>(() => ({
    ...problem,
    constraints: problem.constraints.length
      ? problem.constraints
      : [emptyConstraint()],
    examples: problem.examples.length ? problem.examples : [emptyExample()],
    testCases: problem.testCases.length ? problem.testCases : [emptyTestCase()],
  }));
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const payload = useMemo(() => formState, [formState]);

  const updateField = (
    key: keyof ProblemPayload,
    value: ProblemPayload[keyof ProblemPayload],
  ) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const updateConstraint = (index: number, value: string) => {
    updateField(
      "constraints",
      formState.constraints.map((item, idx) =>
        idx === index ? { ...item, description: value } : item,
      ),
    );
  };

  const updateExample = (
    index: number,
    key: keyof ExampleItem,
    value: ExampleItem[keyof ExampleItem],
  ) => {
    updateField(
      "examples",
      formState.examples.map((item, idx) =>
        idx === index ? { ...item, [key]: value } : item,
      ),
    );
  };

  const updateTestCase = (
    index: number,
    key: keyof TestCaseItem,
    value: TestCaseItem[keyof TestCaseItem],
  ) => {
    updateField(
      "testCases",
      formState.testCases.map((item, idx) =>
        idx === index ? { ...item, [key]: value } : item,
      ),
    );
  };

  const removeItem = <T,>(
    items: T[],
    index: number,
    fallback: () => T,
  ): T[] => {
    const next = items.filter((_, idx) => idx !== index);
    return next.length ? next : [fallback()];
  };

  const handleSave = () => {
    setMessage(null);
    startTransition(() => {
      void (async () => {
        try {
          const method = mode === "create" ? "POST" : "PUT";
          const endpoint =
            mode === "create"
              ? `/api/v1/admin/problems`
              : `/api/v1/admin/problems/${problem.id}`;

          const response = await fetch(endpoint, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            throw new Error("Failed to save changes");
          }

          const data = await response.json();

          if (mode === "create") {
            setMessage("Problem created successfully!");
            onSuccess?.(data.id);
          } else {
            setMessage("Changes saved successfully.");
          }
        } catch (error) {
          console.error(error);
          setMessage("Unable to save changes. Try again.");
        }
      })();
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[#1E2A3A] bg-[#0F2235] p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Problem details
            </h2>
            <p className="text-xs text-[#94A3B8] mt-1">
              {mode === "create"
                ? "Create a new problem with all necessary details."
                : "Edit fields and save changes to the database."}
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="px-4 py-2 rounded-lg bg-[#3B82F6] text-sm font-medium text-white hover:bg-[#2563EB] transition-colors disabled:opacity-60"
          >
            {isPending
              ? mode === "create"
                ? "Creating..."
                : "Saving..."
              : mode === "create"
                ? "Create problem"
                : "Save changes"}
          </button>
        </div>
        {message ? (
          <div className="mt-4 rounded-lg border border-[#1E2A3A] bg-[#0B1B2D] px-4 py-2 text-xs text-[#94A3B8]">
            {message}
          </div>
        ) : null}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-[#64748B]">
              Title
            </label>
            <input
              value={formState.title}
              onChange={(event) => updateField("title", event.target.value)}
              className="mt-2 w-full rounded-lg border border-[#1E2A3A] bg-[#0B1B2D] px-4 py-2 text-sm text-white focus:border-[#3B82F6] focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-[#64748B]">
              Difficulty
            </label>
            <select
              value={formState.difficulty}
              onChange={(event) =>
                updateField(
                  "difficulty",
                  event.target.value as ProblemPayload["difficulty"],
                )
              }
              className="mt-2 w-full rounded-lg border border-[#1E2A3A] bg-[#0B1B2D] px-4 py-2 text-sm text-white focus:border-[#3B82F6] focus:outline-none"
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
        </div>
        <div className="mt-5">
          <label className="text-xs uppercase tracking-[0.2em] text-[#64748B]">
            Description
          </label>
          <textarea
            value={formState.description}
            onChange={(event) => updateField("description", event.target.value)}
            rows={6}
            className="mt-2 w-full rounded-lg border border-[#1E2A3A] bg-[#0B1B2D] px-4 py-3 text-sm text-white focus:border-[#3B82F6] focus:outline-none"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="space-y-6">
          <div className="rounded-xl border border-[#1E2A3A] bg-[#0F2235] p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Examples</h3>
              <button
                onClick={() =>
                  updateField("examples", [
                    ...formState.examples,
                    emptyExample(),
                  ])
                }
                className="text-xs text-[#3B82F6] hover:text-[#60A5FA] transition-colors"
              >
                Add example
              </button>
            </div>
            <div className="mt-4 space-y-4">
              {formState.examples.map((example, index) => (
                <div
                  key={example.id ?? `example-${index}`}
                  className="rounded-lg border border-[#1E2A3A] bg-[#0B1B2D] p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[#94A3B8]">
                      Example {index + 1}
                    </p>
                    <button
                      onClick={() =>
                        updateField(
                          "examples",
                          removeItem(formState.examples, index, emptyExample),
                        )
                      }
                      className="text-xs text-[#F87171] hover:text-[#FB7185]"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-3 grid gap-3">
                    <input
                      value={example.input}
                      onChange={(event) =>
                        updateExample(index, "input", event.target.value)
                      }
                      placeholder="Input"
                      className="w-full rounded-md border border-[#1E2A3A] bg-[#0A1929] px-3 py-2 text-xs text-white focus:border-[#3B82F6] focus:outline-none"
                    />
                    <input
                      value={example.output}
                      onChange={(event) =>
                        updateExample(index, "output", event.target.value)
                      }
                      placeholder="Output"
                      className="w-full rounded-md border border-[#1E2A3A] bg-[#0A1929] px-3 py-2 text-xs text-white focus:border-[#3B82F6] focus:outline-none"
                    />
                    <input
                      value={example.explanation ?? ""}
                      onChange={(event) =>
                        updateExample(index, "explanation", event.target.value)
                      }
                      placeholder="Explanation (optional)"
                      className="w-full rounded-md border border-[#1E2A3A] bg-[#0A1929] px-3 py-2 text-xs text-white focus:border-[#3B82F6] focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#1E2A3A] bg-[#0F2235] p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Test cases</h3>
              <button
                onClick={() =>
                  updateField("testCases", [
                    ...formState.testCases,
                    emptyTestCase(),
                  ])
                }
                className="text-xs text-[#3B82F6] hover:text-[#60A5FA] transition-colors"
              >
                Add test case
              </button>
            </div>
            <div className="mt-4 space-y-4">
              {formState.testCases.map((testCase, index) => (
                <div
                  key={testCase.id ?? `test-${index}`}
                  className="rounded-lg border border-[#1E2A3A] bg-[#0B1B2D] p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[#94A3B8]">
                      Test case {index + 1}
                    </p>
                    <button
                      onClick={() =>
                        updateField(
                          "testCases",
                          removeItem(formState.testCases, index, emptyTestCase),
                        )
                      }
                      className="text-xs text-[#F87171] hover:text-[#FB7185]"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-3 grid gap-3">
                    <input
                      value={testCase.input}
                      onChange={(event) =>
                        updateTestCase(index, "input", event.target.value)
                      }
                      placeholder="Input"
                      className="w-full rounded-md border border-[#1E2A3A] bg-[#0A1929] px-3 py-2 text-xs text-white focus:border-[#3B82F6] focus:outline-none"
                    />
                    <input
                      value={testCase.output}
                      onChange={(event) =>
                        updateTestCase(index, "output", event.target.value)
                      }
                      placeholder="Output"
                      className="w-full rounded-md border border-[#1E2A3A] bg-[#0A1929] px-3 py-2 text-xs text-white focus:border-[#3B82F6] focus:outline-none"
                    />
                    <label className="inline-flex items-center gap-2 text-xs text-[#94A3B8]">
                      <input
                        type="checkbox"
                        checked={testCase.isSample}
                        onChange={(event) =>
                          updateTestCase(
                            index,
                            "isSample",
                            event.target.checked,
                          )
                        }
                        className="h-4 w-4 rounded border border-[#1E2A3A] bg-[#0A1929] text-[#3B82F6]"
                      />
                      Sample test case
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-[#1E2A3A] bg-[#0F2235] p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Constraints</h3>
              <button
                onClick={() =>
                  updateField("constraints", [
                    ...formState.constraints,
                    emptyConstraint(),
                  ])
                }
                className="text-xs text-[#3B82F6] hover:text-[#60A5FA] transition-colors"
              >
                Add constraint
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {formState.constraints.map((constraint, index) => (
                <div
                  key={constraint.id ?? `constraint-${index}`}
                  className="flex items-center gap-3"
                >
                  <input
                    value={constraint.description}
                    onChange={(event) =>
                      updateConstraint(index, event.target.value)
                    }
                    placeholder="Constraint description"
                    className="flex-1 rounded-md border border-[#1E2A3A] bg-[#0B1B2D] px-3 py-2 text-xs text-white focus:border-[#3B82F6] focus:outline-none"
                  />
                  <button
                    onClick={() =>
                      updateField(
                        "constraints",
                        removeItem(
                          formState.constraints,
                          index,
                          emptyConstraint,
                        ),
                      )
                    }
                    className="text-xs text-[#F87171] hover:text-[#FB7185]"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#1E2A3A] bg-[#0F2235] p-6">
            <h3 className="text-sm font-semibold text-white">Meta</h3>
            <div className="mt-4 space-y-3 text-xs text-[#94A3B8]">
              <div className="flex items-center justify-between">
                <span>Problem ID</span>
                <span className="text-white">{formState.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Examples</span>
                <span className="text-white">{formState.examples.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Constraints</span>
                <span className="text-white">
                  {formState.constraints.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Test cases</span>
                <span className="text-white">{formState.testCases.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
