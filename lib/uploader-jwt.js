import crypto from 'crypto';

function encodeBase64Url(value) {
  const raw = typeof value === 'string' ? value : JSON.stringify(value);
  return Buffer.from(raw).toString('base64url');
}

export function signUploaderToken(payload, secret, expiresInSeconds = 3600) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const body = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };
  const encodedHeader = encodeBase64Url(header);
  const encodedPayload = encodeBase64Url(body);
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto.createHmac('sha256', secret).update(data).digest('base64url');
  return `${data}.${signature}`;
}
