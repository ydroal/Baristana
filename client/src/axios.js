import axios from 'axios';

const axiosInstance = axios.create();

// Set axios defaults
// axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('jwt')}`;
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt');
  config.headers.Authorization = token ? `Bearer ${token}` : '';
  return config;
});

export default axiosInstance;
