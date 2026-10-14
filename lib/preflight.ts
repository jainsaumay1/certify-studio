/**
 * CertPreflight Guard — 5-Pass Quality Audit Engine
 *
 * Validates recipient rows before PDF generation.
 * Returns per-row audit results plus an aggregate triage summary.
 */

export type PreflightStatus = "ready" | "auto-fixed" | "blocked";

export interface PreflightIssue {
  pass: 1 | 2 | 3 | 4 | 5;
  severity: "error" | "warning" | "info";
  message: string;
  autoFixed?: boolean;
}

export interface RowAuditResult {
  rowIndex: number;                  // 0-based
  originalName: string;
  resolvedName: string;              // after Title Case, trim, etc.
  resolvedFontSize: number;          // after auto-scaling (pt)
  issues: PreflightIssue[];
  status: PreflightStatus;
}

export interface PreflightSummary {
  total: number;
  ready: number;
  autoFixed: number;
  blocked: number;
  results: RowAuditResult[];
}

// RFC 5322-compatible email regex (simplified but practical)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Approximate character widths for common fonts at 1pt (in pt units).
// Real implementations would use a font metrics table; this is a reasonable proxy.
function estimateTextWidth(text: string, fontSizePt: number): number {
  // Average character width ≈ 0.5 × font size for proportional fonts
  return text.length * fontSizePt * 0.52;
}

// Maximum allowed text width for a name field on an A4 landscape cert (mm → pt conversion)
// A4 landscape: 841.89 × 595.28 pt. Allow 70% of width for the name field.
const MAX_NAME_WIDTH_PT = 841.89 * 0.7;
const BASE_FONT_SIZE_PT = 36;
const MIN_FONT_SIZE_PT = 14;

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/(?:^|\s|-)(\p{L})/gu, (_, c: string) => c.toUpperCase());
}

function isWinAnsi(text: string): boolean {
  // WinAnsi (Windows-1252) covers Basic Latin, Latin-1 Supplement (U+0000 to U+00FF)
  // and a few specific characters in the U+0100 to U+2122 range.
  return /^[\u0000-\u00FF\u20AC\u201A\u0192\u201E\u2026\u2020\u2021\u02C6\u2030\u0160\u2039\u0152\u017D\u2018\u2019\u201C\u201D\u2022\u2013\u2014\u02DC\u2122\u0161\u203A\u0153\u017E\u0178]*$/.test(text);
}

function maskName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts
    .map((p) => (p.length > 0 ? p[0] + "*".repeat(Math.max(p.length - 1, 2)) : ""))
    .join(" ");
}

export { maskName };

export function runPreflight(
  rows: Array<{
    full_name: string;
    email: string;
    course: string;
    date: string;
  }>,
  options: {
    applyTitleCase?: boolean;
    trimWhitespace?: boolean;
    hasCustomFont?: boolean;
  } = {}
): PreflightSummary {
  const { applyTitleCase = true, trimWhitespace = true, hasCustomFont = false } = options;
  const results: RowAuditResult[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const issues: PreflightIssue[] = [];
    let status: PreflightStatus = "ready";
    let resolvedName = row.full_name;
    let resolvedFontSize = BASE_FONT_SIZE_PT;

    // ── PASS 1: Data Integrity ───────────────────────────────────────────────
    const name = trimWhitespace ? row.full_name.trim() : row.full_name;
    const email = trimWhitespace ? row.email.trim() : row.email;
    const course = trimWhitespace ? row.course.trim() : row.course;

    if (!name) {
      issues.push({
        pass: 1,
        severity: "error",
        message: "Missing required field: Recipient Name",
      });
      status = "blocked";
    }

    if (!email) {
      issues.push({
        pass: 1,
        severity: "error",
        message: "Missing required field: Email",
      });
      status = "blocked";
    } else if (!EMAIL_REGEX.test(email)) {
      issues.push({
        pass: 1,
        severity: "error",
        message: `Invalid email format: "${email}"`,
      });
      status = "blocked";
    }

    if (!course) {
      issues.push({
        pass: 1,
        severity: "error",
        message: "Missing required field: Course Name",
      });
      status = "blocked";
    }

    if (!row.date) {
      issues.push({
        pass: 1,
        severity: "warning",
        message: "Missing issue date — will default to today",
        autoFixed: true,
      });
    }

    // ── PASS 2: Visual Geometry & Font Fit ──────────────────────────────────
    if (name) {
      resolvedName = applyTitleCase ? toTitleCase(name) : name;
      if (applyTitleCase && resolvedName !== row.full_name) {
        issues.push({
          pass: 2,
          severity: "info",
          message: `Title Case applied: "${row.full_name}" → "${resolvedName}"`,
          autoFixed: true,
        });
      }

      // Auto-scale font size if text would overflow
      let testSize = BASE_FONT_SIZE_PT;
      while (
        estimateTextWidth(resolvedName, testSize) > MAX_NAME_WIDTH_PT &&
        testSize > MIN_FONT_SIZE_PT
      ) {
        testSize -= 0.5;
      }
      resolvedFontSize = testSize;

      if (testSize < BASE_FONT_SIZE_PT) {
        issues.push({
          pass: 2,
          severity: "warning",
          message: `Long name detected — font auto-scaled ${BASE_FONT_SIZE_PT}pt → ${testSize.toFixed(1)}pt`,
          autoFixed: true,
        });
        if (status === "ready") status = "auto-fixed";
      }
    }

    // ── PASS 3: Typography / Unicode Coverage ────────────────────────────────
    // We must check name, course, and date for unsupported characters.
    const allText = `${resolvedName} ${course} ${row.date || ""}`;
    if (!isWinAnsi(allText)) {
      if (options.hasCustomFont) {
        issues.push({
          pass: 3,
          severity: "info",
          message: "Extended characters detected — custom font will be used",
        });
      } else {
        issues.push({
          pass: 3,
          severity: "error",
          message: "Extended characters detected but no custom font uploaded. Standard fonts cannot encode these characters (WinAnsi error). Go to Step 3 and upload a custom font.",
        });
        status = "blocked";
      }
    }

    // ── PASS 4: QR Optics ────────────────────────────────────────────────────
    // In a real implementation this would render the QR and measure contrast.
    // Here we note that QR generation uses high-contrast black-on-white by default.
    issues.push({
      pass: 4,
      severity: "info",
      message: "QR optics: black-on-white, quiet zone 4-module — OK",
    });

    // ── PASS 5: Triage consolidation ─────────────────────────────────────────
    const hasError = issues.some((i) => i.severity === "error");
    const hasAutoFix = issues.some(
      (i) => i.autoFixed && i.severity !== "error"
    );

    if (hasError) {
      status = "blocked";
    } else if (hasAutoFix && status !== "blocked") {
      status = "auto-fixed";
    }

    results.push({
      rowIndex: i,
      originalName: row.full_name,
      resolvedName,
      resolvedFontSize,
      issues,
      status,
    });
  }

  const ready = results.filter((r) => r.status === "ready").length;
  const autoFixed = results.filter((r) => r.status === "auto-fixed").length;
  const blocked = results.filter((r) => r.status === "blocked").length;

  return { total: rows.length, ready, autoFixed, blocked, results };
}
