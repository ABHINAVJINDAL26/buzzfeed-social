import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../api/axios';

const FollowButton = ({ targetUserId, initialFollowing = false, className = '' }) => {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading]     = useState(false);
  const [hovering, setHovering]   = useState(false);

  const { user } = useAuth();
  const { emit } = useSocket();

  const handleFollow = async () => {
    setLoading(true);
    try {
      const { data } = await api.post(`/follow/${targetUserId}`);
      setFollowing(data.following);
      
      // Emit real-time notification socket if newly followed
      if (data.following && user?.username) {
        emit('user:followed', { targetUserId, byUser: user.username });
      }
    } catch (err) {
      // keep current state on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`${className || 'follow-btn'}${following ? ' following' : ''}`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {loading ? '...' : following ? (hovering ? 'Unfollow' : 'Following') : 'Follow'}
    </button>
  );
};

export default FollowButton;
