import { useSocket } from '../context/SocketContext';

const OnlineBadge = ({ userId, lastSeen }) => {
  const { isUserOnline } = useSocket();
  const online = isUserOnline(userId);

  const getLastSeen = () => {
    if (!lastSeen) return { label: 'Offline', state: 'offline' };
    const diff = Math.floor((Date.now() - new Date(lastSeen)) / 60000);
    if (diff < 1) return { label: 'Active now', state: 'active' };
    if (diff < 60) return { label: `Active ${diff}m ago`, state: 'recent' };
    return { label: `Active ${Math.floor(diff / 60)}h ago`, state: 'offline' };
  };

  const status = online ? { label: 'Active now', state: 'active' } : getLastSeen();

  return (
    <div className="online-status">
      <span className={`online-dot ${status.state}`} />
      <span className="status-text muted small">
        {status.label}
      </span>
    </div>
  );
};

export default OnlineBadge;
