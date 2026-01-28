import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { createPaste } from '../services/api';
import './CreatePaste.css';

function CreatePaste() {
  const location = useLocation();
  const [content, setContent] = useState('');
  const [ttlSeconds, setTtlSeconds] = useState('');
  const [maxViews, setMaxViews] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Reset form when user navigates to this page
  useEffect(() => {
    setContent('');
    setTtlSeconds('');
    setMaxViews('');
    setResult(null);
    setError(null);
    setLoading(false);
  }, [location.pathname]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    // Validate content
    if (!content.trim()) {
      setError('Content is required');
      return;
    }

    // Validate TTL
    if (ttlSeconds && (isNaN(parseInt(ttlSeconds)) || parseInt(ttlSeconds) < 1)) {
      setError('TTL must be a positive number (in seconds)');
      return;
    }

    // Validate max views
    if (maxViews && (isNaN(parseInt(maxViews)) || parseInt(maxViews) < 1)) {
      setError('Max views must be a positive number');
      return;
    }

    setLoading(true);

    try {
      const data = await createPaste({
        content: content.trim(),
        ttl_seconds: ttlSeconds ? parseInt(ttlSeconds) : null,
        max_views: maxViews ? parseInt(maxViews) : null,
      });

      setResult(data);
      setContent('');
      setTtlSeconds('');
      setMaxViews('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result?.url) {
      navigator.clipboard.writeText(result.url);
    }
  };

  return (
    <div className="create-paste">
      <h1>Pastebin Lite</h1>
      <p className="subtitle">Create and share text snippets easily</p>

      <form onSubmit={handleSubmit} className="paste-form">
        <div className="form-group">
          <label htmlFor="content">Content *</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your content here..."
            rows={12}
            disabled={loading}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="ttl">Expires after (seconds)</label>
            <input
              id="ttl"
              type="number"
              min="1"
              value={ttlSeconds}
              onChange={(e) => setTtlSeconds(e.target.value)}
              placeholder="Optional"
              disabled={loading}
            />
            <span className="hint">Leave empty for no expiration</span>
          </div>

          <div className="form-group">
            <label htmlFor="maxViews">Max views</label>
            <input
              id="maxViews"
              type="number"
              min="1"
              value={maxViews}
              onChange={(e) => setMaxViews(e.target.value)}
              placeholder="Optional"
              disabled={loading}
            />
            <span className="hint">Leave empty for unlimited views</span>
          </div>
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Creating...' : 'Create Paste'}
        </button>
      </form>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="success-message">
          <h3>Paste Created!</h3>
          <p>Your paste is available at:</p>
          <div className="url-container">
            <a href={result.url} target="_blank" rel="noopener noreferrer">
              {result.url}
            </a>
            <button onClick={copyToClipboard} className="copy-btn">
              Copy
            </button>
          </div>
          <p className="paste-id">ID: {result.id}</p>
        </div>
      )}
    </div>
  );
}

export default CreatePaste;
