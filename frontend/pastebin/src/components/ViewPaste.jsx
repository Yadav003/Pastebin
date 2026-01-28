import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPaste } from '../services/api';
import './ViewPaste.css';

function ViewPaste() {
  const { id } = useParams();
  const [paste, setPaste] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaste = async () => {
      try {
        const data = await getPaste(id);
        setPaste(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPaste();
  }, [id]);

  if (loading) {
    return (
      <div className="view-paste">
        <div className="loading">Loading paste...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="view-paste">
        <div className="error-container">
          <h1>Paste Unavailable</h1>
          <p>{error}</p>
          <Link to="/" className="back-link">← Create a new paste</Link>
        </div>
      </div>
    );
  }

  const formatExpiry = (expiresAt) => {
    if (!expiresAt) return null;
    const date = new Date(expiresAt);
    return date.toLocaleString();
  };

  return (
    <div className="view-paste">
      <div className="paste-header">
        <h1>Pastebin Lite</h1>
        <Link to="/" className="new-paste-link">+ New Paste</Link>
      </div>

      <div className="paste-meta">
        {paste.expires_at && (
          <span className="meta-item">
            Expires: {formatExpiry(paste.expires_at)}
          </span>
        )}
        {paste.remaining_views !== null && (
          <span className="meta-item">
            Remaining views: {paste.remaining_views}
          </span>
        )}
        {!paste.expires_at && paste.remaining_views === null && (
          <span className="meta-item">No expiration</span>
        )}
      </div>

      <div className="paste-content">
        <pre>{paste.content}</pre>
      </div>

      <div className="paste-actions">
        <button
          onClick={() => navigator.clipboard.writeText(paste.content)}
          className="action-btn"
        >
          Copy Content
        </button>
        <button
          onClick={() => navigator.clipboard.writeText(window.location.href)}
          className="action-btn"
        >
          Copy Link
        </button>
      </div>
    </div>
  );
}

export default ViewPaste;
