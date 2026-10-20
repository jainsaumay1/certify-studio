"use client";

import { useState, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight, AlertTriangle, Sliders, Eraser, MoveHorizontal, MoveVertical, Sparkles, Check, Move } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useStore } from "@/lib/store";

export default function Step4_Preview() {
  const { mappedRows, templateConfig, setTemplateConfig, setStep } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTuner, setShowTuner] = useState(false);

  // Dragging state for direct canvas interactive manipulation
  const [dragTarget, setDragTarget] = useState<"name" | "logo" | null>(null);
  const dragStartRef = useRef<{ clientX: number; clientY: number; startX: number; startY: number } | null>(null);

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

  const isCustomBg = Boolean(templateConfig.customBackgroundData || templateConfig.templateId === "custom");

  const shouldShowTitle =
    !templateConfig.isCleanMode &&
    (templateConfig.showTitle ?? !isCustomBg);

  const shouldShowSubtitle =
    !templateConfig.isCleanMode &&
    (templateConfig.showSubtitle ?? !isCustomBg);

  const shouldShowBody =
    !templateConfig.isCleanMode &&
    (templateConfig.showBodyPhrase ?? !isCustomBg);

  const shouldShowCourse = templateConfig.showCourse ?? !isCustomBg;
  const shouldShowDate = templateConfig.showDate ?? !isCustomBg;
  const shouldShowSignatures =
    templateConfig.showSignatures ??
    (templateConfig.templateId === "prestige-geometric" && !templateConfig.customBackgroundData);

  const updateConfig = (patch: Partial<typeof templateConfig>) => {
    setTemplateConfig({ ...templateConfig, ...patch });
  };

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent, target: "name" | "logo") => {
    e.preventDefault();
    e.stopPropagation();
    setDragTarget(target);
    const startX = target === "name" 
      ? (templateConfig.nameX ?? (isCustomBg ? 125 : 0)) 
      : (templateConfig.logoX ?? (isCustomBg ? 125 : 0));
    const startY = target === "name" 
      ? (templateConfig.nameY ?? (isCustomBg ? 52 : 0)) 
      : (templateConfig.logoY ?? (isCustomBg ? -75 : 0));
    dragStartRef.current = { clientX: e.clientX, clientY: e.clientY, startX, startY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragTarget || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.clientX;
    const dy = e.clientY - dragStartRef.current.clientY;

    if (dragTarget === "name") {
      updateConfig({
        nameX: Math.round(dragStartRef.current.startX + dx),
        nameY: Math.round(dragStartRef.current.startY + dy),
      });
    } else if (dragTarget === "logo") {
      updateConfig({
        logoX: Math.round(dragStartRef.current.startX + dx),
        logoY: Math.round(dragStartRef.current.startY + dy),
      });
    }
  };

  const handleMouseUp = () => {
    setDragTarget(null);
    dragStartRef.current = null;
  };

  // Presets
  const applyCanvaPreset = () => {
    updateConfig({
      nameX: 125,
      nameY: 52,
      whiteoutWidth: 520,
      whiteoutHeight: 60,
      coverOldText: true,
      logoX: 125,
      logoY: -75,
      logoWidth: 80,
      logoHeight: 80,
      coverOldLogo: true,
      oldLogoCoverWidth: 95,
      oldLogoCoverHeight: 95,
      nameColor: "#133e7c",
      nameFontFamily: "Helvetica-Bold",
      nameFontSize: 36,
      showTitle: false,
      showSubtitle: false,
      showBodyPhrase: false,
      showCourse: false,
      showDate: false,
      showSignatures: false,
      isCleanMode: true,
    });
  };

  const applyCenterPreset = () => {
    updateConfig({
      nameX: 0,
      nameY: 0,
      whiteoutWidth: 460,
      whiteoutHeight: 56,
      coverOldText: true,
      logoX: 0,
      logoY: -110,
      logoWidth: 80,
      logoHeight: 80,
      coverOldLogo: true,
      oldLogoCoverWidth: 95,
      oldLogoCoverHeight: 95,
      nameColor: "#133e7c",
      nameFontFamily: "Helvetica-Bold",
      nameFontSize: 36,
      showTitle: false,
      showSubtitle: false,
      showBodyPhrase: false,
      showCourse: false,
      showDate: false,
      isCleanMode: true,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Step 4 — Live Preview</h2>
          <p className="mt-1 text-gray-500">
            Review your dynamic certificates. Drag elements on the certificate to position them, or use the controls below.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTuner(!showTuner)}
            className="gap-1.5 shrink-0 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
          >
            <Sliders size={14} />
            {showTuner ? "Hide Position Tuner" : "Tune Text & Logo"}
          </Button>
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
      </div>

      {/* Smart Quick Presets for Custom Designs */}
      {isCustomBg && (
        <div className="p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-blue-600 shrink-0" />
            <div>
              <span className="font-semibold text-blue-900 block">Custom Template Alignment Presets</span>
              <span className="text-blue-700 text-[11px]">Automatically erase placeholder background text & align logo cleanly</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={applyCanvaPreset}
              className="bg-white hover:bg-blue-50 text-blue-800 border-blue-300 font-medium text-xs gap-1.5 shadow-2xs"
            >
              🪄 Auto-Fit Canva Template (Left Banner)
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={applyCenterPreset}
              className="bg-white hover:bg-gray-50 text-gray-700 border-gray-300 font-medium text-xs gap-1.5 shadow-2xs"
            >
              🎯 Center Layout
            </Button>
          </div>
        </div>
      )}

      {/* Live Position & Alignment Tuner Toolbar (collapsible or persistent for custom templates) */}
      {(showTuner || isCustomBg) && (
        <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3 text-xs text-gray-700">
          <div className="flex items-center justify-between font-semibold text-blue-900">
            <span className="flex items-center gap-1.5">
              <Sliders size={15} />
              Live Name, Logo & Eraser Positioning Controls
            </span>
            <span className="text-[11px] font-normal text-blue-700">💡 Tip: You can also drag the name and logo directly on the canvas!</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {/* Recipient Name Shift X & Y */}
            <div className="bg-white p-2.5 rounded-lg border border-blue-100 space-y-2">
              <div className="flex items-center justify-between font-medium">
                <span className="flex items-center gap-1">
                  <MoveHorizontal size={13} className="text-blue-600" />
                  Name Shift X (Left/Right)
                </span>
                <span className="font-mono text-blue-700">{templateConfig.nameX ?? (isCustomBg ? 125 : 0)}px</span>
              </div>
              <input
                type="range"
                min={-300}
                max={300}
                step={5}
                value={templateConfig.nameX ?? (isCustomBg ? 125 : 0)}
                onChange={(e) => updateConfig({ nameX: Number(e.target.value) })}
                className="w-full h-1.5 bg-gray-200 rounded-lg cursor-pointer"
              />
              <div className="flex items-center justify-between font-medium pt-1">
                <span className="flex items-center gap-1">
                  <MoveVertical size={13} className="text-blue-600" />
                  Name Shift Y (Up/Down)
                </span>
                <span className="font-mono text-blue-700">{templateConfig.nameY ?? (isCustomBg ? 52 : 0)}px</span>
              </div>
              <input
                type="range"
                min={-200}
                max={200}
                step={5}
                value={templateConfig.nameY ?? (isCustomBg ? 52 : 0)}
                onChange={(e) => updateConfig({ nameY: Number(e.target.value) })}
                className="w-full h-1.5 bg-gray-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Recipient Name Whiteout / Eraser Box */}
            <div className="bg-white p-2.5 rounded-lg border border-blue-100 space-y-2">
              <div className="flex items-center justify-between font-medium">
                <span className="flex items-center gap-1">
                  <Eraser size={13} className="text-blue-600" />
                  Erase &quot;Name Surname&quot;
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={templateConfig.coverOldText ?? isCustomBg}
                    onChange={(e) => updateConfig({ coverOldText: e.target.checked })}
                  />
                  <div className="w-7 h-4 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-3"></div>
                </label>
              </div>
              <p className="text-[10px] text-gray-500">
                Paints a clean white box over the background placeholder text
              </p>
              {(templateConfig.coverOldText ?? isCustomBg) && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[10px] text-gray-500">
                    <span>Eraser Width: {templateConfig.whiteoutWidth || 520}px</span>
                  </div>
                  <input
                    type="range"
                    min={200}
                    max={700}
                    step={10}
                    value={templateConfig.whiteoutWidth || 520}
                    onChange={(e) => updateConfig({ whiteoutWidth: Number(e.target.value) })}
                    className="w-full h-1 bg-gray-200 rounded cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500">
                    <span>Eraser Height: {templateConfig.whiteoutHeight || 60}px</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={120}
                    step={2}
                    value={templateConfig.whiteoutHeight || 60}
                    onChange={(e) => updateConfig({ whiteoutHeight: Number(e.target.value) })}
                    className="w-full h-1 bg-gray-200 rounded cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Logo Position & Eraser Box */}
            <div className="bg-white p-2.5 rounded-lg border border-blue-100 space-y-2">
              <div className="flex items-center justify-between font-medium">
                <span className="flex items-center gap-1">
                  <Eraser size={13} className="text-indigo-600" />
                  Erase Old Logo Underneath
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={templateConfig.coverOldLogo ?? isCustomBg}
                    onChange={(e) => updateConfig({ coverOldLogo: e.target.checked })}
                  />
                  <div className="w-7 h-4 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-3"></div>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div>
                  <span className="text-gray-500 block">Logo Shift X: {templateConfig.logoX ?? (isCustomBg ? 125 : 0)}px</span>
                  <input
                    type="range"
                    min={-300}
                    max={300}
                    step={5}
                    value={templateConfig.logoX ?? (isCustomBg ? 125 : 0)}
                    onChange={(e) => updateConfig({ logoX: Number(e.target.value) })}
                    className="w-full h-1 bg-gray-200 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <span className="text-gray-500 block">Logo Shift Y: {templateConfig.logoY ?? (isCustomBg ? -75 : 0)}px</span>
                  <input
                    type="range"
                    min={-200}
                    max={200}
                    step={5}
                    value={templateConfig.logoY ?? (isCustomBg ? -75 : 0)}
                    onChange={(e) => updateConfig({ logoY: Number(e.target.value) })}
                    className="w-full h-1 bg-gray-200 rounded cursor-pointer"
                  />
                </div>
              </div>
              <div className="flex gap-2 text-[10px]">
                <button
                  type="button"
                  onClick={() => updateConfig({ logoWidth: 80, logoHeight: 80, oldLogoCoverWidth: 95, oldLogoCoverHeight: 95 })}
                  className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 rounded"
                >
                  Reset Logo Size (80px)
                </button>
              </div>
            </div>

            {/* Typography & Elements On/Off */}
            <div className="bg-white p-2.5 rounded-lg border border-blue-100 space-y-2">
              <div className="font-medium text-gray-800">Font & Style Match</div>
              <div className="flex flex-wrap gap-1">
                {[
                  { name: "Canva Navy", color: "#133e7c" },
                  { name: "Midnight", color: "#0f2847" },
                  { name: "Royal Blue", color: "#1e3a8a" },
                  { name: "Black", color: "#111827" },
                ].map((item) => (
                  <button
                    key={item.color}
                    type="button"
                    onClick={() => updateConfig({ nameColor: item.color, nameFontFamily: "Helvetica-Bold" })}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] hover:border-blue-400"
                    style={{
                      borderColor: templateConfig.nameColor === item.color ? item.color : "#e5e7eb",
                      fontWeight: templateConfig.nameColor === item.color ? "bold" : "normal"
                    }}
                  >
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </button>
                ))}
              </div>

              <div className="font-medium text-gray-800 pt-1 border-t border-gray-100">Elements On/Off</div>
              <div className="grid grid-cols-2 gap-1 text-[11px]">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shouldShowTitle}
                    onChange={(e) => updateConfig({ showTitle: e.target.checked, isCleanMode: false })}
                    className="rounded text-blue-600"
                  />
                  <span>Title</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shouldShowSubtitle}
                    onChange={(e) => updateConfig({ showSubtitle: e.target.checked, isCleanMode: false })}
                    className="rounded text-blue-600"
                  />
                  <span>Subtitle</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shouldShowCourse}
                    onChange={(e) => updateConfig({ showCourse: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Course</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shouldShowDate}
                    onChange={(e) => updateConfig({ showDate: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Date</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Preview Card with Drag Support */}
      <div
        className="relative w-full rounded-xl overflow-hidden shadow-lg select-none"
        style={{ 
          borderColor: templateConfig.customBackgroundData ? "transparent" : style.border, 
          backgroundColor: templateConfig.customBackgroundData ? "transparent" : style.bg, 
          backgroundImage: templateConfig.customBackgroundData ? `url(${templateConfig.customBackgroundData})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderWidth: templateConfig.customBackgroundData ? "0px" : "4px",
          aspectRatio: "1.414 / 1" 
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Corner Geometric Graphics (only for prestige-geometric without custom image) */}
        {templateConfig.templateId === "prestige-geometric" && !templateConfig.customBackgroundData && (
          <>
            <svg className="absolute inset-y-0 left-0 w-24 h-full pointer-events-none z-0" viewBox="0 0 100 600" preserveAspectRatio="none">
              <polygon points="0,0 70,0 115,310 45,600 0,600" fill="#0f2847" />
              <polygon points="0,360 110,290 75,240 0,290" fill="#f59e0b" />
              <polygon points="0,0 45,0 0,110" fill="#64748b" />
            </svg>
            <svg className="absolute inset-y-0 right-0 w-24 h-full pointer-events-none z-0" viewBox="0 0 100 600" preserveAspectRatio="none">
              <polygon points="100,0 30,0 -15,290 55,600 100,600" fill="#0f2847" />
              <polygon points="100,240 -10,310 25,360 100,310" fill="#f59e0b" />
              <polygon points="100,600 55,600 100,490" fill="#64748b" />
            </svg>
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

        {/* CUSTOM TEMPLATE ANCHORED RENDERING (Absolute Positioning matching PDF) */}
        {isCustomBg ? (
          <div className="absolute inset-0 pointer-events-auto">
            {/* Custom Logo (Draggable + Eraser Box) */}
            {templateConfig.customLogoData && (
              <div
                className="absolute flex items-center justify-center cursor-grab active:cursor-grabbing group z-20"
                style={{
                  left: `calc(50% + ${templateConfig.logoX ?? 125}px)`,
                  top: `calc(50% + ${templateConfig.logoY ?? -75}px)`,
                  transform: "translate(-50%, -50%)",
                }}
                onMouseDown={(e) => handleMouseDown(e, "logo")}
              >
                {/* Logo Eraser Box */}
                {(templateConfig.coverOldLogo ?? true) && (
                  <div
                    className="absolute bg-white rounded pointer-events-none shadow-xs border border-blue-200/40"
                    style={{
                      width: `${templateConfig.oldLogoCoverWidth || 95}px`,
                      height: `${templateConfig.oldLogoCoverHeight || 95}px`,
                      backgroundColor: templateConfig.whiteoutColor || "#ffffff",
                      zIndex: 0,
                    }}
                  />
                )}
                <img
                  src={templateConfig.customLogoData}
                  alt="Custom Logo"
                  className="relative z-10 object-contain pointer-events-none select-none"
                  style={{
                    maxHeight: `${templateConfig.logoHeight || 80}px`,
                    maxWidth: `${templateConfig.logoWidth || 80}px`,
                  }}
                />
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-900/80 text-white text-[10px] px-2 py-0.5 rounded pointer-events-none whitespace-nowrap shadow-sm">
                  ✥ Drag Logo (Eraser Active)
                </div>
              </div>
            )}

            {/* Recipient Name (Draggable + Eraser Box) */}
            <div
              className="absolute flex items-center justify-center cursor-grab active:cursor-grabbing group z-20"
              style={{
                left: `calc(50% + ${templateConfig.nameX ?? 125}px)`,
                top: `calc(50% + ${templateConfig.nameY ?? 52}px)`,
                transform: "translate(-50%, -50%)",
              }}
              onMouseDown={(e) => handleMouseDown(e, "name")}
            >
              {/* Recipient Name Whiteout Box (Eraser) */}
              {(templateConfig.coverOldText ?? true) && (
                <div
                  className="absolute bg-white rounded pointer-events-none shadow-xs border border-blue-200/40"
                  style={{
                    width: `${templateConfig.whiteoutWidth || 520}px`,
                    height: `${templateConfig.whiteoutHeight || 60}px`,
                    backgroundColor: templateConfig.whiteoutColor || "#ffffff",
                    zIndex: 0,
                  }}
                />
              )}
              <div
                className="font-bold leading-tight break-words relative z-10 px-3 select-none text-center"
                style={{
                  color: templateConfig.nameColor || "#133e7c",
                  fontSize: `clamp(16px, ${(templateConfig.nameFontSize || 36) * 0.8}px, 44px)`,
                  fontFamily: templateConfig.customFontName ? "sans-serif" : "Helvetica, Arial, sans-serif",
                  maxWidth: `${(templateConfig.whiteoutWidth || 520) - 20}px`,
                }}
              >
                {displayName}
              </div>
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-900/80 text-white text-[10px] px-2 py-0.5 rounded pointer-events-none whitespace-nowrap shadow-sm">
                ✥ Drag Recipient Name (Eraser Active)
              </div>
            </div>

            {/* Course Name (if enabled) */}
            {shouldShowCourse && (
              <div
                className="absolute font-semibold text-sm leading-snug max-w-md my-0.5 text-center z-10"
                style={{
                  left: `calc(50% + ${templateConfig.courseX ?? (templateConfig.nameX ?? 125)}px)`,
                  top: `calc(50% + ${templateConfig.courseY ?? ((templateConfig.nameY ?? 52) + 45)}px)`,
                  transform: "translate(-50%, -50%)",
                  color: templateConfig.courseColor || "#374151",
                }}
              >
                {row.course || "(no course)"}
              </div>
            )}

            {/* Date (if enabled) */}
            {shouldShowDate && (
              <div
                className="absolute text-xs z-10 text-center"
                style={{
                  left: `calc(50% + ${templateConfig.dateX ?? 0}px)`,
                  top: `calc(50% + ${templateConfig.dateY ?? 180}px)`,
                  transform: "translate(-50%, -50%)",
                  color: templateConfig.dateColor || "#6b7280",
                }}
              >
                {(templateConfig.datePrefix || "Issued:")} {row.date || "—"}
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
            <div className="absolute bottom-2 left-0 right-0 text-center text-[7px] text-gray-300 pointer-events-none">
              Issued via Certify Studio Free
            </div>
          </div>
        ) : (
          /* STANDARD TEMPLATE CLASSIC RENDERING */
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 py-6 z-10">
            {/* Custom Logo */}
            {templateConfig.customLogoData && (
              <img 
                src={templateConfig.customLogoData} 
                alt="Custom Logo" 
                className="max-h-16 mb-4 object-contain" 
              />
            )}

            {/* Title & Subtitle */}
            {shouldShowTitle && (
              templateConfig.templateId === "prestige-geometric" && !templateConfig.customTitle ? (
                <div 
                  className="mb-2"
                  style={{ transform: `translate(${templateConfig.titleX || 0}px, ${templateConfig.titleY || 0}px)` }}
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
                  {shouldShowSubtitle && (
                    <div 
                      className="italic"
                      style={{ 
                        fontSize: templateConfig.subtitleFontSize ? `${templateConfig.subtitleFontSize * 0.8}px` : "0.75rem",
                        color: templateConfig.subtitleColor || (templateConfig.isDarkModeTemplate ? "#e5e7eb" : "#64748b")
                      }}
                    >
                      {templateConfig.customSubtitle || "This certificate is proudly presented to"}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ transform: `translate(${templateConfig.titleX || 0}px, ${templateConfig.titleY || 0}px)` }}>
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
                  
                  {shouldShowSubtitle && (
                    <div 
                      className="italic mb-2" 
                      style={{ 
                        fontSize: templateConfig.subtitleFontSize ? `${templateConfig.subtitleFontSize * 0.8}px` : "0.75rem",
                        color: templateConfig.subtitleColor || (templateConfig.isDarkModeTemplate ? "#e5e7eb" : "#6b7280") 
                      }}
                    >
                      {templateConfig.customSubtitle || "This certifies that"}
                    </div>
                  )}
                </div>
              )
            )}

            {/* Recipient Name with optional Whiteout Eraser Box */}
            <div
              className="relative flex items-center justify-center my-1"
              style={{
                transform: `translate(${templateConfig.nameX || 0}px, ${templateConfig.nameY || 0}px)`,
              }}
            >
              {templateConfig.coverOldText && (
                <div
                  className="absolute bg-white rounded pointer-events-none shadow-xs"
                  style={{
                    width: `${templateConfig.whiteoutWidth || 520}px`,
                    height: `${templateConfig.whiteoutHeight || 60}px`,
                    zIndex: 0,
                  }}
                />
              )}
              <div
                className="font-bold leading-tight break-words max-w-full relative z-10 px-4"
                style={{
                  color: templateConfig.templateId === "prestige-geometric" && !templateConfig.nameColor ? "#0f2847" : templateConfig.nameColor,
                  fontSize: `clamp(14px, ${templateConfig.nameFontSize * 0.8}px, 42px)`,
                  fontFamily: templateConfig.customFontName ? "sans-serif" : "inherit",
                }}
              >
                {displayName}
              </div>
            </div>

            {/* Underline and Body Phrase */}
            {shouldShowBody && (
              <div style={{ transform: `translateX(${templateConfig.nameX || 0}px)` }}>
                <div
                  className="w-3/4 h-px my-2 mx-auto"
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
              </div>
            )}

            {/* Course Name */}
            {shouldShowCourse && (
              <div
                className="font-semibold text-sm leading-snug max-w-md my-0.5"
                style={{ 
                  color: templateConfig.templateId === "prestige-geometric" ? "#0f2847" : templateConfig.courseColor,
                  transform: `translate(${templateConfig.courseX || 0}px, ${templateConfig.courseY || 0}px)`
                }}
              >
                {row.course || "(no course)"}
              </div>
            )}

            {/* Date */}
            {shouldShowDate && (
              <div 
                className="mt-1 text-xs" 
                style={{ 
                  color: templateConfig.isDarkModeTemplate ? "#d1d5db" : "#9ca3af",
                  transform: `translate(${templateConfig.dateX || 0}px, ${templateConfig.dateY || 0}px)` 
                }}
              >
                {(templateConfig.datePrefix || "Issued:")} {row.date || "—"}
              </div>
            )}

            {/* Dual Signatures & Center Seal */}
            {shouldShowSignatures && (
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
                      <div className="w-3 h-8 bg-amber-500 rotate-[-15deg] rounded-b-sm" />
                      <div className="w-3 h-8 bg-amber-500 rotate-[15deg] rounded-b-sm" />
                    </div>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 flex items-center justify-center shadow-md border-2 border-amber-200">
                      <div className="w-9 h-9 rounded-full border border-amber-200/60 flex items-center justify-center bg-[#0f2847]">
                        <span className="text-[7px] font-black text-amber-300 tracking-wider">AWARD</span>
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
            <div className="absolute bottom-2 left-0 right-0 text-center text-[7px] text-gray-300 pointer-events-none">
              Issued via Certify Studio Free
            </div>
          </div>
        )}
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
