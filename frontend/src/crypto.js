const IDENTITY_STORAGE_KEY = 'immutable-trail-player-identity';
const IDENTITY_VERSION = 2;

function encodeBase64(bytes) {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function decodeBase64(value) {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function encodeHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function decodeHex(value) {
  const normalized = String(value ?? '').trim();
  if (!normalized || normalized.length % 2 !== 0) {
    throw new Error('Hex string must have even length');
  }
  const out = new Uint8Array(normalized.length / 2);
  for (let index = 0; index < normalized.length; index += 2) {
    out[index / 2] = Number.parseInt(normalized.slice(index, index + 2), 16);
  }
  return out;
}

async function exportIdentity(keyPair) {
  const [publicKeyRaw, privateKeyPkcs8] = await Promise.all([
    crypto.subtle.exportKey('raw', keyPair.publicKey),
    crypto.subtle.exportKey('pkcs8', keyPair.privateKey)
  ]);
  return {
    version: IDENTITY_VERSION,
    algorithm: 'Ed25519',
    publicKey: encodeBase64(new Uint8Array(publicKeyRaw)),
    privateKeyPkcs8: encodeBase64(new Uint8Array(privateKeyPkcs8))
  };
}

async function importIdentityKeys(storedIdentity) {
  const publicKeyBytes = decodeBase64(storedIdentity.publicKey);
  const privateKeyBytes = decodeBase64(storedIdentity.privateKeyPkcs8);
  const [publicKey, privateKey] = await Promise.all([
    crypto.subtle.importKey('raw', publicKeyBytes, { name: 'Ed25519' }, true, ['verify']),
    crypto.subtle.importKey('pkcs8', privateKeyBytes, { name: 'Ed25519' }, true, ['sign'])
  ]);
  return { publicKey, privateKey, publicKeyBytes };
}

function clearStoredIdentity() {
  try {
    localStorage.removeItem(IDENTITY_STORAGE_KEY);
  } catch (error) {
    console.warn('Unable to clear player identity', error);
  }
}

function loadStoredIdentity() {
  try {
    const stored = localStorage.getItem(IDENTITY_STORAGE_KEY);
    if (!stored) {
      return null;
    }
    const parsed = JSON.parse(stored);
    if (
      parsed?.version !== IDENTITY_VERSION
      || parsed?.algorithm !== 'Ed25519'
      || typeof parsed?.publicKey !== 'string'
      || typeof parsed?.privateKeyPkcs8 !== 'string'
    ) {
      console.warn('Discarding legacy player identity and generating a new Ed25519 keypair.');
      clearStoredIdentity();
      return null;
    }
    return parsed;
  } catch (error) {
    console.warn('Unable to read stored player identity', error);
    clearStoredIdentity();
    return null;
  }
}

async function generateIdentity() {
  const keyPair = await crypto.subtle.generateKey({ name: 'Ed25519' }, true, ['sign', 'verify']);
  const exported = await exportIdentity(keyPair);
  try {
    localStorage.setItem(IDENTITY_STORAGE_KEY, JSON.stringify(exported));
  } catch (error) {
    console.warn('Unable to persist player identity', error);
  }
  const publicKeyBytes = decodeBase64(exported.publicKey);
  return { ...keyPair, ...exported, publicKeyBytes };
}

function toPlayerIdentity(privateKey, publicKeyBytes) {
  return {
    actorPubkey: encodeHex(publicKeyBytes),
    async signMessage(message) {
      const bytes = new TextEncoder().encode(String(message ?? ''));
      const signature = await crypto.subtle.sign({ name: 'Ed25519' }, privateKey, bytes);
      return encodeHex(new Uint8Array(signature));
    }
  };
}

export async function ensurePlayerIdentity() {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Web Crypto is unavailable in this browser');
  }

  const stored = loadStoredIdentity();
  if (stored) {
    try {
      const importedKeys = await importIdentityKeys(stored);
      return toPlayerIdentity(importedKeys.privateKey, importedKeys.publicKeyBytes);
    } catch (error) {
      console.warn('Stored player identity could not be imported; generating a new one.', error);
      clearStoredIdentity();
    }
  }

  const generated = await generateIdentity();
  return toPlayerIdentity(generated.privateKey, generated.publicKeyBytes);
}

export async function verifyPayloadSignature(message, signatureHex, publicKeyHex) {
  const publicKey = await crypto.subtle.importKey('raw', decodeHex(publicKeyHex), { name: 'Ed25519' }, true, ['verify']);
  const bytes = new TextEncoder().encode(String(message ?? ''));
  return crypto.subtle.verify({ name: 'Ed25519' }, publicKey, decodeHex(signatureHex), bytes);
}

export async function getOptionalPlayerIdentity() {
  try {
    return await ensurePlayerIdentity();
  } catch (error) {
    console.warn('Player identity unavailable, using unsigned demo requests', error);
    return null;
  }
}
