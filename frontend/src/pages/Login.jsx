import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async ({ identifier, password }) => {
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await api.post('/auth/login', { identifier, password });
      login(response.data);
      navigate('/', { replace: true });
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">

      <div className="auth-page-shell">
        <AuthForm mode="login" onSubmit={handleLogin} loading={loading} errorMessage={errorMessage} />
      </div>
    </div>
  );
}
