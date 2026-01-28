
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.details?.content || 'Failed to create paste');
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

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Paste not found, has expired, or has reached its view limit');
    }
    throw new Error(data.error || 'Failed to fetch paste');
  }

  return data;
}


export async function checkHealth() {
  const response = await fetch(`${API_URL}/healthz`);
  return response.json();
}
