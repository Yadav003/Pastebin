
const DEV_FALLBACK_API_URL = 'http://localhost:3000/api';

function normalizeApiUrl(rawUrl) {
  if (typeof rawUrl !== 'string') {
    return '';
  }

  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return '';
  }

  // Allow relative base like "/api"
  if (trimmed.startsWith('/')) {
    return trimmed.replace(/\/+$/u, '');
  }

  try {
    const url = new URL(trimmed);
    const hasPath = url.pathname && url.pathname !== '/';
    const normalizedPath = (hasPath ? url.pathname : '/api').replace(/\/+$/u, '');
    return `${url.origin}${normalizedPath}`;
  } catch {
    // Fallback for non-URL strings (e.g., missing scheme)
    return trimmed.replace(/\/+$/u, '');
  }
}

function resolveApiUrl() {
  const envUrl = normalizeApiUrl(import.meta.env.VITE_API_URL);
  if (envUrl) {
    return envUrl;
  }

  if (!import.meta.env.PROD) {
    return DEV_FALLBACK_API_URL;
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return normalizeApiUrl(`${window.location.origin}/api`);
  }

  throw new Error('VITE_API_URL is not set. Define it in the frontend environment variables.');
}

const API_URL = resolveApiUrl();

async function readJsonOrText(response) {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return { kind: 'json', data: await response.json() };
  }
  return { kind: 'text', data: await response.text() };
}

export async function createPaste({ content, ttl_seconds, max_views }) {
  const response = await fetch(`${API_URL}/pastes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content,
      ttl_seconds: ttl_seconds || null,
      max_views: max_views || null,
    }),
  });

  const parsed = await readJsonOrText(response);
  const data = parsed.kind === 'json' ? parsed.data : null;

  if (!response.ok) {
    if (parsed.kind !== 'json') {
      throw new Error(`Failed to create paste (HTTP ${response.status})`);
    }
    throw new Error(data.error || data.details?.content || 'Failed to create paste');
  }

  if (parsed.kind !== 'json') {
    throw new Error('Unexpected non-JSON response from server');
  }

  return data;
}


export async function getPaste(id) {
  const response = await fetch(`${API_URL}/pastes/${id}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  const parsed = await readJsonOrText(response);
  const data = parsed.kind === 'json' ? parsed.data : null;

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Paste not found, has expired, or has reached its view limit');
    }
    if (parsed.kind !== 'json') {
      throw new Error(`Failed to fetch paste (HTTP ${response.status})`);
    }
    throw new Error(data.error || 'Failed to fetch paste');
  }

  if (parsed.kind !== 'json') {
    throw new Error('Unexpected non-JSON response from server');
  }

  return data;
}


export async function checkHealth() {
  const response = await fetch(`${API_URL}/healthz`);

  const parsed = await readJsonOrText(response);
  if (!response.ok) {
    throw new Error(`Health check failed (HTTP ${response.status})`);
  }
  if (parsed.kind !== 'json') {
    throw new Error('Unexpected non-JSON response from server');
  }
  return parsed.data;
}
