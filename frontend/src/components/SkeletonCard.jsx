export default function SkeletonCard() {
  return (
    <div className="post-card">
      <div className="skeleton-header">
        <div className="skeleton skeleton-avatar" />
        <div style={{ flex: 1 }}>
          <div className="skeleton skeleton-line" style={{ width: '40%', marginBottom: 6 }} />
          <div className="skeleton skeleton-line" style={{ width: '25%' }} />
        </div>
      </div>
      <div className="skeleton skeleton-line" style={{ width: '100%', marginBottom: 8 }} />
      <div className="skeleton skeleton-line" style={{ width: '80%', marginBottom: 8 }} />
      <div className="skeleton skeleton-line" style={{ width: '55%' }} />
    </div>
  );
}
