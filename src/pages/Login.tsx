import React, { useEffect } from 'react';
import { Button } from 'antd';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { setCredentials } from '../store/authSlice';

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const user = params.get('user');

    if (token && user) {
      const userData = JSON.parse(decodeURIComponent(user));
      dispatch(setCredentials({ user: userData, token }));
      localStorage.setItem('token', token);
      navigate('/dashboard');
    }
  }, [location, dispatch, navigate]);

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/login';
  };

  return (
    <div style={{ maxWidth: '300px', margin: '100px auto' }}>
      <Button onClick={handleGoogleLogin} type="primary" style={{ width: '100%' }}>
        Login with Google
      </Button>
    </div>
  );
};

export default Login;