import axios from "axios";

const api = axios.create({
  baseURL: "https://codevault-backend-z348.onrender.com/api",
});

// Auto-attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;