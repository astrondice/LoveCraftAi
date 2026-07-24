// ─────────────────────────────────────────────────────────────────
// Pending Publish Helper — Persists publish input across OAuth redirects
// ─────────────────────────────────────────────────────────────────
import type { PublishInput } from "@/types";

const PENDING_PUBLISH_KEY = "lovecraft_pending_publish";

export function savePendingPublish(input: PublishInput): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PENDING_PUBLISH_KEY, JSON.stringify(input));
    console.log("[PendingPublish] Saved pending publish state");
  } catch (err) {
    console.warn("[PendingPublish] Failed to save to localStorage:", err);
  }
}

export function getPendingPublish(): PublishInput | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PENDING_PUBLISH_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PublishInput;
  } catch (err) {
    console.warn("[PendingPublish] Failed to parse pending publish payload:", err);
    return null;
  }
}

export function clearPendingPublish(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(PENDING_PUBLISH_KEY);
    console.log("[PendingPublish] Cleared pending publish state");
  } catch (err) {
    console.warn("[PendingPublish] Failed to clear pending publish state:", err);
  }
}
