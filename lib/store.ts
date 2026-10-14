import { create } from "zustand";
import type { Recipient } from "./demo-data";
import type { FieldMapping } from "@/components/wizard/Step2_FieldMap";
import type { TemplateConfig } from "@/components/wizard/Step3_TemplateDesigner";
import type { PreflightSummary } from "./preflight";
import type { Credential } from "./credential-store";

export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

interface AppState {
  // Navigation
  currentStep: WizardStep;
  setStep: (step: WizardStep) => void;

  // Step 1 — Ingest
  rawRows: Record<string, string>[];
  headers: string[];
  setRawData: (rows: Record<string, string>[], headers: string[]) => void;

  // Step 2 — Field Mapping
  fieldMapping: FieldMapping;
  setFieldMapping: (mapping: FieldMapping) => void;
  applyTitleCase: boolean;
  setApplyTitleCase: (v: boolean) => void;
  trimWhitespace: boolean;
  setTrimWhitespace: (v: boolean) => void;
  mappedRows: Recipient[];
  setMappedRows: (rows: Recipient[]) => void;

  // Step 3 — Template
  templateConfig: TemplateConfig;
  setTemplateConfig: (cfg: TemplateConfig) => void;

  // Step 5 — Preflight
  preflightSummary: PreflightSummary | null;
  setPreflightSummary: (s: PreflightSummary) => void;

  // Step 6/7 — Generated
  issuedCredentials: Credential[];
  addCredentials: (creds: Credential[]) => void;
  setCredentials: (creds: Credential[]) => void;

  // Free tier enforcement
  isPaidTier: boolean;
  FREE_TIER_LIMIT: number;
}

export const useStore = create<AppState>((set) => ({
  currentStep: 1,
  setStep: (step) => set({ currentStep: step }),

  rawRows: [],
  headers: [],
  setRawData: (rows, headers) => set({ rawRows: rows, headers }),

  fieldMapping: {
    recipient_name: "",
    recipient_email: "",
    course_title: "",
    issue_date: "",
  },
  setFieldMapping: (mapping) => set({ fieldMapping: mapping }),
  applyTitleCase: true,
  setApplyTitleCase: (v) => set({ applyTitleCase: v }),
  trimWhitespace: true,
  setTrimWhitespace: (v) => set({ trimWhitespace: v }),
  mappedRows: [],
  setMappedRows: (rows) => set({ mappedRows: rows }),

  templateConfig: {
    templateId: "academic-gold",
    nameFontSize: 36,
    nameFontFamily: "Helvetica-Bold",
    nameColor: "#1e3a8a",
    nameY: 0,
    courseFontSize: 22,
    courseFontFamily: "Helvetica",
    courseColor: "#374151",
    courseY: 0,
    dateFontSize: 16,
    dateFontFamily: "Helvetica",
    dateColor: "#6b7280",
    dateY: 0,
    qrX: 700,
    qrY: 480,
    qrSize: 80,
    logoUrl: "",
    customBackgroundData: undefined,
    customLogoData: undefined,
    customFontData: undefined,
    customFontName: undefined,
    isDarkModeTemplate: false,
    isCleanMode: false,
    coverOldText: false,
    customTitle: "",
    customSubtitle: "",
    customBodyPhrase: "",
    leftSignatureTitle: "Authorized Signature",
    rightSignatureTitle: "Director of Certification",
    datePrefix: "Issued:",
    showSignatures: false,
    titleFontSize: 24,
    titleColor: "",
    titleY: 0,
    subtitleFontSize: 13,
    subtitleColor: "",
    bodyPhraseFontSize: 12,
    bodyPhraseColor: "",
  },
  setTemplateConfig: (cfg) => set({ templateConfig: cfg }),

  preflightSummary: null,
  setPreflightSummary: (s) => set({ preflightSummary: s }),

  issuedCredentials: [],
  addCredentials: (creds) =>
    set((state) => ({
      issuedCredentials: [...state.issuedCredentials, ...creds],
    })),
  setCredentials: (creds) => set({ issuedCredentials: creds }),

  isPaidTier: false,
  FREE_TIER_LIMIT: 50,
}));
