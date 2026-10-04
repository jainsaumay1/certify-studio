export type CredentialStatus = "valid" | "corrected" | "reissued" | "revoked";

export interface Credential {
  id: string;                    // UUID
  certificate_code: string;      // EKC-YYYY-XXXXXX
  recipient_name: string;
  recipient_email: string;
  course_name: string;
  issue_date: string;            // ISO date string
  sha256_hash: string;           // 64-char hex
  status: CredentialStatus;
  version: number;               // starts at 1
  revocation_reason?: string;
  revocation_timestamp?: string;
  superseded_by?: string;        // certificate_code of replacement
  created_at: string;            // ISO datetime
}

const STORAGE_KEY = "certify_studio_credentials";

function loadAll(): Credential[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Credential[]) : [];
  } catch {
    return [];
  }
}

function saveAll(records: Credential[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export const credentialStore = {
  getAll(): Credential[] {
    return loadAll();
  },

  getById(id: string): Credential | undefined {
    return loadAll().find((c) => c.id === id);
  },

  getByCode(code: string): Credential | undefined {
    return loadAll().find((c) => c.certificate_code === code);
  },

  insertMany(records: Credential[]): void {
    const existing = loadAll();
    const merged = [...existing, ...records];
    saveAll(merged);
  },

  update(code: string, patch: Partial<Credential>): Credential | undefined {
    const all = loadAll();
    const idx = all.findIndex((c) => c.certificate_code === code);
    if (idx === -1) return undefined;
    all[idx] = { ...all[idx], ...patch };
    saveAll(all);
    return all[idx];
  },

  revoke(code: string, reason: string): Credential | undefined {
    return credentialStore.update(code, {
      status: "revoked",
      revocation_reason: reason,
      revocation_timestamp: new Date().toISOString(),
    });
  },

  reissue(
    oldCode: string,
    newRecord: Credential
  ): { old: Credential | undefined; new: Credential } {
    credentialStore.update(oldCode, {
      status: "reissued",
      superseded_by: newRecord.certificate_code,
    });
    const all = loadAll();
    all.push(newRecord);
    saveAll(all);
    return {
      old: credentialStore.getByCode(oldCode),
      new: newRecord,
    };
  },

  clear(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  },
};
