import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import axiosInstance from '../api/axios';
import { useAuth } from '../context/AuthContext';

// Avatars for stories — colourful initials
const COLORS = ['#3b82f6','#8b5cf6','#ec4899','#f59e0b','#22c55e','#06b6d4','#f43f5e'];
const avatarColor = (str = '') =>
  COLORS[str.charCodeAt(0) % COLORS.length];

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 60000);
  if (diff < 1)  return 'now';
  if (diff < 60) return `${diff}m ago`;
  return `${Math.floor(diff / 60)}h ago`;
}

export default function StoryBar() {
  const [stories, setStories]       = useState([]);
  const [active, setActive]         = useState(null); // story object being viewed
  const [addOpen, setAddOpen]       = useState(false);
  const [imgUrl, setImgUrl]         = useState('');
  const [caption, setCaption]       = useState('');
  const [posting, setPosting]       = useState(false);
  const { user }                    = useAuth();
  const timerRef                    = useRef(null);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const { data } = await axiosInstance.get('/stories');
      setStories(data);
    } catch { /* silent */ }
  };

  // Auto-advance: close viewer after 5 seconds
  useEffect(() => {
    if (active) {
      timerRef.current = setTimeout(() => setActive(null), 5000);
      // mark as viewed
      axiosInstance.put(`/stories/${active._id}/view`).catch(() => {});
    }
    return () => clearTimeout(timerRef.current);
  }, [active]);

  const handlePost = async () => {
    if (!imgUrl.trim()) return;
    setPosting(true);
    try {
      const { data } = await axiosInstance.post('/stories', {
        imageUrl: imgUrl.trim(),
        caption: caption.trim()
      });
      setStories(prev => [data, ...prev]);
      setImgUrl('');
      setCaption('');
      setAddOpen(false);
    } catch { /* silent */ } finally {
      setPosting(false);
    }
  };

  return (
    <div className="story-bar-wrap">
      {/* Add Story button */}
      <div
        className="story-add-btn"
        title="Add Story"
        onClick={() => setAddOpen(v => !v)}
      >
        <span className="story-add-plus">＋</span>
        <span className="story-add-label">Story</span>
      </div>

      {/* Story rings */}
      {stories.map(s => {
        const initial = (s.author?.username || 'U').charAt(0).toUpperCase();
        const viewed  = s.viewers?.includes(user?._id);
        return (
          <div
            key={s._id}
            className={`story-ring-wrap${viewed ? ' viewed' : ''}`}
            onClick={() => setActive(s)}
            title={s.author?.username}
          >
            <div
              className="story-ring"
              style={{ borderColor: viewed ? '#aaa' : avatarColor(s.author?.username) }}
            >
              <div
                className="story-avatar-inner"
                style={{ background: avatarColor(s.author?.username) }}
              >
                {initial}
              </div>
            </div>
            <span className="story-username">{s.author?.username}</span>
          </div>
        );
      })}

      {/* Empty state */}
      {stories.length === 0 && (
        <p className="muted small" style={{ alignSelf: 'center', margin: '0 8px' }}>
          No stories yet — be the first!
        </p>
      )}

      {/* Add Story Form */}
      {addOpen && createPortal(
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
          backdropFilter: 'blur(4px)'
        }} onClick={() => setAddOpen(false)}>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)', 
            padding: '20px', borderRadius: '16px', width: '320px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column'
          }} onClick={e => e.stopPropagation()}>
            <p style={{ margin: '0 0 12px', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text)' }}>📸 Add a Story</p>
          <input
            className="input"
            placeholder="Paste image URL…"
            value={imgUrl}
            onChange={e => setImgUrl(e.target.value)}
            style={{ marginBottom: 8, fontSize: 13 }}
          />
          <input
            className="input"
            placeholder="Caption (optional)"
            value={caption}
            onChange={e => setCaption(e.target.value)}
            style={{ marginBottom: 10, fontSize: 13 }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="button button-primary"
              style={{ flex: 1, padding: '7px 0', fontSize: 13 }}
              onClick={handlePost}
              disabled={posting || !imgUrl.trim()}
            >
              {posting ? '…' : 'Post Story'}
            </button>
            <button
              className="button button-soft"
              style={{ padding: '7px 14px', fontSize: 13 }}
              onClick={() => setAddOpen(false)}
            >
              Cancel
            </button>
          </div>
          </div>
        </div>,
        document.body
      )}

      {/* Story Viewer Modal */}
      {active && (
        <div className="story-viewer-overlay" onClick={() => setActive(null)}>
          <div className="story-viewer" onClick={e => e.stopPropagation()}>
            {/* Progress bar */}
            <div className="story-progress">
              <div className="story-progress-bar" />
            </div>
            {/* Header */}
            <div className="story-viewer-header">
              <div
                className="story-avatar-sm"
                style={{ background: avatarColor(active.author?.username) }}
              >
                {(active.author?.username || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <strong style={{ color: '#fff', fontSize: 14 }}>{active.author?.username}</strong>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                  {timeAgo(active.createdAt)}
                </div>
              </div>
              <button
                className="story-close-btn"
                onClick={() => setActive(null)}
              >✕</button>
            </div>
            {/* Image */}
            <img
              src={active.imageUrl}
              alt="story"
              className="story-img"
              onError={e => { e.target.src = 'https://placehold.co/400x600?text=Story'; }}
            />
            {/* Caption */}
            {active.caption && (
              <div className="story-caption">{active.caption}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
