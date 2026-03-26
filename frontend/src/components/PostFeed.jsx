import PostCard from './PostCard';
import SkeletonCard from './SkeletonCard';

export default function PostFeed({ posts, loading, onLikePost, onCommentPost, onVotePoll, onLoadMore, canLoadMore }) {
  if (loading && posts.length === 0) {
    return (
      <div className="stack" style={{ gap: '1rem' }}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }


  return (
    <section className="post-feed">
      {posts.length === 0 ? <p className="muted">No posts found. Try changing filter or search.</p> : null}

      {posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          onLikePost={onLikePost}
          onCommentPost={onCommentPost}
          onVotePoll={onVotePoll}
        />
      ))}

      {canLoadMore ? (
        <button className="button button-soft load-more" onClick={onLoadMore} disabled={loading}>
          {loading ? 'Loading...' : 'Load more'}
        </button>
      ) : null}
    </section>
  );
}
