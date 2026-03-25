import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';

export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // In a real app, you would fetch user data via API.
  // For this aesthetic-driven demo, we provide a breathtaking default state.
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // if "me" is requested, we try to grab the active user context (handled by checking username fallback if needed)
        // Note: For 'me' to work cleanly with a URL like /profile/user1, the API requires a true username. 
        // We'll let the user component assume 'me' is a valid username for now or the user manually passes real names.
        const { data } = await api.get(`/users/profile/${username}`);
        
        setUserProfile({
          username: data.username,
          handle: `@${data.username.toLowerCase()}`,
          bio: 'Building the next generation of social networking with premium UI algorithms.',
          followers: data.followers,
          following: data.following
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
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
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
                <strong style={{ fontSize: '1.5rem', display: 'block' }}>{userProfile.followers}</strong>
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>Followers</span>
              </div>
              <div>
                <strong style={{ fontSize: '1.5rem', display: 'block' }}>{userProfile.following}</strong>
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>Following</span>
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
