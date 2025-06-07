import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { checkAuthStatus } from '../store/slices/authSlice';

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check authentication status when app starts
    dispatch(checkAuthStatus());
  }, [dispatch]);

  return children;
};

export default AuthProvider; 