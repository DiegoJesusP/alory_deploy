import axios from 'axios';

const AxiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1',
  timeout: 10000,
  withCredentials: true, // sends HttpOnly refresh token cookie automatically
});

export default AxiosClient;
