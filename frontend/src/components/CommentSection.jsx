import { useState } from 'react';

function formatDate(dateString) {
  return new Date(dateString).toLocaleString();
}

export default function CommentSection({ comments, onSubmitComment, posting }) {
  const [text, setText] = useState('');

  const handleComment = async (event) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }

    const ok = await onSubmitComment(trimmed);
    if (ok) {
      setText('');
    }
  };

  return (
    <div className="comment-section">
      <form onSubmit={handleComment} className="comment-form">
        <input
          className="input"
          value={text}
          maxLength={500}
          onChange={(event) => setText(event.target.value)}
          placeholder="Write a comment"
        />
        <button type="submit" className="button button-soft" disabled={posting}>
          {posting ? 'Sending...' : 'Comment'}
        </button>
      </form>

      <div className="comment-list">
        {comments.length === 0 ? <p className="muted">No comments yet.</p> : null}
        {comments.map((comment, index) => (
          <article className="comment-item" key={`${comment.username}-${comment.createdAt}-${index}`}>
            <p>
              <strong>@{comment.username}</strong> {comment.text}
            </p>
            <span className="muted small">{formatDate(comment.createdAt)}</span>
          </article>
        ))}
      </div>
    </div>
  );
}
