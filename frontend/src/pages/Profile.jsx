import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';

export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [listTab, setListTab] = useState('followers');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/users/profile/${username}`);
        
        setUserProfile({
          username: data.username,
          handle: `@${data.username.toLowerCase()}`,
          bio: 'Building the next generation of social networking with premium UI algorithms.',
          followersCount: data.followersCount || data.followers?.length || 0,
          followingCount: data.followingCount || data.following?.length || 0,
          followers: Array.isArray(data.followers) ? data.followers : [],
          following: Array.isArray(data.following) ? data.following : []
        });
      } catch (err) {
        console.error("Profile load failed", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [username]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar darkMode={true} onSearchChange={() => {}} searchTerm="" />
      
      <main style={{ flex: 1, padding: '40px 20px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '100px', color: 'var(--text)' }}>
            <h2>Loading Profile...</h2>
          </div>
        ) : (
          <div style={{
            background: 'var(--surface)', padding: '40px', borderRadius: '24px',
            border: '1px solid var(--border)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '12px'
          }}>
            <div style={{
              width: 120, height: 120, borderRadius: '50%', background: 'linear-gradient(135deg, #00E1FF, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem',
              fontWeight: 'bold', color: '#fff', boxShadow: '0 10px 25px rgba(0, 225, 255, 0.4)',
              marginBottom: '20px'
            }}>
              {userProfile.username.charAt(0).toUpperCase()}
            </div>
            
            <h1 style={{ fontSize: '2.5rem', margin: '0 0 5px' }}>{userProfile.username}</h1>
            <h3 style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.6)', margin: '0 0 20px', fontWeight: 400 }}>{userProfile.handle}</h3>
            
            <p style={{ fontSize: '1.1rem', maxWidth: '500px', margin: '0 0 30px', lineHeight: 1.6 }}>
              {userProfile.bio}
            </p>
            
            <div style={{ display: 'flex', gap: '30px', marginBottom: '30px' }}>
              <div>
                <strong style={{ fontSize: '1.5rem', display: 'block' }}>{userProfile.followersCount}</strong>
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>Followers</span>
              </div>
              <div>
                <strong style={{ fontSize: '1.5rem', display: 'block' }}>{userProfile.followingCount}</strong>
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>Following</span>
              </div>
            </div>

            <div style={{ width: '100%', maxWidth: '560px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '10px' }}>
                <button
                  className="button button-soft"
                  style={{
                    borderRadius: '999px',
                    padding: '8px 16px',
                    borderColor: listTab === 'followers' ? '#00E1FF' : undefined,
                    color: listTab === 'followers' ? '#00E1FF' : undefined
                  }}
                  onClick={() => setListTab('followers')}
                >
                  Followers ({userProfile.followersCount})
                </button>
                <button
                  className="button button-soft"
                  style={{
                    borderRadius: '999px',
                    padding: '8px 16px',
                    borderColor: listTab === 'following' ? '#00E1FF' : undefined,
                    color: listTab === 'following' ? '#00E1FF' : undefined
                  }}
                  onClick={() => setListTab('following')}
                >
                  Following ({userProfile.followingCount})
                </button>
              </div>

              <div
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: '14px',
                  padding: '10px',
                  maxHeight: '220px',
                  overflowY: 'auto',
                  textAlign: 'left'
                }}
              >
                {(listTab === 'followers' ? userProfile.followers : userProfile.following).length === 0 ? (
                  <div style={{ color: 'var(--muted)', fontSize: '14px', textAlign: 'center', padding: '10px 0' }}>
                    No users found.
                  </div>
                ) : (
                  (listTab === 'followers' ? userProfile.followers : userProfile.following).map((entry) => (
                    <button
                      key={entry.userId}
                      className="button button-soft"
                      style={{
                        width: '100%',
                        justifyContent: 'space-between',
                        borderRadius: '10px',
                        marginBottom: '8px',
                        padding: '8px 12px'
                      }}
                      onClick={() => navigate(`/profile/${entry.username}`)}
                    >
                      <span>@{entry.username}</span>
                      <span style={{ color: '#00E1FF' }}>View</span>
                    </button>
                  ))
                )}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <button className="button button-primary" style={{ padding: '12px 30px', borderRadius: '30px' }}>Edit Profile</button>
              <button className="button button-soft" style={{ padding: '12px 30px', borderRadius: '30px' }} onClick={() => navigate(-1)}>Go Back</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
