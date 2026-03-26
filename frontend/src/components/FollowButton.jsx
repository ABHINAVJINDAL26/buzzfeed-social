import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../api/axios';

const FollowButton = ({ targetUserId, initialFollowing = false, className = '' }) => {
  const [status, setStatus] = useState(initialFollowing ? 'following' : 'none');
  const [loading, setLoading]     = useState(false);
  const [hovering, setHovering]   = useState(false);

  const { user } = useAuth();
  const { emit } = useSocket();

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const { data } = await api.get(`/follow/${targetUserId}/status`);
        if (data?.status) setStatus(data.status);
      } catch {
        // ignore status fetch errors
      }
    };

    if (targetUserId) {
      loadStatus();
    }
  }, [targetUserId]);

  const handleFollow = async () => {
    if (status === 'incoming' || status === 'self') return;
    setLoading(true);
    try {
      const { data } = await api.post(`/follow/${targetUserId}`);
      if (data?.status) {
        setStatus(data.status);
      }

      if (data?.status === 'requested' && user?.username) {
        emit('friend:request', {
          toUserId: targetUserId,
          from: { username: user.username }
        });
      }
    } catch (err) {
      // keep current state on error
    } finally {
      setLoading(false);
    }
  };

  const getButtonLabel = () => {
    if (loading) return '...';
    if (status === 'following') return hovering ? 'Following' : 'Following';
    if (status === 'requested') return 'Requested';
    if (status === 'incoming') return 'Accept in requests';
    return 'Follow';
  };

  const computedClass = `${className || 'follow-btn'}${status === 'following' ? ' following' : ''}${status === 'requested' ? ' requested' : ''}${status === 'incoming' ? ' incoming' : ''}`;

  return (
    <button
      onClick={handleFollow}
      disabled={loading || status === 'incoming'}
      className={computedClass}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {getButtonLabel()}
    </button>
  );
};

export default FollowButton;
