// ─────────────────────────────────────────────────────────────────
// Pending Publish Helper — Persists publish input across OAuth redirects
// Features:
//   1. Dual storage: IndexedDB (handles large photos without 5MB quota limits)
//      + localStorage fallback (for instant synchronous lookup)
//   2. Pending Action Model with 30-minute expiration window
//   3. Diagnostic logging for publish trajectory
// ─────────────────────────────────────────────────────────────────
import type { PublishInput } from "@/types";

const PENDING_PUBLISH_KEY = "lovecraft_pending_publish";
const DB_NAME = "LoveCraftDB";
const STORE_NAME = "pending_publish";
const EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

export interface PendingPublishAction {
  type: "publish";
  input: PublishInput;
  createdAt: number;
  expiresAt: number;
  returnTo: string;
}

// ── IndexedDB Storage Engine ─────────────────────────────────────
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const req = window.indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function setIDB(key: string, val: unknown): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(val, key);
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve();
    });
  } catch (err) {
    console.warn("[PendingPublish] IndexedDB write failed:", err);
  }
}

async function getIDB<T>(key: string): Promise<T | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(key);
    return new Promise((resolve) => {
      req.onsuccess = () => resolve((req.result as T) ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function deleteIDB(key: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(key);
  } catch {
    // Ignore
  }
}

// ── Public API ───────────────────────────────────────────────────

/** Save pending publish state before triggering auth / OAuth */
export async function savePendingPublish(
  input: PublishInput,
  returnTo = "/generate?autoPublish=true",
): Promise<void> {
  if (typeof window === "undefined") return;

  const now = Date.now();
  const action: PendingPublishAction = {
    type: "publish",
    input,
    createdAt: now,
    expiresAt: now + EXPIRY_MS,
    returnTo,
  };

  console.log("[Publish] PENDING_PUBLISH_SAVED", {
    expiresAt: new Date(action.expiresAt).toISOString(),
    photosCount: input.photos?.length ?? 0,
  });

  // 1. Save complete state in IndexedDB (handles large dataUrls cleanly)
  await setIDB(PENDING_PUBLISH_KEY, action);

  // 2. Save lightweight backup to localStorage (strip massive dataUrls to prevent quota error)
  try {
    const lightweightInput: PublishInput = {
      ...input,
      photos:
        input.photos?.map((p) => ({
          name: p.name,
          dataUrl: p.dataUrl && p.dataUrl.length < 50000 ? p.dataUrl : "",
        })) ?? [],
    };
    const lightweightAction: PendingPublishAction = {
      ...action,
      input: lightweightInput,
    };
    localStorage.setItem(PENDING_PUBLISH_KEY, JSON.stringify(lightweightAction));
  } catch (err) {
    console.warn("[PendingPublish] LocalStorage lightweight backup failed:", err);
  }
}

/** Retrieve active pending publish action (async — checks IndexedDB then localStorage) */
export async function getPendingPublishAction(): Promise<PendingPublishAction | null> {
  if (typeof window === "undefined") return null;

  const now = Date.now();

  // 1. Try IndexedDB first (contains full photos)
  let action = await getIDB<PendingPublishAction>(PENDING_PUBLISH_KEY);

  // 2. Fallback to localStorage if IndexedDB had nothing
  if (!action) {
    try {
      const raw = localStorage.getItem(PENDING_PUBLISH_KEY);
      if (raw) {
        action = JSON.parse(raw) as PendingPublishAction;
      }
    } catch (err) {
      console.warn("[PendingPublish] Failed to parse localStorage action:", err);
    }
  }

  if (!action) return null;

  // Enforce 30-minute expiration
  if (now > action.expiresAt) {
    console.warn("[PendingPublish] Action expired — clearing stale state");
    void clearPendingPublish();
    return null;
  }

  return action;
}

/** Synchronous helper for legacy or initial load checks */
export function getPendingPublish(): PublishInput | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PENDING_PUBLISH_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const action = (data.type === "publish" ? data : { input: data, expiresAt: Date.now() + 60000 }) as PendingPublishAction;
    if (Date.now() > action.expiresAt) {
      clearPendingPublishSync();
      return null;
    }
    return action.input;
  } catch {
    return null;
  }
}

/** Clear pending publish state from both IndexedDB and localStorage */
export async function clearPendingPublish(): Promise<void> {
  if (typeof window === "undefined") return;
  clearPendingPublishSync();
  await deleteIDB(PENDING_PUBLISH_KEY);
  console.log("[PendingPublish] Cleared pending publish state");
}

function clearPendingPublishSync(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(PENDING_PUBLISH_KEY);
  } catch {
    // Ignore
  }
}
