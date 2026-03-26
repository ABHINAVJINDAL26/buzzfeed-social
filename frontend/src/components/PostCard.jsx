import { useState } from 'react';
import CommentSection from './CommentSection';
import { useAuth } from '../context/AuthContext';
import FollowButton from './FollowButton';


function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
}

function renderTextWithHashtags(text) {
  if (!text) return null;
  const words = text.split(/(\s+)/);
  return words.map((word, index) => {
    if (word.startsWith('#') && word.length > 1) {
      // randomly assign blue or orange style purely for aesthetic reasons
      const colorClass = index % 3 === 0 ? 'hashtag blue' : 'hashtag';
      return <span key={index} className={colorClass}>{word}</span>;
    }
    return word;
  });
}

export default function PostCard({ post, onLikePost, onCommentPost, onVotePoll, style }) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [voting, setVoting] = useState(false);

  const likedByUser = post.likes.includes(user?.username);
  const currentUserId = user?.userId || user?._id;
  const initialFollowing = Array.isArray(post.author?.followers)
    ? post.author.followers.some((id) => String(id) === String(currentUserId))
    : false;
  const normalizedPollOptions = Array.isArray(post.pollOptions)
    ? post.pollOptions
        .map((option) => {
          if (typeof option === 'string') {
            return { text: option, voters: [] };
          }
          return {
            text: option?.text || '',
            voters: Array.isArray(option?.voters) ? option.voters : []
          };
        })
        .filter((option) => option.text.trim().length > 0)
    : [];
  const totalPollVotes = normalizedPollOptions.reduce((sum, option) => sum + option.voters.length, 0);
  const selectedPollIndex = normalizedPollOptions.findIndex((option) => option.voters.includes(user?.username));

  const handleComment = async (text) => {
    setCommentLoading(true);
    const ok = await onCommentPost(post._id, text);
    setCommentLoading(false);
    return ok;
  };

  const handleVote = async (optionIndex) => {
    if (typeof onVotePoll !== 'function' || !post?._id || voting) return;
    setVoting(true);
    await onVotePoll(post._id, optionIndex);
    setVoting(false);
  };

  return (
    <article className="post-card" style={style || {}}>
      <div className="post-header">
        <div className="avatar avatar-sm">
          {post.author?.username?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="post-meta" style={{ flex: 1 }}>
          <div className="post-name">
            {post.author?.username}
            <span className="post-handle"> @{post.author?.username.toLowerCase()}</span>
          </div>
          <div className="post-time">{formatDate(post.createdAt)}</div>
        </div>
        {String(currentUserId) !== String(post.author?.userId) && (
          <FollowButton targetUserId={post.author?.userId} initialFollowing={initialFollowing} className="follow-chip" />
        )}
      </div>

      {post.text ? <p className="post-text">{renderTextWithHashtags(post.text)}</p> : null}

      {post.imageUrl ? (
        <div style={{ marginTop: '1rem' }}>
          <img className="post-image" src={post.imageUrl} alt="Post attachment" />
        </div>
      ) : null}

      {normalizedPollOptions.length > 0 ? (
        <div className="poll-block">
          <div className="poll-meta">{totalPollVotes} vote{totalPollVotes === 1 ? '' : 's'}</div>
          <div className="poll-options-list">
            {normalizedPollOptions.map((option, idx) => {
              const optionVotes = option.voters.length;
              const percent = totalPollVotes > 0 ? Math.round((optionVotes / totalPollVotes) * 100) : 0;
              const selected = idx === selectedPollIndex;

              return (
                <button
                  key={`${post._id}-poll-${idx}`}
                  type="button"
                  className={`poll-option-btn ${selected ? 'selected' : ''}`}
                  onClick={() => handleVote(idx)}
                  disabled={voting}
                >
                  <span className="poll-fill" style={{ width: `${percent}%` }} />
                  <span className="poll-option-content">
                    <span className="poll-option-text">{option.text}</span>
                    <span className="poll-option-stats">{optionVotes} • {percent}%</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="post-actions">
        <button 
          className={`action-btn ${likedByUser ? 'active-like' : ''}`} 
          onClick={() => onLikePost(post._id)}
        >
           <span className="heart-icon">{likedByUser ? '❤️' : '🤍'}</span> {post.likes.length > 0 ? post.likes.length : 'Like'}
        </button>

        <button className="action-btn" onClick={() => setShowComments((prev) => !prev)}>

           💬 {post.comments.length > 0 ? post.comments.length : 'Comment'}
        </button>

        <button className="action-btn">
          📤 Share
        </button>
      </div>

      {showComments ? (
        <CommentSection comments={post.comments} posting={commentLoading} onSubmitComment={handleComment} />
      ) : null}
    </article>
  );
}
