// ─────────────────────────────────────────────────────────────────
// PublishModal — Full publish orchestration modal
// Opens from generate.tsx Step 4 when user clicks "Publish Live ✨"
// ─────────────────────────────────────────────────────────────────
import { AnimatePresence, motion } from "framer-motion";
import { useState, useCallback, useEffect } from "react";
import { X, Sparkles, AlertCircle } from "lucide-react";
import { LoginModal } from "@/features/auth/LoginModal";
import { PublishSuccess } from "./PublishSuccess";
import { publishService } from "@/services/publish.service";
import { useAuth } from "@/hooks/use-auth";
import type { PublishInput, PublishProgress, PublishResult } from "@/types";

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  input: PublishInput;
}

type Stage = "idle" | "auth" | "publishing" | "success" | "error";

const PHASE_LABELS: Record<string, string> = {
  "uploading-assets": "Uploading your memories…",
  "building-html": "Crafting your love story…",
  "uploading-html": "Publishing to the cloud…",
  "saving-record": "Saving your site…",
  done: "Your love story is live! 💖",
};

import {
  savePendingPublish,
  getPendingPublish,
  clearPendingPublish,
} from "@/lib/pending-publish";

export function PublishModal({ isOpen, onClose, input }: PublishModalProps) {
  const { user, isAuthenticated } = useAuth();
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState<PublishProgress>({
    phase: "idle",
    percent: 0,
    message: "Starting…",
  });
  const [result, setResult] = useState<PublishResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startPublish = useCallback(
    async (userId: string) => {
      setStage("publishing");
      setError(null);

      // Resolve active publish input (fallback to pending storage if modal input is blank)
      const pendingInput = getPendingPublish();
      const activeInput: PublishInput =
        input && input.photos && input.photos.length > 0
          ? input
          : pendingInput ?? input;

      try {
        const res = await publishService.publish(
          { ...activeInput, projectId: undefined },
          userId,
          (p) => setProgress(p),
        );
        clearPendingPublish();
        setResult(res);
        setStage("success");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Publishing failed");
        setStage("error");
      }
    },
    [input],
  );

  // Trigger publish when modal opens
  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setStage("idle");
      setProgress({ phase: "idle", percent: 0, message: "Starting…" });
      setResult(null);
      setError(null);
      return;
    }
    // Modal just opened
    if (!isAuthenticated || !user) {
      // Save pending publish input before triggering auth modal / OAuth
      if (input && input.photos && input.photos.length > 0) {
        savePendingPublish(input);
      }
      setStage("auth");
    } else {
      void startPublish(user.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isAuthenticated, user]);

  const handleAuthSuccess = () => {
    if (user) void startPublish(user.id);
  };

  const handleCreateAnother = () => {
    onClose();
  };

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const oauthRedirectUrl = `${origin}/auth/callback?next=${encodeURIComponent("/generate?autoPublish=true")}`;

  return (
    <>
      {/* Auth gate */}
      <LoginModal
        isOpen={stage === "auth"}
        onClose={onClose}
        onSuccess={handleAuthSuccess}
        title="Sign in to publish your love story"
        redirectTo={oauthRedirectUrl}
      />

      {/* Main modal */}
      <AnimatePresence>
        {isOpen && stage !== "auth" && (
          <>
            <motion.div
              key="pub-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-charcoal/85 backdrop-blur-md"
              onClick={stage === "success" || stage === "error" ? onClose : undefined}
            />
            <motion.div
              key="pub-modal"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 z-[210] flex items-center justify-center p-4"
            >
              <div className="glass-panel rounded-3xl p-8 md:p-10 w-full max-w-lg relative">
                {/* Close (only when done or error) */}
                {(stage === "success" || stage === "error") && (
                  <button
                    onClick={onClose}
                    className="absolute top-5 right-5 w-8 h-8 rounded-full grid place-items-center text-ivory/40 hover:text-ivory hover:bg-ivory/10 transition-colors"
                    aria-label="Close"
                  >
                    <X size={16} />
                  </button>
                )}

                {/* Publishing progress */}
                {stage === "publishing" && (
                  <motion.div
                    key="progress"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                  >
                    {/* Animated rings */}
                    <div className="relative w-24 h-24 mx-auto mb-8">
                      <span className="absolute inset-0 rounded-full border-2 border-gold/30 animate-ping" />
                      <span
                        className="absolute inset-2 rounded-full border-2 border-gold/50 animate-ping"
                        style={{ animationDelay: "0.3s" }}
                      />
                      <span className="absolute inset-4 rounded-full bg-gold/10 backdrop-blur grid place-items-center">
                        <Sparkles className="text-gold" size={22} />
                      </span>
                    </div>

                    <h2 className="font-display text-2xl text-ivory mb-2">
                      Publishing your love story…
                    </h2>
                    <p className="text-ivory/60 text-sm mb-8">
                      {PHASE_LABELS[progress.phase] ?? progress.message}
                    </p>

                    {/* Progress bar */}
                    <div className="h-1.5 rounded-full bg-ivory/10 overflow-hidden mb-3">
                      <motion.div
                        className="h-full bg-gradient-to-r from-gold to-primary rounded-full"
                        animate={{ width: `${progress.percent}%` }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                    <p className="label-caps text-ivory/30 text-[10px]">
                      {progress.percent}% complete
                    </p>
                  </motion.div>
                )}

                {/* Success */}
                {stage === "success" && result && (
                  <PublishSuccess
                    result={result}
                    onClose={onClose}
                    onCreateAnother={handleCreateAnother}
                  />
                )}

                {/* Error */}
                {stage === "error" && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                  >
                    <AlertCircle className="text-destructive mx-auto mb-4" size={44} />
                    <h2 className="font-display text-2xl text-ivory mb-2">Something went wrong</h2>
                    <p className="text-ivory/60 text-sm mb-6">{error}</p>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => user && void startPublish(user.id)}
                        className="px-6 py-3 rounded-full bg-ivory text-charcoal label-caps text-[11px]"
                      >
                        Try Again
                      </button>
                      <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-full border border-ivory/30 text-ivory label-caps text-[11px]"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
