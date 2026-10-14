import { supabase } from "./supabase";

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

// --- Local Storage Fallback Methods ---
function loadAllLocal(): Credential[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Credential[]) : [];
  } catch {
    return [];
  }
}

function saveAllLocal(records: Credential[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

// --- Async Store API ---
export const credentialStore = {
  async getAll(): Promise<Credential[]> {
    if (supabase) {
      const { data, error } = await supabase.from("credentials").select("*");
      if (!error && data) return data as Credential[];
    }
    return loadAllLocal();
  },

  async getById(id: string): Promise<Credential | undefined> {
    if (supabase) {
      const { data } = await supabase.from("credentials").select("*").eq("id", id).single();
      if (data) return data as Credential;
    }
    return loadAllLocal().find((c) => c.id === id);
  },

  async getByCode(code: string): Promise<Credential | undefined> {
    if (supabase) {
      const { data } = await supabase.from("credentials").select("*").eq("certificate_code", code).single();
      if (data) return data as Credential;
    }
    return loadAllLocal().find((c) => c.certificate_code === code);
  },

  async insertMany(records: Credential[]): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from("credentials").insert(records);
      if (error) console.error("Supabase insert error", error);
      // Even if supabase is active, we might want to also save locally for redundancy, 
      // but let's stick to either/or for simplicity unless it fails.
      if (!error) return;
    }
    const existing = loadAllLocal();
    saveAllLocal([...existing, ...records]);
  },

  async update(code: string, patch: Partial<Credential>): Promise<Credential | undefined> {
    if (supabase) {
      const { data, error } = await supabase
        .from("credentials")
        .update(patch)
        .eq("certificate_code", code)
        .select()
        .single();
      if (!error && data) return data as Credential;
    }
    const all = loadAllLocal();
    const idx = all.findIndex((c) => c.certificate_code === code);
    if (idx === -1) return undefined;
    all[idx] = { ...all[idx], ...patch };
    saveAllLocal(all);
    return all[idx];
  },

  async revoke(code: string, reason: string): Promise<Credential | undefined> {
    return this.update(code, {
      status: "revoked",
      revocation_reason: reason,
      revocation_timestamp: new Date().toISOString(),
    });
  },

  async reissue(
    oldCode: string,
    newRecord: Credential
  ): Promise<{ old: Credential | undefined; new: Credential }> {
    await this.update(oldCode, {
      status: "reissued",
      superseded_by: newRecord.certificate_code,
    });
    
    if (supabase) {
       await supabase.from("credentials").insert(newRecord);
    } else {
       const all = loadAllLocal();
       all.push(newRecord);
       saveAllLocal(all);
    }
    
    return {
      old: await this.getByCode(oldCode),
      new: newRecord,
    };
  },

  async clear(): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    // Cannot easily truncate a table in supabase via client without RPC, skip for safety
  },
};
