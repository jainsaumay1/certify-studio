"use client";

import { useState, useCallback } from "react";
import { ShieldCheck, AlertCircle, CheckCircle, Wrench, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useStore } from "@/lib/store";
import { runPreflight, type RowAuditResult } from "@/lib/preflight";

export default function Step5_Preflight() {
  const { mappedRows, templateConfig, applyTitleCase, trimWhitespace, setPreflightSummary, preflightSummary, setStep } = useStore();
  const [running, setRunning] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const runAudit = useCallback(async () => {
    setRunning(true);
    // Small delay to give UI time to update
    await new Promise((r) => setTimeout(r, 50));
    const summary = runPreflight(mappedRows, { 
      applyTitleCase, 
      trimWhitespace,
      hasCustomFont: !!templateConfig.customFontData
    });
    setPreflightSummary(summary);
    setRunning(false);
  }, [mappedRows, templateConfig.customFontData, applyTitleCase, trimWhitespace, setPreflightSummary]);

  const statusConfig: Record<string, { label: string; badgeVariant: "green" | "yellow" | "red"; icon: React.ReactNode }> = {
    ready: { label: "Ready", badgeVariant: "green", icon: <CheckCircle size={14} /> },
    "auto-fixed": { label: "Auto-Fixed", badgeVariant: "yellow", icon: <Wrench size={14} /> },
    blocked: { label: "Blocked", badgeVariant: "red", icon: <AlertCircle size={14} /> },
  };

  const s = preflightSummary;
  // Can proceed as long as there is at least one valid row
  const canProceed = s && (s.ready > 0 || s.autoFixed > 0);
  const blockedButAutoFixed = s && s.blocked === 0 && s.autoFixed > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Step 5 — CertPreflight Guard</h2>
        <p className="mt-1 text-gray-500">
          5-pass quality audit engine that validates data integrity, geometry, typography, and QR optics before generation.
        </p>
      </div>

      {/* 5-Pass Indicators */}
      <div className="grid grid-cols-5 gap-2 text-center text-xs">
        {[
          { label: "Data Integrity", icon: "🔍" },
          { label: "Geometry & Fit", icon: "📐" },
          { label: "Typography", icon: "🔤" },
          { label: "QR Optics", icon: "📱" },
          { label: "Triage", icon: "🏥" },
        ].map((pass, i) => (
          <div key={i} className={`p-2 rounded-lg border ${s ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
            <div className="text-lg">{pass.icon}</div>
            <div className={`font-medium mt-1 ${s ? "text-green-700" : "text-gray-600"}`}>Pass {i + 1}</div>
            <div className="text-gray-500 mt-0.5 leading-tight">{pass.label}</div>
          </div>
        ))}
      </div>

      {/* Run Button */}
      {!s && (
        <Button onClick={runAudit} disabled={running} size="lg" className="w-full gap-2">
          {running ? (
            <><Loader2 size={18} className="animate-spin" /> Running 5-Pass Audit…</>
          ) : (
            <><ShieldCheck size={18} /> Run CertPreflight Guard</>
          )}
        </Button>
      )}

      {/* Triage Summary */}
      {s && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center">
              <div className="text-3xl font-bold text-green-700">{s.ready}</div>
              <div className="text-sm text-green-600 mt-1">✅ Ready</div>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
              <div className="text-3xl font-bold text-yellow-700">{s.autoFixed}</div>
              <div className="text-sm text-yellow-600 mt-1">🔧 Auto-Fixed</div>
            </div>
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center">
              <div className="text-3xl font-bold text-red-700">{s.blocked}</div>
              <div className="text-sm text-red-600 mt-1">🚫 Blocked</div>
            </div>
          </div>

          {s.blocked > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-3">
              <AlertCircle size={18} className="text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  {s.blocked} row{s.blocked !== 1 ? "s" : ""} blocked and will be skipped
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  You can proceed to generate the rest of the batch, but these blocked rows will not have certificates generated.
                </p>
              </div>
            </div>
          )}

          {blockedButAutoFixed && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
              <ShieldCheck size={18} className="text-blue-500 mt-0.5 shrink-0" />
              <p className="text-sm text-blue-800">
                All auto-fixes have been applied. Your batch is ready to generate.
              </p>
            </div>
          )}

          {/* Per-row results */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700">Row-by-Row Audit Results</h3>
            </div>
            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {s.results.map((result: RowAuditResult) => {
                const sc = statusConfig[result.status];
                const isExpanded = expandedRow === result.rowIndex;
                const nonInfoIssues = result.issues.filter((i) => i.severity !== "info" || i.message.includes("QR optics") === false);

                return (
                  <div key={result.rowIndex} className="hover:bg-gray-50">
                    <button
                      className="w-full px-4 py-3 flex items-center gap-3 text-left"
                      onClick={() => setExpandedRow(isExpanded ? null : result.rowIndex)}
                    >
                      <span className="text-xs text-gray-400 w-6 shrink-0">#{result.rowIndex + 1}</span>
                      <span className="flex-1 text-sm font-medium text-gray-800 truncate">
                        {result.originalName || "(empty name)"}
                      </span>
                      <Badge variant={sc.badgeVariant} className="gap-1 shrink-0">
                        {sc.icon} {sc.label}
                      </Badge>
                      {isExpanded ? <ChevronUp size={14} className="text-gray-400 shrink-0" /> : <ChevronDown size={14} className="text-gray-400 shrink-0" />}
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-3 space-y-1.5">
                        {result.issues
                          .filter((i) => !i.message.includes("QR optics"))
                          .map((issue, j) => (
                            <div
                              key={j}
                              className={`flex items-start gap-2 text-xs px-3 py-2 rounded-lg ${
                                issue.severity === "error"
                                  ? "bg-red-50 text-red-700"
                                  : issue.severity === "warning"
                                  ? "bg-yellow-50 text-yellow-700"
                                  : "bg-gray-50 text-gray-600"
                              }`}
                            >
                              <span className="shrink-0">
                                {issue.severity === "error" ? "❌" : issue.autoFixed ? "🔧" : "ℹ️"}
                              </span>
                              <span>Pass {issue.pass}: {issue.message}</span>
                            </div>
                          ))}
                        {result.resolvedFontSize !== 36 && (
                          <div className="text-xs text-gray-500 pl-3">
                            → Font will render at <strong>{result.resolvedFontSize.toFixed(1)}pt</strong>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => { setPreflightSummary(null as any); }}>
              Re-run Audit
            </Button>
            <Button variant="outline" onClick={() => setStep(4)}>← Back</Button>
            <Button onClick={() => setStep(6)} disabled={!canProceed} className="ml-auto">
              Generate Batch →
            </Button>
          </div>
        </div>
      )}

      {!s && (
        <Button variant="outline" onClick={() => setStep(4)}>← Back</Button>
      )}
    </div>
  );
}
