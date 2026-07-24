// ─────────────────────────────────────────────────────────────────
// Audit Logging Service — Records security & user activity events
// ─────────────────────────────────────────────────────────────────
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type AuditAction =
  | "login"
  | "logout"
  | "publish"
  | "delete"
  | "rename"
  | "duplicate"
  | "upload"
  | "download"
  | "security_event";

export interface AuditLogInput {
  userId: string;
  action: AuditAction;
  resource?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
}

export const auditService = {
  /** Log an activity to public.activity_logs */
  async log(input: AuditLogInput): Promise<void> {
    if (!isSupabaseConfigured) return;

    try {
      await supabase.from("activity_logs").insert({
        user_id: input.userId,
        action: input.action,
        resource: input.resource ?? "website",
        resource_id: input.resourceId ?? null,
        metadata: input.metadata ?? {},
      });
    } catch (err) {
      // Audit log failures should not crash user workflows
      console.warn("[AuditLog] Failed to record event:", err);
    }
  },
};
