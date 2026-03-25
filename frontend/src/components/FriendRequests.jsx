import { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const FriendRequests = () => {
  const [requests, setRequests] = useState([]);
  const [dismissing, setDismissing] = useState({});
  const { emit } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data } = await axiosInstance.get('/friends/pending');
      setRequests(data);
    } catch {
      // silent fail
    }
  };

  const removeWithAnimation = (friendshipId, direction) => {
    setDismissing((prev) => ({ ...prev, [friendshipId]: direction }));
    setTimeout(() => {
      setRequests((prev) => prev.filter((r) => r._id !== friendshipId));
      setDismissing((prev) => {
        const next = { ...prev };
        delete next[friendshipId];
        return next;
      });
    }, 220);
  };

  const handleAccept = async (friendshipId, requester) => {
    try {
      await axiosInstance.put(`/friends/accept/${friendshipId}`);
      // Notify requester via socket
      emit('friend:accepted', {
        toUserId: requester._id,
        by: { username: user?.username || 'Someone' }
      });
      removeWithAnimation(friendshipId, 'right');
    } catch {
      // silent fail
    }
  };

  const handleDecline = async (friendshipId) => {
    try {
      await axiosInstance.put(`/friends/decline/${friendshipId}`);
      removeWithAnimation(friendshipId, 'left');
    } catch {
      // silent fail
    }
  };

  if (requests.length === 0) {
    return <p className="muted small" style={{ textAlign: 'center', padding: '8px 0' }}>No pending friend requests</p>;
  }

  return (
    <div className="requests-list">
      {requests.map(req => (
        <div
          key={req._id}
          className={`req-card ${dismissing[req._id] === 'right' ? 'slide-out-right' : ''} ${dismissing[req._id] === 'left' ? 'slide-out-left' : ''}`}
        >
          <div className="avatar avatar-sm">
            {req.requester.username.slice(0, 2).toUpperCase()}
          </div>
          <div className="req-info">
            <strong>{req.requester.username}</strong>
            <span className="muted small">wants to connect</span>
          </div>
          <div className="req-btns">
            <button
              className="btn-accept"
              onClick={() => handleAccept(req._id, req.requester)}
            >
              Accept
            </button>
            <button
              className="btn-decline"
              onClick={() => handleDecline(req._id)}
            >
              Decline
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FriendRequests;
