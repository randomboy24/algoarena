"use client";

import { useState, useRef, useEffect } from "react";
import { GripVertical, GripHorizontal } from "lucide-react";
import { CodeEditor } from "./CodeEditor";
import { TestCases } from "./TestCases";

export function ResizableLayout({ leftPanel, rightPanel, contestId }: any) {
  const [hSplit, setHSplit] = useState(40);
  const [vSplit, setVSplit] = useState(60);

  const containerRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  const dragging = useRef<"h" | "v" | null>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (dragging.current === "h" && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const next = ((e.clientX - rect.left) / rect.width) * 100;
        setHSplit(Math.max(20, Math.min(80, next)));
      }

      if (dragging.current === "v" && rightRef.current) {
        const rect = rightRef.current.getBoundingClientRect();
        const next = ((e.clientY - rect.top) / rect.height) * 100;
        setVSplit(Math.max(20, Math.min(80, next)));
      }
    };

    const onUp = () => (dragging.current = null);

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, []);

  return (
    <div ref={containerRef} className="flex h-full select-none">
      {/* LEFT */}
      <div
        style={{ width: `${hSplit}%`, minWidth: 0 }}
        className="overflow-hidden"
      >
        {leftPanel}
      </div>

      {/* H RESIZER */}
      <div
        className="w-1 flex-shrink-0 bg-[#1E2A3A] hover:bg-blue-500 cursor-col-resize relative group"
        onMouseDown={(e) => {
          e.preventDefault();
          dragging.current = "h";
        }}
      >
        <GripVertical className="w-4 h-4 text-white absolute inset-0 m-auto opacity-0 group-hover:opacity-100" />
      </div>

      {/* RIGHT */}
      <div
        ref={rightRef}
        style={{ width: `${100 - hSplit}%`, minWidth: 0 }}
        className="flex flex-col min-h-0 overflow-hidden"
      >
        {/* TOP */}
        <div
          style={{ flexBasis: `${vSplit}%` }}
          className="overflow-hidden min-h-0"
        >
          <CodeEditor
            template={""}
            problemId={rightPanel.id}
            starterCodeJS={rightPanel.starterCodeJavaScript}
            starterCodePython={rightPanel.starterCodePython}
            contestId={contestId}
          />
        </div>

        {/* V RESIZER */}
        <div
          className="h-1 flex-shrink-0 bg-[#1E2A3A] hover:bg-blue-500 cursor-row-resize relative group"
          onMouseDown={(e) => {
            e.preventDefault();
            dragging.current = "v";
          }}
        >
          <GripHorizontal className="w-4 h-4 text-white absolute inset-0 m-auto opacity-0 group-hover:opacity-100" />
        </div>

        {/* BOTTOM */}
        <div
          style={{ flexBasis: `${100 - vSplit}%` }}
          className="overflow-hidden min-h-0"
        >
          <TestCases testCases={rightPanel.testCases} />
        </div>
      </div>
    </div>
  );
}
