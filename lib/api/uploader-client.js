const FILE_SERVER = process.env.NEXT_PUBLIC_FILE_SERVER_URL || 'https://img-sever.everlybeautiesbd.com';

let cachedToken = null;
let tokenExpiresAt = 0;

async function getUploaderToken(force = false) {
  const now = Date.now();
  if (!force && cachedToken && tokenExpiresAt > now + 10000) {
    return cachedToken;
  }

  const res = await fetch('/api/uploader/token', { method: 'GET', cache: 'no-store' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Unable to get uploader token');
  }

  const data = await res.json();
  cachedToken = data.token;
  tokenExpiresAt = now + Number(data.expiresIn || 3600) * 1000;
  return cachedToken;
}

export async function uploaderFetch(path, options = {}, retry = true) {
  const token = await getUploaderToken();
  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${FILE_SERVER}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && retry) {
    const freshToken = await getUploaderToken(true);
    headers.set('Authorization', `Bearer ${freshToken}`);
    return fetch(`${FILE_SERVER}${path}`, {
      ...options,
      headers,
    });
  }

  return response;
}

export async function uploadFiles(files) {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  const res = await uploaderFetch('/api/upload', { method: 'POST', body: formData });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data.files || [];
}

export { FILE_SERVER };
