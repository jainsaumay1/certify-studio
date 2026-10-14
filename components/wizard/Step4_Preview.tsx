"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useStore } from "@/lib/store";

export default function Step4_Preview() {
  const { mappedRows, templateConfig, setStep } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  const longestNameIndex = useMemo(() => {
    if (mappedRows.length === 0) return 0;
    let maxLen = 0;
    let maxIdx = 0;
    mappedRows.forEach((r, i) => {
      if (r.full_name.length > maxLen) {
        maxLen = r.full_name.length;
        maxIdx = i;
      }
    });
    return maxIdx;
  }, [mappedRows]);

  if (mappedRows.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Step 4 — Live Preview</h2>
        <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-gray-500">No recipient data yet. Go back and import a spreadsheet.</p>
        </div>
        <Button variant="outline" onClick={() => setStep(3)}>← Back</Button>
      </div>
    );
  }

  const row = mappedRows[currentIndex];

  const TEMPLATE_STYLES: Record<string, { bg: string; border: string; accent: string; title: string }> = {
    "academic-gold": { bg: "#fffdf5", border: "#d97706", accent: "#b7791f", title: "Certificate of Completion" },
    "corporate-sleek": { bg: "#f0f4f8", border: "#2563eb", accent: "#1e3a8a", title: "Certificate of Achievement" },
    minimalist: { bg: "#ffffff", border: "#9ca3af", accent: "#374151", title: "Certificate of Completion" },
    "prestige-geometric": { bg: "#ffffff", border: "#cbd5e1", accent: "#0f2847", title: "CERTIFICATE OF ACHIEVEMENT" },
    custom: { bg: "#ffffff", border: "#818cf8", accent: "#4f46e5", title: "Certificate of Achievement" },
  };

  const style = TEMPLATE_STYLES[templateConfig.templateId] ?? TEMPLATE_STYLES["academic-gold"];
  const displayName = row.full_name || "(no name)";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Step 4 — Live Preview</h2>
          <p className="mt-1 text-gray-500">
            Review how each certificate will look. Navigate through all recipients.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentIndex(longestNameIndex)}
          className="gap-1.5 shrink-0"
        >
          <AlertTriangle size={14} className="text-amber-500" />
          Highlight Outlier
        </Button>
      </div>

      {/* Certificate Preview */}
      <div
        className="relative w-full rounded-xl overflow-hidden shadow-lg"
        style={{ 
          borderColor: templateConfig.customBackgroundData ? "transparent" : style.border, 
          backgroundColor: templateConfig.customBackgroundData ? "transparent" : style.bg, 
          backgroundImage: templateConfig.customBackgroundData ? `url(${templateConfig.customBackgroundData})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderWidth: templateConfig.customBackgroundData ? "0px" : "4px",
          aspectRatio: "1.414 / 1" 
        }}
      >
        {/* Corner Geometric Graphics (only for prestige-geometric without custom image) */}
        {templateConfig.templateId === "prestige-geometric" && !templateConfig.customBackgroundData && (
          <>
            {/* Left geometric flair */}
            <svg className="absolute inset-y-0 left-0 w-24 h-full pointer-events-none z-0" viewBox="0 0 100 600" preserveAspectRatio="none">
              <polygon points="0,0 70,0 115,310 45,600 0,600" fill="#0f2847" />
              <polygon points="0,360 110,290 75,240 0,290" fill="#f59e0b" />
              <polygon points="0,0 45,0 0,110" fill="#64748b" />
            </svg>
            {/* Right geometric flair */}
            <svg className="absolute inset-y-0 right-0 w-24 h-full pointer-events-none z-0" viewBox="0 0 100 600" preserveAspectRatio="none">
              <polygon points="100,0 30,0 -15,290 55,600 100,600" fill="#0f2847" />
              <polygon points="100,240 -10,310 25,360 100,310" fill="#f59e0b" />
              <polygon points="100,600 55,600 100,490" fill="#64748b" />
            </svg>
            {/* Double border for prestige */}
            <div className="absolute inset-x-12 inset-y-4 rounded-lg border-2 border-slate-300 pointer-events-none z-0">
              <div className="absolute inset-1 rounded border border-slate-200 pointer-events-none" />
            </div>
          </>
        )}

        {/* Inner border (for standard templates) */}
        {!templateConfig.customBackgroundData && templateConfig.templateId !== "prestige-geometric" && (
          <div
            className="absolute inset-4 rounded-lg border-2 pointer-events-none"
            style={{ borderColor: style.border }}
          />
        )}

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 py-6 z-10">
          
          {/* Custom Logo */}
          {templateConfig.customLogoData && (
            <img 
              src={templateConfig.customLogoData} 
              alt="Custom Logo" 
              className="max-h-16 mb-4 object-contain" 
            />
          )}

          {/* Title */}
          {!templateConfig.isCleanMode && (
            templateConfig.templateId === "prestige-geometric" && !templateConfig.customTitle ? (
              <div 
                className="mb-2"
                style={{ transform: `translateY(${templateConfig.titleY || 0}px)` }}
              >
                <div 
                  className="font-serif font-black tracking-widest text-[#0f2847]"
                  style={{ 
                    fontSize: templateConfig.titleFontSize ? `${templateConfig.titleFontSize * 0.8}px` : "1.5rem",
                    color: templateConfig.titleColor || "#0f2847"
                  }}
                >
                  C E R T I F I C A T E
                </div>
                <div className="text-xs md:text-sm font-serif font-semibold tracking-wider text-[#334155] mt-0.5">
                  OF ACHIEVEMENT
                </div>
                <div className="flex items-center justify-center gap-2 my-1.5">
                  <div className="w-16 h-px bg-amber-500" />
                  <div className="w-1.5 h-1.5 rotate-45 bg-amber-500" />
                  <div className="w-16 h-px bg-amber-500" />
                </div>
                <div 
                  className="italic"
                  style={{ 
                    fontSize: templateConfig.subtitleFontSize ? `${templateConfig.subtitleFontSize * 0.8}px` : "0.75rem",
                    color: templateConfig.subtitleColor || (templateConfig.isDarkModeTemplate ? "#e5e7eb" : "#64748b")
                  }}
                >
                  {templateConfig.customSubtitle || "This certificate is proudly presented to"}
                </div>
              </div>
            ) : (
              <div style={{ transform: `translateY(${templateConfig.titleY || 0}px)` }}>
                <div 
                  className="font-bold mb-1"
                  style={{ 
                    fontSize: templateConfig.titleFontSize ? `${templateConfig.titleFontSize * 0.8}px` : "1.25rem",
                    color: templateConfig.titleColor || style.accent 
                  }}
                >
                  {templateConfig.customTitle || style.title}
                </div>
                <div className="w-40 h-px mb-3 mx-auto" style={{ backgroundColor: style.border }} />
                
                {/* Sub heading */}
                <div 
                  className="italic mb-2" 
                  style={{ 
                    fontSize: templateConfig.subtitleFontSize ? `${templateConfig.subtitleFontSize * 0.8}px` : "0.75rem",
                    color: templateConfig.subtitleColor || (templateConfig.isDarkModeTemplate ? "#e5e7eb" : "#6b7280") 
                  }}
                >
                  {templateConfig.customSubtitle || "This certifies that"}
                </div>
              </div>
            )
          )}

          {/* Name */}
          <div
            className={`font-bold leading-tight break-words max-w-full ${templateConfig.coverOldText ? "bg-white px-8 py-1 rounded" : ""}`}
            style={{
              color: templateConfig.templateId === "prestige-geometric" && !templateConfig.nameColor ? "#0f2847" : templateConfig.nameColor,
              fontSize: `clamp(14px, ${templateConfig.nameFontSize * 0.8}px, 42px)`,
              fontFamily: templateConfig.customFontName ? "sans-serif" : "inherit",
              transform: `translateY(${templateConfig.nameY || 0}px)`
            }}
          >
            {displayName}
          </div>

          {!templateConfig.isCleanMode && (
            <>
              {/* Underline */}
              <div
                className="w-3/4 h-px my-2"
                style={{ backgroundColor: templateConfig.templateId === "prestige-geometric" ? "#f59e0b" : style.accent + "60" }}
              />
              
              <div 
                className="mb-1" 
                style={{ 
                  fontSize: templateConfig.bodyPhraseFontSize ? `${templateConfig.bodyPhraseFontSize * 0.8}px` : "0.75rem",
                  color: templateConfig.bodyPhraseColor || (templateConfig.isDarkModeTemplate ? "#e5e7eb" : "#6b7280") 
                }}
              >
                {templateConfig.customBodyPhrase ||
                  (templateConfig.templateId === "prestige-geometric"
                    ? "for successfully completing the curriculum and demonstrating mastery in"
                    : "has successfully completed")}
              </div>
            </>
          )}

          {/* Course */}
          <div
            className={`font-semibold text-sm leading-snug max-w-xs ${templateConfig.coverOldText ? "bg-white px-4 py-1 rounded mt-1" : ""}`}
            style={{ 
              color: templateConfig.templateId === "prestige-geometric" ? "#0f2847" : templateConfig.courseColor,
              transform: `translateY(${templateConfig.courseY || 0}px)`
            }}
          >
            {row.course || "(no course)"}
          </div>

          {/* Date */}
          <div 
            className="mt-2 text-xs" 
            style={{ 
              color: templateConfig.isDarkModeTemplate ? "#d1d5db" : "#9ca3af",
              transform: `translateY(${templateConfig.dateY || 0}px)` 
            }}
          >
            {(templateConfig.datePrefix || "Issued:")} {row.date || "—"}
          </div>

          {/* Dual Signatures & Center Seal */}
          {(templateConfig.showSignatures ?? (templateConfig.templateId === "prestige-geometric")) && (
            <div className="w-full flex items-end justify-between px-16 mt-3">
              {/* Left Signature */}
              <div className="text-center w-36">
                <div className="border-b border-gray-400 pb-1 mb-1 font-serif italic text-xs text-gray-700">
                  {templateConfig.leftSignatureTitle || "Authorized Signature"}
                </div>
                <div className="text-[9px] uppercase tracking-wider text-gray-400 font-semibold">
                  Signature
                </div>
              </div>

              {/* Center Medal Seal (for prestige-geometric) */}
              {templateConfig.templateId === "prestige-geometric" ? (
                <div className="flex flex-col items-center relative -mb-1">
                  <div className="flex gap-1.5 -mb-2">
                    <div className="w-3 h-5 bg-amber-500 [clip-path:polygon(0_0,100%_0,100%_100%,50%_75%,0_100%)]" />
                    <div className="w-3 h-5 bg-amber-500 [clip-path:polygon(0_0,100%_0,100%_100%,50%_75%,0_100%)]" />
                  </div>
                  <div className="w-11 h-11 rounded-full bg-amber-500 p-0.5 shadow flex items-center justify-center">
                    <div className="w-full h-full rounded-full border border-dashed border-amber-200 bg-[#0f2847] flex flex-col items-center justify-center text-amber-400 text-[6px] font-bold uppercase leading-tight">
                      <span>TOP</span>
                      <span>AWARD</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-12" />
              )}

              {/* Right Signature */}
              <div className="text-center w-36">
                <div className="border-b border-gray-400 pb-1 mb-1 font-serif italic text-xs text-gray-700">
                  {templateConfig.rightSignatureTitle || "Director of Certification"}
                </div>
                <div className="text-[9px] uppercase tracking-wider text-gray-400 font-semibold">
                  Signature
                </div>
              </div>
            </div>
          )}

          {/* QR placeholder */}
          <div className="absolute bottom-5 right-5 flex flex-col items-center gap-0.5">
            <div
              className="bg-white rounded border p-1"
              style={{
                width: Math.min(60, templateConfig.qrSize * 0.3),
                height: Math.min(60, templateConfig.qrSize * 0.3),
                borderColor: style.border,
              }}
            >
              <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-0.5">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className={`rounded-[1px] ${[0,2,6,8].includes(i) ? "bg-gray-800" : i === 4 ? "bg-gray-300" : "bg-gray-600"}`} />
                ))}
              </div>
            </div>
            <span className="text-[6px] text-gray-400">Scan to verify</span>
          </div>

          {/* Watermark */}
          <div className="absolute bottom-2 left-0 right-0 text-center text-[7px] text-gray-300">
            Issued via Certify Studio Free
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
        >
          <ChevronLeft size={16} />
        </Button>
        <span className="text-sm font-medium text-gray-700">
          Record <strong>{currentIndex + 1}</strong> of <strong>{mappedRows.length}</strong>
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentIndex((i) => Math.min(mappedRows.length - 1, i + 1))}
          disabled={currentIndex === mappedRows.length - 1}
        >
          <ChevronRight size={16} />
        </Button>
      </div>

      {/* Row summary */}
      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 grid grid-cols-2 gap-2 text-xs">
        <div><span className="text-gray-500">Name:</span> <span className="font-medium">{row.full_name || "—"}</span></div>
        <div><span className="text-gray-500">Email:</span> <span className="font-medium truncate">{row.email || "—"}</span></div>
        <div><span className="text-gray-500">Course:</span> <span className="font-medium">{row.course || "—"}</span></div>
        <div>
          <span className="text-gray-500">Name length:</span>{" "}
          <Badge variant={row.full_name.length > 35 ? "orange" : "green"}>
            {row.full_name.length} chars
          </Badge>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep(3)}>← Back</Button>
        <Button onClick={() => setStep(5)}>Run Preflight Audit →</Button>
      </div>
    </div>
  );
}
