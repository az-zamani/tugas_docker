import axios from "axios";

const reactionApi = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/reaction`, // This will become /api/reaction
});

// Add request interceptor to include JWT token
reactionApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default reactionApi;