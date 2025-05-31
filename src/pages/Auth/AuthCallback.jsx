import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { handleGoogleCallback } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      handleGoogleCallback(token);
    } else {
      navigate('/login');
    }
  }, [location, handleGoogleCallback, navigate]);

  return (
    <div className="auth-callback">
      <div className="loader"></div>
    </div>
  );
};

export default AuthCallback; 