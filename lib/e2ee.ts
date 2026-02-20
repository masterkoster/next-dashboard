/* E2EE helpers shared by client + API routes.

   Server-side API routes import:
   - validateE2eeEnvelopeString
   - validateEcdhP256PublicJwk

   Client-side UI uses:
   - ensureIdentityKeypair (private key stored locally)
   - publishMyPublicKey (publish public key to backend)
   - encryptForUser / decryptWithUser (envelope strings)
*/

export type E2EEPublicJwk = JsonWebKey & {
  kty: 'EC';
  crv: 'P-256';
  x: string;
  y: string;
};

export type E2EEPrivateJwk = E2EEPublicJwk & {
  d: string;
};

export type E2EEEnvelopeV1 = {
  v: 1;
  alg: 'ECDH-P256/AES-GCM';
  iv: string; // base64url
  ct: string; // base64url
};

const STORAGE = {
  identityPrivateJwk: 'aviationhub.e2ee.identity.privateJwk',
  identityPublicJwk: 'aviationhub.e2ee.identity.publicJwk',
  peerKeyPrefix: 'aviationhub.e2ee.peerPub.',
  publishedAt: 'aviationhub.e2ee.identity.publishedAt',
} as const;

function safeJsonParse<T>(input: string): T | null {
  try {
    return JSON.parse(input) as T;
  } catch {
    return null;
  }
}

function isBase64Url(input: unknown) {
  return typeof input === 'string' && input.length > 0 && /^[A-Za-z0-9_-]+$/.test(input);
}

function normalizePublicJwk(jwk: unknown): E2EEPublicJwk | null {
  if (!jwk || typeof jwk !== 'object') return null;
  const c = jwk as any;
  if (c.kty !== 'EC' || c.crv !== 'P-256') return null;
  if (typeof c.x !== 'string' || typeof c.y !== 'string') return null;
  return { kty: 'EC', crv: 'P-256', x: c.x, y: c.y };
}

function normalizePrivateJwk(jwk: unknown): E2EEPrivateJwk | null {
  const pub = normalizePublicJwk(jwk);
  if (!pub) return null;
  const d = (jwk as any).d;
  if (typeof d !== 'string') return null;
  return { ...pub, d };
}

export function validateEcdhP256PublicJwk(input: unknown) {
  const jwk = normalizePublicJwk(input);
  if (!jwk) {
    return { ok: false as const, error: 'Invalid publicKeyJwk (expected ECDH P-256 JWK)' };
  }
  return { ok: true as const, jwk };
}

export function validateE2eeEnvelopeString(input: unknown, opts?: { maxLen?: number }) {
  const maxLen = opts?.maxLen ?? 12_000;
  if (typeof input !== 'string') {
    return { ok: false as const, error: 'Body must be a string' };
  }
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false as const, error: 'Body is required' };
  }
  if (trimmed.length > maxLen) {
    return { ok: false as const, error: `Body too long (max ${maxLen})` };
  }

  const parsed = safeJsonParse<any>(trimmed);
  if (!parsed || typeof parsed !== 'object') {
    return { ok: false as const, error: 'Invalid E2EE envelope JSON' };
  }
  if (parsed.v !== 1) {
    return { ok: false as const, error: 'Unsupported E2EE envelope version' };
  }
  if (parsed.alg !== 'ECDH-P256/AES-GCM') {
    return { ok: false as const, error: 'Unsupported E2EE envelope alg' };
  }
  if (!isBase64Url(parsed.iv) || !isBase64Url(parsed.ct)) {
    return { ok: false as const, error: 'Invalid E2EE envelope encoding' };
  }

  const envelope: E2EEEnvelopeV1 = {
    v: 1,
    alg: 'ECDH-P256/AES-GCM',
    iv: parsed.iv,
    ct: parsed.ct,
  };

  // Canonical, compact serialization (what the server stores).
  const envelopeString = JSON.stringify(envelope);
  return { ok: true as const, envelope, envelopeString };
}

function hasWebCrypto() {
  return typeof window !== 'undefined' && !!globalThis.crypto?.subtle && !!globalThis.crypto?.getRandomValues;
}

// Browser-only base64url helpers (used by encrypt/decrypt).
function encodeBase64Url(bytes: Uint8Array) {
  let str = '';
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  const b64 = btoa(str);
  return b64.replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function decodeBase64Url(input: string) {
  const b64 = input.replaceAll('-', '+').replaceAll('_', '/');
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
  const bin = atob(b64 + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function ensureIdentityKeypair() {
  if (!hasWebCrypto()) {
    return { ok: false as const, reason: 'WebCrypto unavailable' };
  }

  const storedPriv = safeJsonParse<JsonWebKey>(localStorage.getItem(STORAGE.identityPrivateJwk) || '');
  const storedPub = safeJsonParse<JsonWebKey>(localStorage.getItem(STORAGE.identityPublicJwk) || '');
  const privJwk = storedPriv ? normalizePrivateJwk(storedPriv) : null;
  const pubJwk = storedPub ? normalizePublicJwk(storedPub) : null;
  if (privJwk && pubJwk) {
    return { ok: true as const, publicJwk: pubJwk, privateJwk: privJwk };
  }

  const keyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveKey', 'deriveBits'],
  );
  const exportedPub = (await crypto.subtle.exportKey('jwk', keyPair.publicKey)) as JsonWebKey;
  const exportedPriv = (await crypto.subtle.exportKey('jwk', keyPair.privateKey)) as JsonWebKey;

  const nextPub = normalizePublicJwk(exportedPub);
  const nextPriv = normalizePrivateJwk(exportedPriv);
  if (!nextPub || !nextPriv) {
    return { ok: false as const, reason: 'Failed to export keypair' };
  }

  localStorage.setItem(STORAGE.identityPublicJwk, JSON.stringify(nextPub));
  localStorage.setItem(STORAGE.identityPrivateJwk, JSON.stringify(nextPriv));
  return { ok: true as const, publicJwk: nextPub, privateJwk: nextPriv };
}

export async function publishMyPublicKey() {
  const identity = await ensureIdentityKeypair();
  if (!identity.ok) return identity;

  // Avoid hammering the endpoint (best-effort).
  const last = Number(localStorage.getItem(STORAGE.publishedAt) || '0');
  if (last && Date.now() - last < 6 * 60 * 60 * 1000) {
    return { ok: true as const };
  }

  const res = await fetch('/api/e2ee/public-key', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ publicKeyJwk: identity.publicJwk }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    return { ok: false as const, reason: data?.error || 'Failed to publish public key' };
  }

  localStorage.setItem(STORAGE.publishedAt, String(Date.now()));
  return { ok: true as const };
}

type StoredPeerKey = {
  jwk: E2EEPublicJwk;
  updatedAt: number;
};

export function getCachedPeerPublicKey(userId: string): StoredPeerKey | null {
  const raw = localStorage.getItem(`${STORAGE.peerKeyPrefix}${userId}`);
  if (!raw) return null;
  const parsed = safeJsonParse<StoredPeerKey>(raw);
  if (!parsed) return null;
  const jwk = normalizePublicJwk(parsed.jwk);
  if (!jwk) return null;
  return { jwk, updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : 0 };
}

export async function fetchPeerPublicKey(userId: string) {
  const res = await fetch(`/api/e2ee/public-key?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    return { ok: false as const, reason: data?.error || 'Failed to load peer public key' };
  }
  const data = await res.json().catch(() => null);
  const validated = validateEcdhP256PublicJwk(data?.publicKeyJwk);
  if (!validated.ok) {
    return { ok: false as const, reason: validated.error };
  }

  const updatedAt = data?.updatedAt ? new Date(data.updatedAt).getTime() : 0;
  const stored: StoredPeerKey = { jwk: validated.jwk, updatedAt: Number.isFinite(updatedAt) ? updatedAt : 0 };
  localStorage.setItem(`${STORAGE.peerKeyPrefix}${userId}`, JSON.stringify(stored));
  return { ok: true as const, ...stored };
}

async function importPrivateKey(jwk: E2EEPrivateJwk) {
  return crypto.subtle.importKey('jwk', jwk, { name: 'ECDH', namedCurve: 'P-256' }, false, [
    'deriveKey',
    'deriveBits',
  ]);
}

async function importPublicKey(jwk: E2EEPublicJwk) {
  return crypto.subtle.importKey('jwk', jwk, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
}

async function deriveAesKey(ownPrivate: CryptoKey, peerPublic: CryptoKey) {
  return crypto.subtle.deriveKey(
    { name: 'ECDH', public: peerPublic },
    ownPrivate,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function encryptForPeer(peerPublicJwk: E2EEPublicJwk, plaintext: string) {
  const identity = await ensureIdentityKeypair();
  if (!identity.ok) return null;

  const ownPriv = await importPrivateKey(identity.privateJwk);
  const peerPub = await importPublicKey(peerPublicJwk);
  const peerAes = await deriveAesKey(ownPriv, peerPub);

  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, peerAes, encoded);

  const envelope: E2EEEnvelopeV1 = {
    v: 1,
    alg: 'ECDH-P256/AES-GCM',
    iv: encodeBase64Url(iv),
    ct: encodeBase64Url(new Uint8Array(ciphertext)),
  };

  return JSON.stringify(envelope);
}

export async function decryptWithPeerPublicKey(peerPublicJwk: E2EEPublicJwk, envelopeString: string) {
  const identity = await ensureIdentityKeypair();
  if (!identity.ok) return null;

  const validated = validateE2eeEnvelopeString(envelopeString, { maxLen: 50_000 });
  if (!validated.ok) return null;

  try {
    const ownPriv = await importPrivateKey(identity.privateJwk);
    const peerPub = await importPublicKey(peerPublicJwk);
    const aes = await deriveAesKey(ownPriv, peerPub);

    const iv = decodeBase64Url(validated.envelope.iv);
    const ct = decodeBase64Url(validated.envelope.ct);
    const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, aes, ct);
    return new TextDecoder().decode(new Uint8Array(plaintext));
  } catch {
    return null;
  }
}

export async function encryptForUser(peerUserId: string, plaintext: string) {
  const peer = getCachedPeerPublicKey(peerUserId);
  const peerKey = peer ? { ok: true as const, ...peer } : await fetchPeerPublicKey(peerUserId);
  if (!peerKey.ok) {
    return { ok: false as const, reason: peerKey.reason };
  }

  const envelopeString = await encryptForPeer(peerKey.jwk, plaintext);
  if (!envelopeString) {
    return { ok: false as const, reason: 'Encryption failed' };
  }
  return { ok: true as const, envelopeString };
}

export async function decryptWithUser(peerUserId: string, envelopeString: string) {
  const peer = getCachedPeerPublicKey(peerUserId);
  const peerKey = peer ? { ok: true as const, ...peer } : await fetchPeerPublicKey(peerUserId);
  if (!peerKey.ok) {
    return { ok: false as const, reason: peerKey.reason };
  }
  const plaintext = await decryptWithPeerPublicKey(peerKey.jwk, envelopeString);
  if (plaintext == null) {
    return { ok: false as const, reason: 'Decryption failed' };
  }
  return { ok: true as const, plaintext };
}
