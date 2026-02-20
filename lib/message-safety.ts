const MAX_CHARS = 800;
const MAX_URLS = 2;

const BANNED_PATTERNS: RegExp[] = [
  /\bkill\s+yourself\b/i,
  /\bself\s*harm\b/i,
  /\bnazi\b/i,
];

function countUrls(text: string) {
  const matches = text.match(/https?:\/\//gi);
  return matches ? matches.length : 0;
}

export function checkMessageSafety(raw: string): { ok: true } | { ok: false; error: string } {
  const text = raw.trim();
  if (!text) return { ok: false, error: 'Message is empty' };
  if (text.length > MAX_CHARS) return { ok: false, error: `Message too long (max ${MAX_CHARS} chars)` };
  if (countUrls(text) > MAX_URLS) return { ok: false, error: `Too many links (max ${MAX_URLS})` };

  for (const pattern of BANNED_PATTERNS) {
    if (pattern.test(text)) {
      return { ok: false, error: 'Message blocked by safety filter' };
    }
  }

  return { ok: true };
}
