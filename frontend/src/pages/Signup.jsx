import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignup = async ({ username, email, password }) => {
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await api.post('/auth/signup', { username, email, password });
      login(response.data);
      navigate('/', { replace: true });
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">

      <div className="auth-page-shell">
        <AuthForm mode="signup" onSubmit={handleSignup} loading={loading} errorMessage={errorMessage} />
      </div>
    </div>
  );
}
