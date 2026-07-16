/**
 * Convert a string to a URL-safe slug.
 * e.g. "Sofía & Aryan" → "sof-a-aryan"
 */
export function slugify(input: string, maxLen = 20): string {
  return (input || 'love')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, maxLen)
}
