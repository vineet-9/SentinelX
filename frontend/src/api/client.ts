import axios from "axios";

import { getToken, removeToken } from "@/services/authService";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ??
    "http://127.0.0.1:8000",
});

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;