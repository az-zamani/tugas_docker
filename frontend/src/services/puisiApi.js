import axios from "axios";

const puisiApi = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/puisi`, // This will become /api/puisi
});

// Add request interceptor to include JWT token
puisiApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default puisiApi;