// ─────────────────────────────────────────────────────────────────
// Input Sanitizer & Security Utilities (XSS, SQLi, Prototype Pollution)
// ─────────────────────────────────────────────────────────────────

export const sanitizer = {
  /** Sanitize user string against XSS & script injection */
  sanitizeText(input: string): string {
    if (!input) return "";
    return input
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;")
      .replace(/javascript:/gi, "")
      .replace(/on\w+=/gi, "");
  },

  /** Deep sanitize an object's string values and prevent prototype pollution */
  sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
    if (typeof obj !== "object" || obj === null) return obj;
    const clean = (Array.isArray(obj) ? [] : {}) as Record<string, unknown>;

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Prevent Prototype Pollution
        if (key === "__proto__" || key === "constructor" || key === "prototype") {
          continue;
        }
        const value = obj[key];
        if (typeof value === "string") {
          clean[key] = this.sanitizeText(value);
        } else if (typeof value === "object" && value !== null) {
          clean[key] = this.sanitizeObject(value as Record<string, unknown>);
        } else {
          clean[key] = value;
        }
      }
    }

    return clean as T;
  },
};
