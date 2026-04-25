/**
 * generateSlug — converts a pool title to a URL-safe slug.
 *
 * "New Camera Fund"   → "new-camera-fund"
 * "Buy me a drink 🥤"  → "buy-me-a-drink"
 * "Tuition & Books!"  → "tuition-books"
 */
export function generateSlug(title: string): string {
  return title
    .normalize('NFD')                          // decompose accented chars
    .replace(/[\u0300-\u036f]/g, '')           // strip diacritics
    .replace(/[^\w\s-]/g, '')                  // remove non-word chars (strips emoji, punctuation)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')                      // spaces → hyphens
    .replace(/-+/g, '-')                       // collapse multiple hyphens
    .replace(/^-|-$/g, '');                   // trim leading/trailing hyphens
}
