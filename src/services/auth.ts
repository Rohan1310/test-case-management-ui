import api from './api';

export const initiateGoogleLogin = () => {
  window.location.href = `${api.defaults.baseURL}/auth/login`;
};

export const logout = async () => {
  await api.get('/auth/logout');
  localStorage.removeItem('user');
};

export const getUser = async () => {
  const response = await api.get('/auth/user');
  return response.data;
};