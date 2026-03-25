import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import CreatePost from '../components/CreatePost';
import PostFeed from '../components/PostFeed';
import FriendRequests from '../components/FriendRequests';
import StoryBar from '../components/StoryBar';
import PeopleYouMayKnow from '../components/PeopleYouMayKnow';
import { usePoints } from '../context/PointsContext';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';


const FILTERS = [
  { key: 'all', label: 'All Post' },
  { key: 'foryou', label: 'For You' },
  { key: 'liked', label: 'Most Liked' },
  { key: 'commented', label: 'Most Commented' },
  { key: 'shared', label: 'Most Shared' }
];

export default function Home() {
  const [darkMode, setDarkMode] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [querySearch, setQuerySearch] = useState('');

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const { addPoints } = usePoints();
  const { emit } = useSocket();
  const { user } = useAuth();
  const currentUserId = user?.userId || user?._id;



  useEffect(() => {
    const timeout = setTimeout(() => {
      setQuerySearch(searchTerm.trim());
      setPage(1);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [activeFilter]);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await api.get('/posts', {
          params: {
            page,
            limit: 10,
            filter: activeFilter,
            search: querySearch
          }
        });

        const incoming = response.data?.items || [];
        setTotalPages(response.data?.totalPages || 1);

        setPosts((prev) => (page === 1 ? incoming : [...prev, ...incoming]));
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Failed to load posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [page, activeFilter, querySearch]);

  const canLoadMore = useMemo(() => page < totalPages, [page, totalPages]);

  const createPost = async (payload) => {
    setCreating(true);
    setError('');

    try {
      const response = await api.post('/posts', payload);
      const newPost = response.data;
      await addPoints('create_post');

      if (page === 1) {
        setPosts((prev) => [newPost, ...prev]);
      } else {
        setPage(1);
      }

      return true;
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to create post');
      return false;
    } finally {
      setCreating(false);
    }
  };

  const likePost = async (postId) => {
    const existing = posts.find((item) => item._id === postId);
    if (!existing) return;

    const username = user?.username || JSON.parse(localStorage.getItem('taskplanet_user') || '{}')?.username;
    if (!username) return;

    const liked = existing.likes.includes(username);

    // Optimistic UI update
    setPosts((prev) =>
      prev.map((post) => {
        if (post._id !== postId) return post;
        const nextLikes = liked
          ? post.likes.filter((entry) => entry !== username)
          : [...post.likes, username];
        return { ...post, likes: nextLikes };
      })
    );

    try {
      const response = await api.put(`/posts/${postId}/like`);
      const updated = response.data;
      if (!liked) {
        await addPoints('like_post');
        // Notify post author via socket
        if (existing.author?._id && existing.author._id !== currentUserId) {
          emit('post:liked', {
            postAuthorId: existing.author._id,
            likedBy: username,
            postId
          });
        }
      }
      setPosts((prev) => prev.map((post) => (post._id === postId ? updated : post)));
    } catch (requestError) {
      setPosts((prev) => prev.map((post) => (post._id === postId ? existing : post)));
      setError(requestError.response?.data?.message || 'Failed to toggle like');
    }
  };

  const commentPost = async (postId, text) => {
    const existing = posts.find((item) => item._id === postId);
    try {
      const response = await api.post(`/posts/${postId}/comment`, { text });
      const updated = response.data;
      await addPoints('comment');
      // Notify post author via socket
      if (existing?.author?._id && existing.author._id !== currentUserId) {
        emit('post:commented', {
          postAuthorId: existing.author._id,
          commentBy: user?.username || 'Someone',
          postId
        });
      }
      setPosts((prev) => prev.map((post) => (post._id === postId ? updated : post)));
      return true;
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to add comment');
      return false;
    }
  };

  return (
    <div className="app-shell">
      <Navbar
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <main className="content-grid">
        <section className="main-column">
          <StoryBar />
          <CreatePost onCreatePost={createPost} creating={creating} />


          <div className="scroll-chips">
            {FILTERS.map((filter) => (
              <button
                key={filter.key}
                type="button"
                className={`tab ${activeFilter === filter.key ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter.key)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {error ? <p className="error-text">{error}</p> : null}

          <PostFeed
            posts={posts}
            loading={loading}
            onLikePost={likePost}
            onCommentPost={commentPost}
            onLoadMore={() => setPage((prev) => prev + 1)}
            canLoadMore={canLoadMore}
          />
        </section>

        <aside className="side-column">
          <div className="side-card" style={{ marginBottom: '1rem' }}>
            <h3 className="side-title">Friend Requests</h3>
            <FriendRequests />
          </div>

          <PeopleYouMayKnow posts={posts} />

          <div className="side-card">
            <h3 className="side-title">Feed Tips</h3>
            <p className="muted small">Use search to find users or keywords quickly.</p>
            <p className="muted small" style={{ marginBottom: 0 }}>
              Switch tabs to discover trending and most discussed posts.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
