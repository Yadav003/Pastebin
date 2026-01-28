
const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? `${window.location.origin}/api` : 'http://localhost:3000/api');

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
