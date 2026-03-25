import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import OnlineBadge from './OnlineBadge';
import FollowButton from './FollowButton';

export default function PeopleYouMayKnow({ posts = [] }) {
  const { user } = useAuth();

  const suggestions = useMemo(() => {
    const seen = new Set();
    const currentUserId = user?.userId || user?._id;

    return posts
      .map((post) => post?.author)
      .filter((author) => {
        if (!author?._id) return false;
        if (author._id === currentUserId) return false;
        if (seen.has(author._id)) return false;
        seen.add(author._id);
        return true;
      })
      .slice(0, 6);
  }, [posts, user]);

  return (
    <div className="side-card" style={{ marginBottom: '1rem' }}>
      <h3 className="side-title">People You May Know</h3>
      {suggestions.length === 0 ? (
        <p className="muted small" style={{ margin: 0 }}>Suggestions will appear as your feed grows.</p>
      ) : (
        <div>
          {suggestions.map((person) => (
            <div key={person._id} className="suggest-row">
              <div className="avatar avatar-sm">
                {person.username?.slice(0, 2)?.toUpperCase() || 'U'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>{person.username}</div>
                <OnlineBadge userId={person._id} lastSeen={person.lastSeen} />
              </div>
              <FollowButton targetUserId={person._id} className="follow-chip" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}