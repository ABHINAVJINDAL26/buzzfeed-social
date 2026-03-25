import { useState } from 'react';
import axiosInstance from '../api/axios';

const FollowButton = ({ targetUserId, initialFollowing = false, className = '' }) => {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading]     = useState(false);
  const [hovering, setHovering]   = useState(false);

  const handleFollow = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.post(`/follow/${targetUserId}`);
      setFollowing(data.following);
    } catch {
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
