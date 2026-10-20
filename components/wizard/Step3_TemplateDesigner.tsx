"use client";

import { useState } from "react";
import { Palette, Type, Move, Sparkles, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store";

export interface TemplateConfig {
  templateId: string;
  nameFontSize: number;
  nameFontFamily: string;
  nameColor: string;
  nameX?: number; // Horizontal offset in px (-300 to +300)
  nameY: number;  // Vertical offset in px
  courseFontSize: number;
  courseFontFamily: string;
  courseColor: string;
  courseX?: number;
  courseY: number;
  dateFontSize: number;
  dateFontFamily: string;
  dateColor: string;
  dateX?: number;
  dateY: number;
  qrX: number;
  qrY: number;
  qrSize: number;
  logoUrl: string;
  logoX?: number;
  logoY?: number;
  logoWidth?: number;
  logoHeight?: number;
  coverOldLogo?: boolean;
  oldLogoCoverWidth?: number;
  oldLogoCoverHeight?: number;
  customBackgroundData?: string; // base64 URI
  customLogoData?: string; // base64 URI
  customFontData?: string; // base64 URI
  customFontName?: string;
  isDarkModeTemplate?: boolean;
  isCleanMode?: boolean; // Hides built-in static text
  coverOldText?: boolean; // Draws white boxes behind dynamic text
  whiteoutWidth?: number; // Width of whiteout box
  whiteoutHeight?: number; // Height of whiteout box
  whiteoutColor?: string;

  // Element Visibility Toggles
  showTitle?: boolean;
  showSubtitle?: boolean;
  showBodyPhrase?: boolean;
  showCourse?: boolean;
  showDate?: boolean;

  // Customizable Phrases & Text
  customTitle?: string;
  customSubtitle?: string;
  customBodyPhrase?: string;
  leftSignatureTitle?: string;
  rightSignatureTitle?: string;
  datePrefix?: string;
  showSignatures?: boolean;

  // Customizable Sizes & Typography
  titleFontSize?: number;
  titleColor?: string;
  titleX?: number;
  titleY?: number;
  subtitleFontSize?: number;
  subtitleColor?: string;
  bodyPhraseFontSize?: number;
  bodyPhraseColor?: string;
}

const TEMPLATES = [
  {
    id: "academic-gold",
    name: "Academic Gold",
    description: "Traditional warm-toned design for universities & schools",
    preview: "bg-gradient-to-br from-yellow-50 to-amber-100 border-amber-400",
    accent: "#b7791f",
  },
  {
    id: "corporate-sleek",
    name: "Corporate Sleek",
    description: "Modern blue design for business & professional certifications",
    preview: "bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-400",
    accent: "#1e3a8a",
  },
  {
    id: "minimalist",
    name: "Minimalist",
    description: "Clean, minimal design for modern courses & workshops",
    preview: "bg-gradient-to-br from-gray-50 to-slate-100 border-gray-300",
    accent: "#374151",
  },
  {
    id: "prestige-geometric",
    name: "Executive Achievement",
    description: "Navy & gold geometric border with dual signature lines and medal seal",
    preview: "bg-gradient-to-br from-blue-900 via-slate-100 to-amber-500 border-blue-800",
    accent: "#0f2847",
  },
  {
    id: "custom",
    name: "Custom Canvas",
    description: "Neutral modern canvas ready for your custom wording and branding",
    preview: "bg-gradient-to-br from-indigo-50 to-purple-100 border-indigo-400",
    accent: "#4f46e5",
  },
];

const FONT_FAMILIES = [
  { value: "Helvetica-Bold", label: "Sans-Serif Bold (Helvetica)" },
  { value: "Helvetica", label: "Sans-Serif (Helvetica)" },
  { value: "Times-Bold", label: "Serif Bold (Times)" },
  { value: "Times-Roman", label: "Serif (Times)" },
  { value: "Courier", label: "Mono (Courier)" },
];

export default function Step3_TemplateDesigner() {
  const { templateConfig, setTemplateConfig, setStep } = useStore();
  const [activeTab, setActiveTab] = useState<"template" | "phrases" | "name" | "layout" | "assets">("template");

  const update = (patch: Partial<TemplateConfig>) => {
    setTemplateConfig({ ...templateConfig, ...patch });
  };

  const selectedTemplate = TEMPLATES.find((t) => t.id === templateConfig.templateId) ?? TEMPLATES[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Step 3 — Template Designer</h2>
        <p className="mt-1 text-gray-500">
          Choose a base template and customize your own certificate phrases, typography, and layout.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(["template", "phrases", "name", "layout", "assets"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
              activeTab === tab
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            {tab === "template"
              ? "Base Template"
              : tab === "phrases"
              ? "Phrases & Wording"
              : tab === "name"
              ? "Typography"
              : tab === "layout"
              ? "Layout"
              : "Assets"}
          </button>
        ))}
      </div>

      {/* Template Selector */}
      {activeTab === "template" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => {
                if (tmpl.id === "custom") {
                  update({
                    templateId: tmpl.id,
                    isCleanMode: true,
                    showTitle: false,
                    showSubtitle: false,
                    showBodyPhrase: false,
                    showSignatures: false,
                  });
                  setActiveTab("assets");
                } else {
                  update({ templateId: tmpl.id });
                }
              }}
              className={`text-left p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                templateConfig.templateId === tmpl.id
                  ? "border-blue-500 ring-2 ring-blue-200"
                  : "border-gray-200"
              }`}
            >
              <div
                className={`h-24 rounded-lg border mb-3 flex items-center justify-center ${tmpl.preview}`}
                style={{ borderColor: tmpl.accent }}
              >
                <div className="text-center px-2">
                  <div className="text-xs font-bold" style={{ color: tmpl.accent }}>
                    {tmpl.id === "custom" ? "Custom Design" : "Certificate of Completion"}
                  </div>
                  <div className="text-xs mt-1 text-gray-500">Recipient Name</div>
                </div>
              </div>
              <div className="font-semibold text-gray-900 text-sm">{tmpl.name}</div>
              <div className="text-xs text-gray-500 mt-0.5">{tmpl.description}</div>
            </button>
          ))}
        </div>
      )}

      {/* Phrases & Custom Wording */}
      {activeTab === "phrases" && (
        <div className="space-y-6">
          {/* Quick Presets */}
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-purple-600" />
              <span className="font-semibold text-purple-900 text-sm">Quick Wording Presets</span>
            </div>
            <p className="text-xs text-purple-700">
              Click a preset below to instantly populate common certificate wording, or customize any field below.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => update({
                  customTitle: "Certificate of Completion",
                  customSubtitle: "This certifies that",
                  customBodyPhrase: "has successfully completed the course in",
                })}
                className="px-3 py-1.5 bg-white border border-purple-300 hover:border-purple-500 rounded-lg text-xs font-medium text-purple-800 transition"
              >
                🎓 Course Completion
              </button>
              <button
                type="button"
                onClick={() => update({
                  customTitle: "Certificate of Achievement",
                  customSubtitle: "This certificate is proudly presented to",
                  customBodyPhrase: "in recognition of outstanding academic achievement and mastery in",
                })}
                className="px-3 py-1.5 bg-white border border-purple-300 hover:border-purple-500 rounded-lg text-xs font-medium text-purple-800 transition"
              >
                🏆 Achievement & Honors
              </button>
              <button
                type="button"
                onClick={() => update({
                  customTitle: "Certificate of Appreciation",
                  customSubtitle: "Presented with deepest appreciation to",
                  customBodyPhrase: "for extraordinary dedication, leadership, and invaluable contribution to",
                })}
                className="px-3 py-1.5 bg-white border border-purple-300 hover:border-purple-500 rounded-lg text-xs font-medium text-purple-800 transition"
              >
                🌟 Appreciation & Service
              </button>
              <button
                type="button"
                onClick={() => update({
                  customTitle: "Certificate of Participation",
                  customSubtitle: "This certifies that",
                  customBodyPhrase: "has actively participated in the workshop and training program on",
                })}
                className="px-3 py-1.5 bg-white border border-purple-300 hover:border-purple-500 rounded-lg text-xs font-medium text-purple-800 transition"
              >
                🤝 Workshop Participation
              </button>
            </div>
          </div>

          {/* Custom Template Notice */}
          {(templateConfig.customBackgroundData || templateConfig.templateId === "custom") && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5 text-xs text-emerald-800">
              <div className="font-bold flex items-center gap-1.5 text-sm text-emerald-900">
                ✨ Custom Template Active
              </div>
              <p>
                Built-in titles and phrases are hidden by default so they won&apos;t overwrite the design on your uploaded background image.
                Use the toggles below if you want to turn on any specific text elements.
              </p>
            </div>
          )}

          {/* Visibility Controls */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-800 text-sm">Text Elements Included on Certificate</span>
              <span className="text-xs text-gray-500">Check what to print</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <label className="flex items-center gap-2 p-2 rounded-lg border bg-white cursor-pointer hover:border-blue-300">
                <input
                  type="checkbox"
                  checked={templateConfig.showTitle ?? (!templateConfig.customBackgroundData && templateConfig.templateId !== "custom")}
                  onChange={(e) => update({ showTitle: e.target.checked, isCleanMode: false })}
                  className="rounded text-blue-600"
                />
                <span className="font-medium text-gray-700">Certificate Title</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-lg border bg-white cursor-pointer hover:border-blue-300">
                <input
                  type="checkbox"
                  checked={templateConfig.showSubtitle ?? (!templateConfig.customBackgroundData && templateConfig.templateId !== "custom")}
                  onChange={(e) => update({ showSubtitle: e.target.checked, isCleanMode: false })}
                  className="rounded text-blue-600"
                />
                <span className="font-medium text-gray-700">Subtitle / Presenter Line</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-lg border bg-white cursor-pointer hover:border-blue-300">
                <input
                  type="checkbox"
                  checked={templateConfig.showBodyPhrase ?? (!templateConfig.customBackgroundData && templateConfig.templateId !== "custom")}
                  onChange={(e) => update({ showBodyPhrase: e.target.checked, isCleanMode: false })}
                  className="rounded text-blue-600"
                />
                <span className="font-medium text-gray-700">Completion Body Phrase</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-lg border bg-white cursor-pointer hover:border-blue-300">
                <input
                  type="checkbox"
                  checked={templateConfig.showCourse ?? true}
                  onChange={(e) => update({ showCourse: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <span className="font-medium text-gray-700">Course / Event Name</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-lg border bg-white cursor-pointer hover:border-blue-300">
                <input
                  type="checkbox"
                  checked={templateConfig.showDate ?? true}
                  onChange={(e) => update({ showDate: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <span className="font-medium text-gray-700">Issue Date</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-lg border bg-white cursor-pointer hover:border-blue-300">
                <input
                  type="checkbox"
                  checked={templateConfig.showSignatures ?? (templateConfig.templateId === "prestige-geometric" && !templateConfig.customBackgroundData)}
                  onChange={(e) => update({ showSignatures: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <span className="font-medium text-gray-700">Signatures Line</span>
              </label>
            </div>
          </div>

          {/* Primary Titles */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-blue-600" />
              <span className="font-semibold text-gray-800 text-sm">Certificate Phrases & Text</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Certificate Title</label>
                <input
                  type="text"
                  value={templateConfig.customTitle || ""}
                  onChange={(e) => update({ customTitle: e.target.value })}
                  placeholder="e.g., Certificate of Completion / Certificate of Appreciation"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                />
                <p className="text-[11px] text-gray-400 mt-1">Leave blank to use the base template's default title.</p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Presenter / Subtitle Line</label>
                <input
                  type="text"
                  value={templateConfig.customSubtitle || ""}
                  onChange={(e) => update({ customSubtitle: e.target.value })}
                  placeholder="e.g., This certifies that / This certificate is proudly presented to"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Completion / Achievement Phrase</label>
                <input
                  type="text"
                  value={templateConfig.customBodyPhrase || ""}
                  onChange={(e) => update({ customBodyPhrase: e.target.value })}
                  placeholder="e.g., has successfully completed the course in / in recognition of excellence in"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                />
                <p className="text-[11px] text-gray-400 mt-1">Appears right between the recipient's name and the course/subject name.</p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Date Prefix</label>
                <input
                  type="text"
                  value={templateConfig.datePrefix || ""}
                  onChange={(e) => update({ datePrefix: e.target.value })}
                  placeholder="e.g., Issued: / Date Awarded: / Conferred on:"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                />
              </div>
            </div>
          </div>

          {/* Signatures Configuration */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-gray-800 text-sm block">Display Signature Lines</span>
                <span className="text-xs text-gray-500">Render dual signature lines at the bottom of the certificate.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={templateConfig.showSignatures ?? (templateConfig.templateId === "prestige-geometric")}
                  onChange={(e) => update({ showSignatures: e.target.checked })}
                />
                <div className="w-9 h-5 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-300 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
              </label>
            </div>

            {(templateConfig.showSignatures ?? (templateConfig.templateId === "prestige-geometric")) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Left Signatory Title</label>
                  <input
                    type="text"
                    value={templateConfig.leftSignatureTitle ?? "Authorized Signature"}
                    onChange={(e) => update({ leftSignatureTitle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                    placeholder="e.g., Authorized Signature / Program Dean"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Right Signatory Title</label>
                  <input
                    type="text"
                    value={templateConfig.rightSignatureTitle ?? "Director of Certification"}
                    onChange={(e) => update({ rightSignatureTitle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                    placeholder="e.g., Director of Certification / Head Instructor"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Typography */}
      {activeTab === "name" && (
        <div className="space-y-6">
          {/* Certificate Title */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
            <div className="flex items-center gap-2">
              <Type size={16} className="text-amber-600" />
              <span className="font-semibold text-gray-800 text-sm">Certificate Title Styling</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Title Font Size (pt)</label>
                <input
                  type="number"
                  value={templateConfig.titleFontSize || 24}
                  onChange={(e) => update({ titleFontSize: Number(e.target.value) })}
                  min={14} max={60}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Title Color</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={templateConfig.titleColor || "#1e293b"}
                    onChange={(e) => update({ titleColor: e.target.value })}
                    className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={templateConfig.titleColor || ""}
                    placeholder="Default accent"
                    onChange={(e) => update({ titleColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Vertical Offset (px)</label>
                <input
                  type="number"
                  value={templateConfig.titleY || 0}
                  onChange={(e) => update({ titleY: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  placeholder="0 = default, 50 = down, -50 = up"
                />
              </div>
            </div>
          </div>

          {/* Subtitle / Presenter Line */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
            <div className="flex items-center gap-2">
              <Type size={16} className="text-gray-600" />
              <span className="font-semibold text-gray-800 text-sm">Presenter / Subtitle Styling</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Subtitle Font Size (pt)</label>
                <input
                  type="number"
                  value={templateConfig.subtitleFontSize || 13}
                  onChange={(e) => update({ subtitleFontSize: Number(e.target.value) })}
                  min={9} max={30}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Subtitle Color</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={templateConfig.subtitleColor || "#64748b"}
                    onChange={(e) => update({ subtitleColor: e.target.value })}
                    className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={templateConfig.subtitleColor || ""}
                    placeholder="Default gray"
                    onChange={(e) => update({ subtitleColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Name field */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
            <div className="flex items-center gap-2">
              <Type size={16} className="text-blue-600" />
              <span className="font-semibold text-gray-800 text-sm">Recipient Name Field</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Font Family</label>
                <select
                  value={templateConfig.nameFontFamily}
                  onChange={(e) => update({ nameFontFamily: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                >
                  {FONT_FAMILIES.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Font Size (pt)</label>
                <input
                  type="number"
                  value={templateConfig.nameFontSize}
                  onChange={(e) => update({ nameFontSize: Number(e.target.value) })}
                  min={14} max={72}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Color</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={templateConfig.nameColor}
                    onChange={(e) => update({ nameColor: e.target.value })}
                    className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={templateConfig.nameColor}
                    onChange={(e) => update({ nameColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Vertical Offset Y (px)</label>
                <input
                  type="number"
                  value={templateConfig.nameY || 0}
                  onChange={(e) => update({ nameY: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="0 = default, 50 = down, -50 = up"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Horizontal Offset X (px)</label>
                <input
                  type="number"
                  value={templateConfig.nameX || 0}
                  onChange={(e) => update({ nameX: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="0 = center, 80 = right, -80 = left"
                />
              </div>
            </div>
            {/* Custom Font Upload */}
            <div className="pt-2 border-t border-gray-200">
               <label className="text-xs font-medium text-gray-600 mb-1 block">Custom Font (.ttf / .otf)</label>
               <input
                 type="file"
                 accept=".ttf,.otf"
                 onChange={(e) => {
                   const file = e.target.files?.[0];
                   if (file) {
                     const reader = new FileReader();
                     reader.onload = (ev) => {
                       update({ 
                         customFontData: ev.target?.result as string,
                         customFontName: file.name
                       });
                     };
                     reader.readAsDataURL(file);
                   }
                 }}
                 className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
               />
               {templateConfig.customFontName && (
                 <p className="text-xs text-green-600 mt-1">Loaded: {templateConfig.customFontName}</p>
               )}
            </div>
          </div>

          {/* Completion / Body Phrase field */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
            <div className="flex items-center gap-2">
              <Type size={16} className="text-indigo-600" />
              <span className="font-semibold text-gray-800 text-sm">Completion / Body Phrase Styling</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Body Phrase Font Size (pt)</label>
                <input
                  type="number"
                  value={templateConfig.bodyPhraseFontSize || 12}
                  onChange={(e) => update({ bodyPhraseFontSize: Number(e.target.value) })}
                  min={8} max={28}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Body Phrase Color</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={templateConfig.bodyPhraseColor || "#64748b"}
                    onChange={(e) => update({ bodyPhraseColor: e.target.value })}
                    className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={templateConfig.bodyPhraseColor || ""}
                    placeholder="Default gray"
                    onChange={(e) => update({ bodyPhraseColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Course field */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
            <div className="flex items-center gap-2">
              <Type size={16} className="text-purple-600" />
              <span className="font-semibold text-gray-800 text-sm">Course Name Field</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Font Size (pt)</label>
                <input
                  type="number"
                  value={templateConfig.courseFontSize}
                  onChange={(e) => update({ courseFontSize: Number(e.target.value) })}
                  min={10} max={48}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Color</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={templateConfig.courseColor}
                    onChange={(e) => update({ courseColor: e.target.value })}
                    className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={templateConfig.courseColor}
                    onChange={(e) => update({ courseColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Vertical Offset Y (px)</label>
                <input
                  type="number"
                  value={templateConfig.courseY || 0}
                  onChange={(e) => update({ courseY: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="0 = default, 50 = down, -50 = up"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Horizontal Offset X (px)</label>
                <input
                  type="number"
                  value={templateConfig.courseX || 0}
                  onChange={(e) => update({ courseX: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="0 = center, 80 = right, -80 = left"
                />
              </div>
            </div>
          </div>

          {/* Date field */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
            <div className="flex items-center gap-2">
              <Type size={16} className="text-pink-600" />
              <span className="font-semibold text-gray-800 text-sm">Issue Date Field</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Font Size (pt)</label>
                <input
                  type="number"
                  value={templateConfig.dateFontSize}
                  onChange={(e) => update({ dateFontSize: Number(e.target.value) })}
                  min={8} max={36}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Color</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={templateConfig.dateColor}
                    onChange={(e) => update({ dateColor: e.target.value })}
                    className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={templateConfig.dateColor}
                    onChange={(e) => update({ dateColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Vertical Offset Y (px)</label>
                <input
                  type="number"
                  value={templateConfig.dateY || 0}
                  onChange={(e) => update({ dateY: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="0 = default, 50 = down, -50 = up"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Horizontal Offset X (px)</label>
                <input
                  type="number"
                  value={templateConfig.dateX || 0}
                  onChange={(e) => update({ dateX: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="0 = center, 80 = right, -80 = left"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Layout */}
      {activeTab === "layout" && (
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
          <div className="flex items-center gap-2">
            <Move size={16} className="text-green-600" />
            <span className="font-semibold text-gray-800 text-sm">QR Code Position & Size</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">QR Size (pt)</label>
              <input
                type="number"
                value={templateConfig.qrSize}
                onChange={(e) => update({ qrSize: Number(e.target.value) })}
                min={50} max={150}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500">
            QR code is auto-positioned in the bottom-right of the certificate.
            The size above controls how large it renders in the PDF.
          </p>
        </div>
      )}

      {/* Assets */}
      {activeTab === "assets" && (
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-6">
          {/* Background Upload */}
          <div>
            <label className="text-sm font-semibold text-gray-800 block mb-1">Custom Background Image (PNG/JPG)</label>
            <p className="text-xs text-gray-500 mb-3">Overrides the built-in template style. Must be exactly A4 landscape (297x210mm or 842x595px).</p>
            <input
              type="file"
              accept=".png,.jpg,.jpeg"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    update({
                      customBackgroundData: ev.target?.result as string,
                      templateId: "custom",
                      isCleanMode: true,
                      showTitle: false,
                      showSubtitle: false,
                      showBodyPhrase: false,
                      showSignatures: false,
                      showCourse: false,
                      showDate: false,
                      coverOldText: true,
                      whiteoutWidth: 520,
                      whiteoutHeight: 60,
                      nameColor: "#133e7c",
                      nameFontFamily: "Helvetica-Bold",
                      nameFontSize: 36,
                      nameX: 125,
                      nameY: 52,
                      logoX: 125,
                      logoY: -75,
                      coverOldLogo: true,
                      oldLogoCoverWidth: 95,
                      oldLogoCoverHeight: 95,
                    });
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {templateConfig.customBackgroundData && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-3">
                  <img src={templateConfig.customBackgroundData} alt="Custom Background" className="h-16 w-auto border rounded shadow-xs" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => update({
                      customBackgroundData: undefined,
                      showTitle: true,
                      showSubtitle: true,
                      showBodyPhrase: true,
                      isCleanMode: false,
                    })}
                  >
                    Remove
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 text-xs gap-1"
                    onClick={() => update({
                      nameX: 125,
                      nameY: 52,
                      whiteoutWidth: 520,
                      whiteoutHeight: 60,
                      coverOldText: true,
                      logoX: 125,
                      logoY: -75,
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
                    })}
                  >
                    🪄 Auto-Fit Canva Template (Left Banner Layout)
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-xs gap-1"
                    onClick={() => update({
                      nameX: 0,
                      nameY: 0,
                      whiteoutWidth: 460,
                      whiteoutHeight: 56,
                      coverOldText: true,
                      logoX: 0,
                      logoY: -110,
                      coverOldLogo: true,
                      oldLogoCoverWidth: 95,
                      oldLogoCoverHeight: 95,
                      nameColor: "#133e7c",
                      nameFontFamily: "Helvetica-Bold",
                      showTitle: false,
                      showSubtitle: false,
                      showBodyPhrase: false,
                      showCourse: false,
                      showDate: false,
                      isCleanMode: true,
                    })}
                  >
                    🎯 Center Alignment
                  </Button>
                </div>
              </div>
            )}
          </div>

          <hr className="border-gray-200" />

          {/* Logo Upload & Positioning */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold text-gray-800 block mb-1">Custom Logo (PNG/JPG)</label>
              <p className="text-xs text-gray-500 mb-3">Upload your organization or university logo to place on the certificate.</p>
              <input
                type="file"
                accept=".png,.jpg,.jpeg"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      update({ 
                        customLogoData: ev.target?.result as string,
                        coverOldLogo: true,
                      });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {templateConfig.customLogoData && (
              <div className="p-3 bg-white border border-gray-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={templateConfig.customLogoData} alt="Custom Logo" className="h-12 w-auto border rounded bg-white p-1" />
                    <span className="text-xs text-gray-600">Logo loaded</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => update({ customLogoData: undefined })}>Remove</Button>
                </div>

                {/* Cover Old Logo Toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div>
                    <span className="text-xs font-semibold text-gray-800 block">Erase / Whiteout Previous Logo</span>
                    <span className="text-[11px] text-gray-500">Paints a clean white box behind your logo to hide the template's previous logo</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={templateConfig.coverOldLogo ?? true}
                      onChange={(e) => update({ coverOldLogo: e.target.checked })}
                    />
                    <div className="w-8 h-4 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-300 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4"></div>
                  </label>
                </div>

                {/* Logo Position & Size */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                  <div>
                    <label className="text-[11px] text-gray-600 block mb-0.5">Logo Shift X (px)</label>
                    <input
                      type="number"
                      value={templateConfig.logoX || 0}
                      onChange={(e) => update({ logoX: Number(e.target.value) })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-600 block mb-0.5">Logo Shift Y (px)</label>
                    <input
                      type="number"
                      value={templateConfig.logoY || 0}
                      onChange={(e) => update({ logoY: Number(e.target.value) })}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-600 block mb-0.5">Logo Width (px)</label>
                    <input
                      type="number"
                      value={templateConfig.logoWidth || 80}
                      onChange={(e) => update({ logoWidth: Number(e.target.value) })}
                      min={30} max={200}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-600 block mb-0.5">Logo Height (px)</label>
                    <input
                      type="number"
                      value={templateConfig.logoHeight || 80}
                      onChange={(e) => update({ logoHeight: Number(e.target.value) })}
                      min={30} max={200}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <hr className="border-gray-200" />

          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between mt-4">
            <div>
              <span className="font-semibold text-gray-800 text-sm block">Dark Mode Background</span>
              <span className="text-xs text-gray-500">Enable if you uploaded a dark background. This turns static text (like "This certifies that") white.</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={templateConfig.isDarkModeTemplate || false}
                onChange={(e) => update({ isDarkModeTemplate: e.target.checked })}
              />
              <div className="w-9 h-5 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-300 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
            </label>
          </div>

          <hr className="border-gray-200" />

          {/* Clean Mode Toggle (Hide Static Text) */}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-gray-800 text-sm block">Clean Mode (Hide Static Text)</span>
              <span className="text-xs text-gray-500">Use this if your Canva background already has title text and lines. This will hide all built-in text except the recipient's name, course, and date.</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={templateConfig.isCleanMode || false}
                onChange={(e) => update({ isCleanMode: e.target.checked })}
              />
              <div className="w-9 h-5 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-300 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
            </label>
          </div>

          <hr className="border-gray-200" />

          {/* Eraser / Whiteout Toggle */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-gray-800 text-sm block">Whiteout / Cover Placeholder Text</span>
                <span className="text-xs text-gray-500">
                  Draws a solid white box behind the recipient name to erase pre-existing text (like &quot;Name Surname&quot;) on your Canva template image.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={templateConfig.coverOldText || false}
                  onChange={(e) => update({ coverOldText: e.target.checked })}
                />
                <div className="w-9 h-5 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-300 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
              </label>
            </div>

            {templateConfig.coverOldText && (
              <div className="grid grid-cols-2 gap-4 p-3 bg-white rounded-lg border border-gray-200">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">
                    Whiteout Box Width (px)
                  </label>
                  <input
                    type="number"
                    value={templateConfig.whiteoutWidth || 380}
                    onChange={(e) => update({ whiteoutWidth: Number(e.target.value) })}
                    min={150}
                    max={700}
                    step={10}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">
                    Whiteout Box Height (px)
                  </label>
                  <input
                    type="number"
                    value={templateConfig.whiteoutHeight || 46}
                    onChange={(e) => update({ whiteoutHeight: Number(e.target.value) })}
                    min={20}
                    max={120}
                    step={2}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preview Summary */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <Palette size={16} className="text-blue-600" />
          <span className="text-sm font-semibold text-blue-800">Current Selection</span>
        </div>
        <p className="text-sm text-blue-700">
          Template: <strong>{selectedTemplate.name}</strong> · Name: <strong>{templateConfig.nameFontSize}pt</strong> · QR: <strong>{templateConfig.qrSize}pt</strong>
        </p>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep(2)}>← Back</Button>
        <Button onClick={() => setStep(4)}>Continue to Preview →</Button>
      </div>
    </div>
  );
}
