import { webcrypto } from 'node:crypto';

import type {
  AuthenticationResponseJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON
} from '@simplewebauthn/server';

type RegistrationOptions = {
  challenge: string;
  rp: { id: string };
  user: { id: string };
};

type AssertionOptions = Pick<
  PublicKeyCredentialRequestOptionsJSON,
  'challenge' | 'rpId'
> & {
  allowCredentials?: Array<{ id: string }>;
  userVerification?: PublicKeyCredentialRequestOptionsJSON['userVerification'];
};

const subtle = webcrypto.subtle;

const base64url = (bytes: Uint8Array): string =>
  Buffer.from(bytes).toString('base64url');

const fromBase64url = (value: string): Uint8Array =>
  new Uint8Array(Buffer.from(value, 'base64url'));

const concat = (...parts: Uint8Array[]): Uint8Array => {
  const result = new Uint8Array(parts.reduce((length, part) => length + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }
  return result;
};

const uint32 = (value: number): Uint8Array => {
  const result = new Uint8Array(4);
  new DataView(result.buffer).setUint32(0, value);
  return result;
};

const uint16 = (value: number): Uint8Array => {
  const result = new Uint8Array(2);
  new DataView(result.buffer).setUint16(0, value);
  return result;
};

const sha256 = (value: Uint8Array): Promise<ArrayBuffer> =>
  subtle.digest('SHA-256', value);

/**
 * The test only needs the definite-length CBOR values used by an EC2 public
 * key and a "none" attestation object. Keeping this encoder local avoids
 * making a transitive server dependency part of the feature's test API.
 */
const cborLength = (major: number, length: number): Uint8Array => {
  if (length < 24) return new Uint8Array([(major << 5) | length]);
  if (length < 256) return new Uint8Array([(major << 5) | 24, length]);
  if (length < 65536) return concat(
    new Uint8Array([(major << 5) | 25]),
    uint16(length)
  );
  return concat(
    new Uint8Array([(major << 5) | 26]),
    uint32(length)
  );
};

const cborBytes = (value: Uint8Array): Uint8Array =>
  concat(cborLength(2, value.length), value);

const cborText = (value: string): Uint8Array => {
  const bytes = new TextEncoder().encode(value);
  return concat(cborLength(3, bytes.length), bytes);
};

const cborInt = (value: number): Uint8Array =>
  value >= 0
    ? cborLength(0, value)
    : cborLength(1, -1 - value);

const cborMap = (entries: Array<[number | string, Uint8Array]>): Uint8Array =>
  concat(
    cborLength(5, entries.length),
    ...entries.flatMap(([key, value]) => [
      typeof key === 'number' ? cborInt(key) : cborText(key),
      value
    ])
  );

const derInteger = (value: Uint8Array): Uint8Array => {
  let first = 0;
  while (first < value.length - 1 && value[first] === 0) first += 1;
  const trimmed = value.slice(first);
  const needsSignByte = (trimmed[0] & 0x80) !== 0;
  const body = needsSignByte ? concat(new Uint8Array([0]), trimmed) : trimmed;
  return concat(new Uint8Array([0x02, body.length]), body);
};

const p1363ToDer = (signature: ArrayBuffer): Uint8Array => {
  const raw = new Uint8Array(signature);
  const r = derInteger(raw.slice(0, 32));
  const s = derInteger(raw.slice(32, 64));
  const body = concat(r, s);
  return concat(new Uint8Array([0x30, body.length]), body);
};

export interface SoftwareAuthenticator {
  readonly credentialId: string;
  readonly publicKey: Uint8Array;
  readonly transports: ['internal'];
  registration(
    options: RegistrationOptions,
    origin: string
  ): Promise<RegistrationResponseJSON>;
  assertion(
    options: AssertionOptions,
    origin: string,
    counter?: number
  ): Promise<AuthenticationResponseJSON>;
}

export async function createSoftwareAuthenticator(): Promise<SoftwareAuthenticator> {
  const keyPair = (await subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify']
  )) as CryptoKeyPair;
  const publicJwk = (await subtle.exportKey('jwk', keyPair.publicKey)) as JsonWebKey;
  if (!publicJwk.x || !publicJwk.y) throw new Error('software authenticator key has no coordinates');

  const credentialIdBytes = webcrypto.getRandomValues(new Uint8Array(32));
  const credentialId = base64url(credentialIdBytes);
  const publicKey = cborMap([
    [1, cborInt(2)],
    [3, cborInt(-7)],
    [-1, cborInt(1)],
    [-2, cborBytes(fromBase64url(publicJwk.x))],
    [-3, cborBytes(fromBase64url(publicJwk.y))]
  ]);
  const transports: ['internal'] = ['internal'];

  const clientData = async (type: string, challenge: string, origin: string) =>
    new TextEncoder().encode(JSON.stringify({ type, challenge, origin }));

  const signed = async (
    clientDataJSON: Uint8Array,
    authenticatorData: Uint8Array
  ): Promise<string> => {
    const clientDataHash = new Uint8Array(await sha256(clientDataJSON));
    const signature = await subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' },
      keyPair.privateKey,
      concat(authenticatorData, clientDataHash)
    );
    return base64url(p1363ToDer(signature));
  };

  return {
    credentialId,
    publicKey,
    transports,
    async registration(options, origin) {
      const clientDataJSON = await clientData(
        'webauthn.create',
        options.challenge,
        origin
      );
      const rpIdHash = new Uint8Array(
        await sha256(new TextEncoder().encode(options.rp.id))
      );
      const authenticatorData = concat(
        rpIdHash,
        new Uint8Array([0x41]),
        uint32(0),
        new Uint8Array(16),
        uint16(credentialIdBytes.length),
        credentialIdBytes,
        publicKey
      );
      const attestationObject = cborMap([
        ['fmt', cborText('none')],
        ['attStmt', cborMap([])],
        ['authData', cborBytes(authenticatorData)]
      ]);
      return {
        id: credentialId,
        rawId: credentialId,
        response: {
          clientDataJSON: base64url(clientDataJSON),
          attestationObject: base64url(attestationObject),
          transports
        },
        type: 'public-key',
        clientExtensionResults: {}
      };
    },
    async assertion(options, origin, counter = 0) {
      const clientDataJSON = await clientData(
        'webauthn.get',
        options.challenge,
        origin
      );
      const rpId = options.rpId;
      const rpIdHash = new Uint8Array(
        await sha256(new TextEncoder().encode(rpId))
      );
      const flags = options.userVerification === 'required' ? 0x05 : 0x01;
      const authenticatorData = concat(rpIdHash, new Uint8Array([flags]), uint32(counter));
      return {
        id: credentialId,
        rawId: credentialId,
        response: {
          clientDataJSON: base64url(clientDataJSON),
          authenticatorData: base64url(authenticatorData),
          signature: await signed(clientDataJSON, authenticatorData)
        },
        type: 'public-key',
        clientExtensionResults: {}
      };
    }
  };
}
