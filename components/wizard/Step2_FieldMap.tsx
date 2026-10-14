"use client";

import { useCallback, useEffect } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import type { Recipient } from "@/lib/demo-data";

export interface FieldMapping {
  recipient_name: string;
  recipient_email: string;
  course_title: string;
  issue_date: string;
}

// Common header aliases for auto-detection
const NAME_ALIASES = ["full_name", "name", "recipient", "student", "participant", "fullname"];
const EMAIL_ALIASES = ["email", "email_address", "mail", "e-mail"];
const COURSE_ALIASES = ["course", "course_name", "course_title", "program", "certification", "subject"];
const DATE_ALIASES = ["date", "issue_date", "issued", "completion_date", "cert_date"];

function autoDetect(headers: string[], aliases: string[]): string {
  for (const alias of aliases) {
    const match = headers.find(
      (h) => h.toLowerCase().replace(/[\s_-]/g, "") === alias.replace(/[\s_-]/g, "")
    );
    if (match) return match;
  }
  return "";
}

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/(?:^|\s|-)(\p{L})/gu, (_, c: string) => c.toUpperCase());
}

export default function Step2_FieldMap() {
  const {
    headers,
    rawRows,
    fieldMapping,
    setFieldMapping,
    applyTitleCase,
    setApplyTitleCase,
    trimWhitespace,
    setTrimWhitespace,
    setMappedRows,
    setStep,
  } = useStore();

  // Auto-detect on mount
  useEffect(() => {
    if (!fieldMapping.recipient_name && headers.length > 0) {
      setFieldMapping({
        recipient_name: autoDetect(headers, NAME_ALIASES),
        recipient_email: autoDetect(headers, EMAIL_ALIASES),
        course_title: autoDetect(headers, COURSE_ALIASES),
        issue_date: autoDetect(headers, DATE_ALIASES),
      });
    }
  }, [headers, fieldMapping.recipient_name, setFieldMapping]);

  const applyMapping = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    const mapped: Recipient[] = rawRows.map((row) => {
      let name = row[fieldMapping.recipient_name] ?? "";
      let course = row[fieldMapping.course_title] ?? "";
      if (trimWhitespace) {
        name = name.trim();
        course = course.trim();
      }
      if (applyTitleCase && name) {
        name = toTitleCase(name);
      }
      return {
        full_name: name,
        email: trimWhitespace
          ? (row[fieldMapping.recipient_email] ?? "").trim()
          : (row[fieldMapping.recipient_email] ?? ""),
        course,
        date: row[fieldMapping.issue_date]?.trim() || today,
      };
    });
    setMappedRows(mapped);
    setStep(3);
  }, [rawRows, fieldMapping, applyTitleCase, trimWhitespace, setMappedRows, setStep]);

  const isComplete =
    !!fieldMapping.recipient_name &&
    !!fieldMapping.recipient_email &&
    !!fieldMapping.course_title;

  const selectors: Array<{
    label: string;
    key: keyof FieldMapping;
    placeholder: string;
    required: boolean;
  }> = [
    { label: "Recipient Name", key: "recipient_name", placeholder: "{{recipient_name}}", required: true },
    { label: "Recipient Email", key: "recipient_email", placeholder: "{{recipient_email}}", required: true },
    { label: "Course / Program Title", key: "course_title", placeholder: "{{course_title}}", required: true },
    { label: "Issue Date", key: "issue_date", placeholder: "{{issue_date}}", required: false },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Step 2 — Field Mapping</h2>
        <p className="mt-1 text-gray-500">
          Map your spreadsheet columns to certificate template placeholders. Headers have been auto-detected where possible.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {selectors.map(({ label, key, placeholder, required }) => (
          <div key={key} className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
              <span className="ml-2 text-xs font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                {placeholder}
              </span>
            </label>
            <select
              value={fieldMapping[key]}
              onChange={(e) => setFieldMapping({ ...fieldMapping, [key]: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">— Select column —</option>
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Data Cleanup Options */}
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
        <p className="text-sm font-semibold text-gray-700">Data Cleanup</p>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={applyTitleCase}
            onChange={(e) => setApplyTitleCase(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">
            Apply Title Case conversion{" "}
            <span className="text-gray-400">(JOHN DOE → John Doe)</span>
          </span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={trimWhitespace}
            onChange={(e) => setTrimWhitespace(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Trim leading and trailing whitespace</span>
        </label>
      </div>

      {!isComplete && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
          <Info size={16} className="mt-0.5 shrink-0" />
          <span>Please map all required fields (Name, Email, Course) before continuing.</span>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep(1)}>
          ← Back
        </Button>
        <Button onClick={applyMapping} disabled={!isComplete}>
          Apply Mapping & Continue →
        </Button>
      </div>
    </div>
  );
}
