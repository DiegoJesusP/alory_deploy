import axios from "axios";
import { tokenStorage } from "@/modules/auth/infrastructure/storage/LocalStorageTokenStorage";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3001/api/v1/",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.get() ?? localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;